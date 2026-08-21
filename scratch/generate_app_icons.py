import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# Rutas
base_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia"
assets_dir = os.path.join(base_dir, "assets", "images")
public_dir = os.path.join(base_dir, "public")
emblem_path = os.path.join(assets_dir, "zeus_master_emblem_transparent.png")

# Cargar el emblema maestro de Zeus
emblem = Image.open(emblem_path).convert("RGBA")

# 1. GENERAR ICONO MAESTRO 1024x1024 (iOS / App Stores / PWA)
# Fondo negro OLED con degradado radial dorado y el medallón de Zeus centrado majestuosamente
icon_size = 1024
master_icon = Image.new("RGBA", (icon_size, icon_size), (4, 4, 6, 255))
draw = ImageDraw.Draw(master_icon)

# Crear resplandor radial cálido de fondo
cx, cy = icon_size // 2, icon_size // 2
for r in range(480, 0, -2):
    alpha = int(35 * ((480 - r) / 480) ** 2)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 226, 89, alpha))

# Redimensionar el medallón de Zeus para ocupar el 80% del icono (820px) con márgenes sagrados
emblem_resized = emblem.resize((820, 820), Image.Resampling.LANCZOS)
emblem_resized = ImageEnhance.Sharpness(emblem_resized).enhance(1.15)

# Pegar centrado
offset_x = (icon_size - 820) // 2
offset_y = (icon_size - 820) // 2
master_icon.paste(emblem_resized, (offset_x, offset_y), emblem_resized)

# Guardar icon.png y splash-icon.png
master_icon.save(os.path.join(assets_dir, "icon.png"), "PNG")
master_icon.save(os.path.join(assets_dir, "splash-icon.png"), "PNG")
master_icon.save(os.path.join(public_dir, "icon.png"), "PNG")

# 2. GENERAR ANDROID ADAPTIVE FOREGROUND (1024x1024 con canal alfa transparente, ocupa zona segura central de 620px)
android_fg = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
fg_emblem = emblem.resize((660, 660), Image.Resampling.LANCZOS)
fg_offset = (icon_size - 660) // 2
android_fg.paste(fg_emblem, (fg_offset, fg_offset), fg_emblem)
android_fg.save(os.path.join(assets_dir, "android-icon-foreground.png"), "PNG")

# 3. GENERAR ANDROID ADAPTIVE BACKGROUND (1024x1024 fondo OLED con aurora dorada)
android_bg = Image.new("RGBA", (icon_size, icon_size), (5, 5, 7, 255))
bg_draw = ImageDraw.Draw(android_bg)
for r in range(512, 0, -2):
    alpha = int(40 * ((512 - r) / 512) ** 2)
    bg_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 226, 89, alpha))
android_bg.save(os.path.join(assets_dir, "android-icon-background.png"), "PNG")

# 4. GENERAR ANDROID MONOCHROME (Para Android 13+ theming)
mono_img = fg_emblem.convert("L")
mono_final = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
mono_mask = fg_emblem.split()[3]
mono_color = Image.new("RGBA", (660, 660), (255, 255, 255, 255))
mono_final.paste(mono_color, (fg_offset, fg_offset), mono_mask)
mono_final.save(os.path.join(assets_dir, "android-icon-monochrome.png"), "PNG")

# 5. GENERAR FAVICON 512x512 (Para navegadores web, PWA y pestaña de Chrome)
favicon = master_icon.resize((512, 512), Image.Resampling.LANCZOS)
favicon.save(os.path.join(assets_dir, "favicon.png"), "PNG")
favicon.save(os.path.join(public_dir, "favicon.png"), "PNG")

print("All customized Ataraxia app icons generated successfully in 1024x1024 HD!")
