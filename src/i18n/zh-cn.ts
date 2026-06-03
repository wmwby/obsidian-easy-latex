const zhCn: Record<string, string> = {
	// Settings page
	'settings.title': 'Easy LaTeX - AI 设置',
	'settings.apiUrl.name': 'API URL',
	'settings.apiUrl.desc': 'OpenAI 兼容格式的 API 地址（只需填到 /v1，会自动补全 /chat/completions）',
	'settings.apiUrl.placeholder': 'https://api.openai.com/v1/chat/completions',
	'settings.apiKey.name': 'API Key',
	'settings.apiKey.desc': '你的 API 密钥',
	'settings.apiKey.placeholder': 'sk-...',
	'settings.model.name': 'Model',
	'settings.model.desc': '模型名称（如 gpt-4o-mini、deepseek-chat 等）',
	'settings.model.placeholder': 'gpt-4o-mini',
	'settings.systemPrompt.name': 'System Prompt',
	'settings.systemPrompt.desc': '发送给 AI 的系统提示词',
	'settings.systemPrompt.placeholder': '你是 LaTeX 数学公式转换器...',
	'settings.thinking.name': '启用思考模式',
	'settings.thinking.desc': '建议保持关闭，开启后模型会先进行推理再输出，生成 LaTeX 的时间会明显变长。仅对支持思考模式的模型生效。',
	'settings.test.name': '测试连接',
	'settings.test.desc': '发送测试请求验证 API 配置是否正确',
	'settings.test.button': '测试',
	'settings.test.running': '测试中...',

		// Custom mappings
		'settings.customMappings.title': '自定义关键词映射',
		'settings.customMappings.desc': '添加自定义关键词到 LaTeX 片段的映射。拉丁关键词在数学模式下输入 \\keyword 触发；中文关键词直接输入触发。用 $1, $2 表示光标位置。',
		'settings.customMappings.keyword': '关键词',
		'settings.customMappings.keywordPlaceholder': 'div',
		'settings.customMappings.snippet': 'LaTeX 片段',
		'settings.customMappings.snippetPlaceholder': '\\frac{$1}{$2}',
		'settings.customMappings.add': '添加',
		'settings.customMappings.delete': '删除',
		'settings.customMappings.emptyFields': '关键词和片段不能为空',

	// Notices
	'notice.generating': '正在生成 LaTeX...',
	'notice.generated': '已生成',
	'notice.success': '连接成功: ',
	'notice.fail': '连接失败: ',
	'notice.aiFail': 'AI 生成失败: ',

	// Default AI system prompt
	'defaultPrompt': `你是 LaTeX 数学公式转换器。将用户的数学描述转换为 LaTeX 代码。
规则：
1. 只返回纯 LaTeX 代码，不要解释
2. 不要用 markdown 代码块包裹
3. 不要包含 $ 或 $$ 分隔符
4. 保持数学语义的准确性`,
};

export default zhCn;
