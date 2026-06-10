const { build } = require("esbuild");
const fs = require("fs");
const path = require("path");

// 1. ハンドラーが格納されているフォルダを指定
const handlersDir = path.join(__dirname, "src/handlers");

// 2. フォルダ内の .ts ファイルを自動的に全取得
const files = fs.readdirSync(handlersDir).filter(file => file.endsWith(".ts"));

// 3. esbuildが理解できる「入力と出力のマップ」を自動生成
// 例: { "getMusicList/index": "src/handlers/getMusicList.ts" }
const entryPoints = {};
files.forEach(file => {
  const name = path.parse(file).name;
  entryPoints[`${name}/index`] = path.join("src/handlers", file);
});

// 4. 一括ビルドを実行
build({
  entryPoints: entryPoints,
  bundle: true,
  minify: true,
  platform: "node",
  target: "node22",
  outdir: "dist", // dist/ の中に出力
}).catch(() => process.exit(1));