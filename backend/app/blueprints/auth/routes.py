from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from repositories import userRepository, tokenRepository
from models import Usuario
from utils.db import db
from utils.mail import send_confirm_email, send_reset_email
from flask_jwt_extended import (jwt_required, 
                                create_access_token, 
                                create_refresh_token,
                                set_refresh_cookies,
                                unset_jwt_cookies,
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
    email = dados.get('email')
    username = dados.get('username')
    
    if userRepository.get_by_email(email=email):
        return jsonify({'message': 'E-mail já existente. Tente outro.'}), 400
    if userRepository.get_by_username(username=username):
        return jsonify({'message': 'Nome de usuário já existente. Tente outro.'}), 400

    try:
        user = userRepository.create_user(dados)
        # send_confirm_email(user)  # Desabilitado para testes locais
        user.confirm_user = True  # Auto-confirmar usuário para testes
        db.session.commit()
        return jsonify({'message': 'Cadastrado realizado com sucesso! Faça o Login.'}), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Erro ao salvar no banco'}), 500
    except Exception as e:
        db.session.rollback() 
        print(e)
        return jsonify({'message': 'Erro ao enviar e-mail de confirmação.'}), 500

@auth.route('/confirm-email', methods=['POST'])
def confirm_email():
    dados = request.get_json()
    token = dados.get('token')

    if not token:
        return jsonify({'message': 'Token é obrigatório.'}), 400
    
    user = Usuario.verify_confirmation_token(token=token)

    if not user:
        return jsonify({'message':'O token de confirmação é inválido ou expirou'})
    
    if user.confirm_user:
        return jsonify({'message': 'Já confirmado...'}), 401
    
    try:
        user.confirm_user = True
        userRepository.update_and_commit(user)

        return jsonify({'message': 'E-mail confirmado com sucesso!'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erro ao confirmar e-mail no banco de dados.'}), 500 
    
@auth.route('/resend-confirmation', methods=['POST'])
def resend_confirmation():
    dados = request.get_json()
    email = dados.get('email')

    if not email:
        return jsonify({'message': 'Email é obrigatório.'}), 400
    
    user = userRepository.get_by_email(email=email)

    # Por segurança, respondemos com sucesso mesmo se o usuário não existir 
    # para evitar que hackers descubram quais emails estão cadastrados (Enumeration Attack),
    # mas aqui vamos simplificar para sua lógica:
    
    if not user:
        return jsonify({'message': 'Usuário não encontrado.'}), 404

    if user.confirm_user:
        return jsonify({'message': 'Este usuário já está confirmado. Faça login.'}), 400
    
    try:
        send_confirm_email(user)
        return jsonify({'message': 'Novo e-mail de confirmação enviado!'}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Erro ao enviar email.'}), 500
    
@auth.route('/login', methods=['POST'])
def login():
    dados = request.get_json()

    user = userRepository.get_by_email(email=dados.get('email'))

    if user and user.conversor_pwd(dados.get('senha')):

        #Para debug é interessante, porém para casos reais é bom colocar uma mensagem genérica.
        if not user.confirm_user:
            return jsonify({
                'message': 'E-mail não confirmado. Verifique sua caixa de entrada.',
                'error_code': 'EMAIL_NOT_CONFIRMED'}), 403
        
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        response = jsonify(
            {
                'message': 'Login bem-sucedido.',
                'user_id': str(user.id),
                'access_token': access_token,
            })
        
        #cria o cookie com flags (httpOnly)
        set_refresh_cookies(response, refresh_token)
        return response, 200
    else:
        return jsonify({'message': 'Credenciais inválidas.'}), 401

@auth.route('/forgot-password', methods=['POST'])
def forgot_password():
    dados = request.get_json()
    email = dados.get('email')

    user = userRepository.get_by_email(email=email)

    if user:
        send_reset_email(user=user)

    return jsonify({'message':'Se o e-mail existir, as instruções foram enviadas.'}), 200

@auth.route('/reset-password', methods=['POST'])
def reset_password():
    dados = request.get_json()
    token = dados.get('token')
    new_password = dados.get('new_password')

    if not token or not new_password:
        return jsonify({'message': 'Token e nova senha são obrigatórios.'}), 400
    
    user = Usuario.verify_reset_token(token=token)

    if not user:
        return jsonify({'message': 'Token inválido ou expirado.'}), 400
    
    userRepository.update_password(user, new_password)
    return jsonify({'message': 'Senha alterada com sucesso!'}), 200

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True, locations=['cookies'])
def refresh_access():
    identity = get_jwt_identity()
    new_access_token = create_access_token(identity=identity)

    return jsonify({'access_token':new_access_token}), 200

@auth.route('/logout', methods=['POST'])
@jwt_required(verify_type=False)
def logout():
    jwt = get_jwt()
    jti = jwt['jti']
    identity = get_jwt_identity()

    tokenRepository.revoke_token(jti=jti, user_id=identity)

    response = jsonify({'message': 'Logout efetuado com sucesso.'})
    unset_jwt_cookies(response) #remove os cookies
    return response, 200


