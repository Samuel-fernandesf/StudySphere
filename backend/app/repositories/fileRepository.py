from models.file import File
from utils.db import db
import os
from werkzeug.utils import secure_filename
import uuid

def get_files_by_user(user_id, subject_id=None):
    """Retorna arquivos do usuário, com filtro opcional por matéria"""
    query = File.query.filter_by(user_id=user_id)
    
    if subject_id is not None:
        query = query.filter_by(subject_id=subject_id)
    
    return query.order_by(File.created_at.desc()).all()

def get_file_by_id(file_id):
    """Retorna um arquivo específico pelo ID"""
    return File.query.get(file_id)

def create_file(user_id, original_filename, file_path, file_size, mime_type=None, subject_id=None):
    """Cria um novo registro de arquivo"""
    # Gerar nome único para o arquivo
    file_extension = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    file_record = File(
        user_id=user_id,
        filename=unique_filename,
        original_filename=original_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=mime_type,
        subject_id=subject_id
    )
    db.session.add(file_record)
    db.session.commit()
    return file_record

def delete_file(file_id):
    """Deleta um arquivo do banco e do sistema de arquivos"""
    file_record = File.query.get(file_id)
    if not file_record:
        return False
    
    # Deletar arquivo físico se existir
    if os.path.exists(file_record.file_path):
        try:
            os.remove(file_record.file_path)
        except Exception as e:
            print(f"Erro ao deletar arquivo físico: {e}")
    
    # Deletar registro do banco
    db.session.delete(file_record)
    db.session.commit()
    return True

def get_total_storage_used(user_id):
    """Retorna o total de armazenamento usado pelo usuário em bytes"""
    result = db.session.query(db.func.sum(File.file_size)).filter_by(user_id=user_id).scalar()
    return result or 0
