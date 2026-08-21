"""
ATARAXIA - The Great Lightning of the Gods (El Gran Rayo de los Dioses)
Photorealistic 3D / Octane Render Simulation Engine using NumPy & Pillow
Aesthetics: Cyber-Obsidian Royal, 24k Imperial Gold, Incandescent White Plasma Core, Pure OLED Black #040406.
"""

import sys
import math
import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

np.random.seed(42)
random.seed(42)

OUTPUT_DIR = r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\assets\images"
ARTIFACT_DIR = r"C:\Users\mauro\.gemini\antigravity\brain\c26168ad-16e0-41a2-b302-d5ef8d222740"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

OLED_BLACK = (4, 4, 6)

def create_radial_gradient_mask(w, h, center_x, center_y, radius, power=1.5):
    y, x = np.ogrid[:h, :w]
    dist = np.sqrt((x - center_x)**2 + (y - center_y)**2)
    norm_dist = np.clip(dist / radius, 0.0, 1.0)
    mask = (1.0 - norm_dist) ** power
    return mask.astype(np.float32)

def draw_starburst(draw, cx, cy, radius, rays=8, color=(255, 255, 255, 255), width=2):
    for i in range(rays):
        angle = i * (math.pi / rays)
        dx = math.cos(angle) * radius
        dy = math.sin(angle) * radius
        draw.line([cx - dx, cy - dy, cx + dx, cy + dy], fill=color, width=width)

def render_lightning_geometry():
    outer_left = [
        (0, -380), (-75, -210), (15, -160), (-110, 10), (-5, 50), (-140, 260), (10, 290), (0, 400)
    ]
    outer_right = [
        (0, -380), (85, -220), (-5, -170), (120, -10), (15, 40), (150, 240), (-5, 280), (0, 400)
    ]
    spine = [
        (0, -380), (5, -215), (5, -165), (10, 0), (5, 45), (10, 250), (2, 285), (0, 400)
    ]
    return outer_left, outer_right, spine

