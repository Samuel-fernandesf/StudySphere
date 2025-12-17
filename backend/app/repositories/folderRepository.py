from models.folder import Folder
from models.file import File
from utils.db import db


def create_folder(user_id, subject_id, name, parent_id=None, color='#6366f1'):
    """Cria uma nova pasta, verificando limite de profundidade"""
    # Verificar profundidade máxima (10 níveis)
    if parent_id is not None:
        parent = Folder.query.get(parent_id)
        if parent and parent.get_depth() >= 9:  # Pai está no nível 9, filho ficaria no 10
            raise ValueError("Limite máximo de 10 níveis de subpastas atingido")
    
    folder = Folder(
        user_id=user_id,
        subject_id=subject_id,
        name=name,
        parent_id=parent_id,
        color=color
    )
    db.session.add(folder)
    db.session.commit()
    return folder


def get_folders_by_subject(subject_id, parent_id=None):
    """Retorna pastas de uma matéria em um nível específico"""
    query = Folder.query.filter_by(subject_id=subject_id)
    
    if parent_id is None:
        query = query.filter(Folder.parent_id.is_(None))
    else:
        query = query.filter_by(parent_id=parent_id)
    
    return query.order_by(Folder.name).all()


def get_folder_by_id(folder_id):
    """Busca uma pasta pelo ID"""
    return Folder.query.get(folder_id)


def get_folder_path(folder_id):
    """Retorna o caminho completo (breadcrumb) de uma pasta"""
    path = []
    current = Folder.query.get(folder_id)
    
    while current is not None:
        path.insert(0, {'id': current.id, 'name': current.name})
        if current.parent_id:
            current = Folder.query.get(current.parent_id)
        else:
            current = None
    
    return path


def update_folder(folder_id, **kwargs):
    """Atualiza uma pasta existente"""
    folder = Folder.query.get(folder_id)
    if not folder:
        return None
    
    for key, value in kwargs.items():
        if hasattr(folder, key) and key not in ['id', 'user_id', 'subject_id', 'created_at']:
            setattr(folder, key, value)
    
    db.session.commit()
    return folder


def delete_folder(folder_id):
    """Deleta uma pasta e todo seu conteúdo (subpastas e arquivos)"""
    folder = Folder.query.get(folder_id)
    if not folder:
        return False
    
    # Deletar recursivamente subpastas
    subfolders = Folder.query.filter_by(parent_id=folder_id).all()
    for subfolder in subfolders:
        delete_folder(subfolder.id)
    
    # Deletar arquivos da pasta
    from repositories import fileRepository
    files = File.query.filter_by(folder_id=folder_id).all()
    for file in files:
        fileRepository.delete_file(file.id)
    
    # Deletar a pasta
    db.session.delete(folder)
    db.session.commit()
    return True


def delete_folders_by_subject(subject_id):
    """Deleta todas as pastas de uma matéria (usado ao deletar matéria)"""
    # Primeiro pegar pastas raiz e deletar recursivamente
    root_folders = Folder.query.filter_by(subject_id=subject_id, parent_id=None).all()
    for folder in root_folders:
        delete_folder(folder.id)
