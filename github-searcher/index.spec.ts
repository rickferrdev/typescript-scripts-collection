import { describe, expect, mock, test } from "bun:test";
import { GithubGateway } from ".";

describe("GithubGateway", () => {
	test("findUser should return a user without errors", async () => {
		const fetchMOCK = mock(async (): Promise<Response> => {
			return new Response(
				JSON.stringify({
					id: 1,
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		});

		const github = new GithubGateway(fetchMOCK, Bun.env.GITHUB_TOKEN);
		const user = await github.findUser("rickferrdev");

		expect(user).not.toBeInstanceOf(Error);
		expect(user).not.toBeNull();
		expect(fetchMOCK).toBeCalledTimes(1);

		if (user === null || user instanceof Error) {
			expect(user).fail("expected user, received null or Error");
			return;
		}

		expect(user.id).toBe(1);
		return;
	});
	test("findRepository should return a repository without error.", async () => {
		const fetchMOCK = mock(async (): Promise<Response> => {
			return new Response(
				JSON.stringify({
					id: 1,
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		});

		const github = new GithubGateway(fetchMOCK, Bun.env.GITHUB_TOKEN);
		const repository = await github.findRepository(
			"rickferrdev",
			"rickferrdev",
		);

		expect(repository).not.toBeInstanceOf(Error);
		expect(repository).not.toBeNull();
		expect(fetchMOCK).toBeCalledTimes(1);

		if (repository === null || repository instanceof Error) {
			expect(repository).fail("expected repository, received null or error");
			return;
		}

		expect(repository.id).toBe(1);
		return;
	});
	test("findCommits should return a list of commits without errors", async () => {
		const fetchMOCK = mock(async (): Promise<Response> => {
			return new Response(
				JSON.stringify([
					{
						url: "https://api.github.com",
					},
				]),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		});

		const github = new GithubGateway(fetchMOCK, Bun.env.GITHUB_TOKEN);
		const commits = await github.findCommits(
			"rickferrdev",
			"rickferrdev",
			"rickferrdev",
		);

		expect(commits).not.toBeInstanceOf(Error);
		expect(commits).not.toBeNull();
		expect(commits).toBeArray();
	});
});