def build_faceted_mesh(w, h, scale=1.0, offset=(0, 0)):
    cx = w / 2 + offset[0]
    cy = h / 2 + offset[1]
    
    gold_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    plasma_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    highlights_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    draw_gold = ImageDraw.Draw(gold_layer)
    draw_plasma = ImageDraw.Draw(plasma_layer)
    draw_hl = ImageDraw.Draw(highlights_layer)
    
    l_nodes, r_nodes, s_nodes = render_lightning_geometry()
    
    def transform(pt):
        return (cx + pt[0] * scale, cy + pt[1] * scale)
    
    tl_nodes = [transform(pt) for pt in l_nodes]
    tr_nodes = [transform(pt) for pt in r_nodes]
    ts_nodes = [transform(pt) for pt in s_nodes]
    
    left_gold_shades = [
        (255, 235, 140, 255), (230, 185, 60, 255), (255, 245, 175, 255),
        (240, 195, 75, 255), (255, 230, 130, 255), (225, 175, 50, 255), (255, 240, 160, 255)
    ]
    
    for i in range(len(tl_nodes) - 1):
        poly = [tl_nodes[i], tl_nodes[i+1], ts_nodes[i+1], ts_nodes[i]]
        color = left_gold_shades[i % len(left_gold_shades)]
        draw_gold.polygon(poly, fill=color)
        draw_gold.line([tl_nodes[i], tl_nodes[i+1]], fill=(255, 255, 220, 255), width=max(2, int(3 * scale)))
        draw_gold.line([tl_nodes[i+1], ts_nodes[i+1]], fill=(200, 150, 40, 255), width=max(1, int(2 * scale)))
        
    right_gold_shades = [
        (190, 140, 35, 255), (150, 105, 20, 255), (215, 165, 45, 255),
        (140, 95, 15, 255), (185, 135, 30, 255), (130, 85, 10, 255), (175, 125, 25, 255)
    ]
    
    for i in range(len(tr_nodes) - 1):
        poly = [tr_nodes[i], tr_nodes[i+1], ts_nodes[i+1], ts_nodes[i]]
        color = right_gold_shades[i % len(right_gold_shades)]
        draw_gold.polygon(poly, fill=color)
        draw_gold.line([tr_nodes[i], tr_nodes[i+1]], fill=(255, 210, 90, 255), width=max(2, int(2.5 * scale)))
        draw_gold.line([tr_nodes[i+1], ts_nodes[i+1]], fill=(90, 60, 10, 255), width=max(1, int(2 * scale)))

    for i in range(len(ts_nodes) - 1):
        draw_gold.line([ts_nodes[i], ts_nodes[i+1]], fill=(255, 255, 230, 255), width=max(2, int(4 * scale)))
        
    plasma_width = max(3, int(8 * scale))
    for i in range(len(ts_nodes) - 1):
        draw_plasma.line([ts_nodes[i], ts_nodes[i+1]], fill=(255, 255, 255, 255), width=plasma_width)
        
    for pt in ts_nodes:
        r = int(10 * scale)
        draw_plasma.ellipse([pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r], fill=(255, 255, 255, 255))
        draw_hl.ellipse([pt[0] - r*1.8, pt[1] - r*1.8, pt[0] + r*1.8, pt[1] + r*1.8], fill=(255, 235, 150, 160))

    arcs = [
        (ts_nodes[1], -40, 120 * scale, [(-20, 60 * scale), (30, 50 * scale)]),
        (ts_nodes[3], 35, 140 * scale, [(20, 70 * scale), (-25, 55 * scale)]),
        (ts_nodes[5], -50, 110 * scale, [(-30, 50 * scale), (25, 45 * scale)]),
        (ts_nodes[6], 45, 90 * scale, [(15, 45 * scale)]),
        (ts_nodes[0], 0, -80 * scale, [(-25, 40 * scale), (25, 40 * scale)]),
        (ts_nodes[-1], 0, 70 * scale, [(-20, 35 * scale), (20, 35 * scale)]),
    ]
    
    for start_pt, angle_deg, length, sub_branches in arcs:
        rad = math.radians(angle_deg - 90)
        end_x = start_pt[0] + math.cos(rad) * length
        end_y = start_pt[1] + math.sin(rad) * length
        mid_x = (start_pt[0] + end_x) / 2 + (random.random() - 0.5) * 20 * scale
        mid_y = (start_pt[1] + end_y) / 2 + (random.random() - 0.5) * 20 * scale
        
        draw_plasma.line([start_pt, (mid_x, mid_y), (end_x, end_y)], fill=(255, 255, 255, 230), width=max(1, int(2.5 * scale)))
        draw_hl.line([start_pt, (mid_x, mid_y), (end_x, end_y)], fill=(255, 215, 80, 180), width=max(2, int(5 * scale)))
        
        for sub_angle, sub_len in sub_branches:
            s_rad = math.radians(angle_deg + sub_angle - 90)
            sub_end_x = mid_x + math.cos(s_rad) * sub_len
            sub_end_y = mid_y + math.sin(s_rad) * sub_len
            draw_plasma.line([(mid_x, mid_y), (sub_end_x, sub_end_y)], fill=(255, 255, 255, 200), width=max(1, int(1.5 * scale)))
            draw_hl.line([(mid_x, mid_y), (sub_end_x, sub_end_y)], fill=(255, 200, 50, 140), width=max(2, int(3.5 * scale)))

    return gold_layer, plasma_layer, highlights_layer, (cx, cy)

