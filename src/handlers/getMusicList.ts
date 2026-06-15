import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { errorResponse, successResponse } from "../utils/responce";
import {
  AttributeValue,
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

interface MusicTrack {
  songId: string;
  songName: string;
  artistId: string;
  audioS3Key: string;
  durationSeconds: number; // DynamoDBの"N"は自動で number に変換されます
}

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://dynamodb-local:8000",
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
    sessionToken: "dummy-token",
  },
});

const TABLE_NAME = "music_tracks";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const allItems: MusicTrack[] = []; // 👈 any[] から MusicTrack[] に変更
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;

  try {
    do {
      const command: ScanCommand = new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const response = await client.send(command);

      if (response.Items) {
        // 💡 3. unmarshall したデータを「as MusicTrack」で安全に型アサーション
        const unmarshalledItems = response.Items.map(
          (item) => unmarshall(item) as MusicTrack,
        );
        allItems.push(...unmarshalledItems);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`✨ 全件取得完了！ 合計: ${allItems.length} 件`);

    // 💡 ここでもお好みのプロパティに安全に自動補完（インテリセンス）が効きます！
    for (const track of allItems) {
      console.log(
        `   🎵 [${track.songId}] ${track.songName} (${track.durationSeconds}秒)`,
      );
    }

    return successResponse(allItems);
  } catch (error) {
    console.error("❌ 全件取得中にエラーが発生しました:", error);

    return errorResponse(500, "全件取得エラー");
  }
};
