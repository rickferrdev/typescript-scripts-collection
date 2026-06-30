import type { HandlersConfig } from "./HandlerConfig";
import { fail, ok } from "./utils";

export const HANDLERS = {
	/**
	 * Converts the input text to lowercase.
	 */
	lowercase: {
		argc: 0,
		run: (input: string) => {
			return ok(input.toLowerCase());
		},
	},

	/**
	 * Converts the input text to uppercase.
	 */
	uppercase: {
		argc: 0,
		run: (input: string) => {
			return ok(input.toUpperCase());
		},
	},

	/**
	 * Replaces every occurrence of a string with another string.
	 */
	replaceAll: {
		argc: 2,
		run: (input, args) => {
			const [from, to] = args;

			if (typeof from !== "string" || typeof to !== "string") {
				return fail("replaceAll: expects [from] [to]");
			}
			if (from.length === 0) {
				return fail("replaceAll: expects [from] to be a non-empty string");
			}

			return ok(input.replaceAll(from, to));
		},
	},

	/**
	 * Checks whether the input contains the searched string.
	 */
	includes: {
		argc: 1,
		run: (input, args) => {
			const [search] = args;
			if (typeof search !== "string") {
				return fail("includes: expects [search]");
			}

			const exists = input.includes(search);

			return ok(input, [
				{
					action: "includes",
					value: String(exists),
				},
			]);
		},
	},

	/**
	 * Appends a string to the end of the input.
	 */
	concat: {
		argc: 1,
		run: (input, args) => {
			const [str] = args;
			if (typeof str !== "string") {
				return fail("concat: expects [string]");
			}

			return ok(input.concat(str));
		},
	},

	/**
	 * Checks whether the input ends with a string at a given position.
	 */
	endsWith: {
		argc: 2,
		run: (input, args) => {
			const [search, position] = args;
			if (typeof search !== "string" || typeof position !== "string") {
				return fail("endsWith: expects [string]");
			}

			return ok(input, [
				{
					action: "endsWith",
					value: String(input.endsWith(search, parseInt(position, 10))),
				},
			]);
		},
	},

	/**
	 * Returns the first index of the searched string from a given position.
	 */
	indexOf: {
		argc: 2,
		run: (input, args) => {
			const [search, position] = args;
			if (typeof search !== "string" || typeof position !== "string") {
				return fail("indexOf: expects [string]");
			}

			return ok(input, [
				{
					action: "indexOf",
					value: String(input.indexOf(search, parseInt(position, 10))),
				},
			]);
		},
	},

	/**
	 * Matches the input against a regular expression.
	 */
	match: {
		argc: 1,
		run: (input, args) => {
			const [exp] = args;
			if (typeof exp !== "string") {
				return fail("indexOf: expects [regex expression]");
			}

			let reg: RegExp;
			try {
				reg = new RegExp(exp);
			} catch (error) {
				return fail(`match: ${(error as Error).message}`);
			}

			return ok(input, [
				{
					action: "match",
					value: String(input.match(reg)),
				},
			]);
		},
	},

	/**
	 * Repeats the input text a given number of times.
	 */
	repeat: {
		argc: 1,
		run: (input, args) => {
			const [num] = args;
			if (typeof num !== "string") {
				return fail("repeat: expects [number]");
			}

			let text: string;
			try {
				text = input.repeat(parseInt(num, 10));
			} catch (error) {
				return fail(`repeat: ${(error as Error).message}`);
			}

			return ok(text);
		},
	},

	/**
	 * Extracts a section of the input using start and end indexes.
	 */
	slice: {
		argc: 2,
		run: (input, args) => {
			const [start, end] = args;
			if (typeof start !== "string" || typeof end !== "string") {
				return fail("slice: expects [start] [end]");
			}

			let text: string;
			try {
				text = input.slice(parseInt(start, 10), parseInt(end, 10));
			} catch (error) {
				return fail(`repeat: ${(error as Error).message}`);
			}

			return ok(text);
		},
	},
} satisfies Record<string, HandlersConfig>;
