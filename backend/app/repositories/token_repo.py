from models import RevokedToken
from utils.db import db

class TokenRepository:
    def revoke_token(self, jti, user_id):
        if not RevokedToken.query.filter_by(jti=jti).first():
            revoked = RevokedToken(jti=jti, user_id=user_id)
            db.session.add(revoked)
            db.session.commit()

    def is_revoked(self, jti):
        return RevokedToken.query.filter_by(jti=jti).first() is not None
