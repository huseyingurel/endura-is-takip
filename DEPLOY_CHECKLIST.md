# Endura Is Takip Deploy Checklist

## 1. Repo Hazirligi

- [x] Ayrı proje klasoru: `C:\Users\husey\Desktop\cursor\endura-is-takip`
- [x] Ayrı git deposu baslatildi
- [x] Gercek paket kurulumu tamamlandi
- [x] `package-lock.json` uretildi
- [x] Gecici `node_modules` junction kaldirildi
- [x] `npm run lint` basarili
- [x] `npm run build` basarili
- [x] `npm audit --omit=dev` temiz

## 2. GitHub

- [x] Yeni GitHub repo olustur
- [x] Remote ekle
- [x] Ilk commit
- [x] `main` branch push

## 3. Google Sheets + Apps Script

Asagidaki sekmeler ayni spreadsheet icinde hazir olacak:

- `Tasks`
- `Updates`
- `Topics`
- `Assignees`
- `Attachments`
- `Permissions`

Kontrol:

- [ ] Google Sheet icinde `Uzantilar > Apps Script` ac
- [ ] `google-apps-script/Code.gs` kodunu yapistir
- [ ] Script property olarak `SPREADSHEET_ID` ekle
- [ ] Script property olarak `APP_TOKEN` ekle
- [ ] Web App deploy et: Execute as `Me`, access `Anyone`
- [ ] Web App URL degerini not et
- [ ] Ilk cagri ile sekmelerin/basliklarin olustugunu kontrol et
- [ ] Dosya ekleri icin Apps Script kodunu yeniden deploy et
- [ ] Google Drive'da `Endura Is Takip Dosyalari` veya `Endura İş Takip Dosyaları` klasorunun olustugunu kontrol et

Alternatif ileri yol:

- [ ] Service account olustur
- [ ] Service account e-postasini sheet ile `Editor` olarak paylas
- [ ] Sheet ID degerlerini not et

## 4. Google Login

Auth.js Google provider icin callback URL:

- Lokal: `http://localhost:3002/api/auth/callback/google`
- Production: `https://endura-is-takip.vercel.app/api/auth/callback/google`

Kontrol:

- [ ] Google Cloud OAuth client olustur
- [ ] Authorized redirect URI olarak production callback ekle
- [ ] Client ID ve Client Secret hazirla
- [x] Auth.js route production koduna baglandi
- [x] Production sign-in sayfasi 200 donuyor

## 5. Vercel Environment Variables

Gerekli degiskenler:

- `GOOGLE_TASKS_SPREADSHEET_ID`
- `GOOGLE_PERMISSIONS_SPREADSHEET_ID`
- `GOOGLE_APPS_SCRIPT_URL`
- `GOOGLE_APPS_SCRIPT_TOKEN`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_URL`
- `AUTH_SECRET`

Service account alternatifi kullanilirsa ayrica:

- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`

Durum:

- [x] `AUTH_URL`
- [x] `AUTH_SECRET`
- [x] `GOOGLE_TASKS_SPREADSHEET_ID`
- [x] `GOOGLE_PERMISSIONS_SPREADSHEET_ID`
- [ ] `GOOGLE_APPS_SCRIPT_URL`
- [ ] `GOOGLE_APPS_SCRIPT_TOKEN`
- [ ] `AUTH_GOOGLE_ID`
- [ ] `AUTH_GOOGLE_SECRET`

## 6. Vercel Import

Vercel Git import sirasinda:

- [x] Proje adini kontrol et
- [x] Framework preset olarak `Next.js` sec
- [x] Root directory dogruysa oldugu gibi birak
- [ ] Environment variables alanini tamamla
- [x] Deploy baslat

Production URL:

- `https://endura-is-takip.vercel.app`

## 7. Smoke Test

- [x] Ana sayfa aciliyor
- [ ] `Topics` listesi geliyor
- [ ] `Assignees` listesi geliyor
- [x] Auth.js sign-in sayfasi aciliyor
- [ ] Google OAuth ile giris tamamlanabiliyor
- [ ] Gorev olusturma Google Sheets'e yaziyor
- [ ] Gorev guncelleme Google Sheets'e yaziyor
- [ ] Yetki filtreleri dogru calisiyor

## Notlar

- Sistem Node `v26.3.0` ile npm ic hata verdigi icin proje icinde tasinabilir Node LTS `v24.16.0` kullanildi.
- `.tools` klasoru git disinda tutulur; Vercel kendi Linux ortaminda lockfile uzerinden kurulum yapacak.
