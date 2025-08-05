import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Средна Скорост',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF1976D2),
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Roboto',
      ),
      home: const MapScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class HighwaySegment {
  final String id;
  final String name;
  final int maxSpeed;
  final LatLng startPoint;
  final LatLng endPoint;
  final String startName;
  final String endName;
  final Color color;

  const HighwaySegment({
    required this.id,
    required this.name,
    required this.maxSpeed,
    required this.startPoint,
    required this.endPoint,
    required this.startName,
    required this.endName,
    required this.color,
  });
}

class ZoneSession {
  final String zoneId;
  final String zoneName;
  final String direction;
  final DateTime entryTime;
  DateTime? exitTime;
  final double entryLat;
  final double entryLng;
  double? exitLat;
  double? exitLng;
  double totalDistance = 0.0;
  double averageSpeed = 0.0;
  final int speedLimit;
  List<SpeedPoint> speedPoints = [];
  bool isPaused = false;
  Duration pausedDuration = Duration.zero;
  DateTime? pauseStartTime;

  ZoneSession({
    required this.zoneId,
    required this.zoneName,
    required this.direction,
    required this.entryTime,
    required this.entryLat,
    required this.entryLng,
    required this.speedLimit,
  });

  Map<String, dynamic> toJson() => {
    'zoneId': zoneId,
    'zoneName': zoneName,
    'direction': direction,
    'entryTime': entryTime.toIso8601String(),
    'exitTime': exitTime?.toIso8601String(),
    'entryLat': entryLat,
    'entryLng': entryLng,
    'exitLat': exitLat,
    'exitLng': exitLng,
    'totalDistance': totalDistance,
    'averageSpeed': averageSpeed,
    'speedLimit': speedLimit,
    'speedPoints': speedPoints.map((p) => p.toJson()).toList(),
    'pausedDuration': pausedDuration.inSeconds,
  };

  factory ZoneSession.fromJson(Map<String, dynamic> json) {
    var session = ZoneSession(
      zoneId: json['zoneId'],
      zoneName: json['zoneName'],
      direction: json['direction'],
      entryTime: DateTime.parse(json['entryTime']),
      entryLat: json['entryLat'],
      entryLng: json['entryLng'],
      speedLimit: json['speedLimit'],
    );
    
    if (json['exitTime'] != null) {
      session.exitTime = DateTime.parse(json['exitTime']);
    }
    session.exitLat = json['exitLat'];
    session.exitLng = json['exitLng'];
    session.totalDistance = json['totalDistance'];
    session.averageSpeed = json['averageSpeed'];
    session.pausedDuration = Duration(seconds: json['pausedDuration'] ?? 0);
    
    if (json['speedPoints'] != null) {
      session.speedPoints = (json['speedPoints'] as List)
          .map((p) => SpeedPoint.fromJson(p))
          .toList();
    }
    
    return session;
  }
}

class SpeedPoint {
  final DateTime time;
  final double speed;
  final double lat;
  final double lng;

  SpeedPoint({
    required this.time,
    required this.speed,
    required this.lat,
    required this.lng,
  });

  Map<String, dynamic> toJson() => {
    'time': time.toIso8601String(),
    'speed': speed,
    'lat': lat,
    'lng': lng,
  };

  factory SpeedPoint.fromJson(Map<String, dynamic> json) => SpeedPoint(
    time: DateTime.parse(json['time']),
    speed: json['speed'],
    lat: json['lat'],
    lng: json['lng'],
  );
}

// Active session data class
class SessionData {
  final String sessionId;
  final DateTime timestamp;
  final ZoneSession? activeZone;
  final DateTime? startTime;
  final List<Position> positions;
  final List<double> speedHistory;
  final double totalDistance;
  final Position? lastKnownPosition;
  final DateTime? lastGPSTime;
  final bool gpsSignalLost;

  SessionData({
    required this.sessionId,
    required this.timestamp,
    this.activeZone,
    this.startTime,
    required this.positions,
    required this.speedHistory,
    required this.totalDistance,
    this.lastKnownPosition,
    this.lastGPSTime,
    required this.gpsSignalLost,
  });

  Map<String, dynamic> toJson() => {
    'sessionId': sessionId,
    'timestamp': timestamp.toIso8601String(),
    'activeZone': activeZone?.toJson(),
    'startTime': startTime?.toIso8601String(),
    'positions': positions.map((p) => {
      'lat': p.latitude,
      'lng': p.longitude,
      'speed': p.speed,
      'time': p.timestamp?.toIso8601String(),
    }).toList(),
    'speedHistory': speedHistory,
    'totalDistance': totalDistance,
    'lastKnownPosition': lastKnownPosition != null ? {
      'lat': lastKnownPosition!.latitude,
      'lng': lastKnownPosition!.longitude,
    } : null,
    'lastGPSTime': lastGPSTime?.toIso8601String(),
    'gpsSignalLost': gpsSignalLost,
  };

