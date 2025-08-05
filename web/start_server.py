#!/usr/bin/env python3
import http.server
import ssl
import os
import sys
import threading
import time

def start_server():
    try:
        # Ensure we're in the correct directory (should be run from web/ directory)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        # Create SSL context
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('server.cert', 'server.key')
        
        # Create server
        port = 8443
        server_address = ('0.0.0.0', port)
        httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"🚀 HTTPS Server started on port {port}")
        print(f"📱 Access URLs:")
        print(f"   • https://localhost:{port}")
        print(f"   • https://192.168.1.7:{port}")
        print("✅ Server is ready for connections!")
        
        # Start server
        httpd.serve_forever()
        
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    start_server()