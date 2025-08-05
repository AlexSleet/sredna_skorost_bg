# Sredna Skorost BG - Distribution Guide

## TestFlight Setup (Recommended)

### Prerequisites:
- Apple Developer Account ($99/year)
- App Store Connect access

### Step 1: Prepare for Distribution
```bash
# Clean build
flutter clean
flutter pub get

# Build release IPA
flutter build ipa
```

### Step 2: Upload to App Store Connect
1. Open Xcode
2. Window → Organizer
3. Select your archive
4. Click "Distribute App"
5. Choose "App Store Connect"
6. Upload

### Step 3: Configure in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. My Apps → Sredna Skorost BG
3. TestFlight tab
4. Add test information

### Step 4: Add Testers
1. Internal Testing (up to 100 testers)
   - Add by Apple ID email
   - Immediate access

2. External Testing (up to 10,000)
   - Requires brief review
   - Add by email
   - Create groups

### Step 5: Testers Install
1. Download TestFlight from App Store
2. Accept email invitation
3. Install Sredna Skorost BG

## Ad Hoc Distribution (Alternative)

### For Small Groups Without TestFlight:

1. **Collect Device UDIDs**
   - Settings → General → About → UDID
   - Or use Apple Configurator 2

2. **Create Provisioning Profile**
   - Apple Developer Portal
   - Certificates, IDs & Profiles
   - Add devices
   - Create Ad Hoc profile

3. **Build IPA**
   ```bash
   flutter build ipa --export-options-plist=ExportOptions.plist
   ```

4. **Distribute IPA**
   - Use services like Diawi.com
   - Or host on your server
   - Send install link to testers

## Direct Installation (Development)

### For Individual Devices:
```bash
# Connect device via cable
# Trust computer on device

# List devices
flutter devices

# Install directly
flutter install --device-id [DEVICE_ID]
```

### Limitations:
- Max 100 devices per year
- Devices must be registered
- Provisioning profile expires yearly

## Important Notes:
- TestFlight builds expire after 90 days
- Ad Hoc builds expire with provisioning profile
- Always test on real devices before distribution
- Keep track of device UDIDs for Ad Hoc

## Support:
For issues, contact: [your-email@example.com]