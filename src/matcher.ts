import { LatexCommand, LatexSuggestion } from "./types";

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

	// Try full query first, then individual characters
	const lookups = [query, ...query.split("")];
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

	const lookups = [query, ...query.split("")];
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

export function matchSuggestions(
	query: string,
	commands: LatexCommand[],
	chineseMap: Record<string, string[]>,
	commandMap: Map<string, LatexCommand>,
	rawMap: Record<string, string[]>
): LatexSuggestion[] {
	const hasChinese = /[一-鿿]/.test(query);

	let results: LatexSuggestion[];
	if (hasChinese) {
		const chineseResults = matchByChinese(query, chineseMap, commandMap);
		const rawResults = matchRawSymbols(query, rawMap);
		results = [...rawResults, ...chineseResults];
	} else {
		results = matchByPrefix(query, commands);
	}

	return results;
}
