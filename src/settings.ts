import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { LatexAutocompleteSettings } from "./types";
import { callAiApi } from "./ai";
import { t } from './i18n';

export class LatexAutocompleteSettingTab extends PluginSettingTab {
	private settings: LatexAutocompleteSettings;
	private onSave: () => void | Promise<void>;

	constructor(app: App, plugin: Plugin, settings: LatexAutocompleteSettings, onSave: () => void | Promise<void>) {
		super(app, plugin);
		this.settings = settings;
		this.onSave = onSave;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName(t('settings.title')).setHeading();

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
			.setName(t('settings.apiKey.name'))
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
			.setName(t('settings.model.name'))
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
			.setName(t('settings.systemPrompt.name'))
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
					btn.buttonEl.disabled = true;
					try {
						const result = await callAiApi("1+1等于几", this.settings);
						new Notice(t('notice.success') + result, 4000);
					} catch (err: unknown) {
						new Notice(t('notice.fail') + String(err), 5000);
					}
					btn.setButtonText(t('settings.test.button'));
					btn.buttonEl.disabled = false;
				})
			);

		// --- Custom Keyword Mappings ---
		new Setting(containerEl).setName(t('settings.customMappings.title')).setHeading();
		containerEl.createEl("p", {
			text: t('settings.customMappings.desc'),
			cls: "setting-item-description",
		});

		// Add new mapping
		let newKeyword = "";
		let newSnippet = "";

		new Setting(containerEl)
			.setName(t('settings.customMappings.keyword'))
			.addText((text) =>
				text
					.setPlaceholder(t('settings.customMappings.keywordPlaceholder'))
					.onChange((value) => { newKeyword = value; })
			)
			.addText((text) =>
				text
					.setPlaceholder(t('settings.customMappings.snippetPlaceholder'))
					.onChange((value) => { newSnippet = value; })
			)
			.addButton((btn) =>
				btn
					.setButtonText(t('settings.customMappings.add'))
					.onClick(async () => {
						const keyword = newKeyword.trim();
						const snippet = newSnippet.trim();
						if (!keyword || !snippet) {
							new Notice(t('settings.customMappings.emptyFields'));
							return;
						}
						this.settings.customMappings.push({ keyword, snippet });
						await this.onSave();
						this.display();
					})
			);

		// List existing mappings
		for (let i = 0; i < this.settings.customMappings.length; i++) {
			const mapping = this.settings.customMappings[i];
			new Setting(containerEl)
				.setName(mapping.keyword)
				.setDesc(mapping.snippet)
				.addButton((btn) =>
					btn.setButtonText("×")
						.onClick(async () => {
							this.settings.customMappings.splice(i, 1);
							await this.onSave();
							this.display();
						})
				);
		}
	}
}
