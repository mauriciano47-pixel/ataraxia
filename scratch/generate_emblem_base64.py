import base64
import os
from PIL import Image

asset_path = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images\zeus_master_emblem_transparent.png"
output_ts = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\src\constants\zeusEmblemBase64.ts"

# Optimizar a 512x512 para tamaño super ligero y carga instantánea en Web y Mobile
img = Image.open(asset_path)
img_optimized = img.resize((512, 512), Image.Resampling.LANCZOS)
opt_path = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images\zeus_emblem_512.png"
img_optimized.save(opt_path, "PNG", optimize=True)

with open(opt_path, "rb") as f:
    b64_str = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/png;base64,{b64_str}"

with open(output_ts, "w", encoding="utf-8") as f:
    f.write(f'export const ZEUS_EMBLEM_URI = "{data_uri}";\n')

print(f"Generated ZEUS_EMBLEM_URI with length {len(data_uri)} chars in {output_ts}")
