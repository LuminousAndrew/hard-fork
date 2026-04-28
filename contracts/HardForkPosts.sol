// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HardForkPosts {
    address public treasury;

    struct Post {
        uint256 id;
        address author;
        string content;
        string mediaHash;
        uint256 totalInvested;
        uint256 timestamp; // Added so your frontend can show the date
    }

    mapping(uint256 => Post) public posts;
    uint256 public postCount;

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function createPost(string memory _content, string memory _mediaHash) public {
        postCount++;
        posts[postCount] = Post(postCount, msg.sender, _content, _mediaHash, 0, block.timestamp);
    }

    function invest(uint256 _postId) public payable {
        require(msg.value > 0, "Must invest more than 0");
        Post storage post = posts[_postId];
        
        uint256 amountToCreator = (msg.value * 95) / 100;
        uint256 amountToTreasury = msg.value - amountToCreator;

        payable(post.author).transfer(amountToCreator);
        payable(treasury).transfer(amountToTreasury);

        post.totalInvested += msg.value;
    }

    // Helper to get all posts for the frontend
    function getAllPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 1; i <= postCount; i++) {
            allPosts[i - 1] = posts[i];
        }
        return allPosts;
    }
}