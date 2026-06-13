# ENDURA Basit İş Takip Uygulaması — Product Requirements Document

**Doküman tipi:** PRD / Product Requirements Document  
**Kullanım amacı:** Antigravity ile geliştirilecek Next.js + Google Sheets + Vercel uygulaması için ürün ve geliştirme gereksinimleri  
**Ürün adı:** ENDURA İş Takip Kokpiti  
**Sürüm:** v1.0 MVP  
**Tarih:** 2026-06-11  
**Ürün sahibi:** ENDURA / Hüseyin Gürel  

---

## 1. Ürün Özeti

ENDURA İş Takip Kokpiti; Trello, Asana ve Monday benzeri ama çok daha sade, Google Sheets veri tabanlı, Vercel üzerinde çalışan bir iş takip uygulamasıdır. Uygulama; konu, görev, fikir, soru, risk, karar ve güncellemeleri tek bir arayüzde takip etmeyi sağlar.

Uygulamanın temel farkı şudur: Veriler klasik bir veritabanında değil, Google Drive üzerinde duran Google Sheets dosyalarında saklanır. Böylece yetkili kullanıcılar verileri hem uygulama arayüzünden hem de gerektiğinde doğrudan Google Sheets üzerinden düzenleyebilir.

Uygulama özellikle ENDURA içindeki bayilik, satış, operasyon, pazarlama, iş geliştirme, bayi ilişkileri, otomotiv markalarıyla temaslar, fizibilite çalışmaları ve proje takip başlıkları için kullanılacaktır.

---

## 2. Amaç

Bu ürünün amacı ENDURA içindeki dağınık iş takiplerini merkezi, sade, yetki kontrollü ve yönetim tarafından izlenebilir hale getirmektir.

Kullanıcılar uygulama üzerinden:

- Yeni takip konusu açabilmeli.
- Mevcut konulara güncelleme, fikir, soru, risk ve karar notu ekleyebilmeli.
- Konuları statüye, sorumluya, önceliğe, konu grubuna ve tarihe göre izleyebilmeli.
- Dashboard üzerinden genel durumu görebilmeli.
- Yetki matrisine göre sadece kendi yetkili olduğu başlıklarda işlem yapabilmeli.
- Google Sheets üzerinden yapılan değişiklikleri uygulamada görebilmeli.

---

## 3. Ürün Konumlandırması

Bu ürün bir kurumsal ERP, tam kapsamlı proje yönetim sistemi veya ağır BPM aracı değildir.

Konumlandırma:

> Trello kadar görsel, Asana kadar takip edilebilir, Monday kadar kokpit mantığı olan; fakat ENDURA için sadeleştirilmiş, Google Sheets tabanlı hafif bir iş takip uygulaması.

Ürün şu felsefeyle geliştirilmelidir:

- Kullanıcı işi 30 saniye içinde açabilmeli.
- Yönetici 30 saniye içinde genel resmi görebilmeli.
- Takım üyesi kendisiyle ilgili işleri filtrelemeden kaybolmamalı.
- Google Sheets, sistemin tek veri kaynağı olarak kalmalı.
- Teknik karmaşıklık kullanıcıya yansımamalı.

---

## 4. Mevcut Girdi Dokümanları

Uygulama aşağıdaki iki Google Sheets dosyasını temel alacaktır:

### 4.1 Takip Tablosu

Google Sheet URL:

```text
https://docs.google.com/spreadsheets/d/1GypTun_lGQ-SgrCtmw4FScEgkH2Q3LE05HR2kTLGnps/edit?usp=sharing
```

Spreadsheet ID:

```text
1GypTun_lGQ-SgrCtmw4FScEgkH2Q3LE05HR2kTLGnps
```

Bu dosya takip edilecek işler, konular ve görevler için temel veri kaynağıdır.

### 4.2 Takım ve Yetki Matrisi

Google Sheet URL:

```text
https://docs.google.com/spreadsheets/d/12tSYZJywTWMj4rSQ-wnr0juxPKa_d9er/edit?usp=sharing&ouid=114061829938637932304&rtpof=true&sd=true
```

Spreadsheet ID:

```text
12tSYZJywTWMj4rSQ-wnr0juxPKa_d9er
```

Bu dosya kullanıcıların hangi konu başlıklarında hangi işlemleri yapabileceğini belirler.

---

## 5. Hedef Kullanıcılar

### 5.1 Yönetim / Admin

