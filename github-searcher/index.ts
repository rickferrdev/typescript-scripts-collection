/**
 * Base URL for GitHub user resources.
 */
const ApiGithubUsersURL: string = "https://api.github.com/users";

/**
 * Base URL for GitHub repository resources.
 */
const ApiGithubRepositoryURL: string = "https://api.github.com/repos";

/**
 * GitHub authentication token loaded from Bun environment variables.
 *
 * This token is used to authenticate requests against the GitHub API when
 * available.
 */
const ApiGithubToken: string = Bun.env.GITHUB_TOKEN;

/**
 * Minimal representation of a GitHub user returned by this gateway.
 */
type User = {
	/**
	 * Unique GitHub user identifier.
	 */
	id: number;
};

/**
 * Minimal representation of a GitHub repository returned by this gateway.
 */
type Repository = {
	/**
	 * Unique GitHub repository identifier.
	 */
	id: number;
};

/**
 * Minimal representation of a GitHub commit returned by this gateway.
 */
type Commit = {
	/**
	 * API URL for the commit resource.
	 */
	url: string;
};

/**
 * Function signature used to perform HTTP requests.
 *
 * This type makes the gateway easier to test because a custom fetch function
 * can be injected instead of using the global `fetch`.
 */
type Fetcher = (
	input: string | URL | Request,
	init?: RequestInit,
) => Promise<Response>;

/**
 * Contract for GitHub search operations.
 *
 * Implementations of this interface should provide methods for finding users,
 * repositories, and commits through the GitHub API.
 */
export interface GithubSearch {
	/**
	 * Finds a GitHub user by username.
	 *
	 * @param username - GitHub username to search for.
	 * @returns The user data when found, `null` when not found, or an `Error`
	 * when the request fails.
	 */
	findUser(username: string): Promise<User | Error | null>;

	/**
	 * Finds a GitHub repository by owner and repository name.
	 *
	 * @param username - GitHub username or organization that owns the repository.
	 * @param repository - Repository name.
	 * @returns The repository data when found, `null` when not found, or an
	 * `Error` when the request fails.
	 */
	findRepository(
		username: string,
		repository: string,
	): Promise<Repository | Error | null>;

	/**
	 * Finds commits from a GitHub repository.
	 *
	 * @param username - GitHub username or organization that owns the repository.
	 * @param repository - Repository name.
	 * @param committer - Optional committer username used to filter commits.
	 * @returns A list of commits when found, `null` when not found, or an
	 * `Error` when the request fails.
	 */
	findCommits(
		username: string,
		repository: string,
		committer?: string,
	): Promise<Commit[] | Error | null>;
}

/**
 * GitHub API gateway implementation.
 *
 * This class wraps calls to the GitHub REST API and exposes small methods for
 * fetching users, repositories, and commits.
 *
 * The gateway accepts a custom fetch function, which allows tests to mock
 * network requests without calling the real GitHub API.
 */
export class GithubGateway implements GithubSearch {
	/**
	 * Creates a new GitHub gateway.
	 *
	 * @param fetchFN - Function used to perform HTTP requests. Defaults to the
	 * global `fetch`.
	 * @param token - GitHub token used to authenticate API requests.
	 */
	constructor(
		private readonly fetchFN: Fetcher = fetch,
		private readonly token: string,
	) {}

	/**
	 * Performs a raw request to the GitHub API.
	 *
	 * This method configures GitHub-specific headers, optionally adds an
	 * authorization header, executes the HTTP request, and converts request
	 * failures into `Error` objects.
	 *
	 * @param url - GitHub API URL to request.
	 * @returns The successful `Response`, or an `Error` when the request fails.
	 */
	protected async request(url: string): Promise<Response | Error> {
		const headers = new Headers();

		/**
		 * Request JSON responses using GitHub's recommended media type.
		 */
		headers.set("Accept", "application/vnd.github+json");

		/**
		 * GitHub API version used by this gateway.
		 */
		headers.set("X-GitHub-Api-Version", "2026-03-10");

		/**
		 * User agent required/recommended for GitHub API requests.
		 */
		headers.set("User-Agent", "rickferrdev-app");

		/**
		 * Add authentication when a token is available.
		 */
		if (this.token) {
			headers.set("Authorization", `Bearer ${ApiGithubToken}`);
		}

		try {
			/**
			 * Encode the URL before sending it to avoid invalid URL characters.
			 */
			const response = await this.fetchFN(encodeURI(url), { headers });

			/**
			 * Convert unsuccessful HTTP responses into errors.
			 */
			if (!response.ok) {
				return new Error(
					`github api request failed with status '${response.statusText}': ${await response.text()}`,
				);
			}

			return response;
		} catch (err) {
			/**
			 * Convert network/runtime failures into controlled errors.
			 */
			if (err instanceof Error) {
				return new Error("network error while calling github api", {
					cause: err,
				});
			}

			return new Error("unknown error while calling github api");
		}
	}

	/**
	 * Finds a GitHub user by username.
	 *
	 * @param username - GitHub username to search for.
	 * @returns The user data when found, `null` when not found, or an `Error`
	 * when the request fails.
	 */
	async findUser(username: string): Promise<User | Error | null> {
		const response = await this.request(`${ApiGithubUsersURL}/${username}`);

		if (response === null) {
			return null;
		}

		if (response instanceof Error) {
			return new Error(
				`internal error while processing the request: ${response.message}}`,
			);
		}

		if (response.status === 404 || response === null) {
			return null;
		}

		return (await response.json()) as User;
	}

	/**
	 * Finds a GitHub repository by owner and repository name.
	 *
	 * @param username - GitHub username or organization that owns the repository.
	 * @param repository - Repository name.
	 * @returns The repository data when found, `null` when not found, or an
	 * `Error` when the request fails.
	 */
	async findRepository(
		username: string,
		repository: string,
	): Promise<Repository | Error | null> {
		const response = await this.request(
			encodeURI(`${ApiGithubRepositoryURL}/${username}/${repository}`),
		);

		if (response instanceof Error) {
			return new Error(
				`internal error while processing the request: ${response.message}}`,
			);
		}

		if (response.status === 404 || response === null) {
			return null;
		}

		return (await response.json()) as Repository;
	}

	/**
	 * Finds commits from a GitHub repository.
	 *
	 * When `committer` is provided, the request filters commits by the given
	 * committer username.
	 *
	 * @param username - GitHub username or organization that owns the repository.
	 * @param repository - Repository name.
	 * @param committer - Optional committer username used to filter commits.
	 * @returns A list of commits when found, `null` when not found, or an
	 * `Error` when the request fails.
	 */
	async findCommits(
		username: string,
		repository: string,
		committer?: string,
	): Promise<Commit[] | Error | null> {
		let url = `${ApiGithubRepositoryURL}/${username}/${repository}/commits`;

		if (typeof committer !== "undefined") url = `${url}?committer=${committer}`;

		const response = await this.request(url);

		if (response instanceof Error) {
			return new Error(
				`internal error while processing the request: ${response.message}}`,
			);
		}

		if (response.status === 404 || response === null) {
			return null;
		}

		return (await response.json()) as Commit[];
	}
}
