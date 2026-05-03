# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-flows.spec.ts >> Asper Beauty Shop — Critical User Flows >> product detail page loads from shop
- Location: e2e/critical-flows.spec.ts:22:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('article').first()
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('article').first()

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]: Grand Opening Today at 6:00 PM — Experience Medical Luxury
      - generic [ref=e8]:
        - navigation [ref=e10]:
          - link "Brands" [ref=e12] [cursor=pointer]:
            - /url: /brands
            - text: Brands
            - img [ref=e13]
          - link "Skin Concerns" [ref=e16] [cursor=pointer]:
            - /url: /skin-concerns
            - text: Skin Concerns
            - img [ref=e17]
          - link "Best Sellers" [ref=e19] [cursor=pointer]:
            - /url: /best-sellers
          - link "Sale" [ref=e20] [cursor=pointer]:
            - /url: /offers
        - link "Asper" [ref=e22] [cursor=pointer]:
          - /url: /
          - generic [ref=e23]: Asper
        - generic [ref=e24]:
          - generic [ref=e25]:
            - img [ref=e26]
            - textbox "Search 5,000+ items..." [ref=e29]
          - generic [ref=e31]:
            - button "Consult Dr. Sami" [ref=e32] [cursor=pointer]:
              - img [ref=e33]
              - generic [ref=e36]: Dr. Sami
              - generic [ref=e37]: Wellness
            - button "Chat with Ms. Zain" [ref=e39] [cursor=pointer]:
              - img [ref=e40]
              - generic [ref=e42]: Ms. Zain
              - generic [ref=e43]: Beauty
          - link "Sign in" [ref=e44] [cursor=pointer]:
            - /url: /auth
            - img [ref=e45]
          - button "Wishlist" [ref=e48] [cursor=pointer]:
            - img [ref=e49]
          - button "Cart" [ref=e51] [cursor=pointer]:
            - img [ref=e52]
            - generic [ref=e55]: "0"
          - button "Toggle language" [ref=e56] [cursor=pointer]:
            - img [ref=e57]
            - generic [ref=e60]: العربية
      - navigation "Browse by category" [ref=e61]:
        - list [ref=e62]:
          - listitem [ref=e63]:
            - link "Skincare" [ref=e64] [cursor=pointer]:
              - /url: /shop?section=Skincare
              - img [ref=e65]
              - generic [ref=e69]: Skincare
          - listitem [ref=e70]:
            - link "Beauty" [ref=e71] [cursor=pointer]:
              - /url: /shop?section=Beauty+%26+Cosmetics
              - img [ref=e72]
              - generic [ref=e78]: Beauty
          - listitem [ref=e79]:
            - link "Haircare" [ref=e80] [cursor=pointer]:
              - /url: /shop?section=Haircare
              - img [ref=e81]
              - generic [ref=e86]: Haircare
          - listitem [ref=e87]:
            - link "Baby & Mom" [ref=e88] [cursor=pointer]:
              - /url: /shop?section=Baby+%26+Mom
              - img [ref=e89]
              - generic [ref=e93]: Baby & Mom
          - listitem [ref=e94]:
            - link "Personal Care" [ref=e95] [cursor=pointer]:
              - /url: /shop?section=Personal+Care
              - img [ref=e96]
              - generic [ref=e101]: Personal Care
          - listitem [ref=e102]:
            - link "Vitamins" [ref=e103] [cursor=pointer]:
              - /url: /shop?section=Supplements+%26+Vitamins
              - img [ref=e104]
              - generic [ref=e109]: Vitamins
          - listitem [ref=e110]:
            - link "Pharmacy" [ref=e111] [cursor=pointer]:
              - /url: /shop?section=Pharmacy+%26+Wellness
              - img [ref=e112]
              - generic [ref=e116]: Pharmacy
          - listitem [ref=e117]:
            - link "Oral Care" [ref=e118] [cursor=pointer]:
              - /url: /shop?section=Oral+Care
              - img [ref=e119]
              - generic [ref=e123]: Oral Care
          - listitem [ref=e124]:
            - link "First Aid" [ref=e125] [cursor=pointer]:
              - /url: /shop?section=Pharmacy+%26+Wellness
              - img [ref=e126]
              - generic [ref=e130]: First Aid
          - listitem [ref=e131]:
            - link "Men's Health" [ref=e132] [cursor=pointer]:
              - /url: /shop?section=Personal+Care
              - img [ref=e133]
              - generic [ref=e136]: Men's Health
    - main [ref=e137]:
      - generic [ref=e139]:
        - generic [ref=e140]: CURATED CATALOG
        - heading "Shop All Products" [level=1] [ref=e141]
        - paragraph [ref=e142]: Pharmacist-curated skincare and beauty, guaranteed authentic.
      - generic [ref=e144]:
        - generic [ref=e145]:
          - img [ref=e146]
          - generic [ref=e148]: Shop by Concern
        - generic [ref=e149]:
          - button "On Sale" [ref=e150] [cursor=pointer]:
            - img [ref=e151]: 🔥
            - generic [ref=e152]: On Sale
          - button "Acne Care" [ref=e153] [cursor=pointer]:
            - img [ref=e154]: 💊
            - generic [ref=e155]: Acne Care
          - button "Anti-Aging" [ref=e156] [cursor=pointer]:
            - img [ref=e157]: ⏰
            - generic [ref=e158]: Anti-Aging
          - button "Hydration" [ref=e159] [cursor=pointer]:
            - img [ref=e160]: 💧
            - generic [ref=e161]: Hydration
          - button "Sensitive Skin" [ref=e162] [cursor=pointer]:
            - img [ref=e163]: 🌿
            - generic [ref=e164]: Sensitive Skin
          - button "Dark Spots" [ref=e165] [cursor=pointer]:
            - img [ref=e166]: 🌟
            - generic [ref=e167]: Dark Spots
          - button "Sun Protection" [ref=e168] [cursor=pointer]:
            - img [ref=e169]: ☀️
            - generic [ref=e170]: Sun Protection
          - button "Brightening" [ref=e171] [cursor=pointer]:
            - img [ref=e172]: ✨
            - generic [ref=e173]: Brightening
          - button "Dryness" [ref=e174] [cursor=pointer]:
            - img [ref=e175]: 🛡️
            - generic [ref=e176]: Dryness
      - generic [ref=e178]:
        - complementary [ref=e179]:
          - generic [ref=e180]:
            - heading "Filter by Regimen" [level=3] [ref=e181]
            - button "All Curation" [ref=e182] [cursor=pointer]:
              - generic [ref=e183]: All Curation
            - button "Clinical Serums & Actives" [ref=e184] [cursor=pointer]:
              - generic [ref=e185]: Clinical Serums & Actives
            - button "Daily Hydration & Barrier" [ref=e186] [cursor=pointer]:
              - generic [ref=e187]: Daily Hydration & Barrier
            - button "Cleansers & Toners" [ref=e188] [cursor=pointer]:
              - generic [ref=e189]: Cleansers & Toners
            - button "Sun Protection (SPF)" [ref=e190] [cursor=pointer]:
              - generic [ref=e191]: Sun Protection (SPF)
            - button "Evening Radiance & Glamour" [ref=e192] [cursor=pointer]:
              - generic [ref=e193]: Evening Radiance & Glamour
            - button "Targeted Treatments" [ref=e194] [cursor=pointer]:
              - generic [ref=e195]: Targeted Treatments
            - button "Hair Care" [ref=e196] [cursor=pointer]:
              - generic [ref=e197]: Hair Care
            - button "Fragrance" [ref=e198] [cursor=pointer]:
              - generic [ref=e199]: Fragrance
            - button "Body Care" [ref=e200] [cursor=pointer]:
              - generic [ref=e201]: Body Care
        - generic [ref=e202]:
          - generic [ref=e204]:
            - generic [ref=e206]:
              - img [ref=e207]
              - textbox "Search products..." [ref=e210]
            - generic [ref=e212]:
              - generic [ref=e213]:
                - generic [ref=e214]:
                  - heading "Categories" [level=3] [ref=e215]:
                    - button "Categories" [expanded] [ref=e216] [cursor=pointer]:
                      - text: Categories
                      - img [ref=e217]
                  - region "Categories" [ref=e219]:
                    - generic [ref=e221]:
                      - generic [ref=e223] [cursor=pointer]:
                        - checkbox "Skin Care" [ref=e224]
                        - generic [ref=e225]: Skin Care
                      - generic [ref=e227] [cursor=pointer]:
                        - checkbox "Makeup" [ref=e228]
                        - generic [ref=e229]: Makeup
                      - generic [ref=e231] [cursor=pointer]:
                        - checkbox "Hair Care" [ref=e232]
                        - generic [ref=e233]: Hair Care
                      - generic [ref=e235] [cursor=pointer]:
                        - checkbox "Fragrance" [ref=e236]
                        - generic [ref=e237]: Fragrance
                      - generic [ref=e239] [cursor=pointer]:
                        - checkbox "Body Care" [ref=e240]
                        - generic [ref=e241]: Body Care
                - generic [ref=e242]:
                  - heading "Brands" [level=3] [ref=e243]:
                    - button "Brands" [expanded] [ref=e244] [cursor=pointer]:
                      - text: Brands
                      - img [ref=e245]
                  - region "Brands" [ref=e247]:
                    - generic [ref=e249]:
                      - generic [ref=e250] [cursor=pointer]:
                        - checkbox "Vichy" [ref=e251]
                        - generic [ref=e252]: Vichy
                      - generic [ref=e253] [cursor=pointer]:
                        - checkbox "Eucerin" [ref=e254]
                        - generic [ref=e255]: Eucerin
                      - generic [ref=e256] [cursor=pointer]:
                        - checkbox "La Roche-Posay" [ref=e257]
                        - generic [ref=e258]: La Roche-Posay
                      - generic [ref=e259] [cursor=pointer]:
                        - checkbox "Bioderma" [ref=e260]
                        - generic [ref=e261]: Bioderma
                      - generic [ref=e262] [cursor=pointer]:
                        - checkbox "Avène" [ref=e263]
                        - generic [ref=e264]: Avène
                      - generic [ref=e265] [cursor=pointer]:
                        - checkbox "Cetaphil" [ref=e266]
                        - generic [ref=e267]: Cetaphil
                      - generic [ref=e268] [cursor=pointer]:
                        - checkbox "CeraVe" [ref=e269]
                        - generic [ref=e270]: CeraVe
                      - generic [ref=e271] [cursor=pointer]:
                        - checkbox "Neutrogena" [ref=e272]
                        - generic [ref=e273]: Neutrogena
                      - generic [ref=e274] [cursor=pointer]:
                        - checkbox "The Ordinary" [ref=e275]
                        - generic [ref=e276]: The Ordinary
                      - generic [ref=e277] [cursor=pointer]:
                        - checkbox "SVR" [ref=e278]
                        - generic [ref=e279]: SVR
                      - generic [ref=e280] [cursor=pointer]:
                        - checkbox "Uriage" [ref=e281]
                        - generic [ref=e282]: Uriage
                      - generic [ref=e283] [cursor=pointer]:
                        - checkbox "NUXE" [ref=e284]
                        - generic [ref=e285]: NUXE
                      - generic [ref=e286] [cursor=pointer]:
                        - checkbox "Filorga" [ref=e287]
                        - generic [ref=e288]: Filorga
                      - generic [ref=e289] [cursor=pointer]:
                        - checkbox "ISDIN" [ref=e290]
                        - generic [ref=e291]: ISDIN
                - generic [ref=e292]:
                  - heading "Skin Concerns" [level=3] [ref=e293]:
                    - button "Skin Concerns" [expanded] [ref=e294] [cursor=pointer]:
                      - text: Skin Concerns
                      - img [ref=e295]
                  - region "Skin Concerns" [ref=e297]:
                    - generic [ref=e299]:
                      - button "Acne & Blemishes" [ref=e300] [cursor=pointer]
                      - button "Anti-Aging" [ref=e301] [cursor=pointer]
                      - button "Hydration" [ref=e302] [cursor=pointer]
                      - button "Oily Skin" [ref=e303] [cursor=pointer]
                      - button "Dry Skin" [ref=e304] [cursor=pointer]
                      - button "Sensitivity" [ref=e305] [cursor=pointer]
                      - button "Dark Spots" [ref=e306] [cursor=pointer]
                      - button "Wrinkles" [ref=e307] [cursor=pointer]
                      - button "Sun Protection" [ref=e308] [cursor=pointer]
                      - button "Redness" [ref=e309] [cursor=pointer]
                      - button "Cleansing" [ref=e310] [cursor=pointer]
                      - button "Pregnancy Safe" [ref=e311] [cursor=pointer]
                      - button "Rosacea Safe" [ref=e312] [cursor=pointer]
                      - button "Glass Skin" [ref=e313] [cursor=pointer]
                      - button "Barrier Repair" [ref=e314] [cursor=pointer]
                - heading "Price Range" [level=3] [ref=e316]:
                  - button "Price Range" [ref=e317] [cursor=pointer]:
                    - text: Price Range
                    - img [ref=e318]
              - generic [ref=e320] [cursor=pointer]:
                - checkbox "On Sale Only" [ref=e321]
                - generic [ref=e322]: On Sale Only
          - generic [ref=e323]:
            - paragraph [ref=e324]: 0 products
            - button "On Sale" [ref=e325] [cursor=pointer]
            - combobox [ref=e326] [cursor=pointer]:
              - option "Recommended" [selected]
              - option "Newest"
              - 'option "Price: Low to High"'
              - 'option "Price: High to Low"'
              - option "Biggest Discount"
            - generic [ref=e327]:
              - button [ref=e328] [cursor=pointer]:
                - img [ref=e329]
              - button [ref=e331] [cursor=pointer]:
                - img [ref=e332]
          - generic [ref=e335]:
            - img [ref=e336]
            - paragraph [ref=e340]: No products match your filters
            - button "Clear Filters" [ref=e341] [cursor=pointer]
      - generic [ref=e347]:
        - img [ref=e350]
        - generic [ref=e352]:
          - generic [ref=e353]: Pharmacist's Pick
          - heading "Clinically Proven Skincare" [level=3] [ref=e354]
          - paragraph [ref=e355]: Dermatologist-tested formulations backed by science. Free consultation with every order.
        - link "Explore Clinical Range" [ref=e357] [cursor=pointer]:
          - /url: /skin-concerns
          - text: Explore Clinical Range
          - img [ref=e358]
    - contentinfo [ref=e360]:
      - generic [ref=e362]:
        - generic [ref=e363]:
          - link "Asper" [ref=e364] [cursor=pointer]:
            - /url: /
            - generic [ref=e365]: Asper
          - paragraph [ref=e366]: Redefining Beauty in Jordan.
          - generic [ref=e367]:
            - link "Instagram" [ref=e368] [cursor=pointer]:
              - /url: https://www.instagram.com/asper.beauty.shop/
              - img [ref=e369]
            - link "Facebook" [ref=e371] [cursor=pointer]:
              - /url: https://www.facebook.com/AsperBeautyShop
              - img [ref=e372]
            - link "TikTok" [ref=e374] [cursor=pointer]:
              - /url: https://www.tiktok.com/@asper.beauty.shop
              - img [ref=e375]
            - link "WhatsApp" [ref=e377] [cursor=pointer]:
              - /url: https://wa.me/962790656666
              - img [ref=e378]
            - link "X (Twitter)" [ref=e380] [cursor=pointer]:
              - /url: https://x.com/asperbeautyshop
              - img [ref=e381]
            - link "YouTube" [ref=e383] [cursor=pointer]:
              - /url: https://www.youtube.com/@asperbeautyshop
              - img [ref=e384]
            - link "LinkedIn" [ref=e386] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/asper-beauty-shop
              - img [ref=e387]
            - link "Snapchat" [ref=e389] [cursor=pointer]:
              - /url: https://www.snapchat.com/add/asperbeautyshop
              - img [ref=e390]
            - link "Pinterest" [ref=e392] [cursor=pointer]:
              - /url: https://www.pinterest.com/asperbeautyshop
              - img [ref=e393]
        - generic [ref=e395]:
          - heading "Concierge" [level=3] [ref=e396]
          - list [ref=e397]:
            - listitem [ref=e398]:
              - button "Digital Consult • Dr.Bot" [ref=e399] [cursor=pointer]
            - listitem [ref=e400]:
              - link "Track Order" [ref=e401] [cursor=pointer]:
                - /url: /track-order
            - listitem [ref=e402]:
              - link "Shipping Policy" [ref=e403] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e404]:
              - link "Returns & Exchanges" [ref=e405] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e406]:
              - link "Skin Consultation" [ref=e407] [cursor=pointer]:
                - /url: /skin-concerns
        - generic [ref=e408]:
          - heading "About Asper" [level=3] [ref=e409]
          - list [ref=e410]:
            - listitem [ref=e411]:
              - link "Our Philosophy" [ref=e412] [cursor=pointer]:
                - /url: /philosophy
            - listitem [ref=e413]:
              - link "Contact Us" [ref=e414] [cursor=pointer]:
                - /url: /contact
          - heading "Visit Us" [level=4] [ref=e415]
          - generic [ref=e416]:
            - paragraph [ref=e417]: Amman, Jordan
            - link "+962 79 065 6666" [ref=e418] [cursor=pointer]:
              - /url: tel:+962790656666
            - link "asperpharma@gmail.com" [ref=e419] [cursor=pointer]:
              - /url: mailto:asperpharma@gmail.com
        - generic [ref=e420]:
          - heading "Join the Morning Spa" [level=3] [ref=e421]
          - paragraph [ref=e422]: Exclusive insights from Dr. Sami & Ms. Zain — tailored regimens, clinical tips, and early access delivered to your inbox.
          - generic [ref=e423]:
            - textbox "Your email" [ref=e424]
            - button "Enter the Morning Spa" [ref=e425] [cursor=pointer]
          - paragraph [ref=e426]: 🔬 Pharmacist Insights · ✨ Beauty Wisdom · Always Free
      - generic [ref=e429]:
        - generic [ref=e430]:
          - heading "Top Brands" [level=4] [ref=e431]
          - generic [ref=e432]:
            - link "Vichy" [ref=e433] [cursor=pointer]:
              - /url: /brands/vichy
            - link "Eucerin" [ref=e434] [cursor=pointer]:
              - /url: /brands/eucerin
            - link "Bioderma" [ref=e435] [cursor=pointer]:
              - /url: /brands/bioderma
            - link "Cetaphil" [ref=e436] [cursor=pointer]:
              - /url: /brands/cetaphil
            - link "SVR" [ref=e437] [cursor=pointer]:
              - /url: /brands/svr
            - link "La Roche-Posay" [ref=e438] [cursor=pointer]:
              - /url: /brands/la-roche-posay
            - link "Bourjois" [ref=e439] [cursor=pointer]:
              - /url: /brands/bourjois
            - link "Essence" [ref=e440] [cursor=pointer]:
              - /url: /brands/essence
            - link "IsaDora" [ref=e441] [cursor=pointer]:
              - /url: /brands/isadora
            - link "Maybelline" [ref=e442] [cursor=pointer]:
              - /url: /brands/maybelline
            - link "L'Oréal Paris" [ref=e443] [cursor=pointer]:
              - /url: /brands/l-oréal-paris
            - link "Garnier" [ref=e444] [cursor=pointer]:
              - /url: /brands/garnier
        - generic [ref=e445]:
          - heading "Top Categories" [level=4] [ref=e446]
          - generic [ref=e447]:
            - link "Skincare" [ref=e448] [cursor=pointer]:
              - /url: /collections/skincare
            - link "Makeup" [ref=e449] [cursor=pointer]:
              - /url: /collections/makeup
            - link "Perfume" [ref=e450] [cursor=pointer]:
              - /url: /collections/perfume
            - link "Hair Care" [ref=e451] [cursor=pointer]:
              - /url: /collections/hair
            - link "Body Care" [ref=e452] [cursor=pointer]:
              - /url: /collections/body
            - link "Sun Protection" [ref=e453] [cursor=pointer]:
              - /url: /collections/suncare
            - link "Anti-Aging" [ref=e454] [cursor=pointer]:
              - /url: /concerns/anti-aging
            - link "Acne Treatment" [ref=e455] [cursor=pointer]:
              - /url: /concerns/acne
            - link "Moisturizers" [ref=e456] [cursor=pointer]:
              - /url: /collections/moisturizers
            - link "Serums" [ref=e457] [cursor=pointer]:
              - /url: /collections/serums
      - generic [ref=e459]:
        - generic [ref=e460]:
          - generic [ref=e461]:
            - img [ref=e462]
            - generic [ref=e465]: Licensed Pharmacy
          - generic [ref=e467]:
            - img [ref=e468]
            - generic [ref=e471]: JFDA Certified
          - generic [ref=e473]:
            - img [ref=e474]
            - generic [ref=e477]: 100% Authentic
          - generic [ref=e479]:
            - img [ref=e480]
            - generic [ref=e484]: Pharmacist Reviewed
        - img "Asper Certified — Authentic Quality — Pharmacist Curated" [ref=e487]:
          - generic [ref=e498]: ASPER CERTIFIED
          - generic [ref=e499]: AUTHENTIC QUALITY • PHARMACIST CURATED
        - paragraph [ref=e502]: Packaging design may vary from images shown due to manufacturer updates. Product formulation and ingredients remain unchanged.
        - paragraph [ref=e503]: © 2026 Asper Beauty Shop. All Rights Reserved.
      - generic [ref=e506]:
        - generic [ref=e507]:
          - heading "Top Brands" [level=3] [ref=e508]
          - generic [ref=e509]:
            - link "Vichy" [ref=e510] [cursor=pointer]:
              - /url: /brands?brand=Vichy
            - link "La Roche-Posay" [ref=e511] [cursor=pointer]:
              - /url: /brands?brand=La%20Roche-Posay
            - link "Maybelline" [ref=e512] [cursor=pointer]:
              - /url: /brands?brand=Maybelline
            - link "L'Oréal Paris" [ref=e513] [cursor=pointer]:
              - /url: /brands?brand=L'Or%C3%A9al%20Paris
            - link "Garnier" [ref=e514] [cursor=pointer]:
              - /url: /brands?brand=Garnier
            - link "Neutrogena" [ref=e515] [cursor=pointer]:
              - /url: /brands?brand=Neutrogena
            - link "CeraVe" [ref=e516] [cursor=pointer]:
              - /url: /brands?brand=CeraVe
            - link "Eucerin" [ref=e517] [cursor=pointer]:
              - /url: /brands?brand=Eucerin
            - link "Bioderma" [ref=e518] [cursor=pointer]:
              - /url: /brands?brand=Bioderma
            - link "Avène" [ref=e519] [cursor=pointer]:
              - /url: /brands?brand=Av%C3%A8ne
            - link "The Ordinary" [ref=e520] [cursor=pointer]:
              - /url: /brands?brand=The%20Ordinary
            - link "Paula's Choice" [ref=e521] [cursor=pointer]:
              - /url: /brands?brand=Paula's%20Choice
            - link "Diptyque" [ref=e522] [cursor=pointer]:
              - /url: /brands?brand=Diptyque
            - link "Byredo" [ref=e523] [cursor=pointer]:
              - /url: /brands?brand=Byredo
            - link "Augustinus Bader" [ref=e524] [cursor=pointer]:
              - /url: /brands?brand=Augustinus%20Bader
        - generic [ref=e525]:
          - heading "Top Categories" [level=3] [ref=e526]
          - generic [ref=e527]:
            - link "Skincare" [ref=e528] [cursor=pointer]:
              - /url: /collections/skincare
            - link "Makeup" [ref=e529] [cursor=pointer]:
              - /url: /collections/makeup
            - link "Perfume" [ref=e530] [cursor=pointer]:
              - /url: /collections/fragrance
            - link "Hair Care" [ref=e531] [cursor=pointer]:
              - /url: /collections/hair
            - link "Anti-Aging" [ref=e532] [cursor=pointer]:
              - /url: /concerns/anti-aging
            - link "Acne Treatment" [ref=e533] [cursor=pointer]:
              - /url: /concerns/acne
            - link "Hydration" [ref=e534] [cursor=pointer]:
              - /url: /concerns/hydration
            - link "Sun Protection" [ref=e535] [cursor=pointer]:
              - /url: /concerns/sun-protection
            - link "Brightening" [ref=e536] [cursor=pointer]:
              - /url: /concerns/brightening
            - link "Sensitive Skin" [ref=e537] [cursor=pointer]:
              - /url: /concerns/sensitivity
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Asper Beauty Shop — Critical User Flows", () => {
  4  |   test("homepage loads with content", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await page.waitForLoadState("networkidle");
  7  |     await expect(page).toHaveTitle(/Asper Beauty/i);
  8  |     await expect(page.locator("#root")).not.toBeEmpty();
  9  |     await expect(page.locator("section, div").first()).toBeVisible({ timeout: 15000 });
  10 |   });
  11 | 
  12 |   test("shop page loads products", async ({ page }) => {
  13 |     await page.goto("/shop");
  14 |     await page.waitForLoadState("networkidle");
  15 |     await page.waitForTimeout(3000);
  16 |     const productCards = page.locator("article");
  17 |     await expect(productCards.first()).toBeVisible({ timeout: 20000 });
  18 |     const count = await productCards.count();
  19 |     expect(count).toBeGreaterThan(0);
  20 |   });
  21 | 
  22 |   test("product detail page loads from shop", async ({ page }) => {
  23 |     await page.goto("/shop");
  24 |     await page.waitForLoadState("networkidle");
  25 |     await page.waitForTimeout(3000);
  26 |     const firstProduct = page.locator("article").first();
> 27 |     await expect(firstProduct).toBeVisible({ timeout: 20000 });
     |                                ^ Error: expect(locator).toBeVisible() failed
  28 |     await firstProduct.click();
  29 |     await page.waitForLoadState("networkidle");
  30 |     await page.waitForTimeout(2000);
  31 |     await expect(page.locator("#root")).not.toBeEmpty();
  32 |   });
  33 | 
  34 |   test("brands page loads", async ({ page }) => {
  35 |     await page.goto("/brands");
  36 |     await page.waitForLoadState("networkidle");
  37 |     await page.waitForTimeout(2000);
  38 |     await expect(page.locator("#root")).not.toBeEmpty();
  39 |   });
  40 | 
  41 |   test("skin concerns page loads", async ({ page }) => {
  42 |     await page.goto("/skin-concerns");
  43 |     await page.waitForLoadState("networkidle");
  44 |     await page.waitForTimeout(2000);
  45 |     await expect(page.locator("#root")).not.toBeEmpty();
  46 |   });
  47 | 
  48 |   test("cart opens and shows empty state", async ({ page }) => {
  49 |     await page.goto("/");
  50 |     const cartButton = page.locator('button:has(svg)').filter({ hasText: /bag|cart|سلة/i }).first();
  51 |     if (await cartButton.isVisible()) {
  52 |       await cartButton.click();
  53 |       await expect(page.locator("text=/empty|فارغة/i").first()).toBeVisible({ timeout: 5000 });
  54 |     }
  55 |   });
  56 | 
  57 |   test("language toggle switches to Arabic", async ({ page }) => {
  58 |     await page.goto("/");
  59 |     const langToggle = page.locator('button:has-text("عربي"), button:has-text("AR"), [aria-label*="language"], [aria-label*="اللغة"]').first();
  60 |     if (await langToggle.isVisible()) {
  61 |       await langToggle.click();
  62 |       await page.waitForTimeout(500);
  63 |       const dir = await page.locator("html").getAttribute("dir");
  64 |       expect(dir).toBe("rtl");
  65 |     }
  66 |   });
  67 | 
  68 |   test("navigation links work", async ({ page }) => {
  69 |     const routes = ["/shop", "/brands", "/best-sellers", "/contact"];
  70 |     for (const route of routes) {
  71 |       const response = await page.goto(route);
  72 |       expect(response?.status()).toBeLessThan(400);
  73 |     }
  74 |   });
  75 | 
  76 |   test("responsive: mobile viewport renders correctly", async ({ page }) => {
  77 |     await page.setViewportSize({ width: 375, height: 812 });
  78 |     await page.goto("/");
  79 |     await page.waitForLoadState("networkidle");
  80 |     await page.waitForTimeout(2000);
  81 |     await expect(page.locator("#root")).not.toBeEmpty();
  82 |   });
  83 | });
  84 | 
```