def render_imperial_laurel_wreath(w, h, cx, cy, scale=1.0):
    laurel_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(laurel_img)
    
    radius_x = 240 * scale
    radius_y = 340 * scale
    num_pairs = 14
    
    for side in (-1, 1):
        for i in range(num_pairs):
            t = i / float(num_pairs - 1)
            angle = (math.pi / 2 + 0.25 * side) - t * (math.pi * 0.85) * side
            stem_x = cx + side * math.sin(t * math.pi * 0.75) * radius_x
            stem_y = cy + (radius_y * 0.85) - t * (radius_y * 1.7)
            
            leaf_angle = angle + math.pi / 2 * side + (0.3 * side)
            leaf_len = (38 + math.sin(t * math.pi) * 22) * scale
            leaf_width = (14 + math.sin(t * math.pi) * 8) * scale
            
            tip_x = stem_x + math.cos(leaf_angle) * leaf_len
            tip_y = stem_y + math.sin(leaf_angle) * leaf_len
            
            perp_angle = leaf_angle + math.pi / 2
            side_l_x = stem_x + math.cos(leaf_angle) * (leaf_len * 0.45) + math.cos(perp_angle) * (leaf_width * 0.5)
            side_l_y = stem_y + math.sin(leaf_angle) * (leaf_len * 0.45) + math.sin(perp_angle) * (leaf_width * 0.5)
            
            side_r_x = stem_x + math.cos(leaf_angle) * (leaf_len * 0.45) - math.cos(perp_angle) * (leaf_width * 0.5)
            side_r_y = stem_y + math.sin(leaf_angle) * (leaf_len * 0.45) - math.sin(perp_angle) * (leaf_width * 0.5)
            
            draw.polygon([(stem_x, stem_y), (side_l_x, side_l_y), (tip_x, tip_y)], fill=(255, 230, 110, 240))
            draw.polygon([(stem_x, stem_y), (side_r_x, side_r_y), (tip_x, tip_y)], fill=(180, 130, 30, 240))
            draw.line([(stem_x, stem_y), (tip_x, tip_y)], fill=(255, 255, 200, 255), width=max(1, int(1.5 * scale)))
            
            if i % 2 == 0 and i > 1 and i < num_pairs - 2:
                berry_dist = 18 * scale
                bx = stem_x - math.cos(perp_angle) * (berry_dist * side)
                by = stem_y - math.sin(perp_angle) * (berry_dist * side)
                br = 5 * scale
                draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(255, 245, 160, 255))
                draw.ellipse([bx - br*0.5, by - br*0.5, bx, by], fill=(255, 255, 255, 255))
                
    ribbon_y = cy + radius_y * 0.88
    rw = 45 * scale
    rh = 18 * scale
    draw.ellipse([cx - rw, ribbon_y - rh, cx + rw, ribbon_y + rh], fill=(210, 160, 40, 255))
    draw.ellipse([cx - rw*0.6, ribbon_y - rh*0.6, cx + rw*0.6, ribbon_y + rh*0.6], fill=(255, 235, 120, 255))
    draw.ellipse([cx - rw*0.2, ribbon_y - rh*0.2, cx + rw*0.2, ribbon_y + rh*0.2], fill=(255, 255, 240, 255))
    
    return laurel_img

def render_celestial_nebula_and_particles(w, h, cx, cy, count=400):
    np_bg = np.zeros((h, w, 4), dtype=np.float32)
    np_bg[:, :, 0] = 4.0
    np_bg[:, :, 1] = 4.0
    np_bg[:, :, 2] = 6.0
    np_bg[:, :, 3] = 255.0
    
    mask_gold = create_radial_gradient_mask(w, h, cx, cy, radius=max(w, h) * 0.55, power=2.2)
    np_bg[:, :, 0] += mask_gold * 45.0
    np_bg[:, :, 1] += mask_gold * 32.0
    np_bg[:, :, 2] += mask_gold * 8.0
    
    mask_blue = create_radial_gradient_mask(w, h, cx, cy, radius=max(w, h) * 0.85, power=1.8)
    np_bg[:, :, 0] += mask_blue * 5.0
    np_bg[:, :, 1] += mask_blue * 12.0
    np_bg[:, :, 2] += mask_blue * 35.0
    
    np_bg = np.clip(np_bg, 0, 255).astype(np.uint8)
    bg = Image.fromarray(np_bg, "RGBA")
    
    dust_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dust_draw = ImageDraw.Draw(dust_layer)
    
    for _ in range(count):
        px = int(np.random.normal(cx, w * 0.22))
        py = int(np.random.normal(cy, h * 0.26))
        
        if 0 <= px < w and 0 <= py < h:
            dist = math.hypot(px - cx, py - cy)
            brightness = max(0.2, 1.0 - (dist / (max(w, h) * 0.6)))
            size = random.uniform(1.0, 4.5) * brightness
            
            r_val = int(255 * brightness)
            g_val = int(random.uniform(200, 240) * brightness)
            b_val = int(random.uniform(70, 160) * brightness)
            alpha = int(random.uniform(120, 255) * brightness)
            
            dust_draw.ellipse([px - size, py - size, px + size, py + size], fill=(r_val, g_val, b_val, alpha))
            
            if random.random() < 0.04 and brightness > 0.6:
                draw_starburst(dust_draw, px, py, radius=size * 8, rays=4, color=(255, 255, 230, int(alpha * 0.8)), width=1)

    bg = Image.alpha_composite(bg, dust_layer)
    return bg

