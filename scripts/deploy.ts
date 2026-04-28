import { network } from "hardhat";

async function main() {
  console.log("🚀 Connecting to XDC Apothem...");
  
  // Hardhat 3 handshake to get the viem instance
  const { viem } = await network.connect();

  // Your address for the Treasury/LLC
  const MY_XDC_ADDRESS = "0x215c2ff021637ebeb98ef836f097a0aef44216c9";

  console.log("📡 Starting Deployment to XDC Apothem...");
  console.log("-----------------------------------------");

  // 1. Deploy Registry
  console.log("🛠️  Deploying HardForkRegistry...");
  const registry = await viem.deployContract("HardForkRegistry", [], {
    gas: 5000000n,
  });
  console.log(`✅ Registry: ${registry.address}`);

  // 2. Deploy Splitter
  console.log("🛠️  Deploying HardForkSplitter...");
  const splitter = await viem.deployContract("HardForkSplitter", [MY_XDC_ADDRESS], {
    gas: 5000000n,
  });
  console.log(`✅ Splitter: ${splitter.address}`);

  // 3. Deploy HardForkPosts
  console.log("🛠️  Deploying HardForkPosts...");
  const posts = await viem.deployContract("HardForkPosts", [MY_XDC_ADDRESS], {
    gas: 5000000n,
  });
  console.log(`✅ Posts: ${posts.address}`);

  console.log("\n" + "=".repeat(50));
  console.log("🔥 DEPLOYMENT COMPLETE - COPY THESE TO .env.local");
  console.log("=".repeat(50));
  console.log(`NEXT_PUBLIC_REGISTRY_ADDR=${registry.address}`);
  console.log(`NEXT_PUBLIC_SPLITTER_ADDR=${splitter.address}`);
  console.log(`NEXT_PUBLIC_POSTS_ADDR=${posts.address}`);
  console.log("=".repeat(50));
  console.log("👉 Your frontend is now ready to connect.");
}

main().catch((error) => {
  console.error("\n❌ Deployment Failed:");
  console.error(error);
  process.exit(1);
});