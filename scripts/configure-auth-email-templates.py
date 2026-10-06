"""Apply only localized Auth template URLs and subjects on the VPS."""
import json
import re
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
config = json.loads((repo / 'supabase/email-templates/config.pt-BR.json').read_text())
compose = Path('/opt/pinkhouse/docker-compose.yml')
text = compose.read_text()
anchor = '      GOTRUE_MAILER_URLPATHS_INVITE:'
assert text.count(anchor) == 1, 'Expected the existing Auth mailer environment block'
text = re.sub(r'^      GOTRUE_MAILER_(?:TEMPLATES|SUBJECTS)_[A-Z_]+:.*\n', '', text, flags=re.M)
entries = []
for flow, template in config.items():
    entries.append(f"      GOTRUE_MAILER_TEMPLATES_{flow}: " + json.dumps('https://www.pinkhousebr.com/auth-email-templates/' + template['file']))
    entries.append(f"      GOTRUE_MAILER_SUBJECTS_{flow}: " + json.dumps(template['subject'], ensure_ascii=False))
text = text.replace(anchor, '\n'.join(entries) + '\n' + anchor)
compose.write_text(text)
print('Configured six Auth email subjects and templates in pt-BR; SMTP settings unchanged.')
