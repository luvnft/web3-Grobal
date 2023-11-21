// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC5192.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ParticipationTicket is ERC5192, Ownable, ReentrancyGuard {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
 
    string public baseTokenURI;

    // ERC5192に渡す第三引数がTrueならば、SBT（譲渡不可能）となる
    constructor(string memory baseTokenURI_) ERC5192("ParticipationTicket","PTK", true) { 
        setBaseURI(baseTokenURI_);
    }

    /**
     * @dev
     * - Mintを実行
     */
    function mintTicket(address receiver) external nonReentrant {
        require(balanceOf(receiver) < 1, "issuance limit exceeded per address");
        _tokenIdCounter.increment();
        uint256 nextId = _tokenIdCounter.current();
        _safeMint(receiver, nextId);
        emit Locked(nextId);
    }

    /**
     * @dev
     * - AirDropを実行
     */
    function mintTicketByOwner(address receiver) external onlyOwner {
        require(balanceOf(receiver) < 1, "issuance limit exceeded per address");
        _tokenIdCounter.increment();
        uint256 nextId = _tokenIdCounter.current();
        _safeMint(receiver, nextId);
        emit Locked(nextId);
    }

    /**
     * @dev
     * - メタデータのベースとなるURIを設定
     */
    function setBaseURI(string memory baseTokenURI_) public onlyOwner {
        baseTokenURI = baseTokenURI_;
    }

    /**
     * @dev
     * - 現在のTokenIDを返す
     */
    function getCurrentTokenId() public view returns (uint256) {
        return  _tokenIdCounter.current();
    }

    /**
     * @dev
     * - オーバーライド
     */
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev
     * - オーバーライド
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return baseTokenURI;
    }
}