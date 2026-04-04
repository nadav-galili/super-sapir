#!/usr/bin/env python3
"""Generate category icons using Gemini image generation."""

import os
import sys

from google import genai
from google.genai import types

API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    # Try reading from .env file
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

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "categories")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Category ID -> English description for the prompt
CATEGORIES = {
    "vegetables": "fresh colorful vegetables — tomatoes, cucumbers, peppers, carrots",
    "grocery": "grocery store shelf items — cereal boxes, canned goods, pasta, rice",
    "dairy": "dairy products — milk carton, cheese wheel, yogurt cups, butter",
    "home-products": "household non-food products — cleaning supplies, paper towels, detergent",
    "drinks": "beverages — soda bottles, juice cartons, water bottles, cans",
    "frozen": "frozen food — frozen pizza box, ice cream, frozen vegetables bag",
    "household": "home goods — kitchen utensils, storage containers, cleaning tools",
    "fresh-meat": "fresh raw meat — beef steaks, chicken breasts on butcher paper",
    "bread": "fresh bread and baked goods — loaves of bread, baguettes, rolls",
    "baby": "baby products — diapers pack, baby food jars, baby bottle",
    "pastries": "pastries and sweets — croissants, danish pastries, cinnamon rolls",
    "deli": "deli cheese counter — sliced cheese varieties, cheese wedges",
    "organic": "organic and health food — granola, organic fruits, health bars",
    "fresh-fish": "fresh fish — whole fish, salmon fillets, shrimp on ice",
}

STYLE_PROMPT = (
    "A clean, minimal, flat-style illustration icon for a retail supermarket category. "
    "Warm white background (#FDF8F6). Soft warm lighting. No text, no labels. "
    "Simple, modern, slightly rounded shapes. Subtle soft shadows. "
    "The icon should look great at 48x48px in a dashboard table row. "
    "Category: "
)

def generate_icon(category_id: str, description: str) -> bool:
    output_path = os.path.join(OUTPUT_DIR, f"{category_id}.png")
    if os.path.exists(output_path):
        print(f"  SKIP {category_id} (already exists)")
        return True

    prompt = STYLE_PROMPT + description
    print(f"  Generating {category_id}...")

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio="1:1",
                ),
            ),
        )

        for part in response.parts:
            if part.inline_data:
                img = part.as_image()
                # Save as jpg first (genai default), then convert to png
                tmp_path = output_path.replace(".png", ".jpg")
                img.save(tmp_path)
                from PIL import Image as PILImage
                pil_img = PILImage.open(tmp_path)
                pil_img.save(output_path, format="PNG")
                os.remove(tmp_path)
                print(f"  OK {category_id} -> {output_path}")
                return True

        print(f"  WARN {category_id}: no image in response")
        return False

    except Exception as e:
        print(f"  ERROR {category_id}: {e}")
        return False


def main():
    print(f"Generating {len(CATEGORIES)} category icons...")
    success = 0
    for cat_id, desc in CATEGORIES.items():
        if generate_icon(cat_id, desc):
            success += 1
    print(f"\nDone: {success}/{len(CATEGORIES)} icons generated in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
