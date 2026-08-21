from PIL import Image
import os

source_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787289036700.jpg"
target_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images"
brain_dir = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788"

img = Image.open(source_path)
width, height = img.size
print(f"Source Image Dimensions: {width} x {height}")

# 1. Recorte de la Pantalla Central del Teléfono (Fondo mármol negro + Medallón 'A' + Rayo Zeus + Título ATARAXIA)
# En la imagen de 1024x576 o similar, localizamos la pantalla del teléfono en el centro
# Estimamos las coordenadas relativas del marco interior de la pantalla del teléfono:
# x: ~37% a 63%, y: ~4% a 95%
crop_phone_box = (int(width * 0.370), int(height * 0.045), int(width * 0.630), int(height * 0.955))
phone_screen = img.crop(crop_phone_box)
phone_screen_path = os.path.join(target_dir, "ataraxia_zeus_master_splash.jpg")
phone_screen.save(phone_screen_path, quality=95)
phone_screen.save(os.path.join(brain_dir, "ataraxia_zeus_master_splash.jpg"), quality=95)
print(f"Saved phone screen: {phone_screen_path} ({phone_screen.size})")

# 2. Recorte del Medallón con Rayo Eléctrico (Versión derecha o central)
# Recorte del medallón central exacto (solo el escudo circular con el rayo y la A):
crop_medallion_box = (int(width * 0.385), int(height * 0.220), int(width * 0.615), int(height * 0.700))
medallion = img.crop(crop_medallion_box)
medallion_path = os.path.join(target_dir, "gods_lightning_master.png")
medallion.save(medallion_path, quality=95)
medallion.save(os.path.join(brain_dir, "gods_lightning_master.png"), quality=95)
print(f"Saved master medallion: {medallion_path} ({medallion.size})")

# 3. Recorte del Medallón Dorado Puro (Versión Izquierda)
crop_left_medallion = (int(width * 0.05), int(height * 0.15), int(width * 0.30), int(height * 0.75))
left_medallion = img.crop(crop_left_medallion)
left_medallion.save(os.path.join(target_dir, "ataraxia_medallion_bronze.jpg"), quality=95)

# 4. Recorte del Medallón Eléctrico Radiante (Versión Derecha)
crop_right_medallion = (int(width * 0.70), int(height * 0.10), int(width * 0.95), int(height * 0.80))
right_medallion = img.crop(crop_right_medallion)
right_medallion.save(os.path.join(target_dir, "ataraxia_medallion_radiant.jpg"), quality=95)

print("ALL CROPS COMPLETED SUCCESSFULLY!")
