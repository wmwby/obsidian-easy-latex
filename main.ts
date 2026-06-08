import { Notice, Plugin } from "obsidian";
import { LatexSuggest } from "./src/suggest";
import { DEFAULT_SETTINGS, LatexAutocompleteSettings } from "./src/types";
import { callAiApi, extractPromptText } from "./src/ai";
import { isInMathContext } from "./src/mathContext";
import { LatexAutocompleteSettingTab } from "./src/settings";
import { LANG_REGISTRY } from "./src/langRegistry";
import latexCommands from "./data/latex-commands.json";
import { t } from "./src/i18n";

const LEGACY_DEFAULT_PROMPT = `你是 LaTeX 数学公式转换器。将用户的数学描述转换为 LaTeX 代码。
	规则：
	1. 只返回纯 LaTeX 代码，不要解释
	2. 不要用 markdown 代码块包裹
	3. 不要包含 $ 或 $$ 分隔符
	4. 保持数学语义的准确性`;

export default class LatexAutocompletePlugin extends Plugin {
	settings: LatexAutocompleteSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		const commands = latexCommands as any[];

		this.registerEditorSuggest(
			new LatexSuggest(this.app, commands, LANG_REGISTRY, () => this.settings)
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
		if (!this.settings.aiSystemPrompt || this.settings.aiSystemPrompt === LEGACY_DEFAULT_PROMPT) {
			this.settings.aiSystemPrompt = t('defaultPrompt');
		}
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

		const notice = new Notice(t('notice.generating'), 0);

		callAiApi(result.text, this.settings)
			.then((latex) => {
				editor.replaceRange(latex, result.start, result.end);
				editor.setCursor({
					line: result.start.line,
					ch: result.start.ch + latex.length,
				});
				notice.hide();
				new Notice(t('notice.generated'), 2000);
			})
			.catch((err) => {
				notice.hide();
				new Notice(t('notice.aiFail') + String(err), 5000);
			});

		return true;
	}
}
