from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os
import re
from dotenv import load_dotenv
from repositories import assistant_repo

load_dotenv()

assistant_bp = Blueprint('assistant', __name__)
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

BLOCKED_TOPICS = [
    'política partidária', 'apostas', 'gambling', 'conteúdo adulto',
    'violência explícita', 'drogas ilegais', 'armas', 'hacking malicioso',
    'fraude', 'golpes', 'discriminação', 'assédio', 'fake news'
]

EDUCATIONAL_KEYWORDS = [
    'aprender', 'estudar', 'ensinar', 'conceito', 'teoria', 'prática',
    'exemplo', 'explicar', 'entender', 'resolver', 'calcular', 'análise',
    'pesquisa', 'acadêmico', 'científico', 'matemática', 'física', 'química',
    'biologia', 'história', 'geografia', 'literatura', 'gramática', 'idioma',
    'programação', 'tecnologia', 'engenharia', 'ciência', 'educação'
]


def validate_educational_content(text, subject=''):
    """Validates if content is educational and relevant."""
    text_lower = text.lower()
    
    for blocked in BLOCKED_TOPICS:
        if blocked in text_lower:
            return False, f"Conteúdo relacionado a '{blocked}' não é permitido neste contexto educacional."
    
    injection_patterns = [
        r'ignore\s+(previous|above|prior)\s+instructions',
        r'forget\s+(everything|all|previous)',
        r'you\s+are\s+now',
        r'new\s+role',
        r'act\s+as',
        r'pretend\s+to\s+be',
        r'disregard\s+your\s+rules',
        r'override\s+your'
    ]
    
    for pattern in injection_patterns:
        if re.search(pattern, text_lower):
            return False, "Pergunta inválida. Por favor, faça uma pergunta educacional direta."
    
    has_educational_keyword = any(keyword in text_lower for keyword in EDUCATIONAL_KEYWORDS)
    has_question_marks = '?' in text
    is_reasonable_length = 1 <= len(text.split()) <= 500
    
    if subject:
        if not is_reasonable_length:
            return False, "Pergunta muito curta ou muito longa. Por favor, seja mais específico."
        return True, None
    
    if not (has_educational_keyword or has_question_marks):
        return False, "Por favor, faça uma pergunta relacionada a conteúdo educacional ou acadêmico."
    
    if not is_reasonable_length:
        return False, "Pergunta muito curta ou muito longa. Por favor, reformule sua questão."
    
    return True, None


def create_enhanced_system_message(subject=''):
    """Creates system message with clear restrictions."""
    return {
        'role': 'system',
        'content': f'''Você é um assistente educacional ESTRITAMENTE limitado a conteúdo acadêmico e educacional{" focado em " + subject if subject else ""}.

REGRAS OBRIGATÓRIAS:
1. APENAS responda perguntas relacionadas a educação, aprendizado e conteúdo acadêmico
2. RECUSE educadamente qualquer pergunta sobre: política partidária, conteúdo adulto, violência, atividades ilegais, ou tópicos não educacionais
3. Se a pergunta não for educacional, responda: "Desculpe, sou um assistente educacional e só posso ajudar com questões acadêmicas e de aprendizado. Pode reformular sua pergunta para um contexto educacional?"
4. Mantenha respostas focadas, didáticas e apropriadas para estudantes

DIRETRIZES DE RESPOSTA:
- Explique conceitos de forma clara e estruturada
- Use exemplos práticos e educacionais
- Cite fontes acadêmicas quando possível
- Adapte linguagem para o nível do estudante
- Seja encorajador e estimule o pensamento crítico

Lembre-se: Seu único propósito é auxiliar no aprendizado educacional.'''
    }


def build_messages_from_conversation(conversation_data, subject=''):
    messages = [create_enhanced_system_message(subject)]
    
    if conversation_data and 'messages' in conversation_data:
        for msg in conversation_data['messages']:
            if msg['role'] == 'user':
                messages.append({
                    'role': 'user',
                    'content': f'<<<PERGUNTA_ESTUDANTE>>>{msg["content"]}<<<FIM_PERGUNTA>>>'
                })
            else:
                messages.append({
                    'role': 'assistant',
                    'content': msg['content']
                })
    
    return messages



@assistant_bp.route('/conversations', methods=['GET'])
@jwt_required()
def list_conversations():
    
    current_user_id = int(get_jwt_identity())
    
    conversations = assistant_repo.get_user_conversations(current_user_id)
    return jsonify({
        'conversations': [conv.to_dict() for conv in conversations]
    }), 200


@assistant_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
  
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    title = data.get('title', 'Nova Conversa')
    subject = data.get('subject', None)
    
    conversation = assistant_repo.create_conversation(
        user_id=current_user_id,
        title=title,
        subject=subject
    )
    
    return jsonify(conversation.to_dict()), 201


