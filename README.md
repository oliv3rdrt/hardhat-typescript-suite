# hardhat-typescript-suite

TypeScript Hardhat workspace with TypeChain bindings, gas reporter, fixtures, console logging from Solidity, and mainnet forking.

## Stack

- Hardhat 2.22
- TypeScript 5.x
- Solidity 0.8.24
- TypeChain, hardhat-gas-reporter, ethers v6

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x LTS (18.x and 22.x work, 23+ shows a startup warning) |
| npm | 9+ |

## Quick start

```bash
npm install
npx hardhat compile
npx hardhat test
```

Expected: 10 tests passing across `Lock.test.ts` and `SimpleStorage.test.ts`.

## What's in here

| File | Purpose |
|------|---------|
| `contracts/Lock.sol` | Time-locked withdrawals with owner check |
| `contracts/SimpleStorage.sol` | Per-address key-value storage with events |
| `test/*.test.ts` | Fixture-based tests using `loadFixture` |
| `hardhat.config.ts` | Networks, gas reporter, TypeChain setup |
| `scripts/deploy.ts` | TypeScript deploy script |

## Mainnet forking

Set `MAINNET_RPC_URL` in `.env`, then:

```bash
npx hardhat test --network hardhat
```

Tests run against a fork of mainnet at the latest block.

## Gas report

```bash
REPORT_GAS=true npx hardhat test
```
