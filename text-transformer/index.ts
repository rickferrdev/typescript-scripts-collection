import { parseArgs } from "node:util";
import TextFileHandler from "./src/TextFileHandler";
import TextTransformer from "./src/TextTransformer";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	strict: true,
	options: {
		input: {
			type: "string",
			short: "i",
		},
		output: {
			type: "string",
			short: "o",
		},
	},
});

if (!values.input || positionals.length === 0) {
	console.error(
		"should provide the arguments [--input=dir/to/file] [...positionals]",
	);
	process.exit(1);
}

const transformer = new TextTransformer();

const app = new TextFileHandler(
	values.input,
	values.output,
	positionals,
	transformer,
);

const err = await app.run();

if (err instanceof Error) {
	console.error(err.message);
	process.exit(1);
}
