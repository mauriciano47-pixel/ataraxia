from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

source_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787289036700.jpg"
target_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images"
brain_dir = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788"

img = Image.open(source_path).convert("RGBA")
w, h = img.size

# Extraemos el medallón radiante con el rayo y chispas (lado derecho o centro)
# En el lado derecho (x: 685 a 975, y: 55 a 505) el medallón está flotando en fondo oscuro
emblem_crop = img.crop((685, 55, 975, 505))
ew, eh = emblem_crop.size

# Redimensionar a alta resolución 800x800
emblem_hq = emblem_crop.resize((800, 800), Image.Resampling.LANCZOS)
ew, eh = 800, 800

# Creamos una máscara circular suave para eliminar completamente cualquier borde cuadrado
# Centro del medallón en (400, 400), radio del disco principal aprox 320px
mask = Image.new("L", (ew, eh), 0)
draw = ImageDraw.Draw(mask)

# Círculo base con borde suave para las chispas exteriores
# Dibujamos un degradado radial desde el centro
center_x, center_y = ew // 2, eh // 2
for r in range(390, 0, -1):
    if r <= 330:
        alpha = 255
    else:
        # Transición suave de 330 a 390 a 0 alfa
        alpha = int(255 * ((390 - r) / 60) ** 1.5)
    draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=alpha)

# Suavizado gaussiano de la máscara para bordes 100% anti-aliased
mask = mask.filter(ImageFilter.GaussianBlur(radius=8))

# Aplicar la máscara alfa al medallón
r, g, b, _ = emblem_hq.split()
transparent_emblem = Image.merge("RGBA", (r, g, b, mask))

# Guardar
out_png = os.path.join(target_dir, "zeus_master_emblem_transparent.png")
transparent_emblem.save(out_png, "PNG")
transparent_emblem.save(os.path.join(brain_dir, "zeus_master_emblem_transparent.png"), "PNG")

# También guardamos copia como gods_lightning_master.png para compatibilidad
transparent_emblem.save(os.path.join(target_dir, "gods_lightning_master.png"), "PNG")
transparent_emblem.save(os.path.join(brain_dir, "gods_lightning_master.png"), "PNG")

print(f"SUCCESS: Saved transparent circular master emblem to {out_png}")
