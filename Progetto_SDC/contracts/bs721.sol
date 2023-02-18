pragma solidity >= 0.5.2;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol";


contract bs721 is ERC721Metadata, ERC721Enumerable, ERC721Mintable, ERC721MetadataMintable {
    address private _owner;    // current owner of the contract

    constructor (string memory name, string memory symbol) public ERC721Mintable() ERC721Metadata(name, symbol) {
        _owner = msg.sender;
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function addone(uint256 num) public view returns (uint256) {
        return num+1;
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _tokensOfOwner(owner);
    }

    function setTokenURI(uint256 tokenId, string memory uri) public {
        require(msg.sender == _owner, "Only the smart contract creator can change this attribute");
        _setTokenURI(tokenId, uri);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(msg.sender == _owner, "Only the smart contract creator can transfer a token");
        _transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address /*from*/, address /*to*/, uint256 /*tokenId*/, bytes memory /*_data*/) public {
        require(false, "You cannot transfer that token");
    }

    function approve(address /*_approved*/, uint256 /*_tokenId*/) public {
        require(false, "You cannot transfer that token");
    }
    function setApprovalForAll(address /*_operator*/, bool /*_approved*/) public {
        require(false, "You cannot transfer that token");
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}
