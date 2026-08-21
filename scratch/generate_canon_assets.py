from PIL import Image, ImageEnhance

img = Image.open(r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787289036700.jpg")

# Coordenadas exactas del contenido dentro de la pantalla del teléfono:
# x: de 386 a 638 (ancho 252)
# y: de 78 a 525 (alto 447 - omitiendo el status bar con "10:09 AM")
screen_content = img.crop((386, 75, 638, 526))

# Upscaling de alta calidad con Lanczos a 1080 x 1920 (aspect ratio vertical de smartphone)
screen_full_hd = screen_content.resize((1080, 1920), Image.Resampling.LANCZOS)
# Ligero realce de nitidez y contraste para que brille como en OLED
enhancer = ImageEnhance.Sharpness(screen_full_hd)
screen_full_hd = enhancer.enhance(1.2)

target_asset = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images\zeus_canon_splash.jpg"
screen_full_hd.save(target_asset, quality=98)
screen_full_hd.save(r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\zeus_canon_splash.jpg", quality=98)

# También extraemos el medallón aislado con rayo brillante (del lado derecho) con fondo negro
right_emblem = img.crop((685, 60, 975, 500))
right_emblem_hd = right_emblem.resize((1024, 1024), Image.Resampling.LANCZOS)
target_emblem = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images\zeus_canon_emblem.png"
right_emblem_hd.save(target_emblem, quality=98)
right_emblem_hd.save(r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\zeus_canon_emblem.png", quality=98)

print("Saved zeus_canon_splash.jpg and zeus_canon_emblem.png successfully!")
