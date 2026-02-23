FROM python:3.12-slim-bookworm

USER root
# 署名エラーの原因となるファイルを削除
RUN rm -f /etc/apt/sources.list.d/yarn.list /etc/apt/sources.list.d/nodesource.list

# pycファイルを作らないように設定
ENV PYTHONDONTWRITEBYTECODE=1
# 標準出力をバッファリングしない（ログを即座にCloudWatch等に出すため）
ENV PYTHONUNBUFFERED=1

WORKDIR /project

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 80

CMD ["gunicorn", "--bind", "0.0.0.0:80", "app.wsgi:app"]
