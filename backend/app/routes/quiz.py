from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.quiz import Quiz, Questao, Alternativa, DificuldadeQuiz
from repositories.quiz_repo import (
    QuizRepository, QuestaoRepository, AlternativaRepository,
    TentativaQuizRepository, RespostaUsuarioRepository, TagQuizRepository
)
from schemas.quiz_schema import (
    QuizSchema, QuizDetalhadoSchema, TentativaQuizSchema,
    QuestaoSchema, AlternativaSchema
)
from utils.db import db

quiz_bp = Blueprint('quizzes', __name__)

# Instanciar repositórios
quizRepository = QuizRepository()
questaoRepository = QuestaoRepository()
alternativaRepository = AlternativaRepository()
tentativaRepository = TentativaQuizRepository()
respostaRepository = RespostaUsuarioRepository()
tagRepository = TagQuizRepository()

# Instanciar schemas
quiz_schema = QuizSchema()
quizzes_schema = QuizSchema(many=True)
quiz_detalhado_schema = QuizDetalhadoSchema()
tentativa_schema = TentativaQuizSchema()
tentativas_schema = TentativaQuizSchema(many=True)

@quiz_bp.route('', methods=['GET'])
@jwt_required()
def list_quizzes():
    """GET /api/quizzes - Lista todos os quizzes disponíveis"""
    try:
        user_id = get_jwt_identity()
        
        # Filtros opcionais
        materia = request.args.get('materia')
        dificuldade = request.args.get('dificuldade')
        
        if materia:
            quizzes = quizRepository.get_by_materia(materia, int(user_id))
        elif dificuldade:
            try:
                dif_enum = DificuldadeQuiz[dificuldade.lower()]
                quizzes = quizRepository.get_by_dificuldade(dif_enum, int(user_id))
            except KeyError:
                return jsonify({'message': 'Dificuldade inválida'}), 400
        else:
            quizzes = quizRepository.get_all_quizzes(int(user_id))
        
        return jsonify(quizzes_schema.dump(quizzes)), 200
    except Exception as e:
        current_app.logger.exception("Erro ao listar quizzes")
        return jsonify({'message': 'Erro ao listar quizzes'}), 500

@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    """GET /api/quizzes/<id> - Obtém detalhes de um quiz específico"""
    try:
        user_id = get_jwt_identity()
        quiz = quizRepository.get_by_id(quiz_id)
        
        if not quiz:
            return jsonify({'message': 'Quiz não encontrado'}), 404
        
        # Verifica se o usuário tem acesso
        if not quiz.is_publico and quiz.criador_id != int(user_id):
            return jsonify({'message': 'Acesso negado'}), 403
        
        return jsonify(quiz_detalhado_schema.dump(quiz)), 200
    except Exception as e:
        current_app.logger.exception("Erro ao obter quiz")
        return jsonify({'message': 'Erro ao obter quiz'}), 500

