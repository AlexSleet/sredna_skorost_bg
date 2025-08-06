// Constants
const MAX_AVERAGE_SPEED = 140; // km/h
const SOFIA_CENTER = [42.6977, 23.3219];
const PLOVDIV_CENTER = [42.1354, 24.7453];
const STARA_ZAGORA_CENTER = [42.4258, 25.6345];
const BURGAS_CENTER = [42.5048, 27.4626];
const PRIMORSKO_CENTER = [42.2675, 27.7599];

// ========================================
// HIGHWAY CONFIGURATION - EASILY EDITABLE
// ========================================
// Real Sofia-Plovdiv highway segments (A1/E80)
// To add/modify sections: update this config array
// Each section connects to the next (endPoint of one = startPoint of next)

const HIGHWAY_SEGMENTS_CONFIG = [
    {
        id: 'vakarel-ihtiman',
        name: 'Вакарел - Ихтиман', 
        maxSpeed: 140,
        startPoint: { lat: 42.5505833, lng: 23.7028611, name: 'Вакарел' },
        endPoint: { lat: 42.4270833, lng: 23.8543333, name: 'Ихтиман' },
        color: '#FF6B6B'
    },
    {
        id: 'ihtiman-trayanovi',
        name: 'Ихтиман - Траянови врата',
        maxSpeed: 140, 
        startPoint: { lat: 42.4270833, lng: 23.8543333, name: 'Ихтиман' },
        endPoint: { lat: 42.3570556, lng: 23.9928056, name: 'Траянови врата' },
        color: '#FF9800'
    },
    {
        id: 'trayanovi-dinkato',
        name: 'Траянови врата - Динката',
        maxSpeed: 140,
        startPoint: { lat: 42.3570556, lng: 23.9928056, name: 'Траянови врата' },
        endPoint: { lat: 42.2775278, lng: 24.1591944, name: 'Динката' },
        color: '#FFEB3B'
    },
    {
        id: 'dinkato-tsalapitsa',
        name: 'Динката - Цалапица',
        maxSpeed: 140,
        startPoint: { lat: 42.2775278, lng: 24.1591944, name: 'Динката' },
        endPoint: { lat: 42.2202222, lng: 24.3344722, name: 'Цалапица' },
        color: '#4CAF50'
    },
    {
        id: 'tsalapitsa-radinovo',
        name: 'Цалапица - Радиново',
        maxSpeed: 140,
        startPoint: { lat: 42.2202222, lng: 24.3344722, name: 'Цалапица' },
        endPoint: { lat: 42.1833056, lng: 24.4502778, name: 'Радиново' },
        color: '#2196F3'
    },
    {
        id: 'radinovo-tsaratsovo',
        name: 'Радиново - Царацово',
        maxSpeed: 140,
        startPoint: { lat: 42.1833056, lng: 24.4502778, name: 'Радиново' },
        endPoint: { lat: 42.1616389, lng: 24.5827222, name: 'Царацово' },
        color: '#3F51B5'
    },
    {
        id: 'tsaratsovo-voyvodinovo',
        name: 'Царацово - Войводиново',
        maxSpeed: 140,
        startPoint: { lat: 42.1616389, lng: 24.5827222, name: 'Царацово' },
        endPoint: { lat: 42.1422222, lng: 24.7119444, name: 'Войводиново' },
        color: '#9C27B0'
    },
    {
        id: 'voyvodinovo-trilistnik',
        name: 'Войводиново - Трилистник',
        maxSpeed: 140,
        startPoint: { lat: 42.1422222, lng: 24.7119444, name: 'Войводиново' },
        endPoint: { lat: 42.1503056, lng: 24.7503056, name: 'Трилистник' },
        color: '#E91E63'
    }
];

// Generate highway segments from configuration
const HIGHWAY_SEGMENTS = HIGHWAY_SEGMENTS_CONFIG.map(config => {
    // Generate waypoints between start and end (linear interpolation for now)
    const waypoints = generateWaypoints(config.startPoint, config.endPoint, 3);
    
    return {
        id: config.id + '-segment',
        maxSpeed: config.maxSpeed,
        endpoints: [config.startPoint, config.endPoint],
        waypoints: waypoints,
        color: config.color,
        name: config.name
    };
});

// Generate waypoints between two points using linear interpolation
function generateWaypoints(startPoint, endPoint, numIntermediatePoints) {
    const waypoints = [];
    waypoints.push([startPoint.lat, startPoint.lng]);
    
    // Generate intermediate points
    for (let i = 1; i <= numIntermediatePoints; i++) {
        const ratio = i / (numIntermediatePoints + 1);
        const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * ratio;
        const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * ratio;
        waypoints.push([lat, lng]);
    }
    
    waypoints.push([endPoint.lat, endPoint.lng]);
    return waypoints;
}

// Active zone tracking with direction
let activeSegment = null;
let detectedDirection = null;
let currentZoneName = null;

// Legacy SPEED_ZONES for backward compatibility - dynamically generated
let SPEED_ZONES = [];

// Initialize zones from segments
function initializeZones() {
    SPEED_ZONES = [];
    for (const segment of HIGHWAY_SEGMENTS) {
        // Create both directions for each segment
        SPEED_ZONES.push({
            id: segment.id + '-forward',
            name: `${segment.endpoints[0].name} - ${segment.endpoints[1].name}`,
            maxSpeed: segment.maxSpeed,
            start: segment.endpoints[0],
            end: segment.endpoints[1],
            waypoints: segment.waypoints,
            color: segment.color,
            segment: segment,
            direction: 'forward'
        });
        
        SPEED_ZONES.push({
            id: segment.id + '-reverse',
            name: `${segment.endpoints[1].name} - ${segment.endpoints[0].name}`,
            maxSpeed: segment.maxSpeed,
            start: segment.endpoints[1],
            end: segment.endpoints[0],
            waypoints: [...segment.waypoints].reverse(),
            color: segment.color,
            segment: segment,
            direction: 'reverse'
        });
    }
}

// State
let map;
let isTracking = false;
let watchId = null;
let positions = [];
let startTime = null;
let totalDistance = 0;
let currentSpeedHistory = [];
let userMarker = null;
let routeLine = null;
let activeZone = null;
let zonePositions = [];
let zoneStartTime = null;
let zoneTotalDistance = 0;
let zoneSpeedHistory = [];
let zonePolylines = {};
let zoneMarkers = [];
let currentRecommendation = null;
let stopTimer = null;
let stopStartTime = null;
let isAutoGuidanceActive = false;
let lastAutoExecutionSpeed = 0;
let lastGPSTime = null;
let gpsSignalLost = false;
let sessionId = null;
let isPaused = false;

// Auto-detection variables
let lastHeading = null;
let directionHistory = [];
let lastSpeed = 0;
let lowSpeedCount = 0;
let stopDetected = false;
let autoResumeTimeout = null;
let countdownInterval = null;

