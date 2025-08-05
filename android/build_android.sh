#!/bin/bash

# Sredna Skorost BG - Android Build Script
# This script builds the Android APK for distribution

echo "🤖 Building Sredna Skorost BG for Android..."
echo "======================================================="

# Check if we're in the correct directory
if [ ! -f "pubspec.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Android SDK is available
if ! command -v flutter &> /dev/null; then
    echo "❌ Error: Flutter is not installed or not in PATH"
    echo "   Install Flutter from: https://flutter.dev/docs/get-started/install"
    exit 1
fi

# Check Flutter doctor for Android support
echo "🔍 Checking Flutter configuration..."
flutter doctor | grep -q "Android toolchain"
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Android toolchain not detected"
    echo "   Please install Android Studio and Android SDK"
    echo "   Run 'flutter doctor' for detailed setup instructions"
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Build debug APK
echo "🔨 Building debug APK..."
flutter build apk --debug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📁 Location: build/app/outputs/flutter-apk/app-debug.apk"
    echo ""
    echo "🚀 To install on device:"
    echo "   adb install build/app/outputs/flutter-apk/app-debug.apk"
    echo ""
else
    echo "❌ Debug build failed. Check errors above."
    exit 1
fi

# Build release APK
echo "🔨 Building release APK..."
flutter build apk --release

if [ $? -eq 0 ]; then
    echo "✅ Release APK built successfully!"
    echo "📁 Location: build/app/outputs/flutter-apk/app-release.apk"
    echo ""
    echo "📱 Ready for distribution!"
    echo "   File size: $(du -h build/app/outputs/flutter-apk/app-release.apk | cut -f1)"
    echo ""
    echo "🔐 Note: This APK is signed with debug keys."
    echo "   For Play Store distribution, you'll need to configure release signing."
else
    echo "❌ Release build failed. Check errors above."
    exit 1
fi

echo "======================================================="
echo "🎉 Android build process completed!"