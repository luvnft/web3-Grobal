import * as util from 'util';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
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
    if (!ethers.utils.isAddress(req.body.walletAddress)) {
      // エラー原因解明のためのログ
      console.error('getSomeTicket PARAMETER ERROR');
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
    const command = new QueryCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_TICKET_TABLE_NAME
          : process.env.PROD_TICKET_TABLE_NAME,
      Limit: 20,
      ExpressionAttributeValues: {
        ':walletAddress': req.body.walletAddress.toLowerCase(),
        ':contractAddress': ERC2771NFTAddress,
      },
      KeyConditionExpression: 'walletAddress = :walletAddress',
      FilterExpression: 'contractAddress = :contractAddress',
    });

    const output = await documentClient.send(command);
    res
      .status(API_RESPONSE.OK.CODE)
      .json({ status: API_STATUS.SUCCESS, output: output });
  } catch (err) {
    // エラー原因解明のためのログ
    console.error('getSomeTicket ERROR');
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
