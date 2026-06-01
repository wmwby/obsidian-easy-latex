import { Notice, Plugin } from "obsidian";
import { LatexSuggest } from "./src/suggest";
import { DEFAULT_SETTINGS, LatexAutocompleteSettings, LatexCommand } from "./src/types";
import { callAiApi, extractPromptText } from "./src/ai";
import { isInMathContext } from "./src/mathContext";
import { LatexAutocompleteSettingTab } from "./src/settings";
import chineseKeywords from "./data/chinese-keywords.json";
import latexCommands from "./data/latex-commands.json";
import rawSymbols from "./data/raw-symbols.json";

export default class LatexAutocompletePlugin extends Plugin {
	settings: LatexAutocompleteSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		const commands: LatexCommand[] = latexCommands as LatexCommand[];
		const chineseMap: Record<string, string[]> = chineseKeywords;
		const rawMap: Record<string, string[]> = rawSymbols;

		this.registerEditorSuggest(
			new LatexSuggest(this.app, commands, chineseMap, rawMap)
		);

		// Use DOM capture-phase listener because CM6 keymap doesn't
		// fire for inline math in Live Preview mode
		const tabHandler = (evt: KeyboardEvent) => {
			if (evt.key === "Tab" && !evt.ctrlKey && !evt.altKey && !evt.metaKey) {
				if (this.handleTab()) {
					evt.preventDefault();
					evt.stopPropagation();
				}
			}
		};
		document.addEventListener("keydown", tabHandler, true);
		this.register(() => document.removeEventListener("keydown", tabHandler, true));

		this.addSettingTab(
			new LatexAutocompleteSettingTab(this.app, this, this.settings, () =>
				this.saveSettings()
			)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private handleTab(): boolean {
		if (!this.settings.aiApiKey) return false;

		const editor = this.app.workspace.activeEditor?.editor;
		if (!editor) return false;

		const cursor = editor.getCursor("head");

		if (!isInMathContext(editor, cursor)) return false;

		const result = extractPromptText(editor, cursor);
		if (!result) return false;

		const notice = new Notice("正在生成 LaTeX...", 0);

		callAiApi(result.text, this.settings)
			.then((latex) => {
				editor.replaceRange(latex, result.start, result.end);
				editor.setCursor({
					line: result.start.line,
					ch: result.start.ch + latex.length,
				});
				notice.hide();
				new Notice("已生成", 2000);
			})
			.catch((err) => {
				notice.hide();
				new Notice("AI 生成失败: " + String(err), 5000);
			});

		return true;
	}
}
