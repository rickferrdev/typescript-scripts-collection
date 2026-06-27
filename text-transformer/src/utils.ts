import type { HandlersRunReturns } from "./HandlerConfig";

/**
 * Creates a successful handler result.
 *
 * This helper standardizes the success response returned by handlers.
 * The `data` value represents the transformed text that should continue
 * through the pipeline.
 *
 * The optional `output` value can be used when a handler needs to print
 * additional information to stdout without necessarily changing the
 * pipeline data.
 *
 * @param data - Text data produced by the handler.
 * @param output - Optional text output to be printed by the caller.
 * @returns A successful `HandlersRunReturns` object.
 *
 * @example
 * ```ts
 * return ok(input.toUpperCase());
 * ```
 *
 * @example
 * ```ts
 * return ok(input, String(input.includes("hello")));
 * ```
 */
export function ok(data: string, output?: string): HandlersRunReturns {
	return typeof output === "string"
		? { ok: true, output: output, data: data }
		: { ok: true, data: data };
}

/**
 * Creates a failed handler result.
 *
 * This helper standardizes the error response returned by handlers.
 * It receives a message and wraps it inside an `Error` instance.
 *
 * @param message - Error message describing why the handler failed.
 * @returns A failed `HandlersRunReturns` object.
 *
 * @example
 * ```ts
 * return fail("replaceAll expects [from] [to]");
 * ```
 */
export function fail(message: string): HandlersRunReturns {
	return { ok: false, error: new Error(message) };
}
