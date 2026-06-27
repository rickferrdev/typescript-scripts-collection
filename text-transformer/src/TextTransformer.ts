import type { Handler, HandlerAction, HandlerName } from "./HandlerConfig";
import { HANDLERS } from "./NewHandlers";

/**
 * Registry of all available text transformation handlers.
 *
 * This map converts the static `HANDLERS` object into a runtime `Map`,
 * making it easier to look up actions dynamically by their handler name.
 *
 * Each key is the handler name, such as `"uppercase"`, `"lowercase"`,
 * `"replaceAll"` or `"includes"`, and each value is the corresponding
 * handler configuration.
 */
export const fns = new Map<HandlerName, Handler[HandlerName]>(
	Object.entries(HANDLERS) as [HandlerName, HandlerAction][],
);

/**
 * Applies a sequence of text transformation actions to an input file
 * and writes the final result to an output file.
 *
 * The transformer works as a pipeline:
 *
 * 1. Reads the input file.
 * 2. Iterates over the positional CLI arguments.
 * 3. Resolves each positional action against the available handlers.
 * 4. Passes the current text pipeline to the matched handler.
 * 5. Updates the pipeline with the handler result.
 * 6. Writes the final transformed text to the output file.
 *
 * Example positional pipeline:
 *
 * ```bash
 * uppercase replaceAll HELLO HI
 * ```
 *
 * In this case, the transformer will:
 *
 * 1. Apply the `uppercase` handler.
 * 2. Apply the `replaceAll` handler with `HELLO` as the search value
 *    and `HI` as the replacement value.
 */
export default class TextTransformer {
	/**
	 * Creates a new text transformer instance.
	 *
	 * @param input - Path to the input file that will be read.
	 * @param output - Path to the output file that will receive the transformed text.
	 * @param positionals - Positional CLI arguments representing the transformation pipeline.
	 * @param handlers - Map of available handlers. Defaults to the global `fns` registry.
	 */
	constructor(
		private input: string,
		private output: string,
		private positionals: string[],
		private handlers: Map<HandlerName, Handler[HandlerName]> = fns,
	) {}

	/**
	 * Executes the transformation pipeline.
	 *
	 * This method reads the input file, processes every action described
	 * in `positionals`, and writes the final pipeline result to the output file.
	 *
	 * Each action is resolved by name from the handlers map. The number of
	 * arguments consumed by each action is defined by the handler's `argc`
	 * property.
	 *
	 * For example, a handler with `argc: 2` will consume the next two
	 * positional values after its action name.
	 *
	 * If a handler returns an optional `output` value, that value is printed
	 * to stdout using `console.info`, but the pipeline text is still updated
	 * only from `result.data`.
	 *
	 * @returns `null` when the transformation succeeds, or an `Error`
	 * describing the failure when something goes wrong.
	 *
	 * @example
	 * ```ts
	 * const transformer = new TextTransformer(
	 *   "input.txt",
	 *   "output.txt",
	 *   ["uppercase", "replaceAll", "HELLO", "HI"],
	 * );
	 *
	 * const error = await transformer.transform();
	 *
	 * if (error) {
	 *   console.error(error.message);
	 * }
	 * ```
	 */
	async transform(): Promise<Error | null> {
		/**
		 * Reference to the input file using Bun's file API.
		 */
		const file = Bun.file(this.input);

		/**
		 * Validate whether the input file exists before attempting to read it.
		 */
		if (!(await file.exists())) {
			return new Error(`file passed via --input=${this.input} does not exist`);
		}

		/**
		 * Current text state of the transformation pipeline.
		 *
		 * The pipeline starts with the input file contents and is updated after
		 * each handler execution.
		 */
		let pipeline: string;

		/**
		 * Read the input file contents.
		 *
		 * A try/catch is used because the file can exist but still fail to be read,
		 * for example because of permission issues or runtime I/O errors.
		 */
		try {
			pipeline = await file.text();
		} catch (err) {
			return new Error(
				`failed to read input file: ${this.input}: ${
					err instanceof Error ? err.message : "unknown error"
				}`,
			);
		}

		/**
		 * Iterate through all positional arguments and execute them as actions.
		 *
		 * The loop manually increments `index` by the handler's argument count
		 * after each action, because some handlers consume additional positional
		 * values as arguments.
		 */
		for (let index = 0; index < this.positionals.length; index++) {
			/**
			 * Current action name.
			 *
			 * The value is cast to `HandlerName` because positional arguments
			 * arrive as plain strings from the CLI.
			 */
			const name = this.positionals[index] as HandlerName;

			/**
			 * Validate that an action name exists at the current position.
			 */
			if (typeof name === "undefined") {
				return new Error("missing action");
			}

			/**
			 * Resolve the handler responsible for the current action.
			 */
			const handler = this.handlers.get(name);

			/**
			 * Return an error when the action name does not exist in the handler map.
			 */
			if (typeof handler === "undefined") {
				return new Error(`unknown action: ${name}`);
			}

			/**
			 * Extract the arguments that belong to the current handler.
			 *
			 * The amount of arguments is defined by `handler.argc`.
			 */
			const args = this.positionals.slice(index + 1, index + 1 + handler.argc);

			/**
			 * Validate whether the user provided enough arguments for the action.
			 */
			if (args.length < handler.argc) {
				return new Error(
					`action "${name}" expects ${handler.argc} argument(s), received ${args.length}`,
				);
			}

			/**
			 * Execute the handler with the current pipeline text and its arguments.
			 */
			const result = handler.run(pipeline, args);

			/**
			 * Stop the pipeline if the handler reports a failure.
			 */
			if (!result.ok) {
				return new Error(`action "${name}" failed: ${result.error.message}`);
			}

			/**
			 * Print optional handler output.
			 *
			 * This is useful for handlers that need to display information without
			 * necessarily changing the pipeline text, such as an `includes` action
			 * that prints `true` or `false`.
			 */
			if (typeof result.output !== "undefined" && result.output.length > 0) {
				console.info(result.output);
			}

			/**
			 * Update the pipeline with the transformed data returned by the handler.
			 */
			pipeline = result.data;

			/**
			 * Skip the positional arguments already consumed by this handler.
			 */
			index += handler.argc;
		}

		/**
		 * Write the final pipeline result to the output file.
		 */
		try {
			await Bun.write(this.output, pipeline);
		} catch (err) {
			if (err instanceof Error) {
				return new Error(
					`failed to write output file: ${this.output}: ${err.message}`,
				);
			}

			return new Error(
				`failed to write output file: ${this.output}: unknown error`,
			);
		}

		/**
		 * Returning `null` indicates that the transformation completed successfully.
		 */
		return null;
	}
}
