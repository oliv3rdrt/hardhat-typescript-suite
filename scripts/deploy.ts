import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ONE_YEAR = 365 * 24 * 60 * 60;
  const unlockTime = Math.floor(Date.now() / 1000) + ONE_YEAR;
  const lockedAmount = ethers.parseEther("0.001");

  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  await lock.waitForDeployment();

  console.log(`Lock deployed to: ${await lock.getAddress()}`);
  console.log(`Unlock time: ${new Date(unlockTime * 1000).toISOString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
