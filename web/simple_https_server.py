#!/usr/bin/env python3
import http.server
import ssl
import os
import sys

try:
    # Change to web directory
    os.chdir('/Users/martin/dev/project/sredna_skorost/web')
    print("Working directory:", os.getcwd())
    
    # Check if certificates exist
    if not os.path.exists('server.cert') or not os.path.exists('server.key'):
        print("Error: SSL certificates not found!")
        print("Looking for server.cert and server.key in:", os.getcwd())
        sys.exit(1)
    
    # Create SSL context
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('server.cert', 'server.key')
    print("SSL certificates loaded successfully")
    
    # Create server
    server_address = ('0.0.0.0', 8444)
    httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print("HTTPS Server starting...")
    print("Access URLs:")
    print("  - https://localhost:8444")
    print("  - https://192.168.1.7:8444")
    print("  - https://10.7.50.75:8444")
    print("\nNote: You'll need to accept the security warning in your browser")
    print("Server is running... Press Ctrl+C to stop")
    
    httpd.serve_forever()
    
except KeyboardInterrupt:
    print("\nServer stopped by user")
    httpd.shutdown()
except Exception as e:
    print(f"Error starting server: {e}")
    sys.exit(1)