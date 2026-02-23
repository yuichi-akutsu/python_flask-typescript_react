import os


class Config:
    # DB接続情報
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '5432')
    DB_USER = os.environ.get('DB_USER', 'user')
    DB_PASS = os.environ.get('DB_PASSWORD', 'password')
    DB_NAME = os.environ.get('DB_NAME', 'myappdb')

    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    COGNITO_END_POINT = os.getenv(
        'COGNITO_END_POINT', 'http://host.docker.internal:9229')
    COGNIT_USER_POOL_ID = os.getenv(
        'COGNIT_USER_POOL_ID', 'local_7KRcM6xl')
    COGNIT_JWT_ALGORITHM = 'RS256'
