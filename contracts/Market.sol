pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.02 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private marketItems;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price of item must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        marketItems[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    function buyMarketItem(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = marketItems[itemId].price;
        uint256 tokenId = marketItems[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        marketItems[itemId].seller.transfer(msg.value);

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        marketItems[itemId].owner = payable(msg.sender);
        marketItems[itemId].sold = true;

        _itemsSold.increment();

        payable(owner).transfer(listingPrice);
    }

    function getMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemsCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemsCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (marketItems[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = marketItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = marketItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = marketItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
