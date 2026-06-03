import { LatexCommand, LatexSuggestion, CustomMapping } from "./types";

export function matchByPrefix(
	query: string,
	commands: LatexCommand[]
): LatexSuggestion[] {
	const lowerQuery = query.toLowerCase();
	return commands
		.filter((cmd) => cmd.command.toLowerCase().startsWith(lowerQuery))
		.map((cmd) => ({
			command: cmd.command,
			displayText: cmd.snippet.replace(/\$\d+/g, "·"),
			description: cmd.description,
			descriptionZh: cmd.descriptionZh,
			snippet: cmd.snippet,
			source: "prefix" as const,
		}));
}

export function matchByChinese(
	query: string,
	chineseMap: Record<string, string[]>,
	commandMap: Map<string, LatexCommand>
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
		const cmdNames = chineseMap[key];
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
				descriptionZh: cmd.descriptionZh,
				snippet: cmd.snippet,
				source: "chinese" as const,
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
				descriptionZh: key,
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
	hasChinese: boolean
): LatexSuggestion[] {
	const results: LatexSuggestion[] = [];
	const lowerQuery = query.toLowerCase();

	for (const mapping of customMappings) {
		const keywordHasChinese = /[一-鿿]/.test(mapping.keyword);

		if (hasChinese && keywordHasChinese) {
			// CJK query: try all prefixes of query against keyword
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
					descriptionZh: mapping.keyword,
					snippet: mapping.snippet,
					source: "custom",
					isCustom: true,
				});
			}
		} else if (!hasChinese && !keywordHasChinese) {
			// Latin query: prefix match
			if (mapping.keyword.toLowerCase().startsWith(lowerQuery)) {
				results.push({
					command: mapping.keyword,
					displayText: mapping.snippet.replace(/\$\d+/g, "·"),
					description: "",
					descriptionZh: "",
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
	chineseMap: Record<string, string[]>,
	commandMap: Map<string, LatexCommand>,
	rawMap: Record<string, string[]>,
	customMappings: CustomMapping[]
): LatexSuggestion[] {
	const hasChinese = /[一-鿿]/.test(query);

	let results: LatexSuggestion[];
	if (hasChinese) {
		const chineseResults = matchByChinese(query, chineseMap, commandMap);
		const rawResults = matchRawSymbols(query, rawMap);
		const customResults = matchCustomMappings(query, customMappings, true);
		results = [...rawResults, ...chineseResults, ...customResults];
	} else {
		const prefixResults = matchByPrefix(query, commands);
		const customResults = matchCustomMappings(query, customMappings, false);
		results = [...prefixResults, ...customResults];
	}

	return results;
}
