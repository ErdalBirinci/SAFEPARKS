/* SAFE-PARKS CISO Portal — pilot go/no-go readiness gates (bilingual)
   Blocking items must be "pass" before a pilot site may go live.
   References point to the legal or standard obligation the item discharges. */
window.SP = window.SP || {};

SP.gonoGates = [
  {
    id: "G1",
    name: { en: "Legal basis and controllership", tr: "Hukuki dayanak ve veri sorumluluğu" },
    items: [
      { id: "G1-1", blocking: true, owner: "Municipality", ref: "GDPR Art. 4(7) · KVKK m.3",
        req: { en: "Controller status and DPO appointment are recorded in a signed municipal decision, with a named contact reachable during an incident.", tr: "Veri sorumlusu sıfatı ve DPO ataması imzalı belediye kararıyla kayıt altına alınmış; olay anında ulaşılabilen isimli irtibat var." },
        ev: { en: "Signed decision, DPO appointment letter, contact card (offline copy).", tr: "İmzalı karar, DPO atama yazısı, irtibat kartı (çevrimdışı kopya)." } },
      { id: "G1-2", blocking: true, owner: "DPO + CISO", ref: "GDPR Art. 35 · AI Act Art. 26",
        req: { en: "DPIA for this site is signed, its mitigations are implemented in the deployed build, and the EPAB opinion is on file.", tr: "Bu saha için DPIA imzalı, azaltıcı tedbirler devreye alınan derlemede uygulanmış ve EPAB görüşü dosyada." },
        ev: { en: "Signed DPIA, evidence that each mitigation exists, EPAB opinion and the written answer.", tr: "İmzalı DPIA, her tedbirin mevcut olduğuna dair kanıt, EPAB görüşü ve yazılı yanıt." } },
      { id: "G1-3", blocking: true, owner: "DPO", ref: "KVKK m.16 · GDPR Art. 30",
        req: { en: "The processing record is current: purposes, categories, recipients, retention and the local-only architecture are described accurately.", tr: "İşleme kaydı güncel: amaçlar, veri kategorileri, alıcılar, saklama süreleri ve yalnızca yerel mimari doğru tanımlanmış." },
        ev: { en: "VERBİS registration or ROPA extract dated within the last 12 months.", tr: "Son 12 ay içinde tarihli VERBİS kaydı veya ROPA özeti." } },
      { id: "G1-4", blocking: true, owner: "Coordinator + Municipality", ref: "GDPR Art. 28 · GA security annex",
        req: { en: "Pilot site agreement and the data processing agreement are signed, and the security annex lists the same obligations as this checklist.", tr: "Pilot saha sözleşmesi ve veri işleme sözleşmesi imzalı; güvenlik eki bu kontrol listesindeki yükümlülüklerin aynısını içeriyor." },
        ev: { en: "Countersigned agreements; annex version reference in the contract register.", tr: "Karşılıklı imzalı sözleşmeler; sözleşme kaydında ek sürüm referansı." } },
      { id: "G1-5", blocking: true, owner: "Municipality", ref: "GDPR Art. 13 · KVKK m.10",
        req: { en: "Information notice is published and the on-site signage is installed at every camera field of view, in the local language.", tr: "Aydınlatma metni yayımlanmış ve her kamera görüş alanında yerel dilde saha tabelası monte edilmiş." },
        ev: { en: "Photographs of installed signage, URL or printed copy of the notice.", tr: "Monte edilmiş tabelaların fotoğrafları, metnin bağlantısı veya basılı kopyası." } }
    ]
  },
  {
    id: "G2",
    name: { en: "Privacy engineering", tr: "Gizlilik mühendisliği" },
    items: [
      { id: "G2-1", blocking: true, owner: "CTO", ref: "GDPR Art. 5(1)(c),(e) · project model",
        req: { en: "The 60-second ring buffer and the 30-second analysis window are demonstrated on the installed build, not on a prototype.", tr: "60 saniyelik halka tampon ve 30 saniyelik analiz penceresi prototipte değil, kurulu derlemede gösterilmiş." },
        ev: { en: "Test report with timestamps, build hash and the engineer who ran it.", tr: "Zaman damgaları, derleme hash'i ve testi yapan mühendisi içeren test raporu." } },
      { id: "G2-2", blocking: true, owner: "CTO + CISO", ref: "GDPR Art. 5(1)(e) · Art. 32",
        req: { en: "Purge completes within 5 seconds and fails closed: if the purge test fails, the node stops analysing and raises an alarm.", tr: "İmha 5 saniye içinde tamamlanıyor ve kapalı yönde başarısız oluyor: imha testi başarısızsa düğüm analizi durdurup alarm veriyor." },
        ev: { en: "Purge logs for 72 hours, failure-path test record, alarm screenshot.", tr: "72 saatlik imha kayıtları, hata yolu test kaydı, alarm ekran görüntüsü." } },
      { id: "G2-3", blocking: true, owner: "CISO", ref: "Project rule R1 · AI Act Art. 5 prohibitions",
        req: { en: "The biometric denylist is verified in the build: no face detection, voiceprint, gait or emotion model is present or reachable.", tr: "Biyometrik kara liste derlemede doğrulanmış: yüz tespiti, ses izi, yürüyüş veya duygu modeli yok ve erişilebilir değil." },
        ev: { en: "Dependency and model inventory diff, model card statement, code review sign-off.", tr: "Bağımlılık ve model envanteri farkı, model kartı beyanı, kod inceleme onayı." } },
      { id: "G2-4", blocking: true, owner: "Municipality + DPO", ref: "GDPR Art. 5(1)(c) · DPIA mitigation",
        req: { en: "Field-of-view survey is documented and masking is applied to windows, doors and private property; no pan-tilt-zoom.", tr: "Görüş alanı etüdü belgelenmiş; pencere, kapı ve özel mülk maskelenmiş; pan-tilt-zoom yok." },
        ev: { en: "Survey drawing, before/after frames, DPO sign-off on the survey.", tr: "Etüt çizimi, önce/sonra kareleri, etüt için DPO onayı." } },
      { id: "G2-5", blocking: true, owner: "CTO", ref: "GDPR Art. 5(1)(e)",
        req: { en: "Retention timers for every data class are configured in the deployed system and automatic deletion is enabled and monitored.", tr: "Her veri sınıfı için saklama süreleri kurulu sistemde tanımlı; otomatik silme açık ve izleniyor." },
        ev: { en: "Configuration export, deletion job history, retention matrix signed by the DPO.", tr: "Konfigürasyon çıktısı, silme işi geçmişi, DPO imzalı saklama matrisi." } }
    ]
  },
  {
    id: "G3",
    name: { en: "Identity, access and keys", tr: "Kimlik, erişim ve anahtarlar" },
    items: [
      { id: "G3-1", blocking: true, owner: "CTO", ref: "ISO 27001 A.8.24 · NIS2 Art. 21(2)(h)",
        req: { en: "mTLS is enforced on every link with certificates of 90 days or less from the municipal PKI; no shared credential exists.", tr: "Her bağlantıda belediye PKI'sından 90 gün veya daha kısa ömürlü sertifikalarla mTLS zorunlu; paylaşılan kimlik bilgisi yok." },
        ev: { en: "Certificate inventory, revocation test result, account list showing unique identities.", tr: "Sertifika envanteri, iptal testi sonucu, tekil kimlikleri gösteren hesap listesi." } },
      { id: "G3-2", blocking: false, owner: "CISO", ref: "ISO 27001 A.5.15 · A.8.5",
        req: { en: "Operator accounts use SSO with phishing-resistant MFA and the least-privilege role for their task; admin roles are separated.", tr: "Operatör hesapları oltalama dirençli MFA'lı SSO ve göreve uygun en az yetki rolü kullanıyor; yönetici rolleri ayrıştırılmış." },
        ev: { en: "Role matrix, MFA enforcement report, sample of provisioned accounts.", tr: "Rol matrisi, MFA uygulama raporu, oluşturulmuş hesaplardan örnek." } },
      { id: "G3-3", blocking: true, owner: "CTO + CISO", ref: "ISO 27001 A.8.24 · FIPS 140-3",
        req: { en: "Key ceremony for the site is minuted: HSM/TPM initialisation, key holders, escrow and destruction procedure.", tr: "Saha için anahtar töreni tutanaklı: HSM/TPM başlatma, anahtar sahipleri, emanet ve imha prosedürü." },
        ev: { en: "Signed ceremony minutes, key holder list, escrow receipt.", tr: "İmzalı tören tutanağı, anahtar sahibi listesi, emanet makbuzu." } },
      { id: "G3-4", blocking: false, owner: "CISO", ref: "ISO 27001 A.5.15 · A.8.2",
        req: { en: "Break-glass access is documented, time-limited, alarmed and has been tested without weakening normal authentication.", tr: "Acil erişim (break-glass) belgelenmiş, süre sınırlı, alarmlı ve normal kimlik doğrulamayı zayıflatmadan test edilmiş." },
        ev: { en: "Procedure, test record, alarm routing to the SOC.", tr: "Prosedür, test kaydı, SOC'a alarm yönlendirmesi." } }
    ]
  },
  {
    id: "G4",
    name: { en: "Network and isolation", tr: "Ağ ve izolasyon" },
    items: [
      { id: "G4-1", blocking: true, owner: "CTO + Municipality", ref: "Project air-gap promise · WP3 D3.3",
        req: { en: "A 60-minute WAN and grid interruption drill was run on site and triage continued throughout on the local node.", tr: "Sahada 60 dakikalık WAN ve elektrik kesintisi tatbikatı yapıldı ve analiz boyunca yerel düğümde sürdü." },
        ev: { en: "Drill script, node logs covering the interruption, observer sign-off.", tr: "Tatbikat senaryosu, kesintiyi kapsayan düğüm kayıtları, gözlemci onayı." } },
      { id: "G4-2", blocking: true, owner: "CTO", ref: "ISO 27001 A.8.20 · A.8.22",
        req: { en: "Deny-all egress is verified: only the allowlisted broker, update and time endpoints are reachable from the park network.", tr: "Tüm çıkışlar kapalı doğrulandı: park ağından yalnızca beyaz listedeki broker, güncelleme ve saat uçlarına erişilebiliyor." },
        ev: { en: "Firewall ruleset export, port scan from the node, rule owner approval.", tr: "Güvenlik duvarı kuralı çıktısı, düğümden port taraması, kural sahibi onayı." } },
      { id: "G4-3", blocking: true, owner: "CTO", ref: "ISO 27001 A.8.32 · CRA Art. 13",
        req: { en: "The signed offline update chain is tested end to end, including rollback to the previous signed model within 30 minutes.", tr: "İmzalı çevrimdışı güncelleme zinciri uçtan uca test edildi; önceki imzalı modele 30 dakika içinde geri dönüş dahil." },
        ev: { en: "Update log with signature verification, rollback timing record.", tr: "İmza doğrulamalı güncelleme kaydı, geri dönüş süresi kaydı." } },
      { id: "G4-4", blocking: true, owner: "CTO", ref: "ISO 27001 A.8.22 · IEC 62443 zone model",
        req: { en: "Segmentation is in place and management ports are unreachable from the park network; the console is on a separate management VLAN.", tr: "Segmentasyon uygulanmış; yönetim portları park ağından erişilemez; konsol ayrı yönetim VLAN'ında." },
        ev: { en: "Network diagram as built, reachability test from the camera VLAN.", tr: "Kuruluma uygun ağ şeması, kamera VLAN'ından erişilebilirlik testi." } }
    ]
  },
  {
    id: "G5",
    name: { en: "Edge node and supply chain", tr: "Uç düğüm ve tedarik zinciri" },
    items: [
      { id: "G5-1", blocking: true, owner: "CTO + 3S Holding", ref: "ISO 27001 A.8.9 · CIS Level 2",
        req: { en: "The hardened baseline image is frozen, hashed and recorded; the node refuses to start if its measurement does not match.", tr: "Sertleştirilmiş taban imajı dondurulmuş, hash'lenmiş ve kayıtlı; ölçüm eşleşmezse düğüm başlamayı reddediyor." },
        ev: { en: "Baseline hash, attestation log, failed-measurement test.", tr: "Taban hash'i, kanıtlama kaydı, başarısız ölçüm testi." } },
      { id: "G5-2", blocking: true, owner: "CTO", ref: "CRA Art. 13 · NIS2 Art. 21(2)(d)",
        req: { en: "A signed SBOM and supplier attestation exist for every shipped component: edge, broker, connector and model.", tr: "Sevk edilen her bileşen için imzalı SBOM ve tedarikçi beyanı var: uç, broker, bağlayıcı ve model." },
        ev: { en: "SBOM files, signature verification, supplier attestation letters.", tr: "SBOM dosyaları, imza doğrulaması, tedarikçi beyan yazıları." } },
      { id: "G5-3", blocking: false, owner: "3S Holding", ref: "ISO 27001 A.7.4 · A.8.16",
        req: { en: "Tamper sensors and seals are active on the enclosure, and alarms are routed to the municipal SOC with a tested response.", tr: "Muhafazada kurcalama sensörleri ve mühürler aktif; alarmlar test edilmiş müdahale ile belediye SOC'una yönleniyor." },
        ev: { en: "Installation checklist, alarm test ticket.", tr: "Kurulum kontrol listesi, alarm test kaydı." } },
      { id: "G5-4", blocking: false, owner: "Municipality", ref: "ISO 27001 A.7.1 · A.7.2",
        req: { en: "Physical installation is checked: camera aim, power protection, cable routing, cabinet lock and site access list.", tr: "Fiziksel kurulum kontrol edildi: kamera yönü, güç koruması, kablo güzergâhı, kabin kilidi ve saha erişim listesi." },
        ev: { en: "Signed installation sheet with photographs.", tr: "Fotoğraflı, imzalı kurulum formu." } }
    ]
  },
  {
    id: "G6",
    name: { en: "Incident response and SOC", tr: "Olay müdahalesi ve SOC" },
    items: [
      { id: "G6-1", blocking: true, owner: "Municipality + CISO", ref: "NIS2 Art. 21(2)(b) · ISO 27001 A.6.3",
        req: { en: "At least two municipal SOC operators per city are trained and certified on this build, including the purge-failure path.", tr: "Şehir başına en az iki belediye SOC operatörü bu derleme üzerinde eğitildi ve sertifikalandırıldı; imha hatası yolu dahil." },
        ev: { en: "Training records, assessment results, rota covering 24/7 or the contracted hours.", tr: "Eğitim kayıtları, değerlendirme sonuçları, 7/24 veya sözleşmeli saatleri kapsayan vardiya." } },
      { id: "G6-2", blocking: true, owner: "CISO", ref: "NIS2 Art. 23 · GDPR Art. 33",
        req: { en: "Runbooks are handed over and the offline contact card lists CSIRT, DPO, KVKK Board, defence and vendor contacts with numbers tested.", tr: "El kitapları devredildi; çevrimdışı irtibat kartında CSIRT, DPO, KVKK Kurulu, savunma ve tedarikçi irtibatları test edilmiş numaralarla var." },
        ev: { en: "Signed handover, printed contact card, call-tree test result.", tr: "İmzalı devir, basılı irtibat kartı, çağrı ağacı test sonucu." } },
      { id: "G6-3", blocking: false, owner: "CISO + Municipality", ref: "ISO 27001 A.5.24–A.5.26",
        req: { en: "A tabletop exercise covering stream interception and credential compromise was run with the site team, and findings are closed.", tr: "Akış ele geçirme ve kimlik bilgisi ihlalini kapsayan masa başı tatbikat saha ekibiyle yapıldı ve bulgular kapatıldı." },
        ev: { en: "Exercise report, action tracker with closed items.", tr: "Tatbikat raporu, kapatılmış maddeleri gösteren aksiyon takibi." } },
      { id: "G6-4", blocking: false, owner: "DPO + CISO", ref: "GDPR Art. 33 · KVKK m.12/5 · AI Act Art. 73",
        req: { en: "Notification templates and the decision log are prepared for GDPR, KVKK, NIS2, AI Act and the defence channel, in both languages used on site.", tr: "GDPR, KVKK, NIS2, AI Act ve savunma kanalı için bildirim şablonları ve karar kaydı, sahada kullanılan her iki dilde hazır." },
        ev: { en: "Template pack, decision-log form, dry-run notification.", tr: "Şablon paketi, karar kaydı formu, deneme bildirimi." } }
    ]
  },
  {
    id: "G7",
    name: { en: "Assurance and acceptance", tr: "Güvence ve kabul" },
    items: [
      { id: "G7-1", blocking: true, owner: "CISO", ref: "ISO 27001 A.8.8 · WP3 T3.6",
        req: { en: "An independent penetration test was run against the exact build being deployed, and no critical or high finding remains open.", tr: "Bağımsız sızma testi devreye alınan derlemenin kendisine yapıldı ve açık kritik veya yüksek bulgu kalmadı." },
        ev: { en: "Pentest report with build hash, retest evidence, risk acceptance for any residual medium.", tr: "Derleme hash'li sızma testi raporu, tekrar test kanıtı, kalan orta bulgular için risk kabulü." } },
      { id: "G7-2", blocking: true, owner: "CISO + Municipality", ref: "WP3/WP6 interface · SAT",
        req: { en: "Site acceptance test criteria are signed by the CISO and the municipality before the test starts, not after it passes.", tr: "Saha kabul testi kriterleri test başlamadan önce CISO ve belediye tarafından imzalandı; test geçtikten sonra değil." },
        ev: { en: "Signed SAT criteria dated before execution, completed SAT record.", tr: "Uygulamadan önce tarihli imzalı SAT kriterleri, tamamlanmış SAT kaydı." } },
      { id: "G7-3", blocking: false, owner: "CTO", ref: "ISO 27001 A.8.13",
        req: { en: "Backup and restore are tested to the agreed RTO/RPO, including restoration of configuration and keys without vendor access.", tr: "Yedekleme ve geri dönüş, kararlaştırılan RTO/RPO'ya göre test edildi; tedarikçi erişimi olmadan konfigürasyon ve anahtarların geri yüklenmesi dahil." },
        ev: { en: "Restore test record with timings, key recovery confirmation.", tr: "Süreleri içeren geri yükleme test kaydı, anahtar kurtarma teyidi." } },
      { id: "G7-4", blocking: false, owner: "CISO", ref: "NIS2 Art. 21(2)(b) · ISO 27001 A.8.15",
        req: { en: "Central logging runs with a metadata-only schema and 12-month WORM retention; no frame content or biometric feature is logged.", tr: "Merkezi günlükleme yalnızca üstveri şeması ve 12 aylık WORM saklama ile çalışıyor; kare içeriği veya biyometrik öznitelik kaydedilmiyor." },
        ev: { en: "Log schema, sample export, retention configuration, content-scan result.", tr: "Günlük şeması, örnek çıktı, saklama konfigürasyonu, içerik taraması sonucu." } }
    ]
  },
  {
    id: "G8",
    name: { en: "Governance and continuity", tr: "Yönetişim ve süreklilik" },
    items: [
      { id: "G8-1", blocking: true, owner: "CISO", ref: "CISO charter §2",
        req: { en: "The CISO go/no-go decision for this city is signed and dated, with the build hash and the gate status at the time of signature.", tr: "Bu şehir için CISO go/no-go kararı imzalı ve tarihli; imza anındaki derleme hash'i ve kapı durumu kayıtlı." },
        ev: { en: "Signed decision page exported from this view, attached to the site file.", tr: "Bu görünümden alınan imzalı karar sayfası, saha dosyasına eklenmiş." } },
      { id: "G8-2", blocking: false, owner: "CISO", ref: "ISO 27001 A.5.7 · 6.1.2",
        req: { en: "Site-specific risks (local crime pattern, power quality, vendor dependence, language of notices) are added to the register with owners and dates.", tr: "Sahaya özgü riskler (yerel suç deseni, güç kalitesi, tedarikçi bağımlılığı, bildirim dili) sahip ve tarihle risk kaydına eklendi." },
        ev: { en: "Risk register rows filtered by site ID.", tr: "Saha kimliğine göre filtrelenmiş risk kaydı satırları." } },
      { id: "G8-3", blocking: false, owner: "CTO", ref: "WP3 budget · D5.2",
        req: { en: "Hardware is delivered and accepted: HSM, data diode, test kit and spare node, with serial numbers recorded against the site.", tr: "Donanım teslim edildi ve kabul edildi: HSM, veri diyotu, test seti ve yedek düğüm; seri numaraları sahaya işlendi." },
        ev: { en: "Delivery notes, asset register entries, acceptance signatures.", tr: "Teslim irsaliyeleri, varlık kaydı girişleri, kabul imzaları." } },
      { id: "G8-4", blocking: false, owner: "Municipality + CEO", ref: "ISO 27001 A.5.6 · crisis comms",
        req: { en: "The municipal communication plan for a security incident is approved, naming the spokesperson and the boundary with consortium messaging.", tr: "Güvenlik olayı için belediye iletişim planı onaylandı; sözcü ve konsorsiyum mesajlaşmasıyla sınır belirlendi." },
        ev: { en: "Approved plan, spokesperson nomination, joint statement template.", tr: "Onaylı plan, sözcü ataması, ortak açıklama şablonu." } }
    ]
  }
];
