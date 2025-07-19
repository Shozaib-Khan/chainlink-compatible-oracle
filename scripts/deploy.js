// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from address:", deployer.address);

  // Deploy DemoVaultSource: poolValue = 250e18, totalShares = 100e18
  const DemoVaultSource = await ethers.getContractFactory("DemoVaultSource", deployer);
  const poolValue = ethers.parseUnits("250", 18);      // 250e18
  const totalShares = ethers.parseUnits("100", 18);    // 100e18
  const vault = await DemoVaultSource.deploy(poolValue, totalShares);
  await vault.waitForDeployment();
  console.log("DemoVaultSource deployed to:", vault.target);

  // Deploy DemoChainlinkOracle with initial price 0, decimals 8
  const DemoChainlinkOracle = await ethers.getContractFactory("DemoChainlinkOracle", deployer);
  const oracle = await DemoChainlinkOracle.deploy(0, 8);
  await oracle.waitForDeployment();
  console.log("DemoChainlinkOracle deployed to:", oracle.target);

  // Deploy OracleFeeder
  const OracleFeeder = await ethers.getContractFactory("OracleFeeder", deployer);
  const feeder = await OracleFeeder.deploy(vault.target, oracle.target);
  await feeder.waitForDeployment();
  console.log("OracleFeeder deployed to:", feeder.target);

  // Debug: Show deployer and oracle owner addresses
  console.log("Deployer address:", deployer.address);
  console.log("Oracle owner address:", await oracle.owner());

  // Deploy OracleConsumer
  const OracleConsumer = await ethers.getContractFactory("OracleConsumer", deployer);
  const consumer = await OracleConsumer.deploy(oracle.target);
  await consumer.waitForDeployment();
  console.log("OracleConsumer deployed to:", consumer.target);

  // Transfer oracle ownership to feeder
  await oracle.connect(deployer).transferOwnership(feeder.target);
  console.log("Transferred oracle ownership to feeder:", feeder.target);

  // Update the oracle via feeder
  console.log("Updating oracle via feeder...");
  await feeder.connect(deployer).updateOracle();
  const latest = await oracle.latestAnswer();
  console.log("Latest oracle price (8 decimals):", latest.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
