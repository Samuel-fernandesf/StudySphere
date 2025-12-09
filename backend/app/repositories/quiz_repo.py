from models.quiz import Quiz, Questao, Alternativa, TentativaQuiz, RespostaUsuario, TagQuiz, DificuldadeQuiz
from sqlalchemy.exc import IntegrityError
from utils.db import db
from typing import List, Optional

class QuizRepository:
    
    def get_all_quizzes(self, usuario_id: int = None) -> List[Quiz]:
        """Retorna todos os quizzes públicos ou do usuário"""
        if usuario_id:
            return Quiz.query.filter(
                db.or_(Quiz.is_publico == True, Quiz.criador_id == usuario_id)
            ).order_by(Quiz.created_at.desc()).all()
        return Quiz.query.filter_by(is_publico=True).order_by(Quiz.created_at.desc()).all()
    
    def get_by_id(self, quiz_id: int) -> Optional[Quiz]:
        return Quiz.query.get(quiz_id)
    
    def get_by_materia(self, materia: str, usuario_id: int = None) -> List[Quiz]:
        query = Quiz.query.filter(Quiz.materia.ilike(f'%{materia}%'))
        if usuario_id:
            query = query.filter(db.or_(Quiz.is_publico == True, Quiz.criador_id == usuario_id))
        else:
            query = query.filter_by(is_publico=True)
        return query.order_by(Quiz.created_at.desc()).all()
    
    def get_by_dificuldade(self, dificuldade: DificuldadeQuiz, usuario_id: int = None) -> List[Quiz]:
        query = Quiz.query.filter_by(dificuldade=dificuldade)
        if usuario_id:
            query = query.filter(db.or_(Quiz.is_publico == True, Quiz.criador_id == usuario_id))
        else:
            query = query.filter_by(is_publico=True)
        return query.order_by(Quiz.created_at.desc()).all()
    
    def create_quiz(self, quiz_data: dict) -> Quiz:
        try:
            quiz = Quiz(**quiz_data)
            db.session.add(quiz)
            db.session.commit()
            return quiz
        except IntegrityError:
            db.session.rollback()
            raise ValueError('Erro de integridade ao criar quiz')
        except Exception as e:
            db.session.rollback()
            raise e
    
    def update_quiz(self, quiz: Quiz, quiz_data: dict) -> Quiz:
        try:
            for key, value in quiz_data.items():
                if hasattr(quiz, key):
                    setattr(quiz, key, value)
            db.session.commit()
            return quiz
        except Exception as e:
            db.session.rollback()
            raise e
    
    def delete_quiz(self, quiz: Quiz):
        try:
            db.session.delete(quiz)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

class QuestaoRepository:
    
    def get_by_id(self, questao_id: int) -> Optional[Questao]:
        return Questao.query.get(questao_id)
    
    def get_by_quiz(self, quiz_id: int) -> List[Questao]:
        return Questao.query.filter_by(quiz_id=quiz_id).order_by(Questao.ordem).all()
    
    def create_questao(self, questao_data: dict) -> Questao:
        try:
            questao = Questao(**questao_data)
            db.session.add(questao)
            db.session.commit()
            return questao
        except Exception as e:
            db.session.rollback()
            raise e
    
    def update_questao(self, questao: Questao, questao_data: dict) -> Questao:
        try:
            for key, value in questao_data.items():
                if hasattr(questao, key):
                    setattr(questao, key, value)
            db.session.commit()
            return questao
        except Exception as e:
            db.session.rollback()
            raise e
    
    def delete_questao(self, questao: Questao):
        try:
            db.session.delete(questao)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

