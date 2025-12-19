from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from repositories import fileRepository
from werkzeug.utils import secure_filename
import os
import uuid

files_bp = Blueprint('files', __name__)

# Configuração de upload
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'mp3', 'mp4', 'avi', 'mov'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

# Criar diretório de uploads se não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    """Verifica se a extensão do arquivo é permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@files_bp.route('/files', methods=['GET'])
@jwt_required()
def get_files():
    """Retorna todos os arquivos do usuário autenticado"""
    try:
        user_id = get_jwt_identity()
        # Garantir que user_id é inteiro
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        # Parâmetros para filtrar por matéria e pasta
        subject_id = request.args.get('subject_id', type=int)
        folder_id = request.args.get('folder_id', type=int)
        
        files = fileRepository.get_files_by_user(user_id, subject_id, folder_id)
        return jsonify({
            'files': [file.to_dict() for file in files],
            'subject_id': subject_id,
            'folder_id': folder_id
        }), 200
    except Exception as e:
        import traceback
        print(f"Erro ao listar arquivos: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao listar arquivos: {str(e)}'}), 500


@files_bp.route('/files/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """Faz upload de um arquivo"""
    user_id = get_jwt_identity()
    
    # Verificar se o arquivo foi enviado
    if 'file' not in request.files:
        return jsonify({'message': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    
    # Verificar se o arquivo tem nome
    if file.filename == '':
        return jsonify({'message': 'Nome de arquivo inválido'}), 400
    
    # Verificar extensão permitida
    if not allowed_file(file.filename):
        return jsonify({'message': 'Tipo de arquivo não permitido'}), 400
    
    try:
        # Obter subject_id e folder_id se fornecidos
        subject_id = request.form.get('subject_id', type=int)
        folder_id = request.form.get('folder_id', type=int)
        
        # Gerar nome único para o arquivo
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Salvar arquivo
        file.save(file_path)
        
        # Obter tamanho do arquivo
        file_size = os.path.getsize(file_path)
        
        # Verificar tamanho máximo
        if file_size > MAX_FILE_SIZE:
            os.remove(file_path)
            return jsonify({'message': 'Arquivo muito grande. Tamanho máximo: 50 MB'}), 400
        
        # Criar registro no banco
        file_record = fileRepository.create_file(
            user_id=user_id,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=file.content_type,
            subject_id=subject_id,
            folder_id=folder_id
        )
        
        return jsonify({
            'message': 'Arquivo enviado com sucesso!',
            'file': file_record.to_dict()
        }), 201
    except Exception as e:
        print(f"Erro ao fazer upload: {e}")
        # Tentar remover arquivo se houver erro
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'message': 'Erro ao fazer upload do arquivo'}), 500

@files_bp.route('/files/<int:file_id>', methods=['GET'])
@jwt_required()
def get_file(file_id):
    """Retorna informações de um arquivo específico"""
    user_id = get_jwt_identity()
    file_record = fileRepository.get_file_by_id(file_id)
    
    if not file_record:
        return jsonify({'message': 'Arquivo não encontrado'}), 404
    
    
    return jsonify({'file': file_record.to_dict()}), 200

@files_bp.route('/files/<int:file_id>/download', methods=['GET'])
@jwt_required()
def download_file(file_id):
    """Faz download de um arquivo"""
    user_id = get_jwt_identity()
    file_record = fileRepository.get_file_by_id(file_id)
    
    if not file_record:
        return jsonify({'message': 'Arquivo não encontrado'}), 404
    
    
    if not os.path.exists(file_record.file_path):
        return jsonify({'message': 'Arquivo físico não encontrado'}), 404
    
    try:
        # Usar open() para ter mais controle
        response = send_file(
            file_record.file_path,
            as_attachment=True,
            download_name=secure_filename(file_record.original_filename),
            mimetype=file_record.mime_type or 'application/octet-stream'
        )
        
        # Headers críticos para download correto
        response.headers['Content-Disposition'] = f'attachment; filename="{secure_filename(file_record.original_filename)}"'
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Type, Content-Length'
        
        return response
    except Exception as e:
        print(f"Erro ao fazer download: {e}")
        return jsonify({'message': 'Erro ao fazer download do arquivo'}), 500

@files_bp.route('/files/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_file(file_id):
    """Deleta um arquivo"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        file_record = fileRepository.get_file_by_id(file_id)
        
        if not file_record:
            return jsonify({'message': 'Arquivo não encontrado'}), 404
            
        if file_record.user_id != user_id:
             return jsonify({'message': 'Acesso negado'}), 403
        
        fileRepository.delete_file(file_id)
        return jsonify({'message': 'Arquivo deletado com sucesso!'}), 200
    except Exception as e:
        import traceback
        print(f"Erro ao deletar arquivo: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao deletar arquivo: {str(e)}'}), 500

@files_bp.route('/files/storage', methods=['GET'])
@jwt_required()
def get_storage_info():
    """Retorna informações de armazenamento do usuário"""
    user_id = get_jwt_identity()
    
    try:
        total_used = fileRepository.get_total_storage_used(user_id)
        file_count = len(fileRepository.get_files_by_user(user_id))
        
        return jsonify({
            'total_used': total_used,
            'total_used_mb': round(total_used / (1024 * 1024), 2),
            'file_count': file_count
        }), 200
    except Exception as e:
        print(f"Erro ao obter informações de armazenamento: {e}")
        return jsonify({'message': 'Erro ao obter informações de armazenamento'}), 500


@files_bp.route('/files/<int:file_id>/move', methods=['PUT'])
@jwt_required()
def move_file(file_id):
    """Move um arquivo para outra pasta/matéria"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        file_record = fileRepository.get_file_by_id(file_id)
        
        if not file_record:
            return jsonify({'message': 'Arquivo não encontrado'}), 404
        
        if file_record.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        updated_file = fileRepository.move_file(
            file_id=file_id,
            subject_id=data.get('subject_id'),
            folder_id=data.get('folder_id')
        )
        return jsonify({
            'message': 'Arquivo movido com sucesso!',
            'file': updated_file.to_dict()
        }), 200
    except Exception as e:
        import traceback
        print(f"Erro ao mover arquivo: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao mover arquivo: {str(e)}'}), 500


@files_bp.route('/files/<int:file_id>/copy', methods=['POST'])
@jwt_required()
def copy_file(file_id):
    """Copia um arquivo para outra pasta/matéria"""
    try:
        user_id = get_jwt_identity()
        if isinstance(user_id, str):
            user_id = int(user_id)
            
        file_record = fileRepository.get_file_by_id(file_id)
        
        if not file_record:
            return jsonify({'message': 'Arquivo não encontrado'}), 404
        
        if file_record.user_id != user_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        new_file = fileRepository.copy_file(
            file_id=file_id,
            user_id=user_id,
            subject_id=data.get('subject_id'),
            folder_id=data.get('folder_id')
        )
        
        if not new_file:
            return jsonify({'message': 'Erro ao copiar arquivo físico'}), 500
        
        return jsonify({
            'message': 'Arquivo copiado com sucesso!',
            'file': new_file.to_dict()
        }), 201
    except Exception as e:
        import traceback
        print(f"Erro ao copiar arquivo: {e}")
        traceback.print_exc()
        return jsonify({'message': f'Erro ao copiar arquivo: {str(e)}'}), 500