- Tüm konu gruplarını görür.
- Yeni konu grubu tanımlayabilir.
- Tüm takip konularını açabilir, düzenleyebilir ve kapatabilir.
- Dashboard üzerinden genel durumu izler.
- Yetki matrisini yönetir.

### 5.2 Konu Sahibi

- Kendisine atanmış konu grubundaki işleri izler.
- Yeni takip konusu açabilir.
- Mevcut konuları güncelleyebilir.
- Konu statüsünü değiştirebilir.
- Geciken veya duraksayan işleri yönetir.

### 5.3 Takım Üyesi

- Yetkili olduğu konu gruplarını görür.
- Kendisine atanmış işleri takip eder.
- Güncelleme, fikir, soru, risk ve karar notu girebilir.
- Yetkisi varsa statü güncelleyebilir.

### 5.4 İzleyici

- Sadece yetkili olduğu başlıkları görüntüler.
- Veri değiştiremez.
- Dashboard veya liste üzerinden durumu izler.

---

## 6. Temel Kullanım Senaryoları

### Senaryo 1 — Yeni takip konusu açma

Bir kullanıcı yetkili olduğu konu grubunda yeni bir takip konusu açar.

Örnek:

- Konu grubu: Bayilik Sistemi
- Başlık: İzmit PPF uygulama atölyesi lokasyon analizi
- Öncelik: Yüksek
- Statü: Başladı
- Sorumlu: İlgili takım üyesi
- Hedef tarih: 2026-06-30

Sistem bu kaydı `Tasks` sheet'ine yeni satır olarak yazar.

### Senaryo 2 — Konuya fikir ekleme

Yetkili bir kullanıcı mevcut bir konuya fikir ekler.

Örnek:

- Tip: Fikir
- Metin: “D-130 aksında BYD, Renault ve Stellantis bayilerine yakın lokasyonlar ayrıca puanlanmalı.”

Sistem bu kaydı `Updates` sheet'ine yeni satır olarak yazar.

### Senaryo 3 — Konuya soru ekleme

Bir kullanıcı konuyla ilgili açık soru ekler.

Örnek:

- Tip: Soru
- Metin: “İzmit’teki yetkili satıcılarla alt yüklenici ilişkisi var mı?”

Soru, ilgili task detayında görünür.

### Senaryo 4 — Statü güncelleme

Konu sahibi işin statüsünü “İlk çalışma yapıldı” veya “İlerliyor” olarak değiştirir.

Sistem:

- `Tasks.statu` alanını günceller.
- `Tasks.updatedAt` ve `Tasks.updatedBy` alanlarını günceller.
- İsteğe bağlı olarak `Updates` içine otomatik statü notu ekler.

### Senaryo 5 — Dashboard izleme

Yönetici uygulamaya girdiğinde:

- Toplam açık konu sayısını,
- Geciken işleri,
- Duraksayan işleri,
- Kapanan işleri,
- Ortalama ilerlemeyi,
- Konu grubu bazlı dağılımı,
- Öncelik bazlı riskleri görür.

---

## 7. Statü Akışı

Statüler sade ve iş takibine uygun olmalıdır.

| Statü | Anlamı | Yönetim yorumu |
|---|---|---|
| Başladı | Konu açıldı, sorumlusu belli | Henüz erken aşama |
| İlk çalışma yapıldı | Konu için ilk analiz/temas/çıktı üretildi | İş somutlaşmaya başladı |
| İlerliyor | Aktif çalışma devam ediyor | Normal takip |
| Duraksadı | İşte bekleme, engel veya belirsizlik var | Yönetim dikkati gerekir |
| Tamamlanıyor | İş kapanışa yakın | Son kontrol gerekir |
| Kapandı | İş tamamlandı veya kapatıldı | Aktif takipten çıkar |

### 7.1 Statü Geçiş Kuralları

MVP aşamasında statü geçişleri serbest bırakılabilir. Ancak UI içinde önerilen akış şu olmalıdır:

```text
Başladı -> İlk çalışma yapıldı -> İlerliyor -> Tamamlanıyor -> Kapandı
```

Herhangi bir aşamada sorun çıkarsa:

```text
Başladı / İlk çalışma yapıldı / İlerliyor / Tamamlanıyor -> Duraksadı
```

Duraksayan iş tekrar canlanırsa:

```text
Duraksadı -> İlerliyor
```

---

## 8. Güncelleme Tipleri

Her takip konusuna bağlı alt kayıtlar şu tiplerde tutulmalıdır:

