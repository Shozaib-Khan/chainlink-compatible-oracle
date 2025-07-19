// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IAggregatorInterfaceMinimal.sol";

contract OracleConsumer {
    IAggregatorInterfaceMinimal public immutable oracle;

    constructor(address _oracle) {
        oracle = IAggregatorInterfaceMinimal(_oracle);
    }

    function getLatestPrice() external view returns (int256 answer, uint8 decs) {
        answer = oracle.latestAnswer();
        decs = oracle.decimals();
    }
}
