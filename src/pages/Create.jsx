import { useRef, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { Box, Button, Stack, TextField } from "@mui/material";
import Image from "mui-image";
import { create as ipfsHttpClient } from "ipfs-http-client";

import NFT from "../contracts/NFT.json";
import Market from "../contracts/Market.json";

import config from "../config.json";
const { marketAddress, nftAddress } = config;

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const Create = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const inputFileRef = useRef(null);
  const [formInput, updateFormInput] = useState({
    price: 0,
    name: "",
    description: "",
  });

  const onFilechange = async (e) => {
    const file = e.target.files[0];
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    const url = `https://ipfs.infura.io/ipfs/${added.path}`;
    setFileUrl(url);
  };

  const createMarketItem = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const createSale = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(marketAddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftAddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
  };

  return (
    <Box>
      <Stack spacing={2}>
        <TextField
          id="name"
          label="Asset Name"
          variant="outlined"
          value={formInput.name}
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <TextField
          id="desc"
          label="Asset Description"
          variant="outlined"
          multiline
          maxRows={4}
          value={formInput.description}
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <TextField
          id="price"
          label="Asset Price"
          variant="outlined"
          value={formInput.price}
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input hidden type="file" ref={inputFileRef} onChange={onFilechange} />
      </Stack>
      <Stack direction={"row"} spacing={2} sx={{ my: 2 }}>
        <Button
          variant="outlined"
          onClick={() => inputFileRef.current.click()}
          fullWidth
        >
          Upload asset
        </Button>

        {formInput.name && formInput.description && formInput.price && fileUrl && (
          <Button
            variant="outlined"
            sx={{ my: 2 }}
            fullWidth
            color="success"
            onClick={createMarketItem}
          >
            Create NFT
          </Button>
        )}
      </Stack>
      {fileUrl && <Image showLoading width="350" src={fileUrl} />}
    </Box>
  );
};

export default Create;
