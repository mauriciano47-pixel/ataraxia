import os
from PIL import Image

src_img_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787954528352.png"
base_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia"
assets_dir = os.path.join(base_dir, "assets", "images")
public_dir = os.path.join(base_dir, "public")

img = Image.open(src_img_path).convert("RGBA")
w, h = img.size
print(f"Uploaded image size: {w}x{h}")

# Recortar exactamente la palabra ATARAXIA de la parte superior
# En la imagen, ATARAXIA está en el 0% al 24% superior
crop_box = (int(w * 0.05), int(h * 0.03), int(w * 0.95), int(h * 0.20))
title_cropped = img.crop(crop_box)

title_cropped.save(os.path.join(assets_dir, "ataraxia_master_reference_title.png"), "PNG")
title_cropped.save(os.path.join(public_dir, "ataraxia_master_reference_title.png"), "PNG")

print("Reference title cropped and saved!")
