# app/routes/users.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Usuario
from repositories import userRepository
from utils.db import db

users = Blueprint('users', __name__)

@users.route('/search')
@jwt_required()
def search_users():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'users': []}), 200

    try:
        # busca por username ou nome_completo (case-insensitive)
        pattern = f"%{q}%"
        found = Usuario.query.filter(
            db.or_(
                Usuario.username.ilike(pattern),
                Usuario.nome_completo.ilike(pattern)
            )
        ).limit(30).all()

        # mapear para JSON simples
        users = []
        current = get_jwt_identity()
        for u in found:
            if int(u.id) == int(current):
                continue
            users.append({
                'id': u.id,
                'username': u.username,
                'nome_completo': u.nome_completo
            })

        return jsonify({'users': users}), 200
    except Exception:
        current_app.logger.exception("Erro na busca de usuários")
        return jsonify({'users': []}), 200

@users.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
   
    try:
        user_id = get_jwt_identity()
        user = userRepository.get_by_id(user_id)

        if not user:
            return jsonify({"error": "Usuário não encontrado."}), 404

        userRepository.delete_user(user)

        return jsonify({"message": "Conta deletada com sucesso."}), 200

    except Exception as e:
        return jsonify({"error": "Ocorreu um erro ao deletar a conta."}), 500