import os
from PIL import Image, ImageEnhance, ImageFilter

base_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia"
assets_dir = os.path.join(base_dir, "assets", "images")
public_dir = os.path.join(base_dir, "public")
zeus_emblem_path = os.path.join(public_dir, "zeus_emblem.png")

# Cargar el logotipo canónico de Ataraxia de Vercel
logo = Image.open(zeus_emblem_path).convert("RGBA")
w, h = logo.size

# 1. ICONO MAESTRO 1024x1024 (iOS, PWA, Mac/PC Shortcut)
# Fondo negro OLED puro (#040406) con el logotipo de Zeus ocupando el 92% para máximo impacto visual
size = 1024
master_icon = Image.new("RGBA", (size, size), (4, 4, 6, 255))
logo_fit = logo.resize((940, 940), Image.Resampling.LANCZOS)
logo_fit = ImageEnhance.Sharpness(logo_fit).enhance(1.2)
offset = (size - 940) // 2
master_icon.paste(logo_fit, (offset, offset), logo_fit)

# Guardar en assets y public
master_icon.save(os.path.join(assets_dir, "icon.png"), "PNG")
master_icon.save(os.path.join(public_dir, "icon.png"), "PNG")
master_icon.save(os.path.join(assets_dir, "splash-icon.png"), "PNG")

# 2. ANDROID ADAPTIVE FOREGROUND (1024x1024 transparente, logotipo en safe zone de 720px)
android_fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
fg_logo = logo.resize((740, 740), Image.Resampling.LANCZOS)
fg_logo = ImageEnhance.Sharpness(fg_logo).enhance(1.2)
fg_offset = (size - 740) // 2
android_fg.paste(fg_logo, (fg_offset, fg_offset), fg_logo)
android_fg.save(os.path.join(assets_dir, "android-icon-foreground.png"), "PNG")

# 3. ANDROID ADAPTIVE BACKGROUND (1024x1024 negro OLED con sutil resplandor)
android_bg = Image.new("RGBA", (size, size), (4, 4, 6, 255))
android_bg.save(os.path.join(assets_dir, "android-icon-background.png"), "PNG")

# 4. FAVICON 512x512 y 192x192 (Pestañas de Chrome, Safari y PWA)
favicon_512 = master_icon.resize((512, 512), Image.Resampling.LANCZOS)
favicon_512 = ImageEnhance.Sharpness(favicon_512).enhance(1.25)
favicon_512.save(os.path.join(assets_dir, "favicon.png"), "PNG")
favicon_512.save(os.path.join(public_dir, "favicon.png"), "PNG")

favicon_192 = master_icon.resize((192, 192), Image.Resampling.LANCZOS)
favicon_192 = ImageEnhance.Sharpness(favicon_192).enhance(1.3)
favicon_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")
favicon_192.save(os.path.join(public_dir, "icon-512.png"), "PNG")

# Apple Touch Icon
apple_icon = master_icon.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon = ImageEnhance.Sharpness(apple_icon).enhance(1.3)
apple_icon.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

print("Icon suite built directly from canonical Vercel Zeus Logo!")