// Route points for reference (full route from Primorsko to Sofia)
const ROUTE_POINTS = [
    // Primorsko to Burgas
    { lat: 42.2675, lng: 27.7599, speed: 0 },     // Primorsko start
    { lat: 42.3500, lng: 27.6500, speed: 90 },    
    { lat: 42.4200, lng: 27.5500, speed: 130 },   
    { lat: 42.5048, lng: 27.4626, speed: 60 },    // Burgas
    // Burgas to Stara Zagora
    { lat: 42.5000, lng: 27.2000, speed: 120 },   
    { lat: 42.4500, lng: 26.5000, speed: 140 },   
    { lat: 42.4258, lng: 25.6345, speed: 70 },    // Stara Zagora
    // Stara Zagora to Plovdiv
    { lat: 42.3500, lng: 25.2000, speed: 135 },   
    { lat: 42.2000, lng: 24.9000, speed: 145 },   // Over limit
    { lat: 42.1354, lng: 24.7453, speed: 50 },    // Plovdiv
    // Plovdiv to Sofia
    { lat: 42.2439, lng: 24.3496, speed: 110 },   
    { lat: 42.3439, lng: 24.1496, speed: 135 },   
    { lat: 42.5048, lng: 23.8406, speed: 140 },   
    { lat: 42.6244, lng: 23.3728, speed: 90 },    
    { lat: 42.6977, lng: 23.3219, speed: 0 },     // Sofia end
];

// Session management functions
function generateSessionId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveSession() {
    if (!sessionId) return;
    
    const sessionData = {
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        activeZone: activeZone ? {
            id: activeZone.id,
            name: activeZone.name,
            startTime: zoneStartTime?.toISOString(),
            positions: zonePositions.slice(-100), // Keep last 100 positions
            speedHistory: zoneSpeedHistory.slice(-100),
            totalDistance: zoneTotalDistance
        } : null,
        globalData: {
            startTime: startTime?.toISOString(),
            positions: positions.slice(-100), // Keep last 100 positions
            speedHistory: currentSpeedHistory.slice(-100),
            totalDistance: totalDistance
        },
        lastKnownPosition: positions.length > 0 ? positions[positions.length - 1] : null,
        gpsStatus: {
            lastGPSTime: lastGPSTime?.toISOString(),
            signalLost: gpsSignalLost
        }
    };
    
    localStorage.setItem(`driving_session_${sessionId}`, JSON.stringify(sessionData));
    localStorage.setItem('last_session_id', sessionId);
}

function loadSession(savedSessionId) {
    try {
        const sessionData = JSON.parse(localStorage.getItem(`driving_session_${savedSessionId}`));
        if (!sessionData) return false;
        
        sessionId = sessionData.sessionId;
        
        // Restore global data
        if (sessionData.globalData.startTime) {
            startTime = new Date(sessionData.globalData.startTime);
        }
        totalDistance = sessionData.globalData.totalDistance || 0;
        positions = sessionData.globalData.positions || [];
        currentSpeedHistory = sessionData.globalData.speedHistory || [];
        
        // Restore zone data
        if (sessionData.activeZone) {
            const zoneData = sessionData.activeZone;
            activeZone = SPEED_ZONES.find(z => z.id === zoneData.id);
            if (activeZone && zoneData.startTime) {
                zoneStartTime = new Date(zoneData.startTime);
                zoneTotalDistance = zoneData.totalDistance || 0;
                zonePositions = zoneData.positions || [];
                zoneSpeedHistory = zoneData.speedHistory || [];
                
                // Restore zone visual state
                enterZone(activeZone, true); // true = skip notifications
            }
        }
        
        // Restore GPS status
        if (sessionData.gpsStatus.lastGPSTime) {
            lastGPSTime = new Date(sessionData.gpsStatus.lastGPSTime);
        }
        gpsSignalLost = sessionData.gpsStatus.signalLost || false;
        
        return true;
    } catch (error) {
        console.error('Error loading session:', error);
        return false;
    }
}

function getSavedSessions() {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('driving_session_')) {
            try {
                const sessionData = JSON.parse(localStorage.getItem(key));
                sessions.push({
                    id: sessionData.sessionId,
                    timestamp: new Date(sessionData.timestamp),
                    zoneName: sessionData.activeZone?.name || 'Без активна зона',
                    distance: (sessionData.globalData.totalDistance || 0).toFixed(1) + ' км'
                });
            } catch (error) {
                console.error('Error parsing session:', error);
            }
        }
    }
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
}

function clearOldSessions() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith('driving_session_')) {
            try {
                const sessionData = JSON.parse(localStorage.getItem(key));
                const sessionDate = new Date(sessionData.timestamp);
                if (sessionDate < oneWeekAgo) {
                    localStorage.removeItem(key);
                }
            } catch (error) {
                localStorage.removeItem(key); // Remove corrupted sessions
            }
        }
    }
}

// Initialize map
function initMap() {
    // Center on Sofia-Plovdiv highway midpoint
    map = L.map('map').setView([42.37, 24.15], 9);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add markers for highway section points
    const highwayPoints = [];
    
    // Collect all unique points from highway segments
    HIGHWAY_SEGMENTS_CONFIG.forEach(segment => {
        // Add start point if not already added
        if (!highwayPoints.find(p => p.name === segment.startPoint.name)) {
            highwayPoints.push({
                coords: [segment.startPoint.lat, segment.startPoint.lng],
                name: segment.startPoint.name
            });
        }
        // Add end point if not already added
        if (!highwayPoints.find(p => p.name === segment.endPoint.name)) {
            highwayPoints.push({
                coords: [segment.endPoint.lat, segment.endPoint.lng],
                name: segment.endPoint.name
            });
        }
    });
    
    // Add markers for highway points
    highwayPoints.forEach(point => {
        const marker = L.marker(point.coords).addTo(map)
            .bindPopup(`📍 ${point.name}`);
        zoneMarkers.push(marker);
    });
    
    // Draw all zone routes
    SPEED_ZONES.forEach(zone => {
        const polyline = L.polyline(zone.waypoints, {
            color: zone.color,
            weight: 5,
            opacity: 0.5,
            dashArray: '10, 10'
        }).addTo(map);
        
        polyline.bindPopup(`
            <strong>${zone.name}</strong><br>
            Макс. средна скорост: ${zone.maxSpeed} км/ч
        `);
        
        zonePolylines[zone.id] = polyline;
    });
}

// Toggle tracking
function toggleTracking() {
    if (isTracking) {
        stopTracking();
    } else {
        startTracking();
    }
}

// Start tracking
function startTracking() {
    // Check for existing session first
    const lastSessionId = localStorage.getItem('last_session_id');
    if (lastSessionId && !sessionId) {
        const shouldResume = confirm('Намерена е предишна сесия. Искате ли да продължите?');
        if (shouldResume) {
            if (loadSession(lastSessionId)) {
                showMessage('📂 Сесия възстановена успешно', 'success');
                sessionId = lastSessionId;
            }
        }
    }
    
    // Create new session if none exists
    if (!sessionId) {
        sessionId = generateSessionId();
        startTime = new Date();
        showMessage('🆕 Нова сесия започната', 'info');
    }
    
    
    isPaused = false;
    
    // Clear old sessions (housekeeping)
    clearOldSessions();
    
    // Check if we're on a device with GPS
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (navigator.geolocation) {
        // Use real GPS tracking
        startRealTracking();
    } else {
        showMessage('GPS не е достъпен на това устройство', 'error');
        return;
    }
    
    // Show control buttons when tracking
    document.getElementById('force-zone-btn').style.display = 'block';
    document.getElementById('pause-btn').style.display = 'block';
    
    // Start GPS monitoring
    startGPSMonitoring();
}

