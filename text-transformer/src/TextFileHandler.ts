import type TextTransformer from "./TextTransformer";

export default class TextFileHandler {
	constructor(
		private inputFilePath: string,
		private outputFilePath: string | undefined,
		private positionals: string[],
		private transformer: TextTransformer,
	) {}

	/**
	 * Reads the input file, applies the configured text transformations,
	 * prints handler outputs, and optionally writes the transformed text.
	 */
	async run(): Promise<Error | null> {
		const file = Bun.file(this.inputFilePath);
		if (!(await file.exists())) {
			return new Error(`input file not found: ${this.inputFilePath}`);
		}

		let text: string;
		try {
			text = await file.text();
		} catch (error) {
			return new Error(
				`failed to read input file: ${this.inputFilePath}: ${
					error instanceof Error ? error.message : "unknown error"
				}`,
			);
		}

		const res = await this.transformer.transform(text, this.positionals);
		if (!res.ok) {
			return res.error;
		}

		if (typeof res.data.outputs !== "undefined") {
			for (const output of res.data.outputs) {
				console.info(output.value);
			}
		}

		if (typeof this.outputFilePath !== "undefined") {
			try {
				await Bun.write(this.outputFilePath, res.data.text);
			} catch (error) {
				return new Error(
					`failed to write in ${this.outputFilePath}: ${
						error instanceof Error ? error.message : "unknown error"
					}`,
				);
			}
		}

		return null;
	}
}
