<h1 align="center">StudySphere</h1>
<p align="center"><i>Está cansado de se perder no meio dos estudos?
Conheça o StudySphere: o seu espaço ideal para organizar, colaborar e aprender com eficiência!</i></p>

<p align="center" display="inline-block">
  <img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E"/>
  <img src="https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white"/>
  <img src="https://img.shields.io/badge/MIT-green?style=for-the-badge"/>
</p>

## Introdução

A crescente dificuldade dos jovens em organizar suas rotinas de estudo é um reflexo das múltiplas distrações e da sobrecarga de informações a que estão expostos no cotidiano. A falta de uma metodologia eficaz de organização, aliada à procrastinação, prejudica o rendimento acadêmico e contribui para o aumento da ansiedade relacionada ao desempenho escolar. Dessa forma, a criação dessa plataforma surge como uma solução prática para esses problemas.

Ao proporcionar um ambiente de estudo estruturado e interativo, o projeto busca motivar os alunos a adotarem práticas de gestão de tempo mais eficientes, além de criar um espaço colaborativo onde o aprendizado se torna mais dinâmico e participativo. Com a implementação de ferramentas como calendários interativos, lembretes, anotações e quizzes, os estudantes poderão não apenas se organizar, mas também se engajar mais profundamente com o conteúdo, tendo maior controle sobre sua jornada acadêmica e se conectando com seus colegas de forma construtiva. A plataforma não visa apenas organizar, mas também transformar a experiência de aprendizado em algo mais colaborativo, motivador e efetivo.

---

## Instalação

### **Pré-requisitos**

- Python 3.12+
- MySQL 8.0+
- Node.js 18+
- Git

1. **Clone o repositório:**
```bash
  git clone https://github.com/Samuel-fernandesf/StudySphere.git
  cd StudySphere
```

2. **Instale as dependências do backend:**
```bash
  cd backend
  python3 -m venv venv
  
  # Linux/MacOS
  source venv/bin/activate

  # Windows
  ./venv/scripts/Activate.ps1

  pip install -r requirements.txt  
```

3. **Configure o Ambiente Virtual**

Renomeie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:
```python
  FLASK_SQLALCHEMY_DATABASE_URI=mysql+pymysql://{usuário}:{senha}@localhost:3306/studysphere
  FLASK_SECRET_KEY=sua_chave_secreta
  FLASK_JWT_SECRET_KEY=outra_chave_secreta
```

4. **Configure o Banco de Dados**

Primeiro crie **com o MySQL** uma base de dados de nome `studysphere`:
```sql
  CREATE DATABASE studysphere;
```

Após isso, na pasta backend/app execute
```bash
  flask db upgrade
```

### Instalando o Frontend

1. **Instale as dependências do frontend:**
```bash
  cd ../frontend
  npm install
```

## Rodando o Projeto

### **Rodando o Backend**

Na pasta `backend/app`, com o ambiente virtual ativado, execute:
```bash
  python index.py
```
O backend estará disponível em [http://127.0.0.1:5000](http://127.0.0.1:5000)


### **Rodando o Frontend**
Na pasta `frontend`, execute:
```bash
  npm run dev
```
O frontend estará disponível em [http://127.0.0.1:5000](http://127.0.0.1:5000)

--- 

## Mais conteúdo
Wiki Oficial - [Pagina Inicial](https://github.com/Samuel-fernandesf/StudySphere/wiki)<br>
Equipe de desenvolvimento - [Integrantes](https://github.com/Samuel-fernandesf/StudySphere/wiki/Equipe-de-desenvolvimento)<br>
Patch Notes - [Patch Notes](https://github.com/Samuel-fernandesf/StudySphere/wiki/Patch-Notes)<br>

