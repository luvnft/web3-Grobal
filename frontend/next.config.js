/** @type {import('next').NextConfig} */
const nextConfig = {
  //reactStrictMode: true,
  reactStrictMode: false,
  output: 'standalone',
  env: {
    ENVIRONMENT: 'development', // development or production
    IS_LOCALHOST: true,
    IS_ZKEVM: true,
    WEB3AUTH_CLIENT_ID: 'secret',
    WEB3AUTH_REDIRECT_URL: 'http://localhost:3000/web3authredirect',
    WEB3AUTH_NETWORK: 'mainnet',
    ASTAR_RPC_PROVIDER: 'https://astar.public.blastapi.io',
    COUPON_EXPIRE: 'Sun Dec 31 2023 21:00:00 GMT+0900 (Japan Standard Time)',
    TICKET_EXPIRE: 'Sun Dec 31 2023 21:00:00 GMT+0900 (Japan Standard Time)',
    BUNDLER_URL: 'secret',
    PAYMASTER_URL: 'secret',
    OPERATION_ADDRESS: '0x43a96767aaF27239b2A982F8CA9e0342d081656f',
    OPERATION_PRIVATE_KEY: 'secret',

    // ASTARメインネットの環境変数
    MAINNET_RPC_PROVIDER: 'https://astar.public.blastapi.io',
    MAINNET_TICKET_NFT_CONTRACT_ADDRESS:
      '0xE5fAA4d6f6178e9B07A0271424aa67993ad7B499',
    MAINNET_CHAIN_ID: 592,
    MAINNET_CHAIN_ID_HEX: '0x250',
    
    // zKatana(zkEVM)の環境変数
    TESTNET_RPC_PROVIDER: 'https://rpc.startale.com/zkatana', //zkevm
    TESTNET_TICKET_NFT_CONTRACT_ADDRESS:
      '0x6E44db59C7Ed15E55A5a5fECF5253Bf03D3c4F19', //zkevm
    TESTNET_CHAIN_ID: 1261120,
    TESTNET_CHAIN_ID_HEX: '0x133E40',

    // DBのテーブル名
    PROD_COMMUNITY_TABLE_NAME: 'PROD_COMMUNITY',
    PROD_PARTICIPATION_TABLE_NAME: 'PROD_PARTICIPATION',
    PROD_TICKET_TABLE_NAME: 'PROD_TICKET',
    DEV_COMMUNITY_TABLE_NAME: 'DEV_COMMUNITY',
    DEV_PARTICIPATION_TABLE_NAME: 'DEV_PARTICIPATION',
    DEV_TICKET_TABLE_NAME: 'DEV_TICKET',
  },
};

module.exports = nextConfig;
