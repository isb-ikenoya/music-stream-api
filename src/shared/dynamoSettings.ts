import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

// ローカルかAWS環境での実行かどうか
const isLocal = process.env.AWS_SAM_LOCAL === "true";

// Dynamoクライアントの共通設定（ローカル用は全てダミー）
const dynamoConfig: DynamoDBClientConfig = isLocal
  ? {
      region: "us-east-1",
      endpoint: "http://dynamodb-local:8000",
      credentials: {
        accessKeyId: "fakeMyKeyId",
        secretAccessKey: "fakeSecretAccessKey",
        sessionToken: "dummy-token",
      },
    }
  : {};

export const dynamoClient = new DynamoDBClient(dynamoConfig);

// 楽曲データ用のテーブル名
export const TRACKS_TABLE_NAME =
  process.env.TRACKS_TABLE_NAME || "music_tracks";

export interface MusicTrack {
  songId: string;
  songName: string;
  artistId: string;
  audioS3Key: string;
  durationSeconds: number; // DynamoDBの"N"は自動で number に変換されます
}
