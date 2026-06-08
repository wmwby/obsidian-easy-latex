import { t } from './i18n';
import { Editor, EditorPosition, requestUrl } from "obsidian";
import { findMathZoneStart } from "./mathContext";
import { LatexAutocompleteSettings } from "./types";

export interface ExtractResult {
	text: string;
	start: EditorPosition;
	end: EditorPosition;
}

export function extractPromptText(
	editor: Editor,
	cursor: EditorPosition
): ExtractResult | null {
	const start = findMathZoneStart(editor, cursor);
	if (!start) return null;

	// Extract text from start to cursor
	let text = "";
	if (start.line === cursor.line) {
		text = editor.getLine(start.line).substring(start.ch, cursor.ch);
	} else {
		text = editor.getLine(start.line).substring(start.ch);
		for (let i = start.line + 1; i < cursor.line; i++) {
			text += "\n" + editor.getLine(i);
		}
		text += "\n" + editor.getLine(cursor.line).substring(0, cursor.ch);
	}

	text = text.trim();
	if (!text) return null;

	return { text, start, end: cursor };
}

export async function callAiApi(
	text: string,
	settings: LatexAutocompleteSettings
): Promise<string> {
	let apiUrl = settings.aiApiUrl.replace(/\/+$/, "");
	if (!apiUrl.includes("/chat/completions")) {
		apiUrl += "/chat/completions";
	}

	const body: Record<string, any> = {
		model: settings.aiModel,
		messages: [
			{ role: "system", content: settings.aiSystemPrompt },
			{ role: "user", content: text },
		],
		temperature: 0.1,
	};

	if (settings.aiEnableThinking) {
		body.enable_thinking = true;
	}

	const response = await requestUrl({
		url: apiUrl,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${settings.aiApiKey}`,
		},
		body: JSON.stringify(body),
	});

	const content = response.json.choices?.[0]?.message?.content;
	if (!content) throw new Error(t('ai.emptyResponse'));

	// Strip markdown code block wrapping if present
	return content
		.replace(/^```(?:latex|tex|math)?\s*\n?/i, "")
		.replace(/\n?```\s*$/i, "")
		.trim();
}
