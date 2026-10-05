"""Run on the VPS; use only disposable synthetic users and never send mail."""
import json
import secrets
import sys
import urllib.error
import urllib.request
from pathlib import Path

env = dict(line.split('=', 1) for line in Path('/opt/pinkhouse/.env').read_text().splitlines()
           if '=' in line and not line.startswith('#'))
base = 'https://srv1978766.hstgr.cloud'
anon = env['ANON_KEY'].strip('"')
service = env['SERVICE_ROLE_KEY'].strip('"')

def call(method, path, key=anon, data=None, token=None):
    req = urllib.request.Request(base + path,
        data=json.dumps(data).encode() if data is not None else None,
        headers={'apikey': key, 'Authorization': 'Bearer ' + (token or key),
                 'Content-Type': 'application/json', 'Prefer': 'return=representation'}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            body = response.read()
            return response.status, json.loads(body) if body else None
    except urllib.error.HTTPError as error:
        body = error.read()
        return error.code, json.loads(body) if body else None

email = 'codex-optional-email-' + secrets.token_hex(12) + '@example.invalid'
password = secrets.token_urlsafe(24)
user_id = None
leave_for_ui = '--prepare-ui' in sys.argv
keep_for_ui = False
try:
    status, signup = call('POST', '/auth/v1/signup', data={
        'email': email, 'password': password, 'data': {'user_type': 'companion'}})
    assert status == 200 and signup.get('access_token'), ('immediate session', status)
    user_id = signup['user']['id']
    token = signup['access_token']
    status, login = call('POST', '/auth/v1/token?grant_type=password', data={'email': email, 'password': password})
    assert status == 200 and login.get('access_token'), ('password login', status)
    status, profiles = call('POST', '/rest/v1/acompanhantes', token=token, data={
        'auth_user_id': user_id, 'email': email, 'name': 'Teste de fluxo',
        'display_name': 'Teste de fluxo', 'phone': '81900000000', 'age': 25,
        'location': 'Recife - Boa Viagem', 'image': '/default-profile.png',
        'description': 'Conta descartável para validação técnica.',
        'is_active': False, 'is_verified': False, 'is_available': False})
    assert status == 201 and profiles, ('own profile insert', status, profiles)
    companion_id = profiles[0]['id']
    status, records = call('POST', '/rest/v1/companion_verifications', token=token,
        data={'companion_id': companion_id, 'email_verified': False, 'profile_completed': False})
    assert status == 201, ('verification insert', status, records)
    status, _ = call('POST', '/rest/v1/rpc/confirm_companion_email', token=token,
        data={'p_companion_id': companion_id})
    assert status == 403, ('password must not verify email', status)
    status, _ = call('PATCH', '/rest/v1/companion_verifications?companion_id=eq.' + companion_id,
        token=token, data={'email_verified': True})
    assert status == 403, ('direct trust flag must require OTP', status)
    status, link = call('POST', '/auth/v1/admin/generate_link', key=service,
        data={'type': 'magiclink', 'email': email})
    assert status == 200 and link.get('hashed_token'), ('generate synthetic link', status)
    if leave_for_ui:
        path = Path('/opt/pinkhouse-migration/optional-email-ui-test.json')
        path.write_text(json.dumps({'id': user_id, 'companion_id': companion_id,
            'email': email, 'password': password, 'token': token, 'token_hash': link['hashed_token']}))
        path.chmod(0o600)
        keep_for_ui = True
        print('PASS: immediate signup session; password login; own profile; trust blocked without OTP')
        print('UI_COMPANION=' + companion_id)
        print('UI_TOKEN_HASH=' + link['hashed_token'])
    else:
        status, otp = call('POST', '/auth/v1/verify', data={'type': 'magiclink', 'token_hash': link['hashed_token']})
        assert status == 200 and otp.get('access_token'), ('verify OTP', status)
        status, _ = call('POST', '/rest/v1/rpc/confirm_companion_email', token=otp['access_token'],
            data={'p_companion_id': companion_id})
        assert status in (200, 204), ('confirm email task', status)
        status, verified = call('GET', '/rest/v1/companion_verifications?companion_id=eq.' + companion_id,
            token=otp['access_token'])
        assert status == 200 and verified[0]['email_verified'] and verified[0]['reliability_score'] == 17, ('score', status, verified)
        print('PASS: immediate signup session; password login; trust blocked without OTP; OTP verified; score 17% (20/120 points)')
finally:
    if user_id and not keep_for_ui:
        status, _ = call('POST', '/functions/v1/delete-account', token=token, data={'confirmation': 'EXCLUIR'})
        assert status == 200, ('cleanup', status)
        print('CLEANUP: synthetic account removed')
