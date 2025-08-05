# Sredna Skorost BG (Средна Скорост БГ)

A Flutter-based mobile application for monitoring average speed on Bulgarian highways, specifically designed for the A1/E80 Sofia-Plovdiv highway sections. This app helps drivers maintain legal average speeds within monitored highway segments to avoid speed camera violations.

## 🇧🇬 About

**Sredna Skorost BG** is an open-source speed monitoring application that tracks your average speed within specific highway segments on Bulgaria's A1/E80 highway between Sofia and Plovdiv. The app uses precise GPS coordinates collected through field research to provide accurate zone detection and bidirectional monitoring.

## 📱 Available Versions

This project includes two implementations:

### 🚀 **Flutter Mobile App** (Recommended)
- **Native iOS/Android performance** with optimized battery usage
- **Offline maps** and full functionality without internet
- **Advanced features**: CarPlay support, session persistence, auto-pause/resume
- **Production-ready** with comprehensive testing

### 🌐 **Web Version** (Prototype)
- **Universal browser access** - works on any device
- **Original proof-of-concept** that evolved into the mobile app
- **Development and testing** purposes
- **Cross-platform compatibility** for quick demonstrations

> **📁 Web Version**: See the [`web/`](web/) directory and its [README](web/README.md) for setup instructions.

### Key Features

- **Real-time GPS tracking** with offline map support
- **Bidirectional zone detection** using movement vector analysis
- **Automatic start/stop detection** based on speed patterns
- **Session persistence** that survives app restarts
- **Auto-guidance system** with recommended speed calculations
- **Speed violation warnings** with predictive analysis
- **Historical session tracking** and statistics
- **Offline operation** - no internet connection required

## 📸 Screenshots

<div align="center">

### Flutter Mobile App Interface

| Session History | Session History | Zone Detection | Speed Monitoring | Main Screen |
|:---:|:---:|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/dac54538-09c9-4412-be14-9539f4be5250" width="200" alt="Session History"> | <img src="https://github.com/user-attachments/assets/8a564c3b-3f61-425e-9218-7b0509cf88a1" width="200" alt="Session History"> | <img src="https://github.com/user-attachments/assets/dc70a479-bb18-435e-a2cd-d6f728232c8d" width="200" alt="Zone Detection"> | <img src="https://github.com/user-attachments/assets/9ead70b7-1557-4f51-af87-8b5220f7f873" width="200" alt="Speed Monitoring"> | <img src="https://github.com/user-attachments/assets/3ec0982a-2ce7-40b7-a01e-2effd255284d" width="200" alt="Main Screen"> |
| *Historical session tracking* | *Past trip compliance data* | *Automatic zone entry detection* | *Real-time speed calculation* | *Offline maps with GPS tracking* |

</div>

## 🛣️ Highway Segments

The application monitors **8 primary highway segments** and **2 test sections** on the A1/E80:

### Primary Segments (140 km/h limit):
1. **Вакарел → Ихтиман** (42.5505833°N, 23.7028611°E → 42.4270833°N, 23.8543333°E)
2. **Ихтиман → Траянови врата** (42.4270833°N, 23.8543333°E → 42.3675°N, 23.9569167°E)
3. **Траянови врата → Белозем** (42.3675°N, 23.9569167°E → 42.3258333°N, 24.0544444°E)
4. **Белозем → Капитан Димитриево** (42.3258333°N, 24.0544444°E → 42.2977778°N, 24.1488889°E)
5. **Капитан Димитриево → Динката** (42.2977778°N, 24.1488889°E → 42.2775278°N, 24.1591944°E)
6. **Динката → Цалапица** (42.2775278°N, 24.1591944°E → 42.2202222°N, 24.3344722°E)
7. **Цалапица → Радиново** (42.2202222°N, 24.3344722°E → 42.1894444°N, 24.4458333°E)
8. **Радиново → Трилистник** (42.1894444°N, 24.4458333°E → 42.1630556°N, 24.5275°E)

### Test Segments (25 km/h limit for testing):
- **Test Section 1**: Near Sofia (42.6977°N, 23.3219°E → 42.6977°N, 23.3419°E)
- **Test Section 2**: Near Plovdiv (42.1354°N, 24.7453°E → 42.1354°N, 24.7653°E)

## 🔬 Technical Implementation

### GPS Coordinate Collection Methodology

All GPS coordinates were manually collected through **field research**:

