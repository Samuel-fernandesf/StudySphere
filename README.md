# <img src="https://imgur.com/KRrnm8k.png" width="24" height="24" />  StudySphere

_Elevando a organização acadêmica a um novo patamar._

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2%2B-blue?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1%2B-black?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7%2B-010101?logo=socket.io&logoColor=white)](https://socket.io/)

---

## Visão Geral

O **StudySphere** é uma central de inteligência acadêmica projetada para transformar a rotina exaustiva de estudantes em uma experiência fluida, organizada e colaborativa. Desenvolvido como Projeto Integrador por alunos do **Instituto Federal de São Paulo (IFSP)** Campus Araraquara, a plataforma centraliza materiais, otimiza o tempo e combate a procrastinação através de gamificação e inteligência artificial.

## Funcionalidades Principais

### Organização Inteligente
-   **Hierarquia de Pastas**: Sistema de arquivos robusto com suporte a até 10 níveis de aninhamento.
-   **Central de Materiais**: Upload de múltiplos formatos (PDF, DOCX, Imagens) com visualização integrada.
-   **Matérias Personalizadas**: Organize seus conteúdos com cores e ícones distintos.

### Assistente & IA
-   **Study Assistant**: Integração com Perplexity AI para sanar dúvidas instantâneas sobre seus conteúdos.
-   **Gerador de Quizzes**: Transforme seus materiais em exercícios práticos automaticamente.

### Produtividade & Metas
-   **Calendário Dinâmico**: Gestão de provas e entregas com lembretes inteligentes.
-   **Pomodoro & Foco**: Ferramentas integradas para gestão de sessões de estudo.
-   **Gamificação**: Sistema de XP, níveis e conquistas (badges) para manter a motivação.

### Colaboração em Tempo Real
-   **Chat Global & por Matéria**: Comunicação instantânea via WebSockets (Socket.io).
-   **Compartilhamento de Arquivos**: Envie materiais diretamente no fluxo de conversa.
-   **Threads**: Discussões organizadas por tópicos específicos.

## Stack Tecnológica

### Frontend
-   **Core:** React.js (Vite)
-   **Estilização:** CSS / Lucide React (Ícones)
-   **Comunicação:** Axios & Socket.io-client
-   **Autenticação:** Google OAuth 2.0 & JWT-based Secure Cookies

### Backend
-   **Core:** Python (Flask)
-   **Banco de Dados:** MySQL com SQLAlchemy (ORM)
-   **Real-time:** Flask-SocketIO
-   **Migrações:** Alembic (Flask-Migrate)
-   **Processamento de Mídia:** MoviePy & ImageIO (para previews e metadados)

## ⚙️ Configuração do Ambiente

### Pré-requisitos
-   Python 3.12+
-   Node.js 18+
-   MySQL 8.0+

### Passo a Passo

1.  **Repositório**
    ```bash
    git clone https://github.com/Samuel-fernandesf/StudySphere.git
    cd StudySphere
    ```

2.  **Servidor (Backend)**
    ```bash
    cd backend
    python -m venv venv
    # Linux: source venv/bin/activate | Windows: .\venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Variáveis de Ambiente (.env)**
    Crie um arquivo `.env` na raiz do backend:
    ```ini
    FLASK_APP=app/app.py
    FLASK_DEBUG=1
    FLASK_SQLALCHEMY_DATABASE_URI=mysql+pymysql://USUARIO:SENHA@localhost:3306/studysphere
    FLASK_SECRET_KEY=sua_chave_secreta
    JWT_SECRET_KEY=sua_chave_jwt
    PERPLEXITY_API_KEY=sua_chave_ia
    GOOGLE_CLIENT_ID=seu_id_google
    ```

4.  **Banco de Dados**
    ```bash
    # No diretório backend/app
    flask db upgrade
    ```

5.  **Interface (Frontend)**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

##  Contribuidores

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/ImLuizz">
        <img src="https://github.com/ImLuizz.png" width="100px;" alt="Luiz Gabriel"/><br />
        <sub><b>Luiz Gabriel</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Samuel-fernandesf">
        <img src="https://github.com/Samuel-fernandesf.png" width="100px;" alt="Samuel Fernandes"/><br />
        <sub><b>Samuel Fernandes</b></sub>
      </a>
    </td>
  </tr>
</table>

---
<div align="center">
  Desenvolvido  por estudantes do <b>IFSP Araraquara</b>.
</div>
