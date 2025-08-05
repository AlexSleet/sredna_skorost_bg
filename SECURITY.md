# Security Guidelines for Sredna Skorost BG

## 🔒 Personal Data Protection

This is an open-source project. To protect personal data:

### Developers
- **Apple Developer Team ID**: Set your own team ID in Xcode locally, not in version control
- **Git Configuration**: Use proper git config with public email addresses
- **Build Artifacts**: Never commit build files or certificates

### User Data
- **No Analytics**: The app doesn't collect any analytics or telemetry
- **Local Storage Only**: All user data stays on the device
- **No Network Calls**: App works completely offline
- **No Personal Information**: GPS coordinates are processed locally only

## 🚫 What NOT to Commit

- Apple Developer Team IDs or certificates
- Android signing keys or passwords
- Personal file paths or machine names
- Build artifacts or generated files
- SSL certificates or private keys
- Local configuration files

## ✅ Safe Development Setup

1. **Configure Git Identity** (use public email):
   ```bash
   git config user.name "Your Name"
   git config user.email "your.public@email.com"
   ```

2. **Set iOS Development Team** in Xcode:
   - Open ios/Runner.xcodeproj in Xcode
   - Select Runner target → Signing & Capabilities
   - Set your own Team ID (not committed to repo)

3. **Use .gitignore**:
   - Build files are automatically ignored
   - Personal data files are ignored
   - Only source code is committed

## 🛡️ Privacy by Design

- **No Data Collection**: App doesn't send any data anywhere
- **Local Processing**: All calculations happen on device
- **Anonymous**: No user identification or tracking
- **Transparent**: Open source code is fully auditable

## 📞 Security Contact

For security concerns, please create an issue in the GitHub repository.