  factory SessionData.fromJson(Map<String, dynamic> json) {
    return SessionData(
      sessionId: json['sessionId'],
      timestamp: DateTime.parse(json['timestamp']),
      activeZone: json['activeZone'] != null ? 
        ZoneSession.fromJson(json['activeZone']) : null,
      startTime: json['startTime'] != null ? 
        DateTime.parse(json['startTime']) : null,
      positions: [],  // Simplified for now
      speedHistory: (json['speedHistory'] as List).cast<double>(),
      totalDistance: json['totalDistance'],
      lastKnownPosition: null,  // Simplified for now
      lastGPSTime: json['lastGPSTime'] != null ? 
        DateTime.parse(json['lastGPSTime']) : null,
      gpsSignalLost: json['gpsSignalLost'],
    );
  }
}

class MapScreen extends StatefulWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with WidgetsBindingObserver {
  final MapController _mapController = MapController();
  StreamSubscription<Position>? _positionStream;
  Position? _currentPosition;
  Position? _previousPosition;
  
  // Platform communication (disabled for now)
  // static const platform = MethodChannel('carplay_channel');
  
  // Speed and tracking variables
  double _currentSpeed = 0.0;
  double _totalDistance = 0.0;
  DateTime? _sessionStartTime;
  List<Position> _trackingPositions = [];
  List<double> _speedHistory = [];
  
  // Active zone tracking
  HighwaySegment? _activeSegment;
  String _detectedDirection = '';
  bool _isTracking = false;
  ZoneSession? _currentZoneSession;
  
  // Speed recommendation
  double _recommendedSpeed = 0.0;
  double _remainingDistance = 0.0;
  double _predictedAverageSpeed = 0.0;
  String _speedWarning = '';
  
  // Historical sessions
  List<ZoneSession> _historicalSessions = [];
  
  // UI states
  bool _showHistory = false;
  bool _isPaused = false;
  
  // Session management
  String? _sessionId;
  DateTime? _lastGPSTime;
  bool _gpsSignalLost = false;
  
  // Auto stop/resume detection
  int _lowSpeedCount = 0;
  bool _stopDetected = false;
  Timer? _autoResumeTimer;
  Timer? _countdownTimer;
  int _resumeCountdown = 3;
  bool _showResumeDialog = false;
  
  // Auto-guidance
  bool _isAutoGuidanceActive = false;
  double _lastAutoExecutionSpeed = 0.0;
  
  // Stop timer
  DateTime? _stopStartTime;
  Timer? _stopTimer;
  Duration _stopDuration = Duration.zero;

