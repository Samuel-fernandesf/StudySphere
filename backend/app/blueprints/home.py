from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, current_user
from repositories import userRepository

home = Blueprint('home', __name__)

@home.route('/me')
@jwt_required()
def me():
    user_id = get_jwt_identity()
    return {'message': 'Dados do Usuário', 'user_details': {'username': current_user.username, 'nome_completo': current_user.nome_completo, 'email': current_user.email, 'nascimento':current_user.nascimento}, 'user_id': user_id}, 200

@home.route('/all')
@jwt_required()
def get_all_users():

    claims = get_jwt()

    if claims.get('is_admin') == True:
        users = userRepository.get_all_users()
        return jsonify({'message': 'All Users', 'users':users}), 200
    return jsonify({'message': 'Acesso não autorizado.'}), 401

@home.route('/')
@jwt_required()
def index():
    return {'message': 'Entrou nessa seção.'}, 200