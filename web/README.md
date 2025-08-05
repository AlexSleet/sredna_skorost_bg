# Web Version - Sredna Skorost BG

This is the original web-based prototype of the Sredna Skorost BG highway speed monitoring application. It was the initial proof-of-concept that later evolved into the full Flutter mobile app.

## 🌐 Overview

The web version provides a browser-based speed monitoring interface that can be accessed from any device with GPS capabilities. It uses JavaScript for real-time GPS tracking and includes all the core speed monitoring algorithms.

## 📁 File Structure

```
web/
├── index.html              # Main application interface
├── working_index.html      # Stable backup version
├── debug.html             # Debug version with console output
├── app.js                 # Core JavaScript application logic
├── styles.css             # Application styling
├── server.py              # Python development server
├── https_server.py        # HTTPS server for GPS access
├── simple_https_server.py # Simplified HTTPS server
├── start_server.py        # Server startup script
├── test_server.py         # Server testing utilities
├── server.cert           # SSL certificate for HTTPS
├── server.crt            # SSL certificate file
├── server.key            # SSL private key
├── qr.html               # QR code for easy mobile access
├── qr-https.html         # QR code for HTTPS version
├── test-location.html    # GPS testing page
├── README_HIGHWAY_SECTIONS.md # Highway segments documentation
└── venv/                 # Python virtual environment
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.x** installed on your system
- Modern web browser with GPS support
- **HTTPS required** for GPS access (browsers block location in HTTP)

### Running the Application

1. **Navigate to the web directory**:
```bash
cd web/
```

2. **Set up Python virtual environment** (if not already done):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Start the HTTPS server**:
```bash
python https_server.py
```

4. **Open in browser**:
   - Navigate to: `https://localhost:8443`
   - Accept the self-signed certificate warning
   - Grant location permissions when prompted

### Alternative Server Options

**Simple HTTPS Server**:
```bash
python simple_https_server.py
```

**Development Server** (HTTP only - limited GPS functionality):
```bash
python server.py
```

**Using start_server.py**:
```bash
python start_server.py
```

## 📱 Mobile Access

### QR Code Access
- Open `qr-https.html` in your browser to generate a QR code
- Scan with mobile device for quick access
- Ensure both devices are on the same network

### Network Access
The server binds to all interfaces, allowing access from other devices:
- Find your local IP address: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- Access from mobile: `https://YOUR_IP_ADDRESS:8443`

## 🧪 Testing Features

### Location Testing
- Open `test-location.html` for GPS functionality testing
- Verify coordinates are being received correctly
- Check accuracy and update frequency

### Debug Mode
- Use `debug.html` for detailed console logging
- Monitor speed calculations and zone detection
- View real-time GPS data and algorithm decisions

## 🔧 Key Features

### Real-Time Speed Monitoring
- GPS-based speed calculation using the Haversine formula
- 1-second update intervals for precise tracking
- Speed displayed in km/h with decimal precision

### Highway Zone Detection
- Automatic detection of entry/exit from monitored segments
- Support for all 8 A1/E80 highway sections
- Bidirectional travel detection

### Speed Guidance System
- Real-time average speed calculation within zones
- Recommended speed suggestions to maintain legal limits
- Visual warnings when speed is too high

### Session Management
- Automatic session tracking and persistence
- Historical data storage using localStorage
- Session summary with average speeds and legal compliance

## 📍 Monitored Highway Segments

The web version monitors the same highway sections as the mobile app:

1. **Вакарел → Ихтиман** (140 km/h limit)
2. **Ихтиман → Траянови врата** (140 km/h limit)
3. **Траянови врата → Белозем** (140 km/h limit)
4. **Белозем → Капитан Димитриево** (140 km/h limit)
5. **Капитан Димитриево → Динката** (140 km/h limit)
6. **Динката → Цалапица** (140 km/h limit)
7. **Цалапица → Радиново** (140 km/h limit)
8. **Радиново → Трилистник** (140 km/h limit)

See `README_HIGHWAY_SECTIONS.md` for detailed coordinate information.

## 🔐 SSL Certificate

The included SSL certificate is self-signed for development purposes:
- **Valid for**: localhost, 127.0.0.1, and local network access
- **Purpose**: Enable HTTPS for GPS access in browsers
- **Security**: For development only - use proper certificates in production

### Generating New Certificates

If you need to regenerate the SSL certificate:

```bash
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=localhost"
```

## 🔍 Troubleshooting

### GPS Not Working
1. **Ensure HTTPS**: GPS requires secure context (HTTPS)
2. **Grant Permissions**: Allow location access when prompted
3. **Check Browser Support**: Use modern browsers (Chrome, Firefox, Safari)
4. **Test Location**: Use `test-location.html` to verify GPS functionality

### Server Issues
1. **Port Conflicts**: Change port in server files if 8443 is occupied
2. **Certificate Errors**: Accept self-signed certificate in browser
3. **Network Access**: Ensure firewall allows connections on the chosen port

### Performance Issues
1. **GPS Accuracy**: Wait for GPS signal to stabilize (may take 30-60 seconds)
2. **Browser Performance**: Close unnecessary tabs and applications
3. **Network Latency**: Use local server for best performance

## 📊 Technical Implementation

### Speed Calculation Algorithm
```javascript
function calculateSpeed(lat1, lon1, lat2, lon2, timeDiff) {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return (distance / (timeDiff / 3600000)) || 0; // Speed in km/h
}
```

### Zone Detection Logic
```javascript
function isInHighwaySegment(lat, lon, segment) {
    const tolerance = 0.001; // ~100 meters
    
    // Check if point lies within segment boundaries
    const minLat = Math.min(segment.start.lat, segment.end.lat) - tolerance;
    const maxLat = Math.max(segment.start.lat, segment.end.lat) + tolerance;
    const minLon = Math.min(segment.start.lon, segment.end.lon) - tolerance;
    const maxLon = Math.max(segment.start.lon, segment.end.lon) + tolerance;
    
    return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
}
```

## 🔄 Comparison with Mobile App

### Advantages of Web Version
- **Universal Access**: Works on any device with a browser
- **No Installation**: Instant access without app store downloads
- **Cross-Platform**: Same experience on iOS, Android, desktop
- **Easy Updates**: Server-side updates affect all users immediately

### Limitations vs Mobile App
- **Battery Optimization**: Less efficient than native mobile app
- **Background Operation**: Limited when browser is not active
- **GPS Accuracy**: May be less precise than native GPS APIs
- **Offline Support**: Requires internet connection for initial load

## 🚦 Usage Guidelines

### Before Driving
1. Start the server and open the application
2. Grant location permissions
3. Wait for GPS signal to stabilize (green indicator)
4. Verify speed readings are accurate

### During Monitoring
1. Keep the browser tab active for continuous tracking
2. Monitor the speed display and guidance messages
3. Follow recommended speeds to maintain legal averages
4. Pay attention to zone entry/exit notifications

### After Driving
1. Review session summary for legal compliance
2. Historical data is saved automatically
3. Server can be stopped when not in use

## 📄 License

This web version is part of the Sredna Skorost BG project and is licensed under the MIT License. See the main project LICENSE file for details.

## ⚠️ Legal Disclaimer

This web application is a development tool and prototype. For actual highway speed monitoring, use the official mobile app which provides better accuracy and reliability. Always follow traffic laws and drive safely.

---

**For the full-featured mobile experience, use the Flutter app available in the main project directory.**