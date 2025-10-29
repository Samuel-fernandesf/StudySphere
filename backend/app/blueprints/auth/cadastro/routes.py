from flask import session, request, jsonify
from sqlalchemy.exc import IntegrityError
from repositories import userRepository
from utils.db import db
from . import cadastro

@cadastro.route('/', methods=['POST'])
def cadastrar():
    dados = request.get_json()

    if userRepository.get_by_email(email=dados.get('email')):
        return jsonify({'mensagem': 'E-mail já existente. Tente outro.'}), 400
    if userRepository.get_by_username(username=dados.get('username')):
        return jsonify({'mensagem': 'Nome de usuário já existente. Tente outro.'}), 400
    
    try:
        userRepository.create_user(dados)
        return jsonify({'mensagem': 'Usuário cadastrado com sucesso!'}), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'erro': 'Erro ao salvar no banco'}), 500