@quiz_bp.route('', methods=['POST'])
@jwt_required()
def create_quiz():
    """POST /api/quizzes - Cria um novo quiz"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validações básicas
        if not data.get('titulo') or not data.get('materia'):
            return jsonify({'message': 'Título e matéria são obrigatórios'}), 400
        
        # Prepara dados do quiz
        quiz_data = {
            'titulo': data['titulo'],
            'materia': data['materia'],
            'criador_id': int(user_id),
            'descricao': data.get('descricao'),
            'tempo_estimado': data.get('tempo_estimado'),
            'is_publico': data.get('is_publico', True)
        }
        
        # Trata dificuldade
        if data.get('dificuldade'):
            try:
                quiz_data['dificuldade'] = DificuldadeQuiz[data['dificuldade'].lower()]
            except KeyError:
                quiz_data['dificuldade'] = DificuldadeQuiz.medio
        
        # Cria o quiz
        quiz = quizRepository.create_quiz(quiz_data)
        
        # Adiciona questões se fornecidas
        questoes_data = data.get('questoes', [])
        for idx, q_data in enumerate(questoes_data):
            questao = questaoRepository.create_questao({
                'quiz_id': quiz.id,
                'enunciado': q_data['enunciado'],
                'ordem': idx + 1,
                'pontos': q_data.get('pontos', 1)
            })
            
            # Adiciona alternativas
            for alt_idx, alt_data in enumerate(q_data.get('alternativas', [])):
                alternativaRepository.create_alternativa({
                    'questao_id': questao.id,
                    'texto': alt_data['texto'],
                    'is_correta': alt_data.get('is_correta', False),
                    'ordem': alt_idx + 1
                })
        
        # Adiciona tags se fornecidas
        tags_data = data.get('tags', [])
        for tag_nome in tags_data:
            tagRepository.create_tag({
                'quiz_id': quiz.id,
                'nome': tag_nome
            })
        
        return jsonify({
            'message': 'Quiz criado com sucesso',
            'quiz': quiz_detalhado_schema.dump(quiz)
        }), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        current_app.logger.exception("Erro ao criar quiz")
        return jsonify({'message': 'Erro ao criar quiz'}), 500

@quiz_bp.route('/<int:quiz_id>', methods=['PUT'])
@jwt_required()
def update_quiz(quiz_id):
    """PUT /api/quizzes/<id> - Atualiza um quiz"""
    try:
        user_id = get_jwt_identity()
        quiz = quizRepository.get_by_id(quiz_id)
        
        if not quiz:
            return jsonify({'message': 'Quiz não encontrado'}), 404
        
        # Apenas o criador pode editar
        if quiz.criador_id != int(user_id):
            return jsonify({'message': 'Apenas o criador pode editar este quiz'}), 403
        
        data = request.get_json()
        
        # Atualiza campos permitidos
        update_data = {}
        if 'titulo' in data:
            update_data['titulo'] = data['titulo']
        if 'descricao' in data:
            update_data['descricao'] = data['descricao']
        if 'materia' in data:
            update_data['materia'] = data['materia']
        if 'tempo_estimado' in data:
            update_data['tempo_estimado'] = data['tempo_estimado']
        if 'is_publico' in data:
            update_data['is_publico'] = data['is_publico']
        if 'dificuldade' in data:
            try:
                update_data['dificuldade'] = DificuldadeQuiz[data['dificuldade'].lower()]
            except KeyError:
                pass
        
        updated_quiz = quizRepository.update_quiz(quiz, update_data)
        return jsonify({
            'message': 'Quiz atualizado com sucesso',
            'quiz': quiz_schema.dump(updated_quiz)
        }), 200
    except Exception as e:
        current_app.logger.exception("Erro ao atualizar quiz")
        return jsonify({'message': 'Erro ao atualizar quiz'}), 500

@quiz_bp.route('/<int:quiz_id>', methods=['DELETE'])
@jwt_required()
def delete_quiz(quiz_id):
    """DELETE /api/quizzes/<id> - Deleta um quiz"""
    try:
        user_id = get_jwt_identity()
        quiz = quizRepository.get_by_id(quiz_id)
        
        if not quiz:
            return jsonify({'message': 'Quiz não encontrado'}), 404
        
        # Apenas o criador pode deletar
        if quiz.criador_id != int(user_id):
            return jsonify({'message': 'Apenas o criador pode deletar este quiz'}), 403
        
        quizRepository.delete_quiz(quiz)
        return jsonify({'message': 'Quiz deletado com sucesso'}), 200
    except Exception as e:
        current_app.logger.exception("Erro ao deletar quiz")
        return jsonify({'message': 'Erro ao deletar quiz'}), 500

@quiz_bp.route('/<int:quiz_id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(quiz_id):
    """POST /api/quizzes/<id>/submit - Submete respostas de um quiz"""
    try:
        user_id = get_jwt_identity()
        quiz = quizRepository.get_by_id(quiz_id)
        
        if not quiz:
            return jsonify({'message': 'Quiz não encontrado'}), 404
        
        # Verifica se o usuário tem acesso
        if not quiz.is_publico and quiz.criador_id != int(user_id):
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        respostas = data.get('respostas', [])  # [{questao_id, alternativa_id}, ...]
        tempo_gasto = data.get('tempo_gasto')
        
        # Calcula pontuação
        pontuacao = 0
        pontuacao_maxima = 0
        respostas_detalhadas = []
        
        questoes = questaoRepository.get_by_quiz(quiz_id)
        
        for questao in questoes:
            pontuacao_maxima += questao.pontos
            
            # Encontra resposta do usuário para esta questão
            resposta_usuario = next(
                (r for r in respostas if r.get('questao_id') == questao.id),
                None
            )
            
            if resposta_usuario:
                alternativa_id = resposta_usuario.get('alternativa_id')
                alternativa = alternativaRepository.get_by_id(alternativa_id) if alternativa_id else None
                
                is_correta = alternativa.is_correta if alternativa else False
                
                if is_correta:
                    pontuacao += questao.pontos
                
                respostas_detalhadas.append({
                    'questao_id': questao.id,
                    'alternativa_id': alternativa_id,
                    'is_correta': is_correta
                })
        
        # Cria tentativa
        tentativa = tentativaRepository.create_tentativa({
            'quiz_id': quiz_id,
            'usuario_id': int(user_id),
            'pontuacao': pontuacao,
            'pontuacao_maxima': pontuacao_maxima,
            'tempo_gasto': tempo_gasto,
            'concluido': True
        })
        
        # Salva respostas
        for resp in respostas_detalhadas:
            respostaRepository.create_resposta({
                'tentativa_id': tentativa.id,
                'questao_id': resp['questao_id'],
                'alternativa_id': resp['alternativa_id'],
                'is_correta': resp['is_correta']
            })
        
        return jsonify({
            'message': 'Quiz submetido com sucesso',
            'tentativa': tentativa_schema.dump(tentativa),
            'pontuacao': pontuacao,
            'pontuacao_maxima': pontuacao_maxima,
            'percentual': round((pontuacao / pontuacao_maxima * 100), 2) if pontuacao_maxima > 0 else 0
        }), 201
    except Exception as e:
        current_app.logger.exception("Erro ao submeter quiz")
        return jsonify({'message': 'Erro ao submeter quiz'}), 500

@quiz_bp.route('/tentativas', methods=['GET'])
@jwt_required()
def get_user_tentativas():
    """GET /api/quizzes/tentativas - Lista tentativas do usuário"""
    try:
        user_id = get_jwt_identity()
        tentativas = tentativaRepository.get_by_usuario(int(user_id))
        return jsonify(tentativas_schema.dump(tentativas)), 200
    except Exception as e:
        current_app.logger.exception("Erro ao listar tentativas")
        return jsonify({'message': 'Erro ao listar tentativas'}), 500

@quiz_bp.route('/estatisticas', methods=['GET'])
@jwt_required()
def get_user_estatisticas():
    """GET /api/quizzes/estatisticas - Obtém estatísticas do usuário"""
    try:
        user_id = get_jwt_identity()
        stats = tentativaRepository.get_estatisticas_usuario(int(user_id))
        return jsonify(stats), 200
    except Exception as e:
        current_app.logger.exception("Erro ao obter estatísticas")
        return jsonify({'message': 'Erro ao obter estatísticas'}), 500

@quiz_bp.route('/<int:quiz_id>/ranking', methods=['GET'])
@jwt_required()
def get_quiz_ranking(quiz_id):
    """GET /api/quizzes/<id>/ranking - Obtém ranking do quiz"""
    try:
        quiz = quizRepository.get_by_id(quiz_id)
        
        if not quiz:
            return jsonify({'message': 'Quiz não encontrado'}), 404
        
        tentativas = tentativaRepository.get_by_quiz(quiz_id)
        
        # Agrupa por usuário e pega a melhor tentativa
        melhores_tentativas = {}
        for t in tentativas:
            user_id = t.usuario_id
            percentual = (t.pontuacao / t.pontuacao_maxima * 100) if t.pontuacao_maxima > 0 else 0
            
            if user_id not in melhores_tentativas or percentual > melhores_tentativas[user_id]['percentual']:
                melhores_tentativas[user_id] = {
                    'usuario_id': user_id,
                    'pontuacao': t.pontuacao,
                    'pontuacao_maxima': t.pontuacao_maxima,
                    'percentual': percentual,
                    'tempo_gasto': t.tempo_gasto,
                    'data_tentativa': t.data_tentativa.isoformat()
                }
        
        # Ordena por percentual (desc) e tempo (asc)
        ranking = sorted(
            melhores_tentativas.values(),
            key=lambda x: (-x['percentual'], x['tempo_gasto'] or 999999)
        )
        
        return jsonify(ranking), 200
    except Exception as e:
        current_app.logger.exception("Erro ao obter ranking")
        return jsonify({'message': 'Erro ao obter ranking'}), 500
