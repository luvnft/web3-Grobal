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

## Accounts
  ![Each_Accounts](https://github.com/tis305121/web3-Grobal-Hackathon/assets/126054542/37d3a4ce-cd66-4ccf-9191-805cf1a865d7)


## Flow
![flow](https://github.com/tis305121/web3-Grobal-Hackathon/assets/95739307/036dd5bf-e3c7-4090-a03e-394bfb61e86d)


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
  
  _Role :_　Project Leader, Dapps Designer
  
  _Contributed part in this product :_　Responsible for UX/UI and system design.
  
  _Background :_　Long experience as a project leader. Lately, contribute to dapps design and user interface design.

- tksarah

  _Role :_　Special Advisor

  _Contributed part in this product :_　Support grand design and presentation 

  _Background :_　IT and Cloud Infrastructure TechLead / Technacal Marketing / Technical Instructor 

- ttmasa

  _Role :_　Developer
  
  _Contributed part in this product :_　Frontend, smart contract
  
  _Background :_　I am implementing a demo Dapp using EVM-based blockchain.
  
- yobata_8708

  _Role :_　
  
  _Contributed part in this product :_　
  
  _Background :_　
