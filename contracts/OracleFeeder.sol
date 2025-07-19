// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DemoVaultSource.sol";
import "./DemoChainlinkOracle.sol";

contract OracleFeeder {
    DemoVaultSource public immutable vaultSource;
    DemoChainlinkOracle public immutable oracle;

    constructor(address _vaultSource, address _oracle) {
        vaultSource = DemoVaultSource(_vaultSource);
        oracle = DemoChainlinkOracle(_oracle);
    }

    // Updates the Chainlink oracle using the vault's price logic
    function updateOracle() external {
        uint256 price = vaultSource.getPricePerShare();
        // Set oracle price with 8 decimals (Chainlink style): price is 18 decimals, so divide by 1e10.
        oracle.setPrice(int256(price / 1e10));
    }
}
