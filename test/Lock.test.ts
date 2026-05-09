import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Lock", function () {
  async function deployLockFixture() {
    const ONE_YEAR = 365 * 24 * 60 * 60;
    const unlockTime = (await time.latest()) + ONE_YEAR;
    const lockedAmount = ethers.parseEther("1");

    const [owner, otherAccount] = await ethers.getSigners();

    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("sets the correct unlock time", async function () {
      const { lock, unlockTime } = await loadFixture(deployLockFixture);
      expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it("sets the owner", async function () {
      const { lock, owner } = await loadFixture(deployLockFixture);
      expect(await lock.owner()).to.equal(owner.address);
    });
  });

  describe("Withdrawals", function () {
    it("reverts if called too soon", async function () {
      const { lock } = await loadFixture(deployLockFixture);
      await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
    });

    it("reverts if called by non-owner", async function () {
      const { lock, unlockTime, otherAccount } = await loadFixture(deployLockFixture);
      await time.increaseTo(unlockTime);
      await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
        "You aren't the owner"
      );
    });

    it("transfers funds to owner after unlock", async function () {
      const { lock, unlockTime, lockedAmount, owner } = await loadFixture(deployLockFixture);
      await time.increaseTo(unlockTime);
      await expect(lock.withdraw()).to.changeEtherBalances(
        [owner, lock],
        [lockedAmount, -lockedAmount]
      );
    });
  });
});