| Tip | Açıklama |
|---|---|
| Güncelleme | İşin genel ilerleme notu |
| Fikir | Konuyla ilgili öneri veya geliştirme fikri |
| Soru | Cevap bekleyen açık soru |
| Risk | İşin ilerlemesini etkileyebilecek risk |
| Karar | Alınmış karar veya mutabakat |
| Engel | İşi durduran veya yavaşlatan konu |

MVP'de ilk beş tip yeterlidir. `Engel` tipi v1.1 fazında eklenebilir veya MVP'ye dahil edilebilir.

---

## 9. Fonksiyonel Gereksinimler

### FR-01 — Google ile giriş

Kullanıcı Google hesabı ile giriş yapmalıdır.

Kabul kriterleri:

- Kullanıcı Google hesabıyla oturum açabilir.
- Oturum açan kullanıcının e-posta adresi sistemde bilinir.
- E-posta adresi `Permissions` sheet'i ile eşleştirilir.
- Yetki kaydı olmayan kullanıcıya kontrollü erişim reddi gösterilir.

### FR-02 — Yetki matrisini okuma

Sistem `Permissions` sheet'ini okuyarak kullanıcının yetkilerini belirlemelidir.

Kabul kriterleri:

- Kullanıcının yetkili olduğu konu grupları belirlenir.
- `*` konu grubu tüm konu grupları için yetki anlamına gelir.
- Yetkisiz konu grupları listede görünmez.
- Butonlar yetkiye göre görünür veya pasif olur.

### FR-03 — Görevleri / takip konularını listeleme

Sistem `Tasks` sheet'inden takip konularını okumalıdır.

Kabul kriterleri:

- Yetkili kullanıcı sadece görebileceği kayıtları listeler.
- Liste varsayılan olarak açık işleri gösterir.
- Kapalı işler filtreyle gösterilebilir.
- Liste; konu grubu, statü, öncelik, sorumlu ve hedef tarihe göre filtrelenebilir.

### FR-04 — Dashboard

Kullanıcıya yetkisine göre dashboard gösterilmelidir.

Kabul kriterleri:

- Toplam konu sayısı gösterilir.
- Açık konu sayısı gösterilir.
- Geciken konu sayısı gösterilir.
- Duraksayan konu sayısı gösterilir.
- Kapanan konu sayısı gösterilir.
- Ortalama ilerleme yüzdesi gösterilir.
- Konu grubu bazlı dağılım gösterilir.

### FR-05 — Yeni takip konusu açma

Yetkili kullanıcı yeni takip konusu açabilmelidir.

Kabul kriterleri:

- `canCreate=true` olmayan kullanıcı yeni konu açamaz.
- Zorunlu alanlar doldurulmadan kayıt yapılamaz.
- Yeni kayıt `Tasks` sheet'ine append edilir.
- Yeni kayıtta `createdAt`, `createdBy`, `updatedAt`, `updatedBy` alanları otomatik dolar.

### FR-06 — Takip konusu güncelleme

Yetkili kullanıcı mevcut takip konusunu güncelleyebilmelidir.

Kabul kriterleri:

- `canUpdate=true` olmayan kullanıcı ana görev alanlarını değiştiremez.
- Statü, öncelik, hedef tarih, ilerleme ve sorumlu alanları güncellenebilir.
- Güncelleme sonrası `updatedAt`, `updatedBy` otomatik değişir.
- Sheet üzerinde ilgili satır güncellenir.

### FR-07 — Güncelleme / fikir / soru / risk / karar ekleme

Yetkili kullanıcı takip konusuna alt not ekleyebilmelidir.

Kabul kriterleri:

- `canComment=true` olmayan kullanıcı not ekleyemez.
- Not tipi seçilebilir.
- Not metni zorunludur.
- Kayıt `Updates` sheet'ine append edilir.
- Task detay ekranında kronolojik görünür.

### FR-08 — Konu kapatma

Yetkili kullanıcı konuyu kapatabilmelidir.

Kabul kriterleri:

- `canClose=true` olmayan kullanıcı statüyü `Kapandı` yapamaz.
- Kapatma sırasında kapanış notu istenir.
- Kapanan iş dashboard’da ayrı sayılır.
- Kapalı işler varsayılan listede gösterilmeyebilir.

### FR-09 — Kanban görünümü

Sistem konuları statülere göre kart görünümünde göstermelidir.

Kabul kriterleri:

- Her statü bir kolon olarak görünür.
- Kartta başlık, konu grubu, sorumlu, öncelik, hedef tarih ve ilerleme görünür.
- MVP'de sürükle-bırak şart değildir; statü değişimi detay/form üzerinden yapılabilir.
- v1.1'de drag-and-drop eklenebilir.

