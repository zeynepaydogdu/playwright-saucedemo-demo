# SauceDemo Fonksiyonel Test Planı

## Kapsam ve yürütme bilgisi

- Hedef: <https://www.saucedemo.com/>
- Kapsam: giriş (pozitif/negatif), ürün sıralama, sepete ekleme/çıkarma ve checkout.
- İnceleme tarihi: 2026-11-26.
- Pozitif girişte `standard_user`, kilitli kullanıcı testinde `locked_out_user`, her ikisinde de `secret_sauce` kullanıldı.
- İstenen Playwright MCP sunucusu başlatılamadı: yapılandırılmış komut `npx @playwright/mcp@latest`, ancak ortamda `npx` bulunamadı. Bu nedenle sayfa, entegre Playwright tarayıcı araçlarıyla incelendi; bu belge MCP üzerinden yürütüldüğü iddiasında değildir.
- Beklenen sonuçlar test tasarımıdır; gözlenen sonuçlar yalnızca bu incelemede gerçekten yürütülen adımları kaydeder. “Yürütülmedi” olarak işaretli satırlar önerilen ek testlerdir.
- Siparişin başarılı tamamlanması demo sitede yürütüldü. Boş sepetli checkout akışı toplamı sıfır olan özet ekranına kadar incelendi; boş sipariş tamamlanmadı.

## Test senaryoları

