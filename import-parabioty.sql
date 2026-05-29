-- Import Parabioty Products SQL
-- Execute this with: psql -U your_user -d your_db -f import-parabioty.sql

BEGIN;

-- Insert Categories (if not exists)
INSERT INTO "Category" (id, name, "nameAr", slug, description, page, "order", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Compléments Alimentaires', 'المكملات الغذائية', 'complements-alimentaires', 'Catégorie Compléments Alimentaires', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Cheveux', 'الشعر', 'cheveux', 'Catégorie Cheveux', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Santé', 'الصحة', 'sante', 'Catégorie Santé', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Visage', 'الوجه', 'visage', 'Catégorie Visage', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Préoccupations', 'المشاكل', 'preoccupations', 'Catégorie Préoccupations', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Premium Hair Care', 'العناية الفاخرة بالشعر', 'premium-hair-care', 'Catégorie Premium Hair Care', 'general', 0, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert Collections (if not exists)
INSERT INTO "Collection" (id, name, slug, description, page, "order", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Cheveux', 'cheveux', 'Collection Cheveux', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Ongles', 'ongles', 'Collection Ongles', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Immunité', 'immunite', 'Collection Immunité', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Compléments Alimentaires', 'complements-alimentaires', 'Collection Compléments Alimentaires', 'general', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Visage', 'visage', 'Collection Visage', 'general', 0, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs
WITH cat_ids AS (
  SELECT id, slug FROM "Category" 
  WHERE slug IN ('complements-alimentaires', 'cheveux', 'sante', 'visage', 'preoccupations', 'premium-hair-care')
),
coll_ids AS (
  SELECT id, slug FROM "Collection"
  WHERE slug IN ('cheveux', 'ongles', 'immunite', 'complements-alimentaires', 'visage')
),
-- Insert Products
new_products AS (
  INSERT INTO "Product" (
    id, brand, name, "nameAr", description, "descriptionAr", price, "oldPrice", image,
    badge, stock, tags, concerns, "koreanBeautyStep", "supplementFocus", "makeupStep",
    "isVisible", "isArchived", "isEssential", "salesCount", "createdAt", "updatedAt"
  )
  VALUES 
    (gen_random_uuid(), 'ACM', 'ACM NOVOPHANE Anti Chute 60 Gelules', '', 
     'Complément alimentaire pour la chute de cheveux. Formule fortifiante avec vitamines et minéraux essentiels.', '',
     229, 275, '/images/scraped/parabioty/ACM_NOVOPHANE_Anti_Chute_60_Ge_0.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Cheveux', 'Anti-chute'], ARRAY['Chute de cheveux'],
     NULL, 'beauty', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'ACM', 'ACM Vitix 30Comprime', '',
     'VITIX comprimés aide à protéger les cellules contre le stress oxydatif. Formule originale associant un extrait végétal de melon breveté à un ensemble de vitamines (C, E, B9, B12) et de minéraux (Sélénium, Cuivre, Zinc).', '',
     222, 266, '/images/scraped/parabioty/ACM_Vitix_30Comprime_1.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Antioxydant', 'Vitamines'], ARRAY['Immunité', 'Stress oxydatif'],
     NULL, 'immunity', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'ALLVIT', 'ALLVIT 20 gelules', '',
     'Complexe dynamisant, stimulant et fortifiant à base de vitamines, minéraux, oligo-élément et ginseng. ALLVIT est spécialement formulé pour donner à l''organisme de l''énergie, vigueur et vitalité en cas de fatigue.', '',
     44.1, 53, '/images/scraped/parabioty/ALLVIT_20_gelules_2.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Énergie', 'Ginseng'], ARRAY['Immunité', 'Fatigue'],
     NULL, 'immunity', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'Capiderma', 'Capiderma Capiphan ongles & cheveux 60 capsules', '',
     'Supplément vitaminique et minéral, stimule la croissance et régénérescence des phanères. Formule basée sur un complexe riche en vitamines et minéraux.', '',
     270, 324, '/images/scraped/parabioty/Capiderma_Capiphan_ongles___ch_3.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Cheveux', 'Ongles', 'Vitamines'], ARRAY['Chute de cheveux', 'Ongles cassants'],
     NULL, 'beauty', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'DUCRAY', 'DUCRAY Anacaps Reactiv 30 Capsules', '',
     'Complément alimentaire pour la chute de cheveux réactive (stress, fatigue, saisonnière). Formule concentrée en vitamines B, fer, zinc et sélénium.', '',
     259, 311, '/images/scraped/parabioty/DUCRAY_Anacaps_Reactiv_30_Caps_4.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Cheveux', 'Anti-chute', 'Reactiv'], ARRAY['Chute de cheveux', 'Cheveux fins'],
     NULL, 'beauty', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'DUCRAY', 'DUCRAY Anacaps Progressiv 30 Capsules', '',
     'ANACAPS PROGRESSIV contribue à préserver le capital capillaire en cas de chute de cheveux chronique (hormonale, vasculaire, héréditaire). Formule avec FER, ZINC, SELENIUM, MOLYBDENE et 6 vitamines.', '',
     259, 311, '/images/scraped/parabioty/DUCRAY__Anacaps_Progressiv_30__5.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Cheveux', 'Anti-chute', 'Progressiv'], ARRAY['Chute de cheveux', 'Cheveux fins'],
     NULL, 'beauty', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'Ecrinal', 'Ecrinal Complément Alimentaire Cheveux et Ongles 30 Capsules', '',
     'Complément alimentaire pour la force et beauté des ongles et cheveux. Formule riche en cystine, silicium, vitamines B3, B5, B6, B8 et huile de bourrache.', '',
     500, 600, '/images/scraped/parabioty/Ecrinal_Compl_ment_Alimentaire_6.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Cheveux', 'Ongles', 'Ecrinal'], ARRAY['Chute de cheveux', 'Ongles cassants'],
     NULL, 'beauty', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'Forcapil', 'Forcapil Cheveux et Ongles Formule Fortifiante 180 GELULES', '',
     'Complément alimentaire fortifiant pour cheveux et ongles. Formule riche en vitamines du groupe B, minéraux et acides aminés essentiels.', '',
     357, 428, '/images/scraped/parabioty/Forcapil_Cheveux_et_Ongles_For_7.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Cheveux', 'Ongles', 'Fortifiant'], ARRAY['Chute de cheveux', 'Ongles cassants'],
     NULL, 'beauty', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'Gayelord Hauser', 'Levure de bière au sélénium', '',
     'Levure de Bière et Sélénium avec germes de blé, vitamine E et sélénium. Contribue à l''éclat des cheveux et ongles. Antioxydants pour préserver le capital jeunesse de la peau.', '',
     135, 162, '/images/scraped/parabioty/Levure_de_bi_re_au_s_l_nium_8.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Cheveux', 'Peau', 'Antioxydant'], ARRAY['Chute de cheveux', 'Ongles cassants', 'Peau sèche'],
     NULL, 'beauty', NULL, true, false, false, 0, NOW(), NOW()),
    
    (gen_random_uuid(), 'Hydra Phyt''s', 'Hydra Phyt''s Vitamine C 500 mg - 36 gélules', '',
     'Vitamine C 500 mg. Réputée pour son action contre la fatigue et soutient le système immunitaire. Puissant antioxydant pour l''éclat de la peau.', '',
     105, 126, '/images/scraped/parabioty/Hydra_Phyt_s_Vitamine_C_500_mg_9.webp',
     NULL, 10, ARRAY['Complément', 'Alimentaire', 'Vitamine C', 'Immunité', 'Antioxydant'], ARRAY['Immunité', 'Fatigue', 'Teint terne'],
     NULL, 'immunity', NULL, true, false, false, 0, NOW(), NOW())
  RETURNING id, name
)
SELECT * FROM new_products;

