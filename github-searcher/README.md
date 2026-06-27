# GitHub Searcher

Small GitHub API gateway for searching users, repositories, and commits.

## Features

- Find a GitHub user by username
- Find a repository by owner and name
- List commits from a repository
- Filter commits by committer
- Inject a custom `fetch` function for tests

## Usage

```ts
import { GithubGateway } from "./github-searcher";

const github = new GithubGateway(fetch, Bun.env.GITHUB_TOKEN);

const user = await github.findUser("octocat");

if (user instanceof Error) {
	console.error(user.message);
} else if (user === null) {
	console.log("User not found");
} else {
	console.log(user.id);
}
````

## API

### `findUser(username)`

Finds a GitHub user.

```ts
const user = await github.findUser("octocat");
```

Returns:

```ts
Promise<User | Error | null>
```

---

### `findRepository(username, repository)`

Finds a repository by owner and repository name.

```ts
const repository = await github.findRepository("octocat", "Hello-World");
```

Returns:

```ts
Promise<Repository | Error | null>
```

---

### `findCommits(username, repository, committer?)`

Lists commits from a repository.

```ts
const commits = await github.findCommits("octocat", "Hello-World");
```

With committer filter:

```ts
const commits = await github.findCommits("octocat", "Hello-World", "octocat");
```

Returns:

```ts
Promise<Commit[] | Error | null>
```

## Return Pattern

All methods return one of three possible values:

| Value   | Meaning                |
| ------- | ---------------------- |
| Data    | Request succeeded      |
| `null`  | Resource was not found |
| `Error` | Request failed         |

Example:

```ts
const result = await github.findRepository("octocat", "Hello-World");

if (result instanceof Error) {
	console.error(result.message);
	return;
}

if (result === null) {
	console.log("Repository not found");
	return;
}

console.log(result.id);
```

## Testing

You can pass a custom `fetch` function to mock GitHub responses.

```ts
const fetchMock = async (): Promise<Response> => {
	return new Response(JSON.stringify({ id: 1 }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

const github = new GithubGateway(fetchMock, "token");

const user = await github.findUser("octocat");
```

## Types

```ts
type User = {
	id: number;
};

type Repository = {
	id: number;
};

type Commit = {
	url: string;
};
```
