const hre = require("hardhat");

async function main() {
  const Market = await hre.ethers.getContractFactory("Market");
  const market = await Market.deploy();
  await market.deployed();
  console.log("Market deployed to:", market.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(market.address);
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);

  saveFiles(market, nft);
}

function saveFiles(market, nft) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const MarketArtifact = artifacts.readArtifactSync("Market");
  const NFTArtifact = artifacts.readArtifactSync("NFT");

  fs.writeFileSync(
    contractsDir + "/Market.json",
    JSON.stringify(MarketArtifact, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/NFT.json",
    JSON.stringify(NFTArtifact, null, 2)
  );
  fs.writeFileSync(
    `${__dirname}/../src/config.json`,
    JSON.stringify(
      { marketAddress: market.address, nftAddress: nft.address },
      undefined,
      2
    )
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
