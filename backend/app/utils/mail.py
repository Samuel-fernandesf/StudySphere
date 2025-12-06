import smtplib
from email.message import EmailMessage
from flask import current_app
from datetime import datetime
import pytz

LOGO_URL = "https://i.ibb.co/MxqYGhQc/STUDYSPHERE.png"  # substitua pelo link direto da sua imagem no Imgur

def send_confirm_email(user):
    token = user.get_confirmation_token()
    frontend_url = 'http://localhost:3000'
    confirm_link = f'{frontend_url}/confirmar-email/{token}'

    plain_text = f"""\
Olá {user.nome_completo},

Bem-vindo(a) à StudySphere!

Para confirmar seu endereço de e-mail e ativar sua conta, clique no link abaixo:

{confirm_link}

Se o link não funcionar, copie e cole o URL no seu navegador.

Caso você não tenha solicitado este e-mail, apenas ignore esta mensagem.

Atenciosamente,
Equipe StudySphere
"""

    html_content = f"""\
<html>
  <body style="font-family: Arial, sans-serif; color: #333; margin:0; padding:0;">
    <!-- Logo no topo -->
    <div style="text-align:center; padding:20px;">
      <img src="{LOGO_URL}" alt="StudySphere" width="200" style="display:block; margin:0 auto;">
    </div>

    <div style="padding: 0 20px;">
      <h2 style="color: #3b5a74;">Olá {user.nome_completo},</h2>
      <p>Bem-vindo(a) à <strong>StudySphere</strong>!</p>
      <p>Para confirmar seu endereço de e-mail e ativar sua conta, clique no botão abaixo:</p>
      <p style="text-align:center;">
        <a href="{confirm_link}" 
           style="background-color:#3b5a74; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px; display:inline-block;">
          Confirmar E-mail
        </a>
      </p>
      <p>Se o botão não funcionar, copie e cole o seguinte link no seu navegador:</p>
      <p>{confirm_link}</p>
    </div>

    <!-- Rodapé -->
    <div style="margin-top:30px; text-align:center; font-size:0.9em; color:#555; padding:20px; border-top:1px solid #ddd;">
      <p>© StudySphere 2025 — Todos os direitos reservados</p>
      <p>Suporte: suporte.studysphere@gmail.com</p>
    </div>
  </body>
</html>
"""

    msg = EmailMessage()
    msg['Subject'] = 'Confirmação de Email - StudySphere'
    msg['From'] = f"Suporte StudySphere <{current_app.config['MAIL_USERNAME']}>"
    msg['To'] = user.email
    msg.set_content(plain_text)
    msg.add_alternative(html_content, subtype='html')

    EMAIL = current_app.config['MAIL_USERNAME']
    SENHA = current_app.config['MAIL_PASSWORD']

    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.starttls()
        smtp.login(EMAIL, SENHA)
        smtp.send_message(msg)

    print('E-mail de confirmação enviado com sucesso!')


def send_reset_email(user):
    token = user.get_reset_token()
    frontend_url = 'http://localhost:3000'
    reset_link = f'{frontend_url}/redefinir-senha/{token}'

    tz_brasilia = pytz.timezone('America/Sao_Paulo')
    hora_brasil = datetime.now(tz_brasilia)
    date = hora_brasil.strftime("%d/%m/%Y - %H:%M:%S")

    plain_text = f"""\
Olá {user.nome_completo},

Recebemos uma solicitação para redefinir sua senha na StudySphere.

Para criar uma nova senha, clique no link abaixo:

{reset_link}

Se o link não funcionar, copie e cole o URL no seu navegador.

Este link é válido por um período limitado. Caso você não tenha solicitado a redefinição, apenas ignore este e-mail.

Atenciosamente,
Equipe StudySphere
"""

    html_content = f"""\
<html>
  <body style="font-family: Arial, sans-serif; color: #333; margin:0; padding:0;">
    <!-- Logo no topo -->
    <div style="text-align:center; padding:20px;">
      <img src="{LOGO_URL}" alt="StudySphere" width="200" style="display:block; margin:0 auto;">
    </div>

    <div style="padding: 0 20px;">
      <h2 style="color: #3b5a74;">Olá {user.nome_completo},</h2>
      <p>Recebemos uma solicitação para redefinir sua senha na <strong>StudySphere</strong>.</p>
      <p>Para criar uma nova senha, clique no botão abaixo:</p>
      <p style="text-align:center;">
        <a href="{reset_link}" 
           style="background-color:#3b5a74; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px; display:inline-block;">
          Redefinir Senha
        </a>
      </p>
      <p>Se o botão não funcionar, copie e cole o seguinte link no seu navegador:</p>
      <p>{reset_link}</p>
    </div>

    <!-- Rodapé -->
    <div style="margin-top:30px; text-align:center; font-size:0.9em; color:#555; padding:20px; border-top:1px solid #ddd;">
      <p>© StudySphere 2025 — Todos os direitos reservados</p>
      <p>Suporte: suporte.studysphere@gmail.com</p>
    </div>
  </body>
</html>
"""

    msg = EmailMessage()
    msg['Subject'] = f'Redefinição de Senha {date} - StudySphere'
    msg['From'] = f"Suporte StudySphere <{current_app.config['MAIL_USERNAME']}>"
    msg['To'] = user.email
    msg.set_content(plain_text)
    msg.add_alternative(html_content, subtype='html')

    EMAIL = current_app.config['MAIL_USERNAME']
    SENHA = current_app.config['MAIL_PASSWORD']

    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.starttls()
        smtp.login(EMAIL, SENHA)
        smtp.send_message(msg)

    print('E-mail de redefinição enviado com sucesso!')
