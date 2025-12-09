# StudySphere: Organize, Colabore e Aprenda

_Sua plataforma completa para otimizar os estudos, aumentar a produtividade e facilitar a colaboração entre estudantes._


<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Frontend](https://img.shields.io/badge/frontend-React-blue?logo=react)
![Backend](https://img.shields.io/badge/backend-Flask-black?logo=flask)
![Database](https://img.shields.io/badge/database-MySQL-orange?logo=mysql)

</div>

## Sobre o Projeto

O StudySphere é uma plataforma digital inovadora, desenvolvida para auxiliar estudantes na organização de seus estudos, promover a colaboração com colegas e monitorar o desempenho acadêmico. Em um cenário onde a sobrecarga de informações e as distrações digitais são constantes, o StudySphere surge como uma solução para centralizar materiais, gerenciar o tempo de forma eficaz e combater a procrastinação, que afeta o rendimento de 80% dos estudantes.

O projeto foi idealizado por estudantes do Curso Técnico em Informática do **Instituto Federal de São Paulo (IFSP)**, campus Araraquara, como uma ferramenta para transformar a experiência de aprendizado em algo mais dinâmico, colaborativo e motivador.

## Funcionalidades Principais

O StudySphere oferece um conjunto de ferramentas integradas para facilitar a vida do estudante:

*   **🗂️ Organização por Pastas:** Crie, renomeie e gerencie pastas personalizadas para cada disciplina, mantendo todos os seus materiais (documentos, links, anotações) em um só lugar.
*   **☁️ Upload e Gerenciamento de Arquivos:** Faça upload de arquivos de até 10 MB (PDF, DOCX, PPTX, imagens) com preview inline para os formatos suportados.
*   **📅 Calendário Interativo:** Agende seus compromissos, provas e entregas com um sistema de *quick-add* e receba lembretes para não perder nenhum prazo.
*   **📝 Anotações Rápidas:** Crie notas e vincule-as a matérias ou eventos específicos, facilitando a contextualização e a revisão do conteúdo.
*   **🏆 Quizzes e Desempenho:** Desenvolva quizzes de múltipla escolha, compartilhe com colegas e acompanhe seu desempenho através de relatórios com acertos, tempo médio e ranking.
*   **💬 Chat em Tempo Real:** Comunique-se com outros estudantes em salas de chat, com suporte a threads e compartilhamento de arquivos.
*   **🎮 Gamificação:** Acompanhe seu progresso com um sistema de pontos, *badges* e metas semanais, tornando o estudo mais engajante.
*   **♿ Acessibilidade:** Interface projetada com foco em acessibilidade (WCAG 2.1 AA), garantindo uma experiência inclusiva para todos.

## Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias modernas e robustas, visando performance, escalabilidade e manutenibilidade.

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | React (com Vite) | Biblioteca JavaScript para construção de interfaces de usuário reativas e dinâmicas. |
| **Backend** | Flask (Python) | Micro-framework Python para o desenvolvimento da API RESTful. |
| **Banco de Dados** | MySQL | Sistema de gerenciamento de banco de dados relacional para armazenamento dos dados. |
| **ORM** | SQLAlchemy | Mapeador objeto-relacional para interação com o banco de dados em Python. |
| **Autenticação** | JWT (JSON Web Tokens) | Padrão para criação de tokens de acesso que permitem a autenticação segura de usuários. |
| **Segurança** | Bcrypt / AES | Algoritmos para criptografia de senhas e dados sensíveis. |

## Começando

Para executar o projeto localmente, siga os passos abaixo.

### Pré-requisitos

*   [Python 3.12+](https://www.python.org/)
*   [MySQL 8.0+](https://www.mysql.com/)
*   [Node.js 18+](https://nodejs.org/)
*   [Git](https://git-scm.com/)

### Instalação

1.  **Clone o repositório:**

    ```shell
    git clone https://github.com/Samuel-fernandesf/StudySphere.git
    cd StudySphere
    ```

2.  **Configure o Backend:**

    ```shell
    cd backend
    python3 -m venv venv

    # Ative o ambiente virtual
    # Linux/macOS
    source venv/bin/activate
    # Windows
    .\venv\Scripts\Activate.ps1

    pip install -r requirements.txt
    ```

3.  **Configure as Variáveis de Ambiente:**

    Renomeie o arquivo `.env.example` para `.env` e preencha com suas credenciais do MySQL:

    ```ini
    FLASK_SQLALCHEMY_DATABASE_URI=mysql+pymysql://{usuário}:{senha}@localhost:3306/studysphere
    FLASK_SECRET_KEY=sua_chave_secreta_aqui
    FLASK_JWT_SECRET_KEY=outra_chave_secreta_aqui
    ```

4.  **Configure o Banco de Dados:**

    No seu cliente MySQL, crie o banco de dados:

    ```sql
    CREATE DATABASE studysphere;
    ```

    Em seguida, aplique as migrações do banco de dados:

    ```shell
    # Dentro da pasta backend/app com o venv ativado
    flask db upgrade
    ```

5.  **Configure o Frontend:**

    ```shell
    cd ../frontend
    npm install
    ```

### Executando a Aplicação

1.  **Inicie o Backend:**

    ```shell
    # Na pasta backend/app, com o ambiente virtual ativado
    python index.py
    ```

    O servidor backend estará rodando em `http://127.0.0.1:5000`.

2.  **Inicie o Frontend:**

    ```shell
    # Na pasta frontend
    npm run dev
    ```

    A aplicação estará acessível em `http://127.0.0.1:3000`.

## Como Contribuir

Contribuições são o que tornam a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

Se você tiver uma sugestão para melhorar o projeto, por favor, faça um fork do repositório e crie uma pull request. Você também pode simplesmente abrir uma issue com a tag "enhancement".

1.  Faça um Fork do projeto
2.  Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4.  Push para a Branch (`git push origin feature/AmazingFeature`)
5.  Abra uma Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Autores

*   **Luiz Gabriel Leli Pereira** - [ImLuizz](https://github.com/ImLuizz)
*   **Samuel Fernandes Filho** - [Samuel-fernandesf](https://github.com/Samuel-fernandesf)

