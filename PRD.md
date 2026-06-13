# ENDURA Basit İş Takip Uygulaması - PRD

## 1. Amaç
ENDURA içindeki konuları, görevleri, fikirleri, soruları, riskleri ve karar notlarını tek bir yerde takip etmek. Uygulama Trello/Asana/Monday mantığını sadeleştirir; veri kaynağı olarak Google Sheets kullanır ve Vercel üzerinde yayınlanır.

## 2. Ürün ilkesi
- Basit olacak: kullanıcı işi 30 saniyede açabilmeli.
- Sheet uyumlu olacak: veriler Google Sheets üzerinden de okunup değiştirilebilmeli.
- Yetkili olacak: kişi sadece yetki tablosunda açık olan konu gruplarını görecek ve güncelleyecek.
- İzlenebilir olacak: her güncelleme, fikir, soru, risk ve karar ayrı satır olarak saklanacak.
- Yönetim kokpiti olacak: toplam açık iş, geciken iş, duraksayan iş, kapanan iş ve ilerleme oranı görülecek.

## 3. Kullanıcı tipleri
| Rol | Tanım | Temel yetki |
|---|---|---|
| Yönetim/Admin | Tüm başlıkları izler ve yönetir | Tüm yetkiler |
| Konu sahibi | Belirli konu grubunu yönetir | Görür, açar, günceller, kapatır |
| Takım üyesi | Kendi alanındaki konuları takip eder | Görür, günceller, yorum/fikir/soru girer |
| İzleyici | Sadece gelişmeleri görür | Görür |

## 4. Veri modeli

### 4.1 Tasks
Ana takip kayıtlarıdır.

| Alan | Açıklama |
|---|---|
| id | Benzersiz kayıt no |
| konuGrubu | Bayilik Kokpit, Pazarlama, Operasyon vb. |
| baslik | Takip konusu başlığı |
| aciklama | Konu açıklaması |
| gorevliEmail | Sorumlu kişinin e-postası |
| gorevliAd | Sorumlu kişi adı |
| oncelik | Düşük / Normal / Yüksek / Kritik |
| statu | Başladı / İlk çalışma yapıldı / İlerliyor / Duraksadı / Tamamlanıyor / Kapandı |
| baslangicTarihi | Başlangıç tarihi |
| hedefTarih | Hedef/kapanış tarihi |
| ilerleme | 0-100 arası ilerleme yüzdesi |
| etiketler | Virgülle ayrılmış etiketler |
| sonGuncelleme | Son gelişme özeti |
| createdAt, createdBy | Oluşturma bilgisi |
| updatedAt, updatedBy | Son güncelleme bilgisi |

### 4.2 Updates
Her takip konusuna bağlı güncelleme, fikir, soru, risk veya karar satırlarıdır.

| Alan | Açıklama |
|---|---|
| id | Benzersiz güncelleme no |
| taskId | Bağlı takip konusu |
| tip | Güncelleme / Fikir / Soru / Risk / Karar |
| metin | Not içeriği |
| yazarEmail | Notu yazan kişi |
| yazarAd | Notu yazan kişi adı |
| createdAt | Oluşturma zamanı |
| ekLink | Opsiyonel doküman/link |

### 4.3 Permissions
Takım ve yetki matrisi.

| Alan | Açıklama |
|---|---|
| email | Kullanıcının Google e-postası |
| adSoyad | Kullanıcı adı |
| rol | Organizasyonel rol |
| konuGrubu | Yetkili olduğu konu grubu. `*` tüm konular demektir. |
| canView | Görüntüleme yetkisi |
| canCreate | Yeni takip konusu açma yetkisi |
| canUpdate | Takip konusu alanlarını güncelleme yetkisi |
| canComment | Güncelleme/fikir/soru/risk/karar girme yetkisi |
| canClose | Konuyu kapatma yetkisi |
| canAdmin | Tam yönetim yetkisi |

### 4.4 Topics
Konu grupları.

| Alan | Açıklama |
|---|---|
| konuGrubu | Konu adı |
| aciklama | Açıklama |
| sahipEmail | Konu sahibi |
| aktif | TRUE/FALSE |

## 5. Statü akışı
1. Başladı
2. İlk çalışma yapıldı
3. İlerliyor
4. Duraksadı
5. Tamamlanıyor
6. Kapandı

Duraksadı, sistemde ayrıca yönetim alarmı olarak sayılır. Hedef tarihi geçmiş ve kapanmamış kayıtlar gecikmiş sayılır.

## 6. MVP kapsamı
- Google ile giriş
- Google Sheets üzerinden görev okuma/yazma
- Yetki matrisine göre görev görüntüleme
- Yeni takip konusu açma
- Görev güncelleme
- Güncelleme/fikir/soru/risk/karar ekleme
- Liste görünümü
- Kanban görünümü
- Yönetim KPI kartları
- Takım-yetki matrisi görünümü
- Vercel deployment

## 7. MVP dışı ama sonraki faz
- Bildirim e-postası
- Google Chat/Slack bildirimi
- Dosya ekleme için Google Drive klasör bağlantısı
- Otomatik haftalık yönetim özeti
- AI ile “duraksayan işler için öneri”
- Mobil PWA
- Gantt/takvim görünümü

## 8. Kabul kriterleri
- Kullanıcı Google hesabıyla giriş yapabilir.
- Kullanıcı sadece yetkili olduğu konu gruplarını görebilir.
- Yetkisiz kullanıcı yeni takip konusu açamaz.
- Yetkili kullanıcı yeni takip konusu açabilir.
- Yetkili kullanıcı konuya güncelleme/fikir/soru/risk/karar notu ekleyebilir.
- Sheet üzerinden değiştirilen veri arayüz yenilendiğinde görünür.
- Vercel production ortamında çevre değişkenleriyle çalışır.
