#!/usr/bin/env python3
"""
Scraper pour hmizatchezsara.com/collections/korean-japanese-shop-2
Extrait 2 produits par marque, télécharge les images en webp,
génère un fichier seed Prisma pour le VPS.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import os
import sys
from urllib.parse import urljoin, urlparse
from collections import defaultdict

BASE_URL = "https://hmizatchezsara.com"
COLLECTION_URL = f"{BASE_URL}/collections/korean-japanese-shop-2"
OUTPUT_DIR = "scraped_hmiza"
PRODUCTS_PER_BRAND = 2

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/images", exist_ok=True)


def fetch_html(url):
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"[ERREUR] {url}: {e}")
        return None


def parse_collection(html):
    """Extrait les produits groupés par marque."""
    soup = BeautifulSoup(html, "html.parser")
    products = []

    # Shopify product cards
    for card in soup.find_all("div", class_=re.compile("product-card|grid__item|product-item")):
        link_tag = card.find("a", href=re.compile("/products/"))
        img_tag = card.find("img")
        brand_tag = card.find("a", href=re.compile("/collections/"))

        if not link_tag:
            continue

        href = link_tag.get("href", "")
        if not href.startswith("/"):
            continue
        product_url = urljoin(BASE_URL, href)

        # Image
        img_src = None
        if img_tag:
            img_src = img_tag.get("src") or img_tag.get("data-src")
            if img_src and img_src.startswith("//"):
                img_src = "https:" + img_src
            elif img_src and img_src.startswith("/"):
                img_src = urljoin(BASE_URL, img_src)

        # Nom
        title_tag = card.find("span", class_=re.compile("product-card__title|grid-view-item__title"))
        name = title_tag.get_text(strip=True) if title_tag else ""
        if not name:
            name = link_tag.get_text(strip=True)

        # Marque
        brand = ""
        if brand_tag:
            brand = brand_tag.get_text(strip=True)
        if not brand and name:
            # Extraire la marque avant la première virgule
            brand = name.split(",")[0].strip()

        products.append({
            "url": product_url,
            "name": name,
            "brand": brand,
            "image_url": img_src,
        })

    return products


def parse_product(html, url):
    """Extrait les détails d'une page produit."""
    soup = BeautifulSoup(html, "html.parser")
    data = {
        "name": "",
        "nameAr": "",
        "brand": "",
        "description": "",
        "descriptionAr": "",
        "price": 0.0,
        "oldPrice": None,
        "stock": 10,
        "image": "",
        "categories": ["K-Beauty"],
        "collections": ["Korean Beauty"],
        "concerns": [],
        "badge": None,
        "isVisible": True,
        "isArchived": False,
        "salesCount": 0,
        "tags": [],
    }

    # JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(script.string)
            if isinstance(ld, dict) and ld.get("@type") == "Product":
                data["name"] = ld.get("name", "")
                data["brand"] = ld.get("brand", {}).get("name", "")
                offers = ld.get("offers", {})
                if isinstance(offers, list) and offers:
                    offers = offers[0]
                if isinstance(offers, dict):
                    price_str = offers.get("price", "0")
                    data["price"] = float(price_str) if price_str else 0.0
                    currency = offers.get("priceCurrency", "")
                    if currency == "EUR":
                        data["price"] = round(data["price"] * 11, 2)  # EUR -> MAD approx
                    avail = offers.get("availability", "")
                    if "OutOfStock" in avail:
                        data["stock"] = 0
        except Exception:
            pass

    # Fallback prix depuis le HTML
    if data["price"] == 0:
        price_el = soup.find("span", class_=re.compile("price|product-price|current-price"))
        if price_el:
            text = price_el.get_text(strip=True)
            m = re.search(r"[\d\s,.]+", text.replace(",", "."))
            if m:
                try:
                    data["price"] = float(m.group().replace(" ", "").replace(",", "."))
                except ValueError:
                    pass

    # Nom
    if not data["name"]:
        h1 = soup.find("h1", class_=re.compile("product-single__title|product-title"))
        if h1:
            data["name"] = h1.get_text(strip=True)

    # Marque
    if not data["brand"] and data["name"]:
        data["brand"] = data["name"].split(",")[0].strip()

    # Description
    desc_div = soup.find("div", class_=re.compile("product-description|rte|product__description"))
    if desc_div:
        data["descriptionAr"] = desc_div.get_text(separator="\n", strip=True)

    # Image depuis JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(script.string)
            if isinstance(ld, dict) and ld.get("@type") == "Product":
                img = ld.get("image", "")
                if isinstance(img, list) and img:
                    img = img[0]
                if isinstance(img, str):
                    data["image"] = img
        except Exception:
            pass

    # Fallback image
    if not data["image"]:
        og_img = soup.find("meta", property="og:image")
        if og_img:
            data["image"] = og_img.get("content", "")

    return data


