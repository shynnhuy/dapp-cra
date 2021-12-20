import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import NFT from "../contracts/NFT.json";
import Market from "../contracts/Market.json";
import config from "../config.json";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Image } from "mui-image";

const { marketAddress, nftAddress } = config;

const MyNFT = () => {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [sellOpen, setSellOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(0);

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

    const myNfts = await marketContract.fetchMyNFTs();

    const formatted = await Promise.all(
      myNfts.map(async (nft) => {
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
        };
      })
    );
    setNfts(formatted);
    setLoadingState("loaded");
  };

  const sell = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(newPrice, "ether");
    // const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);

    const marketContract = new ethers.Contract(
      marketAddress,
      Market.abi,
      signer
    );
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();
    const transaction = await marketContract.sellMyNft(nft.tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
  };

  const openSell = () => setSellOpen(true);

  if (loadingState === "loaded" && !nfts.length)
    return <Typography variant="h3">No items in marketplace</Typography>;

  return (
    <Box>
      <Grid container spacing={2}>
        {nfts.map((nft, i) => (
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
              <Box padding={2} paddingTop={0}>
                {sellOpen ? (
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      label="Price (ETH)"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => sell(nft)}
                    >
                      <Typography variant="button">Sell</Typography>
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={() => setSellOpen(false)}
                    >
                      <Typography variant="button">Cancel</Typography>
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => openSell()}
                  >
                    <Typography variant="button">Sell</Typography>
                  </Button>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyNFT;
