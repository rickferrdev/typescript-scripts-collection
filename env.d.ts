declare global {
	namespace Bun {
		interface Env {
			GITHUB_TOKEN: string;
		}
	}
}

export {};