def apply_volumetric_bloom(plasma_img, gold_img, hl_img, w, h):
    bloom_gold_wide = hl_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.12)))
    bloom_gold_mid = hl_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.05)))
    bloom_gold_tight = hl_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.015)))
    
    bloom_plasma_wide = plasma_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.08)))
    bloom_plasma_mid = plasma_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.025)))
    bloom_plasma_tight = plasma_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.008)))
    
    anamorphic = plasma_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.005)))
    anamorphic = anamorphic.resize((w, max(1, int(h * 0.08))), Image.Resampling.BILINEAR)
    anamorphic = anamorphic.resize((w, h), Image.Resampling.BICUBIC)
    anamorphic = anamorphic.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.015)))
    
    enhancer = ImageEnhance.Color(bloom_gold_wide)
    bloom_gold_wide = enhancer.enhance(1.8)
    
    return [
        (bloom_gold_wide, 0.7),
        (bloom_gold_mid, 0.9),
        (bloom_plasma_wide, 0.6),
        (bloom_plasma_mid, 0.85),
        (bloom_gold_tight, 1.0),
        (bloom_plasma_tight, 1.0),
        (anamorphic, 0.45)
    ]

def blend_layers_additive(base_img, layers_with_opacity):
    base_np = np.array(base_img, dtype=np.float32)
    for layer_img, opacity in layers_with_opacity:
        layer_np = np.array(layer_img, dtype=np.float32) * opacity
        alpha_factor = (layer_np[:, :, 3:] / 255.0)
        base_np[:, :, :3] += layer_np[:, :, :3] * alpha_factor
    base_np = np.clip(base_np, 0, 255).astype(np.uint8)
    return Image.fromarray(base_np, "RGBA")

def render_master_emblem(width=2400, height=2400):
    print(f"[*] Rendering Master Emblem ({width}x{height})...")
    cx, cy = width / 2, height / 2
    scale = (min(width, height) / 1000.0) * 1.05
    
    bg = render_celestial_nebula_and_particles(width, height, cx, cy, count=450)
    laurel = render_imperial_laurel_wreath(width, height, cx, cy, scale=scale * 1.05)
    gold, plasma, highlights, _ = build_faceted_mesh(width, height, scale=scale, offset=(0, -20 * scale))
    bloom_passes = apply_volumetric_bloom(plasma, gold, highlights, width, height)
    
    comp = bg
    comp = blend_layers_additive(comp, bloom_passes)
    comp = Image.alpha_composite(comp, laurel)
    comp = Image.alpha_composite(comp, gold)
    comp = Image.alpha_composite(comp, plasma)
    
    flare_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    flare_draw = ImageDraw.Draw(flare_layer)
    draw_starburst(flare_draw, cx, cy - 20 * scale, radius=260 * scale, rays=12, color=(255, 255, 255, 220), width=int(2 * scale))
    draw_starburst(flare_draw, cx, cy - 20 * scale, radius=380 * scale, rays=4, color=(255, 230, 140, 180), width=int(3 * scale))
    comp = Image.alpha_composite(comp, flare_layer)
    
    frame_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(frame_layer)
    ring_r = int(min(width, height) * 0.46)
    fdraw.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r], outline=(255, 215, 80, 200), width=int(4 * scale))
    fdraw.ellipse([cx - ring_r - 12*scale, cy - ring_r - 12*scale, cx + ring_r + 12*scale, cy + ring_r + 12*scale], outline=(180, 135, 30, 120), width=int(2 * scale))
    fdraw.ellipse([cx - ring_r + 12*scale, cy - ring_r + 12*scale, cx + ring_r - 12*scale, cy + ring_r - 12*scale], outline=(255, 245, 180, 160), width=int(2 * scale))
    
    comp = Image.alpha_composite(comp, frame_layer)
    return comp

