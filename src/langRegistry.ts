import { LatexCommand } from "./types";
import chineseKeywords from "../data/chinese-keywords.json";
import japaneseKeywords from "../data/japanese-keywords.json";
import koreanKeywords from "../data/korean-keywords.json";
import rawSymbols from "../data/raw-symbols.json";
import rawSymbolsJa from "../data/raw-symbols-ja.json";
import rawSymbolsKo from "../data/raw-symbols-ko.json";

export interface LangConfig {
	tag: string;
	keywordMap: Record<string, string[]>;
	rawMap: Record<string, string[]>;
	regex: RegExp;
	charClass: string;
}

export const LANG_REGISTRY: LangConfig[] = [
	{
		tag: "zh",
		keywordMap: chineseKeywords,
		rawMap: rawSymbols,
		regex: /[一-鿿]/,
		charClass: "\\u4e00-\\u9fff",
	},
	{
		tag: "ja",
		keywordMap: japaneseKeywords,
		rawMap: rawSymbolsJa,
		regex: /[぀-ゟ゠-ヿ]/,
		charClass: "\\u3040-\\u309f\\u30a0-\\u30ff",
	},
	{
		tag: "ko",
		keywordMap: koreanKeywords,
		rawMap: rawSymbolsKo,
		regex: /[가-힯]/,
		charClass: "\\uac00-\\ud7af",
	},
];

/**
 * Build a combined character class string covering all registered scripts,
 * plus CJK ideographs (shared by Chinese and Japanese).
 * Returns a string like "\\u4e00-\\u9fff\\u3040-\\u309f\\u30a0-\\u30ff\\uac00-\\ud7af"
 */
export function buildCombinedScriptClass(): string {
	const seen = new Set<string>();
	const parts: string[] = [];

	// Always include CJK ideographs (shared by zh and ja)
	const cjk = "\\u4e00-\\u9fff";
	if (!seen.has(cjk)) {
		seen.add(cjk);
		parts.push(cjk);
	}

	for (const lang of LANG_REGISTRY) {
		if (!seen.has(lang.charClass)) {
			seen.add(lang.charClass);
			parts.push(lang.charClass);
		}
	}

	return parts.join("");
}

/**
 * Detect which language a query string belongs to.
 *
 * Priority: Japanese kana > Korean Hangul > Chinese CJK (fallback).
 * This matters because Japanese text may contain kanji (CJK),
 * but kana is an unambiguous indicator of Japanese.
 */
export function detectScript(query: string): LangConfig | null {
	// Check non-CJK scripts first (unambiguous)
	for (const lang of LANG_REGISTRY) {
		if (lang.tag === "zh") continue; // CJK is ambiguous, check last
		if (lang.regex.test(query)) return lang;
	}
	// Fall back to Chinese if CJK ideographs found
	for (const lang of LANG_REGISTRY) {
		if (lang.tag === "zh" && lang.regex.test(query)) return lang;
	}
	return null;
}

/**
 * Resolve the localized description for a LaTeX command.
 *
 * Lookup order:
 * 1. cmd.descriptions[langTag] (new mechanism)
 * 2. cmd.descriptionZh (legacy, for Chinese)
 * 3. empty string
 */
export function resolveDescription(
	cmd: LatexCommand,
	lang: LangConfig | null,
	locale: string
): string {
	// New descriptions map
	if (cmd.descriptions) {
		const tag = lang?.tag ?? locale.split("-")[0];
		if (cmd.descriptions[tag]) return cmd.descriptions[tag];
	}
	// Legacy: descriptionZh for Chinese
	if ((lang?.tag === "zh" || locale.startsWith("zh")) && cmd.descriptionZh) {
		return cmd.descriptionZh;
	}
	return "";
}
