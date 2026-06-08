[English](README.md) | [中文](README_zh-CN.md)

# Obsidian Easy LaTeX

一个 Obsidian 插件，提供智能 LaTeX 数学公式自动补全，支持多语言关键词触发（中文、日文、韩文、英文）和 AI 驱动的公式生成。

## 功能

### LaTeX 命令补全

在数学环境（`$...$`、`$$...$$` 或 LaTeX 代码块）中输入 `\`，即可获得 200+ LaTeX 命令的搜索建议列表，支持按前缀或描述过滤。

### 多语言关键词补全

在数学环境中直接输入母语数学术语，无需反斜杠，插件会自动匹配对应的 LaTeX 命令。

- **中文**：`积分` → `\int`、`矩阵` → `\begin`、`约等于` → `\approx`（支持前缀子串匹配）
- **日文**：`せきぶん` → `\int`、`ぎょうれつ` → `\begin`、`ぶんすう` → `\frac`
- **韩文**：`적분` → `\int`、`행렬` → `\begin`、`분수` → `\frac`
- **英文**：在数学模式下输入 `\keyword`（如 `\frac` → `\frac{}{}`）

### 自定义关键词映射

在「设置 → Easy LaTeX → 自定义关键词映射」中定义你自己的关键词到 LaTeX 片段的映射。

- **拉丁关键词**：在数学模式下输入 `\keyword` 触发。例如映射 `div` → `\frac{$1}{$2}`，输入 `\div` 即可补全为 `\frac{}{}`，光标定位在第一个 `{}` 内。
- **CJK 关键词**（中文/日文/韩文）：直接输入触发。例如映射 `分数` → `\frac{$1}{$2}`，输入 `分数` 即可替换为 `\frac{}{}`。
- 片段支持 `$1`、`$2` tabstop 占位符，用于光标定位。

**示例：** 映射 `div` → `\frac{$1}{$2}`。在数学区域输入 `\div` 时，自定义的 `\frac{}{}` 建议会与内置的 `\div`（÷）同时出现。

| 字段 | 说明 | 示例 |
|------|------|------|
| 关键词 | 触发文本 | `div`、`分数`、`ぶんすう`、`분수`、`bracket` |
| LaTeX 片段 | 要插入的 LaTeX（包含 `\` 前缀） | `\frac{$1}{$2}`、`\left($1\right)` |

### AI 公式生成

在数学区域选中文本后按 `Tab`，AI 会将自然语言描述转换为 LaTeX 代码。支持任何 OpenAI 兼容的 API。

## 安装

### Obsidian 社区插件市场

1. 打开 Obsidian 设置 → 第三方插件
2. 点击**浏览**，搜索 **"Easy LaTeX"**
3. 点击**安装**，然后**启用**

### 手动安装

1. 从 [最新 Release](https://github.com/wmwby/obsidian-easy-latex/releases) 下载 `main.js`、`styles.css` 和 `manifest.json`
2. 在你的仓库 `.obsidian/plugins/` 目录下创建 `easy-latex` 文件夹
3. 将三个文件复制到该文件夹
4. 在 Obsidian 设置 → 第三方插件中启用插件

## AI 配置

在「设置 → Easy LaTeX」中配置：

| 设置项 | 说明 | 默认值 |
|--------|------|--------|
| API URL | OpenAI 兼容的 API 地址 | `https://api.openai.com/v1/chat/completions` |
| API Key | 你的 API 密钥 | — |
| Model | 模型名称（如 `gpt-4o-mini`、`deepseek-chat`） | `gpt-4o-mini` |
| System Prompt | 发送给 AI 的系统提示词 | 内置 LaTeX 转换提示词 |

AI 功能为可选——无需任何 API 配置即可使用自动补全功能。

## 许可证

[MIT](LICENSE)