// Force zone detection for current location
function forceZoneDetection() {
    if (!isTracking || positions.length === 0) {
        showMessage('Първо започнете проследяването', 'error');
        return;
    }
    
    // Update button to show searching state
    const zoneBtn = document.getElementById('force-zone-btn');
    const zoneBtnIcon = document.getElementById('zone-btn-icon');
    const zoneBtnText = document.getElementById('zone-btn-text');
    
    zoneBtnIcon.textContent = '🔍';
    zoneBtnText.textContent = 'Търсене...';
    zoneBtn.style.background = '#9E9E9E';
    
    setTimeout(() => {
        const lastPos = positions[positions.length - 1];
        const currentLat = lastPos.latitude;
        const currentLng = lastPos.longitude;
        
        // Find closest zone based on route proximity
        let closestZone = null;
        let closestDistance = Infinity;
        
        SPEED_ZONES.forEach(zone => {
            // Check distance to each point on the route
            zone.waypoints.forEach(waypoint => {
                const distance = calculateDistance(currentLat, currentLng, waypoint[0], waypoint[1]);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestZone = zone;
                }
            });
        });
        
        if (closestZone && closestDistance < 20) { // Within 20km of any route
            if (activeZone && activeZone.id === closestZone.id) {
                showMessage(`Вече сте в зона: ${closestZone.name}`, 'info');
                updateZoneButtonState();
            } else {
                if (activeZone) {
                    exitZone();
                }
                enterZone(closestZone);
                showMessage(`🎯 Зона активирана: ${closestZone.name}`, 'success');
                updateZoneButtonState();
            }
        } else {
            showMessage('Не сте близо до нито една зона за средна скорост', 'error');
            // Reset button to original state
            zoneBtnIcon.textContent = '🎯';
            zoneBtnText.textContent = 'Намери зона';
            zoneBtn.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
        }
    }, 1000); // Add small delay for better UX
}

// Update zone button state based on current zone
function updateZoneButtonState() {
    const zoneBtn = document.getElementById('force-zone-btn');
    const zoneBtnIcon = document.getElementById('zone-btn-icon');
    const zoneBtnText = document.getElementById('zone-btn-text');
    
    if (activeZone) {
        zoneBtnIcon.textContent = '✅';
        zoneBtnText.textContent = activeZone.name.split(' - ')[0]; // Show first city
        zoneBtn.style.background = `linear-gradient(135deg, ${activeZone.color}, ${activeZone.color}CC)`;
    } else {
        zoneBtnIcon.textContent = '🎯';
        zoneBtnText.textContent = 'Намери зона';
        zoneBtn.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    }
}

// Start real GPS tracking
function startRealTracking() {
    isTracking = true;
    startTime = new Date();
    positions = [];
    totalDistance = 0;
    currentSpeedHistory = [];
    
    updateButton(true);
    showMessage('Разрешаване на GPS достъп...', 'info');
    
    // Check permissions API if available (for better iOS handling)
    if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
            if (result.state === 'denied') {
                showMessage('GPS достъпът е забранен в настройките', 'error');
                setTimeout(() => {
                    showLocationInstructions(true);
                }, 1000);
                stopTracking();
                return;
            }
        }).catch(function(error) {
            // Permissions API not supported, continue with normal flow
            console.log('Permissions API not supported');
        });
    }
    
    // First get current position to trigger permission prompt
    navigator.geolocation.getCurrentPosition(
        (position) => {
            showMessage('GPS активиран успешно', 'success');
            const { latitude, longitude, speed, heading } = position.coords;
            const currentSpeed = (speed || 0) * 3.6;
            updatePosition({ lat: latitude, lng: longitude, speed: currentSpeed, heading });
            
            // Then start watching position
            watchId = navigator.geolocation.watchPosition(
                position => {
                    const { latitude, longitude, speed, heading } = position.coords;
                    const currentSpeed = (speed || 0) * 3.6;
                    updatePosition({ lat: latitude, lng: longitude, speed: currentSpeed, heading });
                },
                error => handleError(error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 1000,
                    timeout: 10000
                }
            );
        },
        (error) => {
            handleError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


// GPS signal monitoring
function startGPSMonitoring() {
    setInterval(() => {
        if (isTracking && lastGPSTime) {
            const timeSinceLastGPS = (new Date() - lastGPSTime) / 1000; // seconds
            
            if (timeSinceLastGPS > 30 && !gpsSignalLost) { // 30 seconds without GPS
                gpsSignalLost = true;
                showMessage('📵 GPS сигнал загубен - сесията се запазва', 'warning');
                
                // Change user marker to indicate signal loss
                if (userMarker) {
                    userMarker.setStyle({ fillColor: '#FF9800' });
                }
                
                // Save session
                saveSession();
                
                // Pause tracking to avoid accumulating incorrect data
                isPaused = true;
            }
        }
    }, 5000); // Check every 5 seconds
}

// Stop tracking
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    
    
    isTracking = false;
    isPaused = false;
    updateButton(false);
    
    // Hide control buttons
    document.getElementById('force-zone-btn').style.display = 'none';
    document.getElementById('pause-btn').style.display = 'none';
    
    // Exit any active zone
    if (activeZone) {
        exitZone();
    }
    
    // Final session save
    if (sessionId) {
        saveSession();
    }
}

// Update position
function updatePosition({ lat, lng, speed, heading }) {
    const currentSpeed = speed || 0;
    const now = new Date();
    
    // Update GPS status
    lastGPSTime = now;
    if (gpsSignalLost) {
        gpsSignalLost = false;
        showMessage('📶 GPS сигнал възстановен', 'success');
        // Update user marker color to show signal restored
        if (userMarker) {
            userMarker.setStyle({ fillColor: '#1976D2' });
        }
    }
    
    // Auto-detect direction and zone based on heading and movement
    if (heading !== undefined && heading !== null) {
        autoDetectDirection(lat, lng, heading);
    }
    
    // Auto-detect stop/resume
    autoDetectStopResume(currentSpeed);
    
    // Update user marker
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.circleMarker([lat, lng], {
            radius: 10,
            fillColor: '#1976D2',
            color: '#fff',
            weight: 2,
            fillOpacity: 0.8
        }).addTo(map);
        
        // Center map on user
        map.setView([lat, lng], 11);
    }
    
    // Check for zone changes
    checkZoneChange(lat, lng);
    
    // Calculate distance if we have a previous position and not paused
    if (!isPaused && positions.length > 0) {
        const lastPos = positions[positions.length - 1];
        const distance = calculateDistance(
            lastPos.latitude, lastPos.longitude,
            lat, lng
        );
        totalDistance += distance;
        
        // Update zone distance if in a zone
        if (activeZone && zonePositions.length > 0) {
            zoneTotalDistance += distance;
        }
    }
    
    positions.push({ latitude: lat, longitude: lng, speed: currentSpeed, time: now });
    currentSpeedHistory.push(currentSpeed);
    
    // Update zone tracking if in a zone and not paused
    if (activeZone && !isPaused) {
        zonePositions.push({ latitude: lat, longitude: lng, speed: currentSpeed, time: now });
        zoneSpeedHistory.push(currentSpeed);
    }
    
    // Save session periodically
    if (sessionId && positions.length % 10 === 0) { // Save every 10 position updates
        saveSession();
    }
    
    updateDisplay(currentSpeed);
}

