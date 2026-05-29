import { Editor, EditorPosition } from "obsidian";

export function isInMathContext(
	editor: Editor,
	cursor: EditorPosition
): boolean {
	if (isInLatexCodeBlock(editor, cursor)) return true;

	// Check $$ display math: scan current line up to cursor,
	// then previous lines, to find if we're inside a $$ block
	const line = editor.getLine(cursor.line);
	const textBeforeCursor = line.substring(0, cursor.ch);

	let inDisplayMath = false;

	// First, check $$ on current line up to cursor
	inDisplayMath = countDollarDollar(textBeforeCursor, inDisplayMath);
	if (inDisplayMath) return true;

	// If not inside $$ on current line, scan previous lines
	for (let i = cursor.line - 1; i >= Math.max(0, cursor.line - 50); i--) {
		const prevLine = editor.getLine(i);
		inDisplayMath = countDollarDollar(prevLine, inDisplayMath);
		if (inDisplayMath) return true;
	}

	// Check $ inline math on current line only
	const withoutDisplayMath = textBeforeCursor.replace(/\$\$/g, "  ");
	const dollarCount = (withoutDisplayMath.match(/\$/g) || []).length;
	if (dollarCount % 2 === 1) return true;

	return false;
}

function countDollarDollar(text: string, state: boolean): boolean {
	let pos = 0;
	let inDisplayMath = state;
	while (pos < text.length) {
		if (text.substring(pos, pos + 2) === "$$") {
			inDisplayMath = !inDisplayMath;
			pos += 2;
		} else {
			pos += 1;
		}
	}
	return inDisplayMath;
}

function isInLatexCodeBlock(
	editor: Editor,
	cursor: EditorPosition
): boolean {
	for (
		let i = cursor.line - 1;
		i >= Math.max(0, cursor.line - 50);
		i--
	) {
		const line = editor.getLine(i).trim();
		if (line.startsWith("```")) {
			const lang = line.substring(3).trim().toLowerCase();
			return lang === "latex" || lang === "tex" || lang === "math";
		}
	}
	return false;
}

export function findMathZoneStart(
	editor: Editor,
	cursor: EditorPosition
): EditorPosition | null {
	// Case 1: LaTeX code block
	for (let i = cursor.line - 1; i >= Math.max(0, cursor.line - 50); i--) {
		const line = editor.getLine(i).trim();
		if (line.startsWith("```")) {
			const lang = line.substring(3).trim().toLowerCase();
			if (lang === "latex" || lang === "tex" || lang === "math") {
				return { line: i + 1, ch: 0 };
			}
			return null;
		}
	}

	const line = editor.getLine(cursor.line);
	const textBeforeCursor = line.substring(0, cursor.ch);

	// Case 2: $$ display math — find the opening $$
	let inDisplayMath = false;
	inDisplayMath = countDollarDollar(textBeforeCursor, inDisplayMath);

	if (inDisplayMath) {
		// Find opening $$ on current line
		let pos = 0;
		while (pos < textBeforeCursor.length) {
			if (textBeforeCursor.substring(pos, pos + 2) === "$$") {
				return { line: cursor.line, ch: pos + 2 };
			}
			pos++;
		}
		// Opening $$ on a previous line
		for (let i = cursor.line - 1; i >= Math.max(0, cursor.line - 50); i--) {
			const prevLine = editor.getLine(i);
			let p = 0;
			while (p < prevLine.length) {
				if (prevLine.substring(p, p + 2) === "$$") {
					return { line: i, ch: p + 2 };
				}
				p++;
			}
		}
	}

	// Case 3: $ inline math — find the opening $
	const withoutDisplayMath = textBeforeCursor.replace(/\$\$/g, "  ");
	const lastDollar = withoutDisplayMath.lastIndexOf("$");
	if (lastDollar !== -1) {
		return { line: cursor.line, ch: lastDollar + 1 };
	}

	return { line: cursor.line, ch: 0 };
}
