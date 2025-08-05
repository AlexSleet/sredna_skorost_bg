# App Icon Instructions

## Creating the Correct Bulgarian Flag Icon

The app icon should have a speedometer on a background with the Bulgarian flag colors in the **correct order**:

### Bulgarian Flag Colors (Top to Bottom):
1. **White** (Top) - #FFFFFF
2. **Green** (Middle) - #00966E  
3. **Red** (Bottom) - #D62612

### Current Issue:
The current icon has the colors reversed (red on top, green on bottom).

### To Fix:

1. **Create a 1024x1024 PNG** with:
   - Background split into three horizontal bands:
     - Top third: White (#FFFFFF)
     - Middle third: Green (#00966E)
     - Bottom third: Red (#D62612)
   - Speedometer graphic centered on top
   - No transparency
   - No rounded corners (iOS adds them)

2. **Save as**: `assets/icon/app_icon.png`

3. **Generate all sizes**:
   ```bash
   flutter pub get
   flutter pub run flutter_launcher_icons
   ```

### Design Tips:
- Keep the speedometer design simple and bold
- Ensure good contrast against all three background colors
- The speedometer needle should be clearly visible
- Consider adding a subtle shadow or outline to the speedometer

### Alternative Tools:
If you prefer to create the icon manually:
- Use [App Icon Generator](https://www.appicon.co/)
- Upload your 1024x1024 PNG
- Download and replace files in:
  - iOS: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`
  - Android: `android/app/src/main/res/mipmap-*/`