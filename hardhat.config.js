require("@nomiclabs/hardhat-waffle");
const privateKey =
  require("fs").readFileSync(".secret").toString().trim() ||
  "01234567890123456789";

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    matic: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey],
    },
  },
  solidity: "0.8.4",
};