1. **Physical Travel**: Multiple round trips between Sofia and Plovdiv
2. **Manual Pinning**: Each segment start/end point was physically visited and marked using Google Maps
3. **Toll Camera Integration**: Speed camera locations were cross-referenced with Waze community data
4. **Precision Verification**: Coordinates verified through multiple passes and GPS averaging
5. **Direction Testing**: Bidirectional accuracy confirmed through travel in both directions

### Zone Detection Algorithm

The app uses a sophisticated **bidirectional detection system**:

```dart
String _determineDirection(LatLng currentPos, LatLng segmentStart, LatLng segmentEnd) {
  // Calculate movement vector
  double bearing = Geolocator.bearingBetween(
    _previousPosition!.latitude, 
    _previousPosition!.longitude,
    currentPos.latitude, 
    currentPos.longitude
  );
  
  // Calculate segment vector  
  double segmentBearing = Geolocator.bearingBetween(
    segmentStart.latitude, 
    segmentStart.longitude,
    segmentEnd.latitude, 
    segmentEnd.longitude
  );
  
  // Determine direction based on bearing difference
  double bearingDiff = (bearing - segmentBearing).abs();
  if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;
  
  return bearingDiff < 90 
    ? '${segment.startName} → ${segment.endName}'
    : '${segment.endName} → ${segment.startName}';
}
```

### Speed Calculation Formulas

#### Average Speed Calculation
```dart
double averageSpeed = totalDistance / totalTimeInHours;
```

Where:
- `totalDistance`: Accumulated distance using Haversine formula
- `totalTimeInHours`: Active tracking time (excluding pauses)

#### Distance Calculation (Haversine Formula)
```dart
double calculateDistance(LatLng pos1, LatLng pos2) {
  return Geolocator.distanceBetween(
    pos1.latitude, pos1.longitude,
    pos2.latitude, pos2.longitude
  ) / 1000.0; // Convert to kilometers
}
```

#### Recommended Speed Calculation
```dart
double calculateRecommendedSpeed(double currentAvg, double remaining, double timeLeft) {
  double targetAverage = speedLimit - 2; // 2 km/h buffer
  double requiredSpeed = (targetAverage * totalTime - currentAvg * elapsedTime) / timeLeft;
  return math.max(0, math.min(speedLimit + 20, requiredSpeed));
}
```

### Auto-Detection Features

#### Stop Detection Algorithm
```dart
void _autoDetectStopResume(double currentSpeed) {
  const double stopThreshold = 5.0; // km/h
  const double resumeThreshold = 15.0; // km/h
  
  if (currentSpeed < stopThreshold) {
    _lowSpeedCount++;
    if (_lowSpeedCount > 6 && !_stopDetected) { // 6 consecutive readings
      _triggerStopTimer();
    }
  } else if (currentSpeed > resumeThreshold && _stopDetected) {
    _triggerResumeCountdown();
  }
}
```

#### Zone Entry/Exit Detection
```dart
bool _isInZone(LatLng position, HighwaySegment segment) {
  double distanceToStart = Geolocator.distanceBetween(
    position.latitude, position.longitude,
    segment.startPoint.latitude, segment.startPoint.longitude
  );
  
  double distanceToEnd = Geolocator.distanceBetween(
    position.latitude, position.longitude,
    segment.endPoint.latitude, segment.endPoint.longitude
  );
  
  double segmentLength = Geolocator.distanceBetween(
    segment.startPoint.latitude, segment.startPoint.longitude,
    segment.endPoint.latitude, segment.endPoint.longitude
  );
  
  // Point is in zone if it's between start and end with tolerance
  return (distanceToStart + distanceToEnd) <= (segmentLength + 100); // 100m tolerance
}
```

### Session Persistence

Sessions are automatically saved using `SharedPreferences`:

```dart
Future<void> _saveSession(ZoneSession session) async {
  final prefs = await SharedPreferences.getInstance();
  List<String> sessions = prefs.getStringList('highway_sessions') ?? [];
  sessions.add(jsonEncode(session.toJson()));
  await prefs.setStringList('highway_sessions', sessions);
}
```

### GPS Signal Monitoring

```dart
void _checkGPSSignal() {
  if (_lastPositionUpdate != null) {
    Duration timeSinceLastUpdate = DateTime.now().difference(_lastPositionUpdate!);
    _gpsSignalLost = timeSinceLastUpdate.inSeconds > 10;
  }
}
```

## 🚀 Installation & Setup

### Prerequisites

