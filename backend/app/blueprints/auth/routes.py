from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from repositories import userRepository, tokenRepository
from utils.db import db
from flask_jwt_extended import (jwt_required, 
                                create_access_token, 
                                create_refresh_token, 
                                get_jwt_identity, 
                                get_jwt)
from . import auth

@auth.route("/check-email", methods=["GET"])
def check_email():
    email = request.args.get("email")
    if not email:
        return jsonify({"message": "Email não enviado"}), 400

    user = userRepository.get_by_email(email=email)
    return jsonify({"exists": bool(user)}), 200

@auth.route("/check-username", methods=["GET"])
def check_username():
    username = request.args.get("username")
    if not username:
        return jsonify({"message": "Username não enviado"}), 400

    user = userRepository.get_by_username(username=username)
    return jsonify({"exists": bool(user)}), 200

@auth.route('/register', methods=['POST'])
def register():
    dados = request.get_json()
    
    if userRepository.get_by_email(email=dados.get('email')):
        return jsonify({'message': 'E-mail já existente. Tente outro.'}), 400
    if userRepository.get_by_username(username=dados.get('username')):
        return jsonify({'message': 'Nome de usuário já existente. Tente outro.'}), 400

    try:
        userRepository.create_user(dados)
        return jsonify({'message': 'Cadastrado realizado com sucesso! Faça o Login.'}), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Erro ao salvar no banco'}), 500

@auth.route('/login', methods=['POST'])
def login():
    dados = request.get_json()

    user = userRepository.get_by_email(email=dados.get('email'))

    if user and user.conversor_pwd(dados.get('senha')):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify(
            {
                'message': 'Login bem-sucedido.',
                'tokens': {
                    'access_token': access_token,
                    'refresh_token': refresh_token}}), 200
    else:
        return jsonify({'message': 'Credenciais inválidas.'}), 401

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_access():
    identity = get_jwt_identity()
    new_access_token = create_access_token(identity=identity)

    return jsonify({'access_token':new_access_token}), 200

@auth.route('/logout', methods=['POST'])
@jwt_required(verify_type=False)
def logout():
    jwt = get_jwt()
    identity = get_jwt_identity()
    jti = jwt['jti']

    tokenRepository.revoke_token(jti=jti, user_id=identity)
    return jsonify({'message': 'Logout efetuado com sucesso.'}), 200
