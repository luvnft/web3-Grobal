// 配列でアドレスを宣言
export const NFTTicketAddressArray =
  process.env.IS_ZKEVM === true
    ? [process.env.TESTNET_TICKET_NFT_CONTRACT_ADDRESS]
    : [process.env.MAINNET_TICKET_NFT_CONTRACT_ADDRESS];

// NFTTicketAddressは小文字にする
const NFTTicketAddressUpperCase =
  process.env.IS_ZKEVM === true
    ? process.env.TESTNET_TICKET_NFT_CONTRACT_ADDRESS
    : process.env.MAINNET_TICKET_NFT_CONTRACT_ADDRESS;
export const NFTTicketAddress =
  typeof NFTTicketAddressUpperCase === 'undefined'
    ? NFTTicketAddressUpperCase
    : NFTTicketAddressUpperCase.toLowerCase();