- **Flutter SDK** (3.0.0 or higher)
- **Xcode** (for iOS deployment)
- **iOS device** with iOS 15.0+
- **Apple Developer Account** (for App Store distribution)

### Development Setup

1. **Clone the repository**:
```bash
git clone git@github.com:Stamenov/sredna_skorost_bg.git
cd sredna_skorost_bg
```

2. **Install Flutter dependencies**:
```bash
flutter pub get
```

3. **Install iOS dependencies**:
```bash
cd ios && pod install && cd ..
```

4. **Run on device**:
```bash
flutter run -d <device-id>
```

### iOS Configuration

The app requires location permissions configured in `ios/Runner/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Това приложение използва GPS за следене на средната скорост в зони за контрол на скоростта.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Това приложение използва GPS за следене на средната скорост в зони за контрол на скоростта.</string>
```

### Building for Release

```bash
flutter build ios --release
```

Then use Xcode to archive and distribute via TestFlight or App Store.

## 📱 Usage Guide

### Starting a Session
1. Open the app and grant location permissions
2. Wait for GPS signal to stabilize
3. Tap **"Старт"** to begin monitoring
4. Drive normally - the app will automatically detect zone entries

### During Monitoring
- **Green guidance**: Current speed is appropriate for maintaining legal average
- **Red warning**: Current speed is too high - reduce speed immediately
- **Auto-pause**: App automatically pauses when stopped (detected at <5 km/h for 30+ seconds)
- **Auto-resume**: App resumes with 3-second countdown when motion detected (>15 km/h)

### Zone Detection
- App automatically detects entry into monitored segments
- Direction is determined using movement vectors
- Real-time average speed is calculated and displayed
- Remaining distance and recommended speed are continuously updated

### Session Management
- Sessions are automatically saved when zones are exited
- Historical data is preserved across app restarts
- View past sessions using the history button

## 🔧 Architecture & Design Decisions

### Flutter Framework Choice
- **Cross-platform compatibility** (iOS/Android)
- **Native performance** for GPS-intensive operations
- **Rich UI capabilities** for real-time data visualization
- **Strong plugin ecosystem** (Geolocator, Flutter Map)

### Offline-First Design
- **No internet dependency** for core functionality
- **OpenStreetMap tiles** cached locally
- **Embedded coordinate data** - no server requests
- **Local session storage** using SharedPreferences

### Real-Time Processing
- **1-second GPS updates** for precise tracking
- **Vector-based direction detection** for bidirectional support
- **Predictive speed calculations** using physics formulas
- **Automatic state management** with minimal user interaction

### Data Privacy
- **No data transmission** - all processing is local
- **Anonymous sessions** - no personal information stored
- **Open source transparency** - code is fully auditable
- **User control** - data can be cleared at any time

## 🤝 Contributing

We welcome contributions to improve Sredna Skorost BG! Here's how you can help:

### Areas for Contribution
1. **Additional Highway Coverage**: Extend support to other Bulgarian highways
2. **Android Support**: Port iOS-specific features to Android
3. **UI/UX Improvements**: Enhance the user interface and experience
4. **Performance Optimization**: Improve battery usage and GPS accuracy
5. **Localization**: Add support for additional languages
6. **Testing**: Add comprehensive unit and integration tests

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow Flutter/Dart style guidelines
- Add comments for complex algorithms
- Include tests for new features
- Ensure backwards compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Disclaimer

This application is designed to help drivers maintain legal speeds on Bulgarian highways. However:

- **Driver responsibility**: The driver is solely responsible for following traffic laws
- **No guarantee**: The app cannot guarantee accuracy in all situations
- **Use at own risk**: GPS signals can be affected by weather, tunnels, or device issues
- **Official enforcement**: Only official speed cameras determine legal violations
- **Supplementary tool**: This app should supplement, not replace, careful driving

## 🙏 Acknowledgments

- **Bulgarian Ministry of Interior**: For transparent speed limit information
- **OpenStreetMap Contributors**: For detailed highway mapping data
- **Flutter Community**: For excellent plugins and documentation
- **Waze Community**: For crowdsourced speed camera locations
- **Field Research Contributors**: Drivers who helped verify GPS coordinates

## 📞 Support & Contact

- **Issues**: Report bugs and feature requests via [GitHub Issues](https://github.com/Stamenov/sredna_skorost_bg/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/Stamenov/sredna_skorost_bg/discussions)
- **Email**: For sensitive issues, contact the maintainers directly

---

**Drive safely and help keep Bulgarian roads safer for everyone! 🇧🇬🚗**
