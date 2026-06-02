import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { LatexAutocompleteSettings } from "./types";
import { callAiApi } from "./ai";
import { t } from './i18n';

export class LatexAutocompleteSettingTab extends PluginSettingTab {
	private settings: LatexAutocompleteSettings;
	private onSave: () => void;

	constructor(app: App, plugin: Plugin, settings: LatexAutocompleteSettings, onSave: () => void) {
		super(app, plugin);
		this.settings = settings;
		this.onSave = onSave;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: t('settings.title') });

		new Setting(containerEl)
			.setName(t('settings.apiUrl.name'))
			.setDesc(t('settings.apiUrl.desc'))
			.addText((text) =>
				text
					.setPlaceholder(t('settings.apiUrl.placeholder'))
					.setValue(this.settings.aiApiUrl)
					.onChange(async (value) => {
						this.settings.aiApiUrl = value;
						await this.onSave();
					})
			);

		new Setting(containerEl)
			.setName("API Key")
			.setDesc(t('settings.apiKey.desc'))
			.addText((text) => {
				text.setPlaceholder(t('settings.apiKey.placeholder'))
					.setValue(this.settings.aiApiKey)
					.onChange(async (value) => {
						this.settings.aiApiKey = value;
						await this.onSave();
					});
				text.inputEl.type = "password";
			});

		new Setting(containerEl)
			.setName("Model")
			.setDesc(t('settings.model.desc'))
			.addText((text) =>
				text
					.setPlaceholder(t('settings.model.placeholder'))
					.setValue(this.settings.aiModel)
					.onChange(async (value) => {
						this.settings.aiModel = value;
						await this.onSave();
					})
			);

		new Setting(containerEl)
			.setName("System Prompt")
			.setDesc(t('settings.systemPrompt.desc'))
			.addTextArea((text) =>
				text
					.setPlaceholder(t('settings.systemPrompt.placeholder'))
					.setValue(this.settings.aiSystemPrompt)
					.onChange(async (value) => {
						this.settings.aiSystemPrompt = value;
						await this.onSave();
					})
			);

		new Setting(containerEl)
			.setName(t('settings.thinking.name'))
			.setDesc(t('settings.thinking.desc'))
			.addToggle((toggle) =>
				toggle
					.setValue(this.settings.aiEnableThinking)
					.onChange(async (value) => {
						this.settings.aiEnableThinking = value;
						await this.onSave();
					})
			);

		new Setting(containerEl)
			.setName(t('settings.test.name'))
			.setDesc(t('settings.test.desc'))
			.addButton((btn) =>
				btn.setButtonText(t('settings.test.button')).onClick(async () => {
					btn.setButtonText(t('settings.test.running'));
					btn.setDisabled(true);
					try {
						const result = await callAiApi("1+1等于几", this.settings);
						new Notice(t('notice.success') + result, 4000);
					} catch (err: any) {
						new Notice(t('notice.fail') + String(err), 5000);
					}
					btn.setButtonText(t('settings.test.button'));
					btn.setDisabled(false);
				})
			);
	}
}
