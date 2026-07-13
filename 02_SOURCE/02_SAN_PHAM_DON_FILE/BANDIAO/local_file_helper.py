from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse
import base64
import json
import os
import re
import sys

HOST = "127.0.0.1"
PORT = 8780
ROOT = (Path(__file__).resolve().parent.parent / "_LOCAL_ATTACHMENTS").resolve()
PROJECT_ROOT = (Path(__file__).resolve().parent.parent / "_PROJECT_DATA").resolve()
PROJECT_FILE = PROJECT_ROOT / "qlda_project_backup.json"


def safe_part(value, fallback="item"):
    text = str(value or "").strip()
    text = re.sub(r'[<>:"/\\|?*\x00-\x1f]+', "_", text)
    text = re.sub(r"\s+", " ", text).strip(" .")
    return (text or fallback)[:120]


def unique_path(path):
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    parent = path.parent
    for index in range(2, 1000):
        candidate = parent / f"{stem} ({index}){suffix}"
        if not candidate.exists():
            return candidate
    raise RuntimeError("Too many duplicate files")


def is_under_root(path):
    try:
        path.resolve().relative_to(ROOT)
        return True
    except ValueError:
        return False


class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def log_message(self, fmt, *args):
        return

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.send_json(200, {"ok": True, "root": str(ROOT), "projectFile": str(PROJECT_FILE)})
            return
        if parsed.path == "/project":
            if not PROJECT_FILE.exists():
                self.send_json(200, {"ok": False, "missing": True, "projectFile": str(PROJECT_FILE)})
                return
            try:
                data = json.loads(PROJECT_FILE.read_text(encoding="utf-8"))
                self.send_json(200, {"ok": True, "projectFile": str(PROJECT_FILE), "data": data})
            except Exception as exc:
                self.send_json(500, {"ok": False, "error": str(exc), "projectFile": str(PROJECT_FILE)})
            return
        if parsed.path == "/open":
            target = parse_qs(parsed.query).get("path", [""])[0]
            path = Path(target).resolve()
            if not target or not path.exists() or not is_under_root(path):
                self.send_json(404, {"ok": False, "error": "File not found or outside local attachments folder"})
                return
            os.startfile(str(path))
            html = f"""<!doctype html><meta charset="utf-8"><title>Opened</title>
<body style="font-family:Segoe UI,Arial;padding:24px">
<h3>Đã mở file</h3><p>{path.name}</p><script>setTimeout(()=>window.close(),900)</script></body>"""
            data = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        self.send_json(404, {"ok": False, "error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/project":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
                payload["savedAt"] = payload.get("savedAt") or __import__("datetime").datetime.now().isoformat()
                PROJECT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                self.send_json(200, {"ok": True, "projectFile": str(PROJECT_FILE)})
            except Exception as exc:
                self.send_json(500, {"ok": False, "error": str(exc), "projectFile": str(PROJECT_FILE)})
            return
        if parsed.path != "/save":
            self.send_json(404, {"ok": False, "error": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            data_url = payload.get("dataUrl", "")
            if "," in data_url:
                data_url = data_url.split(",", 1)[1]
            blob = base64.b64decode(data_url)

            # Large-file mode: keep every uploaded attachment in one shared folder.
            # Google Drive for Desktop syncs this folder in the background.
            folder = ROOT
            folder.mkdir(parents=True, exist_ok=True)
            file_path = unique_path(folder / safe_part(payload.get("fileName"), "attachment.bin"))
            file_path.write_bytes(blob)

            open_url = f"http://{HOST}:{PORT}/open?path={quote(str(file_path))}"
            self.send_json(200, {"ok": True, "localPath": str(file_path), "localOpenUrl": open_url, "localFolder": str(folder)})
        except Exception as exc:
            self.send_json(500, {"ok": False, "error": str(exc)})


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"QLDA Local File Helper running at http://{HOST}:{PORT}")
    print(f"Local attachments root: {ROOT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
