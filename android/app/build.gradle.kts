plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "bg.sredna_skorost.app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = "27.0.12077973"  // Required by geolocator_android and shared_preferences_android

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        applicationId = "bg.sredna_skorost.app"
        minSdk = 24  // Required for better location services
        targetSdk = flutter.targetSdkVersion
        versionCode = 1
        versionName = "1.0.0"
        
        // App name and description
        resValue("string", "app_name", "Sredna Skorost BG")
        resValue("string", "app_description", "Bulgarian Highway Speed Monitor")
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}
