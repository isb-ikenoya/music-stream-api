import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import * as dotenv from "dotenv";
dotenv.config();

// 💡 クライアントの設定
const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
    sessionToken: "dummy-token", // 古いトークンをこれで強制上書きして黙らせます
  },
});

const TABLE_NAME = "music_tracks";

// パブリックなら認証不要なので、そのままRaw URLを指定するだけ
const RAW_JSON_URL = process.env.DYNAMO_ITEM_JSON;

interface MusicItem {
  songId: { S: string }; // ➔ 修正: 文字列型オブジェクト
  songName: { S: string }; // ➔ 修正: 文字列型オブジェクト
  artistId: { S: string }; // ➔ 修正: 文字列型オブジェクト
  audioS3Key: { S: string }; // ➔ 修正: 文字列型オブジェクト
  durationSeconds: { N: string }; // ➔ 修正: 数値型オブジェクト（DynamoDB内では文字の"180"で扱うためstring）
  [key: string]: AttributeValue; // ➔ 修正: AWS SDK公式の型を適用
}

async function run(): Promise<void> {
  try {
    console.log(
      "GitHub（パブリックレポ）から最新の music_items.json を取得中...",
    );

    // 💡 ヘッダーも完全に空っぽでOK
    if (RAW_JSON_URL) {
      const response = await fetch(RAW_JSON_URL);

      if (!response.ok) {
        throw new Error(
          `データの取得に失敗しました: ${response.status} ${response.statusText}`,
        );
      }

      const items = (await response.json()) as MusicItem[];
      console.log(
        `取得成功！ 計 ${items.length} 件のデータをDynamoDBへ同期します...`,
      );

      for (const item of items) {
        const command = new PutItemCommand({
          TableName: TABLE_NAME,
          Item: item,
        });

        await client.send(command);
        console.log(`   ✅ 同期: ID: ${item.songId?.S}`);
      }

      console.log("全データのDynamoDBインポートが正常に完了しました！");
    } else {
      throw new Error(
        "RAW_JSON_URL が定義されていません。環境変数などを確認してください。",
      );
    }
  } catch (error) {
    console.error("❌ インポート中にエラーが発生しました:", error);
    const maybeProcess = (globalThis as any).process;
    if (maybeProcess && typeof maybeProcess.exit === "function") {
      maybeProcess.exit(1);
    }
    throw error;
  }
}

run();