### FR-10 — Liste görünümü

Sistem Excel mantığına yakın tablo görünümü sunmalıdır.

Kabul kriterleri:

- Kolonlar okunaklıdır.
- Arama yapılabilir.
- Filtreleme yapılabilir.
- Satıra tıklanınca detay paneli açılır.

### FR-11 — Konu detay ekranı

Her takip konusu için detay görünümü olmalıdır.

Kabul kriterleri:

- Ana bilgiler görünür.
- Güncellemeler kronolojik listelenir.
- Yeni güncelleme ekleme formu bulunur.
- Yetkiye göre düzenleme alanları açılır veya kapanır.

### FR-12 — Google Sheets ile çift yönlü çalışma

Veri hem uygulamadan hem Google Sheets üzerinden değiştirilebilmelidir.

Kabul kriterleri:

- Sheet'te yapılan değişiklik uygulama yenilendiğinde görünür.
- Uygulamadan yapılan değişiklik Sheet'e yazılır.
- Sheet kolon başlıkları sabit tutulur.
- Kolon sırası değişirse uygulama başlıklara göre map etmeye çalışır.

---

## 10. Veri Modeli

Google Sheets dosyalarında aşağıdaki sekmeler bulunmalıdır.

### 10.1 `Tasks` Sheet'i

Ana takip konuları.

| Kolon | Tip | Zorunlu | Açıklama |
|---|---|---:|---|
| id | string | Evet | Benzersiz kayıt ID |
| konuGrubu | string | Evet | Konu grubu |
| baslik | string | Evet | Takip konusu başlığı |
| aciklama | string | Hayır | Açıklama |
| gorevliEmail | string | Hayır | Sorumlu e-posta |
| gorevliAd | string | Hayır | Sorumlu adı |
| oncelik | enum | Evet | Düşük / Normal / Yüksek / Kritik |
| statu | enum | Evet | Başladı / İlk çalışma yapıldı / İlerliyor / Duraksadı / Tamamlanıyor / Kapandı |
| baslangicTarihi | date | Hayır | Başlangıç tarihi |
| hedefTarih | date | Hayır | Hedef tarih |
| ilerleme | number | Hayır | 0-100 |
| etiketler | string | Hayır | Virgülle ayrılmış etiketler |
| sonGuncelleme | string | Hayır | Son kısa not |
| createdAt | datetime | Evet | Oluşturma zamanı |
| createdBy | string | Evet | Oluşturan e-posta |
| updatedAt | datetime | Evet | Güncelleme zamanı |
| updatedBy | string | Evet | Güncelleyen e-posta |

### 10.2 `Updates` Sheet'i

Takip konusuna bağlı güncelleme kayıtları.

| Kolon | Tip | Zorunlu | Açıklama |
|---|---|---:|---|
| id | string | Evet | Benzersiz not ID |
| taskId | string | Evet | Bağlı task ID |
| tip | enum | Evet | Güncelleme / Fikir / Soru / Risk / Karar |
| metin | string | Evet | Not içeriği |
| yazarEmail | string | Evet | Yazanın e-posta adresi |
| yazarAd | string | Hayır | Yazanın adı |
| createdAt | datetime | Evet | Oluşturma zamanı |
| ekLink | string | Hayır | İlgili doküman / Drive / URL linki |

### 10.3 `Permissions` Sheet'i

Takım ve yetki matrisi.

| Kolon | Tip | Zorunlu | Açıklama |
|---|---|---:|---|
| email | string | Evet | Kullanıcı e-postası |
| adSoyad | string | Evet | Kullanıcı adı |
| rol | string | Hayır | Admin / Konu Sahibi / Takım Üyesi / İzleyici |
| konuGrubu | string | Evet | Yetkili olduğu konu grubu veya `*` |
| canView | boolean | Evet | Görebilir |
| canCreate | boolean | Evet | Yeni konu açabilir |
| canUpdate | boolean | Evet | Ana kayıt güncelleyebilir |
| canComment | boolean | Evet | Güncelleme/fikir/soru/risk/karar ekleyebilir |
| canClose | boolean | Evet | Konu kapatabilir |
| canAdmin | boolean | Evet | Yönetici yetkisi |

Boolean değerler Google Sheets'te şu formatlardan biriyle kabul edilebilir:

```text
TRUE/FALSE
true/false
1/0
Evet/Hayır
```

Uygulama bu değerleri normalize etmelidir.

### 10.4 `Topics` Sheet'i

Konu grupları.

| Kolon | Tip | Zorunlu | Açıklama |
|---|---|---:|---|
| konuGrubu | string | Evet | Konu grubu adı |
| aciklama | string | Hayır | Açıklama |
| sahipEmail | string | Hayır | Konu sahibi |
| aktif | boolean | Evet | Aktif/pasif |

### 10.5 Opsiyonel `AuditLog` Sheet'i

v1.1 için önerilir.

| Kolon | Açıklama |
|---|---|
| id | Log ID |
| entityType | Task / Update / Permission / Topic |
| entityId | Kayıt ID |
| action | create / update / close / delete |
| actorEmail | İşlemi yapan |
| createdAt | İşlem zamanı |
| beforeJson | Önceki değer |
| afterJson | Sonraki değer |

---

## 11. Yetki Modeli

Yetki modeli konu grubu bazlıdır.

Bir kullanıcı aynı anda birden fazla konu grubunda farklı yetkilere sahip olabilir.

Örnek:

| email | rol | konuGrubu | canView | canCreate | canUpdate | canComment | canClose | canAdmin |
|---|---|---|---|---|---|---|---|---|
| admin@endura.com | Admin | * | TRUE | TRUE | TRUE | TRUE | TRUE | TRUE |
| bayi@endura.com | Konu Sahibi | Bayilik | TRUE | TRUE | TRUE | TRUE | TRUE | FALSE |
| operasyon@endura.com | Takım Üyesi | Operasyon | TRUE | FALSE | TRUE | TRUE | FALSE | FALSE |
| izleyici@endura.com | İzleyici | Pazarlama | TRUE | FALSE | FALSE | FALSE | FALSE | FALSE |

### 11.1 Yetki Önceliği

- `canAdmin=true` ise tüm işlemler serbesttir.
- `konuGrubu=*` tüm konu grupları için geçerlidir.
- Spesifik konu grubu yetkisi varsa, o konu grubundaki işlem izinleri kullanılır.
- Yetki kaydı yoksa kullanıcı sisteme girebilir ama veri göremez veya erişim reddi ekranı görür.

---

## 12. Dashboard Gereksinimleri

Dashboard yetkili kullanıcının görebildiği veri üzerinden hesaplanmalıdır.

### 12.1 KPI Kartları

- Toplam konu sayısı
- Açık konu sayısı
- Kapalı konu sayısı
- Geciken konu sayısı
- Duraksayan konu sayısı
- Kritik öncelikli açık konu sayısı
- Ortalama ilerleme yüzdesi

### 12.2 Grafikler / Görünümler

MVP:

- Statüye göre dağılım
- Önceliğe göre dağılım
- Konu grubuna göre açık iş sayısı

v1.1:

- Haftalık açılan/kapanan konu trendi
- Sorumlu bazlı yük dağılımı
- Gecikme yaşlandırma grafiği

---

## 13. Ekranlar

### 13.1 Login Ekranı

- Google ile giriş butonu
- Uygulama adı ve kısa açıklama
- Yetkisiz kullanıcı için açıklayıcı mesaj

### 13.2 Ana Dashboard

- KPI kartları
- Statü dağılımı
- Öncelik dağılımı
- Geciken ve duraksayan işler listesi

### 13.3 Liste Görünümü

- Arama kutusu
- Filtreler:
  - Konu grubu
  - Statü
  - Öncelik
  - Sorumlu
  - Hedef tarih
- Tablo:
  - Başlık
  - Konu grubu
  - Sorumlu
  - Statü
  - Öncelik
  - Hedef tarih
  - İlerleme
  - Son güncelleme

### 13.4 Kanban Görünümü

Kolonlar:

- Başladı
- İlk çalışma yapıldı
- İlerliyor
- Duraksadı
- Tamamlanıyor
- Kapandı

Kart üzerinde:

- Başlık
- Konu grubu
- Sorumlu
- Öncelik
- Hedef tarih
- İlerleme

### 13.5 Takip Konusu Detayı

- Ana bilgiler
- Statü ve ilerleme
- Güncelleme geçmişi
- Yeni not ekleme formu
- Düzenleme butonu
- Kapatma butonu

### 13.6 Yeni Konu Formu

Alanlar:

- Konu grubu
- Başlık
- Açıklama
- Sorumlu
- Öncelik
- Başlangıç tarihi
- Hedef tarih
- Etiketler

### 13.7 Takım ve Yetkiler Ekranı

- Kullanıcı listesi
- Konu grubu bazlı yetkiler
- Rol bilgisi
- Salt okunur görünüm MVP için yeterlidir
- v1.1'de arayüzden yetki düzenleme eklenebilir

---

## 14. Teknik Mimari

### 14.1 Önerilen teknoloji yığını

- Framework: Next.js App Router
- Dil: TypeScript
- UI: Tailwind CSS veya sade CSS modules
- Kimlik doğrulama: NextAuth / Auth.js Google Provider
- Veri kaynağı: Google Sheets API
- Dosya bağlantıları: Google Drive linkleri
- Hosting: Vercel
- Versiyon kontrol: GitHub

### 14.2 Mimari Akış

```text
Kullanıcı
  ↓
Next.js UI
  ↓
Next.js API Route / Server Action
  ↓
Permission kontrolü
  ↓
Google Sheets API
  ↓
Google Sheets dosyaları / Google Drive
```

### 14.3 Google Sheets Bağlantısı

İki seçenek vardır.

#### Seçenek A — Service Account

MVP için önerilir.

- Uygulama server-side olarak Google Sheets'e bağlanır.
- Service account e-posta adresi ilgili Sheet dosyalarına Editor olarak eklenir.
- Private key Vercel environment variable olarak saklanır.
- Kullanıcı yetkileri uygulama içindeki `Permissions` sheet'inden kontrol edilir.

#### Seçenek B — Kullanıcı OAuth yetkisiyle Sheets erişimi

Daha karmaşıktır. Her kullanıcının Sheet erişim yetkisine göre işlem yapılır. MVP için önerilmez.

### 14.4 Environment Variables

```env
GOOGLE_TASKS_SPREADSHEET_ID=1GypTun_lGQ-SgrCtmw4FScEgkH2Q3LE05HR2kTLGnps
GOOGLE_PERMISSIONS_SPREADSHEET_ID=12tSYZJywTWMj4rSQ-wnr0juxPKa_d9er
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Lokal geliştirme için:

```env
DEV_USER_EMAIL=
DEV_USER_NAME=
```

Production'da `DEV_USER_EMAIL` ve `DEV_USER_NAME` kullanılmamalıdır.

---

## 15. API Gereksinimleri

MVP için aşağıdaki API route'ları oluşturulmalıdır.

### 15.1 `GET /api/me`

Oturum açmış kullanıcı ve yetkilerini döndürür.

### 15.2 `GET /api/tasks`

Yetkili kullanıcının görebildiği takip konularını döndürür.

Query parametreleri:

- `status`
- `topic`
- `priority`
- `assignee`
- `q`

### 15.3 `POST /api/tasks`

Yeni takip konusu oluşturur.

### 15.4 `PATCH /api/tasks/:id`

Mevcut takip konusunu günceller.

### 15.5 `GET /api/tasks/:id/updates`

Takip konusuna ait güncellemeleri döndürür.

### 15.6 `POST /api/tasks/:id/updates`

Takip konusuna yeni güncelleme/fikir/soru/risk/karar ekler.

### 15.7 `GET /api/topics`

Aktif konu gruplarını döndürür.

### 15.8 `GET /api/permissions`

Admin veya yetkili kullanıcı için takım-yetki matrisini döndürür.

---

## 16. Validasyon Kuralları

### 16.1 Yeni konu açma

Zorunlu alanlar:

- konuGrubu
- baslik
- oncelik
- statu

Kurallar:

- `baslik` en az 3 karakter olmalıdır.
- `ilerleme` 0-100 arasında olmalıdır.
- `hedefTarih`, `baslangicTarihi`nden önce olmamalıdır.
- `statu=Kapandı` ise ilerleme tercihen 100 yapılmalıdır.

### 16.2 Güncelleme ekleme

Zorunlu alanlar:

- tip
- metin

Kurallar:

- `metin` en az 3 karakter olmalıdır.
- `tip` izin verilen güncelleme tiplerinden biri olmalıdır.

---

## 17. Hata Yönetimi

Sistem kullanıcıya teknik olmayan hata mesajları göstermelidir.

Örnekler:

| Durum | Mesaj |
|---|---|
| Sheet erişimi yok | Google Sheet dosyasına erişilemiyor. Service account yetkisini kontrol edin. |
| Yetkisiz işlem | Bu konu grubunda işlem yapma yetkiniz yok. |
| Boş veri | Henüz takip konusu yok. İlk konuyu oluşturabilirsiniz. |
| Kolon eksik | Sheet kolon yapısı beklenen formatta değil. Başlık satırını kontrol edin. |
| Kayıt bulunamadı | İlgili takip konusu bulunamadı. |

---

## 18. Güvenlik ve KVKK

MVP'de kişisel veri minimum seviyede tutulmalıdır.

Tutulacak kişi verileri:

- Ad soyad
- E-posta
- Rol/yetki bilgisi

Sisteme müşteri kişisel verisi, telefon numarası, açık adres veya hassas ticari bilgi girilecekse KVKK değerlendirmesi ayrıca yapılmalıdır.

Güvenlik gereksinimleri:

- Google private key GitHub'a konmamalıdır.
- `.env.local` repo'ya commit edilmemelidir.
- Vercel environment variables kullanılmalıdır.
- Kullanıcı yetkileri her API çağrısında server-side kontrol edilmelidir.
- Sadece frontend buton gizleme yeterli değildir.

---

## 19. Performans ve Ölçek

MVP hedef ölçeği:

- 10-50 aktif kullanıcı
- 500-5.000 takip konusu
- 5.000-50.000 güncelleme satırı

Google Sheets bu ölçek için yeterlidir. Daha yüksek hacimde PostgreSQL, Supabase veya Firebase gibi veritabanına geçiş değerlendirilebilir.

Performans gereksinimleri:

- İlk dashboard yüklemesi 3 saniye altında hedeflenmelidir.
- Liste filtreleme mümkünse client-side yapılmalıdır.
- Google Sheets okuma sonuçları kısa süreli cache'lenebilir.
- Yazma işlemlerinde kullanıcıya loading ve success/error durumu gösterilmelidir.

---

## 20. MVP Kapsamı

MVP'de yapılacaklar:

- Next.js uygulama iskeleti
- Google login
- Google Sheets API bağlantısı
- Tasks okuma/yazma
- Updates okuma/yazma
- Permissions okuma ve yetki kontrolü
- Topics okuma
- Dashboard
- Liste görünümü
- Kanban görünümü
- Takip konusu detay ekranı
- Yeni konu açma formu
- Güncelleme/fikir/soru/risk/karar ekleme formu
- Vercel deploy dokümantasyonu

---

## 21. MVP Dışı / Sonraki Faz

v1.1:

- Drag-and-drop Kanban
- E-posta bildirimi
- Google Chat veya Slack bildirimi
- AuditLog
- Drive dosya ekleri
- Yetki matrisini arayüzden düzenleme
- Haftalık yönetim özeti
- Mobil PWA

v1.2:

- AI destekli özetleme
- Duraksayan işler için öneri üretme
- Otomatik risk tespiti
- Gantt / takvim görünümü
- PDF veya Excel rapor çıktısı

---

## 22. Kabul Kriterleri — Genel

Ürün MVP tamamlanmış sayılmak için aşağıdaki kriterleri sağlamalıdır:

1. Kullanıcı Google hesabıyla giriş yapabilir.
2. Kullanıcı sadece yetkili olduğu konu gruplarını görebilir.
3. Yetkisi olan kullanıcı yeni takip konusu açabilir.
4. Yetkisi olmayan kullanıcı yeni konu açamaz.
5. Yetkisi olan kullanıcı konuya güncelleme, fikir, soru, risk veya karar ekleyebilir.
6. Statü güncellemesi Sheet'e yazılır.
7. Sheet üzerinden elle değiştirilen veri uygulama yenilendiğinde görünür.
8. Dashboard KPI'ları doğru hesaplanır.
9. Kanban görünümü statülere göre doğru gruplanır.
10. Vercel production ortamında çalışır.
11. Private key ve secret bilgileri repo'ya yazılmaz.
12. README içinde lokal kurulum ve Vercel deploy adımları bulunur.

---

## 23. Antigravity İçin Geliştirme Talimatı

Aşağıdaki metin Antigravity içinde doğrudan geliştirme promptu olarak kullanılabilir.

```text
Bu repo ENDURA için geliştirilecek Google Sheets tabanlı basit iş takip uygulamasıdır.

Amaç:
Trello, Asana ve Monday gibi ama çok daha sade bir iş takip kokpiti geliştir. Veriler Google Drive üzerinde duran Google Sheets dosyalarında kalacak. Uygulama Vercel'de deploy edilecek. Kullanıcılar Google hesabıyla giriş yapacak. Kim hangi konu grubunu görebilir, yeni konu açabilir, güncelleyebilir, yorum/fikir/soru/risk/karar ekleyebilir sorusu Permissions sheet'i üzerinden yönetilecek.

Teknoloji:
- Next.js App Router
- TypeScript
- Tailwind CSS veya sade modern CSS
- NextAuth/Auth.js Google Provider
- Google Sheets API
- Vercel deployment

Google Sheets:
- Tasks spreadsheet ID: 1GypTun_lGQ-SgrCtmw4FScEgkH2Q3LE05HR2kTLGnps
- Permissions spreadsheet ID: 12tSYZJywTWMj4rSQ-wnr0juxPKa_d9er

Sheet sekmeleri:
- Tasks
- Updates
- Topics
- Permissions

Statüler:
- Başladı
- İlk çalışma yapıldı
- İlerliyor
- Duraksadı
- Tamamlanıyor
- Kapandı

Güncelleme tipleri:
- Güncelleme
- Fikir
- Soru
- Risk
- Karar

Öncelikler:
- Düşük
- Normal
- Yüksek
- Kritik

Geliştirilecek ekranlar:
1. Login ekranı
2. Dashboard
3. Liste görünümü
4. Kanban görünümü
5. Takip konusu detay ekranı
6. Yeni takip konusu formu
7. Takım ve yetki matrisi görünümü

Temel kurallar:
- Yetki kontrolü yalnızca frontend'de değil server-side API katmanında da yapılmalı.
- Kullanıcı sadece yetkili olduğu konu gruplarını görebilmeli.
- Yetkisiz kullanıcılar işlem butonlarını görmemeli veya kullanamamalı.
- Google Sheet kolonları başlık isimlerine göre map edilmeli.
- Sheet boşsa kullanıcıya anlaşılır mesaj gösterilmeli.
- Private key ve secret bilgiler asla koda yazılmamalı; environment variable kullanılmalı.
- Uygulama basit kalmalı; gereksiz enterprise karmaşıklığı ekleme.

Öncelikli geliştirme sırası:
1. Proje iskeletini ve tipleri düzenle.
2. Google Sheets okuma/yazma katmanını sağlamlaştır.
3. Permissions kontrolünü merkezi fonksiyon haline getir.
4. Dashboard ve liste görünümünü tamamla.
5. Yeni konu açma ve konu güncelleme formlarını tamamla.
6. Updates ekleme ve detay görünümünü tamamla.
7. Kanban görünümünü statülere göre grupla.
8. README ve .env.example dosyalarını Vercel deploy için güncelle.

Kabul kriterleri:
- npm run dev ile lokal çalışmalı.
- npm run build hatasız tamamlanmalı.
- Vercel ortam değişkenleriyle production deploy çalışmalı.
- Yetki matrisi çalışmalı.
- Tasks ve Updates sheet'lerine kayıt yazılmalı.
- Sheet'ten elle değiştirilen veri refresh sonrası görünmeli.
```

---

## 24. Antigravity İçin İlk İş Paketi

İlk geliştirme sprint'i şu görevlerden oluşmalıdır:

### Sprint 1 — Çalışan MVP Temeli

1. Projeyi Next.js + TypeScript olarak çalışır hale getir.
2. `.env.example` dosyasını oluştur.
3. Google Sheets client katmanını yaz.
4. `Tasks`, `Updates`, `Topics`, `Permissions` tiplerini tanımla.
5. Permissions parser ve boolean normalizer yaz.
6. Dashboard için mock fallback verisi ekle.
7. API route'ları oluştur.
8. Liste ve Kanban ekranlarını oluştur.
9. Yeni takip konusu formunu oluştur.
10. Vercel build hatalarını temizle.

### Sprint 1 Done Definition

- Lokal ortamda giriş yapılmadan DEV_USER ile test edilebilir.
- Sheet ID'leri env'den okunur.
- En az bir task listelenir.
- Yeni task eklenir.
- Bir task'a update eklenir.
- Yetkisiz konu grubu görünmez.
- Build başarıyla tamamlanır.

---

## 25. Notlar

- Google Sheets uzun vadede operasyonel kolaylık sağlar; ancak gerçek zamanlı çok kullanıcılı ağır iş yükleri için klasik veritabanı değildir.
- Ürün ilk fazda sade tutulmalıdır. Fazla özellik ekleme iş takip disiplinini güçlendirmek yerine kullanıcıyı yorar.
- ENDURA için kritik değer, işlerin görünür hale gelmesi ve “kim, hangi konuda, ne yaptı, hangi soru açık kaldı?” sorusunun hızlı cevaplanmasıdır.
