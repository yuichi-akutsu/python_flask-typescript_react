# --- Stage 1: Build ---
# ビルド用のNode.js環境
FROM node:20-slim AS builder

WORKDIR /app

# 依存関係のインストール (キャッシュ利用のため先にコピー)
COPY package*.json ./
RUN npm ci

# ソースコードをコピーしてビルド
COPY . .
# TypeScriptのコンパイルとバンドル実行 -> /app/dist が生成される
RUN npm run build

# --- Stage 2: Serve ---
# 本番配信用の軽量Nginx環境
FROM nginx:alpine

# Nginxの設定ファイルをコピー（後で作ります）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物(Stage 1)をNginxの公開フォルダにコピー
# ※ Viteなら /app/dist, CRAなら /app/build です
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
