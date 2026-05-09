import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleStorage", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const storage = await SimpleStorage.deploy();
    return { storage, owner, alice, bob };
  }

  it("stores and retrieves a value for the caller", async () => {
    const { storage, alice } = await deployFixture();
    await storage.connect(alice).set(42);
    expect(await storage.connect(alice).getMine()).to.equal(42n);
    expect(await storage.get(alice.address)).to.equal(42n);
  });

  it("different users have independent storage", async () => {
    const { storage, alice, bob } = await deployFixture();
    await storage.connect(alice).set(100);
    await storage.connect(bob).set(200);
    expect(await storage.get(alice.address)).to.equal(100n);
    expect(await storage.get(bob.address)).to.equal(200n);
  });

  it("defaults to 0 for new addresses", async () => {
    const { storage, alice } = await deployFixture();
    expect(await storage.get(alice.address)).to.equal(0n);
  });

  it("emits ValueSet event", async () => {
    const { storage, alice } = await deployFixture();
    await expect(storage.connect(alice).set(99))
      .to.emit(storage, "ValueSet")
      .withArgs(alice.address, 99n);
  });

  it("overwrites previous value", async () => {
    const { storage, alice } = await deployFixture();
    await storage.connect(alice).set(1);
    await storage.connect(alice).set(999);
    expect(await storage.get(alice.address)).to.equal(999n);
  });
});
