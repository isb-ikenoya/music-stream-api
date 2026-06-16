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
import {
  dynamoClient,
  MusicTrack,
  TRACKS_TABLE_NAME,
} from "../shared/dynamoSettings";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const allItems: MusicTrack[] = [];
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;

  try {
    do {
      const command: ScanCommand = new ScanCommand({
        TableName: TRACKS_TABLE_NAME,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const response = await dynamoClient.send(command);

      if (response.Items) {
        // unmarshall したデータを「as MusicTrack」で安全に型アサーション
        const unmarshalledItems = response.Items.map(
          (item) => unmarshall(item) as MusicTrack,
        );
        allItems.push(...unmarshalledItems);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`✨ 全件取得完了！ 合計: ${allItems.length} 件`);

    for (const track of allItems) {
      console.log(
        `[${track.songId}] ${track.songName} (${track.durationSeconds}秒)`,
      );
    }
    return successResponse(allItems);
  } catch (error) {
    console.error("❌ 全件取得中にエラーが発生しました:", error);
    return errorResponse(500, "全件取得エラー");
  }
};
