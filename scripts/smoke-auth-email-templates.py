"""Capture actual GoTrue mail in a private SMTP sink, without mailing users.

Runs on the VPS using the existing Auth image and Docker network. Disposable
Auth accounts are removed afterward; production SMTP is never intercepted.
"""
import email
import html
import json
import re
import secrets
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from email.header import decode_header, make_header
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
templates = json.loads((repo / 'supabase/email-templates/config.pt-BR.json').read_text())
container = json.loads(subprocess.check_output(['docker', 'inspect', 'supabase-auth']))[0]
network, network_info = next(iter(container['NetworkSettings']['Networks'].items()))
env = dict(value.split('=', 1) for value in container['Config']['Env'] if '=' in value)
service = dict(line.split('=', 1) for line in Path('/opt/pinkhouse/.env').read_text().splitlines() if '=' in line and not line.startswith('#'))['SERVICE_ROLE_KEY'].strip('"')
capture = Path('/opt/pinkhouse-migration/email-template-capture')
capture.mkdir(mode=0o700, exist_ok=True)
smtp_container = 'pinkhouse-email-template-smtp-test'
subprocess.run(['docker', 'run', '-d', '--name', smtp_container, '--network', network,
    '-v', str(capture) + ':/capture', '-v', str(repo / 'scripts/smtp-capture.mjs') + ':/script.mjs:ro',
    'node:22-alpine', 'node', '/script.mjs'], check=True, stdout=subprocess.DEVNULL)
smtp_info = json.loads(subprocess.check_output(['docker', 'inspect', smtp_container]))[0]
smtp_ip = smtp_info['NetworkSettings']['Networks'][network]['IPAddress']

def messages():
    return [email.message_from_bytes(path.read_bytes()) for path in sorted(capture.glob('message-*.eml'))]

env.update({
    'GOTRUE_SMTP_HOST': smtp_ip, 'GOTRUE_SMTP_PORT': '2525',
    'GOTRUE_SMTP_USER': '', 'GOTRUE_SMTP_PASS': '',
    'GOTRUE_SMTP_MAX_FREQUENCY': '0s', 'GOTRUE_RATE_LIMIT_EMAIL_SENT': '200',
    'GOTRUE_MAILER_AUTOCONFIRM': 'false',
    'GOTRUE_MAILER_SECURE_EMAIL_CHANGE_ENABLED': 'true',
})
for flow, template in templates.items():
    env[f'GOTRUE_MAILER_TEMPLATES_{flow}'] = 'https://www.pinkhousebr.com/auth-email-templates/' + template['file']
    env[f'GOTRUE_MAILER_SUBJECTS_{flow}'] = template['subject']
env_path = Path('/opt/pinkhouse-migration/email-template-test.env')
env_path.write_text('\n'.join(f'{key}={value}' for key, value in env.items()) + '\n')
env_path.chmod(0o600)
test_container = 'pinkhouse-email-template-test'
created = []
base = None
password = secrets.token_urlsafe(24)
address = 'codex-email-ptbr-' + secrets.token_hex(12) + '@example.invalid'

def call(method, path, data=None, token=service):
    request = urllib.request.Request(base + path, method=method,
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
        data=json.dumps(data).encode() if data is not None else None)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read()
            return response.status, json.loads(body) if body else None
    except urllib.error.HTTPError as error:
        # Avoid logging body/token/addresses. The status and operation identify failures.
        return error.code, None

