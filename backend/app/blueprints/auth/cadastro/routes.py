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


    
    
    
    

   

@cadastro.route('/ocupacao/idade/info', methods=['GET', 'POST'])
def cadastro_04():

    if ('email' not in session) or ('senha' not in session) or ('tipo_conta' not in session) or ('nascimento' not in session):
        flash(f'Por favor preencha os dados!', 'warning' )
        return redirect(url_for('cadastro.cadastro_01'))
    
    form = Cadastro_Formulario_Pagina4()

    if request.method == 'GET':
        if session.get('nome_completo') is not None:
            form.nome.data = session['nome_completo']
            
        if session.get('username') is not None:
            form.usuario.data = session['username']

    if form.validate_on_submit():
        session['nome_completo'] = form.nome.data
        session['username'] = form.usuario.data

        dados_usuario = {
            'email': session.get('email'),
            'senha': session.get('senha'),
            'tipo_conta': session.get('tipo_conta'),
            'nome_completo': session.get('nome_completo'),
            'username': session.get('username'),
            'nascimento': session.get('nascimento')
        }
        try:
            user = userRepository.create_user(user_data=dados_usuario)

            session.clear() #Limpa toda sessão
            session['email'] = user.email #Armazenar apenas o email na sessão

            send_confirm_email(user) #Chama a função de enviar o email
            flash(f'Um email foi enviado para confirmação. Caso não encontre, verifique a caixa de SPAM', 'warning' )
            return redirect(url_for('cadastro.confirm_email_request'))

        except Exception as e:
            flash('Ocorreu um erro ao finalizar seu cadastro. Tente novamente.', 'danger')
            print(e)
            return redirect(url_for('cadastro.cadastro_01'))
            
    
    return render_template('cadastro_04.html', title='Cadastre-se', form= form)

