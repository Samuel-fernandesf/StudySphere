from utils.db import db
from datetime import datetime

class File(db.Model):
    __tablename__ = 'file'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=True)
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # em bytes
    mime_type = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    user = db.relationship('Usuario', backref=db.backref('files', lazy='dynamic'))
    subject = db.relationship('Subject', backref=db.backref('files', lazy='dynamic'))
    folder = db.relationship('Folder', backref=db.backref('files', lazy='dynamic'))

    def __init__(self, user_id, filename, original_filename, file_path, file_size, mime_type=None, subject_id=None, folder_id=None):
        self.user_id = user_id
        self.subject_id = subject_id
        self.folder_id = folder_id
        self.filename = filename
        self.original_filename = original_filename
        self.file_path = file_path
        self.file_size = file_size
        self.mime_type = mime_type

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subject_id': self.subject_id,
            'folder_id': self.folder_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'name': self.original_filename,  # alias para compatibilidade
            'file_path': self.file_path,
            'size': self.file_size,
            'mime_type': self.mime_type,
            'url': f'/api/files/{self.id}/download',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
