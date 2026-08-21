from PIL import Image

img = Image.open(r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\.user_uploaded\media_1787289036700.jpg")
w, h = img.size
print("Size:", w, h)

# Let's inspect the phone screen boundaries in media_1787289036700.jpg
# Width is 1024, Height is 559
# The phone is right in the center.
# The screen area inside the phone frame:
# Phone left bezel edge: around x=385
# Phone right bezel edge: around x=639
# Phone top inner bezel: around y=44 (below notch: y=70)
# Phone bottom inner bezel: around y=530

screen_inner = img.crop((385, 45, 639, 532))
screen_inner.save(r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\phone_screen_test.png")

# Also let's extract the full phone mock with transparent background or the background texture
# Let's also extract the glorious medallion with the electric bolt on the right side:
# The right-side medallion in the image (x: 690 to 975, y: 55 to 505)
right_glorious = img.crop((680, 50, 980, 510))
right_glorious.save(r"C:\Users\mauro\.gemini\antigravity\brain\621a4605-5ae2-493b-a00e-d175f7834788\glorious_bolt_right.png")

print("Saved test crops")
