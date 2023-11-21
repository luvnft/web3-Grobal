import * as util from 'util';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
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
    // パラメータなしのため、リクエストパラメータのチェックはしない

    const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
    const command = new ScanCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_COMMUNITY_TABLE_NAME
          : process.env.PROD_COMMUNITY_TABLE_NAME,
      Limit: 20,
    });
    const output = await documentClient.send(command);
    res
      .status(API_RESPONSE.OK.CODE)
      .json({ status: API_STATUS.SUCCESS, output: output });
  } catch (err) {
    // エラー原因解明のためのログ
    console.error('getSomeCommunity ERROR');
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
