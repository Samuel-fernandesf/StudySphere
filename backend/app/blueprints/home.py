from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, current_user
from repositories import userRepository
from utils.db import db

home = Blueprint('home', __name__)

@home.route('/me')
@jwt_required()
def me():
    user_id = get_jwt_identity()
    return {'message': 'Dados do Usuário', 'user_details': {'username': current_user.username, 'nome_completo': current_user.nome_completo, 'email': current_user.email, 'nascimento': current_user.nascimento.isoformat() if current_user.nascimento else None, 'curso': current_user.curso, 'biografia': current_user.biografia}, 'user_id': user_id}, 200

@home.route('/all')
@jwt_required()
def get_all_users():

    claims = get_jwt()

    if claims.get('is_admin') == True:
        users = userRepository.get_all_users()
        return jsonify({'message': 'All Users', 'users':users}), 200
    return jsonify({'message': 'Acesso não autorizado.'}), 401

@home.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    from datetime import datetime
    user_id = get_jwt_identity()
    dados = request.get_json()
    
    try:
        user = userRepository.get_by_id(user_id)
        if not user:
            return jsonify({'message': 'Usuário não encontrado'}), 404
        
        # Atualizar campos permitidos
        if 'nome_completo' in dados:
            user.nome_completo = dados['nome_completo']
        if 'curso' in dados:
            user.curso = dados.get('curso')
        if 'biografia' in dados:
            user.biografia = dados.get('biografia')
        if 'nascimento' in dados and dados['nascimento']:
            # Converter string para objeto date
            user.nascimento = datetime.strptime(dados['nascimento'], '%Y-%m-%d').date()
        
        db.session.commit()
        return jsonify({'message': 'Perfil atualizado com sucesso!', 'user': {'nome_completo': user.nome_completo, 'username': user.username, 'email': user.email, 'nascimento': user.nascimento}}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({'message': 'Erro ao atualizar perfil'}), 500

@home.route('/')
@jwt_required()
def index():
    return {'message': 'Entrou nessa seção.'}, 200