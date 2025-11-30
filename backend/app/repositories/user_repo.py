from models import Usuario
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from utils.db import db
from typing import List

class UserRepository:

    #Métodos de Busca
    def get_all_users(self) -> List[Usuario]:
        return Usuario.query.all()       
    
    def get_by_id(self, user_id: int) -> Usuario | None:
        return Usuario.query.get(user_id)
    
    def get_by_email(self, email: str) -> Usuario | None:
        return Usuario.query.filter_by(email=email).first()
    
    def get_by_username(self, username: str) -> Usuario | None:
        return Usuario.query.filter_by(username=username).first()
    
    
    #Métodos de Cadastro e Edição
    def update_and_commit(self, usuario:Usuario):
        db.session.commit()

    def update_password(self, user: Usuario, new_password: str):
        user.cripto_pwd = new_password
        db.session.commit()

    def update_profile(self, user:Usuario, new_user_data: dict) -> Usuario:

        new_username = new_user_data.get('username')
        if 'username' in new_user_data:

            if not new_username or not isinstance(new_username, str) or new_username.strip() == "":
                raise ValueError('Nome de usuário é obrigatório e não pode ser vazio.')

            if new_username != user.username:
                if Usuario.query.filter(Usuario.username == new_username,
                                        Usuario.id != user.id).first():
                    raise ValueError('Nome de usuário já existente. Tente outro.')

                user.username = new_username

        new_nome_completo = new_user_data.get('nome_completo')
        if 'nome_completo' in new_user_data:

            if not new_nome_completo or not isinstance(new_nome_completo, str) or new_nome_completo.strip() == "":
                raise ValueError('Nome de completo é obrigatório e não pode ser vazio.')
            
            user.nome_completo = new_nome_completo

        new_curso = new_user_data.get('curso')
        if 'curso' in new_user_data:
             user.curso = new_curso

        new_biografia = new_user_data.get('biografia')
        if 'biografia' in new_user_data:
             user.biografia = new_biografia

        new_nascimento = new_user_data.get('nascimento')
        if 'nascimento' in new_user_data:

            if not new_nascimento or not isinstance(new_nascimento, str) or new_nascimento.strip() == "":
                raise ValueError('A data de nascimento é obrigatória e deve ser fornecida.')
            try:
                if "-" in new_nascimento:
                    #Converte string para o objeto datetime.date
                    date_object = datetime.strptime(new_nascimento, "%Y-%m-%d").date()
                else:
                    # Caso venha em outro formato (fallback)
                    date_object = datetime.strptime(
                        new_nascimento,
                        "%a, %d %b %Y %H:%M:%S %Z"
                    ).date()

                user.nascimento = date_object
            except ValueError:
                raise ValueError('Formato de data de nascimento inválido.')

        try:
            db.session.add(user)
            db.session.commit()
            return user
        
        except IntegrityError as e:
            db.session.rollback()
            raise ValueError('Erro de integridade do banco de dados')
        
        except Exception as e:
            db.session.rollback()
            raise e

    def create_user(self, user_data: dict) -> Usuario:

        data_nascimento = user_data.get('nascimento')
        if data_nascimento and isinstance(data_nascimento, str):
            try:
                if "-" in data_nascimento:
                    #Converte string para o objeto datetime.date
                    date_object = datetime.strptime(data_nascimento, "%Y-%m-%d").date()
                else:
                    # Caso venha em outro formato (fallback)
                    date_object = datetime.strptime(
                        data_nascimento,
                        "%a, %d %b %Y %H:%M:%S %Z"
                    ).date()

                user_data['nascimento'] = date_object
            except ValueError:
                raise ValueError('Formato de data de nascimento inválido.')

        user = Usuario(**user_data)
        db.session.add(user)
        db.session.commit()

        return user


       