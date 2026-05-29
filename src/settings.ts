import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { LatexAutocompleteSettings } from "./types";
import { callAiApi } from "./ai";

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

		containerEl.createEl("h2", { text: "LaTeX Autocomplete - AI 设置" });

		new Setting(containerEl)
			.setName("API URL")
			.setDesc("OpenAI 兼容格式的 API 地址（只需填到 /v1，会自动补全 /chat/completions）")
			.addText((text) =>
				text
					.setPlaceholder("https://api.openai.com/v1/chat/completions")
					.setValue(this.settings.aiApiUrl)
					.onChange(async (value) => {
						this.settings.aiApiUrl = value;
						await this.onSave();
					})
			);

		new Setting(containerEl)
			.setName("API Key")
			.setDesc("你的 API 密钥")
			.addText((text) => {
				text.setPlaceholder("sk-...")
					.setValue(this.settings.aiApiKey)
					.onChange(async (value) => {
						this.settings.aiApiKey = value;
						await this.onSave();
					});
				text.inputEl.type = "password";
			});

		new Setting(containerEl)
			.setName("Model")
			.setDesc("模型名称（如 gpt-4o-mini、deepseek-chat 等）")
			.addText((text) =>
				text
					.setPlaceholder("gpt-4o-mini")
					.setValue(this.settings.aiModel)
					.onChange(async (value) => {
						this.settings.aiModel = value;
						await this.onSave();
					})
			);

		new Setting(containerEl)
			.setName("System Prompt")
			.setDesc("发送给 AI 的系统提示词")
			.addTextArea((text) =>
				text
					.setPlaceholder("你是 LaTeX 数学公式转换器...")
					.setValue(this.settings.aiSystemPrompt)
					.onChange(async (value) => {
						this.settings.aiSystemPrompt = value;
						await this.onSave();
					})
			);

		new Setting(containerEl)
			.setName("测试连接")
			.setDesc("发送测试请求验证 API 配置是否正确")
			.addButton((btn) =>
				btn.setButtonText("测试").onClick(async () => {
					btn.setButtonText("测试中...");
					btn.setDisabled(true);
					try {
						const result = await callAiApi("1+1等于几", this.settings);
						new Notice("连接成功: " + result, 4000);
					} catch (err: any) {
						new Notice("连接失败: " + (err.message || err), 5000);
					}
					btn.setButtonText("测试");
					btn.setDisabled(false);
				})
			);
	}
}