def download_image(url, filename):
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        path = f"{OUTPUT_DIR}/images/{filename}"
        with open(path, "wb") as f:
            f.write(resp.content)
        return path
    except Exception as e:
        print(f"[ERREUR IMAGE] {url}: {e}")
        return None


def convert_to_webp(image_path):
    """Convertit l'image en webp si possible."""
    try:
        from PIL import Image
        base = os.path.splitext(image_path)[0]
        webp_path = base + ".webp"
        with Image.open(image_path) as im:
            im.save(webp_path, "WEBP", quality=85)
        os.remove(image_path)
        return webp_path
    except ImportError:
        print("[INFO] Pillow non installé, images non converties en webp")
        return image_path
    except Exception as e:
        print(f"[ERREUR CONVERSION] {image_path}: {e}")
        return image_path


def group_by_brand(products):
    groups = defaultdict(list)
    for p in products:
        brand = p.get("brand") or "Unknown"
        groups[brand].append(p)
    return groups


def main():
    print("[1/5] Scraping collection...")
    html = fetch_html(COLLECTION_URL)
    if not html:
        print("Impossible de charger la collection")
        sys.exit(1)

    products = parse_collection(html)
    print(f"  -> {len(products)} produits trouvés")

    # Grouper par marque et prendre 2 de chaque
    groups = group_by_brand(products)
    selected = []
    for brand, items in groups.items():
        for item in items[:PRODUCTS_PER_BRAND]:
            selected.append(item)
    print(f"  -> {len(selected)} produits sélectionnés ({PRODUCTS_PER_BRAND}/marque)")

    # Scraper chaque produit
    final_products = []
    for i, item in enumerate(selected, 1):
        print(f"[2/5] Produit {i}/{len(selected)}: {item['name'][:50]}...")
        html = fetch_html(item["url"])
        if not html:
            continue
        data = parse_product(html, item["url"])
        data["name"] = item["name"] or data["name"]
        data["brand"] = item["brand"] or data["brand"]

        # Télécharger image
        img_url = item.get("image_url") or data.get("image")
        if img_url:
            ext = os.path.splitext(urlparse(img_url).path)[1] or ".jpg"
            raw_name = f"product_{i}{ext}"
            img_path = download_image(img_url, raw_name)
            if img_path:
                webp_path = convert_to_webp(img_path)
                data["image"] = f"/products/{os.path.basename(webp_path)}"
        else:
            data["image"] = ""

        final_products.append(data)

    # Sauvegarder JSON
    json_path = f"{OUTPUT_DIR}/products.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(final_products, f, ensure_ascii=False, indent=2)
    print(f"[3/5] JSON sauvegardé: {json_path}")

    # Générer seed script
    seed_path = f"{OUTPUT_DIR}/seed-hmiza.ts"
    with open(seed_path, "w", encoding="utf-8") as f:
        f.write("import { PrismaClient } from '@prisma/client';\n")
        f.write("const prisma = new PrismaClient();\n\n")
        f.write("async function main() {\n")
        for p in final_products:
            f.write("  await prisma.product.create({\n")
            f.write("    data: {\n")
            for k, v in p.items():
                if k in ("categories", "collections"):
                    # Relations nécessitent connect, pas direct list
                    f.write(f"      // {k} relation handled separately\n")
                    continue
                val = json.dumps(v) if isinstance(v, (str, list)) else str(v).lower() if isinstance(v, bool) else "null" if v is None else str(v)
                f.write(f"      {k}: {val},\n")
            f.write("    },\n")
            f.write("  });\n")
        f.write("}\n\n")
        f.write("main()\n")
        f.write("  .catch(e => { console.error(e); process.exit(1); })\n")
        f.write("  .finally(async () => { await prisma.$disconnect(); });\n")
    print(f"[4/5] Seed script généré: {seed_path}")

    # Copier images vers public/products
    public_dir = "public/products"
    os.makedirs(public_dir, exist_ok=True)
    for p in final_products:
        img_name = os.path.basename(p["image"])
        src = f"{OUTPUT_DIR}/images/{img_name}"
        dst = f"{public_dir}/{img_name}"
        if os.path.exists(src):
            import shutil
            shutil.copy2(src, dst)
    print(f"[5/5] Images copiées vers {public_dir}")
    print("\n--- RÉSUMÉ ---")
    for p in final_products:
        print(f"  - {p['brand']}: {p['name'][:50]}... ({p['price']} MAD)")


if __name__ == "__main__":
    main()
