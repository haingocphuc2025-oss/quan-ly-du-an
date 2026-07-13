"""Local dev server with headers required for Google OAuth popup/redirect."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

PORT = 8000
DIR = os.path.dirname(os.path.abspath(__file__))


class OAuthHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
        self.send_header('Referrer-Policy', 'no-referrer-when-downgrade')
        super().end_headers()


if __name__ == '__main__':
    os.chdir(DIR)
    server = ThreadingHTTPServer(('localhost', PORT), OAuthHandler)
    print(f'Serving {DIR}')
    print(f'Open: http://localhost:{PORT}/giao-dien-desktop-don-gian_v20_quan.html')
    print('Headers: COOP=same-origin-allow-popups, Referrer-Policy=no-referrer-when-downgrade')
    server.serve_forever()
