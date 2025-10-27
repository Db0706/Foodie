const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to Avalanche Fuji Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "wei\n");

  // Step 1: Deploy TasteToken
  console.log("1. Deploying TasteToken...");
  const TasteToken = await hre.ethers.getContractFactory("TasteToken");
  const tasteToken = await TasteToken.deploy(deployer.address);
  await tasteToken.waitForDeployment();
  const tasteTokenAddress = await tasteToken.getAddress();
  console.log("✓ TasteToken deployed to:", tasteTokenAddress, "\n");

  // Step 2: Deploy TasteNFT
  console.log("2. Deploying TasteNFT...");
  const TasteNFT = await hre.ethers.getContractFactory("TasteNFT");
  const tasteNFT = await TasteNFT.deploy(deployer.address);
  await tasteNFT.waitForDeployment();
  const tasteNFTAddress = await tasteNFT.getAddress();
  console.log("✓ TasteNFT deployed to:", tasteNFTAddress, "\n");

  // Step 3: Deploy TasteRewarder
  console.log("3. Deploying TasteRewarder...");
  const TasteRewarder = await hre.ethers.getContractFactory("TasteRewarder");
  const tasteRewarder = await TasteRewarder.deploy(
    tasteTokenAddress,
    tasteNFTAddress,
    deployer.address
  );
  await tasteRewarder.waitForDeployment();
  const tasteRewarderAddress = await tasteRewarder.getAddress();
  console.log("✓ TasteRewarder deployed to:", tasteRewarderAddress, "\n");

  // Step 4: Configure contracts
  console.log("4. Configuring contracts...");

  // Set TasteRewarder as minter for TasteToken
  console.log("   - Setting TasteRewarder as minter for TasteToken...");
  const setTokenMinterTx = await tasteToken.setMinter(tasteRewarderAddress);
  await setTokenMinterTx.wait();
  console.log("   ✓ TasteToken minter set");

  // Set TasteRewarder as minter for TasteNFT
  console.log("   - Setting TasteRewarder as minter for TasteNFT...");
  const setNFTMinterTx = await tasteNFT.setMinter(tasteRewarderAddress);
  await setNFTMinterTx.wait();
  console.log("   ✓ TasteNFT minter set\n");

  // Step 5: Verify deployment
  console.log("5. Verifying deployment...");
  const tokenSymbol = await tasteToken.symbol();
  const tokenTotalSupply = await tasteToken.totalSupply();
  const nftName = await tasteNFT.name();
  const postReward = await tasteRewarder.postReward();
  const likeReward = await tasteRewarder.likeReward();

  console.log("   ✓ TasteToken symbol:", tokenSymbol);
  console.log("   ✓ TasteToken total supply:", hre.ethers.formatEther(tokenTotalSupply), "TASTE");
  console.log("   ✓ TasteNFT name:", nftName);
  console.log("   ✓ Post reward:", hre.ethers.formatEther(postReward), "TASTE");
  console.log("   ✓ Like reward:", hre.ethers.formatEther(likeReward), "TASTE\n");

  // Step 6: Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TasteToken: {
        address: tasteTokenAddress,
        constructorArgs: [deployer.address],
      },
      TasteNFT: {
        address: tasteNFTAddress,
        constructorArgs: [deployer.address],
      },
      TasteRewarder: {
        address: tasteRewarderAddress,
        constructorArgs: [tasteTokenAddress, tasteNFTAddress, deployer.address],
      },
    },
    config: {
      postReward: hre.ethers.formatEther(postReward) + " TASTE",
      likeReward: hre.ethers.formatEther(likeReward) + " TASTE",
    },
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Also save as latest
  const latestFile = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("6. Deployment info saved to:", deploymentFile);
  console.log("   Also saved as:", latestFile, "\n");

  // Print summary
  console.log("=" .repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("");
  console.log("Contract Addresses:");
  console.log("  TasteToken:", tasteTokenAddress);
  console.log("  TasteNFT:", tasteNFTAddress);
  console.log("  TasteRewarder:", tasteRewarderAddress);
  console.log("");
  console.log("Next Steps:");
  console.log("1. Verify contracts on Snowtrace:");
  console.log(`   npx hardhat verify --network fuji ${tasteTokenAddress} "${deployer.address}"`);
  console.log(`   npx hardhat verify --network fuji ${tasteNFTAddress} "${deployer.address}"`);
  console.log(`   npx hardhat verify --network fuji ${tasteRewarderAddress} "${tasteTokenAddress}" "${tasteNFTAddress}" "${deployer.address}"`);
  console.log("");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Copy ABIs from artifacts to frontend");
  console.log("=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
