# Android Development Guide - Sredna Skorost BG

This guide provides comprehensive instructions for building and distributing the Sredna Skorost BG Android app.

## 📱 Android App Overview

The Android version of Sredna Skorost BG provides the same functionality as the iOS version:
- Real-time GPS speed monitoring
- Highway zone detection with bidirectional support
- Automatic session tracking and persistence
- Offline map support
- Speed guidance and violation warnings

**App Details:**
- **Package Name**: `bg.sredna_skorost.app`
- **Minimum SDK**: Android 7.0 (API level 24)
- **Target SDK**: Latest Android version
- **Permissions**: Location (fine, coarse, background), Internet, Wake Lock

## 🛠️ Development Environment Setup

### 1. Install Required Software

#### Android Studio (Recommended)
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Launch Android Studio and complete the initial setup wizard
4. Install Android SDK components when prompted

#### Command Line Tools (Alternative)
```bash
# macOS with Homebrew
brew install android-studio

# Or install command line tools only
brew install android-commandlinetools
```

### 2. Configure Android SDK

1. **Set ANDROID_HOME Environment Variable**:
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
   ```

2. **Verify Installation**:
   ```bash
   flutter doctor
   ```
   
   Should show ✅ for "Android toolchain"

3. **Accept Licenses**:
   ```bash
   flutter doctor --android-licenses
   ```

### 3. Configure Device/Emulator

#### Physical Device (Recommended)
1. Enable **Developer Options** on your Android device:
   - Go to Settings → About phone
   - Tap "Build number" 7 times
   
2. Enable **USB Debugging**:
   - Settings → Developer options → USB debugging

3. Connect device and verify:
   ```bash
   adb devices
   ```

#### Android Emulator
1. Open Android Studio
2. Go to Tools → AVD Manager
3. Create a new Virtual Device
4. Choose a recent Android version (API 24+)
5. Start the emulator

## 🔧 Building the Android App

### Quick Build (Recommended)

Use the provided build script:
```bash
# From project root directory
./android/build_android.sh
```

This script will:
- Clean previous builds
- Install dependencies
- Build both debug and release APKs
- Show file locations and sizes

### Manual Build Process

1. **Install Dependencies**:
   ```bash
   flutter pub get
   ```

2. **Build Debug APK**:
   ```bash
   flutter build apk --debug
   ```
   Output: `build/app/outputs/flutter-apk/app-debug.apk`

3. **Build Release APK**:
   ```bash
   flutter build apk --release
   ```
   Output: `build/app/outputs/flutter-apk/app-release.apk`

4. **Build App Bundle (for Play Store)**:
   ```bash
   flutter build appbundle --release
   ```
   Output: `build/app/outputs/bundle/release/app-release.aab`

## 📦 APK Installation & Distribution

### Installing APK on Device

#### Via ADB (Command Line)
```bash
# Install debug APK
adb install build/app/outputs/flutter-apk/app-debug.apk

# Install release APK
adb install build/app/outputs/flutter-apk/app-release.apk

# Reinstall (if already installed)
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

#### Via File Transfer
1. Copy APK file to device storage
2. Open file manager on device
3. Tap APK file and install
4. Enable "Install unknown apps" if prompted

### Distribution Methods

#### 1. Direct APK Distribution
- **Pros**: Simple, no store approval needed
- **Cons**: Users must enable "Unknown sources"
- **Use cases**: Beta testing, internal distribution

#### 2. Google Play Store
- **Pros**: Wide reach, automatic updates, trusted source
- **Cons**: Requires developer account ($25), review process
- **Process**: Upload App Bundle (.aab file)

#### 3. Alternative App Stores
- **F-Droid**: For open-source apps
- **Amazon Appstore**: Alternative distribution
- **Samsung Galaxy Store**: Samsung device focus

## 🔐 App Signing & Release Configuration

### Debug Signing (Development)
The app is automatically signed with debug keys for development and testing.

### Release Signing (Production)

#### 1. Generate Signing Key
```bash
keytool -genkey -v -keystore ~/sredna-skorost-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sredna-skorost
```

#### 2. Configure Gradle Signing
Create `android/key.properties`:
```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=sredna-skorost
storeFile=/path/to/sredna-skorost-key.jks
```

