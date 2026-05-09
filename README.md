# Hardhat - Personal Playground

Explored [Hardhat](https://hardhat.org) - the JS/TS Ethereum dev environment with the largest plugin ecosystem. Went through the official tutorial and pushed further into TypeChain and gas reporting.

## What I explored

- **Compilation & deployment scripts** with ethers.js v6
- **TypeChain** - auto-generated typed contract bindings, zero runtime surprises
- **hardhat-gas-reporter** - per-function gas cost table on every test run
- **hardhat-deploy** - deterministic deployments with named accounts
- **Mainnet forking** - `hardhat node --fork` for integration tests against real state
- **Console.log in Solidity** - `import "hardhat/console.sol"` for in-test debugging

## Setup

```bash
npm install
npx hardhat compile
npx hardhat test
npx hardhat node         # local chain
npx hardhat run scripts/deploy.ts --network localhost
```

## Plugin stack I settled on

```
hardhat-gas-reporter
@nomicfoundation/hardhat-toolbox  (includes ethers, waffle, typechain, coverage)
hardhat-deploy
dotenv
```

## Key takeaways

- TypeChain removes an entire class of runtime errors - non-negotiable for TypeScript projects
- The plugin ecosystem is unmatched - if you need it, there's a plugin
- Gas reporter should be on from day one, not added later when you have a regression
- Hardhat's error messages and stack traces are genuinely good at pointing to the right line