def render_mobile_celestial_splash(width=1200, height=2600):
    print(f"[*] Rendering Mobile Celestial Splash ({width}x{height})...")
    cx = width / 2
    cy = height * 0.44
    scale = (width / 1000.0) * 1.08
    
    bg = render_celestial_nebula_and_particles(width, height, cx, cy, count=550)
    laurel = render_imperial_laurel_wreath(width, height, cx, cy, scale=scale * 1.08)
    gold, plasma, highlights, _ = build_faceted_mesh(width, height, scale=scale, offset=(0, -height * 0.06))
    bloom_passes = apply_volumetric_bloom(plasma, gold, highlights, width, height)
    
    comp = bg
    comp = blend_layers_additive(comp, bloom_passes)
    comp = Image.alpha_composite(comp, laurel)
    comp = Image.alpha_composite(comp, gold)
    comp = Image.alpha_composite(comp, plasma)
    
    flare_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(flare_layer)
    draw_starburst(fdraw, cx, cy - height * 0.06, radius=300 * scale, rays=8, color=(255, 255, 255, 230), width=int(2 * scale))
    draw_starburst(fdraw, cx, cy - height * 0.06, radius=450 * scale, rays=4, color=(255, 220, 100, 180), width=int(4 * scale))
    comp = Image.alpha_composite(comp, flare_layer)
    
    text_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(text_layer)
    
    try:
        font_title = ImageFont.truetype("georgiab.ttf", size=int(72 * scale))
        font_sub = ImageFont.truetype("georgia.ttf", size=int(26 * scale))
        font_mantra = ImageFont.truetype("georgiai.ttf", size=int(21 * scale))
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_mantra = ImageFont.load_default()
        
    title_text = "A  T  A  R  A  X  I  A"
    sub_text = "T E M P L O   D E L   A U T O D O M I N I O"
    mantra_text = "«El alma alcanza la invencibilidad cuando domina su propia tempestad»"
    
    ty_title = int(height * 0.77)
    ty_sub = int(height * 0.825)
    ty_mantra = int(height * 0.875)
    
    def draw_centered_gold_text(text, font, y_pos, main_color=(255, 245, 210, 255), glow_color=(255, 210, 70, 140)):
        bbox = tdraw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        tx = (width - tw) / 2
        for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2), (-1, -1), (1, 1)]:
            tdraw.text((tx + dx, y_pos + dy), text, font=font, fill=glow_color)
        tdraw.text((tx, y_pos), text, font=font, fill=main_color)
        return tw, tx
    
    draw_centered_gold_text(title_text, font_title, ty_title, main_color=(255, 245, 210, 255), glow_color=(255, 210, 70, 140))
    draw_centered_gold_text(sub_text, font_sub, ty_sub, main_color=(235, 195, 80, 230), glow_color=(180, 130, 20, 100))
    
    div_y = int(height * 0.855)
    div_len = int(width * 0.35)
    tdraw.line([(cx - div_len, div_y), (cx - 20, div_y)], fill=(210, 165, 50, 160), width=int(1.5 * scale))
    tdraw.line([(cx + 20, div_y), (cx + div_len, div_y)], fill=(210, 165, 50, 160), width=int(1.5 * scale))
    d_size = int(6 * scale)
    tdraw.polygon([(cx, div_y - d_size), (cx + d_size, div_y), (cx, div_y + d_size), (cx - d_size, div_y)], fill=(255, 235, 150, 240))
    
    draw_centered_gold_text(mantra_text, font_mantra, ty_mantra, main_color=(190, 175, 140, 200), glow_color=(100, 80, 30, 60))
    
    comp = Image.alpha_composite(comp, text_layer)
    return comp

def render_cinematic_banner(width=2560, height=1440):
    print(f"[*] Rendering Cinematic Banner ({width}x{height})...")
    cx = width / 2
    cy = height / 2
    scale = (height / 1000.0) * 1.15
    
    bg = render_celestial_nebula_and_particles(width, height, cx, cy, count=600)
    laurel = render_imperial_laurel_wreath(width, height, cx, cy, scale=scale * 1.05)
    gold, plasma, highlights, _ = build_faceted_mesh(width, height, scale=scale, offset=(0, -20 * scale))
    bloom_passes = apply_volumetric_bloom(plasma, gold, highlights, width, height)
    
    comp = bg
    comp = blend_layers_additive(comp, bloom_passes)
    comp = Image.alpha_composite(comp, laurel)
    comp = Image.alpha_composite(comp, gold)
    comp = Image.alpha_composite(comp, plasma)
    
    flare_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(flare_layer)
    fdraw.line([(0, cy - 20 * scale), (width, cy - 20 * scale)], fill=(255, 230, 140, 110), width=int(3 * scale))
    draw_starburst(fdraw, cx, cy - 20 * scale, radius=400 * scale, rays=16, color=(255, 255, 255, 220), width=int(2 * scale))
    comp = Image.alpha_composite(comp, flare_layer)
    
    vignette = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    vdraw.rectangle([0, 0, width, int(height * 0.05)], fill=(4, 4, 6, 255))
    vdraw.rectangle([0, int(height * 0.95), width, height], fill=(4, 4, 6, 255))
    vdraw.line([(0, int(height * 0.05)), (width, int(height * 0.05))], fill=(210, 160, 40, 140), width=int(2 * scale))
    vdraw.line([(0, int(height * 0.95)), (width, int(height * 0.95))], fill=(210, 160, 40, 140), width=int(2 * scale))
    
    comp = Image.alpha_composite(comp, vignette)
    return comp

