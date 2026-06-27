# TypeScript Scripts Collection

A personal collection of scripts built to explore TypeScript, Bun, and the surrounding JavaScript/TypeScript ecosystem.

The project contains small independent components focused on practical usage, experimentation, and progressive improvement.

## Components

### `github-searcher`

A small GitHub API gateway for searching users, repositories, and commits.

Main features:

- Find a GitHub user by username
- Find a repository by owner and name
- List commits from a repository
- Filter commits by committer
- Use a custom `fetch` function for tests

### `text-transformer`

A simple text transformation CLI.

Main features:

- Read text from an input file
- Apply transformation actions
- Write the result to an output file
- Support actions such as uppercase, lowercase, replace, and includes

## Project Structure

```txt
.
├── docs
│   ├── README.md
│   └── README.pt-BR.md
├── github-searcher
│   ├── index.spec.ts
│   ├── index.ts
│   └── README.md
└── text-transformer
    ├── src
    ├── index.ts
    └── README.md
```

## Requirements

* Bun
* TypeScript

## Running

Each component has its own README with specific usage examples.

Example:

```bash
cd text-transformer
bun index.ts -i input.txt -o output.txt uppercase
```

## Testing

Some components include tests using Bun's test runner.

```bash
bun test
```

## Notes

This repository is organized as a collection of independent scripts. Each module can evolve separately and may have its own API, CLI, tests, and documentation.

# LICENSE

See more [LICENSE](../LICENSE)