def verify_mail(flow, start):
    captured_messages = messages()[start:]
    assert captured_messages, (flow, 'no email captured')
    for message in captured_messages:
        subject = str(make_header(decode_header(message['Subject'])))
        assert subject == templates[flow]['subject'], (flow, 'unexpected subject')
        sender = str(make_header(decode_header(message['From'])))
        assert 'Pink' in sender, (flow, 'unexpected sender')
        parts = [part for part in message.walk() if part.get_content_type() == 'text/html']
        assert parts, (flow, 'HTML missing')
        content = parts[0].get_payload(decode=True).decode(parts[0].get_content_charset() or 'utf-8')
        assert '<html lang="pt-BR">' in content and 'Olá!' in content, (flow, 'default English template used')
        assert '{{' not in content, (flow, 'unrendered variables')
        assert not re.search(r'Confirm your|Follow this link|Reset Password|Magic Link|You have been invited', content, re.I), (flow, 'English content')
        if flow == 'REAUTHENTICATION':
            assert re.search(r'>\s*\d{6}\s*</p>', content), (flow, 'verification code missing')
        else:
            links = re.findall(r'href="([^"]+)"', content)
            assert links and all('/auth/v1/verify?' in html.unescape(link) for link in links), (flow, 'confirmation links missing')
            assert all(urllib.parse.parse_qs(urllib.parse.urlparse(html.unescape(link)).query).get('token') for link in links), (flow, 'tokens missing')
        if flow in ('MAGIC_LINK', 'RECOVERY'):
            # Public visual proof contains no token and no real address.
            preview = re.sub(r'https?://[^\s<>"]+', 'https://www.pinkhousebr.com/login', content)
            preview_dir = Path('/opt/pinkhouse/site-dist/email-preview-ptbr')
            preview_dir.mkdir(exist_ok=True)
            (preview_dir / templates[flow]['file']).write_text(preview)
    print(f'PASS: {flow} — {len(captured_messages)} message(s), Portuguese subject/body, rendered links/code.')

try:
    subprocess.run(['docker', 'run', '-d', '--name', test_container, '--network', network,
        '--env-file', str(env_path), container['Config']['Image']], check=True, stdout=subprocess.DEVNULL)
    fixture = json.loads(subprocess.check_output(['docker', 'inspect', test_container]))[0]
    base = 'http://' + fixture['NetworkSettings']['Networks'][network]['IPAddress'] + ':9999'
    for attempt in range(30):
        try:
            if call('GET', '/health')[0] == 200:
                break
        except (urllib.error.URLError, ConnectionError):
            pass
        time.sleep(1)
    assert call('GET', '/health')[0] == 200, 'Isolated Auth did not start'
    start = len(messages())
    status, user = call('POST', '/signup', {'email': address, 'password': password})
    assert status == 200 and user, ('signup', status)
    user_id = user.get('id') or user['user']['id']
    created.append(user_id)
    verify_mail('CONFIRMATION', start)
    assert call('PUT', '/admin/users/' + user_id, {'email_confirm': True})[0] == 200
    start = len(messages())
    assert call('POST', '/otp', {'email': address, 'create_user': False})[0] == 200
    verify_mail('MAGIC_LINK', start)
    start = len(messages())
    assert call('POST', '/recover', {'email': address})[0] == 200
    verify_mail('RECOVERY', start)
    start = len(messages())
    status, invite = call('POST', '/invite', {'email': address.replace('@', '-invite@')})
    assert status == 200 and invite, ('invite', status)
    created.append(invite['id'])
    verify_mail('INVITE', start)
    status, login = call('POST', '/token?grant_type=password', {'email': address, 'password': password})
    assert status == 200 and login.get('access_token'), ('password login', status)
    token = login['access_token']
    start = len(messages())
    assert call('GET', '/reauthenticate', token=token)[0] == 200
    verify_mail('REAUTHENTICATION', start)
    start = len(messages())
    assert call('PUT', '/user', {'email': address.replace('@', '-new@')}, token=token)[0] == 200
    verify_mail('EMAIL_CHANGE', start)
    print(f'PASS: All six Auth flows captured privately; {len(messages())} total messages; no mail sent to users.')
finally:
    failures = []
    if base:
        for user_id in created:
            if call('DELETE', '/admin/users/' + user_id)[0] != 200:
                failures.append(user_id)
    subprocess.run(['docker', 'rm', '-f', test_container], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(['docker', 'rm', '-f', smtp_container], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for path in capture.glob('message-*.eml'):
        path.unlink()
    capture.rmdir()
    env_path.unlink(missing_ok=True)
    assert not failures, 'Some disposable Auth users were not removed'
    print('CLEANUP: Disposable users, isolated Auth container and temporary credentials removed.')
