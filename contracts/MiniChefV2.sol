pragma solidity >=0.7.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interface/IMiniChefV2.sol";
import "./interface/IRewarder.sol";

abstract contract MiniChefV2 is IMiniChefV2 {
    PoolInfo[] public poolInfo;
    IERC20[] public lpToken;
    IRewarder[] public rewarder;
}