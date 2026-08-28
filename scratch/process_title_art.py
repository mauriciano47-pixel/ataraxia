import os
from PIL import Image, ImageEnhance, ImageFilter

base_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia"
assets_dir = os.path.join(base_dir, "assets", "images")
public_dir = os.path.join(base_dir, "public")
src_img_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\ataraxia_title_spartan_gold_lightning_1787952523440.jpg"

# 1. Cargar imagen original
img = Image.open(src_img_path).convert("RGBA")
w, h = img.size

# 2. Guardar versión HD completa de fondo y banner
img.save(os.path.join(assets_dir, "ataraxia_title_spartan_gold.png"), "PNG")
img.save(os.path.join(public_dir, "ataraxia_title_spartan_gold.png"), "PNG")

# 3. Recortar la zona central del título con márgenes precisos
# Encuadre central del texto ATARAXIA
crop_box = (int(w * 0.05), int(h * 0.22), int(w * 0.95), int(h * 0.78))
cropped = img.crop(crop_box)
cropped = ImageEnhance.Sharpness(cropped).enhance(1.2)

# Guardar versión banner recortada
cropped.save(os.path.join(assets_dir, "ataraxia_gold_title_banner.png"), "PNG")
cropped.save(os.path.join(public_dir, "ataraxia_gold_title_banner.png"), "PNG")

# 4. Crear versión con máscara alfa para fusión perfecta sobre fondo negro OLED
# Convertir a RGBA con eliminación de negro plano perimetral
data = cropped.getdata()
new_data = []
for item in data:
    r, g, b, a = item
    # Brillo relativo
    brightness = (r * 0.299 + g * 0.587 + b * 0.114)
    if brightness < 8:
        new_data.append((0, 0, 0, 0))
    else:
        # Suavizar bordes
        alpha = min(255, int(brightness * 3.2)) if brightness < 60 else 255
        new_data.append((r, g, b, alpha))

alpha_title = Image.new("RGBA", cropped.size)
alpha_title.putdata(new_data)
alpha_title = alpha_title.filter(ImageFilter.SMOOTH_MORE)
alpha_title.save(os.path.join(assets_dir, "ataraxia_title_isolated.png"), "PNG")
alpha_title.save(os.path.join(public_dir, "ataraxia_title_isolated.png"), "PNG")

print("Spartan Gold Lightning title assets processed and saved successfully!")
