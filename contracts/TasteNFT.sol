// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TasteNFT
 * @dev ERC-721 NFT representing food posts (Cook-to-Earn and Taste-to-Earn)
 * Each NFT represents one user post with metadata stored on IPFS
 */
contract TasteNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Address authorized to mint NFTs (TasteRewarder contract)
    address public minter;

    event MinterUpdated(address indexed oldMinter, address indexed newMinter);
    event PostNFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);

    constructor(address initialOwner)
        ERC721("Taste Post NFT", "TASTENFT")
        Ownable(initialOwner)
    {
        // Start token IDs at 1
        _tokenIdCounter = 1;
    }

    /**
     * @dev Set the authorized minter address (should be TasteRewarder contract)
     * @param _minter Address of the minter contract
     */
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "TasteNFT: minter cannot be zero address");
        address oldMinter = minter;
        minter = _minter;
        emit MinterUpdated(oldMinter, _minter);
    }

    /**
     * @dev Mint a new Post NFT - only callable by authorized minter
     * @param to Address to mint NFT to
     * @param tokenURI IPFS URI containing post metadata
     * @return tokenId The ID of the newly minted NFT
     */
    function mintPostNFT(address to, string memory tokenURI) external returns (uint256) {
        require(msg.sender == minter, "TasteNFT: caller is not the minter");
        require(to != address(0), "TasteNFT: mint to zero address");
        require(bytes(tokenURI).length > 0, "TasteNFT: tokenURI cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit PostNFTMinted(tokenId, to, tokenURI);

        return tokenId;
    }

    /**
     * @dev Get the current token ID counter
     * @return Current token ID that will be minted next
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Get total number of NFTs minted
     * @return Total supply of NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    // The following functions are overrides required by Solidity

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
