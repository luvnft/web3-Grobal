import * as util from 'util';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ethers } from 'ethers';
import {
  API_STATUS,
  API_RESPONSE,
  LOCAL_CONFIG,
  PROD_CONFIG,
} from 'pages/api/api-constants';

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
      !ethers.utils.isAddress(req.body.owner) ||
      req.body.communityName === '' ||
      req.body.building === '' ||
      req.body.shopName === '' ||
      req.body.location === '' ||
      isNaN(req.body.capacity) ||
      req.body.expire === ''
    ) {
      // エラー原因解明のためのログ
      console.error('setCommunity PARAMETER ERROR');
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
    const randomId = Math.floor(Math.random() * 10000000000000);

    const communityCommand = new PutCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_COMMUNITY_TABLE_NAME
          : process.env.PROD_COMMUNITY_TABLE_NAME,
      Item: {
        communityName: req.body.communityName,
        owner: req.body.owner.toLowerCase(),
        communityId: String(randomId),
        description: req.body.description,
        building: req.body.building,
        shopName: req.body.shopName,
        location: req.body.location,
        capacity: req.body.capacity,
        participants: 1, // コミュニティ作成者を参加者とするので、1を挿入する
        expire: req.body.expire,
        createdAt: String(date),
        updatedAt: String(date),
      },
    });
    const participationCommand = new PutCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_PARTICIPATION_TABLE_NAME
          : process.env.PROD_PARTICIPATION_TABLE_NAME,
      Item: {
        walletAddress: req.body.owner.toLowerCase(),
        communityId: String(randomId),
        createdAt: String(date),
        updatedAt: String(date),
      },
    });

    const communityOutput = await documentClient.send(communityCommand);
    const participationOutput = await documentClient.send(participationCommand);
    res
      .status(API_RESPONSE.CREATED.CODE)
      .json({ status: API_STATUS.SUCCESS, output: communityOutput });
  } catch (err) {
    // エラー原因解明のためのログ
    console.error('setCommunity ERROR');
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
