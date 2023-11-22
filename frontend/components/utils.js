import { ethers } from 'ethers';
import { NFTTicketAddressArray } from '../contracts';

export const TX_STATUS = {
  NOT_START: 'not-start',
  SUCCESS: 'success',
  PROGRESS: 'progress',
  ERROR: 'error',
};

export const SIGNTYPE_EIP712_SIGN = 'EIP712_SIGN';
export const ETHERS_SIGNTYPE_EIP712_SIGN_v3 = 'eth_signTypedData_v3';
export const ETHERS_SIGNTYPE_EIP712_SIGN_v4 = 'eth_signTypedData_v4';

export const ETHEREUM_MAIN_ID = 1;
export const TICKET_NFT_CHAIN_ID =
  process.env.IS_ZKEVM === true
    ? process.env.TESTNET_CHAIN_ID
    : process.env.MAINNET_CHAIN_ID;
export const TICKET_NFT_CHAIN_ID_HEX =
  process.env.IS_ZKEVM === true
    ? process.env.TESTNET_CHAIN_ID_HEX
    : process.env.MAINNET_CHAIN_ID_HEX;

export const WALLET_TYPE = {
  NO_LOGIN: 'no-login',
  METAMASK: 'metamask',
  WEB3AUTH: 'web3auth',
};

export const CONSUME_STATUS = {
  NOT_START: 'not-start',
  SUCCESS: 'success',
  PROGRESS: 'progress',
  ERROR: 'error',
};

export const DB_CONSUME_FLAG = {
  NOT_CONSUMED: 0,
  CONSUMED: 1,
};

export const DB_USED_AT_UNKNOWN = 'unknown';

export const MAIL_REGEX =
  /[a-zA-Z0-9]+[a-zA-Z0-9\._-]*@[a-zA-Z0-9_-]+[a-zA-Z0-9\._-]+/;

export const ONCHAIN_EVENT = {
  ERC721_TRANSFER_SIGNATURE:
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
};

export const TOTAL_CONTRACT_COUNT = NFTTicketAddressArray.length;

export const FIXED_RPC_PROVIDER =
  process.env.IS_ZKEVM === true
    ? new ethers.providers.StaticJsonRpcProvider(
        process.env.TESTNET_RPC_PROVIDER,
      )
    : new ethers.providers.StaticJsonRpcProvider(
        process.env.MAINNET_RPC_PROVIDER,
      );

export const TIME_ZONE = 'Asia/Tokyo';

export const DATE_LOCAL_LANGUAGE = 'ja-JP';

export const DATE_OPTION_DAY_TIME = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export const BLOCKCHAIN_EXPLORER_URL =
  process.env.IS_ZKEVM === true
    ? 'https://zkatana.blockscout.com/tx/' //zkevm
    : 'https://astar.subscan.io/tx/'; //astar
