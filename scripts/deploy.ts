import { network } from "hardhat";

async function main() {
  console.log("🚀 Connecting to XDC Apothem...");

  const { viem } = await network.connect();

  // This is your address converted to 0x format for the smart contract
  const MY_XDC_ADDRESS = "0x215c2ff021637ebeb98ef836f097a0aef44216c9";

  console.log("📡 Deploying HardForkPosts to XDC...");
  console.log(`🏦 Treasury Set To: ${MY_XDC_ADDRESS}`);

  // We pass [MY_XDC_ADDRESS] as the second argument to fill the constructor(_treasury)
  const posts = await viem.deployContract("contracts/HardForkPosts.sol:HardForkPosts", [
    MY_XDC_ADDRESS
  ]);

  console.log("-----------------------------------------");
  console.log("✅ SUCCESS: HardForkPosts Live");
  console.log("📍 Address:", posts.address);
  console.log("-----------------------------------------");
  console.log("👉 Copy this address to NEXT_PUBLIC_POSTS_ADDR in your .env.local");
}

main().catch((error) => {
  console.error("❌ Deployment Failed:", error);
  process.exit(1);
});