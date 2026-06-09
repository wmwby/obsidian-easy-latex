import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import { isInMathContext } from "./mathContext";
import { matchSuggestions } from "./matcher";
import { LatexCommand, LatexSuggestion, LatexAutocompleteSettings } from "./types";
import { LangConfig, buildCombinedScriptClass } from "./langRegistry";

export class LatexSuggest extends EditorSuggest<LatexSuggestion> {
	private commands: LatexCommand[];
	private commandMap: Map<string, LatexCommand>;
	private langRegistry: LangConfig[];
	private getSettings: () => LatexAutocompleteSettings;
	private triggerRegex: RegExp;
	private rawTriggerRegex: RegExp;

	constructor(
		app: App,
		commands: LatexCommand[],
		langRegistry: LangConfig[],
		getSettings: () => LatexAutocompleteSettings
	) {
		super(app);
		this.commands = commands;
		this.langRegistry = langRegistry;
		this.getSettings = getSettings;
		this.commandMap = new Map();
		for (const cmd of commands) {
			this.commandMap.set(cmd.command, cmd);
		}
		this.limit = 25;

		// Build combined regex for all registered scripts
		const scriptClass = buildCombinedScriptClass();
		this.triggerRegex = new RegExp(`^[a-zA-Z${scriptClass}]+$`);
		this.rawTriggerRegex = new RegExp(`[${scriptClass}]+$`);
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

				// Accept Latin letters or any registered script characters
				if (queryText.length > 0 && this.triggerRegex.test(queryText)) {
					return {
						start: { line: cursor.line, ch: lastBackslash },
						end: { line: cursor.line, ch: cursor.ch },
						query: queryText,
					};
				}
			}
		}

		// --- Branch 2: raw script trigger (no backslash) ---
		const scriptMatch = textBeforeCursor.match(this.rawTriggerRegex);
		if (!scriptMatch) return null;

		const queryText = scriptMatch[0];
		const scriptStart = textBeforeCursor.length - queryText.length;

		return {
			start: { line: cursor.line, ch: scriptStart },
			end: { line: cursor.line, ch: cursor.ch },
			query: queryText,
		};
	}

	getSuggestions(context: EditorSuggestContext): LatexSuggestion[] {
		const settings = this.getSettings();
		const locale = (window as { moment?: { locale?: () => string } }).moment?.locale?.() ?? "en";
		const results = matchSuggestions(
			context.query,
			this.commands,
			this.commandMap,
			this.langRegistry,
			settings.customMappings ?? [],
			locale
		);
		return results;
	}

	renderSuggestion(suggestion: LatexSuggestion, el: HTMLElement): void {
		const container = el.createDiv({ cls: "latex-suggest-item" });

		if (suggestion.isCustom) {
			container.createEl("code", {
				cls: "latex-suggest-command",
				text: suggestion.displayText,
			});
			if (suggestion.localDescription) {
				container.createSpan({
					cls: "latex-suggest-desc",
					text: suggestion.localDescription,
				});
			}
			return;
		}

		container.createEl("code", {
			cls: "latex-suggest-command",
			text: "\\" + suggestion.displayText,
		});

		const desc = suggestion.localDescription
			? suggestion.localDescription +
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

		// Raw symbol: replace text directly, no backslash prefix
		if (suggestion.isRaw) {
			context.editor.replaceRange(
				suggestion.snippet,
				context.start,
				context.end
			);
			return;
		}

		// Custom mapping: replace with snippet as-is (user controls backslash)
		if (suggestion.isCustom) {
			const replacement = suggestion.snippet;

			if (!replacement.includes("$1")) {
				context.editor.replaceRange(
					replacement,
					context.start,
					context.end
				);
				return;
			}

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
