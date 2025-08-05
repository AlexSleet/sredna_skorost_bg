#!/usr/bin/env python3
import http.server
import ssl
import os
import sys

def main():
    try:
        # Change to web directory
        web_dir = '/Users/martin/dev/project/sredna_skorost/web'
        os.chdir(web_dir)
        print(f"✅ Working directory: {os.getcwd()}")
        
        # Check if certificates exist
        if not os.path.exists('server.cert') or not os.path.exists('server.key'):
            print("❌ Error: SSL certificates not found!")
            print(f"Looking for server.cert and server.key in: {os.getcwd()}")
            sys.exit(1)
        
        # Create SSL context
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('server.cert', 'server.key')
        print("✅ SSL certificates loaded successfully")
        
        # Create server on all interfaces
        port = 8443
        server_address = ('0.0.0.0', port)
        httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print("\n🚀 HTTPS Server is running!")
        print("📱 Access from your devices:")
        print(f"   • Local:    https://localhost:{port}")
        print(f"   • Network:  https://192.168.1.7:{port}")
        print("\n⚠️  Note: Accept the security warning in your browser")
        print("🛰️  GPS tracking requires HTTPS - now enabled!")
        print("\n🔴 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        print("\n\n✋ Server stopped by user")
        httpd.shutdown()
        httpd.server_close()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Error: Port {port} is already in use")
            print("Try killing existing processes or restart your computer")
        else:
            print(f"❌ Network error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()