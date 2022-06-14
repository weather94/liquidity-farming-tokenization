//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity >=0.7.0;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./LFProduct.sol";


// This is the main building block for smart contracts.
contract LFProductFactory is Ownable {

    struct Product {
        uint poolId;
        LFProduct product;
    }

    Product[] public products;
    address public miniChefAddress;

    constructor(address miniChefAddress_) {
        // The totalSupply is assigned to transaction sender, which is the account
        // that is deploying the contract.
        miniChefAddress = miniChefAddress_;
    }

    function createProduct(uint poolId, address tokenAddress, string memory name_, string memory symbol_) onlyOwner public {
        LFProduct lfProduct = new LFProduct(poolId, tokenAddress, miniChefAddress, name_, symbol_);

        products.push(Product({
            poolId: poolId,
            product: lfProduct 
        }));
    }

    function productLength() view public returns (uint) {
        return products.length;
    }
}
