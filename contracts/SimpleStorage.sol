// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleStorage {
    mapping(address => uint256) private _store;

    event ValueSet(address indexed user, uint256 value);

    function set(uint256 value) external {
        _store[msg.sender] = value;
        emit ValueSet(msg.sender, value);
    }

    function get(address user) external view returns (uint256) {
        return _store[user];
    }

    function getMine() external view returns (uint256) {
        return _store[msg.sender];
    }
}