def render_app_icon(size=1024):
    print(f"[*] Rendering App Icon ({size}x{size})...")
    cx = size / 2
    cy = size / 2
    scale = (size / 1000.0) * 0.92
    
    bg = render_celestial_nebula_and_particles(size, size, cx, cy, count=180)
    laurel = render_imperial_laurel_wreath(size, size, cx, cy, scale=scale * 1.05)
    gold, plasma, highlights, _ = build_faceted_mesh(size, size, scale=scale, offset=(0, -10 * scale))
    bloom_passes = apply_volumetric_bloom(plasma, gold, highlights, size, size)
    
    comp = bg
    comp = blend_layers_additive(comp, bloom_passes)
    comp = Image.alpha_composite(comp, laurel)
    comp = Image.alpha_composite(comp, gold)
    comp = Image.alpha_composite(comp, plasma)
    
    flare_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(flare_layer)
    draw_starburst(fdraw, cx, cy - 10 * scale, radius=160 * scale, rays=8, color=(255, 255, 255, 240), width=int(2 * scale))
    comp = Image.alpha_composite(comp, flare_layer)
    
    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    corner_radius = int(size * 0.22)
    mdraw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=255)
    
    icon_frame = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ifdraw = ImageDraw.Draw(icon_frame)
    border_w = int(10 * scale)
    ifdraw.rounded_rectangle([border_w//2, border_w//2, size - border_w//2, size - border_w//2], 
                            radius=corner_radius, outline=(255, 220, 90, 240), width=border_w)
    ifdraw.rounded_rectangle([border_w + 3, border_w + 3, size - border_w - 3, size - border_w - 3], 
                            radius=corner_radius - 4, outline=(160, 110, 20, 160), width=int(3 * scale))
                            
    comp = Image.alpha_composite(comp, icon_frame)
    comp.putalpha(mask)
    return comp

def generate_sacred_svg():
    return """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <defs>
    <radialGradient id="oledGlow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#241a05" stop-opacity="0.9" />
      <stop offset="45%" stop-color="#0e0b04" stop-opacity="0.98" />
      <stop offset="100%" stop-color="#040406" stop-opacity="1" />
    </radialGradient>
    <linearGradient id="goldKeyLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="20%" stop-color="#FFF3C4" />
      <stop offset="45%" stop-color="#FFD700" />
      <stop offset="75%" stop-color="#E5A93C" />
      <stop offset="100%" stop-color="#996515" />
    </linearGradient>
    <linearGradient id="goldShadowLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37" />
      <stop offset="35%" stop-color="#B8860B" />
      <stop offset="70%" stop-color="#7A4B06" />
      <stop offset="100%" stop-color="#3E2700" />
    </linearGradient>
    <linearGradient id="plasmaCore" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#E0F7FA" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    <filter id="godGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blurWide" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blurMid" />
      <feMerge>
        <feMergeNode in="blurWide" />
        <feMergeNode in="blurMid" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="plasmaBloom" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="12" result="glow1"/>
      <feGaussianBlur stdDeviation="30" result="glow2"/>
      <feMerge>
        <feMergeNode in="glow2"/>
        <feMergeNode in="glow1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1000" height="1000" fill="#040406" />
  <circle cx="500" cy="500" r="480" fill="url(#oledGlow)" />
  <circle cx="500" cy="500" r="440" fill="none" stroke="url(#goldKeyLight)" stroke-width="4" opacity="0.85" />
  <circle cx="500" cy="500" r="425" fill="none" stroke="url(#goldShadowLight)" stroke-width="2" opacity="0.6" />
  <g transform="translate(500, 480)">
    <path d="M 0,-380 L -75,-210 L 15,-160 L -110,10 L -5,50 L -140,260 L 10,290 L 0,400 L -5,280 L 150,240 L 15,40 L 120,-10 L -5,-170 L 85,-220 Z" 
          fill="#FFD700" opacity="0.35" filter="url(#godGlow)" />
    <path d="M 0,-380 L -75,-210 L 5,-215 Z" fill="url(#goldKeyLight)" />
    <path d="M -75,-210 L 15,-160 L 5,-165 L 5,-215 Z" fill="url(#goldKeyLight)" />
    <path d="M 15,-160 L -110,10 L 10,0 L 5,-165 Z" fill="url(#goldKeyLight)" />
    <path d="M -110,10 L -5,50 L 5,45 L 10,0 Z" fill="url(#goldKeyLight)" />
    <path d="M -5,50 L -140,260 L 10,250 L 5,45 Z" fill="url(#goldKeyLight)" />
    <path d="M -140,260 L 10,290 L 2,285 L 10,250 Z" fill="url(#goldKeyLight)" />
    <path d="M 10,290 L 0,400 L 2,285 Z" fill="url(#goldKeyLight)" />
    <path d="M 0,-380 L 85,-220 L 5,-215 Z" fill="url(#goldShadowLight)" />
    <path d="M 85,-220 L -5,-170 L 5,-165 L 5,-215 Z" fill="url(#goldShadowLight)" />
    <path d="M -5,-170 L 120,-10 L 10,0 L 5,-165 Z" fill="url(#goldShadowLight)" />
    <path d="M 120,-10 L 15,40 L 5,45 L 10,0 Z" fill="url(#goldShadowLight)" />
    <path d="M 15,40 L 150,240 L 10,250 L 5,45 Z" fill="url(#goldShadowLight)" />
    <path d="M 150,240 L -5,280 L 2,285 L 10,250 Z" fill="url(#goldShadowLight)" />
    <path d="M -5,280 L 0,400 L 2,285 Z" fill="url(#goldShadowLight)" />
    <path d="M 0,-380 L -75,-210 L 15,-160 L -110,10 L -5,50 L -140,260 L 10,290 L 0,400" 
          fill="none" stroke="#FFF7D6" stroke-width="3.5" stroke-linejoin="round" />
    <path d="M 0,-380 L 85,-220 L -5,-170 L 120,-10 L 15,40 L 150,240 L -5,280 L 0,400" 
          fill="none" stroke="#FFE484" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M 0,-380 L 5,-215 L 5,-165 L 10,0 L 5,45 L 10,250 L 2,285 L 0,400" 
          fill="none" stroke="url(#plasmaCore)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" filter="url(#plasmaBloom)" />
    <path d="M 0,-380 L 5,-215 L 5,-165 L 10,0 L 5,45 L 10,250 L 2,285 L 0,400" 
          fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="10" cy="0" r="14" fill="#FFFFFF" filter="url(#godGlow)" />
    <circle cx="10" cy="0" r="7" fill="#FFFFFF" />
    <circle cx="5" cy="-215" r="9" fill="#FFFFFF" />
    <circle cx="10" cy="250" r="9" fill="#FFFFFF" />
  </g>
  <g stroke="url(#goldKeyLight)" fill="url(#goldKeyLight)" opacity="0.95">
    <path d="M 280,680 Q 250,560 300,420 Q 360,300 440,220" fill="none" stroke-width="3" />
    <ellipse cx="285" cy="620" rx="22" ry="9" transform="rotate(-35 285 620)" />
    <ellipse cx="270" cy="540" rx="24" ry="10" transform="rotate(-15 270 540)" />
    <ellipse cx="290" cy="460" rx="24" ry="10" transform="rotate(10 290 460)" />
    <ellipse cx="340" cy="380" rx="24" ry="10" transform="rotate(35 340 380)" />
    <ellipse cx="400" cy="300" rx="22" ry="9" transform="rotate(55 400 300)" />
    <ellipse cx="450" cy="240" rx="18" ry="7" transform="rotate(75 450 240)" />
  </g>
  <g stroke="url(#goldShadowLight)" fill="url(#goldShadowLight)" opacity="0.95">
    <path d="M 720,680 Q 750,560 700,420 Q 640,300 560,220" fill="none" stroke-width="3" />
    <ellipse cx="715" cy="620" rx="22" ry="9" transform="rotate(35 715 620)" />
    <ellipse cx="730" cy="540" rx="24" ry="10" transform="rotate(15 730 540)" />
    <ellipse cx="710" cy="460" rx="24" ry="10" transform="rotate(-10 710 460)" />
    <ellipse cx="660" cy="380" rx="24" ry="10" transform="rotate(-35 660 380)" />
    <ellipse cx="600" cy="300" rx="22" ry="9" transform="rotate(-55 600 300)" />
    <ellipse cx="550" cy="240" rx="18" ry="7" transform="rotate(-75 550 240)" />
  </g>
  <ellipse cx="500" cy="740" rx="40" ry="15" fill="url(#goldKeyLight)" />
  <circle cx="500" cy="740" r="8" fill="#FFFFFF" />
</svg>
"""

def main():
    print("==================================================================")
    print("  ATARAXIA: EL GRAN RAYO DE LOS DIOSES - RENDERING ENGINE 8K/4K   ")
    print("==================================================================")
    
    master_img = render_master_emblem(2400, 2400)
    master_path = os.path.join(OUTPUT_DIR, "gods_lightning_master.png")
    master_artifact = os.path.join(ARTIFACT_DIR, "gods_lightning_master.png")
    master_img.save(master_path, "PNG", optimize=True)
    master_img.save(master_artifact, "PNG", optimize=True)
    print(f"[OK] Saved: {master_path}")
    
    splash_img = render_mobile_celestial_splash(1200, 2600)
    splash_path = os.path.join(OUTPUT_DIR, "gods_lightning_splash.png")
    splash_cover_path = os.path.join(OUTPUT_DIR, "bg_gods_lightning_celestial.png")
    splash_artifact = os.path.join(ARTIFACT_DIR, "gods_lightning_splash.png")
    splash_img.save(splash_path, "PNG", optimize=True)
    splash_img.save(splash_cover_path, "PNG", optimize=True)
    splash_img.save(splash_artifact, "PNG", optimize=True)
    print(f"[OK] Saved: {splash_path}")
    
    banner_img = render_cinematic_banner(2560, 1440)
    banner_path = os.path.join(OUTPUT_DIR, "gods_lightning_banner.png")
    banner_artifact = os.path.join(ARTIFACT_DIR, "gods_lightning_banner.png")
    banner_img.save(banner_path, "PNG", optimize=True)
    banner_img.save(banner_artifact, "PNG", optimize=True)
    print(f"[OK] Saved: {banner_path}")
    
    icon_img = render_app_icon(1024)
    icon_path = os.path.join(OUTPUT_DIR, "gods_lightning_icon.png")
    icon_artifact = os.path.join(ARTIFACT_DIR, "gods_lightning_icon.png")
    icon_img.save(icon_path, "PNG", optimize=True)
    icon_img.save(icon_artifact, "PNG", optimize=True)
    print(f"[OK] Saved: {icon_path}")
    
    svg_data = generate_sacred_svg()
    svg_path = os.path.join(OUTPUT_DIR, "gods_lightning_emblem.svg")
    svg_artifact = os.path.join(ARTIFACT_DIR, "gods_lightning_emblem.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_data)
    with open(svg_artifact, "w", encoding="utf-8") as f:
        f.write(svg_data)
    print(f"[OK] Saved: {svg_path}")
    
    # Also copy the python script itself into ataraxia/scripts/
    script_dest = os.path.join(r"c:\Users\mauro\OneDrive\Documentos\ATARAXIA_APP\ataraxia\scripts", "render_gods_lightning.py")
    with open(__file__, "r", encoding="utf-8") as src, open(script_dest, "w", encoding="utf-8") as dst:
        dst.write(src.read())
    print(f"[OK] Saved script pipeline: {script_dest}")
    
    print("\n[SUCCESS] ALL VISUAL ASSETS GENERATED WITH SUPREME PERFECTION.")

if __name__ == "__main__":
    main()