// Auto-detect direction based on heading and find appropriate zone
function autoDetectDirection(lat, lng, heading) {
    lastHeading = heading;
    
    // Store movement history for robust direction detection
    directionHistory.push({ heading, lat, lng, time: new Date() });
    if (directionHistory.length > 15) {
        directionHistory.shift(); // Keep last 15 readings for better accuracy
    }
    
    // Need enough data points for reliable detection
    if (directionHistory.length < 8) return;
    
    // Find which highway segment we're on (enhanced detection)
    const nearestSegment = detectHighwaySegment(lat, lng);
    if (!nearestSegment) return;
    
    // Determine direction using movement vector analysis
    const direction = determineDirectionOnSegment(nearestSegment, directionHistory);
    
    if (direction) {
        const zoneName = direction === 'forward' 
            ? `${nearestSegment.endpoints[0].name} → ${nearestSegment.endpoints[1].name}`
            : `${nearestSegment.endpoints[1].name} → ${nearestSegment.endpoints[0].name}`;
        
        // Update zone if changed
        if (currentZoneName !== zoneName || activeSegment !== nearestSegment) {
            activeSegment = nearestSegment;
            detectedDirection = direction;
            currentZoneName = zoneName;
            
            // Create dynamic zone for this direction
            const dynamicZone = {
                id: nearestSegment.id + '-' + direction,
                name: zoneName,
                maxSpeed: nearestSegment.maxSpeed,
                start: direction === 'forward' ? nearestSegment.endpoints[0] : nearestSegment.endpoints[1],
                end: direction === 'forward' ? nearestSegment.endpoints[1] : nearestSegment.endpoints[0],
                waypoints: direction === 'forward' ? nearestSegment.waypoints : [...nearestSegment.waypoints].reverse(),
                color: nearestSegment.color,
                segment: nearestSegment,
                direction: direction
            };
            
            activateZone(dynamicZone);
            updateZoneDisplay();
            showMessage(`🧭 Засечена посока: ${zoneName}`, 'success');
        }
    }
}

// Detect which highway segment the user is on (similar to Flutter logic)
function detectHighwaySegment(lat, lng) {
    let nearestSegment = null;
    let minDistance = Infinity;
    
    const DETECTION_BUFFER = 0.005; // About 500m buffer for zone detection
    
    for (const segment of HIGHWAY_SEGMENTS) {
        // Check if near start or end points (with buffer)
        const distToStart = calculateDistance(lat, lng, segment.endpoints[0].lat, segment.endpoints[0].lng);
        const distToEnd = calculateDistance(lat, lng, segment.endpoints[1].lat, segment.endpoints[1].lng);
        
        // Check if point is near the route
        if (isPointNearRoute(lat, lng, segment.waypoints, 10)) {
            const avgDistance = segment.waypoints.reduce((sum, wp) => {
                return sum + calculateDistance(lat, lng, wp[0], wp[1]);
            }, 0) / segment.waypoints.length;
            
            if (avgDistance < minDistance) {
                minDistance = avgDistance;
                nearestSegment = segment;
            }
        }
        
        // Also check if near endpoints with buffer (for better zone entry detection)
        if (distToStart < DETECTION_BUFFER || distToEnd < DETECTION_BUFFER) {
            if (distToStart < minDistance || distToEnd < minDistance) {
                minDistance = Math.min(distToStart, distToEnd);
                nearestSegment = segment;
            }
        }
    }
    
    return nearestSegment;
}

// Determine travel direction on a highway segment using movement analysis
function determineDirectionOnSegment(segment, positionHistory) {
    if (positionHistory.length < 5) return null;
    
    const recent = positionHistory.slice(-5);
    const start = recent[0];
    const end = recent[recent.length - 1];
    
    // Calculate movement vector
    const movementVector = {
        lat: end.lat - start.lat,
        lng: end.lng - start.lng
    };
    
    // Calculate segment vector (forward direction)
    const segmentVector = {
        lat: segment.endpoints[1].lat - segment.endpoints[0].lat,
        lng: segment.endpoints[1].lng - segment.endpoints[0].lng
    };
    
    // Calculate dot product to determine alignment
    const dotProduct = movementVector.lat * segmentVector.lat + movementVector.lng * segmentVector.lng;
    
    // Calculate distances to both endpoints to determine which way we're heading
    const distToStart = calculateDistance(end.lat, end.lng, segment.endpoints[0].lat, segment.endpoints[0].lng);
    const distToEnd = calculateDistance(end.lat, end.lng, segment.endpoints[1].lat, segment.endpoints[1].lng);
    
    const wasDistToStart = calculateDistance(start.lat, start.lng, segment.endpoints[0].lat, segment.endpoints[0].lng);
    const wasDistToEnd = calculateDistance(start.lat, start.lng, segment.endpoints[1].lat, segment.endpoints[1].lng);
    
    // Determine direction based on which endpoint we're approaching
    const approachingEnd = (distToEnd < wasDistToEnd);
    const approachingStart = (distToStart < wasDistToStart);
    
    if (approachingEnd && !approachingStart) {
        return 'forward'; // Moving towards endpoint[1]
    } else if (approachingStart && !approachingEnd) {
        return 'reverse'; // Moving towards endpoint[0]  
    } else if (Math.abs(dotProduct) > 0.5) {
        return dotProduct > 0 ? 'forward' : 'reverse';
    }
    
    return null; // Unable to determine reliably
}

// Activate a speed zone
function activateZone(zone) {
    activeZone = zone;
    zoneStartTime = new Date();
    zonePositions = [];
    zoneSpeedHistory = [];
    zoneTotalDistance = 0;
    
    console.log(`✅ Zone activated: ${zone.name} (${zone.maxSpeed} km/h limit)`);
}

// Calculate expected heading for a zone based on current position
function calculateExpectedHeading(lat, lng, zone) {
    const waypoints = zone.waypoints;
    let closestSegmentIndex = -1;
    let minDistance = Infinity;
    
    // Find the closest route segment
    for (let i = 0; i < waypoints.length - 1; i++) {
        const distance = distanceFromPointToLineSegment(
            lat, lng,
            waypoints[i][0], waypoints[i][1],
            waypoints[i + 1][0], waypoints[i + 1][1]
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestSegmentIndex = i;
        }
    }
    
    if (closestSegmentIndex === -1) return null;
    
    // Calculate heading from start to end of closest segment
    const startPoint = waypoints[closestSegmentIndex];
    const endPoint = waypoints[closestSegmentIndex + 1];
    
    return calculateBearing(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
}

// Calculate bearing between two points
function calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return normalizeHeading(bearing);
}

// Normalize heading to 0-360 range
function normalizeHeading(heading) {
    while (heading < 0) heading += 360;
    while (heading >= 360) heading -= 360;
    return heading;
}

// Auto-detect stop and resume with countdown
function autoDetectStopResume(currentSpeed) {
    const STOP_THRESHOLD = 5; // km/h - consider stopped below this speed
    const STOP_DURATION = 30000; // 30 seconds of low speed to consider stopped
    const RESUME_THRESHOLD = 15; // km/h - consider moving above this speed
    
    lastSpeed = currentSpeed;
    
    if (currentSpeed < STOP_THRESHOLD) {
        lowSpeedCount++;
        
        // If we've been at low speed for enough readings, consider stopped
        if (lowSpeedCount > 6 && !stopDetected && isTracking && !isPaused) { // 6 readings ≈ 30 seconds
            stopDetected = true;
            showStopDialog();
        }
    } else if (currentSpeed > RESUME_THRESHOLD && stopDetected) {
        // Vehicle started moving again
        lowSpeedCount = 0;
        
        if (isPaused) {
            showResumeDialog();
        }
        
        stopDetected = false;
    } else if (currentSpeed > STOP_THRESHOLD) {
        lowSpeedCount = 0;
    }
}

