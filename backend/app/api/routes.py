from flask import Flask, request, jsonify, g
from sqlalchemy import text
from app.api import bp
from app import login_required, db
import os
import uuid
import boto3
from flask_cors import CORS
from werkzeug.utils import secure_filename


@bp.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@bp.route('/hello', methods=['GET'])
@login_required
def hello():
    return jsonify({"message": f"Hello {g.user.get('username', 'User')}!"})


@bp.route('/db-check', methods=['GET'])
def db_check():
    try:
        # 簡単なSQLを実行して接続確認
        db.session.execute(text('SELECT 1'))
        return jsonify({"status": "success", "message": "Database connection is healthy."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 環境変数からS3バケット名を取得
S3_BUCKET = os.environ.get('S3_BUCKET_NAME', 'photo-bucket')
# IAMロールや環境変数(~/.aws/credentials)から自動的に認証情報を取得します
s3_client = boto3.client(
    's3',
    endpoint_url='http://localstack:4566',  # LocalStack のデフォルトポート
    aws_access_key_id='test',             # LocalStack はダミーの値でOK
    aws_secret_access_key='test',         # LocalStack はダミーの値でOK
    region_name='ap-northeast-1'          # リージョンも任意でOK
)


@bp.route('/upload', methods=['POST'])
def upload_file():
    # 1. リクエストに 'file' が含まれているかチェック
    if 'file' not in request.files:
        return jsonify({'error': 'ファイルが見つかりません'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'ファイルが選択されていません'}), 400

    if file:
        # 2. ファイル名を安全なものに変換し、UUIDを付けて一意にする
        original_filename = secure_filename(file.filename)
        # 拡張子を取得（なければjpgをデフォルトに）
        extension = original_filename.rsplit(
            '.', 1)[1].lower() if '.' in original_filename else 'jpg'
        unique_filename = f"{uuid.uuid4().hex}.{extension}"

        try:
            # 3. S3へ直接ストリームアップロード
            # メモリ上に保持したままS3へ転送するため、ローカルディスクを圧迫しません
            s3_client.upload_fileobj(
                file,
                S3_BUCKET,
                unique_filename,
                ExtraArgs={
                    'ContentType': file.content_type,
                    # 先ほど作成したバッチと連携する場合、ここに初期タグなどを付与できます
                    # 'Tagging': 'CheckStatus=Pending'
                }
            )

            return jsonify({
                'message': 'S3へのアップロードが成功しました',
                'file_key': unique_filename,
                'file_url': f"https://{S3_BUCKET}.s3.amazonaws.com/{unique_filename}"
            }), 200

        except Exception as e:
            print(f"S3 Upload Error: {str(e)}")
            return jsonify({'error': 'S3へのアップロードに失敗しました'}), 500
