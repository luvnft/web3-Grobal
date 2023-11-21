import * as util from 'util';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DB_USED_AT_UNKNOWN, DB_CONSUME_FLAG } from 'components/utils';
import { ethers } from 'ethers';
import {
  API_STATUS,
  API_RESPONSE,
  LOCAL_CONFIG,
  PROD_CONFIG,
} from 'pages/api/api-constants';
import { ERC2771NFTAddress } from '../../../contracts';

let dynamoDBClient;
if (process.env.IS_LOCALHOST === true) {
  dynamoDBClient = new DynamoDBClient({
    credentials: {
      accessKeyId: LOCAL_CONFIG.DUMMY_ACCESS_KEY_ID,
      secretAccessKey: LOCAL_CONFIG.DUMMY_SECRET_ACCESS_KEY,
    },
    region: LOCAL_CONFIG.REGION,
    endpoint: LOCAL_CONFIG.ENDPOINT,
  });
} else {
  dynamoDBClient = new DynamoDBClient({
    region: PROD_CONFIG.REGION,
  });
}

export default async function handler(req, res) {
  try {
    // localhostで実行されているかのチェック
    if (process.env.IS_LOCALHOST === false) {
      // エラー原因解明のためのログ
      console.error('setCoupon NOT LOCALHOST ERROR');
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

    // リクエストパラメータのチェック
    if (
      !ethers.utils.isAddress(req.body.walletAddress) ||
      !ethers.utils.isAddress(req.body.smartAccountAddress) ||
      isNaN(req.body.tokenId) ||
      req.body.tokenId === ''
    ) {
      // エラー原因解明のためのログ
      console.error('setTicket PARAMETER ERROR');
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

    const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
    const date = new Date();
    const command = new PutCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_TICKET_TABLE_NAME
          : process.env.PROD_TICKET_TABLE_NAME,
      Item: {
        walletAddress: req.body.walletAddress.toLowerCase(),
        smartAccountAddress: req.body.smartAccountAddress.toLowerCase(),
        contractAndId: `${ERC2771NFTAddress}#${req.body.tokenId}`,
        contractAddress: ERC2771NFTAddress,
        tokenId: req.body.tokenId,
        expire: process.env.TICKET_EXPIRE,
        status: DB_CONSUME_FLAG.NOT_CONSUMED, // クーポン未使用のステータスを指定
        usedAt: DB_USED_AT_UNKNOWN,
        createdAt: String(date),
        updatedAt: String(date),
      },
    });
    const output = await documentClient.send(command);
    res
      .status(API_RESPONSE.CREATED.CODE)
      .json({ status: API_STATUS.SUCCESS, output: output });
  } catch (err) {
    // エラー原因解明のためのログ
    console.error('setTicket ERROR');
    console.log(
      util.inspect(err, {
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
