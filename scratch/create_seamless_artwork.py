from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import numpy as np
import os

source_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787289036700.jpg"
target_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images"
brain_dir = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788"

img = Image.open(source_path)

# Recorte preciso del contenido interior
# x: 390 a 634 (244px), y: 80 a 522 (442px)
inner_crop = img.crop((390, 82, 634, 522))

# Redimensionar a alta resolución 1080 x 1920
target_w, target_h = 1080, 1920
resized = inner_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
resized = ImageEnhance.Sharpness(resized).enhance(1.15)
resized = resized.convert("RGBA")

# Crear una máscara de degradado suave (Vignette) para desvanecer completamente los 4 bordes a negro puro
mask = Image.new("L", (target_w, target_h), 255)
draw = ImageDraw.Draw(mask)

# Márgenes de desvanecimiento suave (feathering) en píxeles
feather_x = 90
feather_y = 120

# Crear gradiente horizontal suave en bordes izquierdo y derecho
for x in range(feather_x):
    alpha = int(255 * (x / feather_x) ** 1.8)
    draw.line([(x, 0), (x, target_h)], fill=alpha)
    draw.line([(target_w - 1 - x, 0), (target_w - 1 - x, target_h)], fill=alpha)

# Aplicar desenfoque gaussiano a la máscara para que la transición sea 100% sedosa e imperceptible
mask = mask.filter(ImageFilter.GaussianBlur(radius=40))

# Crear lienzo negro OLED puro
final_canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 255))
# Pegar la imagen con la máscara de desvanecimiento
final_canvas.paste(resized, (0, 0), mask)

# Guardar en formato PNG y JPG de máxima fidelidad
seamless_png = os.path.join(target_dir, "zeus_canon_splash.png")
seamless_jpg = os.path.join(target_dir, "zeus_canon_splash.jpg")

final_canvas.save(seamless_png, "PNG")
final_canvas.convert("RGB").save(seamless_jpg, "JPEG", quality=98)

final_canvas.save(os.path.join(brain_dir, "zeus_canon_splash.png"), "PNG")
final_canvas.convert("RGB").save(os.path.join(brain_dir, "zeus_canon_splash.jpg"), "JPEG", quality=98)

print("Seamless edge feathered master artwork created successfully!")
