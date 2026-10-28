"""Compare public deployed route TTFB without cookies, cache busting, or redirects.

Usage: python3 scripts/measure-csp-ttfb.py BEFORE_URL PREVIEW_URL OUTPUT.json
The full response body is consumed. Each side gets one warmup and five samples,
interleaved by side. TTFB includes DNS, TCP, TLS, network transit, and server time.
This is an operational snapshot, not an isolated rendering or billing benchmark.
"""

import json
import statistics
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urljoin, urlparse

before, after, output = sys.argv[1:]
for origin in [before, after]:
    parsed = urlparse(origin)
    if parsed.scheme != "https" or parsed.username or parsed.password or parsed.query:
        raise ValueError("Use public HTTPS deployment origins without credentials or query parameters")

rows = []
with tempfile.TemporaryDirectory(prefix="csp-ttfb-") as temporary:
    headers_path = Path(temporary) / "headers"
    body_path = Path(temporary) / "body"
    for route, expected in [("/", 200), ("/artfight-profile", 200), ("/verify-token", 200), ("/missing-csp-test-route", 404)]:
        for sample in range(6):
            for side, origin in [("before", before), ("after", after)]:
                completed = subprocess.run([
                    "curl", "--silent", "--show-error", "--max-time", "30",
                    "--dump-header", str(headers_path), "--output", str(body_path),
                    "--write-out", "%{json}", urljoin(origin, route),
                ], check=True, capture_output=True, text=True)
                timing = json.loads(completed.stdout)
                headers = {}
                for line in headers_path.read_text().splitlines():
                    if ":" in line:
                        key, value = line.split(":", 1)
                        headers[key.lower()] = value.strip()
                body = body_path.read_bytes()
                if timing["http_code"] != expected or b"<html" not in body.lower() or b"<script" not in body.lower():
                    raise RuntimeError(f"Invalid document for {side} {route}: status {timing['http_code']}")
                rows.append({
                    "side": side, "route": route, "warmup": sample == 0,
                    "status": timing["http_code"], "bytes": len(body),
                    "ttfb_ms": round(timing["time_starttransfer"] * 1000, 2),
                    "tls_ms": round(timing["time_appconnect"] * 1000, 2),
                    "total_ms": round(timing["time_total"] * 1000, 2),
                    "edge_cache": headers.get("x-vercel-cache"),
                    "vercel_id": headers.get("x-vercel-id"),
                })

summary = []
for route in dict.fromkeys(row["route"] for row in rows):
    for side in ["before", "after"]:
        samples = [row for row in rows if row["route"] == route and row["side"] == side and not row["warmup"]]
        times = [row["ttfb_ms"] for row in samples]
        summary.append({"route": route, "side": side, "samples": len(times), "median_ms": statistics.median(times), "min_ms": min(times), "max_ms": max(times), "edge_cache": sorted(set(row["edge_cache"] or "absent" for row in samples))})

result = {"before_url": before, "after_url": after, "method": "curl, fresh connections, one discarded warmup plus five interleaved samples per side and route", "rows": rows, "summary": summary}
Path(output).write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(summary, indent=2))
