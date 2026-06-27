import { parseArgs } from "node:util";
import TextTransformer from "./src/TextTransformer";

/**
 * Parse command-line arguments passed to the CLI.
 *
 * Supported named options:
 *
 * - `--input` or `-i`: path to the input file.
 * - `--output` or `-o`: path to the output file.
 *
 * Positional arguments are enabled because they represent the transformation
 * pipeline, such as:
 *
 * ```bash
 * uppercase replaceAll HELLO HI
 * ```
 */
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

/**
 * Validate required CLI arguments.
 *
 * The CLI requires:
 *
 * - an input file path;
 * - an output file path;
 * - at least one positional action.
 *
 * Without positional actions, there is no transformation pipeline to execute.
 */
if (!values.input || !values.output || positionals.length === 0) {
	console.error(
		"should provide the arguments [--input=dir/to/file] [--output=dir/to/file] [...positionals]",
	);
	process.exit(1);
}

/**
 * Create the text transformer using the parsed CLI values.
 *
 * The `positionals` array is passed directly to the transformer, where it will
 * be interpreted as a sequence of action names and action arguments.
 */
const text = new TextTransformer(values.input, values.output, positionals);

/**
 * Execute the transformation pipeline.
 *
 * The transformer returns `null` on success or an `Error` object when something
 * fails, such as:
 *
 * - input file not found;
 * - input file read failure;
 * - unknown action;
 * - missing handler arguments;
 * - output file write failure.
 */
const err = await text.transform();

/**
 * Print a friendly error message and exit with failure status when the
 * transformation fails.
 */
if (err instanceof Error) {
	console.error(err.message);
	process.exit(1);
}
