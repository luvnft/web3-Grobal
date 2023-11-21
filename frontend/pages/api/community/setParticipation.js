import * as util from 'util';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
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
    // リクエストパラメータのチェック
    if (
      !ethers.utils.isAddress(req.body.walletAddress) ||
      !Number.isInteger(Number(req.body.communityId)) || // 数字の文字列の場合はエラーとなる
      req.body.communityName === '' ||
      req.body.sig === '' ||
      req.body.ticketOperation === '' ||
      isNaN(req.body.tokenId) ||
      req.body.tokenId === ''
    ) {
      // エラー原因解明のためのログ
      console.error('setParticipation PARAMETER ERROR');
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

    // 署名の検証
    const digest = ethers.utils.hashMessage(
      JSON.stringify(req.body.ticketOperation),
    );
    const recoveredAddress = ethers.utils.recoverAddress(digest, req.body.sig);
    if (
      recoveredAddress.toLowerCase() != req.body.walletAddress.toLowerCase()
    ) {
      // エラー原因解明のためのログ
      console.error('setParticipation INVALID SIGNATURE ERROR');
      console.log(
        util.inspect(req.body, {
          depth: Infinity,
          breakLength: Infinity,
          compact: true,
        }),
      );

      res.status(API_RESPONSE.BAD_REQUEST.CODE).json({
        status: API_STATUS.FAILED,
        message: '署名が正しくありません',
      });
      return;
    }
    if (Date.now() - req.body.ticketOperation.nftTicket.date > 300 * 1000) {
      // エラー原因解明のためのログ
      console.error('setParticipation SIGNATURE TIMEOUT ERROR');
      console.log(
        util.inspect(req.body, {
          depth: Infinity,
          breakLength: Infinity,
          compact: true,
        }),
      );

      res.status(API_RESPONSE.BAD_REQUEST.CODE).json({
        status: API_STATUS.FAILED,
        message: '署名をしてから時間が経ちすぎています',
      });
      return;
    }

    const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
    const date = new Date();

    const participationCommand = new PutCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_PARTICIPATION_TABLE_NAME
          : process.env.PROD_PARTICIPATION_TABLE_NAME,
      Item: {
        walletAddress: req.body.walletAddress.toLowerCase(),
        communityId: String(req.body.communityId),
        expire: process.env.COUPON_EXPIRE,
        status: DB_CONSUME_FLAG.NOT_CONSUMED, // クーポン未使用のステータスを指定
        usedAt: DB_USED_AT_UNKNOWN,
        createdAt: String(date),
        updatedAt: String(date),
      },
    });
    const communityCommand = new UpdateCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_COMMUNITY_TABLE_NAME
          : process.env.PROD_COMMUNITY_TABLE_NAME,
      Key: {
        communityName: req.body.communityName,
        owner: req.body.owner.toLowerCase(),
      },
      UpdateExpression: 'set updatedAt = :y add participants :x',
      ExpressionAttributeValues: {
        ':x': 1,
        ':y': String(date),
      },
    });
    const ticketCommand = new UpdateCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_TICKET_TABLE_NAME
          : process.env.PROD_TICKET_TABLE_NAME,
      Key: {
        walletAddress: req.body.walletAddress.toLowerCase(),
        contractAndId: `${ERC2771NFTAddress}#${req.body.tokenId}`,
      },
      UpdateExpression: 'set #a = :x, #b = :y, #c = :z',
      ExpressionAttributeNames: {
        '#a': 'status',
        '#b': 'updatedAt',
        '#c': 'usedAt',
      },
      ExpressionAttributeValues: {
        ':x': DB_CONSUME_FLAG.CONSUMED,
        ':y': String(date),
        ':z': String(date),
      },
    });

    const participationOutput = await documentClient.send(participationCommand);
    const communityOutput = await documentClient.send(communityCommand);
    const ticketOutput = await documentClient.send(ticketCommand);
    res
      .status(API_RESPONSE.CREATED.CODE)
      .json({ status: API_STATUS.SUCCESS, output: participationOutput });
  } catch (err) {
    // エラー原因解明のためのログ
    console.error('setParticipation ERROR');
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
