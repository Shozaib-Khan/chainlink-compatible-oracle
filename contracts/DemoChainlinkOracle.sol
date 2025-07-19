// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IAggregatorInterfaceMinimal.sol";

contract DemoChainlinkOracle is IAggregatorInterfaceMinimal {
    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Not owner");
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
    int256 private value;
    uint8  private immutable _decimals;
    address public owner;

    constructor(int256 initialValue, uint8 decimals_) {
        value = initialValue;
        _decimals = decimals_;
        owner = msg.sender;
    }

    function setPrice(int256 newValue) external {
        require(msg.sender == owner, "Not owner");
        value = newValue;
    }

    function latestAnswer() external view override returns (int256) {
        return value;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }
}
