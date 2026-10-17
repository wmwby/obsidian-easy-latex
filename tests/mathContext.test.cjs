const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { transformSync } = require("esbuild");

// Load the real TypeScript implementation without an Obsidian runtime.
const source = fs.readFileSync(path.join(__dirname, "../src/mathContext.ts"), "utf8");
const compiled = transformSync(source, { loader: "ts", format: "cjs" }).code;
const loaded = { exports: {} };
new Function("module", "exports", compiled)(loaded, loaded.exports);
const { isInMathContext } = loaded.exports;

let cases = 0;
function check(name, text, expected) {
	const offset = text.indexOf("|");
	assert.notEqual(offset, -1, "Fixture needs a cursor marker");
	const before = text.slice(0, offset).split("\n");
	const lines = text.replace("|", "").split("\n");
	const editor = { getLine: (line) => lines[line] };
	const cursor = { line: before.length - 1, ch: before[before.length - 1].length };
	assert.equal(isInMathContext(editor, cursor), expected, name);
	cases++;
}

check("text before display math", "积分|\n$$\nx\n$$", false);
check("inside display math", "$$\n积分|\n$$", true);
check("text after display math", "$$\nx\n$$\n积分|", false);
check("text after an empty display block", "$$\n$$\n积分|", false);
check("text after closing delimiter on the cursor line", "$$\nx\n$$ 积分|", false);
check("inside a second display block", "$$\nx\n$$\n$$\n积分|\n$$", true);
check("between display blocks", "$$\nx\n$$\n积分|\n$$\ny\n$$", false);
check("after multiple display blocks", "$$\nx\n$$\n$$\ny\n$$\n积分|", false);
check("inside same-line display math", "$$积分|$$", true);
check("after same-line display math", "$$x$$ 积分|", false);
check("inside inline math", "$积分|$", true);
check("after inline math", "$x$ 积分|", false);
check("inline math after a display block", "$$\nx\n$$\n$积分|$", true);
check("plain text", "积分|", false);
check("inside a long display block", "$$\n" + "x\n".repeat(60) + "积分|\n$$", true);
check("after a long display block", "$$\n" + "x\n".repeat(60) + "$$\n积分|", false);
check("inside a latex code block", "```latex\n积分|\n```", true);
check("after a latex code block", "```latex\nx\n```\n积分|", false);

console.log(`Passed ${cases} math-context regression cases.`);
