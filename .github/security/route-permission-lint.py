#!/usr/bin/env python3
import json
import os
from pathlib import Path
import subprocess
import sys

tracked = subprocess.check_output(['git', 'ls-files', '-z']).decode().split('\0')
def handler(path):
    return (path.endswith(('/route.ts', '/route.js', '/route.tsx', '/route.jsx'))
            or 'pages/api/' in path or path.startswith('functions/'))

helpers = ('getExocorpseSessionFromCookies', 'authenticatedExocorpseFetch')
missing = sorted(path for path in tracked if path and handler(path)
                 and Path(path).is_file()
                 and not any(helper in Path(path).read_text() for helper in helpers))
allowlist = set(Path('.github/security/route-allowlist.txt').read_text().splitlines())
new = sorted(set(missing) - allowlist)
resolved = sorted(allowlist - set(missing))
print(json.dumps({'repo': os.getenv('GITHUB_REPOSITORY', ''),
                  'sha': os.getenv('GITHUB_SHA', ''), 'job': 'route-permission-lint',
                  'new': new, 'resolved': resolved}, indent=2))
sys.exit(bool(new))