// Show dialog when stop is detected
function showStopDialog() {
    if (isPaused) return; // Already paused
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center;">
            <h2 style="margin-bottom: 20px; color: #333;">🛑 Спиране засечено</h2>
            <p style="margin-bottom: 20px; color: #666;">Превозното средство е спряло. Искате ли да поставите сесията на пауза?</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove(); togglePause();" 
                        style="background: #FF9800; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    ⏸️ Пауза
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove();" 
                        style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    ▶️ Продължи
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds if no action
    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.remove();
        }
    }, 10000);
}

// Show resume dialog with countdown
function showResumeDialog() {
    if (!isPaused) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 20px;
    `;
    
    let countdown = 3;
    
    const updateModal = () => {
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center;">
                <h2 style="margin-bottom: 20px; color: #333;">🚗 Движение засечено</h2>
                <p style="margin-bottom: 20px; color: #666;">Превозното средство започна да се движи отново.</p>
                <div style="font-size: 48px; margin: 20px 0; color: #4CAF50; font-weight: bold;">${countdown}</div>
                <p style="margin-bottom: 20px; color: #666;">Автоматично възобновяване след ${countdown} секунди...</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="resumeSession(); this.parentElement.parentElement.parentElement.remove();" 
                            style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        ▶️ Възобнови сега
                    </button>
                    <button onclick="startNewSession(); this.parentElement.parentElement.parentElement.remove();" 
                            style="background: #2196F3; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        🆕 Нова сесия
                    </button>
                </div>
            </div>
        `;
    };
    
    updateModal();
    document.body.appendChild(modal);
    
    // Countdown timer
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            updateModal();
        } else {
            clearInterval(countdownInterval);
            resumeSession();
            modal.remove();
        }
    }, 1000);
}

// Resume current session
function resumeSession() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    if (isPaused) {
        togglePause(); // This will resume the session
        showMessage('▶️ Сесия възобновена автоматично', 'success');
    }
}

// Start new session
function startNewSession() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Clear current session
    sessionId = null;
    localStorage.removeItem('last_session_id');
    
    // Reset tracking state
    if (isPaused) {
        isPaused = false;
        document.getElementById('pause-btn').style.display = 'none';
        document.getElementById('pause-btn').classList.remove('resumed');
        document.getElementById('pause-icon').textContent = '⏸️';
        document.getElementById('pause-text').textContent = 'Пауза';
    }
    
    // Restart tracking
    stopTracking();
    setTimeout(() => {
        startTracking();
        showMessage('🆕 Нова сесия започната', 'info');
    }, 500);
}

// Calculate distance between two points (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Check if point is on or near a line segment
function isPointNearRoute(lat, lng, waypoints, maxDistance = 5) {
    for (let i = 0; i < waypoints.length - 1; i++) {
        const segmentStart = waypoints[i];
        const segmentEnd = waypoints[i + 1];
        
        const distanceToSegment = distanceFromPointToLineSegment(
            lat, lng,
            segmentStart[0], segmentStart[1],
            segmentEnd[0], segmentEnd[1]
        );
        
        if (distanceToSegment < maxDistance) {
            return true;
        }
    }
    return false;
}

// Calculate distance from point to line segment
function distanceFromPointToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    // Convert to km (approximate)
    return Math.sqrt(dx * dx + dy * dy) * 111.32;
}

// Check if position is near a zone endpoint or within a zone
function checkZoneChange(lat, lng) {
    const ZONE_RADIUS = 3; // km - radius to detect zone entry/exit
    const ROUTE_PROXIMITY = 5; // km - distance to consider being "on route"
    
    SPEED_ZONES.forEach(zone => {
        const startDistance = calculateDistance(lat, lng, zone.start.lat, zone.start.lng);
        const endDistance = calculateDistance(lat, lng, zone.end.lat, zone.end.lng);
        const onRoute = isPointNearRoute(lat, lng, zone.waypoints, ROUTE_PROXIMITY);
        
        // Check if entering a zone (either at start point OR anywhere on the route)
        if (!activeZone && (startDistance < ZONE_RADIUS || onRoute)) {
            enterZone(zone);
        }
        // Check if exiting current zone
        else if (activeZone && activeZone.id === zone.id && endDistance < ZONE_RADIUS) {
            exitZone();
        }
        // Check if we've moved to a different zone while already tracking
        else if (activeZone && activeZone.id !== zone.id && onRoute) {
            exitZone();
            enterZone(zone);
        }
    });
}

// Enter a speed zone
function enterZone(zone) {
    activeZone = zone;
    zonePositions = [];
    zoneSpeedHistory = [];
    zoneTotalDistance = 0;
    zoneStartTime = new Date();
    
    // Highlight active zone with glowing effect
    Object.keys(zonePolylines).forEach(id => {
        if (id === zone.id) {
            zonePolylines[id].setStyle({ 
                opacity: 1, 
                weight: 10,
                dashArray: null,
                color: zone.color,
                className: 'active-zone-glow'
            });
        } else {
            zonePolylines[id].setStyle({ 
                opacity: 0.2, 
                weight: 3,
                dashArray: '15, 15' 
            });
        }
    });
    
    showMessage(`🚗 Влизате в зона: ${zone.name}\nЛимит: ${zone.maxSpeed} км/ч`, 'info');
    updateZoneDisplay();
    updateZoneButtonState();
}

// Exit current zone
function exitZone() {
    if (!activeZone) return;
    
    // Calculate final zone stats
    let zoneAverageSpeed = 0;
    if (zoneStartTime && zoneTotalDistance > 0) {
        const elapsedHours = (new Date() - zoneStartTime) / (1000 * 60 * 60);
        zoneAverageSpeed = zoneTotalDistance / elapsedHours;
    }
    
    const wasCompliant = zoneAverageSpeed <= activeZone.maxSpeed;
    
    // Hide direction display
    const directionRow = document.getElementById('direction-row');
    if (directionRow) {
        directionRow.style.display = 'none';
    }
    
    showMessage(
        `Излизате от зона: ${activeZone.name}\n` +
        `Средна скорост: ${zoneAverageSpeed.toFixed(1)} км/ч\n` +
        `Статус: ${wasCompliant ? '✓ В норма' : '✗ Превишена скорост'}`,
        wasCompliant ? 'success' : 'error'
    );
    
    // Reset zone styling
    Object.values(zonePolylines).forEach(polyline => {
        polyline.setStyle({ 
            opacity: 0.5, 
            weight: 5,
            dashArray: '10, 10' 
        });
    });
    
    activeZone = null;
    activeSegment = null;
    detectedDirection = null;
    currentZoneName = null;
    updateZoneDisplay();
    updateZoneButtonState();
}