@assistant_bp.route('/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
   
    current_user_id = int(get_jwt_identity())
    
    conversation_data = assistant_repo.get_conversation_with_messages(
        conversation_id, 
        user_id=current_user_id
    )
    
    if not conversation_data:
        return jsonify({'error': 'Conversa não encontrada'}), 404
    
    return jsonify(conversation_data), 200


@assistant_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(conversation_id):
    
    current_user_id = int(get_jwt_identity())
    
    success = assistant_repo.delete_conversation(conversation_id, current_user_id)
    
    if not success:
        return jsonify({'error': 'Conversa não encontrada'}), 404
    
    return jsonify({'message': 'Conversa deletada com sucesso'}), 200


@assistant_bp.route('/conversations/<int:conversation_id>/title', methods=['PATCH'])
@jwt_required()
def update_title(conversation_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Título é obrigatório'}), 400
    
    conversation = assistant_repo.update_conversation_title(
        conversation_id, 
        title, 
        current_user_id
    )
    
    if not conversation:
        return jsonify({'error': 'Conversa não encontrada'}), 404
    
    return jsonify(conversation.to_dict()), 200



@assistant_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask_question():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    question = data.get('question', '').strip()
    subject = data.get('subject', '').strip()
    conversation_id = data.get('conversation_id')
    
    if not question:
        return jsonify({'error': 'Pergunta é obrigatória'}), 400
    
    is_valid, error_message = validate_educational_content(question, subject)
    if not is_valid:
        return jsonify({'error': error_message}), 400
    
    question = re.sub(r'[<>{}[\]\\]', '', question)
    
    conversation = None
    if conversation_id:
        conversation = assistant_repo.get_conversation_by_id(conversation_id, current_user_id)
        if not conversation:
            return jsonify({'error': 'Conversa não encontrada'}), 404
    else:
        title = assistant_repo.generate_title_from_question(question)
        conversation = assistant_repo.create_conversation(
            user_id=current_user_id,
            title=title,
            subject=subject if subject else None
        )
    
    conversation_data = assistant_repo.get_conversation_with_messages(conversation.id)
    messages = build_messages_from_conversation(conversation_data, subject)
    
    messages.append({
        'role': 'user',
        'content': f'<<<PERGUNTA_ESTUDANTE>>>{question}<<<FIM_PERGUNTA>>>'
    })
    
    headers = {
        'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'model': 'sonar-pro',
        'messages': messages,
        'temperature': 0.2,
        'max_tokens': 2000,
        'top_p': 0.9
    }
    
    try:
        response = requests.post(
            'https://api.perplexity.ai/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code != 200:
            return jsonify({
                'error': 'Erro ao processar sua pergunta',
                'details': 'Tente novamente em alguns instantes'
            }), response.status_code
        
        result = response.json()
        assistant_message = result['choices'][0]['message']
        
        response_content = assistant_message['content'].lower()
        if any(blocked in response_content for blocked in BLOCKED_TOPICS[:5]):
            return jsonify({
                'error': 'Conteúdo inadequado detectado. Por favor, reformule sua pergunta.'
            }), 400
        
        citations = result.get('citations', [])
        
        assistant_repo.add_message(conversation.id, 'user', question)
        assistant_repo.add_message(conversation.id, 'assistant', assistant_message['content'], citations)
        
        return jsonify({
            'answer': assistant_message['content'],
            'citations': citations,
            'sources': result.get('sources', []),
            'conversation_id': conversation.id
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Tempo limite excedido. Tente novamente.'}), 504
    except requests.exceptions.RequestException:
        return jsonify({'error': 'Erro de conexão. Verifique sua internet.'}), 500
    except Exception:
        return jsonify({'error': 'Erro ao processar sua pergunta.'}), 500


@assistant_bp.route('/clear-history', methods=['DELETE'])
@jwt_required()
def clear_history():
    current_user_id = int(get_jwt_identity())
    
    conversations = assistant_repo.get_user_conversations(current_user_id)
    for conv in conversations:
        assistant_repo.delete_conversation(conv.id, current_user_id)
    
    return jsonify({'message': 'Histórico limpo com sucesso'}), 200


@assistant_bp.route('/validate-question', methods=['POST'])
@jwt_required()
def validate_question():
    data = request.get_json()
    question = data.get('question', '').strip()
    subject = data.get('subject', '').strip()
    
    if not question:
        return jsonify({'valid': False, 'error': 'Pergunta vazia'}), 400
    
    is_valid, error_message = validate_educational_content(question, subject)
    
    return jsonify({
        'valid': is_valid,
        'message': error_message if not is_valid else 'Pergunta válida'
    }), 200
