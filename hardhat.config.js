require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // defaultNetwork: "mumbai",
  networks: {
    hardhat: {
      /* forking : {
        url:`https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_API_KEY}`
      } */
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.API_KEY}`,
      accounts: [process.env.PRIKEY],
    },
    shibuya: {
      url: `https://shibuya.public.blastapi.io`,
      accounts: [process.env.PRIKEY],
    },
    zkatana: {
      url: `https://rpc.startale.com/zkatana`,
      accounts: [process.env.PRIKEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.18",
      },
      {
        version: "0.8.4",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
