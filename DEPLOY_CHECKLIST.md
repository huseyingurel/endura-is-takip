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

- [ ] Yeni GitHub repo olustur
- [ ] Remote ekle
- [ ] Ilk commit
- [ ] `main` branch push

## 3. Google Sheets

Asagidaki sekmeler ayni spreadsheet icinde hazir olacak:

- `Tasks`
- `Updates`
- `Topics`
- `Assignees`
- `Permissions`

Kontrol:

- [ ] Service account olustur
- [ ] Service account e-postasini sheet ile `Editor` olarak paylas
- [ ] Sheet ID degerlerini not et

## 4. Google Login

Auth.js Google provider icin callback URL:

- Lokal: `http://localhost:3002/api/auth/callback/google`
- Production: `https://<your-domain>/api/auth/callback/google`

Kontrol:

- [ ] Google Cloud OAuth client olustur
- [ ] Authorized redirect URI olarak production callback ekle
- [ ] Client ID ve Client Secret hazirla

## 5. Vercel Environment Variables

Gerekli degiskenler:

- `GOOGLE_TASKS_SPREADSHEET_ID`
- `GOOGLE_PERMISSIONS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## 6. Vercel Import

Vercel Git import sirasinda:

- Proje adini kontrol et
- Framework preset olarak `Next.js` sec
- Root directory dogruysa oldugu gibi birak
- Environment variables alanini doldur
- Deploy baslat

## 7. Smoke Test

- [ ] Ana sayfa aciliyor
- [ ] `Topics` listesi geliyor
- [ ] `Assignees` listesi geliyor
- [ ] Google login calisiyor
- [ ] Gorev olusturma Google Sheets'e yaziyor
- [ ] Gorev guncelleme Google Sheets'e yaziyor
- [ ] Yetki filtreleri dogru calisiyor

## Notlar

- Sistem Node `v26.3.0` ile npm ic hata verdigi icin proje icinde tasinabilir Node LTS `v24.16.0` kullanildi.
- `.tools` klasoru git disinda tutulur; Vercel kendi Linux ortaminda lockfile uzerinden kurulum yapacak.
