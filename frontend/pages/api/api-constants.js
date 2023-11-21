export const API_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
};

export const API_RESPONSE = {
  // 正常系
  OK: {
    CODE: 200,
  },
  CREATED: {
    CODE: 201,
  },

  // クライアント側の異常系
  BAD_REQUEST: {
    CODE: 400,
    MESSAGE: 'bad request error',
  },
  UNAUTHORIZED: {
    CODE: 401,
    MESSAGE: 'authentication error',
  },

  // システム側のエラー
  INTERNAL_SERVER_ERROR: {
    CODE: 500,
    MESSAGE: 'internal server error',
  },
  UNAUTHORIZED: {
    CODE: 503,
    MESSAGE: 'service unavailable error',
  },
};

export const LOCAL_CONFIG = {
  DUMMY_ACCESS_KEY_ID: 'fakeMyKeyId',
  DUMMY_SECRET_ACCESS_KEY: 'fakeSecretAccessKey',
  REGION: 'ap-northeast-1',
  ENDPOINT: 'http://localhost:8000', // DynamoDB Localが起動しているエンドポイントを指定
};

export const PROD_CONFIG = {
  REGION: 'ap-northeast-1',
};
