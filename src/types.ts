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
	source: "prefix" | "chinese" | "both" | "raw" | "custom";
	isRaw?: boolean;
	isCustom?: boolean;
}

export interface CustomMapping {
	keyword: string;
	snippet: string;
}

export interface LatexAutocompleteSettings {
	aiApiUrl: string;
	aiApiKey: string;
	aiModel: string;
	aiSystemPrompt: string;
	aiEnableThinking: boolean;
	customMappings: CustomMapping[];
}

export const DEFAULT_SETTINGS: LatexAutocompleteSettings = {
	aiApiUrl: "https://api.openai.com/v1/chat/completions",
	aiApiKey: "",
	aiModel: "gpt-4o-mini",
	aiSystemPrompt: "",
	aiEnableThinking: false,
	customMappings: [],
};
