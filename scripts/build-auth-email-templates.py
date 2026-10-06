"""Generate the Brazilian Portuguese Auth templates without changing link tokens."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = {
    'confirmation': {
        'flow': 'CONFIRMATION', 'subject': 'Pink House | Confirme seu e-mail',
        'title': 'Confirme seu e-mail',
        'message': 'Confirme seu endereço de e-mail usando o botão abaixo para continuar na Pink House.',
        'button': 'Confirmar meu e-mail',
        'ignore': 'Se você não criou uma conta na Pink House, ignore este e-mail.',
    },
    'magic-link': {
        'flow': 'MAGIC_LINK', 'subject': 'Pink House | Confirme seu e-mail e continue',
        'title': 'Confirme seu e-mail',
        'message': 'Você solicitou um link para confirmar seu e-mail ou acessar sua conta na Pink House. Use o botão abaixo para continuar com segurança.',
        'button': 'Confirmar e continuar',
        'ignore': 'Se você não solicitou este link, ignore este e-mail.',
    },
    'recovery': {
        'flow': 'RECOVERY', 'subject': 'Pink House | Redefina sua senha',
        'title': 'Redefina sua senha',
        'message': 'Recebemos uma solicitação para redefinir a senha da sua conta na Pink House. Use o botão abaixo para escolher uma nova senha.',
        'button': 'Redefinir senha',
        'ignore': 'Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá a mesma.',
    },
    'invite': {
        'flow': 'INVITE', 'subject': 'Pink House | Você recebeu um convite',
        'title': 'Você recebeu um convite',
        'message': 'Você recebeu um convite para criar sua conta na Pink House. Use o botão abaixo para continuar.',
        'button': 'Aceitar convite',
        'ignore': 'Se você não esperava este convite, pode ignorar este e-mail.',
    },
    'email-change': {
        'flow': 'EMAIL_CHANGE', 'subject': 'Pink House | Confirme a alteração do seu e-mail',
        'title': 'Confirme a alteração do seu e-mail',
        'message': 'Recebemos uma solicitação para alterar o e-mail da sua conta de {{ .Email }} para {{ .NewEmail }}. Use o botão abaixo para confirmar a alteração.',
        'button': 'Confirmar alteração',
        'ignore': 'Se você não solicitou esta alteração, ignore este e-mail e revise a segurança da sua conta.',
    },
    'reauthentication': {
        'flow': 'REAUTHENTICATION', 'subject': 'Pink House | Seu código de verificação',
        'title': 'Confirme sua identidade',
        'message': 'Use o código abaixo para confirmar sua identidade e concluir a ação solicitada na Pink House.',
        'ignore': 'Não compartilhe este código. Se você não solicitou esta verificação, ignore este e-mail.',
    },
}

def render(config):
    if 'button' in config:
        action = f'''<p style="margin:28px 0;text-align:center;">
          <a href="{{{{ .ConfirmationURL }}}}" style="display:inline-block;padding:15px 28px;background-color:#d91d83;border-radius:28px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">{html.escape(config['button'])}</a>
        </p>
        <p style="font-size:12px;line-height:1.6;color:#777777;">Se o botão não funcionar, copie e cole este endereço no seu navegador:<br><a href="{{{{ .ConfirmationURL }}}}" style="color:#d91d83;word-break:break-all;">{{{{ .ConfirmationURL }}}}</a></p>'''
    else:
        action = '<p style="margin:28px 0;padding:18px;background-color:#fdf2f8;text-align:center;border-radius:12px;font-size:30px;font-weight:bold;letter-spacing:5px;color:#d91d83;">{{ .Token }}</p>'
    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>{html.escape(config['title'])} | Pink House</title></head>
<body style="margin:0;padding:0;background-color:#f8f4f6;font-family:Arial,Helvetica,sans-serif;color:#333333;">
  <div style="display:none;max-height:0;overflow:hidden;">{html.escape(config['title'])} na Pink House.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background-color:#f8f4f6;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:26px 24px;background-color:#d91d83;text-align:center;color:#ffffff;font-size:24px;font-weight:bold;">Pink House</td></tr>
        <tr><td style="padding:30px 24px;">
          <h1 style="margin:0 0 20px;text-align:center;font-size:23px;color:#222222;">{html.escape(config['title'])}</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Olá!</p>
          <p style="margin:0;font-size:15px;line-height:1.7;">{html.escape(config['message'])}</p>
          {action}
          <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#777777;">{html.escape(config['ignore'])}</p>
        </td></tr>
        <tr><td style="padding:18px 24px;background-color:#fdf2f8;text-align:center;font-size:12px;color:#777777;">Pink House &bull; Sua privacidade importa.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
'''

if __name__ == '__main__':
    output = ROOT / 'public/auth-email-templates'
    output.mkdir(parents=True, exist_ok=True)
    config = {}
    for name, template in TEMPLATES.items():
        (output / (name + '.html')).write_text(render(template), encoding='utf-8')
        config[template['flow']] = {'file': name + '.html', 'subject': template['subject']}
    (ROOT / 'supabase/email-templates/config.pt-BR.json').write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    # Preserve the existing confirmation template path for external setups.
    (ROOT / 'supabase/email-templates/confirm-email.html').write_text(render(TEMPLATES['confirmation']), encoding='utf-8')
    print('Generated six pt-BR templates, preserving ConfirmationURL and Token.')
