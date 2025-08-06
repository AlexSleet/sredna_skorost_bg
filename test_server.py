#!/usr/bin/env python3
import os
print("🔍 Testing server setup...")
print(f"Current directory: {os.getcwd()}")

# Check if we can change to the web directory
web_dir = '/Users/martin/dev/project/sredna_skorost/web'
try:
    os.chdir(web_dir)
    print(f"✅ Changed to: {os.getcwd()}")
except Exception as e:
    print(f"❌ Error changing directory: {e}")
    exit(1)

# Check if certificates exist
cert_files = ['server.cert', 'server.key']
for cert_file in cert_files:
    if os.path.exists(cert_file):
        print(f"✅ Found: {cert_file}")
    else:
        print(f"❌ Missing: {cert_file}")

# Test SSL import
try:
    import ssl
    print("✅ SSL module imported successfully")
    
    # Test creating SSL context
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    print("✅ SSL context created")
    
    # Test loading certificates
    context.load_cert_chain('server.cert', 'server.key')
    print("✅ Certificates loaded successfully")
    
except Exception as e:
    print(f"❌ SSL error: {e}")

# Test basic HTTP server
try:
    import http.server
    import socket
    
    # Test if port is available
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', 8443))
    sock.close()
    
    if result == 0:
        print("❌ Port 8443 is already in use")
    else:
        print("✅ Port 8443 is available")
        
except Exception as e:
    print(f"❌ Network test error: {e}")

print("🏁 Test complete!")