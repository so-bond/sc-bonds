## What's inside?

Bond smart contracts based on so|bond model.
This Turborepo includes the following implementations, tests, and packages:

### Implementations

- `vanilla`: the normal implementation of the so|bond
- `diamond`: the diamond implementation of the so|bond

## Tests

- `solc`: the orginal tests for the so|bond
- `hardhat`: the new tests for the so|bond using hardhat

### Packages

- `tsconfig`: `base.json` used throughout the monorepo

## Getting Started

### Install Turbo

`pnpm install turbo --global`

### Compile

To Compile all implementations, run the following command:

```
pnpm build
```

### Tests

To run test , run the following command:

```
pnpm test
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
