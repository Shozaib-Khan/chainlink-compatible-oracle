# Chainlink Oracle Demo System

This project demonstrates how to make a decentralized application (dApp) compatible with Chainlink-style oracles using a minimal Chainlink oracle interface and a custom vault source. It includes example contracts, a feeder, and a consumer, showing how to connect on-chain data to Chainlink-compatible consumers.

## Overview

The system consists of the following smart contracts:

- **DemoVaultSource.sol**: Simulates a vault or pool with a value and shares, providing a price per share calculation.
- **DemoChainlinkOracle.sol**: Implements the minimal Chainlink oracle interface (`IAggregatorInterfaceMinimal`), allowing external contracts to read price data in Chainlink format.
- **OracleFeeder.sol**: Updates the Chainlink oracle with the latest price from the vault source, scaling the value to 8 decimals as expected by Chainlink consumers.
- **OracleConsumer.sol**: Example consumer contract that reads price and decimals from the Chainlink oracle using the minimal interface.
- **IAggregatorInterfaceMinimal.sol**: Minimal interface for Chainlink-compatible oracles, defining `latestAnswer()` and `decimals()`.

## How to Run and Test

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

3. **Run tests**
   ```bash
   npx hardhat test
   ```

4. **Deploy contracts (example script)**
   ```bash
   npx hardhat run scripts/deploy.js
   ```

This will compile, test, and deploy the contracts locally. See `test/oracle-integration.test.js` for integration tests and `scripts/deploy.js` for deployment logic.

## Contract Details

### IAggregatorInterfaceMinimal.sol
Defines the minimal Chainlink oracle interface:
- `latestAnswer()`: Returns the latest price as an `int256`.
- `decimals()`: Returns the number of decimals (typically 8 for Chainlink).

### DemoChainlinkOracle.sol
Implements the minimal Chainlink oracle interface:
- Stores the latest price and decimals.
- Owner-only `setPrice()` to update the price.
- `transferOwnership()` to change the owner.
- `latestAnswer()` and `decimals()` for Chainlink compatibility.

### DemoVaultSource.sol
Simulates a vault or pool:
- `poolValue`: Total value in the vault.
- `totalShares`: Number of shares.
- `getPricePerShare()`: Returns price per share, scaled to 18 decimals.
- `setPoolValue()` and `setTotalShares()` to update values.

### OracleFeeder.sol
Feeds the Chainlink oracle with vault price:
- Reads price per share from the vault.
- Scales price from 18 decimals to 8 decimals (Chainlink format).
- Calls `setPrice()` on the oracle.

### OracleConsumer.sol
Reads price from the Chainlink oracle:
- Uses the minimal interface to get the latest price and decimals.

## How to Make a dApp Chainlink Oracle Compatible

1. **Implement the Chainlink Oracle Interface**
   - Use `IAggregatorInterfaceMinimal` for compatibility.
   - Your oracle contract should implement `latestAnswer()` and `decimals()`.

2. **Feed Data to the Oracle**
   - Use a feeder contract (like `OracleFeeder`) to update the oracle with your dApp's data.
   - Scale your data to the expected decimals (usually 8 for Chainlink).

3. **Consume Oracle Data**
   - Use the minimal interface in consumer contracts to read price and decimals.

4. **Ownership and Security**
   - Restrict `setPrice()` to trusted feeders or owners.
   - Use `transferOwnership()` to delegate update rights.

## Example Workflow

- Deploy `DemoVaultSource` with initial values.
- Deploy `DemoChainlinkOracle` with initial price and decimals.
- Deploy `OracleFeeder` with vault and oracle addresses.
- Transfer oracle ownership to the feeder.
- Call `updateOracle()` on the feeder to sync the oracle with the vault price.
- Consumers can read the price using `OracleConsumer` or directly via the interface.

## Testing

See `test/oracle-integration.test.js` for a full integration test suite covering:
- Vault and oracle initialization
- Feeder updates
- Ownership logic
- Edge cases (zero shares)
- Chainlink compatibility

## Making Your Own dApp Chainlink-Compatible

- Implement the minimal interface in your oracle contract.
- Feed your dApp's data to the oracle, scaling as needed.
- Consumers can use the same interface to read data.

## License
MIT
