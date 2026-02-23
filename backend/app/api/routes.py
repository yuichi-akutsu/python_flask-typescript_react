from flask import jsonify, g
from sqlalchemy import text
from app.api import bp
from app import login_required, db


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
