from functools import wraps
from flask import Flask, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from app.config import Config
from flask_cors import CORS

import jwt
from jwt import PyJWKClient

# DBインスタンスの作成
db = SQLAlchemy()
# CognitoユーザープールのJWKS URL
JWKS_URL = f"{Config.COGNITO_END_POINT}/{Config.COGNIT_USER_POOL_ID}/.well-known/jwks.json"
jwks_client = PyJWKClient(JWKS_URL)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # DBとアプリを紐付け
    db.init_app(app)

    # APIのBlueprintを登録
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app


def login_required(f):
    """
    認証を前提とするAPI用のアノテーション
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"message": "Authorization header is missing"}), 401

        try:
            token = auth_header.split(" ")[1]

            signing_key = jwks_client.get_signing_key_from_jwt(token)
            data = jwt.decode(
                token,
                signing_key.key,
                algorithms=[Config.COGNIT_JWT_ALGORITHM],
                options={"verify_signature": True}
            )

            g.user = data

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({"message": f"Invalid token: {str(e)}"}), 401
        except Exception as e:
            return jsonify({
                "message": "Internal Server Error",
                "error_detail": str(e)
            }), 500

        # 認証後にAPIを実行
        return f(*args, **kwargs)

    return decorated_function
