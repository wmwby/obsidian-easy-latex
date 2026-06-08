const en: Record<string, string> = {
	// Settings page
	'settings.title': 'Easy LaTeX - AI Settings',
	'settings.apiUrl.name': 'API URL',
	'settings.apiUrl.desc': 'OpenAI-compatible API endpoint (fill up to /v1, /chat/completions will be appended automatically)',
	'settings.apiUrl.placeholder': 'https://api.openai.com/v1/chat/completions',
	'settings.apiKey.name': 'API Key',
	'settings.apiKey.desc': 'Your API key',
	'settings.apiKey.placeholder': 'sk-...',
	'settings.model.name': 'Model',
	'settings.model.desc': 'Model name (e.g., gpt-4o-mini, deepseek-chat)',
	'settings.model.placeholder': 'gpt-4o-mini',
	'settings.systemPrompt.name': 'System Prompt',
	'settings.systemPrompt.desc': 'System prompt sent to the AI',
	'settings.systemPrompt.placeholder': 'You are a LaTeX math formula converter...',
	'settings.thinking.name': 'Enable Thinking Mode',
	'settings.thinking.desc': 'Recommended to keep off. When enabled, the model will reason before outputting, which significantly increases LaTeX generation time. Only works with models that support thinking mode.',
	'settings.test.name': 'Test Connection',
	'settings.test.desc': 'Send a test request to verify API configuration',
	'settings.test.button': 'Test',
	'settings.test.running': 'Testing...',

		// Custom mappings
		'settings.customMappings.title': 'Custom Keyword Mappings',
		'settings.customMappings.desc': 'Add custom keyword-to-LaTeX snippet mappings. For Latin keywords, type \\keyword in math mode; for Chinese keywords, type directly. Use $1, $2 for cursor positions.',
		'settings.customMappings.keyword': 'Keyword',
		'settings.customMappings.keywordPlaceholder': 'div',
		'settings.customMappings.snippet': 'LaTeX Snippet',
		'settings.customMappings.snippetPlaceholder': '\\frac{$1}{$2}',
		'settings.customMappings.add': 'Add',
		'settings.customMappings.delete': 'Delete',
		'settings.customMappings.emptyFields': 'Keyword and snippet cannot be empty',

	// Notices
	'notice.generating': 'Generating LaTeX...',
	'notice.generated': 'Generated',
	'notice.success': 'Connection successful: ',
	'notice.fail': 'Connection failed: ',
	'notice.aiFail': 'AI generation failed: ',

	// AI errors
		'ai.emptyResponse': 'AI returned empty content',

	// Default AI system prompt
	'defaultPrompt': `You are a LaTeX math formula converter. Convert the user's math description into LaTeX code.
Rules:
1. Return only pure LaTeX code, no explanations
2. Do not wrap in markdown code blocks
3. Do not include $ or $$ delimiters
4. Maintain mathematical accuracy`,
};

export default en;
