from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os
import re
from dotenv import load_dotenv

load_dotenv()

assistant_bp = Blueprint('assistant', __name__)
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

# Armazena históricos em memória (considere usar banco de dados em produção)
conversation_threads = {}

# Lista de tópicos proibidos/não educacionais
BLOCKED_TOPICS = [
    'política partidária', 'apostas', 'gambling', 'conteúdo adulto',
    'violência explícita', 'drogas ilegais', 'armas', 'hacking malicioso',
    'fraude', 'golpes', 'discriminação', 'assédio', 'fake news'
]

# Palavras-chave educacionais válidas
EDUCATIONAL_KEYWORDS = [
    'aprender', 'estudar', 'ensinar', 'conceito', 'teoria', 'prática',
    'exemplo', 'explicar', 'entender', 'resolver', 'calcular', 'análise',
    'pesquisa', 'acadêmico', 'científico', 'matemática', 'física', 'química',
    'biologia', 'história', 'geografia', 'literatura', 'gramática', 'idioma',
    'programação', 'tecnologia', 'engenharia', 'ciência', 'educação'
]


def validate_educational_content(text, subject=''):
    """
    Valida se o conteúdo é educacional e relevante
    Retorna (is_valid, error_message)
    """
    text_lower = text.lower()
    
    # 1. Verifica se contém tópicos bloqueados
    for blocked in BLOCKED_TOPICS:
        if blocked in text_lower:
            return False, f"Conteúdo relacionado a '{blocked}' não é permitido neste contexto educacional."
    
    # 2. Verifica comandos de manipulação de sistema (prompt injection)
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
    
    # 3. Verifica se é uma pergunta educacional legítima
    # Aceita se contém palavras-chave educacionais OU se tem um subject definido
    has_educational_keyword = any(keyword in text_lower for keyword in EDUCATIONAL_KEYWORDS)
    has_question_marks = '?' in text
    is_reasonable_length = 1 <= len(text.split()) <= 500
    
    if subject:  # Se há uma matéria definida, aceita mais facilmente
        if not is_reasonable_length:
            return False, "Pergunta muito curta ou muito longa. Por favor, seja mais específico."
        return True, None
    
    if not (has_educational_keyword or has_question_marks):
        return False, "Por favor, faça uma pergunta relacionada a conteúdo educacional ou acadêmico."
    
    if not is_reasonable_length:
        return False, "Pergunta muito curta ou muito longa. Por favor, reformule sua questão."
    
    return True, None


def create_enhanced_system_message(subject=''):
    """Cria mensagem de sistema com restrições claras"""
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


@assistant_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask_question():
    
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    question = data.get('question', '').strip()
    subject = data.get('subject', '').strip()
    
    if not question:
        return jsonify({'error': 'Pergunta é obrigatória'}), 400
    
    # Validação de conteúdo educacional
    is_valid, error_message = validate_educational_content(question, subject)
    if not is_valid:
        return jsonify({'error': error_message}), 400
    
    # Sanitização adicional: remove caracteres especiais potencialmente perigosos
    question = re.sub(r'[<>{}[\]\\]', '', question)
    
    headers = {
        'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    if current_user_id not in conversation_threads:
        conversation_threads[current_user_id] = [create_enhanced_system_message(subject)]
    
    # Adiciona pergunta do usuário com delimitadores
    conversation_threads[current_user_id].append({
        'role': 'user',
        'content': f'<<<PERGUNTA_ESTUDANTE>>>{question}<<<FIM_PERGUNTA>>>'
    })
    
    payload = {
        'model': 'sonar-pro',
        'messages': conversation_threads[current_user_id],
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
                'error': f'Erro ao processar sua pergunta',
                'details': 'Tente novamente em alguns instantes'
            }), response.status_code
        
        result = response.json()
        assistant_message = result['choices'][0]['message']
        
        # Valida resposta do assistente (verificação adicional)
        response_content = assistant_message['content'].lower()
        if any(blocked in response_content for blocked in BLOCKED_TOPICS[:5]):
            return jsonify({
                'error': 'Conteúdo inadequado detectado. Por favor, reformule sua pergunta.'
            }), 400
        
        # Adiciona resposta ao histórico
        conversation_threads[current_user_id].append(assistant_message)
        
        # Limita histórico a últimas 20 mensagens para evitar contexto excessivo
        if len(conversation_threads[current_user_id]) > 20:
            conversation_threads[current_user_id] = [
                conversation_threads[current_user_id][0]  # mantém system message
            ] + conversation_threads[current_user_id][-19:]
        
        return jsonify({
            'answer': assistant_message['content'],
            'citations': result.get('citations', []),
            'sources': result.get('sources', [])
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Tempo limite excedido. Tente novamente.'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Erro de conexão. Verifique sua internet.'}), 500
    except Exception as e:
        return jsonify({'error': 'Erro ao processar sua pergunta.'}), 500

@assistant_bp.route('/clear-history', methods=['DELETE'])
@jwt_required()
def clear_history():
    
    current_user_id = get_jwt_identity()
    
    if current_user_id in conversation_threads:
        del conversation_threads[current_user_id]
    
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
