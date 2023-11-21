import * as util from 'util';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DB_CONSUME_FLAG } from 'components/utils';
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
      !ethers.utils.isAddress(req.body.walletAddress) ||
      !Number.isInteger(Number(req.body.communityId)) || // 数字の文字列の場合はエラーとなる
      req.body.sig === '' ||
      req.body.couponOperation === ''
    ) {
      // エラー原因解明のためのログ
      console.error('setCouponStatus PARAMETER ERROR');
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
      JSON.stringify(req.body.couponOperation),
    );
    const recoveredAddress = ethers.utils.recoverAddress(digest, req.body.sig);
    if (
      recoveredAddress.toLowerCase() != req.body.walletAddress.toLowerCase()
    ) {
      // エラー原因解明のためのログ
      console.error('setCouponStatus INVALID SIGNATURE ERROR');
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
    if (Date.now() - req.body.couponOperation.nftCoupon.date > 300 * 1000) {
      // エラー原因解明のためのログ
      console.error('setCouponStatus SIGNATURE TIMEOUT ERROR');
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

    // ステータスの更新
    const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
    const date = new Date();
    const command = new UpdateCommand({
      TableName:
        process.env.ENVIRONMENT === 'development'
          ? process.env.DEV_PARTICIPATION_TABLE_NAME
          : process.env.PROD_PARTICIPATION_TABLE_NAME,
      Key: {
        walletAddress: req.body.walletAddress.toLowerCase(),
        communityId: req.body.communityId,
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
    const output = await documentClient.send(command);
    res.status(API_RESPONSE.CREATED.CODE).json({
      status: API_STATUS.SUCCESS,
      output: output,
      usedAt: String(date),
    });
  } catch (err) {
    // エラー原因解明のためのログ
    console.error('setCouponStatus ERROR');
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
