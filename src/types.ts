export interface LatexCommand {
	command: string;
	description: string;
	descriptionZh: string;
	snippet: string;
	category: string;
}

export interface LatexSuggestion {
	command: string;
	displayText: string;
	description: string;
	descriptionZh: string;
	snippet: string;
	source: "prefix" | "chinese" | "both" | "raw";
	isRaw?: boolean;
}

export interface LatexAutocompleteSettings {
	aiApiUrl: string;
	aiApiKey: string;
	aiModel: string;
	aiSystemPrompt: string;
	aiEnableThinking: boolean;
}

export const DEFAULT_SETTINGS: LatexAutocompleteSettings = {
	aiApiUrl: "https://api.openai.com/v1/chat/completions",
	aiApiKey: "",
	aiModel: "gpt-4o-mini",
	aiSystemPrompt: `你是 LaTeX 数学公式转换器。将用户的数学描述转换为 LaTeX 代码。
	规则：
	1. 只返回纯 LaTeX 代码，不要解释
	2. 不要用 markdown 代码块包裹
	3. 不要包含 $ 或 $$ 分隔符
	4. 保持数学语义的准确性`,
	aiEnableThinking: false,
};