// Update display
function updateDisplay(currentSpeed) {
    // Update current speed
    document.getElementById('current-speed').textContent = currentSpeed.toFixed(1) + ' км/ч';
    
    // Determine which values to show (zone or total)
    let averageSpeed = 0;
    let distance = totalDistance;
    let speedLimit = MAX_AVERAGE_SPEED;
    let speedHistory = currentSpeedHistory;
    
    if (activeZone) {
        // Show zone-specific data when in a zone
        if (zoneStartTime && zoneTotalDistance > 0) {
            const elapsedHours = (new Date() - zoneStartTime) / (1000 * 60 * 60);
            averageSpeed = zoneTotalDistance / elapsedHours;
        }
        distance = zoneTotalDistance;
        speedLimit = activeZone.maxSpeed;
        speedHistory = zoneSpeedHistory;
    } else {
        // Show total trip data when not in a zone
        if (startTime && totalDistance > 0) {
            const elapsedHours = (new Date() - startTime) / (1000 * 60 * 60);
            averageSpeed = totalDistance / elapsedHours;
        }
    }
    
    // Update average speed with color
    const avgSpeedElement = document.getElementById('average-speed');
    avgSpeedElement.textContent = averageSpeed.toFixed(1) + ' км/ч';
    
    if (averageSpeed > speedLimit) {
        avgSpeedElement.className = 'speed-value danger';
    } else if (averageSpeed > speedLimit * 0.95) {
        avgSpeedElement.className = 'speed-value warning';
    } else {
        avgSpeedElement.className = 'speed-value';
    }
    
    // Calculate predicted speed
    let predictedSpeed = averageSpeed;
    if (speedHistory.length > 10) {
        const recentSpeeds = speedHistory.slice(-10);
        const recentAverage = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length;
        predictedSpeed = averageSpeed * 0.7 + recentAverage * 0.3;
    }
    
    document.getElementById('predicted-speed').textContent = predictedSpeed.toFixed(1) + ' км/ч';
    
    // Update distance
    document.getElementById('distance').textContent = distance.toFixed(1) + ' км';
    
    // Update recommendation
    updateRecommendation(averageSpeed, speedLimit);
    
    // Update zone display
    updateZoneDisplay();
}

// Calculate required speed for remaining distance to achieve target average
function calculateRequiredSpeed(currentAvg, distanceDone, zoneLength, targetAvg) {
    if (distanceDone === 0) {
        return { type: 'start', speed: targetAvg };
    }
    
    const totalTimeAllowed = zoneLength / targetAvg;
    const timeUsed = distanceDone / currentAvg;
    const timeRemaining = totalTimeAllowed - timeUsed;
    const distanceRemaining = zoneLength - distanceDone;
    
    if (timeRemaining <= 0) {
        const excessTime = Math.abs(timeRemaining);
        return { 
            type: 'impossible', 
            excessTime: excessTime,
            finalAvg: zoneLength / (timeUsed)
        };
    }
    
    if (distanceRemaining <= 0) {
        return { type: 'finished', finalAvg: currentAvg };
    }
    
    const requiredSpeed = distanceRemaining / timeRemaining;
    
    if (requiredSpeed <= 0) {
        const stopTime = timeRemaining - (distanceRemaining / 50); // Assuming 50 km/h minimum for last stretch
        return { 
            type: 'can_stop', 
            stopTime: Math.max(0, stopTime),
            thenSpeed: distanceRemaining / Math.max(0.001, timeRemaining - Math.max(0, stopTime))
        };
    }
    
    return { 
        type: 'speed_needed', 
        speed: requiredSpeed,
        feasible: requiredSpeed <= 200 // Reasonable maximum speed
    };
}

// Update recommendation with advanced recovery calculations  
function updateRecommendation(averageSpeed, speedLimit) {
    // We removed the recommendation box, so this function now only handles auto-guidance calculations
    // All visual updates are handled by the auto-guidance panel
    
    if (!activeZone || !positions.length) {
        return;
    }
    
    const distanceDone = zoneTotalDistance;
    const zoneLength = calculateDistance(
        activeZone.start.lat, activeZone.start.lng,
        activeZone.end.lat, activeZone.end.lng
    );
    
    const recovery = calculateRequiredSpeed(averageSpeed, distanceDone, zoneLength, speedLimit);
    currentRecommendation = recovery;
    
    // Auto-execute if at or above speed limit
    const shouldAutoExecute = averageSpeed >= speedLimit && activeZone;
    
    // Trigger auto-guidance for feasible speed adjustments
    if (shouldAutoExecute && recovery.type === 'speed_needed' && recovery.feasible) {
        startSpeedGuidance(recovery.speed, true);
    }
}

// Execute the recommended speed action
function executeSpeedAction() {
    if (!currentRecommendation || !isTracking) {
        showMessage('Няма активна препоръка', 'error');
        return;
    }
    
    const actionBtn = document.getElementById('speed-action-btn');
    const actionIcon = document.getElementById('action-btn-icon');
    const actionText = document.getElementById('action-btn-text');
    
    switch (currentRecommendation.type) {
        case 'speed_needed':
        case 'can_stop':
            if (currentRecommendation.type === 'can_stop' && currentRecommendation.stopTime > 0.1) {
                // Execute stop action
                startStopTimer(currentRecommendation.stopTime, currentRecommendation.thenSpeed);
            } else {
                // Execute speed guidance
                const targetSpeed = currentRecommendation.type === 'speed_needed' 
                    ? currentRecommendation.speed 
                    : currentRecommendation.thenSpeed;
                startSpeedGuidance(targetSpeed);
            }
            break;
            
        case 'impossible':
            // Acknowledge impossible situation
            showMessage('Превишението е неизбежно. Карайте внимателно.', 'warning');
            actionBtn.style.display = 'none';
            break;
            
        default:
            showMessage('Няма действие за изпълнение', 'info');
    }
}

// Start stop timer with countdown
function startStopTimer(stopTimeHours, followUpSpeed, isAutomatic = false) {
    // Prevent duplicate timers
    if (stopTimer) return;
    
    const stopMinutes = Math.round(stopTimeHours * 60);
    stopStartTime = new Date();
    
    const prefix = isAutomatic ? '🤖 Автоматично' : '🛑';
    showMessage(`${prefix} Спиране за ${stopMinutes} минути започна!`, 'info');
    
    const actionBtn = document.getElementById('speed-action-btn');
    const actionIcon = document.getElementById('action-btn-icon');
    const actionText = document.getElementById('action-btn-text');
    
    actionBtn.className = 'stop-action';
    
    // Update button every second with countdown
    stopTimer = setInterval(() => {
        const elapsed = (new Date() - stopStartTime) / 1000 / 60; // minutes
        const remaining = Math.max(0, stopMinutes - elapsed);
        
        if (remaining > 0) {
            actionIcon.textContent = '⏰';
            actionText.textContent = `${Math.ceil(remaining)} мин остават`;
        } else {
            // Stop period finished
            clearInterval(stopTimer);
            stopTimer = null;
            stopStartTime = null;
            
            showMessage(`✅ Време за движение! Карайте ${followUpSpeed.toFixed(0)} км/ч`, 'success');
            startSpeedGuidance(followUpSpeed, isAutomatic);
        }
    }, 1000);
}

// Start speed guidance mode
function startSpeedGuidance(targetSpeed, isAutomatic = false) {
    // Prevent duplicate guidance calls for the same speed
    if (isAutomatic && isAutoGuidanceActive && Math.abs(lastAutoExecutionSpeed - targetSpeed) < 5) {
        return;
    }
    
    // Update the auto-guidance panel
    updateAutoGuidancePanel(targetSpeed, isAutomatic);
    
    if (isAutomatic) {
        isAutoGuidanceActive = true;
        lastAutoExecutionSpeed = targetSpeed;
        
        // Reset auto guidance after speed changes significantly
        setTimeout(() => {
            isAutoGuidanceActive = false;
            // Don't hide the panel - just reset status
            resetAutoGuidanceStatus();
        }, 10000); // 10 seconds
    }
    
    const actionBtn = document.getElementById('speed-action-btn');
    const actionIcon = document.getElementById('action-btn-icon');
    const actionText = document.getElementById('action-btn-text');
    
    actionBtn.className = 'slow-action';
    actionIcon.textContent = '✅';
    actionText.textContent = isAutomatic ? 'Автоматично активно' : 'Активна цел';
    
    // Hide button after 3 seconds if not automatic
    if (!isAutomatic) {
        setTimeout(() => {
            actionBtn.style.display = 'none';
        }, 3000);
    }
}

