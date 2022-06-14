// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const SUSHI_MINICHEF_ADDRESS = "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F";

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const LFProductFactory = await ethers.getContractFactory("LFProductFactory");
  const factory = await LFProductFactory.deploy(SUSHI_MINICHEF_ADDRESS);
  await factory.deployed();

  console.log("Factory address:", factory.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(factory);
}

function saveFrontendFiles(factory) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Factory: factory.address }, undefined, 2)
  );

  const LFProductFactory = artifacts.readArtifactSync("LFProductFactory");
  const LFERC20 = artifacts.readArtifactSync("LFERC20");
  const LFProduct = artifacts.readArtifactSync("LFProduct");
  const MiniChefV2 = artifacts.readArtifactSync("MiniChefV2");
  const IUniswapV2Pair = artifacts.readArtifactSync("IUniswapV2Pair");
  const IUniswapV2Factory = artifacts.readArtifactSync("IUniswapV2Factory");

  fs.writeFileSync(
    contractsDir + "/LFProductFactory.json",
    JSON.stringify(LFProductFactory, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/LFERC20.json",
    JSON.stringify(LFERC20, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/LFProduct.json",
    JSON.stringify(LFProduct, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/MiniChefV2.json",
    JSON.stringify(MiniChefV2, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/IUniswapV2Pair.json",
    JSON.stringify(IUniswapV2Pair, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/IUniswapV2Factory.json",
    JSON.stringify(IUniswapV2Factory, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
