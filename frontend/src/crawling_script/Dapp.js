const _getSushiPools = async () => {
  if (contract.miniChef) {
    // console.log(contract.miniChef);
    // console.log(await contract.miniChef.poolLength());
    // console.log(await contract.miniChef.poolInfo(0));
    // const length = parseInt(await contract.miniChef.poolLength());
    // const pools = [];
    // for (let i = 0; i < 1; i++) {
    //   console.log(i);
    //   const pool = {
    //     poolInfo: await contract.miniChef.poolInfo(i),
    //     lpToken: await contract.miniChef.lpToken(i),
    //     rewarder: await contract.miniChef.rewarder(i),
    //   };
    //   console.log(pool);
    //   pools.push(pool);
    // }

    const pools = [];
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    for (let i = 0; i < sushiPool.length; i++) {
      const pool = sushiPool[i];
      const _pair = new ethers.Contract(
        pool.lpToken,
        IUniswapV2Pair.abi,
        _provider.getSigner(0)
      );
      const token0 = await _pair.token0();
      const token1 = await _pair.token1();
      const _token0 = new ethers.Contract(
        token0,
        LFERC20.abi,
        _provider.getSigner(0)
      );
      const _token1 = new ethers.Contract(
        token1,
        LFERC20.abi,
        _provider.getSigner(0)
      );

      const token0Name = await _token0.name();
      const token0Symbol = await _token0.symbol();

      const token1Name = await _token1.name();
      const token1Symbol = await _token1.symbol();

      const pair = {
        poolId: i,
        poolToken: pool.lpToken,
        rewarder: pool.rewarder,
        token0: { name: token0Name, symbol: token0Symbol, address: token0 },
        token1: { name: token1Name, symbol: token1Symbol, address: token1 },
      };
      console.log(pair);
      pools.push(pair);
    }
    console.log(JSON.stringify(pools));

    // const length = parseInt(await contract.sushiFactory.allPairsLength());
    const pairs = [];
    // console.log(length);
    // for (let i = 0; i < 1; i++) {
    //   const pairContract = await contract.sushiFactory.allPairs(i);
    //   const _pair = new ethers.Contract(
    //     pairContract,
    //     IUniswapV2Pair.abi,
    //     _provider.getSigner(0)
    //   );
    //   const token0 = await _pair.token0();
    //   const token1 = await _pair.token1();
    //   const _token0 = new ethers.Contract(
    //     token0,
    //     LFERC20.abi,
    //     _provider.getSigner(0)
    //   );
    //   const _token1 = new ethers.Contract(
    //     token1,
    //     LFERC20.abi,
    //     _provider.getSigner(0)
    //   );

    //   const token0Name = await _token0.name();
    //   const token0Symbol = await _token0.symbol();

    //   const token1Name = await _token1.name();
    //   const token1Symbol = await _token1.symbol();

    //   const pool = {
    //     poolToken: pairContract,
    //     token0: { name: token0Name, symbol: token0Symbol, address: token0 },
    //     token1: { name: token1Name, symbol: token1Symbol, address: token1 },
    //   };
    //   console.log(pool);

    //   // const pool = {
    //   //   poolInfo: await contract.miniChef.poolInfo(i),
    //   //   lpToken: await contract.miniChef.lpToken(i),
    //   //   rewarder: await contract.miniChef.rewarder(i),
    //   // };
    //   // pairs.push(_pair);
    // }

    // setSushiPools(pools);
    // console.log(JSON.stringify(pools));
  }
};
