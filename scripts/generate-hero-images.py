#!/usr/bin/env python3
"""Generate hero banner and product images using Gemini."""

import os
import sys
from google import genai
from google.genai import types

API_KEY = None
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if line.startswith("GOOGLE_GEMINI_API_KEY="):
                API_KEY = line.strip().split("=", 1)[1]
                break

if not API_KEY:
    print("ERROR: No GOOGLE_GEMINI_API_KEY found")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "hero")
os.makedirs(OUTPUT_DIR, exist_ok=True)

IMAGES = [
    {
        "id": "supermarket-banner",
        "prompt": (
            "A stunning photorealistic wide-angle interior shot of a modern premium Israeli supermarket. "
            "Long, clean aisles with perfectly stocked colorful shelves stretching into a vanishing point. "
            "Warm ambient overhead lighting with soft LED strip lights along shelves. "
            "Fresh produce section visible with vibrant fruits and vegetables. "
            "Polished reflective floor. Shot with a 24mm wide-angle lens, slightly low perspective. "
            "Golden hour warmth, cinematic depth of field. Professional retail photography style. "
            "No people, no text, no logos."
        ),
        "aspect": "16:9",
        "size": "2K",
    },
    {
        "id": "stockout-meat",
        "prompt": (
            "Photorealistic product shot of fresh ground beef 500g on a clean white marble surface. "
            "Studio lighting, soft shadows, slightly overhead angle. "
            "The meat is on butcher paper, showing fresh red color and texture. "
            "Professional food photography, shallow depth of field, warm tone. "
            "No text, no labels, no packaging."
        ),
        "aspect": "1:1",
        "size": "1K",
    },
    {
        "id": "top-sales-cola",
        "prompt": (
            "Photorealistic studio product shot of a single 1.5 liter plastic Coca-Cola bottle, "
            "on a clean white surface with soft studio lighting. "
            "Condensation droplets on the bottle, ice-cold feel. "
            "Slight reflection on the surface. Professional beverage photography. "
            "Shallow depth of field. No other objects, no text."
        ),
        "aspect": "1:1",
        "size": "1K",
    },
    {
        "id": "promo-tissue",
        "prompt": (
            "Photorealistic studio product shot of a large pack of toilet paper rolls (32 rolls), "
            "wrapped in soft purple/white plastic packaging, on a clean white surface. "
            "Bright studio lighting, soft shadows. Professional product photography. "
            "No text, no logos, no branding. Shallow depth of field."
        ),
        "aspect": "1:1",
        "size": "1K",
    },
]

def generate_image(img_def):
    output_path = os.path.join(OUTPUT_DIR, f"{img_def['id']}.jpg")
    if os.path.exists(output_path):
        print(f"  SKIP {img_def['id']} (already exists)")
        return True

    print(f"  Generating {img_def['id']}...")
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[img_def["prompt"]],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=img_def["aspect"],
                    image_size=img_def["size"],
                ),
            ),
        )

        for part in response.parts:
            if part.inline_data:
                img = part.as_image()
                img.save(output_path)
                print(f"  OK {img_def['id']} -> {output_path}")
                return True

        print(f"  WARN {img_def['id']}: no image in response")
        return False

    except Exception as e:
        print(f"  ERROR {img_def['id']}: {e}")
        return False

def main():
    print(f"Generating {len(IMAGES)} hero images...")
    success = sum(1 for img in IMAGES if generate_image(img))
    print(f"\nDone: {success}/{len(IMAGES)} images in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
