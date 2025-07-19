// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DemoVaultSource {
    uint256 public poolValue;
    uint256 public totalShares;

    constructor(uint256 _poolValue, uint256 _totalShares) {
        poolValue = _poolValue;
        totalShares = _totalShares;
    }

    function setPoolValue(uint256 v) external { poolValue = v; }
    function setTotalShares(uint256 v) external { totalShares = v; }

    function getPricePerShare() external view returns (uint256) {
        if (totalShares == 0) return 0;
        return poolValue * 1e18 / totalShares;
    }
}
