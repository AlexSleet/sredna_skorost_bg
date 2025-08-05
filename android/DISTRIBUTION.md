# Android APK Distribution Guide

Quick guide for distributing the Sredna Skorost BG Android app.

## 🚀 Quick Build & Distribute

### 1. Build APK
```bash
# From project root
./android/build_android.sh
```

### 2. Share APK
The release APK will be at: `build/app/outputs/flutter-apk/app-release.apk`

**File size**: ~15-25 MB (typical for Flutter apps)

## 📤 Distribution Methods

### Method 1: Direct File Sharing
- Share APK file via email, cloud storage, or file transfer
- Recipients need to enable "Install unknown apps"
- Best for: Beta testing, friends & family

### Method 2: Web Download
1. Upload APK to your web server
2. Share download link
3. Add installation instructions

### Method 3: QR Code Distribution
```bash
# Generate QR code for download URL
qrencode -o apk-download.png "https://yoursite.com/app-release.apk"
```

## 📱 Installation Instructions for Users

### Android Installation Steps:
1. **Download** the APK file to your Android device
2. **Enable Unknown Sources**:
   - Android 8+: Settings → Apps → Special access → Install unknown apps → Select browser/file manager → Allow
   - Android 7 and below: Settings → Security → Unknown sources → Enable
3. **Install**:
   - Open file manager and tap the downloaded APK
   - Follow installation prompts
   - Grant location permissions when asked

### First Launch:
1. Open "Sredna Skorost BG" app
2. Grant location permissions (tap "Allow all the time")
3. Wait for GPS signal to stabilize
4. Tap "Старт" to begin monitoring

## ⚠️ User Safety Notes

**Include these warnings with distribution:**

- This app helps maintain legal speeds but cannot guarantee accuracy
- Always follow traffic laws and drive safely
- GPS signals can be affected by weather, tunnels, or device limitations
- The driver is solely responsible for following traffic laws

## 🔧 Troubleshooting for Users

### "App won't install"
- Enable "Install unknown apps" in Android settings
- Check available storage space (need ~50MB free)
- Try downloading APK again

### "Location not working"
- Grant location permissions in app settings
- Enable location services on device
- Ensure GPS is enabled
- Try restarting the device

### "App keeps stopping"
- Clear app data: Settings → Apps → Sredna Skorost BG → Storage → Clear Data
- Restart device
- Reinstall app

## 📊 Distribution Analytics

Track distribution success:
- APK download counts
- User feedback and reviews
- Installation success rates
- Common support requests

## 🔄 Updates

For app updates:
1. Build new version with incremented version code
2. Distribute new APK using same methods
3. Users can install over existing version
4. Previous settings and data will be preserved

---

**Happy distributing! 📱**