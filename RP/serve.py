from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

    def list_directory(self, path):
        # Only allow directory listing for /papers
        if not self.path.startswith('/papers'):
            self.send_error(403, "Directory listing not allowed")
            return None
        return super().list_directory(path)

if __name__ == '__main__':
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print(f"Serving at http://localhost:{port}")
    httpd.serve_forever()
