```
  __  __               __ __        __ 
 / / / /__ _________ _/ // /_  ___ / /_
/ /_/ / _ `/ __/ _ `/ _  / _ \/ _ `/ __/
\____/\_,_/_/  \_,_/_//_/_//_/\_,_/\__/ 

  TypeScript · Plugins · Hot Reload
```

[![CI](https://github.com/DRT23-mod/hardhat-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/DRT23-mod/hardhat-playground/actions)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow.svg)](https://hardhat.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://docs.soliditylang.org/)

A pragmatic Hardhat workspace that exercises the parts of the toolkit you
actually use day to day: TypeChain bindings, the gas reporter, fixtures, console
logging from Solidity, and mainnet forking. Two contracts, ten passing tests.

---

## Table of Contents

- [What is Hardhat](#what-is-hardhat)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [The contracts](#the-contracts)
- [The plugin stack](#the-plugin-stack)
- [Scripts](#scripts)
- [Test patterns](#test-patterns)
- [Mainnet forking](#mainnet-forking)
- [Configuration](#configuration)
- [Hardhat vs Foundry](#hardhat-vs-foundry)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## What is Hardhat

A JavaScript / TypeScript Ethereum development environment with the deepest
plugin ecosystem in the space. Strengths: TypeChain integration, ergonomic
TypeScript APIs, easy interop with the Node.js world. Weaknesses: slower than
Foundry on cold runs, tests are written in TS while contracts are in Solidity.

## Prerequisites

| Tool    | Version            | Notes                                        |
|---------|--------------------|----------------------------------------------|
| Node.js | 20.x LTS           | 18.x works, 22.x is fine, **Node 23+ prints a warning** |
| npm     | 9+                 | Yarn or pnpm work too                        |
| Git     | any                |                                              |

> Hardhat checks the Node version at startup and warns if it does not recognise
> it. The warning is not fatal but newer Node versions occasionally surface
> bugs in EDR (the EVM runtime).

## Quick start

```bash
git clone https://github.com/DRT23-mod/hardhat-playground.git
cd hardhat-playground
npm install
npx hardhat compile
npx hardhat test
```

Expected:

```
  Lock
    Deployment
      ✔ sets the correct unlock time
      ✔ sets the owner
    Withdrawals
      ✔ reverts if called too soon
      ✔ reverts if called by non-owner
      ✔ transfers funds to owner after unlock
  SimpleStorage
    ✔ stores and retrieves a value for the caller
    ✔ different users have independent storage
    ✔ defaults to 0 for new addresses
    ✔ emits ValueSet event
    ✔ overwrites previous value

  10 passing
```

## Project structure

```
hardhat-playground/
├── contracts/
│   ├── Lock.sol              # time-locked single-owner withdrawal vault
│   └── SimpleStorage.sol     # per-address scratch storage with events
├── scripts/
│   └── deploy.ts             # deploys Lock with 1-year unlock
├── test/
│   ├── Lock.test.ts          # fixture, time travel, balance assertions
│   └── SimpleStorage.test.ts # multi-signer, event matchers
├── .github/workflows/ci.yml  # compile + test + typecheck + gas
├── hardhat.config.ts         # 0.8.24, networks, gas reporter, etherscan
├── tsconfig.json
├── package.json
└── README.md
```

## The contracts

### `Lock.sol`

The classic time-locked withdrawal contract. Demonstrates `payable` constructors,
`require` checks, events, and `hardhat/console.sol` for in-test logging.

### `SimpleStorage.sol`

Per-caller scratch storage. Used to demonstrate event matchers and multi-signer
testing. Each user has independent storage keyed by `msg.sender`.

## The plugin stack

Bundled via `@nomicfoundation/hardhat-toolbox`:

| Plugin                                | What it gives you                       |
|---------------------------------------|-----------------------------------------|
| `@nomicfoundation/hardhat-ethers`     | Ethers v6 globals (`ethers.getSigners`) |
| `@nomicfoundation/hardhat-chai-matchers` | `to.be.revertedWithCustomError`, `to.changeEtherBalances` |
| `@typechain/hardhat`                  | Auto-generated typed contract bindings  |
| `@nomicfoundation/hardhat-network-helpers` | `time.increase`, `loadFixture`     |
| `solidity-coverage`                   | LCOV coverage with `npx hardhat coverage` |
| `hardhat-gas-reporter`                | Gas-per-function table during tests     |

## Scripts

| Command                                       | What it does                          |
|-----------------------------------------------|---------------------------------------|
| `npm run compile` / `npx hardhat compile`     | Compile + regenerate TypeChain types  |
| `npm test` / `npx hardhat test`               | Run the full TS test suite            |
| `npm run test:gas` / `REPORT_GAS=true npm test`| Run with the gas reporter             |
| `npm run coverage`                            | Solidity test coverage                |
| `npm run node`                                | Local Hardhat node on `:8545`         |
| `npm run node:fork`                           | Hardhat node forking mainnet          |
| `npm run deploy:local`                        | Deploy `Lock` to local node           |
| `npm run deploy:sepolia`                      | Deploy `Lock` to Sepolia              |

## Test patterns

### Fixtures (fast resets)

`loadFixture` snapshots state once and rolls back between tests:

```ts
async function deployLockFixture() {
  const ONE_YEAR = 365 * 24 * 60 * 60;
  const unlockTime = (await time.latest()) + ONE_YEAR;
  const lock = await ethers.deployContract("Lock", [unlockTime], { value: 1n });
  return { lock, unlockTime };
}

