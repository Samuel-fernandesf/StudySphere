from flask import jsonify
from utils.extensions import jwt
from repositories import userRepository, tokenRepository

# Load User
@jwt.user_lookup_loader
def user_lookup_callback(jwt_headers, jwt_payload):
    identity = jwt_payload['sub']
    user = userRepository.get_by_id(identity)

    return user

# Additional Claims
@jwt.additional_claims_loader
def make_additional_claims(identity):
    user = userRepository.get_by_id(identity)
    is_admin = (user.email == 'samuelfernandesfilho2007@gmail.com')

    return {'username': user.username, 'is_admin': is_admin}

# Revoked token check
@jwt.token_in_blocklist_loader
def token_in_blocklist_callback(jwt_headers, jwt_payload):
    jti = jwt_payload["jti"]
    return tokenRepository.is_revoked(jti=jti)

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'message':'Token expirado.', 'error':'token_expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'message': 'Token inválido.', 'error':'invalid_token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'message': 'Token ausente.', 'error':'authorization_header'}), 401