  final List<HighwaySegment> highwaySegments = [
    // Test sections
    HighwaySegment(
      id: 'test-section-1',
      name: 'Тестова секция 1',
      maxSpeed: 25,
      startPoint: const LatLng(42.656630, 23.321322),
      endPoint: const LatLng(42.657497, 23.336337),
      startName: 'Тест 1 начало',
      endName: 'Тест 1 край',
      color: Colors.cyan,
    ),
    HighwaySegment(
      id: 'test-section-2',
      name: 'Тестова секция 2',
      maxSpeed: 25,
      startPoint: const LatLng(42.656719, 23.328082),
      endPoint: const LatLng(42.656889, 23.316186),
      startName: 'Тест 2 начало',
      endName: 'Тест 2 край',
      color: Colors.teal,
    ),
    // Highway sections
    HighwaySegment(
      id: 'vakarel-ihtiman',
      name: 'Вакарел - Ихтиман',
      maxSpeed: 140,
      startPoint: const LatLng(42.5505833, 23.7028611),
      endPoint: const LatLng(42.4270833, 23.8543333),
      startName: 'Вакарел',
      endName: 'Ихтиман',
      color: Colors.red,
    ),
    HighwaySegment(
      id: 'ihtiman-trayanovi',
      name: 'Ихтиман - Траянови врата',
      maxSpeed: 140,
      startPoint: const LatLng(42.4270833, 23.8543333),
      endPoint: const LatLng(42.3570556, 23.9928056),
      startName: 'Ихтиман',
      endName: 'Траянови врата',
      color: Colors.orange,
    ),
    HighwaySegment(
      id: 'trayanovi-dinkato',
      name: 'Траянови врата - Динката',
      maxSpeed: 140,
      startPoint: const LatLng(42.3570556, 23.9928056),
      endPoint: const LatLng(42.2775278, 24.1591944),
      startName: 'Траянови врата',
      endName: 'Динката',
      color: Colors.yellow,
    ),
    HighwaySegment(
      id: 'dinkato-tsalapitsa',
      name: 'Динката - Цалапица',
      maxSpeed: 140,
      startPoint: const LatLng(42.2775278, 24.1591944),
      endPoint: const LatLng(42.2202222, 24.3344722),
      startName: 'Динката',
      endName: 'Цалапица',
      color: Colors.green,
    ),
    HighwaySegment(
      id: 'tsalapitsa-radinovo',
      name: 'Цалапица - Радиново',
      maxSpeed: 140,
      startPoint: const LatLng(42.2202222, 24.3344722),
      endPoint: const LatLng(42.1833056, 24.4502778),
      startName: 'Цалапица',
      endName: 'Радиново',
      color: Colors.blue,
    ),
    HighwaySegment(
      id: 'radinovo-tsaratsovo',
      name: 'Радиново - Царацово',
      maxSpeed: 140,
      startPoint: const LatLng(42.1833056, 24.4502778),
      endPoint: const LatLng(42.1616389, 24.5827222),
      startName: 'Радиново',
      endName: 'Царацово',
      color: Colors.indigo,
    ),
    HighwaySegment(
      id: 'tsaratsovo-voyvodinovo',
      name: 'Царацово - Войводиново',
      maxSpeed: 140,
      startPoint: const LatLng(42.1616389, 24.5827222),
      endPoint: const LatLng(42.1422222, 24.7119444),
      startName: 'Царацово',
      endName: 'Войводиново',
      color: Colors.purple,
    ),
    HighwaySegment(
      id: 'voyvodinovo-trilistnik',
      name: 'Войводиново - Трилистник',
      maxSpeed: 140,
      startPoint: const LatLng(42.1422222, 24.7119444),
      endPoint: const LatLng(42.1503056, 24.7503056),
      startName: 'Войводиново',
      endName: 'Трилистник',
      color: Colors.pink,
    ),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkPermissions();
    _loadHistoricalSessions();
    _checkForExistingSession();
    _clearOldSessions();
    // _setupCarPlayListener();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _positionStream?.cancel();
    _autoResumeTimer?.cancel();
    _countdownTimer?.cancel();
    _stopTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused && _isTracking) {
      _saveSession();
    }
  }

  String _generateSessionId() {
    return '${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(999999)}';
  }

  Future<void> _saveSession() async {
    if (_sessionId == null) return;
    
    final sessionData = SessionData(
      sessionId: _sessionId!,
      timestamp: DateTime.now(),
      activeZone: _currentZoneSession,
      startTime: _sessionStartTime,
      positions: _trackingPositions.take(100).toList(),
      speedHistory: _speedHistory.take(100).toList(),
      totalDistance: _totalDistance,
      lastKnownPosition: _currentPosition,
      lastGPSTime: _lastGPSTime,
      gpsSignalLost: _gpsSignalLost,
    );
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('driving_session_$_sessionId', json.encode(sessionData.toJson()));
    await prefs.setString('last_session_id', _sessionId!);
  }

  Future<bool> _loadSession(String sessionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final sessionJson = prefs.getString('driving_session_$sessionId');
      if (sessionJson == null) return false;
      
      final sessionData = SessionData.fromJson(json.decode(sessionJson));
      
      setState(() {
        _sessionId = sessionData.sessionId;
        _sessionStartTime = sessionData.startTime;
        _totalDistance = sessionData.totalDistance;
        _speedHistory = sessionData.speedHistory;
        _lastGPSTime = sessionData.lastGPSTime;
        _gpsSignalLost = sessionData.gpsSignalLost;
        
        if (sessionData.activeZone != null) {
          _currentZoneSession = sessionData.activeZone;
          _activeSegment = highwaySegments.firstWhere(
            (s) => s.id == sessionData.activeZone!.zoneId.split('-')[0],
            orElse: () => highwaySegments.first,
          );
          _detectedDirection = sessionData.activeZone!.direction;
        }
      });
      
      return true;
    } catch (e) {
      print('Error loading session: $e');
      return false;
    }
  }

  Future<void> _checkForExistingSession() async {
    final prefs = await SharedPreferences.getInstance();
    final lastSessionId = prefs.getString('last_session_id');
    
    if (lastSessionId != null && _sessionId == null) {
      final hasSession = await _loadSession(lastSessionId);
      if (hasSession && mounted) {
        _showResumeSessionDialog();
      }
    }
  }

  void _showResumeSessionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Предишна сесия'),
        content: const Text('Намерена е предишна сесия. Искате ли да продължите?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _startNewSession();
            },
            child: const Text('Нова сесия'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _resumeSession();
            },
            child: const Text('Продължи'),
          ),
        ],
      ),
    );
  }

  void _startNewSession() {
    setState(() {
      _sessionId = _generateSessionId();
      _sessionStartTime = DateTime.now();
      _isTracking = true;
      _trackingPositions.clear();
      _speedHistory.clear();
      _totalDistance = 0.0;
      _isPaused = false;
      _currentZoneSession = null;
      _activeSegment = null;
    });
  }

  void _resumeSession() {
    setState(() {
      _isTracking = true;
      _isPaused = false;
    });
  }

  Future<void> _clearOldSessions() async {
    final prefs = await SharedPreferences.getInstance();
    final oneWeekAgo = DateTime.now().subtract(const Duration(days: 7));
    
    final keys = prefs.getKeys().where((key) => key.startsWith('driving_session_')).toList();
    
    for (final key in keys) {
      try {
        final sessionJson = prefs.getString(key);
        if (sessionJson != null) {
          final sessionData = json.decode(sessionJson);
          final timestamp = DateTime.parse(sessionData['timestamp']);
          if (timestamp.isBefore(oneWeekAgo)) {
            await prefs.remove(key);
          }
        }
      } catch (e) {
        await prefs.remove(key); // Remove corrupted sessions
      }
    }
  }

  Future<void> _loadHistoricalSessions() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionsJson = prefs.getString('historical_sessions');
    if (sessionsJson != null) {
      final sessionsList = json.decode(sessionsJson) as List;
      setState(() {
        _historicalSessions = sessionsList
            .map((s) => ZoneSession.fromJson(s))
            .toList()
            .reversed
            .toList();
      });
    }
  }

  Future<void> _saveHistoricalSession(ZoneSession session) async {
    _historicalSessions.insert(0, session);
    final prefs = await SharedPreferences.getInstance();
    final sessionsJson = json.encode(
        _historicalSessions.map((s) => s.toJson()).toList()
    );
    await prefs.setString('historical_sessions', sessionsJson);
  }

  Future<void> _checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return;
    }

    _startLocationTracking();
  }

  void _startLocationTracking() {
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 1,
    );

    _positionStream = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen((Position position) {
      setState(() {
        _previousPosition = _currentPosition;
        _currentPosition = position;
        _currentSpeed = position.speed * 3.6; // Convert m/s to km/h
        _lastGPSTime = DateTime.now();
        _gpsSignalLost = false;
      });

      if (_isTracking && !_isPaused) {
        _trackingPositions.add(position);
        _speedHistory.add(_currentSpeed);
        _updateDistance();
        _checkZoneStatus(position);
        _updateZoneTracking(position);
        _autoDetectStopResume(_currentSpeed);
        _saveSession(); // Auto-save session
        
        // Send updates to CarPlay (disabled for now)
        // _sendLocationToCarPlay();
        // _sendSpeedToCarPlay();
      }

      _mapController.move(LatLng(position.latitude, position.longitude), 15.0);
    });
    
    // Monitor GPS signal loss
    Timer.periodic(const Duration(seconds: 10), (timer) {
      if (_lastGPSTime != null && 
          DateTime.now().difference(_lastGPSTime!).inSeconds > 15) {
        setState(() {
          _gpsSignalLost = true;
        });
      }
    });
  }

  void _autoDetectStopResume(double currentSpeed) {
    const double stopThreshold = 5.0; // km/h
    const double resumeThreshold = 15.0; // km/h
    
    if (currentSpeed < stopThreshold) {
      _lowSpeedCount++;
      
      if (_lowSpeedCount > 6 && !_stopDetected && _isTracking && !_isPaused) {
        _stopDetected = true;
        _stopStartTime = DateTime.now();
        _startStopTimer();
      }
    } else if (currentSpeed > resumeThreshold && _stopDetected) {
      _lowSpeedCount = 0;
      _stopDetected = false;
      _stopStopTimer();
      _showAutoResumeDialog();
    } else {
      _lowSpeedCount = 0;
    }
  }

  void _startStopTimer() {
    _stopTimer?.cancel();
    _stopTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _stopDuration = DateTime.now().difference(_stopStartTime!);
      });
    });
  }

  void _stopStopTimer() {
    _stopTimer?.cancel();
    _stopStartTime = null;
    _stopDuration = Duration.zero;
  }

  void _showAutoResumeDialog() {
    setState(() {
      _showResumeDialog = true;
      _resumeCountdown = 3;
    });
    
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _resumeCountdown--;
      });
      
      if (_resumeCountdown <= 0) {
        timer.cancel();
        _autoResume();
      }
    });
  }

  void _autoResume() {
    setState(() {
      _showResumeDialog = false;
      _resumeCountdown = 3;
    });
    _countdownTimer?.cancel();
    
    if (_isPaused) {
      _resumeTracking();
    }
  }

  void _updateDistance() {
    if (_trackingPositions.length > 1) {
      Position prev = _trackingPositions[_trackingPositions.length - 2];
      Position current = _trackingPositions.last;
      
      double distance = Geolocator.distanceBetween(
        prev.latitude, prev.longitude,
        current.latitude, current.longitude,
      );
      
      setState(() {
        _totalDistance += distance / 1000; // Convert to km
      });
    }
  }

  void _checkZoneStatus(Position position) {
    const double entryThreshold = 100; // meters for entry
    const double exitThreshold = 200; // meters for exit
    
    // Check if we're in any zone
    bool inAnyZone = false;
    HighwaySegment? detectedSegment;
    String detectedDir = '';
    
    for (HighwaySegment segment in highwaySegments) {
      // Calculate position relative to segment line
      double distanceToLine = _calculateDistanceToLine(
        position.latitude, position.longitude,
        segment.startPoint, segment.endPoint
      );
      
      if (distanceToLine < entryThreshold) {
        inAnyZone = true;
        detectedSegment = segment;
        detectedDir = _determineDirection(position, segment);
        break;
      }
    }
    
    // Handle zone entry
    if (inAnyZone && detectedSegment != null && _currentZoneSession == null) {
      _enterZone(detectedSegment, detectedDir, position);
    }
    // Handle zone exit
    else if (!inAnyZone && _currentZoneSession != null) {
      _exitZone(position);
    }
    // Update active segment if changed
    else if (detectedSegment != null && _activeSegment?.id != detectedSegment.id) {
      setState(() {
        _activeSegment = detectedSegment;
        _detectedDirection = detectedDir;
      });
    }
  }

  double _calculateDistanceToLine(double lat, double lng, LatLng start, LatLng end) {
    // Convert to a simple perpendicular distance calculation
    double A = lat - start.latitude;
    double B = lng - start.longitude;
    double C = end.latitude - start.latitude;
    double D = end.longitude - start.longitude;

    double dot = A * C + B * D;
    double lenSq = C * C + D * D;
    double param = lenSq != 0 ? dot / lenSq : -1;

    double xx, yy;

    if (param < 0) {
      xx = start.latitude;
      yy = start.longitude;
    } else if (param > 1) {
      xx = end.latitude;
      yy = end.longitude;
    } else {
      xx = start.latitude + param * C;
      yy = start.longitude + param * D;
    }

    return Geolocator.distanceBetween(lat, lng, xx, yy);
  }

  void _enterZone(HighwaySegment segment, String direction, Position position) {
    setState(() {
      _activeSegment = segment;
      _detectedDirection = direction;
      _currentZoneSession = ZoneSession(
        zoneId: segment.id,
        zoneName: segment.name,
        direction: direction,
        entryTime: DateTime.now(),
        entryLat: position.latitude,
        entryLng: position.longitude,
        speedLimit: segment.maxSpeed,
      );
    });
    
    _showNotification('Влизате в зона: ${segment.name}\nПосока: $direction');
    // _sendZoneEntryToCarPlay('${segment.name} - $direction');
  }

  void _exitZone(Position position) {
    if (_currentZoneSession != null) {
      _currentZoneSession!.exitTime = DateTime.now();
      _currentZoneSession!.exitLat = position.latitude;
      _currentZoneSession!.exitLng = position.longitude;
      
      _saveHistoricalSession(_currentZoneSession!);
      
      final avgSpeed = _currentZoneSession!.averageSpeed;
      final limit = _currentZoneSession!.speedLimit;
      final legal = avgSpeed <= limit;
      
      _showNotification(
        'Излязохте от зона: ${_currentZoneSession!.zoneName}\n'
        'Средна скорост: ${avgSpeed.toStringAsFixed(1)} км/ч\n'
        'Статус: ${legal ? "✅ Законна" : "⚠️ Над лимита"}'
      );
      
      setState(() {
        _currentZoneSession = null;
        _activeSegment = null;
        _detectedDirection = '';
        _recommendedSpeed = 0.0;
        _remainingDistance = 0.0;
        _isAutoGuidanceActive = false;
      });
    }
  }

  void _updateZoneTracking(Position position) {
    if (_currentZoneSession == null || _activeSegment == null) return;
    
    // Add speed point
    _currentZoneSession!.speedPoints.add(SpeedPoint(
      time: DateTime.now(),
      speed: _currentSpeed,
      lat: position.latitude,
      lng: position.longitude,
    ));
    
    // Update distance in zone
    if (_currentZoneSession!.speedPoints.length > 1) {
      final prev = _currentZoneSession!.speedPoints[_currentZoneSession!.speedPoints.length - 2];
      final distance = Geolocator.distanceBetween(
        prev.lat, prev.lng,
        position.latitude, position.longitude,
      );
      _currentZoneSession!.totalDistance += distance / 1000;
    }
    
    // Calculate average speed
    final activeDuration = DateTime.now().difference(_currentZoneSession!.entryTime) - 
                          _currentZoneSession!.pausedDuration;
    if (activeDuration.inSeconds > 0) {
      _currentZoneSession!.averageSpeed = 
          (_currentZoneSession!.totalDistance / activeDuration.inSeconds) * 3600;
    }
    
    // Calculate remaining distance to exit
    final exitPoint = _detectedDirection.contains(_activeSegment!.endName) ? 
                     _activeSegment!.endPoint : _activeSegment!.startPoint;
    _remainingDistance = Geolocator.distanceBetween(
      position.latitude, position.longitude,
      exitPoint.latitude, exitPoint.longitude,
    ) / 1000;
    
    // Calculate recommended speed
    _calculateRecommendedSpeed();
  }

  void _calculateRecommendedSpeed() {
    if (_currentZoneSession == null || _remainingDistance <= 0) return;
    
    final currentAvg = _currentZoneSession!.averageSpeed;
    final limit = _currentZoneSession!.speedLimit.toDouble();
    final distanceCovered = _currentZoneSession!.totalDistance;
    
    // If we're under the limit, we can maintain current speed or speed up
    if (currentAvg < limit - 5) {
      _recommendedSpeed = min(limit + 10, 160.0); // Can go slightly above limit
      _speedWarning = 'Можете да ускорите';
      _predictedAverageSpeed = currentAvg;
    }
    // If we're close to limit, maintain careful speed
    else if (currentAvg >= limit - 5 && currentAvg <= limit) {
      _recommendedSpeed = limit - 2; // Stay just under limit
      _speedWarning = 'Поддържайте скоростта';
      _predictedAverageSpeed = currentAvg;
    }
    // If we're over limit, calculate required slowdown
    else {
      // Calculate speed needed for remaining distance to bring average to limit
      final totalDistance = distanceCovered + _remainingDistance;
      final targetTotalTime = totalDistance / limit; // hours
      final timeSpentSoFar = distanceCovered / currentAvg; // hours
      final remainingTime = targetTotalTime - timeSpentSoFar; // hours
      
      if (remainingTime > 0) {
        _recommendedSpeed = _remainingDistance / remainingTime;
        _recommendedSpeed = max(_recommendedSpeed, 20.0); // Minimum 20 km/h
        _speedWarning = 'НАМАЛЕТЕ СКОРОСТТА!';
        
        // Predict final average if we follow recommendation
        _predictedAverageSpeed = limit;
        
        // Activate auto-guidance for feasible speed adjustments
        _startAutoGuidance(_recommendedSpeed);
      } else {
        // It's impossible to get back to legal average
        _recommendedSpeed = 60.0; // Suggest safe slow speed
        _speedWarning = 'Невъзможно е да достигнете законна средна скорост';
        _predictedAverageSpeed = currentAvg; // Will remain over limit
        _isAutoGuidanceActive = false;
      }
    }
  }

  void _startAutoGuidance(double targetSpeed) {
    // Only activate if speed adjustment is feasible and different from last execution
    if (targetSpeed >= 20 && targetSpeed <= 160 && 
        (_lastAutoExecutionSpeed - targetSpeed).abs() > 5) {
      setState(() {
        _isAutoGuidanceActive = true;
        _lastAutoExecutionSpeed = targetSpeed;
      });
      
      // Reset auto guidance after speed changes significantly
      Timer(const Duration(seconds: 10), () {
        if (_currentSpeed < targetSpeed - 20 || _currentSpeed > targetSpeed + 20) {
          setState(() {
            _isAutoGuidanceActive = false;
          });
        }
      });
    }
  }

  String _determineDirection(Position position, HighwaySegment segment) {
    // Use movement vector if available
    if (_previousPosition != null) {
      double movementAngle = atan2(
        position.longitude - _previousPosition!.longitude,
        position.latitude - _previousPosition!.latitude,
      );
      
      double segmentAngle = atan2(
        segment.endPoint.longitude - segment.startPoint.longitude,
        segment.endPoint.latitude - segment.startPoint.latitude,
      );
      
      double angleDiff = (movementAngle - segmentAngle).abs();
      if (angleDiff > pi) angleDiff = 2 * pi - angleDiff;
      
      if (angleDiff < pi / 2) {
        return '${segment.startName} → ${segment.endName}';
      } else {
        return '${segment.endName} → ${segment.startName}';
      }
    }
    
    // Fallback to distance-based detection
    double distanceToStart = Geolocator.distanceBetween(
      position.latitude, position.longitude,
      segment.startPoint.latitude, segment.startPoint.longitude,
    );
    
    double distanceToEnd = Geolocator.distanceBetween(
      position.latitude, position.longitude,
      segment.endPoint.latitude, segment.endPoint.longitude,
    );
    
    if (distanceToStart < distanceToEnd) {
      return '${segment.startName} → ${segment.endName}';
    } else {
      return '${segment.endName} → ${segment.startName}';
    }
  }

  void _startTracking() {
    if (_sessionId == null) {
      _startNewSession();
    } else {
      _resumeSession();
    }
  }

  void _pauseTracking() {
    setState(() {
      _isPaused = true;
      if (_currentZoneSession != null) {
        _currentZoneSession!.isPaused = true;
        _currentZoneSession!.pauseStartTime = DateTime.now();
      }
    });
    _saveSession();
  }

  void _resumeTracking() {
    setState(() {
      _isPaused = false;
      if (_currentZoneSession != null && _currentZoneSession!.pauseStartTime != null) {
        _currentZoneSession!.pausedDuration += 
            DateTime.now().difference(_currentZoneSession!.pauseStartTime!);
        _currentZoneSession!.isPaused = false;
        _currentZoneSession!.pauseStartTime = null;
      }
    });
  }

  void _stopTracking() {
    if (_currentZoneSession != null && _currentPosition != null) {
      _exitZone(_currentPosition!);
    }
    
    _saveSession();
    
    setState(() {
      _isTracking = false;
      _isPaused = false;
      _activeSegment = null;
      _detectedDirection = '';
      _currentZoneSession = null;
      _sessionId = null;
      _isAutoGuidanceActive = false;
    });
  }

  double get _averageSpeed {
    if (_sessionStartTime == null || _totalDistance == 0) return 0.0;
    
    double hours = DateTime.now().difference(_sessionStartTime!).inSeconds / 3600;
    return hours > 0 ? _totalDistance / hours : 0.0;
  }

  void _showNotification(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 4),
        backgroundColor: Colors.blue.shade800,
      ),
    );
  }

  // CarPlay Communication Methods (disabled for now)
  /*
  void _setupCarPlayListener() {
    platform.setMethodCallHandler(_handleCarPlayMethod);
  }

  Future<dynamic> _handleCarPlayMethod(MethodCall call) async {
    switch (call.method) {
      case 'startSpeedMonitoring':
        _startTracking();
        break;
      case 'pauseSpeedMonitoring':
        _pauseTracking();
        break;
      default:
        throw PlatformException(code: 'Unimplemented', details: 'Method ${call.method} not implemented');
    }
  }

  void _sendLocationToCarPlay() {
    if (_currentPosition != null) {
      platform.invokeMethod('updateLocation', {
        'latitude': _currentPosition!.latitude,
        'longitude': _currentPosition!.longitude,
      });
    }
  }

  void _sendSpeedToCarPlay() {
    if (_currentZoneSession != null && _activeSegment != null) {
      platform.invokeMethod('updateSpeed', {
        'currentSpeed': _currentSpeed,
        'averageSpeed': _currentZoneSession!.averageSpeed,
        'speedLimit': _activeSegment!.maxSpeed,
        'isLegal': _currentZoneSession!.averageSpeed <= _activeSegment!.maxSpeed,
      });
    }
  }

  void _sendZoneEntryToCarPlay(String zoneName) {
    platform.invokeMethod('zoneEntered', {
      'zoneName': zoneName,
    });
  }
  */

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('София-Пловдив (A1/E80)', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF1976D2),
        elevation: 0,
        actions: [
          if (_gpsSignalLost)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Icon(Icons.gps_off, color: Colors.red),
            ),
          IconButton(
            icon: Icon(_showHistory ? Icons.map : Icons.history, color: Colors.white),
            onPressed: () => setState(() => _showHistory = !_showHistory),
          ),
        ],
      ),
      body: Stack(
        children: [
          _showHistory ? _buildHistoryView() : _buildMapView(),
          if (_showResumeDialog) _buildResumeDialog(),
        ],
      ),
      bottomNavigationBar: _buildDeepSentricsFooter(),
    );
  }

  Widget _buildDeepSentricsFooter() {
    return Container(
      height: 50,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey, width: 0.5)),
      ),
      child: InkWell(
        onTap: () async {
          final Uri url = Uri.parse('https://deepsentrics.com');
          if (await canLaunchUrl(url)) {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          }
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Created by ',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              Image.asset(
                'assets/images/deepsentrics_logo.png',
                height: 20,
                fit: BoxFit.contain,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResumeDialog() {
    return Container(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.directions_car,
                size: 48,
                color: Colors.blue,
              ),
              const SizedBox(height: 16),
              const Text(
                'Продължаване на движението',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                '$_resumeCountdown',
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Автоматично възобновяване след $_resumeCountdown секунди...',
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  TextButton(
                    onPressed: () {
                      _countdownTimer?.cancel();
                      setState(() {
                        _showResumeDialog = false;
                      });
                      _startNewSession();
                    },
                    child: const Text('Нова сесия'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      _countdownTimer?.cancel();
                      _autoResume();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Продължи сега'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMapView() {
    return Column(
      children: [
        // Status panel
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          color: const Color(0xFF1976D2),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildStatusItem('Текуща скорост', '${_currentSpeed.toStringAsFixed(0)} км/ч', Colors.white),
                  _buildStatusItem('Средна скорост', '${_averageSpeed.toStringAsFixed(0)} км/ч', Colors.white),
                  _buildStatusItem('Разстояние', '${_totalDistance.toStringAsFixed(1)} км', Colors.white),
                ],
              ),
              if (_stopDetected && _stopDuration.inSeconds > 0) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Спрян: ${_stopDuration.inMinutes}:${(_stopDuration.inSeconds % 60).toString().padLeft(2, '0')}',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ),
              ],
              if (_currentZoneSession != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _speedWarning.contains('НАМАЛЕТЕ') ? 
                           Colors.red.withOpacity(0.3) : 
                           Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _speedWarning.contains('НАМАЛЕТЕ') ? 
                             Colors.red : Colors.white30,
                      width: 2,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        _activeSegment!.name,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _detectedDirection,
                        style: const TextStyle(color: Colors.white70, fontSize: 14),
                      ),
                      const Divider(color: Colors.white30),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(
                            children: [
                              const Text('В зоната', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              Text(
                                '${_currentZoneSession!.averageSpeed.toStringAsFixed(1)} км/ч',
                                style: TextStyle(
                                  color: _currentZoneSession!.averageSpeed > _activeSegment!.maxSpeed ? 
                                         Colors.red.shade200 : Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              const Text('Остават', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              Text(
                                '${_remainingDistance.toStringAsFixed(1)} км',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              const Text('Лимит', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              Text(
                                '${_activeSegment!.maxSpeed} км/ч',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _speedWarning.contains('НАМАЛЕТЕ') ? 
                                 Colors.red : Colors.green.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Column(
                          children: [
                            if (_isAutoGuidanceActive)
                              Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.blue,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  '🤖 Автоматично активирано',
                                  style: TextStyle(color: Colors.white, fontSize: 12),
                                ),
                              ),
                            Text(
                              'Карайте до: ${_recommendedSpeed.toStringAsFixed(0)} км/ч',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
                            ),
                            Text(
                              _speedWarning,
                              style: TextStyle(
                                color: _speedWarning.contains('НАМАЛЕТЕ') ? 
                                       Colors.white : Colors.white70,
                                fontSize: 14,
                                fontWeight: _speedWarning.contains('НАМАЛЕТЕ') ? 
                                           FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                            if (_predictedAverageSpeed > 0)
                              Text(
                                'Прогноза: ${_predictedAverageSpeed.toStringAsFixed(1)} км/ч',
                                style: const TextStyle(color: Colors.white70, fontSize: 12),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        // Map
        Expanded(
          child: Stack(
            children: [
              FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: const LatLng(42.3505833, 24.7028611),
                  initialZoom: 10.0,
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.example.speed_monitor_clean',
                  ),
              // Highway segments
              PolylineLayer(
                polylines: highwaySegments.map((segment) => Polyline(
                  points: [segment.startPoint, segment.endPoint],
                  strokeWidth: _activeSegment?.id == segment.id ? 8.0 : 6.0,
                  color: _activeSegment?.id == segment.id ? 
                         segment.color : segment.color.withOpacity(0.6),
                )).toList(),
              ),
              // Zone tracking path
              if (_currentZoneSession != null && _currentZoneSession!.speedPoints.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _currentZoneSession!.speedPoints
                          .map((p) => LatLng(p.lat, p.lng))
                          .toList(),
                      strokeWidth: 4.0,
                      color: Colors.blue,
                    ),
                  ],
                ),
              // Segment markers
              MarkerLayer(
                markers: highwaySegments.expand((segment) => [
                  Marker(
                    point: segment.startPoint,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: segment.color,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
                  Marker(
                    point: segment.endPoint,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: segment.color,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
                ]).toList(),
              ),
              // Current position marker
              if (_currentPosition != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      child: Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.navigation,
                          color: Colors.white,
                          size: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            // Center on location button
            Positioned(
              bottom: 16,
              left: 16,
              child: FloatingActionButton(
                mini: true,
                backgroundColor: Colors.white,
                onPressed: () {
                  if (_currentPosition != null) {
                    _mapController.move(
                      LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      15.0,
                    );
                  }
                },
                child: const Icon(
                  Icons.my_location,
                  color: Color(0xFF1976D2),
                ),
              ),
            ),
          ],
        ),
      ),
      // Control buttons
        Container(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              if (!_isTracking) ...[
                ElevatedButton(
                  onPressed: _startTracking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Старт'),
                ),
              ] else ...[
                ElevatedButton(
                  onPressed: _isPaused ? _resumeTracking : _pauseTracking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isPaused ? Colors.blue : Colors.orange,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  child: Row(
                    children: [
                      Text(_isPaused ? 'Продължи' : 'Пауза'),
                      if (_isPaused && _stopDuration.inSeconds > 0) ...[
                        const SizedBox(width: 8),
                        Text(
                          '${_stopDuration.inMinutes}:${(_stopDuration.inSeconds % 60).toString().padLeft(2, '0')}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: _stopTracking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Стоп'),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryView() {
    return Container(
      color: Colors.grey.shade100,
      child: _historicalSessions.isEmpty ? 
        const Center(
          child: Text(
            'Няма записани сесии',
            style: TextStyle(fontSize: 18, color: Colors.grey),
          ),
        ) :
        ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _historicalSessions.length,
          itemBuilder: (context, index) {
            final session = _historicalSessions[index];
            final isLegal = session.averageSpeed <= session.speedLimit;
            
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              elevation: 2,
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: isLegal ? Colors.green : Colors.red,
                  child: Icon(
                    isLegal ? Icons.check : Icons.warning,
                    color: Colors.white,
                  ),
                ),
                title: Text(
                  session.zoneName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(session.direction),
                    Text(
                      '${session.entryTime.day}.${session.entryTime.month}.${session.entryTime.year} '
                      '${session.entryTime.hour.toString().padLeft(2, '0')}:'
                      '${session.entryTime.minute.toString().padLeft(2, '0')}',
                      style: const TextStyle(fontSize: 12),
                    ),
                    Text(
                      'Разстояние: ${session.totalDistance.toStringAsFixed(1)} км',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${session.averageSpeed.toStringAsFixed(1)} км/ч',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isLegal ? Colors.green : Colors.red,
                      ),
                    ),
                    Text(
                      'Лимит: ${session.speedLimit} км/ч',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
                onTap: () => _showSessionDetails(session),
              ),
            );
          },
        ),
    );
  }

  void _showSessionDetails(ZoneSession session) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(session.zoneName),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Посока: ${session.direction}'),
              const SizedBox(height: 8),
              Text(
                'Вход: ${session.entryTime.day}.${session.entryTime.month} '
                '${session.entryTime.hour.toString().padLeft(2, '0')}:'
                '${session.entryTime.minute.toString().padLeft(2, '0')}',
              ),
              if (session.exitTime != null)
                Text(
                  'Изход: ${session.exitTime!.day}.${session.exitTime!.month} '
                  '${session.exitTime!.hour.toString().padLeft(2, '0')}:'
                  '${session.exitTime!.minute.toString().padLeft(2, '0')}',
                ),
              const SizedBox(height: 8),
              Text('Разстояние: ${session.totalDistance.toStringAsFixed(2)} км'),
              Text('Средна скорост: ${session.averageSpeed.toStringAsFixed(1)} км/ч'),
              Text('Лимит: ${session.speedLimit} км/ч'),
              const SizedBox(height: 8),
              Text(
                'Статус: ${session.averageSpeed <= session.speedLimit ? "✅ Законна" : "⚠️ Над лимита"}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: session.averageSpeed <= session.speedLimit ? Colors.green : Colors.red,
                ),
              ),
              if (session.pausedDuration.inSeconds > 0)
                Text('Време на пауза: ${session.pausedDuration.inMinutes} мин'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Затвори'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusItem(String label, String value, Color textColor) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: textColor,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: textColor.withOpacity(0.8),
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}