import type { HandlersConfig } from "./HandlerConfig";
import { fail, ok } from "./utils";

/**
 * Collection of available text transformation handlers.
 *
 * Each handler describes:
 *
 * - how many positional arguments it expects through `argc`;
 * - how it transforms or inspects the current pipeline text through `run`.
 *
 * The object is validated with `satisfies Record<string, HandlersConfig>`
 * to ensure that every handler follows the expected handler contract.
 */
export const HANDLERS = {
	/**
	 * Converts the current pipeline text to lowercase.
	 *
	 * This handler does not consume any extra positional arguments.
	 *
	 * @example
	 * ```bash
	 * lowercase
	 * ```
	 */
	lowercase: {
		/**
		 * Number of arguments expected after the action name.
		 */
		argc: 0,

		/**
		 * Executes the lowercase transformation.
		 *
		 * @param input - Current text from the transformation pipeline.
		 * @returns A successful result containing the lowercase text.
		 */
		run: (input: string) => {
			return ok(input.toLowerCase());
		},
	},

	/**
	 * Converts the current pipeline text to uppercase.
	 *
	 * This handler does not consume any extra positional arguments.
	 *
	 * @example
	 * ```bash
	 * uppercase
	 * ```
	 */
	uppercase: {
		/**
		 * Number of arguments expected after the action name.
		 */
		argc: 0,

		/**
		 * Executes the uppercase transformation.
		 *
		 * @param input - Current text from the transformation pipeline.
		 * @returns A successful result containing the uppercase text.
		 */
		run: (input: string) => {
			return ok(input.toUpperCase());
		},
	},

	/**
	 * Replaces all occurrences of one string with another string.
	 *
	 * This handler consumes two positional arguments:
	 *
	 * 1. `from` - text to search for;
	 * 2. `to` - replacement text.
	 *
	 * The `from` argument cannot be an empty string, because replacing an empty
	 * string would insert the replacement between every character and at the
	 * beginning and end of the text.
	 *
	 * @example
	 * ```bash
	 * replaceAll hello hi
	 * ```
	 */
	replaceAll: {
		/**
		 * Number of arguments expected after the action name.
		 */
		argc: 2,

		/**
		 * Executes the replace-all transformation.
		 *
		 * @param input - Current text from the transformation pipeline.
		 * @param args - Handler arguments in the format `[from, to]`.
		 * @returns A successful result with the transformed text, or a failed
		 * result when the arguments are invalid.
		 */
		run: (input, args) => {
			const [from, to] = args;

			/**
			 * Validate that both required arguments were provided as strings.
			 */
			if (typeof from !== "string" || typeof to !== "string") {
				return fail("replaceAll expects [from] [to]");
			}

			/**
			 * Prevent replacing an empty string, which would produce surprising
			 * output by inserting the replacement between every character.
			 */
			if (from.length === 0) {
				return fail("replaceAll expects [from] to be a non-empty string");
			}

			return ok(input.replaceAll(from, to));
		},
	},

	/**
	 * Checks whether the current pipeline text includes a search string.
	 *
	 * This handler consumes one positional argument:
	 *
	 * 1. `search` - text to search for inside the current pipeline text.
	 *
	 * The result of the search is returned as optional output, meaning it can be
	 * printed by the caller. The original pipeline text is preserved as `data`,
	 * so this handler behaves like an inspection action rather than a text
	 * transformation.
	 *
	 * @example
	 * ```bash
	 * includes hello
	 * ```
	 */
	includes: {
		/**
		 * Number of arguments expected after the action name.
		 */
		argc: 1,

		/**
		 * Executes the includes inspection.
		 *
		 * @param input - Current text from the transformation pipeline.
		 * @param args - Handler arguments in the format `[search]`.
		 * @returns A successful result containing the original input as pipeline
		 * data and `"true"` or `"false"` as optional output.
		 */
		run: (input, args) => {
			const [search] = args;

			/**
			 * Validate that the search argument was provided as a string.
			 */
			if (typeof search !== "string") {
				return fail("includes expects [search]");
			}

			return ok(input, String(input.includes(search)));
		},
	},
} satisfies Record<string, HandlersConfig>;
