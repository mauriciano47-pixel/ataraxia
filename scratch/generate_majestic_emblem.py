from PIL import Image, ImageDraw, ImageFilter
import os

source_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787289036700.jpg"
target_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images"
brain_dir = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788"

img = Image.open(source_path).convert("RGBA")
w, h = img.size

# En media_1787289036700.jpg:
# El medallón radiante de la derecha está entre x: 700 a 960 (ancho 260) y y: 65 a 495 (alto 430)
# El centro del medallón circular está en x=830, y=280
# El rayo sobresale arriba a la derecha y abajo a la izquierda

# Recorte cuadrado exacto centrado en el medallón y rayo
cx, cy = 830, 280
half_size = 215 # Tamaño total 430x430 para capturar todo el rayo y las puntas

box = (cx - half_size, cy - half_size, cx + half_size, cy + half_size)
cropped = img.crop(box)

# Redimensionar a 1024x1024 con Lanczos
target_size = 1024
emblem_1024 = cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)

# Máscara circular / elíptica suave que respeta las puntas del rayo que sobresalen
mask = Image.new("L", (target_size, target_size), 0)
draw = ImageDraw.Draw(mask)

# Relleno del círculo central
ccx, ccy = target_size // 2, target_size // 2
for r in range(490, 0, -1):
    if r <= 420:
        alpha = 255
    else:
        alpha = int(255 * ((490 - r) / 70) ** 1.3)
    draw.ellipse([ccx - r, ccy - r, ccx + r, ccy + r], fill=alpha)

mask = mask.filter(ImageFilter.GaussianBlur(radius=6))

# Unir con canal alfa
r, g, b, _ = emblem_1024.split()
final_emblem = Image.merge("RGBA", (r, g, b, mask))

out_png = os.path.join(target_dir, "zeus_master_emblem_transparent.png")
final_emblem.save(out_png, "PNG")
final_emblem.save(os.path.join(brain_dir, "zeus_master_emblem_transparent.png"), "PNG")
final_emblem.save(os.path.join(target_dir, "gods_lightning_master.png"), "PNG")

print("Majestic tight-cropped Zeus medallion with full proportions saved!")