// Calculate distance to zone end
function calculateDistanceToZoneEnd(currentLat, currentLng) {
    if (!activeZone) return 0;
    
    const endLat = activeZone.end.lat;
    const endLng = activeZone.end.lng;
    
    return calculateDistance(currentLat, currentLng, endLat, endLng);
}

// Update zone display
function updateZoneDisplay() {
    const speedLabels = document.querySelectorAll('.speed-label');
    const avgSpeedLabel = speedLabels[1]; // Second label is for average speed
    const infoBox = document.querySelector('.info-box');
    const directionRow = document.getElementById('direction-row');
    const currentDirection = document.getElementById('current-direction');
    
    if (activeZone) {
        // Show direction information
        if (directionRow && currentDirection) {
            directionRow.style.display = 'flex';
            currentDirection.textContent = activeZone.name;
            currentDirection.style.color = activeZone.color;
            currentDirection.style.fontWeight = 'bold';
        }
        
        // Get current position for distance calculation
        let distanceToEnd = 0;
        if (positions.length > 0) {
            const lastPos = positions[positions.length - 1];
            distanceToEnd = calculateDistanceToZoneEnd(lastPos.latitude, lastPos.longitude);
        }
        
        // Update label to show zone name with pulsing effect
        if (avgSpeedLabel) {
            avgSpeedLabel.innerHTML = `
                <div style="font-size: 16px; font-weight: bold; color: ${activeZone.color}; 
                           margin-bottom: 5px; animation: pulse 2s infinite;">
                    🎯 ${activeZone.name}
                </div>
                <div style="font-size: 12px; color: #666;">Средна скорост в зоната</div>`;
        }
        
        // Add enhanced zone info to info box
        const zoneInfo = document.createElement('div');
        zoneInfo.id = 'zone-info';
        zoneInfo.style.cssText = `
            background: linear-gradient(135deg, ${activeZone.color}15, ${activeZone.color}05);
            border: 2px solid ${activeZone.color}40;
            border-radius: 8px;
            margin-top: 8px; 
            padding: 12px;
        `;
        // Calculate zone progress and distance styling
        const zoneLength = calculateDistance(
            activeZone.start.lat, activeZone.start.lng,
            activeZone.end.lat, activeZone.end.lng
        );
        const progress = Math.max(0, Math.min(100, ((zoneLength - distanceToEnd) / zoneLength) * 100));
        
        // Distance styling based on remaining distance
        let distanceClass = '';
        let distanceIcon = '📍';
        if (distanceToEnd < 5) {
            distanceClass = 'distance-critical';
            distanceIcon = '🏁';
        } else if (distanceToEnd < 15) {
            distanceClass = 'distance-warning';
            distanceIcon = '⚠️';
        }
        
        zoneInfo.innerHTML = `
            <div class="zone-header">
                <span class="zone-icon">🎯</span>
                <span style="font-weight: bold; color: ${activeZone.color}; font-size: 16px;">
                    ${activeZone.name}
                </span>
            </div>
            <div class="zone-progress">
                <div class="zone-progress-bar" style="width: ${progress}%; background: ${activeZone.color};"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                <span>Прогрес в зоната:</span>
                <span style="font-weight: bold;">${progress.toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Лимит скорост:</span>
                <span style="font-weight: bold; color: ${activeZone.color};">${activeZone.maxSpeed} км/ч</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${distanceIcon} До края:</span>
                <span class="${distanceClass}" style="font-weight: bold;">${distanceToEnd.toFixed(1)} км</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>🏁 Дестинация:</span>
                <span style="font-weight: bold;">${activeZone.end.name}</span>
            </div>
        `;
        
        const existingZoneInfo = document.getElementById('zone-info');
        if (existingZoneInfo) {
            existingZoneInfo.remove();
        }
        infoBox.appendChild(zoneInfo);
    } else {
        // Reset to default when not in zone
        if (avgSpeedLabel) {
            avgSpeedLabel.innerHTML = '<div style="font-size: 12px; color: #666;">Средна скорост</div>';
        }
        
        const existingZoneInfo = document.getElementById('zone-info');
        if (existingZoneInfo) {
            existingZoneInfo.remove();
        }
    }
}

// Update button state
function updateButton(active) {
    const btn = document.getElementById('tracking-btn');
    const icon = document.getElementById('btn-icon');
    const text = document.getElementById('btn-text');
    
    if (active) {
        btn.className = 'active';
        icon.textContent = '■';
        text.textContent = 'Спри';
    } else {
        btn.className = '';
        icon.textContent = '▶';
        text.textContent = 'Започни';
    }
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'info' ? '#2196F3' : type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 2000;
        font-size: 14px;
    `;
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Handle geolocation errors
function handleError(error) {
    let message = '';
    let showInstructions = false;
    let isIOSPermissionIssue = false;
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Достъпът до локация е отказан';
            showInstructions = true;
            // Check if this is an iOS device
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                isIOSPermissionIssue = true;
            }
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Локацията не е налична. Проверете GPS настройките';
            showInstructions = true;
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                isIOSPermissionIssue = true;
            }
            break;
        case error.TIMEOUT:
            message = 'Изтече времето за получаване на локация. Опитайте отново';
            break;
        default:
            message = 'Грешка при достъп до локация: ' + error.message;
    }
    
    showMessage(message, 'error');
    
    if (showInstructions) {
        setTimeout(() => {
            showLocationInstructions(isIOSPermissionIssue);
        }, 3500);
    }
    
    stopTracking();
}

// Show location permission instructions
function showLocationInstructions(isIOSPermissionIssue) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 20px;
    `;
    
    let instructionsHTML = '';
    
    if (isIOSPermissionIssue) {
        instructionsHTML = `
            <h2 style="margin-bottom: 20px; color: #333;">📍 Настройки за GPS локация</h2>
            <div style="text-align: left; margin-bottom: 20px; line-height: 1.8; color: #444;">
                <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #FFC107;">
                    <strong>⚠️ Важно за iPhone/iPad:</strong><br>
                    GPS достъпът изисква специални настройки
                </div>
                
                <strong>🔧 Стъпки за активиране:</strong><br>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li><strong>Отворете Настройки</strong> на вашия iPhone</li>
                    <li><strong>Поверителност и сигурност</strong> → <strong>Услуги за местоположение</strong></li>
                    <li>Уверете се, че <strong>Услуги за местоположение</strong> е <span style="color: #4CAF50;">ВКЛЮЧЕНО</span></li>
                    <li>Намерете <strong>Chrome</strong> (или Safari) в списъка</li>
                    <li>Изберете <strong>"Докато използвате приложението"</strong></li>
                    <li>Включете <strong>"Точно местоположение"</strong> ✓</li>
                    <li><strong>Затворете и отворете</strong> приложението отново</li>
                </ol>
                
                <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #4CAF50;">
                    <strong>💡 Съвет:</strong> Ако използвате Chrome и имате проблеми,<br>
                    опитайте в <strong>Safari</strong> - работи по-добре с GPS на iPhone
                </div>
            </div>`;
    } else {
        instructionsHTML = `
            <h2 style="margin-bottom: 20px; color: #333;">Как да разрешите локация</h2>
            <div style="text-align: left; margin-bottom: 20px; line-height: 1.6;">
                <strong>За Chrome на iPhone:</strong><br>
                1. Отворете Настройки на iPhone<br>
                2. Превъртете до Chrome<br>
                3. Кликнете на Локация<br>
                4. Изберете "Докато използвате приложението"<br>
                5. Презаредете страницата<br><br>
                
                <strong>Алтернатива:</strong><br>
                Опитайте в Safari - обикновено работи по-добре с GPS
            </div>`;
    }
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 450px; text-align: center; max-height: 90vh; overflow-y: auto;">
            ${instructionsHTML}
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #1976D2; color: white; border: none; padding: 12px 24px; 
                           border-radius: 6px; font-size: 16px; cursor: pointer;">
                Разбрах
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}


