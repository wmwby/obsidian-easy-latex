import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import { isInMathContext } from "./mathContext";
import { matchSuggestions } from "./matcher";
import { LatexCommand, LatexSuggestion } from "./types";

export class LatexSuggest extends EditorSuggest<LatexSuggestion> {
	private commands: LatexCommand[];
	private chineseMap: Record<string, string[]>;
	private rawMap: Record<string, string[]>;
	private commandMap: Map<string, LatexCommand>;

	constructor(
		app: any,
		commands: LatexCommand[],
		chineseMap: Record<string, string[]>,
		rawMap: Record<string, string[]>
	) {
		super(app);
		this.commands = commands;
		this.chineseMap = chineseMap;
		this.rawMap = rawMap;
		this.commandMap = new Map();
		for (const cmd of commands) {
			this.commandMap.set(cmd.command, cmd);
		}
		this.limit = 25;
		console.log("[LaTeX Autocomplete] Loaded", commands.length, "commands,", Object.keys(chineseMap).length, "Chinese keywords,", Object.keys(rawMap).length, "raw symbols");
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_file: TFile | null
	): EditorSuggestTriggerInfo | null {
		const line = editor.getLine(cursor.line);
		const textBeforeCursor = line.substring(0, cursor.ch);

		if (!isInMathContext(editor, cursor)) return null;

		// --- Branch 1: backslash trigger ---
		const lastBackslash = textBeforeCursor.lastIndexOf("\\");
		if (lastBackslash !== -1) {
			// Must not be escaped (\\)
			if (!(lastBackslash > 0 && textBeforeCursor[lastBackslash - 1] === "\\")) {
				const queryText = textBeforeCursor.substring(lastBackslash + 1);

				// Accept only letters or CJK characters, at least 1 char
				if (queryText.length > 0 && /^[a-zA-Z一-鿿]+$/.test(queryText)) {
					return {
						start: { line: cursor.line, ch: lastBackslash },
						end: { line: cursor.line, ch: cursor.ch },
						query: queryText,
					};
				}
			}
		}

		// --- Branch 2: raw CJK trigger (no backslash) ---
		const cjkMatch = textBeforeCursor.match(/[一-鿿]+$/);
		if (!cjkMatch) return null;

		const queryText = cjkMatch[0];
		const cjkStart = textBeforeCursor.length - queryText.length;

		return {
			start: { line: cursor.line, ch: cjkStart },
			end: { line: cursor.line, ch: cursor.ch },
			query: queryText,
		};
	}

	getSuggestions(context: EditorSuggestContext): LatexSuggestion[] {
		const results = matchSuggestions(
			context.query,
			this.commands,
			this.chineseMap,
			this.commandMap,
			this.rawMap
		);
		return results;
	}

	renderSuggestion(suggestion: LatexSuggestion, el: HTMLElement): void {
		const container = el.createDiv({ cls: "latex-suggest-item" });

		container.createEl("code", {
			cls: "latex-suggest-command",
			text: "\\" + suggestion.displayText,
		});

		const desc = suggestion.descriptionZh
			? suggestion.descriptionZh +
				(suggestion.description
					? " (" + suggestion.description + ")"
					: "")
			: suggestion.description;

		if (desc) {
			container.createSpan({
				cls: "latex-suggest-desc",
				text: desc,
			});
		}
	}

	selectSuggestion(suggestion: LatexSuggestion, _evt: MouseEvent | KeyboardEvent): void {
		const context = this.context;
		if (!context) return;

		// Raw symbol: replace CJK text directly, no backslash prefix
		if (suggestion.isRaw) {
			context.editor.replaceRange(
				suggestion.snippet,
				context.start,
				context.end
			);
			return;
		}

		const replacement = "\\" + suggestion.snippet;

		// No tabstops: simple replacement
		if (!replacement.includes("$1")) {
			context.editor.replaceRange(
				replacement,
				context.start,
				context.end
			);
			return;
		}

		// Find first tabstop offset in cleaned string
		let firstTabstopOffset = Infinity;
		let cleanOffset = 0;
		let i = 0;
		while (i < replacement.length) {
			const remaining = replacement.substring(i);
			const m = remaining.match(/^\$(\d+)/);
			if (m) {
				if (
					parseInt(m[1]) === 1 &&
					cleanOffset < firstTabstopOffset
				) {
					firstTabstopOffset = cleanOffset;
				}
				i += m[0].length;
			} else {
				cleanOffset++;
				i++;
			}
		}

		const cleanReplacement = replacement.replace(/\$\d+/g, "");
		context.editor.replaceRange(
			cleanReplacement,
			context.start,
			context.end
		);

		context.editor.setCursor({
			line: context.start.line,
			ch: context.start.ch + firstTabstopOffset,
		});
	}
}
