import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import config from "../config.json";

import NFT from "../contracts/NFT.json";
import Market from "../contracts/Market.json";
import { Box, Button, Card, Grid, Typography } from "@mui/material";
import Image from "mui-image";
const { marketAddress, nftAddress } = config;

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      marketAddress,
      Market.abi,
      provider
    );
    const data = await marketContract.getMarketItems();

    const listNFT = await Promise.all(
      data.map(async (nft) => {
        const tokenUri = await tokenContract.tokenURI(nft.tokenId);
        const meta = await axios.get(tokenUri);
        const price = ethers.utils.formatUnits(nft.price.toString(), "ether");
        return {
          price,
          tokenId: nft.tokenId.toNumber(),
          seller: nft.seller,
          owner: nft.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
      })
    );
    setNfts(listNFT);
    setLoadingState("loaded");
  };
  if (loadingState === "loaded" && !nfts.length)
    return <Typography variant="h3">No items in marketplace</Typography>;
  return (
    <Box>
      <Grid container spacing={2}>
        {nfts.map((nft, i) => (
          <Grid item xs={12} md={4} lg={3}>
            <Card>
              <Image src={nft.image} alt={nft.name} height={300} />
              <Box
                paddingY={3}
                paddingX={2}
                sx={{
                  overflow: "hidden",
                }}
              >
                <Typography variant="body1" fontWeight={"bold"}>
                  {nft.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {nft.description}
                </Typography>
              </Box>
              <Box padding={2} paddingTop={0}>
                <Button fullWidth variant="contained" color="success">
                  <Typography variant="button">
                    Buy with {nft.price} ETH
                  </Typography>
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
