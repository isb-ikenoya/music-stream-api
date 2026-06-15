aws dynamodb create-table \
    --table-name music_tracks \
    --attribute-definitions AttributeName=songId,AttributeType=S \
    --key-schema AttributeName=songId,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --no-deletion-protection-enabled \
    --endpoint-url http://localhost:8000 \
    --region us-east-1