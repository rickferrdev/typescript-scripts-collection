import {
	fns,
	type HandlerMap,
	type HandlerName,
	type HandlerOutputs,
	type TextTransformResult,
} from "./HandlerConfig";
import { fail, ok } from "./utils";

export default class TextTransformer {
	constructor(private handlers: HandlerMap = fns) {}

	/**
	 * Applies text transformation actions in sequence using the given positionals.
	 * Returns the transformed text and any outputs produced by handlers.
	 */
	async transform(
		input: string,
		positionals: string[],
	): Promise<TextTransformResult> {
		let pipeline: string = input;
		let outputs: HandlerOutputs = [];
		for (let index = 0; index < positionals.length; index++) {
			const name = positionals[index] as HandlerName;
			if (typeof name === "undefined") {
				return fail("missing action");
			}

			const handler = this.handlers.get(name);
			if (typeof handler === "undefined") {
				return fail(`unknown action: ${name}`);
			}

			const args = positionals.slice(index + 1, index + 1 + handler.argc);
			if (args.length < handler.argc) {
				return fail(
					`action "${name}" expects ${handler.argc} argument(s), received ${args.length}`,
				);
			}

			const result = handler.run(pipeline, args);
			if (!result.ok) {
				return fail(`action "${name}" failed: ${result.error.message}`);
			}

			if (typeof result.data.outputs !== "undefined") {
				outputs.push(...result.data.outputs);
			}

			pipeline = result.data.text;
			index += handler.argc;
		}

		return outputs.length > 0 ? ok(pipeline, outputs) : ok(pipeline);
	}
}