class AlternativaRepository:
    
    def get_by_id(self, alternativa_id: int) -> Optional[Alternativa]:
        return Alternativa.query.get(alternativa_id)
    
    def get_by_questao(self, questao_id: int) -> List[Alternativa]:
        return Alternativa.query.filter_by(questao_id=questao_id).order_by(Alternativa.ordem).all()
    
    def create_alternativa(self, alternativa_data: dict) -> Alternativa:
        try:
            alternativa = Alternativa(**alternativa_data)
            db.session.add(alternativa)
            db.session.commit()
            return alternativa
        except Exception as e:
            db.session.rollback()
            raise e
    
    def update_alternativa(self, alternativa: Alternativa, alternativa_data: dict) -> Alternativa:
        try:
            for key, value in alternativa_data.items():
                if hasattr(alternativa, key):
                    setattr(alternativa, key, value)
            db.session.commit()
            return alternativa
        except Exception as e:
            db.session.rollback()
            raise e
    
    def delete_alternativa(self, alternativa: Alternativa):
        try:
            db.session.delete(alternativa)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

class TentativaQuizRepository:
    
    def get_by_id(self, tentativa_id: int) -> Optional[TentativaQuiz]:
        return TentativaQuiz.query.get(tentativa_id)
    
    def get_by_usuario(self, usuario_id: int) -> List[TentativaQuiz]:
        return TentativaQuiz.query.filter_by(usuario_id=usuario_id).order_by(TentativaQuiz.data_tentativa.desc()).all()
    
    def get_by_quiz(self, quiz_id: int) -> List[TentativaQuiz]:
        return TentativaQuiz.query.filter_by(quiz_id=quiz_id).order_by(TentativaQuiz.data_tentativa.desc()).all()
    
    def get_by_usuario_e_quiz(self, usuario_id: int, quiz_id: int) -> List[TentativaQuiz]:
        return TentativaQuiz.query.filter_by(
            usuario_id=usuario_id, 
            quiz_id=quiz_id
        ).order_by(TentativaQuiz.data_tentativa.desc()).all()
    
    def create_tentativa(self, tentativa_data: dict) -> TentativaQuiz:
        try:
            tentativa = TentativaQuiz(**tentativa_data)
            db.session.add(tentativa)
            db.session.commit()
            return tentativa
        except Exception as e:
            db.session.rollback()
            raise e
    
    def get_estatisticas_usuario(self, usuario_id: int) -> dict:
        """Retorna estatísticas gerais do usuário"""
        tentativas = self.get_by_usuario(usuario_id)
        
        if not tentativas:
            return {
                'total_tentativas': 0,
                'media_geral': 0,
                'tempo_medio': 0,
                'melhor_pontuacao': 0
            }
        
        total = len(tentativas)
        soma_percentuais = sum(
            (t.pontuacao / t.pontuacao_maxima * 100) if t.pontuacao_maxima > 0 else 0 
            for t in tentativas
        )
        tempos = [t.tempo_gasto for t in tentativas if t.tempo_gasto]
        
        return {
            'total_tentativas': total,
            'media_geral': round(soma_percentuais / total, 2) if total > 0 else 0,
            'tempo_medio': round(sum(tempos) / len(tempos), 2) if tempos else 0,
            'melhor_pontuacao': max(
                (t.pontuacao / t.pontuacao_maxima * 100) if t.pontuacao_maxima > 0 else 0 
                for t in tentativas
            ) if tentativas else 0
        }

class RespostaUsuarioRepository:
    
    def create_resposta(self, resposta_data: dict) -> RespostaUsuario:
        try:
            resposta = RespostaUsuario(**resposta_data)
            db.session.add(resposta)
            db.session.commit()
            return resposta
        except Exception as e:
            db.session.rollback()
            raise e
    
    def get_by_tentativa(self, tentativa_id: int) -> List[RespostaUsuario]:
        return RespostaUsuario.query.filter_by(tentativa_id=tentativa_id).all()

class TagQuizRepository:
    
    def create_tag(self, tag_data: dict) -> TagQuiz:
        try:
            tag = TagQuiz(**tag_data)
            db.session.add(tag)
            db.session.commit()
            return tag
        except Exception as e:
            db.session.rollback()
            raise e
    
    def get_by_quiz(self, quiz_id: int) -> List[TagQuiz]:
        return TagQuiz.query.filter_by(quiz_id=quiz_id).all()
    
    def delete_tag(self, tag: TagQuiz):
        try:
            db.session.delete(tag)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
