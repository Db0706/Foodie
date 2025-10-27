// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TasteToken
 * @dev ERC-20 token for rewarding users in the Foodie dApp
 * Symbol: TASTE
 * Decimals: 18
 * Initial Supply: 1,000,000,000 (1 billion)
 */
contract TasteToken is ERC20, Ownable {
    // Address authorized to mint tokens (TasteRewarder contract)
    address public minter;

    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    constructor(address initialOwner) ERC20("Taste Token", "TASTE") Ownable(initialOwner) {
        // Mint initial supply to owner
        _mint(initialOwner, 1_000_000_000 * 10**18);
    }

    /**
     * @dev Set the authorized minter address (should be TasteRewarder contract)
     * @param _minter Address of the minter contract
     */
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "TasteToken: minter cannot be zero address");
        address oldMinter = minter;
        minter = _minter;
        emit MinterUpdated(oldMinter, _minter);
    }

    /**
     * @dev Mint new tokens - only callable by authorized minter
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "TasteToken: caller is not the minter");
        require(to != address(0), "TasteToken: mint to zero address");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
