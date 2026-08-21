import urllib.request
import urllib.parse
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

prompts = [
  {
    "name": "flux_god_lightning_1",
    "prompt": "Epic 3D golden lightning bolt of Zeus, photorealistic Octane Render 8k, forged from solid 24k polished gold, glowing white diamond sharp edges, intense inner neon golden plasma, pure OLED pitch black background #000000, luxury game logo emblem, hyperdetailed masterpiece, cinematic volumetric lighting"
  },
  {
    "name": "flux_god_lightning_zeus_laurel",
    "prompt": "Majestic golden lightning bolt of Zeus wrapped in imperial Roman laurel wreath made of sculpted 24k gold, glowing white neon plasma core, pure black background #000000, dramatic cinematic rim lighting, 3D unreal engine 5 render, luxury medallion logo"
  },
  {
    "name": "flux_god_lightning_spartan_crest",
    "prompt": "Luxury spartan stoic medallion with black onyx stone and heavy 24k gold beveled rim, embossed chiseled golden lightning bolt in center with sunburst rays, pure black background #000000, 8k octane render"
  }
]

target_dir = r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788"
project_asset_dir = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images"

for idx, item in enumerate(prompts):
    encoded = urllib.parse.quote(item["prompt"])
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=1024&model=flux&nologo=true&seed={idx * 100 + 42}"
    print(f"Downloading {item['name']}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=45) as resp:
            data = resp.read()
            out_file = os.path.join(target_dir, f"{item['name']}.jpg")
            with open(out_file, "wb") as f:
                f.write(data)
            print(f"SAVED: {out_file} ({len(data)} bytes)")
            if idx == 0:
                with open(os.path.join(project_asset_dir, "gods_lightning_master.png"), "wb") as f:
                    f.write(data)
    except Exception as e:
        print(f"Failed {item['name']}: {e}")

print("DONE!")
