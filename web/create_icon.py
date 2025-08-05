#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_app_icon():
    # Icon sizes needed for iOS
    sizes = [
        (20, 1), (20, 2), (20, 3),
        (29, 1), (29, 2), (29, 3),
        (40, 1), (40, 2), (40, 3),
        (60, 2), (60, 3),
        (76, 1), (76, 2),
        (83.5, 2),
        (1024, 1)
    ]
    
    # Create base icon design at high resolution
    base_size = 1024
    icon = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(icon)
    
    # Background - Bulgarian flag colors (correct order: white-green-red)
    # Top white section
    draw.rectangle([0, 0, base_size, base_size//3], fill=(255, 255, 255))
    # Middle green section  
    draw.rectangle([0, base_size//3, base_size, 2*base_size//3], fill=(0, 150, 110))
    # Bottom red section
    draw.rectangle([0, 2*base_size//3, base_size, base_size], fill=(214, 38, 18))
    
    # Draw speedometer arc
    center_x = base_size // 2
    center_y = base_size // 2
    radius = int(base_size * 0.35)
    
    # White circle background for speedometer
    draw.ellipse([center_x - radius - 20, center_y - radius - 20, 
                  center_x + radius + 20, center_y + radius + 20], 
                 fill=(255, 255, 255, 240))
    
    # Draw speedometer arc (partial circle)
    draw.arc([center_x - radius, center_y - radius, 
              center_x + radius, center_y + radius], 
             start=135, end=405, fill=(25, 118, 210), width=40)
    
    # Draw speed needle pointing to 140
    import math
    angle = math.radians(315)  # 140 km/h position
    needle_length = radius - 50
    needle_x = center_x + needle_length * math.cos(angle)
    needle_y = center_y + needle_length * math.sin(angle)
    
    draw.line([center_x, center_y, needle_x, needle_y], 
              fill=(255, 0, 0), width=30)
    
    # Draw center dot
    draw.ellipse([center_x - 40, center_y - 40, 
                  center_x + 40, center_y + 40], 
                 fill=(50, 50, 50))
    
    # Add text "140"
    try:
        font_size = int(base_size * 0.15)
        # Use default font if system font not available
        font = ImageFont.load_default()
        
        # Create larger text by drawing multiple times
        text = "140"
        text_x = center_x
        text_y = center_y + radius // 3
        
        # Draw text shadow
        for offset in range(5):
            draw.text((text_x - 80 + offset, text_y + offset), text, 
                     fill=(0, 0, 0, 100), font=font)
        
        # Draw main text
        draw.text((text_x - 80, text_y), text, fill=(25, 118, 210), font=font)
        
    except:
        pass
    
    # Save all icon sizes
    icon_dir = "../ios/Runner/Assets.xcassets/AppIcon.appiconset"
    
    for size, scale in sizes:
        actual_size = int(size * scale)
        resized = icon.resize((actual_size, actual_size), Image.Resampling.LANCZOS)
        
        # Convert to RGB for PNG saving
        rgb_icon = Image.new('RGB', (actual_size, actual_size), (255, 255, 255))
        rgb_icon.paste(resized, mask=resized.split()[3] if len(resized.split()) > 3 else None)
        
        filename = f"Icon-App-{size}x{size}@{scale}x.png"
        if size == 1024:
            filename = "Icon-App-1024x1024@1x.png"
        
        filepath = os.path.join(icon_dir, filename)
        rgb_icon.save(filepath, "PNG")
        print(f"Created {filename}")
    
    # Also create Android icons
    android_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }
    
    for folder, size in android_sizes.items():
        android_dir = f"../android/app/src/main/res/{folder}"
        resized = icon.resize((size, size), Image.Resampling.LANCZOS)
        
        # Convert to RGB for PNG saving
        rgb_icon = Image.new('RGB', (size, size), (255, 255, 255))
        rgb_icon.paste(resized, mask=resized.split()[3] if len(resized.split()) > 3 else None)
        
        filepath = os.path.join(android_dir, "ic_launcher.png")
        rgb_icon.save(filepath, "PNG")
        print(f"Created Android {folder}/ic_launcher.png")
    
    # Create web favicons
    web_sizes = [16, 32, 192, 512]
    web_dir = "../web"
    
    # Create standard favicon sizes
    for size in web_sizes:
        resized = icon.resize((size, size), Image.Resampling.LANCZOS)
        
        # Convert to RGB for PNG saving
        rgb_icon = Image.new('RGB', (size, size), (255, 255, 255))
        rgb_icon.paste(resized, mask=resized.split()[3] if len(resized.split()) > 3 else None)
        
        if size == 16:
            filepath = os.path.join(web_dir, "favicon.ico")
            rgb_icon.save(filepath, "ICO")
            print(f"Created web favicon.ico")
        else:
            filename = f"favicon-{size}x{size}.png"
            if size == 192:
                # Also save as icons/Icon-192.png for Flutter web
                filename = "favicon.png"
            filepath = os.path.join(web_dir, filename)
            rgb_icon.save(filepath, "PNG")
            print(f"Created web {filename}")
    
    # Create Flutter web icons directory if needed
    flutter_web_dir = "../web/icons"
    if not os.path.exists(flutter_web_dir):
        os.makedirs(flutter_web_dir)
    
    # Create Flutter web icons
    flutter_web_sizes = [192, 512]
    for size in flutter_web_sizes:
        resized = icon.resize((size, size), Image.Resampling.LANCZOS)
        rgb_icon = Image.new('RGB', (size, size), (255, 255, 255))
        rgb_icon.paste(resized, mask=resized.split()[3] if len(resized.split()) > 3 else None)
        
        filename = f"Icon-{size}.png"
        filepath = os.path.join(flutter_web_dir, filename)
        rgb_icon.save(filepath, "PNG")
        print(f"Created Flutter web icons/{filename}")

if __name__ == "__main__":
    try:
        from PIL import Image, ImageDraw, ImageFont
        create_app_icon()
        print("App icons created successfully!")
    except ImportError:
        print("Installing Pillow...")
        import subprocess
        subprocess.run(["pip3", "install", "Pillow"])
        from PIL import Image, ImageDraw, ImageFont
        create_app_icon()
        print("App icons created successfully!")