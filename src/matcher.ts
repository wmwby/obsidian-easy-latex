import { LatexCommand, LatexSuggestion, CustomMapping } from "./types";
import { LangConfig, detectScript, resolveDescription } from "./langRegistry";

export function matchByPrefix(
	query: string,
	commands: LatexCommand[],
	locale: string
): LatexSuggestion[] {
	const lowerQuery = query.toLowerCase();
	return commands
		.filter((cmd) => cmd.command.toLowerCase().startsWith(lowerQuery))
		.map((cmd) => ({
			command: cmd.command,
			displayText: cmd.snippet.replace(/\$\d+/g, "·"),
			description: cmd.description,
			localDescription: resolveDescription(cmd, null, locale),
			snippet: cmd.snippet,
			source: "prefix" as const,
		}));
}

export function matchByKeywords(
	query: string,
	keywordMap: Record<string, string[]>,
	commandMap: Map<string, LatexCommand>,
	lang: LangConfig,
	locale: string
): LatexSuggestion[] {
	const results: LatexSuggestion[] = [];
	const seen = new Set<string>();

	// Try all prefixes from longest to shortest, then individual characters
	const lookups: string[] = [];
	for (let len = query.length; len >= 1; len--) {
		lookups.push(query.substring(0, len));
	}
	for (const ch of query) {
		if (!lookups.includes(ch)) {
			lookups.push(ch);
		}
	}
	for (const key of lookups) {
		const cmdNames = keywordMap[key];
		if (!cmdNames) continue;
		for (const name of cmdNames) {
			if (seen.has(name)) continue;
			seen.add(name);
			const cmd = commandMap.get(name);
			if (!cmd) continue;
			results.push({
				command: cmd.command,
				displayText: cmd.snippet.replace(/\$\d+/g, "·"),
				description: cmd.description,
				localDescription: resolveDescription(cmd, lang, locale),
				snippet: cmd.snippet,
				source: "keyword" as const,
			});
		}
	}

	return results;
}

export function matchRawSymbols(
	query: string,
	rawMap: Record<string, string[]>
): LatexSuggestion[] {
	const results: LatexSuggestion[] = [];
	const seen = new Set<string>();

	const lookups: string[] = [];
	for (let len = query.length; len >= 1; len--) {
		lookups.push(query.substring(0, len));
	}
	for (const ch of query) {
		if (!lookups.includes(ch)) {
			lookups.push(ch);
		}
	}
	for (const key of lookups) {
		const inserts = rawMap[key];
		if (!inserts) continue;
		for (const insert of inserts) {
			if (seen.has(insert)) continue;
			seen.add(insert);
			results.push({
				command: insert,
				displayText: insert,
				description: "",
				localDescription: key,
				snippet: insert,
				source: "raw",
				isRaw: true,
			});
		}
	}

	return results;
}

export function matchCustomMappings(
	query: string,
	customMappings: CustomMapping[],
	hasScript: boolean
): LatexSuggestion[] {
	const results: LatexSuggestion[] = [];
	const lowerQuery = query.toLowerCase();

	for (const mapping of customMappings) {
		const keywordHasScript = /[一-鿿぀-ゟ゠-ヿ가-힯]/.test(mapping.keyword);

		if (hasScript && keywordHasScript) {
			// Script query: try all prefixes of query against keyword
			let matched = false;
			for (let len = query.length; len >= 1; len--) {
				if (query.substring(0, len) === mapping.keyword) {
					matched = true;
					break;
				}
			}
			if (matched) {
				results.push({
					command: mapping.snippet,
					displayText: mapping.snippet.replace(/\$\d+/g, "·"),
					description: "",
					localDescription: mapping.keyword,
					snippet: mapping.snippet,
					source: "custom",
					isCustom: true,
				});
			}
		} else if (!hasScript && !keywordHasScript) {
			// Latin query: prefix match
			if (mapping.keyword.toLowerCase().startsWith(lowerQuery)) {
				results.push({
					command: mapping.keyword,
					displayText: mapping.snippet.replace(/\$\d+/g, "·"),
					description: "",
					localDescription: "",
					snippet: mapping.snippet,
					source: "custom",
					isCustom: true,
				});
			}
		}
	}

	return results;
}

export function matchSuggestions(
	query: string,
	commands: LatexCommand[],
	commandMap: Map<string, LatexCommand>,
	langRegistry: LangConfig[],
	customMappings: CustomMapping[],
	locale: string
): LatexSuggestion[] {
	const detectedLang = detectScript(query);
	const hasScript = detectedLang !== null;

	let results: LatexSuggestion[];

	if (hasScript && detectedLang) {
		// Match with detected language's keyword map and raw map
		const keywordResults = matchByKeywords(query, detectedLang.keywordMap, commandMap, detectedLang, locale);
		const rawResults = matchRawSymbols(query, detectedLang.rawMap);

		// For CJK-only queries (kanji), also check other CJK-based languages
		const extraResults: LatexSuggestion[] = [];
		if (detectedLang.tag === "zh" || detectedLang.tag === "ja") {
			const cjkLang = langRegistry.find(l =>
				(l.tag === "zh" || l.tag === "ja") && l.tag !== detectedLang.tag
			);
			if (cjkLang) {
				extraResults.push(...matchByKeywords(query, cjkLang.keywordMap, commandMap, cjkLang, locale));
				extraResults.push(...matchRawSymbols(query, cjkLang.rawMap));
			}
		}

		const customResults = matchCustomMappings(query, customMappings, true);

		// Deduplicate across language maps by command name
		const seen = new Set<string>();
		const deduped: LatexSuggestion[] = [];
		for (const r of [...rawResults, ...keywordResults, ...extraResults, ...customResults]) {
			const key = `${r.command}:${r.source}`;
			if (!seen.has(key)) {
				seen.add(key);
				deduped.push(r);
			}
		}
		results = deduped;
	} else {
		const prefixResults = matchByPrefix(query, commands, locale);
		const customResults = matchCustomMappings(query, customMappings, false);
		results = [...prefixResults, ...customResults];
	}

	return results;
}
