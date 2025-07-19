const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chainlink Oracle Demo System", function () {
  let DemoVaultSource, DemoChainlinkOracle, OracleFeeder, OracleConsumer;
  let vault, oracle, feeder, consumer, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    DemoVaultSource = await ethers.getContractFactory("DemoVaultSource");
    DemoChainlinkOracle = await ethers.getContractFactory("DemoChainlinkOracle");
    OracleFeeder = await ethers.getContractFactory("OracleFeeder");
    OracleConsumer = await ethers.getContractFactory("OracleConsumer");

    vault = await DemoVaultSource.deploy(
      ethers.parseUnits("250", 18), // poolValue ($250)
      ethers.parseUnits("100", 18)  // totalShares (100)
    );
    await vault.waitForDeployment();

    oracle = await DemoChainlinkOracle.deploy(
      0, // starting price
      8  // Chainlink decimal style
    );
    await oracle.waitForDeployment();

    feeder = await OracleFeeder.deploy(vault.target, oracle.target);
    await feeder.waitForDeployment();

    consumer = await OracleConsumer.deploy(oracle.target);
    await consumer.waitForDeployment();

    // Do not transfer ownership here; do it in relevant tests only
  });

  it("Vault and oracle start with expected values", async () => {
    expect(await vault.poolValue()).to.eq(ethers.parseUnits("250", 18));
    expect(await vault.totalShares()).to.eq(ethers.parseUnits("100", 18));
    expect(await oracle.latestAnswer()).to.eq(0);
    expect(await oracle.decimals()).to.eq(8);
  });

  it("Feeder updates oracle from vault logic", async () => {
    await oracle.transferOwnership(feeder.target);
    // poolValue 250, totalShares 100, so price per share = 2.5e18
    // Oracle expects 8 decimals: 2.5e18 / 1e10 = 2.5e8

    await feeder.updateOracle();

    const price = await oracle.latestAnswer();
    expect(price).to.equal(250000000n); // 2.5e8

    // Update vault value to $1000, so price/share = 10e18, oracle = 1e9
    await vault.setPoolValue(ethers.parseUnits("1000", 18));
    await feeder.updateOracle();
    expect(await oracle.latestAnswer()).to.equal(1000000000n); // 1e9
  });

  it("Anyone can read price via consumer", async () => {
    await oracle.transferOwnership(feeder.target);
    await feeder.updateOracle();
    const [price, decs] = await consumer.getLatestPrice();
    expect(price).to.equal(250000000n); // 2.5e8
    expect(decs).to.equal(8);
  });

  it("Owner can set price directly for manual feeds", async () => {
    // Do not transfer ownership; deployer is owner
    await oracle.setPrice(100123456);
    const val = await oracle.latestAnswer();
    expect(val).to.equal(100123456);
  });

  it("Vault logic: getPricePerShare returns correct scaled value", async () => {
    await oracle.transferOwnership(feeder.target);
    // Change shares to simulate split
    await vault.setTotalShares(ethers.parseUnits("25", 18)); // poolValue 250, shares 25, so price/share = 10e18
    expect(await vault.getPricePerShare()).to.eq(ethers.parseUnits("10", 18));

    await feeder.updateOracle();
    expect(await oracle.latestAnswer()).to.equal(1000000000n); // 1e9
  });

  it("Decimals are always 8 in oracle and consumer", async () => {
    expect(await oracle.decimals()).to.equal(8);
    expect((await consumer.getLatestPrice())[1]).to.equal(8);
  });

  // Extra: edge case
  it("Returns zero if no shares (prevents division by zero)", async () => {
    await oracle.transferOwnership(feeder.target);
    await vault.setTotalShares(0);
    expect(await vault.getPricePerShare()).to.equal(0);
    await feeder.updateOracle();
    expect(await oracle.latestAnswer()).to.equal(0);
  });

  // Extra: only owner can set price
  it("Only owner can set price on oracle", async () => {
    await expect(
      oracle.connect(user).setPrice(12345678)
    ).to.be.revertedWith("Not owner");
  });

  // Extra: price follows vault source after updates
  it("Oracle always reflects vault source after updates", async () => {
    await oracle.transferOwnership(feeder.target);
    for (let i = 1; i < 5; i++) {
      await vault.setPoolValue(ethers.parseUnits((i * 123).toString(), 18));
      await vault.setTotalShares(ethers.parseUnits("50", 18));
      await feeder.updateOracle();
      // Get price per share from vault and scale as oracle does
      let pricePerShare = await vault.getPricePerShare();
      let expected = BigInt(pricePerShare) / 10000000000n;
      expect(await oracle.latestAnswer()).to.equal(expected);
    }
    // After the loop, check the final value explicitly
    let pricePerShare = await vault.getPricePerShare();
    let finalExpected = BigInt(pricePerShare) / 10000000000n;
    expect(await oracle.latestAnswer()).to.equal(finalExpected);
  });
});