| ID | Tür | Senaryo / adımlar | Beklenen sonuç | Gözlenen sonuç |
|---|---|---|---|---|
| AUTH-01 | Pozitif | `standard_user` ve `secret_sauce` ile giriş yap. | Giriş başarılı olur; ürün envanteri gösterilir. | **Geçti.** `/inventory.html` açıldı ve 6 ürün listelendi. |
| AUTH-02 | Negatif / sınır | Kullanıcı adı ve parola boşken Login'e bas. | Oturum açılmaz; kullanıcı adı alanı için doğrulama gösterilir. | **Geçti.** “Epic sadface: Username is required” gösterildi. |
| AUTH-03 | Negatif / sınır | Kullanıcı adı dolu, parola boşken Login'e bas. | Oturum açılmaz; parola alanı için doğrulama gösterilir. | **Geçti.** “Epic sadface: Password is required” gösterildi. |
| AUTH-04 | Negatif | Geçerli kullanıcı adıyla hatalı parola kullan. | Oturum açılmaz ve kimlik bilgilerinin geçersiz olduğu bildirilir. | **Geçti.** “Epic sadface: Username and password do not match any user in this service” gösterildi. |
| AUTH-05 | Negatif | `locked_out_user` ve `secret_sauce` ile giriş yap. | Oturum açılmaz; hesabın kilitli olduğu açıkça bildirilir. | **Geçti.** “Epic sadface: Sorry, this user has been locked out.” gösterildi. |
| AUTH-06 | Sınır / ek | Baştaki/sondaki boşluklar, çok uzun kullanıcı adı/parola ve yalnızca boşluk içeren değerlerle giriş dene. | Değerler sessizce geçerli kullanıcıya dönüştürülmemeli; oturum açma başarısız olmalı ve anlaşılır hata verilmelidir. | **Yürütülmedi.** |
| SORT-01 | Pozitif | Sıralamayı Name (A to Z) seç. | Ürün adları A-Z sıralanır. | **Geçti.** Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() sırasıyla gösterildi. |
| SORT-02 | Pozitif | Sıralamayı Name (Z to A) seç. | Ürün adları Z-A sıralanır. | **Geçti.** Test.allTheThings(), Onesie, Fleece Jacket, Bolt T-Shirt, Bike Light, Backpack sırasıyla gösterildi. |
| SORT-03 | Pozitif / sınır | Price (low to high) seç; eşit fiyatlı ürünleri de kontrol et. | Fiyatlar küçükten büyüğe sıralanır; eşit fiyatlı ürünler bitişik kalır. | **Geçti.** $7.99, $9.99, $15.99, $15.99, $29.99, $49.99. Eşit fiyatlı iki ürün yan yana geldi. |
| SORT-04 | Pozitif / sınır | Price (high to low) seç; eşit fiyatlı ürünleri de kontrol et. | Fiyatlar büyükten küçüğe sıralanır; eşit fiyatlı ürünler bitişik kalır. | **Geçti.** $49.99, $29.99, $15.99, $15.99, $9.99, $7.99. |
| SORT-05 | Sınır / ek | Sıralamayı art arda değiştir ve ürün kümesini kontrol et. | Sıra seçime göre değişir; ürün eklenmez veya kaybolmaz. | **Kısmen gözlendi.** Dört geçerli seçenek art arda uygulandı; her seçimde aynı 6 ürün kaldı. Geçersiz bir sıralama değeri UI üzerinden denenmedi. |
| CART-01 | Pozitif | Backpack ve Bike Light ürünlerini sepete ekle. | Her ürün bir kez eklenir; sayaç ve sepet satırları 2 olur. | **Geçti.** Sayaç 2 oldu; sepet iki farklı ürünü, her birini miktar 1 olarak gösterdi. |
| CART-02 | Pozitif | Sepette Backpack'i kaldır. | Backpack kaldırılır, Bike Light kalır, sayaç 1 olur. | **Geçti.** Sayaç 1 oldu; checkout özeti yalnızca Bike Light içerdi. |
| CART-03 | Sınır / ek | Aynı ürünün ekleme düğmesine tekrar bas; tüm 6 ürünü ekleyip sınır durumunu kontrol et. | Her ürün için ekle/kaldır durumu tutarlı olmalı; sepet miktarları ve toplam ürün sayısı doğru olmalı. | **Yürütülmedi.** Aynı ürün tekrar ekleme ve 6 ürünün tamamını ekleme bu çalışmada sınanmadı. |
| CART-04 | Negatif / sınır | Sepet boşken Checkout'a bas. | Boş sepetle checkout başlatılmamalı; Checkout devre dışı olmalı veya kullanıcıya açıklayıcı uyarı gösterilmelidir. | **Beklenmeyen davranış.** Boş sepet sayfasında Checkout etkin kaldı ve bilgi adımına ilerledi. |
| CART-05 | Negatif / sınır | Boş sepetten checkout bilgi formunu doldurup Continue'a bas. | Boş sipariş özetine ilerleme engellenmelidir. | **Beklenmeyen davranış.** Özet ekranına ilerledi; 0 ürün ve `$0.00` toplam gösterildi, Finish düğmesi mevcut. Finish'e basılmadı. |
| CHECK-01 | Negatif / sınır | Sepette ürün varken checkout formunu tüm alanlar boş bırakarak Continue'a bas. | İlerleme engellenir; ilk zorunlu alan için doğrulama görünür. | **Geçti.** “Error: First Name is required” gösterildi. |
| CHECK-02 | Negatif | Yalnızca First Name girip Continue'a bas. | İlerleme engellenir; Last Name zorunluluğu bildirilir. | **Geçti.** “Error: Last Name is required” gösterildi. |
| CHECK-03 | Negatif | First Name ve Last Name girip Postal Code'u boş bırak; Continue'a bas. | İlerleme engellenir; Postal Code zorunluluğu bildirilir. | **Geçti.** “Error: Postal Code is required” gösterildi. |
| CHECK-04 | Sınır | Ad ve soyadı girip tek karakterli Postal Code (`1`) ile Continue'a bas. | Zorunlu alanlar boş değilse sonraki adıma geçilir; biçim doğrulama gereksinimi tanımlı değilse tek karakter reddedilmemelidir. | **Geçti.** Tek karakterli değer kabul edilip overview açıldı. Uygulama posta kodu biçimini ayrıca doğrulamadı. |
| CHECK-05 | Pozitif | 1 adet Bike Light ile checkout bilgilerini doldur (`Ada`, `Lovelace`, `1`); overview tutarlarını kontrol edip Finish'e bas. | Doğru ürün ve tutarlar gösterilir; Finish siparişi tamamlar, onay mesajı görünür ve sepet boşalır. | **Geçti.** Ürün $9.99, vergi $0.80, toplam $10.79 gösterildi. Finish sonrası “Thank you for your order!” ve gönderim mesajı göründü; sepet boşaldı. |
| CHECK-06 | Negatif / sınır / ek | Postal Code'a harf, noktalama, boşluk ve çok uzun değerler gir. | Ürün gereksinimine göre biçim doğrulaması tutarlı olmalı; geçersiz değer kabul ediliyorsa bu davranış açıkça tanımlanmalı. | **Yürütülmedi.** Bu uygulamada yalnızca boş olmayan tek karakterin kabulü gözlendi; biçim sınırları bilinmiyor. |

## Bulgular ve takip

1. **Boş sepetten checkout (CART-04/05):** Checkout, boş sepet için devre dışı değil. Form doldurulduğunda sıfır ürünlü, `$0.00` toplamlı overview gösteriliyor ve Finish sunuluyor. Boş siparişin tamamlanması özellikle denenmedi. Beklenen ürün davranışı netleştirilmeli ve boş siparişin tamamlanması engellenmeli.
2. **Posta kodu doğrulaması (CHECK-04/06):** Alan zorunlu; boş değer engelleniyor. Tek karakter kabul ediliyor ve biçim kontrolü gözlenmedi. Ülke/format gereksinimi belirtilmeden daha katı bir beklenti varsayılmamalı.
3. **Sıralama bağları (SORT-03/04):** Aynı fiyattaki iki ürün yan yana. Gözlenen iki sıralamada da Bolt T-Shirt, Test.allTheThings() ürününden önce geldi; test beklentisi için bağların göreli sırası ayrıca gereksinim olarak belirlenmeli.
