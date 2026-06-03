[English](README.md) | [中文](README_zh-CN.md)

# Obsidian Easy LaTeX

An Obsidian plugin that provides intelligent LaTeX auto-completion in math contexts, with Chinese/English keyword support and AI-powered formula generation.

## Features

### LaTeX Command Completion

Type `\` inside math contexts (`$...$`, `$$...$$`, or LaTeX code blocks) to get a searchable suggestion list of 200+ LaTeX commands. Filter by prefix or description.

### Chinese Keyword Completion

Type Chinese math terms (e.g., `积分`, `矩阵`, `极限`) directly in math contexts — no backslash needed. The plugin matches them to relevant LaTeX commands. It also supports prefix matching, so typing `约等于` will match the keyword `约等` → `\approx`.

### Custom Keyword Mappings

Define your own keyword-to-LaTeX mappings in Settings → Easy LaTeX → Custom Keyword Mappings.

- **Latin keywords**: type `\keyword` in math mode to trigger. E.g., map `div` → `\frac{$1}{$2}`, then typing `\div` suggests `\frac{}{}` with cursor positioned inside the first `{}`.
- **Chinese keywords**: type the keyword directly. E.g., map `分数` → `\frac{$1}{$2}`, then typing `分数` replaces it with `\frac{}{}`.
- Snippets support `$1`, `$2` tabstop placeholders for cursor positioning.

**Example:** Map `div` → `\frac{$1}{$2}`. Now typing `\div` in a math zone shows your custom `\frac{}{}` suggestion alongside the built-in `\div` (÷).

| Field | Description | Example |
|-------|-------------|---------|
| Keyword | The trigger text | `div`, `分数`, `bracket` |
| LaTeX Snippet | The LaTeX to insert (include `\` prefix) | `\frac{$1}{$2}`, `\left($1\right)` |

### AI Formula Generation

Press `Tab` on selected text inside a math zone, and the AI will convert your natural language description into LaTeX code. Works with any OpenAI-compatible API.

## Installation

### Obsidian Community Plugin Store

1. Open Obsidian Settings → Community Plugins
2. Click **Browse** and search for **"Easy LaTeX"**
3. Click **Install**, then **Enable**

### Manual

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](https://github.com/wmwby/obsidian-easy-latex/releases)
2. Create a folder `easy-latex` inside your vault's `.obsidian/plugins/` directory
3. Copy the three files into that folder
4. Enable the plugin in Obsidian Settings → Community Plugins

## AI Configuration

Go to Settings → Easy LaTeX to configure:

| Setting | Description | Default |
|---------|-------------|---------|
| API URL | OpenAI-compatible API endpoint | `https://api.openai.com/v1/chat/completions` |
| API Key | Your API key | — |
| Model | Model name (e.g., `gpt-4o-mini`, `deepseek-chat`) | `gpt-4o-mini` |
| System Prompt | System prompt sent to the AI | Built-in LaTeX converter prompt |

The AI feature is optional — the completion list works without any API configuration.

## License

[MIT](LICENSE)
