import type { HANDLERS } from "./NewHandlers";

/**
 * Represents the complete handlers registry type.
 *
 * This type is inferred directly from the `HANDLERS` object, ensuring that
 * handler names and handler definitions stay synchronized with the actual
 * exported handlers.
 */
export type Handler = typeof HANDLERS;

/**
 * Contract that every handler must follow.
 *
 * A handler configuration defines how many positional arguments the handler
 * expects and which function should be executed when the handler is called.
 */
export type HandlersConfig = {
	/**
	 * Number of positional arguments consumed by the handler.
	 *
	 * For example:
	 *
	 * - `uppercase` uses `0`;
	 * - `replaceAll` uses `2`;
	 * - `includes` uses `1`.
	 */
	argc: number;

	/**
	 * Executes the handler logic.
	 *
	 * @param input - Current text from the transformation pipeline.
	 * @param args - Positional arguments consumed by this handler.
	 * @returns A successful or failed handler result.
	 */
	run: (input: string, args: string[]) => HandlersRunReturns;
};

/**
 * Union of all valid handler names.
 *
 * This type is generated from the keys of the `HANDLERS` object.
 *
 * For example, if `HANDLERS` contains `uppercase` and `replaceAll`,
 * then those names become valid `HandlerName` values.
 */
export type HandlerName = keyof Handler;

/**
 * Union of all available handler action definitions.
 *
 * This type represents the value type of any handler inside the `HANDLERS`
 * registry.
 */
export type HandlerAction = Handler[HandlerName];

/**
 * Result returned by a handler execution.
 *
 * A handler can return either:
 *
 * - a successful result with transformed pipeline `data`;
 * - a failed result with an `Error`.
 *
 * Successful handlers may also return an optional `output` string. This is
 * useful for actions that need to print information to stdout without changing
 * the pipeline data, such as an inspection-style handler.
 */
export type HandlersRunReturns =
	| {
			data: string;
			output?: string;
			ok: true;
	  }
	| {
			error: Error;
			ok: false;
	  };
