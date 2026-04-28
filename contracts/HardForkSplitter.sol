// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HardForkSplitter {
    address public treasury; // Your LLC address
    uint256 public platformFee = 5; // 5% fee

    event TipSent(address indexed from, address indexed to, uint256 amount, uint256 fee);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function supportCreator(address payable _creator) public payable {
        require(msg.value > 100 gwei, "Tip too small");

        uint256 fee = (msg.value * platformFee) / 100;
        uint256 creatorShare = msg.value - fee;

        (bool s1, ) = _creator.call{value: creatorShare}("");
        require(s1, "Creator payment failed");

        (bool s2, ) = payable(treasury).call{value: fee}("");
        require(s2, "Treasury fee failed");

        emit TipSent(msg.sender, _creator, creatorShare, fee);
    }
}