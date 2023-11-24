## Environment
- OS windows10
- node.js v18.16.0
- npm v8.19.2
- Next.js v13.3.2

※ Versions of other libraries such as hardhat, see package.json


## Setting environment variables
Please set the environment variables in /frontend/next.config.js.

- IS_ZKEVM: If True, zKatana will be selected; if False, ASTAR mainnet will be selected.
- WEB3AUTH_CLIENT_ID: web3auth client ID. You can get it from your web3auth dashboard.
- BUNDLER_URL: Biconomy SDK bundler URL.
- PAYMASTER_URL: Biconomy SDK paymaster URL.
- OPERATION_PRIVATE_KEY: This is the private key used when airdropping NFTs.

## Installing the library
```
cd frontend
npm install
```

## Starting
```
cd frontend
npm run dev
```

## Other
The app uses DynamoDB as the database.<br>
If you want to check the operation on your local PC, you can use DynamoDB Local.<br>
https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/DynamoDBLocal.html


## Description of our team 
- sakamoto
  
  Role: Project Leader, Dapps Designer
  Contributed part in this product: Responsible for UX/UI and system design.
  Background: Long experience as a project leader. Lately, contribute to dapps design and user interface design.
- tksarah
Role: Special Advisor
Contributed part in this product: Support grand design and presentation 
Background: IT and Cloud Infrastructure TechLead / Technacal Marketing / Technical Instructor 
- ttmasa
Role: Developer
Contributions to this product: Frontend, smart contract
Background: I am implementing a demo Dapp using EVM-based blockchain.
- yobata_8708
Role:
Contributions to this product:
Background:
