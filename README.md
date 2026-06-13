# ENDURA İş Takip

Google Sheets veri tabanlı, Vercel üzerinde çalışacak basit iş takip uygulaması.

## Mimari

```text
Kullanıcı -> Next.js UI -> API Routes -> Google Sheets API -> Google Sheets
                       -> NextAuth Google Login
```

- Arayüz: Next.js App Router
- Kimlik: Google Login / NextAuth
- Veri: Google Sheets
- Yayın: Vercel
- Yetki: `Permissions` sheet'i

## Sheet yapısı

Birinci spreadsheet içinde şu sekmeler olmalı:

1. `Tasks`
2. `Updates`
3. `Topics`
4. `Assignees`

İkinci spreadsheet veya aynı spreadsheet içinde:

5. `Permissions`

Örnek CSV dosyaları `sheets/` klasöründedir.

## Kurulum

### 1. Google Cloud

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

Google Sheets service account bilgileri yoksa uygulama lokal geliştirmede otomatik olarak `sheets/*.csv` dosyalarını kullanır. Bu modda yeni kayıt ve güncellemeler CSV dosyalarına yazılır; Google Sheets'e geçmek için service account env değerlerini eklemek yeterlidir.

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
