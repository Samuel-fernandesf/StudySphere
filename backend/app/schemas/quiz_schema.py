from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from models.quiz import DificuldadeQuiz

class AlternativaSchema(Schema):
    id = fields.Int(dump_only=True)
    questao_id = fields.Int(dump_only=True)
    texto = fields.Str(required=True)
    is_correta = fields.Bool(dump_only=True)
    ordem = fields.Int(required=True)

class AlternativaPublicaSchema(Schema):
    """Schema sem revelar resposta correta"""
    id = fields.Int(dump_only=True)
    questao_id = fields.Int(dump_only=True)
    texto = fields.Str(required=True)
    ordem = fields.Int(required=True)

class QuestaoSchema(Schema):
    id = fields.Int(dump_only=True)
    quiz_id = fields.Int(dump_only=True)
    enunciado = fields.Str(required=True)
    ordem = fields.Int(required=True)
    pontos = fields.Int(required=True)
    alternativas = fields.List(fields.Nested(AlternativaSchema), dump_only=True)

class QuestaoPublicaSchema(Schema):
    """Schema sem revelar respostas corretas"""
    id = fields.Int(dump_only=True)
    quiz_id = fields.Int(dump_only=True)
    enunciado = fields.Str(required=True)
    ordem = fields.Int(required=True)
    pontos = fields.Int(required=True)
    alternativas = fields.List(fields.Nested(AlternativaPublicaSchema), dump_only=True)

class TagQuizSchema(Schema):
    id = fields.Int(dump_only=True)
    quiz_id = fields.Int(dump_only=True)
    nome = fields.Str(required=True)

class QuizSchema(Schema):
    id = fields.Int(dump_only=True)
    titulo = fields.Str(required=True)
    descricao = fields.Str(allow_none=True)
    materia = fields.Str(required=True)
    dificuldade = EnumField(DificuldadeQuiz, dump_only=True)
    tempo_estimado = fields.Int(allow_none=True)
    criador_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    is_publico = fields.Bool(dump_only=True)
    total_questoes = fields.Method("get_total_questoes")
    total_tentativas = fields.Method("get_total_tentativas")
    tags = fields.List(fields.Nested(TagQuizSchema), dump_only=True)
    
    def get_total_questoes(self, obj):
        return obj.questoes.count() if hasattr(obj, 'questoes') else 0
    
    def get_total_tentativas(self, obj):
        return obj.tentativas.count() if hasattr(obj, 'tentativas') else 0

class QuizDetalhadoSchema(QuizSchema):
    """Schema com questões incluídas (para jogar)"""
    questoes = fields.List(fields.Nested(QuestaoPublicaSchema), dump_only=True)

class TentativaQuizSchema(Schema):
    id = fields.Int(dump_only=True)
    quiz_id = fields.Int(dump_only=True)
    usuario_id = fields.Int(dump_only=True)
    pontuacao = fields.Int(dump_only=True)
    pontuacao_maxima = fields.Int(dump_only=True)
    tempo_gasto = fields.Int(allow_none=True)
    data_tentativa = fields.DateTime(dump_only=True)
    concluido = fields.Bool(dump_only=True)
    percentual = fields.Method("get_percentual")
    
    def get_percentual(self, obj):
        if obj.pontuacao_maxima > 0:
            return round((obj.pontuacao / obj.pontuacao_maxima) * 100, 2)
        return 0

class RespostaUsuarioSchema(Schema):
    id = fields.Int(dump_only=True)
    tentativa_id = fields.Int(dump_only=True)
    questao_id = fields.Int(dump_only=True)
    alternativa_id = fields.Int(allow_none=True)
    is_correta = fields.Bool(dump_only=True)
