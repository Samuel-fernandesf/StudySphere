from flask import Blueprint, request, jsonify, current_app
import json
import requests
import re
import random
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
from dotenv import load_dotenv
import os

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


load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")



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

@quiz_bp.route('/auto-generate', methods=['POST'])
@jwt_required()
def auto_generate_quiz():
    """POST /api/quizzes/auto-generate - Gera questões automaticamente com IA (não salva no banco)"""
    try:
        if not PERPLEXITY_API_KEY:
            return jsonify({'message': 'API key da Perplexity não configurada'}), 500

        user_id = get_jwt_identity()  # só para garantir que está autenticado

        data = request.get_json() or {}
        titulo = data.get('titulo')
        materia = data.get('materia')
        dificuldade = data.get('dificuldade', 'medio')
        num_questoes = int(data.get('num_questoes', 5))

        if not titulo or not materia:
            return jsonify({'message': 'Campos obrigatórios: titulo e materia'}), 400

        prompt = f"""
        Gere um conjunto de {num_questoes} questões de múltipla escolha para um questionário em português.

        Título do quiz: {titulo}
        Matéria / assunto: {materia}
        Dificuldade geral: {dificuldade} (valores possíveis: facil, medio, dificil).

        Regras:
        - Cada questão deve ter:
          - "enunciado": string clara em português.
          - "pontos": número inteiro (use 1).
          - "alternativas": exatamente 4 alternativas.
        - Cada alternativa deve ter:
          - "texto": string.
          - "is_correta": boolean (apenas 1 verdadeira por questão).
          - "ordem": inteiro de 1 a 4.
        - Não inclua nenhuma explicação, comentário ou texto fora do JSON.

        Responda SOMENTE com um JSON válido exatamente neste formato:
        {{
          "questoes": [
            {{
              "enunciado": "...",
              "pontos": 1,
              "alternativas": [
                {{ "texto": "...", "is_correta": true,  "ordem": 1 }},
                {{ "texto": "...", "is_correta": false, "ordem": 2 }},
                {{ "texto": "...", "is_correta": false, "ordem": 3 }},
                {{ "texto": "...", "is_correta": false, "ordem": 4 }}
              ]
            }}
          ]
        }}
        """

        resp = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers={
                "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "sonar-pro",
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um gerador de questionários que responde apenas em JSON válido."
                    },
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 2048,
                "temperature": 0.2,
            },
            timeout=60,
        )
        
        if resp.status_code != 200:
            print("Perplexity status:", resp.status_code)
            print("Perplexity body:", resp.text)
            resp.raise_for_status()

        resp.raise_for_status()
        data_api = resp.json()
        content = data_api["choices"][0]["message"]["content"]
        
        print("=== RAW IA CONTENT ===")
        print(content)
        print("======================")


        raw = content.strip()

        # tenta achar o primeiro bloco que começa com { e termina com }
        match = re.search(r'\{[\s\S]*\}', raw)
        if not match:
            raise json.JSONDecodeError("No JSON object found", raw, 0)

        json_str = match.group(0)

        generated = json.loads(json_str)
        questoes = generated.get("questoes", [])

        if not isinstance(questoes, list) or not questoes:
            return jsonify({'message': 'Falha ao gerar questões automaticamente'}), 500
        
        for q in questoes:
            q.setdefault("pontos", 1)

        alts = q.get("alternativas", [])
        # limita a 4 alternativas
        alts = alts[:4]
        while len(alts) < 4:
            alts.append({
                "texto": "",
                "is_correta": False,
                "ordem": len(alts) + 1
            })

        # garante que exista exatamente 1 correta.
        corretas = [i for i, alt in enumerate(alts) if alt.get("is_correta")]
        if not corretas:
            # se não tiver nenhuma marcada, marca a primeira como correta
            alts[0]["is_correta"] = True
        elif len(corretas) > 1:
            # se tiver mais de uma, mantém só a primeira como correta
            first = corretas[0]
            for i, alt in enumerate(alts):
                alt["is_correta"] = (i == first)

        # embaralha as alternativas
        random.shuffle(alts)

        # reatribui a ordem 1..4 depois de embaralhar
        for idx, alt in enumerate(alts):
            alt["ordem"] = idx + 1

        q["alternativas"] = alts

        # Normalizar estrutura para o front
        for q_idx, q in enumerate(questoes):
            q.setdefault("pontos", 1)
            alts = q.get("alternativas", [])
            # garante 4 alternativas
            alts = alts[:4]
            while len(alts) < 4:
                alts.append({
                    "texto": "",
                    "is_correta": False,
                    "ordem": len(alts) + 1
                })
            for idx, alt in enumerate(alts):
                alt.setdefault("ordem", idx + 1)
                alt.setdefault("is_correta", False)
            q["alternativas"] = alts

        return jsonify({'questoes': questoes}), 200

    except json.JSONDecodeError:
        current_app.logger.exception("Resposta da IA não é um JSON válido")
        return jsonify({'message': 'Erro ao interpretar resposta da IA'}), 500
    except Exception as e:
        current_app.logger.exception("Erro ao gerar quiz automaticamente")
        return jsonify({'message': 'Erro ao gerar quiz automaticamente'}), 500
