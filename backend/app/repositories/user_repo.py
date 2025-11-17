from models import Usuario
from schemas import UserSchema
from datetime import datetime
from utils.db import db

class UserRepository:

    #Métodos de Busca
    def get_all_users(self):
        users = Usuario.query.all()
        schema = UserSchema(many=True)
        users_data = schema.dump(users)

        return users_data
    
    def get_by_id(self, user_id: int) -> Usuario | None:
        return Usuario.query.get(user_id)
    
    def get_by_email(self, email: str) -> Usuario | None:
        return Usuario.query.filter_by(email=email).first()
    
    def get_by_username(self, username: str) -> Usuario | None:
        return Usuario.query.filter_by(username=username).first()
    
    
    #Métodos de Cadastro e Edição
    def update_password(self, user: Usuario, new_password: str):
        user.cripto_pwd = new_password
        db.session.commit()

    def update_and_commit(self, usuario:Usuario):
        db.session.commit()

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
                user_data['nascimento'] = None

        user = Usuario(**user_data)
        db.session.add(user)
        db.session.commit()

        return user


       