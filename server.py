#!/usr/bin/env python3
import http.server
import ssl
import os

# Create SSL context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('server.cert', 'server.key')

# Change to web directory
os.chdir('/Users/martin/dev/project/sredna_skorost/web')

# Create server
server_address = ('0.0.0.0', 8443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("HTTPS Server running on:")
print("https://localhost:8443")
print("https://192.168.1.7:8443")
print("https://10.7.50.75:8443")
print("\nNote: You'll need to accept the security warning in your browser")

httpd.serve_forever()