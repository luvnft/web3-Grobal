import * as util from 'util';
import {
  BICONOMY_API_ENDPOINT,
  BICONOMY_API_CONTENT_TYPE,
  SIGNTYPE_EIP712_SIGN,
} from 'components/utils';
import { NFTTicketAddress } from 'contracts';
import ParticipationTicket from 'contracts/ParticipationTicket.json';
import { Wallet, providers, ethers } from 'ethers';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import { API_STATUS, API_RESPONSE } from 'pages/api/api-constants';

let proxyAgent;
if (process.env.IS_LOCALHOST === true) {
  proxyAgent = new HttpsProxyAgent(process.env.https_proxy);
}

const provider = new providers.JsonRpcProvider(
  process.env.TESTNET_RPC_PROVIDER, //zkevm
);
const signer = new Wallet(
  process.env.OPERATION_PRIVATE_KEY, //zkevm
  provider,
);

export default async function handler(req, res) {
  try {
    // リクエストパラメータのチェック
    if (!ethers.utils.isAddress(req.body.walletAddress)) {
      // エラー原因解明のためのログ
      console.error('MINT TICKET PARAMETER ERROR');
      console.log(
        util.inspect(req.body, {
          depth: Infinity,
          breakLength: Infinity,
          compact: true,
        }),
      );
      res.status(API_RESPONSE.BAD_REQUEST.CODE).json({
        status: API_STATUS.FAILED,
        message: API_RESPONSE.BAD_REQUEST.MESSAGE,
      });
      return;
    }

    const nftInstance = new ethers.Contract(
      process.env.TESTNET_TICKET_NFT_CONTRACT_ADDRESS,
      ParticipationTicket.abi,
      signer,
    );

    const estimatedGasLimit = await nftInstance.estimateGas.mintTicket(
      req.body.walletAddress,
    );
    const populateMetaTx = await nftInstance.populateTransaction.mintTicket(
      req.body.walletAddress,
    );
    populateMetaTx.chainId = process.env.TESTNET_CHAIN_ID; //zkevm
    populateMetaTx.gasLimit = estimatedGasLimit;
    populateMetaTx.gasPrice = await provider.getGasPrice();
    populateMetaTx.nonce = await provider.getTransactionCount(
      process.env.OPERATION_ADDRESS,
    );

    const txSigned = await signer.signTransaction(populateMetaTx);
    const submittedTx = await provider.sendTransaction(txSigned);

    res.status(API_RESPONSE.BAD_REQUEST.CODE).json({
      status: API_STATUS.FAILED,
      message: API_RESPONSE.BAD_REQUEST.MESSAGE,
      output: submittedTx.hash,
    });
  } catch (err) {
    // エラー原因解明のためのログ
    console.error('MINT TICKET ERROR');
    console.log(
      util.inspect(err.message, {
        depth: Infinity,
        breakLength: Infinity,
        compact: true,
      }),
    );
    console.log(
      util.inspect(req, {
        depth: Infinity,
        breakLength: Infinity,
        compact: true,
      }),
    );
    console.log(
      util.inspect(req.body, {
        depth: Infinity,
        breakLength: Infinity,
        compact: true,
      }),
    );

    res.status(API_RESPONSE.INTERNAL_SERVER_ERROR.CODE).json({
      status: API_STATUS.FAILED,
      message: API_RESPONSE.INTERNAL_SERVER_ERROR.MESSAGE,
      output: err,
    });
  }
}
