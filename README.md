# ENDURA İş Takip

Google Sheets veri tabanlı, Vercel üzerinde çalışacak basit iş takip uygulaması.

## Mimari

```text
Kullanıcı -> Next.js UI -> API Routes -> Apps Script Web App -> Google Sheets
                       -> NextAuth Google Login
```

- Arayüz: Next.js App Router
- Kimlik: Google Login / NextAuth
- Veri: Google Sheets. Kolay kurulumda Sheet'e bağlı Apps Script Web App kullanılır.
- Yayın: Vercel
- Yetki: `Permissions` sheet'i

## Sheet yapısı

Birinci spreadsheet içinde şu sekmeler olmalı:

1. `Tasks`
2. `Updates`
3. `Topics`
4. `Assignees`
5. `Attachments`

İkinci spreadsheet veya aynı spreadsheet içinde:

6. `Permissions`

Örnek CSV dosyaları `sheets/` klasöründedir.

## Kurulum

### 1. Google Sheets + Apps Script

Service account/private key kullanmadan en kolay yol budur.

1. Google Sheet dosyasını aç:
   - `https://docs.google.com/spreadsheets/d/1GypTun_lGQ-SgrCtmw4FScEgkH2Q3LE05HR2kTLGnps/edit`
2. Menüden `Uzantılar > Apps Script` seç.
3. `google-apps-script/Code.gs` içeriğini Apps Script editörüne yapıştır.
4. Sol menüden `Project Settings > Script properties` altında şunları ekle:
   - `APP_TOKEN`: uzun ve tahmin edilemez bir değer
   - `SPREADSHEET_ID`: `1GypTun_lGQ-SgrCtmw4FScEgkH2Q3LE05HR2kTLGnps`
5. `Deploy > New deployment > Web app` seç.
6. Ayarlar:
   - Execute as: `Me`
   - Who has access: `Anyone`
7. Web App URL'ini Vercel'de `GOOGLE_APPS_SCRIPT_URL` olarak ekle.
8. `APP_TOKEN` değerini Vercel'de `GOOGLE_APPS_SCRIPT_TOKEN` olarak ekle.

Script ilk çağrıda şu sekmeleri ve başlıkları oluşturur:

- `Tasks`
- `Updates`
- `Topics`
- `Assignees`
- `Attachments`
- `Permissions`

`Topics`, `Assignees` ve `Permissions` sekmelerini daha sonra doğrudan Google Sheets üzerinden düzenleyebilirsin.
Dosya ve fotoğraf ekleri Google Drive'da `Endura İş Takip Dosyaları` klasöründe saklanır; `Attachments` sekmesinde dosya linkleri ve ilişkili kayıt bilgileri tutulur.

### Alternatif: Google Cloud service account

Apps Script yerine doğrudan Google Sheets API kullanmak istersen:

1. Google Cloud Console'da proje aç.
2. Google Sheets API'yi etkinleştir.
3. Service Account oluştur.
4. Service Account için JSON key üret.
5. İlgili Google Sheet dosyalarını service account e-postasıyla paylaş.
   - Örnek: `endura-sheets@project.iam.gserviceaccount.com`
   - Yetki: Editor

### 2. Google OAuth

1. OAuth consent screen ayarla.
2. Web application OAuth client oluştur.
3. Authorized redirect URI ekle:
   - Lokal: `http://localhost:3002/api/auth/callback/google`
   - Vercel: `https://endura-is-takip.vercel.app/api/auth/callback/google`

### 3. Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyala ve doldur.

```bash
cp .env.example .env.local
```

Gerekli değişkenler:

```bash
GOOGLE_TASKS_SPREADSHEET_ID=
GOOGLE_PERMISSIONS_SPREADSHEET_ID=
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_APPS_SCRIPT_TOKEN=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
AUTH_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Lokal hızlı test için:

```bash
DEV_USER_EMAIL=huseyin@example.com
DEV_USER_NAME=Hüseyin Gürel
```

Production'da `DEV_USER_EMAIL` boş bırakılmalı.

`GOOGLE_APPS_SCRIPT_URL` doluysa uygulama Google Sheets'e Apps Script üzerinden okur/yazar. Bu değer boşsa ve service account bilgileri yoksa lokal geliştirmede otomatik olarak `sheets/*.csv` dosyalarını kullanır.

### 4. Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda:

```text
http://localhost:3002
```

### 5. İlk başlıkları oluşturma

Admin kullanıcıyla oturum açtıktan sonra şu endpoint'e PUT isteği göndererek sheet başlıklarını yazabilirsin:

```bash
curl -X PUT http://localhost:3000/api/tasks
```

Alternatif: `sheets/` klasöründeki CSV dosyalarını ilgili Google Sheet sekmelerine manuel yükle.

## Vercel deploy

1. Projeyi GitHub'a gönder.
2. Vercel'de New Project > GitHub repo seç.
3. Environment Variables alanına `.env.local` içindeki production değerlerini gir.
4. Deploy et.
5. Google OAuth redirect URI'ye Vercel URL'ini eklemeyi unutma.

## Antigravity geliştirme promptu

Aşağıdaki promptu Antigravity içinde repo açıkken kullan:

```text
Bu repo ENDURA için Google Sheets tabanlı basit iş takip uygulamasıdır. Next.js App Router, TypeScript, NextAuth Google Login ve Google Sheets API kullanır.

Hedefler:
1. UI'yı daha kurumsal ve mobil uyumlu hale getir.
2. Görev formuna validasyon ve daha iyi hata mesajları ekle.
3. Permissions sheet'e göre butonları sadece yetki varsa göster.
4. Takip konusu detayında statü geçmişi görünümü ekle.
5. Google Sheets okuma/yazma işlemlerinde daha iyi hata yakalama ve boş sheet durumunu yönet.
6. Vercel deploy için README adımlarını güncel tut.

Mevcut veri modeli:
- Tasks
- Updates
- Topics. Konu gruplarını Google Sheets'teki `Topics` sekmesinden düzenleyebilirsin; uygulama yenilendiğinde aktif konuları buradan okur.
- Assignees. Görevli listesini Google Sheets'teki `Assignees` sekmesinden düzenleyebilirsin; uygulama yenilendiğinde aktif görevlileri buradan okur.
- Permissions

Statüler:
Başladı, İlerliyor, Duraksadı, Tamamlandı.

Güncelleme tipleri:
Güncelleme, Fikir, Soru, Risk, Karar.

Kodda gereksiz karmaşıklık yaratma. Bu ürün Trello/Asana/Monday değil; onların hafif, ENDURA'ya göre uyarlanmış takip kokpiti olacak.
```

## Notlar

- Google Sheets aynı anda çok yoğun yazma trafiği için gerçek bir veritabanı değildir; bu proje 10-50 kişilik sade takip için uygundur.
- Veri Sheet'te durduğu için yönetim gerektiğinde doğrudan Sheet üzerinden düzeltme yapabilir.
- Hassas veri veya müşteri kişisel verisi eklenirse KVKK/GDPR değerlendirmesi ayrıca yapılmalıdır.
