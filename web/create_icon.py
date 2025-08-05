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
    
    # Background - Bulgarian flag colors gradient
    # Top red section
    draw.rectangle([0, 0, base_size, base_size//3], fill=(214, 0, 0))
    # Middle green section  
    draw.rectangle([0, base_size//3, base_size, 2*base_size//3], fill=(0, 150, 57))
    # Bottom white section
    draw.rectangle([0, 2*base_size//3, base_size, base_size], fill=(255, 255, 255))
    
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
    icon_dir = "ios/Runner/Assets.xcassets/AppIcon.appiconset"
    
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