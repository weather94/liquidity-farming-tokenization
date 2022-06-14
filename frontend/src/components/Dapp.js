import React, { useEffect, useState, useRef, useMemo } from "react";

import { ethers } from "ethers";

import LFProductFactoryArtifact from "../contracts/LFProductFactory.json";
import LFProduct from "../contracts/LFProduct.json";
import LFERC20 from "../contracts/LFERC20.json";
import MiniChefV2 from "../contracts/MiniChefV2.json";
import IMiniChefV2 from "../contracts/IMiniChefV2.json";
import IUniswapV2Factory from "../contracts/IUniswapV2Factory.json";
import IUniswapV2Pair from "../contracts/IUniswapV2Pair.json";
import IRewarder from "../contracts/IRewarder.json";

import contractAddress from "../contracts/contract-address.json";

import sushiPool from "../constants/sushi_pool.json";
import assets from "../constants/assets.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";

export function Dapp() {
  const [state, setState] = useState({
    tokenData: undefined,
    selectedAddress: undefined,
    balance: undefined,
    txBeingSent: undefined,
    transactionError: undefined,
    networkError: undefined,
    isLoading: null,
  });
  const [contract, setContract] = useState({});
  const [products, setProducts] = useState([]);

  const _initialize = (userAddress) => {
    setState({
      ...state,
      selectedAddress: userAddress,
    });

    _initializeEthers();
  };

  const _initializeEthers = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);

    const _factory = new ethers.Contract(
      contractAddress.Factory,
      LFProductFactoryArtifact.abi,
      _provider.getSigner(0)
    );
    const miniChefAddress = await _factory.miniChefAddress();

    const _miniChef = new ethers.Contract(
      miniChefAddress,
      MiniChefV2.abi,
      _provider.getSigner(0)
    );

    setContract({
      provider: _provider,
      factory: _factory,
      miniChef: _miniChef,
    });
  };

  const _connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    _initialize(selectedAddress);

    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        return _resetState();
      }

      _initialize(newAddress);
    });

    window.ethereum.on("chainChanged", ([networkId]) => {
      _resetState();
    });
  };

  const createProduct = async (pool) => {
    console.log(contract.factory);
    const name = `Liquidity Farming Token (${pool.token0.symbol}-${pool.token1.symbol})`;
    const symbol = `LF${pool.poolId}`;
    const tx = await contract.factory.createProduct(
      pool.poolId,
      pool.poolToken,
      name,
      symbol
    );
    const receipt = await tx.wait();
    console.log(receipt);
  };

  const mint = async (pool) => {
    const _poolToken = new ethers.Contract(
      pool.poolToken,
      IUniswapV2Pair.abi,
      contract.provider.getSigner(0)
    );

    const mintAmount = prompt("amount");

    const tx = await _poolToken.approve(pool.product, mintAmount);
    const _product = new ethers.Contract(
      pool.product,
      LFProduct.abi,
      contract.provider.getSigner(0)
    );

    const tx2 = await _product.mint(mintAmount);
    const receipt2 = await tx2.wait();
    console.log(receipt2);
  };

  const burn = async (pool) => {
    const _lfToken = new ethers.Contract(
      pool.lfToken,
      LFERC20.abi,
      contract.provider.getSigner(0)
    );

    const burnAmount = prompt("amount");

    const tx = await _lfToken.approve(pool.product, burnAmount);
    const _product = new ethers.Contract(
      pool.product,
      LFProduct.abi,
      contract.provider.getSigner(0)
    );
    const tx2 = await _product.burn(burnAmount);
    const receipt2 = await tx2.wait();
    console.log(receipt2);
  };

  const harvest = async (pool) => {
    const _product = new ethers.Contract(
      pool.product,
      LFProduct.abi,
      contract.provider.getSigner(0)
    );
    console.log(_product);
    const tx = await _product.recompound([]);
    const receipt = await tx.wait();
    console.log(receipt);
  };

  const _dismissNetworkError = () => {
    setState({ ...state, networkError: undefined });
  };

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(() => resolve(), [ms]));

  const getPendingTokens = async (pool) => {
    const _rewarder = new ethers.Contract(
      pool.rewarder,
      IRewarder.abi,
      contract.provider.getSigner(0)
    );

    const rewardSushi = await contract.miniChef.pendingSushi(
      pool.poolId,
      pool.product
    );
    const reward = [["SUSHI", rewardSushi.toString()]];

    const rewards = await _rewarder.pendingTokens(
      pool.poolId,
      pool.product,
      "0"
    );
    for (let i = 0; i < rewards[0].length; i++) {
      reward.push([assets[rewards[0][i]], rewards[1][i].toString()]);
    }
    reward.forEach((r) => console.log(`${r[0]} ${r[1]}`));
  };

  const _resetState = () => {
    setState({
      tokenData: undefined,
      selectedAddress: undefined,
      balance: undefined,
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    });
  };

  const getFactory = async () => {
    console.log("getFactory");
    if (!contract.factory) return;
    const length = parseInt(await contract.factory.productLength());
    console.log(length);
    const _products = [];
    for (let i = 0; i < length; i++) {
      const result = await contract.factory.products(i);
      const poolId = parseInt(result.poolId.toString());
      const _sushiPool = sushiPool.filter((pool) => pool.poolId === poolId)[0];

      const _erc20 = new ethers.Contract(
        _sushiPool.poolToken,
        LFERC20.abi,
        contract.provider.getSigner(0)
      );

      const _product = new ethers.Contract(
        result.product,
        LFProduct.abi,
        contract.provider.getSigner(0)
      );

      const lfToken = await _product.lfToken();

      const _lferc20 = new ethers.Contract(
        lfToken,
        LFERC20.abi,
        contract.provider.getSigner(0)
      );

      const lfTotalSupply = await _lferc20.totalSupply();

      const totalDepsoitAmount = await contract.miniChef.userInfo(
        poolId,
        result.product
      );
      console.log(totalDepsoitAmount);

      const lfBalance = await _lferc20.balanceOf(state.selectedAddress);

      const balance = await _erc20.balanceOf(state.selectedAddress);
      _products.push({
        poolId: poolId,
        product: result.product,
        lfToken: lfToken,
        poolTokenBalance: balance,
        lfTokenBalance: lfBalance,
        lfTotalSupply: lfTotalSupply,
        totalDepsoitAmount: totalDepsoitAmount.amount,
        ..._sushiPool,
      });
    }
    setProducts(_products);
  };

  const pools = useMemo(() => {
    if (products.length > 0) {
      return sushiPool.map((pool) => {
        const product = products.filter(
          (_product) => pool.poolId === _product.poolId
        )[0];
        return {
          ...pool,
          ...product,
        };
      });
    } else {
      return sushiPool;
    }
  }, [products]);

  if (window.ethereum === undefined) {
    return <NoWalletDetected />;
  }

  if (!state.selectedAddress) {
    return (
      <ConnectWallet
        connectWallet={() => _connectWallet()}
        networkError={state.networkError}
        dismiss={() => _dismissNetworkError()}
      />
    );
  }

  if (state.isLoading) {
    return <Loading />;
  }

  return (
    <div className="container p-4">
      <div className="row">
        <div className="col-12">
          <h1>{/* {state.tokenData.name} ({state.tokenData.symbol}) */}</h1>
          <p>
            Welcome <b>{state.selectedAddress}</b>, you have{" "}
            <b>{/* {state.balance.toString()} {state.tokenData.symbol} */}</b>.
          </p>
        </div>
      </div>

      <hr />

      <button className="btn" onClick={getFactory}>
        getFactory
      </button>

      <div>
        {pools.map((pool) => {
          return (
            <div key={pool.poolId}>
              {`${pool.poolId} ${pool.token0.symbol}-${pool.token1.symbol} ${pool.poolToken}`}
              {!pool.product ? (
                <button
                  onClick={() => {
                    createProduct(pool);
                  }}
                >
                  create
                </button>
              ) : (
                <div>
                  <div>
                    <span style={{ marginRight: 10, color: "red" }}>
                      Total Deposit PoolToken:
                      {pool.totalDepsoitAmount?.toString()}
                    </span>
                    <span style={{ marginRight: 10, color: "red" }}>
                      LFTokenTotalSupply: {pool.lfTotalSupply?.toString()}
                    </span>
                  </div>

                  <span>SLP: {pool.poolTokenBalance?.toString()}</span>
                  <button
                    style={{ backgroundColor: "mint", marginRight: 20 }}
                    onClick={() => mint(pool)}
                  >
                    Mint
                  </button>
                  <span>LFSLP: {pool.lfTokenBalance?.toString()}</span>
                  <button
                    style={{ backgroundColor: "red", marginRight: 10 }}
                    onClick={() => burn(pool)}
                  >
                    Burn
                  </button>
                  <button
                    style={{ backgroundColor: "yellow", marginRight: 10 }}
                    onClick={() => getPendingTokens(pool)}
                  >
                    getRewards
                  </button>
                  <button onClick={() => harvest(pool)}>harvest</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
