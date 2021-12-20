import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import NFT from "../contracts/NFT.json";
import Market from "../contracts/Market.json";
import config from "../config.json";
import axios from "axios";
import { Box, Card, Grid, Typography } from "@mui/material";
import { Image } from "mui-image";

const { marketAddress, nftAddress } = config;

const Creator = () => {
  const [myNfts, setMyNfts] = useState([]);
  const [soldNfts, setSoldNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNfts();
  }, []);

  const loadNfts = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      marketAddress,
      Market.abi,
      signer
    );
    const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);

    const items = await marketContract.fetchItemsCreated();

    const formatted = await Promise.all(
      items.map(async (nft) => {
        const tokenUri = await nftContract.tokenURI(nft.tokenId);
        const tokenMeta = await axios.get(tokenUri);
        return {
          price: ethers.utils.formatUnits(nft.price.toString(), "ether"),
          tokenId: nft.tokenId.toNumber(),
          seller: nft.seller,
          owner: nft.owner,
          image: tokenMeta.data.image,
          name: tokenMeta.data.name,
          description: tokenMeta.data.description,
          sold: nft.sold,
        };
      })
    );
    setMyNfts(formatted);
    setSoldNfts(formatted.filter((nft) => nft.sold));
    setLoadingState("loaded");
  };

  if (loadingState === "loaded" && !myNfts.length)
    return <Typography variant="h3">No items created!</Typography>;
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" fontWeight="bold">
            NFTs Created
          </Typography>
        </Grid>
        {myNfts.map((nft, i) => (
          <Grid item xs={12} md={6} lg={4} key={i}>
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
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} sx={{ pt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h4" fontWeight="bold">
            NFTs Sold
          </Typography>
        </Grid>
        {soldNfts.map((nft, i) => (
          <Grid item xs={12} md={6} lg={4} key={i}>
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
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Creator;
