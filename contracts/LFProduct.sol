//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity >=0.7.0;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LFProductFactory.sol";
import "./interface/IUniswapV2Pair.sol";
import "./LFERC20.sol";
import "./MiniChefV2.sol";


// This is the main building block for smart contracts.
contract LFProduct {
    // Some string type variables to identify the token.
    uint poolId;
    uint public RATIO_PRECISON = 1e12;
    LFProductFactory factory;
    IUniswapV2Pair public poolToken;
    LFERC20 public lfToken;
    MiniChefV2 public miniChef;

    constructor(uint poolId_, address poolToken_, address miniChefAddress_, string memory name_, string memory symbol_) {
        poolId = poolId_;
        miniChef = MiniChefV2(miniChefAddress_);
        factory = LFProductFactory(msg.sender);
        lfToken = new LFERC20(name_, symbol_);
        poolToken = IUniswapV2Pair(poolToken_);
    }

    function mint(uint amount) public {
        poolToken.transferFrom(msg.sender, address(this), amount);

        uint totalDepsoitAmount = miniChef.userInfo(poolId, address(this)).amount;
        uint mintAmount;
        if (totalDepsoitAmount > 0) {
            uint ratio = (RATIO_PRECISON * amount) / totalDepsoitAmount;
            mintAmount = (ratio * lfToken.totalSupply()) / RATIO_PRECISON;
        } else {
            mintAmount = amount;
        }

        poolToken.approve(address(miniChef), amount);
        miniChef.deposit(poolId, amount, address(this));
        lfToken.mint(msg.sender, mintAmount);
    }

    function burn(uint amount) public {
        uint ratio = (RATIO_PRECISON * amount) / lfToken.totalSupply();
        uint totalDepsoitAmount = miniChef.userInfo(poolId, address(this)).amount;
        uint withdrawAmount = (ratio * totalDepsoitAmount) / RATIO_PRECISON;
        lfToken.burnFrom(msg.sender, amount);
        miniChef.withdraw(poolId, withdrawAmount, msg.sender);
    }


    function recompound(address[] memory rewards) external {
        miniChef.harvest(poolId, address(this));

        uint256 len = rewards.length;
        for (uint256 i = 0; i < len; ++i) {
            IERC20 reward = IERC20(rewards[i]);
            uint amount = reward.balanceOf(address(this));
            // swap and recompound
        }
    }
}