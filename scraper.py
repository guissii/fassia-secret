import requests
from bs4 import BeautifulSoup
import json
import os
from PIL import Image
from io import BytesIO
import urllib.parse

os.makedirs('scraped_products', exist_ok=True)
os.makedirs('scraped_products/images', exist_ok=True)

url = 'https://hmizatchezsara.com/'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

product_links = set()
for a in soup.find_all('a', href=True):
    href = a['href']
    if '/products/' in href:
        if href.startswith('http'):
            product_links.add(href)
        else:
            product_links.add(urllib.parse.urljoin(url, href))

product_links = list(product_links)[:20]

products = []

for i, link in enumerate(product_links):
    try:
        res = requests.get(link, headers=headers)
        psoup = BeautifulSoup(res.text, 'html.parser')
        
        # Extract from JSON-LD
        product_data = None
        for script in psoup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                if '@type' in data and data['@type'] == 'Product':
                    product_data = data
                    break
            except:
                pass
        
        if not product_data:
            continue
            
        title = product_data.get('name', f"Product {i}")
        desc = product_data.get('description', '')
        brand = product_data.get('brand', {}).get('name', '')
        price = ""
        offers = product_data.get('offers', [])
        if offers and len(offers) > 0:
            price = str(offers[0].get('price', ''))
            
        img_url = ""
        img_info = product_data.get('image', {})
        if isinstance(img_info, dict):
            img_url = img_info.get('url', '')
        elif isinstance(img_info, list) and len(img_info) > 0:
            img_url = img_info[0]
        elif isinstance(img_info, str):
            img_url = img_info

        img_filename = ""
        if img_url:
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
                
            img_res = requests.get(img_url, headers=headers)
            if img_res.status_code == 200:
                img = Image.open(BytesIO(img_res.content))
                img_filename = f"product_{i}.webp"
                img_path = os.path.join('scraped_products', 'images', img_filename)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(img_path, 'WEBP')

        products.append({
            "name_fr": title,
            "name_ar": "",
            "brand": brand,
            "description_fr": desc[:500] + "..." if len(desc) > 500 else desc,
            "description_ar": "",
            "price": price,
            "strikethrough_price": "",
            "stock": 0,
            "categories": ["Visage"],
            "collections": [],
            "image": img_filename
        })
        print(f"Scraped {i+1}/20: {title}")
    except Exception as e:
        print(f"Error scraping {link}: {e}")

with open('scraped_products/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Done. Saved to scraped_products/products.json")
