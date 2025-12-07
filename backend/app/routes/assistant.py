from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os
from dotenv import load_dotenv

load_dotenv()

assistant_bp = Blueprint('assistant', __name__)
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

# Armazena históricos em memória (considere usar banco de dados em produção)
conversation_threads = {}

@assistant_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask_question():
    """Endpoint para fazer perguntas ao assistente educacional"""
    
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    question = data.get('question')
    subject = data.get('subject', '')
    
    if not question:
        return jsonify({'error': 'question é obrigatório'}), 400
    
    headers = {
        'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Cria contexto educacional
    system_message = {
        'role': 'system',
        'content': f'''Você é um assistente educacional especializado em {subject if subject else 'diversos tópicos'}.

Sua missão:
1. Explicar conceitos de forma clara, didática e acessível
2. Usar exemplos práticos e do dia a dia quando possível
3. Adaptar as explicações para estudantes e iniciantes
4. Estruturar as respostas de forma lógica e progressiva
5. Citar fontes quando possível

Mantenha um tom amigável, encorajador e estimulador de aprendizado.
Se não souber algo, seja honesto e sugira recursos para o estudante aprender.'''
    }
    
    # Inicializa thread de conversa se não existir
    if current_user_id not in conversation_threads:
        conversation_threads[current_user_id] = [system_message]
    
    # Adiciona pergunta do usuário
    conversation_threads[current_user_id].append({
        'role': 'user',
        'content': question
    })
    
    payload = {
        'model': 'sonar-pro',
        'messages': conversation_threads[current_user_id],
        'temperature': 0.2,
        'max_tokens': 2000
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
                'error': f'Erro ao chamar API Perplexity: {response.status_code}',
                'details': response.text
            }), response.status_code
        
        result = response.json()
        assistant_message = result['choices'][0]['message']
        
        # Adiciona resposta ao histórico
        conversation_threads[current_user_id].append(assistant_message)
        
        return jsonify({
            'answer': assistant_message['content'],
            'citations': result.get('citations', []),
            'sources': result.get('sources', [])
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Tempo limite excedido na requisição'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erro na requisição: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Erro ao processar: {str(e)}'}), 500


@assistant_bp.route('/research', methods=['POST'])
@jwt_required()
def research_topic():
    """Endpoint para pesquisa acadêmica aprofundada"""
    
    data = request.get_json()
    topic = data.get('topic')
    
    if not topic:
        return jsonify({'error': 'topic é obrigatório'}), 400
    
    headers = {
        'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'model': 'sonar-pro',
        'messages': [{
            'role': 'user',
            'content': f'''Realize uma pesquisa acadêmica aprofundada sobre: {topic}

Inclua:
1. **Definição e Contexto**: Defina claramente o conceito
2. **Fundamentos Teóricos**: Explique os princípios básicos
3. **Aplicações Práticas**: Mostre exemplos reais e uso
4. **Exemplos Concretos**: Use casos específicos
5. **Recursos de Aprendizado**: Sugira formas de aprender mais

Estruture a resposta de forma clara e didática para estudantes.'''
        }],
        'temperature': 0.3,
        'max_tokens': 3000
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
                'error': f'Erro ao chamar API Perplexity: {response.status_code}',
                'details': response.text
            }), response.status_code
        
        result = response.json()
        
        return jsonify({
            'research': result['choices'][0]['message']['content'],
            'citations': result.get('citations', [])
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Tempo limite excedido na requisição'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erro na requisição: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Erro ao pesquisar: {str(e)}'}), 500


@assistant_bp.route('/clear-history', methods=['DELETE'])
@jwt_required()
def clear_history():
    """Limpa o histórico de conversa do usuário"""
    
    current_user_id = get_jwt_identity()
    
    if current_user_id in conversation_threads:
        del conversation_threads[current_user_id]
    
    return jsonify({'message': 'Histórico limpo com sucesso'}), 200