#### 3. Update build.gradle.kts
Add signing configuration to `android/app/build.gradle.kts`:
```kotlin
android {
    signingConfigs {
        release {
            keyAlias = keystoreProperties['keyAlias']
            keyPassword = keystoreProperties['keyPassword']
            storeFile = file(keystoreProperties['storeFile'])
            storePassword = keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

## 🐛 Android-Specific Troubleshooting

### Build Issues

#### "Android SDK not found"
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"

# Verify with flutter doctor
flutter doctor
```

#### "Gradle build failed"
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter build apk --debug
```

#### "License not accepted"
```bash
flutter doctor --android-licenses
# Accept all licenses by typing 'y'
```

### Runtime Issues

#### "Location permissions denied"
1. Open device Settings → Apps → Sredna Skorost BG → Permissions
2. Enable Location permissions (Allow all the time)
3. Restart the app

#### "App not installing"
1. Enable "Install unknown apps" in Android settings
2. Check device storage space
3. Try installing via ADB: `adb install -f app-release.apk`

#### "GPS not working"
1. Ensure location services are enabled on device
2. Check app has location permissions
3. Test GPS with other apps to verify hardware
4. Try restarting the device

### Development Issues

#### "Device not detected"
```bash
# Check ADB connection
adb devices

# If no devices listed:
adb kill-server
adb start-server

# Enable USB debugging on device
```

#### "Build tools version errors"
1. Open Android Studio
2. Go to SDK Manager
3. Update Android SDK Build-Tools to latest version
4. Accept any license agreements

## 📊 Performance Optimization

### APK Size Optimization
```bash
# Build optimized APK with app bundle
flutter build appbundle --release

# Split APKs by architecture
flutter build apk --release --split-per-abi
```

### Battery Optimization
- The app is configured to handle Android's battery optimization
- Users may need to disable battery optimization for background GPS tracking
- Settings → Battery → Battery optimization → Sredna Skorost BG → Don't optimize

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Build Android APK
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-java@v1
      with:
        java-version: '11'
    - uses: subosito/flutter-action@v1
      with:
        flutter-version: '3.32.8'
    - run: flutter pub get
    - run: flutter build apk --release
    - uses: actions/upload-artifact@v2
      with:
        name: release-apk
        path: build/app/outputs/flutter-apk/app-release.apk
```

## 📈 Play Store Distribution

### Preparing for Play Store

1. **Create Developer Account**:
   - Visit: https://play.google.com/console
   - Pay $25 registration fee
   - Complete account verification

2. **Prepare Store Listing**:
   - App name: "Sredna Skorost BG"
   - Short description: "Bulgarian Highway Speed Monitor"
   - Full description: Include features and benefits
   - Screenshots: Use the same as GitHub repository
   - App icon: High-resolution PNG (512x512)

3. **Upload App Bundle**:
   ```bash
   flutter build appbundle --release
   ```
   Upload `build/app/outputs/bundle/release/app-release.aab`

4. **Configure Release**:
   - Select countries: Bulgaria (and others as desired)
   - Content rating: Complete questionnaire
   - Pricing: Free (or paid)

### Play Store Guidelines Compliance

- **Location permissions**: Clearly explain GPS usage
- **Privacy policy**: Required for location-based apps
- **Target API level**: Keep updated with Play Store requirements
- **App content**: Ensure compliance with driving/navigation app policies

## 🆘 Getting Help

For Android-specific issues:

1. **Check Flutter Documentation**: https://flutter.dev/docs/deployment/android
2. **Android Developer Guides**: https://developer.android.com/guide
3. **Stack Overflow**: Tag questions with `flutter`, `android`, `dart`
4. **Project Issues**: https://github.com/Stamenov/sredna_skorost_bg/issues

### Useful Commands

```bash
# Check Flutter configuration
flutter doctor -v

# List connected devices
flutter devices

# Run with verbose logging
flutter run -v

# Check app logs
adb logcat | grep flutter

# Clear app data
adb shell pm clear bg.sredna_skorost.app
```

---

## 📄 License & Legal

This Android app is part of the Sredna Skorost BG project and is licensed under the MIT License. 

**Legal Disclaimer**: This application is a tool to help drivers maintain legal speeds. Always follow traffic laws and drive safely. The app cannot guarantee accuracy in all situations.

**Drive safely! 🇧🇬🚗**