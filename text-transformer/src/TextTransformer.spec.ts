import { describe, expect, test } from "bun:test";
import TextTransformer from "./TextTransformer";

type TransformerSuccess = Awaited<ReturnType<TextTransformer["transform"]>> & {
	ok: true;
};

type table = Array<{
	name: string;
	input: string;
	positionals: string[];
	assert: (result: TransformerSuccess, input: string) => void;
}>;

describe("TextTransformer", () => {
	const transformer = new TextTransformer();
	const cases: table = [
		{
			name: "should return an error-free result in uppercase",
			input: "Dream big, work hard, stay focused",
			positionals: ["uppercase"],
			assert: (result, input) => {
				expect(result.data).not.toEqual(input);
				expect(result.data.outputs).toBeUndefined();
				expect(result.data.text).toBe(input.toUpperCase());
			},
		},
		{
			name: "should replace all occurrences with 'was replaced'",
			input: "I fell in love before your eyes.",
			positionals: ["replaceAll", "fell", "was replaced"],
			assert: (res, input) => {
				const expected = input.replaceAll("fell", "was replaced");

				expect(res.data.text).toEqual(expected);
				expect(res.data.outputs).toBeEmpty();
			},
		},
		{
			name: "should return true in the output if a match is found",
			input: "I fell in love before your eyes.",
			positionals: ["includes", "love before"],
			assert: (res, input) => {
				expect(res.data.text).toEqual(input);
				expect(res.data.outputs).toEqual([
					{
						action: "includes",
						value: "true",
					},
				]);
			},
		},
		{
			name: "should concatenate a string to the input",
			input: "I fell in love before your eyes. ",
			positionals: ["concat", "But I cannot find myself."],
			assert: (res, input) => {
				expect(res.data.outputs).toBeEmpty();
				expect(res.data.text).toEqual(
					input.concat("But I cannot find myself."),
				);
			},
		},
		{
			name: "should return true if the input ends with the occurrence",
			input: "I fell in love before your eyes. ",
			positionals: ["endsWith", "your eyes.", "0"],
			assert: (res, input) => {
				expect(res.data.text).toEqual(input);
				expect(res.data.outputs).toEqual([
					{
						action: "endsWith",
						value: String(input.endsWith("your eyes.", 0)),
					},
				]);
			},
		},
		{
			name: "it should return the index of the occurrence",
			input: "I fell in love before your eyes.",
			positionals: ["indexOf", "before", "0"],
			assert: (res, input) => {
				expect(res.data.text).toEqual(input);
				expect(res.data.outputs).toEqual([
					{
						action: "indexOf",
						value: String(input.indexOf("before", 0)),
					},
				]);
			},
		},
		{
			name: "it should match the searched incident",
			input: "I fell in love before your eyes.",
			positionals: ["match", "your"],
			assert: (res, input) => {
				expect(res.data.text).toEqual(input);
				expect(res.data.outputs).toEqual([
					{
						action: "match",
						value: String(input.match("your")),
					},
				]);
			},
		},
		{
			name: "It should repeat the input twice.",
			input: "I fell in love before your eyes.",
			positionals: ["repeat", "2"],
			assert: (res, input) => {
				expect(res.data.text).toEqual(input.repeat(2));
				expect(res.data.outputs).toBeEmpty();
			},
		},
		{
			name: "should extract part of a string",
			input: "I fell in love before your eyes.",
			positionals: ["slice", "10", "14"],
			assert: (res, input) => {
				expect(res.data.text).toEqual(input.slice(10, 14));
				expect(res.data.outputs).toBeEmpty();
			},
		},
	];

	for (const tt of cases) {
		/**
		 * Runs a table-driven TextTransformer test case.
		 * Verifies the transform result and delegates specific assertions.
		 */
		test(tt.name, async () => {
			const result = await transformer.transform(tt.input, tt.positionals);

			expect(result.ok).toBeTrue();
			if (!result.ok) {
				expect(result.ok).fail("should return true");
				return;
			}

			tt.assert(result, tt.input);
		});
	}
});
