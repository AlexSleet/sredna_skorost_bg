# София-Пловдив Highway Sections (A1/E80)

## Current Highway Segments Configuration

The app monitors 8 consecutive highway sections on the A1/E80 from Sofia to Plovdiv:

### 1. Вакарел → Ихтиман
- **Start**: Вакарел (42.5505833, 23.7028611)
- **End**: Ихтиман (42.4270833, 23.8543333)
- **Speed Limit**: 140 km/h

### 2. Ихтиман → Траянови врата  
- **Start**: Ихтиман (42.4270833, 23.8543333)
- **End**: Траянови врата (42.3530000, 23.9227500)
- **Speed Limit**: 140 km/h

### 3. Траянови врата → Динката
- **Start**: Траянови врата (42.3530000, 23.9227500)
- **End**: Динката (42.2580213, 24.2742827)
- **Speed Limit**: 140 km/h

### 4. Динката → Цалапица
- **Start**: Динката (42.2580213, 24.2742827)
- **End**: Цалапица (42.2049167, 24.5083889)
- **Speed Limit**: 140 km/h

### 5. Цалапица → Радиново
- **Start**: Цалапица (42.2049167, 24.5083889)
- **End**: Радиново (42.1983056, 24.6403056)
- **Speed Limit**: 140 km/h

### 6. Радиново → Царацово
- **Start**: Радиново (42.1983056, 24.6403056)
- **End**: Царацово (42.2075000, 24.6877222)
- **Speed Limit**: 140 km/h

### 7. Царацово → Войводиново
- **Start**: Царацово (42.2075000, 24.6877222)  
- **End**: Войводиново (42.2105000, 24.7821111)
- **Speed Limit**: 140 km/h

### 8. Войводиново → Трилистник
- **Start**: Войводиново (42.2105000, 24.7821111)
- **End**: Трилистник (42.2169167, 24.8598889)
- **Speed Limit**: 140 km/h

## How to Update Sections

To modify highway sections, edit the `HIGHWAY_SEGMENTS_CONFIG` array in `app.js`:

```javascript
const HIGHWAY_SEGMENTS_CONFIG = [
    {
        id: 'your-section-id',
        name: 'Start Point - End Point',
        maxSpeed: 140,
        startPoint: { lat: 42.xxxx, lng: 23.xxxx, name: 'Start Point' },
        endPoint: { lat: 42.yyyy, lng: 24.yyyy, name: 'End Point' },
        color: '#FF6B6B'
    },
    // ... more sections
];
```

## Features
- ✅ **Bidirectional detection** - detects both directions on each segment
- ✅ **Real GPS coordinates** - all coordinates from Google Maps links provided
- ✅ **Configurable system** - easy to add/modify sections
- ✅ **Automatic waypoint generation** - creates intermediate points between start/end
- ✅ **Sequential sections** - each section connects to the next