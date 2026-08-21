from PIL import Image, ImageFilter
import os

source_path = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787289036700.jpg"
target_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images"
brain_dir = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788"

img = Image.open(source_path)
width, height = img.size

# 1. Recorte exacto del interior de la pantalla (excluyendo el marco de cristal y status bar si es necesario)
# En 1024x559:
# Centro x: 512. Ancho pantalla interior: aprox 240px (de 392 a 632)
# Alto pantalla interior: aprox 495px (de 35 a 530)
box_full_screen = (388, 32, 636, 532)
screen_crop = img.crop(box_full_screen)
# Upscale con Lanczos para máxima nitidez en pantallas Retina/OLED
screen_hq = screen_crop.resize((1080, 2160), Image.Resampling.LANCZOS)
screen_hq.save(os.path.join(target_dir, "ataraxia_zeus_master_splash.jpg"), quality=98)
screen_hq.save(os.path.join(brain_dir, "ataraxia_zeus_master_splash.jpg"), quality=98)

# 2. Recorte del Medallón Central con Rayo Electrificado
box_medallion = (395, 120, 630, 395)
medallion_crop = img.crop(box_medallion)
medallion_hq = medallion_crop.resize((1024, 1024), Image.Resampling.LANCZOS)
medallion_hq.save(os.path.join(target_dir, "gods_lightning_master.png"), quality=98)
medallion_hq.save(os.path.join(brain_dir, "gods_lightning_master.png"), quality=98)

# 3. Recorte del Título Dorado "ATARAXIA"
box_title = (400, 390, 625, 450)
title_crop = img.crop(box_title)
title_hq = title_crop.resize((800, 200), Image.Resampling.LANCZOS)
title_hq.save(os.path.join(target_dir, "ataraxia_gold_title.png"), quality=98)

print("HIGH RESOLUTION MASTER ARTWORKS GENERATED WITH LANCZOS RESAMPLING!")
