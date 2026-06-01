# Obsidian Easy LaTeX

An Obsidian plugin that provides intelligent LaTeX auto-completion in math contexts, with Chinese/English keyword support and AI-powered formula generation.

## Features

### LaTeX Command Completion

Type `\` inside math contexts (`$...$`, `$$...$$`, or LaTeX code blocks) to get a searchable suggestion list of 200+ LaTeX commands. Filter by prefix or description.

### Chinese Keyword Completion

Type Chinese math terms (e.g., `积分`, `矩阵`, `极限`) directly in math contexts — no backslash needed. The plugin matches them to relevant LaTeX commands.

### AI Formula Generation

Press `Tab` on selected text inside a math zone, and the AI will convert your natural language description into LaTeX code. Works with any OpenAI-compatible API.

## Installation

### Manual

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](https://github.com/mingw/obsidian-easy-latex/releases)
2. Create a folder `latex-autocomplete` inside your vault's `.obsidian/plugins/` directory
3. Copy the three files into that folder
4. Enable the plugin in Obsidian Settings → Community Plugins

### BRAT

Add `https://github.com/mingw/obsidian-easy-latex` to BRAT's beta plugin list.

## AI Configuration

Go to Settings → LaTeX Autocomplete to configure:

| Setting | Description | Default |
|---------|-------------|---------|
| API URL | OpenAI-compatible API endpoint | `https://api.openai.com/v1/chat/completions` |
| API Key | Your API key | — |
| Model | Model name (e.g., `gpt-4o-mini`, `deepseek-chat`) | `gpt-4o-mini` |
| System Prompt | System prompt sent to the AI | Built-in LaTeX converter prompt |

The AI feature is optional — the completion list works without any API configuration.

## License

[MIT](LICENSE)
