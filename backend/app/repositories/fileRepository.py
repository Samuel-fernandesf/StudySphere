from models.file import File
from utils.db import db
import os


def get_files_by_user(user_id, subject_id=None, folder_id=None):
    """Retorna arquivos do usuário, com filtro opcional por matéria e pasta"""
    query = File.query.filter_by(user_id=user_id)
    
    if subject_id is not None:
        query = query.filter_by(subject_id=subject_id)
    
    # Filtro por pasta - se folder_id é None, mostrar arquivos na raiz (sem pasta)
    if folder_id is not None:
        query = query.filter_by(folder_id=folder_id)
    elif subject_id is not None:
        # Se temos subject_id mas não folder_id, mostrar apenas arquivos na raiz
        query = query.filter(File.folder_id.is_(None))
    
    return query.order_by(File.created_at.desc()).all()


def get_file_by_id(file_id):
    """Retorna um arquivo específico pelo ID"""
    return File.query.get(file_id)


def create_file(user_id, original_filename, file_path, file_size, mime_type=None, subject_id=None, folder_id=None):
    """Cria um novo registro de arquivo"""
    # Gerar nome único para o arquivo
    from werkzeug.utils import secure_filename
    import uuid
    file_extension = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    file_record = File(
        user_id=user_id,
        filename=unique_filename,
        original_filename=original_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=mime_type,
        subject_id=subject_id,
        folder_id=folder_id
    )
    db.session.add(file_record)
    db.session.commit()
    return file_record


def delete_file(file_id):
    """Deleta um arquivo do banco E do sistema de arquivos"""
    file_record = File.query.get(file_id)
    if not file_record:
        return False
    
    # Deletar arquivo físico se existir
    if os.path.exists(file_record.file_path):
        try:
            os.remove(file_record.file_path)
            print(f"Arquivo físico deletado: {file_record.file_path}")
        except Exception as e:
            print(f"Erro ao deletar arquivo físico {file_record.file_path}: {e}")
    
    # Deletar registro do banco
    db.session.delete(file_record)
    db.session.commit()
    return True


def get_total_storage_used(user_id):
    """Retorna o total de armazenamento usado pelo usuário em bytes"""
    result = db.session.query(db.func.sum(File.file_size)).filter_by(user_id=user_id).scalar()
    return result or 0


def move_file(file_id, subject_id=None, folder_id=None):
    """Move um arquivo para outra pasta/matéria"""
    file_record = File.query.get(file_id)
    if not file_record:
        return None
    
    if subject_id is not None:
        file_record.subject_id = subject_id
    
    # folder_id pode ser None (mover para raiz da matéria)
    file_record.folder_id = folder_id
    
    db.session.commit()
    return file_record


def copy_file(file_id, user_id, subject_id=None, folder_id=None):
    """Copia um arquivo para outra pasta/matéria"""
    import shutil
    import uuid
    
    original = File.query.get(file_id)
    if not original:
        return None
    
    # Copiar arquivo físico
    file_extension = os.path.splitext(original.file_path)[1]
    new_filename = f"{uuid.uuid4()}{file_extension}"
    new_path = os.path.join(os.path.dirname(original.file_path), new_filename)
    
    try:
        shutil.copy2(original.file_path, new_path)
    except Exception as e:
        print(f"Erro ao copiar arquivo físico: {e}")
        return None
    
    # Criar novo registro
    new_file = File(
        user_id=user_id,
        filename=new_filename,
        original_filename=original.original_filename,
        file_path=new_path,
        file_size=original.file_size,
        mime_type=original.mime_type,
        subject_id=subject_id if subject_id is not None else original.subject_id,
        folder_id=folder_id
    )
    db.session.add(new_file)
    db.session.commit()
    return new_file


def delete_files_by_subject(subject_id):
    """Deleta todos os arquivos de uma matéria"""
    files = File.query.filter_by(subject_id=subject_id).all()
    for file in files:
        delete_file(file.id)