it("reverts if called too soon", async () => {
  const { lock } = await loadFixture(deployLockFixture);
  await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
});
```

### Time travel

```ts
await time.increaseTo(unlockTime);
```

### Balance assertions (chai matchers)

```ts
await expect(lock.withdraw()).to.changeEtherBalances(
  [owner, lock],
  [lockedAmount, -lockedAmount]
);
```

### Multi-signer

```ts
const [owner, alice, bob] = await ethers.getSigners();
await storage.connect(alice).set(42);
expect(await storage.connect(alice).getMine()).to.equal(42n);
```

### Event matchers

```ts
await expect(storage.connect(alice).set(99))
  .to.emit(storage, "ValueSet")
  .withArgs(alice.address, 99n);
```

## Mainnet forking

Set `MAINNET_RPC_URL` and run:

```bash
FORK=true npx hardhat node
```

The local node now has the full state of mainnet at the latest block. Useful
for testing against deployed protocols (Uniswap, Aave, etc.) without writing
mocks.

## Configuration

`hardhat.config.ts` exposes:

| Section          | Notes                                                 |
|------------------|-------------------------------------------------------|
| `solidity`       | 0.8.24                                                |
| `networks.sepolia` | Reads `SEPOLIA_RPC_URL` and `PRIVATE_KEY` from env  |
| `networks.hardhat` | Optional fork via `FORK=true`                       |
| `gasReporter`    | Always enabled, USD pricing if `CMC_API_KEY` is set   |
| `etherscan`      | `ETHERSCAN_API_KEY` for `npx hardhat verify`          |

Required env vars for non-local work:

```
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<key>
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<key>
PRIVATE_KEY=0x<deployer-key>
ETHERSCAN_API_KEY=<key>
CMC_API_KEY=<optional, for USD gas pricing>
```

## Hardhat vs Foundry

```
                 │ Hardhat                 │ Foundry
─────────────────┼─────────────────────────┼──────────────────────
 Test language   │ TS / JS                 │ Solidity
 Speed (cold)    │ slower                  │ near-instant
 Plugins         │ huge ecosystem          │ small but enough
 TypeChain       │ first-class             │ not needed (no JS)
 Ethers v6 API   │ first-class             │ not relevant
 console.log     │ Solidity + JS           │ Solidity only
 Mainnet fork    │ supported, slower       │ supported, faster
 Gas snapshots   │ via gas-reporter        │ `forge snapshot`
 Coverage        │ `solidity-coverage`     │ `forge coverage`
```

A reasonable production setup uses Foundry for unit and invariant tests, and
Hardhat for deployment scripts and TypeScript-heavy frontends.

## Troubleshooting

**`error TS5109: Option 'moduleResolution' must be set to 'NodeNext'`**
Add `tsconfig.json` to the project root or set `module: commonjs` and
`moduleResolution: node` if you do not need ESM.

**`HH601: There is no Hardhat config file`**
You ran `npx hardhat compile` from a parent directory. `cd` into the project.

**`transaction from mismatch` on `staticCall({ from: ... })`**
Ethers v6 dropped the `from` option on `staticCall`. Use
`contract.connect(signer).method.staticCall()` instead.

## References

- [Hardhat docs](https://hardhat.org/docs)
- [Hardhat tutorial](https://hardhat.org/tutorial)
- [Network helpers](https://hardhat.org/hardhat-network-helpers/docs/reference)
- [Chai matchers](https://hardhat.org/hardhat-chai-matchers/docs/reference)

## License

MIT
