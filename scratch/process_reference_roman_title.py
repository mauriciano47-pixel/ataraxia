import os
from PIL import Image, ImageEnhance, ImageFilter

base_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia"
assets_dir = os.path.join(base_dir, "assets", "images")
public_dir = os.path.join(base_dir, "public")
src_img_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787954528352.png"

# Cargar imagen de referencia del usuario
img = Image.open(src_img_path).convert("RGBA")
w, h = img.size

# Recorte exacto de la palabra ATARAXIA
# y de 25 a 155 en escala original
crop_box = (int(w * 0.05), int(h * 0.035), int(w * 0.95), int(h * 0.195))
title_cropped = img.crop(crop_box)

# Escalar a alta resolución (1400x340 px) con Lanczos
target_w = 1400
target_h = int(title_cropped.height * (target_w / title_cropped.width))
hd_title = title_cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
hd_title = ImageEnhance.Sharpness(hd_title).enhance(1.25)

# Crear versión con fondo transparente limpio para integración OLED perfecta
data = hd_title.getdata()
clean_data = []

for item in data:
    r, g, b, a = item
    # Brillo
    luminance = (r * 0.299 + g * 0.587 + b * 0.114)
    if luminance < 14:
        clean_data.append((0, 0, 0, 0))
    elif luminance < 45:
        # Suavizado de bordes anti-aliasing
        alpha = int(((luminance - 14) / 31) * 255)
        clean_data.append((r, g, b, alpha))
    else:
        clean_data.append((r, g, b, 255))

transparent_title = Image.new("RGBA", hd_title.size)
transparent_title.putdata(clean_data)

# Guardar en assets y public
transparent_title.save(os.path.join(assets_dir, "ataraxia_gold_title_banner.png"), "PNG")
transparent_title.save(os.path.join(public_dir, "ataraxia_gold_title_banner.png"), "PNG")
transparent_title.save(os.path.join(assets_dir, "ataraxia_chiseled_roman_title.png"), "PNG")
transparent_title.save(os.path.join(public_dir, "ataraxia_chiseled_roman_title.png"), "PNG")

# También guardar versión original con fondo negro
hd_title.save(os.path.join(assets_dir, "ataraxia_title_reference_hd.png"), "PNG")
hd_title.save(os.path.join(public_dir, "ataraxia_title_reference_hd.png"), "PNG")

print("Canonical Roman Gold ATARAXIA title extracted, upscaled, and saved to assets & public!")
