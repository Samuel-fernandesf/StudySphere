from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, current_user
from repositories import userRepository
from schemas import user_schema, users_schema
from utils.db import db

home = Blueprint('home', __name__)

@home.route('/me')
@jwt_required()
def me():
    user = current_user
    user_data = user_schema.dump(user)
    return {'message': 'Dados do Usuário', 
            'user_details':user_data, 
            'user_id':current_user.id
            }, 200

@home.route('/all')
@jwt_required()
def get_all_users():
    claims = get_jwt()

    if claims.get('is_admin'):
        users = userRepository.get_all_users()

        users_data = users_schema.dump(users)

        return jsonify({'message': 'All Users', 'users':users_data}), 200
    return jsonify({'message': 'Acesso não autorizado.'}), 403

@home.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = current_user
    dados = request.get_json()
  
    if not user:
        return jsonify({'message': 'Usuário não encontrado'}), 404
    
    try:
        userRepository.update_profile(user, dados)

        #Serialização do Objeto para JSON (dicionário)
        user_data = user_schema.dump(user)
        
        return jsonify({'message': 'Perfil atualizado com sucesso!', 'user':user_data}), 200
    
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({'message': 'Erro ao atualizar perfil'}), 500

@home.route('/')
@jwt_required()
def index():
    return {'message': 'Entrou nessa seção.'}, 200