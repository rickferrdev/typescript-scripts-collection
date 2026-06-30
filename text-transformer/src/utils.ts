import type { HandlerOutputs, TextTransformResult } from "./HandlerConfig";

export function ok(
	text: string,
	outputs?: HandlerOutputs,
): TextTransformResult {
	return typeof outputs !== "undefined"
		? {
				ok: true,
				data: {
					outputs: outputs,
					text: text,
				},
			}
		: {
				ok: true,
				data: {
					text: text,
				},
			};
}

export function fail(message: string): TextTransformResult {
	return { ok: false, error: new Error(message) };
}