// Pause/Resume functionality
function togglePause() {
    isPaused = !isPaused;
    
    const pauseBtn = document.getElementById('pause-btn');
    const pauseIcon = document.getElementById('pause-icon');
    const pauseText = document.getElementById('pause-text');
    
    if (isPaused) {
        pauseIcon.textContent = '▶️';
        pauseText.textContent = 'Продължи';
        pauseBtn.classList.add('resumed');
        showMessage('⏸️ Проследяването е на пауза', 'info');
        
        // Change user marker color to indicate pause
        if (userMarker) {
            userMarker.setStyle({ fillColor: '#FF9800' });
        }
    } else {
        pauseIcon.textContent = '⏸️';
        pauseText.textContent = 'Пауза';
        pauseBtn.classList.remove('resumed');
        showMessage('▶️ Проследяването продължава', 'success');
        
        // Restore user marker color
        if (userMarker) {
            userMarker.setStyle({ fillColor: '#1976D2' });
        }
    }
    
    // Save session state
    if (sessionId) {
        saveSession();
    }
}

// Center on location function
function centerOnLocation() {
    if (userMarker && map) {
        const latlng = userMarker.getLatLng();
        map.setView(latlng, 15, {
            animate: true,
            duration: 0.5
        });
        
        // Visual feedback
        if (userMarker) {
            const originalRadius = 10;
            userMarker.setStyle({ radius: 15 });
            setTimeout(() => {
                userMarker.setStyle({ radius: originalRadius });
            }, 300);
        }
    } else {
        showMessage('Няма налична локация', 'warning');
    }
}

// Bug report functions
function toggleBugReport() {
    const modal = document.getElementById('bug-report-modal');
    modal.style.display = 'flex';
    document.getElementById('bug-description').focus();
}

function closeBugReport() {
    const modal = document.getElementById('bug-report-modal');
    modal.style.display = 'none';
    document.getElementById('bug-description').value = '';
}

function sendBugReport() {
    const description = document.getElementById('bug-description').value.trim();
    
    if (!description) {
        alert('Моля, опишете проблема преди да изпратите.');
        return;
    }
    
    // Gather additional info for context
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    const timestamp = new Date().toLocaleString('bg-BG');
    const isTracking = activeZone ? 'Да' : 'Не';
    const currentZone = activeZone ? activeZone.name : 'Няма активна зона';
    
    // Prepare WhatsApp message
    const whatsappMessage = `🐛 БЪГ ДОКЛАД - Sredna Skorost BG

📝 ПРОБЛЕМ:
${description}

ℹ️ ТЕХНИЧЕСКА ИНФОРМАЦИЯ:
• Дата: ${timestamp}
• URL: ${url}
• Активно проследяване: ${isTracking}
• Текуща зона: ${currentZone}
• Устройство: ${userAgent}

---
Изпратено от web приложението`;
    
    // WhatsApp Web API URL
    const phoneNumber = '491773727379';
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Close modal and show confirmation
    closeBugReport();
    showMessage('💬 WhatsApp отворен за изпращане на доклада', 'success');
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('bug-report-modal');
    if (e.target === modal) {
        closeBugReport();
    }
});

// Session history functions
function showSessionHistory() {
    const sessions = getSavedSessions();
    const modal = document.getElementById('session-modal');
    const sessionList = document.getElementById('session-list');
    
    if (sessions.length === 0) {
        sessionList.innerHTML = '<p style="text-align: center; color: #666;">Няма запазени сесии</p>';
    } else {
        sessionList.innerHTML = sessions.map(session => `
            <div class="session-item">
                <div class="session-info">
                    <h4>${session.zoneName}</h4>
                    <p>${session.timestamp.toLocaleDateString('bg-BG')} ${session.timestamp.toLocaleTimeString('bg-BG')}</p>
                    <p>Разстояние: ${session.distance}</p>
                </div>
                <div class="session-actions">
                    <button class="resume-btn" onclick="resumeSession('${session.id}')">Продължи</button>
                    <button class="delete-btn" onclick="deleteSession('${session.id}')">Изтрий</button>
                </div>
            </div>
        `).join('');
    }
    
    modal.style.display = 'flex';
}

function closeSessionModal() {
    document.getElementById('session-modal').style.display = 'none';
}

function resumeSession(sessionId) {
    if (isTracking) {
        if (!confirm('Това ще спре текущата сесия. Продължавате?')) {
            return;
        }
        stopTracking();
    }
    
    if (loadSession(sessionId)) {
        showMessage('📂 Сесия възстановена', 'success');
        closeSessionModal();
        
        // Start tracking with restored session
        startTracking();
    } else {
        showMessage('❌ Грешка при зареждане на сесията', 'error');
    }
}

function deleteSession(sessionId) {
    if (confirm('Сигурни ли сте, че искате да изтриете тази сесия?')) {
        localStorage.removeItem(`driving_session_${sessionId}`);
        showMessage('🗑️ Сесия изтрита', 'info');
        showSessionHistory(); // Refresh the list
    }
}

// Update auto-guidance panel
function updateAutoGuidancePanel(targetSpeed, isAutomatic = false) {
    const targetSpeedElement = document.getElementById('auto-target-speed');
    const statusElement = document.getElementById('auto-guidance-status');
    const reasonElement = document.getElementById('auto-target-reason');
    
    // Update target speed
    targetSpeedElement.textContent = `${targetSpeed.toFixed(0)} км/ч`;
    
    // Update reason with current zone's speed limit
    const zoneLimit = activeZone ? activeZone.maxSpeed : 140;
    reasonElement.textContent = `за да постигнете законна средна скорост ${zoneLimit} км/ч`;
    
    // Update status based on type
    if (isAutomatic) {
        statusElement.textContent = 'Активно';
        statusElement.className = 'auto-guidance-status active';
    } else {
        statusElement.textContent = '🎯 Ръчно активирано';
        statusElement.className = 'auto-guidance-status';
    }
}

// Reset auto-guidance status without hiding panel
function resetAutoGuidanceStatus() {
    const statusElement = document.getElementById('auto-guidance-status');
    const targetSpeedElement = document.getElementById('auto-target-speed');
    
    statusElement.textContent = 'Изчакване за активиране';
    statusElement.className = 'auto-guidance-status';
    targetSpeedElement.textContent = '--';
}



// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeZones(); // Initialize bidirectional zones
    initMap();
});