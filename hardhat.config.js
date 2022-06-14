require("@nomiclabs/hardhat-waffle");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

const PRIVATE_KEY =
  "590f2bbac9034ee33c284ecd8f2332611f312c5e3a1d20177c6f3ee839e9316e";

// If you are using MetaMask, be sure to change the chainId to 1337
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.7.0",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    polygon: {
      chainId: 137,
      url: `https://polygon-rpc.com`,
      accounts: [`${PRIVATE_KEY}`],
    },
    mumbai: {
      chainId: 80001,
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [`${PRIVATE_KEY}`],
    },
  },
};