-- Link products to categories
INSERT INTO "_ProductToCategory" ("A", "B")
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'ACM NOVOPHANE Anti Chute 60 Gelules' AND c.slug IN ('complements-alimentaires', 'cheveux', 'preoccupations', 'premium-hair-care')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'ACM Vitix 30Comprime' AND c.slug IN ('complements-alimentaires', 'sante', 'preoccupations')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'ALLVIT 20 gelules' AND c.slug IN ('complements-alimentaires', 'sante', 'preoccupations')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'Capiderma Capiphan ongles & cheveux 60 capsules' AND c.slug IN ('complements-alimentaires', 'cheveux', 'preoccupations', 'premium-hair-care')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'DUCRAY Anacaps Reactiv 30 Capsules' AND c.slug IN ('complements-alimentaires', 'cheveux', 'preoccupations', 'premium-hair-care')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'DUCRAY Anacaps Progressiv 30 Capsules' AND c.slug IN ('complements-alimentaires', 'cheveux', 'preoccupations', 'premium-hair-care')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'Ecrinal Complément Alimentaire Cheveux et Ongles 30 Capsules' AND c.slug IN ('complements-alimentaires', 'cheveux', 'preoccupations', 'premium-hair-care')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'Forcapil Cheveux et Ongles Formule Fortifiante 180 GELULES' AND c.slug IN ('complements-alimentaires', 'cheveux', 'preoccupations', 'premium-hair-care')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'Levure de bière au sélénium' AND c.slug IN ('complements-alimentaires', 'cheveux', 'visage', 'preoccupations', 'premium-hair-care')
UNION
SELECT p.id, c.id
FROM "Product" p, "Category" c
WHERE p.name = 'Hydra Phyt''s Vitamine C 500 mg - 36 gélules' AND c.slug IN ('complements-alimentaires', 'sante', 'visage', 'preoccupations')
ON CONFLICT DO NOTHING;

-- Link products to collections
INSERT INTO "_ProductToCollection" ("A", "B")
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'ACM NOVOPHANE Anti Chute 60 Gelules' AND c.slug IN ('cheveux', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'ACM Vitix 30Comprime' AND c.slug IN ('immunite', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'ALLVIT 20 gelules' AND c.slug IN ('immunite', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'Capiderma Capiphan ongles & cheveux 60 capsules' AND c.slug IN ('cheveux', 'ongles', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'DUCRAY Anacaps Reactiv 30 Capsules' AND c.slug IN ('cheveux', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'DUCRAY Anacaps Progressiv 30 Capsules' AND c.slug IN ('cheveux', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'Ecrinal Complément Alimentaire Cheveux et Ongles 30 Capsules' AND c.slug IN ('cheveux', 'ongles', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'Forcapil Cheveux et Ongles Formule Fortifiante 180 GELULES' AND c.slug IN ('cheveux', 'ongles', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'Levure de bière au sélénium' AND c.slug IN ('cheveux', 'visage', 'complements-alimentaires')
UNION
SELECT p.id, c.id
FROM "Product" p, "Collection" c
WHERE p.name = 'Hydra Phyt''s Vitamine C 500 mg - 36 gélules' AND c.slug IN ('immunite', 'visage', 'complements-alimentaires')
ON CONFLICT DO NOTHING;

COMMIT;
