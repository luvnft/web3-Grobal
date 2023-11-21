export const NFTTicketAddress =
  process.env.ENVIRONMENT === 'development'
    ? [process.env.TESTNET_TICKET_NFT_CONTRACT_ADDRESS]
    : [process.env.MAINNET_TICKET_NFT_CONTRACT_ADDRESS];

// ERC2771NFTAddressは小文字にする
const ERC2771NFTAddressUpperCase =
  process.env.ENVIRONMENT === 'development'
    ? process.env.TESTNET_TICKET_NFT_CONTRACT_ADDRESS
    : process.env.MAINNET_TICKET_NFT_CONTRACT_ADDRESS;
export const ERC2771NFTAddress =
  typeof ERC2771NFTAddressUpperCase === 'undefined'
    ? ERC2771NFTAddressUpperCase
    : ERC2771NFTAddressUpperCase.toLowerCase();
