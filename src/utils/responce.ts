import { APIGatewayProxyResult } from "aws-lambda";

/**
 * 成功時のレスポンス
 * @param {T} body
 * @returns {APIGatewayProxyResult} レスポンス
 */
export const successResponse = <T>(body: T): APIGatewayProxyResult => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
};

/**
 * エラー発生時のレスポンス
 * @param {number} statusCode ステータスコード
 * @param {string} message メッセージ
 * @returns {APIGatewayProxyResult} レスポンス
 */
export const errorResponse = (
  statusCode: number,
  message: string,
): APIGatewayProxyResult => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: message,
    }),
  };
};
