from flask import session, request, jsonify
from sqlalchemy.exc import IntegrityError
from repositories import userRepository
from utils.db import db
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

    if not user:
        return jsonify({'message': 'Credenciais Inválidas.'}), 401

    if user.conversor_pwd(dados.get('senha')):
        session['user_id'] = user.id
        return jsonify({'user_id': user.id, 'message': 'Login bem-sucedido.'}), 200
    else:
        return jsonify({'message': 'Credenciais inválidas.'}), 401
    
@auth.route('/logout', methods=['POST']) 
def logout():

    print(f"DEBUG FLASK: Conteúdo da Sessão antes do Logout: {session}")
    
    if 'user_id' in session:
        session.pop('user_id', None)
        print("DEBUG FLASK: user_id removido da sessão.")
        return jsonify({'message': 'Logout efetuado com sucesso.'}), 200
    else:
        print("DEBUG FLASK: Nenhuma sessão ativa encontrada (user_id ausente).")
        # Retorne 401 ou 200, dependendo da sua preferência, mas 200 é comum
        return jsonify({'message': 'Logout efetuado (Nenhuma sessão ativa).'}), 200