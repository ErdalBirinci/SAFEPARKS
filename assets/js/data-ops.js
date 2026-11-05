/* SAFE-PARKS CISO Portal — operations: incidents, assurance, deliverables, milestones */
window.SP = window.SP || {};

SP.incidents = {
  severity: [
    { lvl: "Sev-1", tone: "danger", ack: "15 min", contain: "1 h", notify: { en: "CEO, coordinator, DPO within 1 h; authority assessment starts immediately.", tr: "CEO, koordinatör, DPO 1 saat içinde; otorite değerlendirmesi derhal başlar." },
      ex: { en: "Confirmed unauthorised access to live frames; data spill to the EFDI channel; ransomware on a park node; loss of triage in a city during an active incident.", tr: "Canlı karelere yetkisiz erişimin doğrulanması; EFDI kanalına veri sızması; park düğümünde fidye yazılımı; aktif olay sırasında bir şehirde analiz kaybı." } },
    { lvl: "Sev-2", tone: "warn", ack: "1 h", contain: "4 h", notify: { en: "CISO, CTO, municipal security lead within 2 h; DPO informed.", tr: "CISO, CTO, belediye güvenlik sorumlusu 2 saat içinde; DPO bilgilendirilir." },
      ex: { en: "Suspected credential compromise; tamper alarm; model integrity failure; partial outage of one node; misconfiguration exposing a management port.", tr: "Şüpheli kimlik bilgisi ihlali; kurcalama alarmı; model bütünlüğü hatası; bir düğümde kısmi kesinti; yönetim portunu açan yanlış yapılandırma." } },
    { lvl: "Sev-3", tone: "info", ack: "4 h", contain: "24 h", notify: { en: "CISO and municipal lead; weekly summary to coordinator.", tr: "CISO ve belediye sorumlusu; koordinatöre haftalık özet." },
      ex: { en: "Failed patch deployment; logging gap; certificate nearing expiry; single camera offline; phishing simulation click by one user.", tr: "Başarısız yama dağıtımı; günlükleme boşluğu; süresi yaklaşan sertifika; tek kamera çevrimdışı; bir kullanıcının oltalama simülasyonuna tıklaması." } },
    { lvl: "Sev-4", tone: "ok", ack: "1 iş günü", contain: "5 iş günü", notify: { en: "Ticket only; trend reporting monthly.", tr: "Yalnızca kayıt; aylık eğilim raporu." },
      ex: { en: "Low-risk vulnerability finding; documentation gap; non-critical audit observation.", tr: "Düşük riskli güvenlik açığı bulgusu; dokümantasyon boşluğu; kritik olmayan denetim gözlemi." } }
  ],
  notification: [
    { to: { en: "Supervisory authority (GDPR Art. 33)", tr: "Denetim otoritesi (GDPR Md. 33)" }, when: { en: "Within 72 h of awareness; phased reporting allowed.", tr: "Öğrenildikten sonra 72 saat içinde; aşamalı bildirim mümkün." }, what: { en: "Nature, categories and approximate volume, DPO contact, likely consequences, measures taken.", tr: "Niteliği, veri kategorileri ve yaklaşık hacim, DPO iletişimi, olası sonuçlar, alınan tedbirler." }, owner: "DPO" },
    { to: { en: "Data subjects (GDPR Art. 34)", tr: "İlgili kişiler (GDPR Md. 34)" }, when: { en: "Without undue delay where high risk.", tr: "Yüksek risk varsa gecikmeksizin." }, what: { en: "Plain language, what happened, what it means, what they can do, contact point.", tr: "Sade dil, ne olduğu, ne anlama geldiği, ne yapabilecekleri, irtibat noktası." }, owner: "DPO" },
    { to: { en: "KVKK Board (Art. 12/5)", tr: "KVKK Kurulu (Md. 12/5)" }, when: { en: "As soon as possible; 72-hour expectation, plus data subjects.", tr: "En kısa sürede; 72 saat beklentisi, ilgili kişilere de bildirim." }, what: { en: "Breach notification form fields, affected data, measures, VERBİS-consistent record.", tr: "İhlal bildirim formu alanları, etkilenen veriler, tedbirler, VERBİS ile tutarlı kayıt." }, owner: "DPO" },
    { to: { en: "CSIRT / competent authority (NIS2 Art. 23)", tr: "CSIRT / yetkili otorite (NIS2 Md. 23)" }, when: { en: "Early warning 24 h; notification 72 h; final report 1 month.", tr: "Erken uyarı 24 saat; bildirim 72 saat; nihai rapor 1 ay." }, what: { en: "Cross-border impact, severity, indicators, suspected cause, measures.", tr: "Sınır ötesi etki, şiddet, göstergeler, şüpheli neden, tedbirler." }, owner: "CISO" },
    { to: { en: "AI Act serious incident (Art. 73)", tr: "AI Act ciddi olay (Md. 73)" }, when: { en: "Within 15 days of awareness (2 days for widespread or fatal).", tr: "Öğrenildikten sonra 15 gün içinde (yaygın veya ölümcül ise 2 gün)." }, what: { en: "System identification, incident description, consequences, corrective action.", tr: "Sistem tanımı, olay açıklaması, sonuçlar, düzeltici faaliyet." }, owner: "Coordinator" },
    { to: { en: "Defence counterpart", tr: "Savunma muhatabı" }, when: { en: "Immediately via the national channel per the security agreement.", tr: "Güvenlik anlaşmasına göre ulusal kanal üzerinden derhal." }, what: { en: "Classification-marked incident report; no personal data in the channel.", tr: "Sınıflandırma işaretli olay raporu; kanalda kişisel veri yok." }, owner: "CEO" },
    { to: { en: "EPAB", tr: "EPAB" }, when: { en: "Within 72 h for any Sev-1/2 with privacy impact.", tr: "Gizlilik etkisi olan her Sev-1/2 için 72 saat içinde." }, what: { en: "Factual summary and the ethics questions raised.", tr: "Olgusal özet ve ortaya çıkan etik sorular." }, owner: "CISO" }
  ],
  timeline: [
    { t: "T+0", a: { en: "Detection: SOC rule, tamper alarm, operator report or partner notification.", tr: "Tespit: SOC kuralı, kurcalama alarmı, operatör bildirimi veya ortak bildirimi." } },
    { t: "T+15 min", a: { en: "Triage by the on-call engineer against the severity matrix; declare Sev-1/2 if criteria met.", tr: "Nöbetçi mühendis şiddet matrisine göre sınıflandırır; kriterler karşılanıyorsa Sev-1/2 ilan eder." } },
    { t: "T+30 min", a: { en: "Incident bridge opened (encrypted, recorded); roles assigned: commander, scribe, comms, technical lead.", tr: "Olay köprüsü açılır (şifreli, kayıtlı); roller atanır: komutan, kâtip, iletişim, teknik lider." } },
    { t: "T+1 h", a: { en: "Containment decision: isolate node, revoke certificates, block account, switch to degraded mode. Evidence preserved before cleanup.", tr: "Kontrol kararı: düğümü izole et, sertifikaları iptal et, hesabı kapat, azaltılmış moda geç. Temizlikten önce kanıt korunur." } },
    { t: "T+4 h", a: { en: "First factual update to CEO and coordinator; DPO starts notifiability assessment.", tr: "CEO ve koordinatöre ilk olgusal güncelleme; DPO bildirim gerekliliği değerlendirmesine başlar." } },
    { t: "T+24 h", a: { en: "NIS2 early warning if in scope; public line only if the municipality decides.", tr: "Kapsamdaysa NIS2 erken uyarısı; kamuoyu açıklaması yalnızca belediye karar verirse." } },
    { t: "T+72 h", a: { en: "GDPR/KVKK notification or a documented decision not to notify; EPAB informed.", tr: "GDPR/KVKK bildirimi veya bildirmeme kararının belgelenmesi; EPAB bilgilendirilir." } },
    { t: "T+7 d", a: { en: "Eradication and recovery complete; retest; lessons-learned draft.", tr: "Yok etme ve kurtarma tamamlanır; tekrar test; ders taslağı." } },
    { t: "T+30 d", a: { en: "Final report, control improvements added to the risk register, KPI update, board summary.", tr: "Nihai rapor, kontrol iyileştirmeleri risk kaydına eklenir, KPI güncellenir, yönetim özeti." } }
  ],
  playbooks: [
    { id: "PB-01", t: { en: "Unauthorised access to a park node or stream", tr: "Park düğümüne veya akışına yetkisiz erişim" },
      steps: [
        { en: "Confirm from SOC telemetry: authentication failures, anomalous topic subscription, unexpected process or config change.", tr: "SOC telemetrisinden teyit et: kimlik doğrulama hataları, anormal konu aboneliği, beklenmeyen süreç veya konfigürasyon değişikliği." },
        { en: "Isolate the node at the switch port; keep the node powered for volatile evidence; do not reboot before a memory snapshot decision.", tr: "Düğümü switch portundan izole et; uçucu kanıt için güç açık tut; bellek anlık görüntüsü kararından önce yeniden başlatma." },
        { en: "Revoke node and operator certificates; rotate the node key; invalidate sessions.", tr: "Düğüm ve operatör sertifikalarını iptal et; düğüm anahtarını döndür; oturumları geçersiz kıl." },
        { en: "Determine whether frames were accessed: check purge logs, process start times and egress counters.", tr: "Karelere erişilip erişilmediğini belirle: imha kayıtları, süreç başlangıç zamanları ve çıkış sayaçlarını kontrol et." },
        { en: "If frames were accessed, DPO runs the notifiability assessment; assume personal data breach until proven otherwise.", tr: "Karelere erişildiyse DPO bildirim değerlendirmesini yürütür; aksi kanıtlanana kadar kişisel veri ihlali varsay." },
        { en: "Rebuild from the signed baseline image, restore configuration, verify attestation, then return to service with heightened monitoring for 30 days.", tr: "İmzalı taban imajından yeniden kur, konfigürasyonu geri yükle, kanıtlamayı doğrula, 30 gün yoğun izlemeyle hizmete dön." }
      ] },
    { id: "PB-02", t: { en: "Credential compromise / insider abuse", tr: "Kimlik bilgisi ihlali / içeriden kötüye kullanım" },
      steps: [
        { en: "Suspend the account (not delete) and preserve its session and audit trail.", tr: "Hesabı askıya al (silme) ve oturumunu, denetim izini koru." },
        { en: "Review the last 90 days of that identity's actions: live views, exports, config changes, break-glass use.", tr: "Bu kimliğin son 90 gündeki eylemlerini incele: canlı görüntülemeler, ihraçlar, konfigürasyon değişiklikleri, acil erişim kullanımı." },
        { en: "Check for data egress: USB, print, screenshot, email, screen recording.", tr: "Veri çıkışı olup olmadığını kontrol et: USB, yazdırma, ekran görüntüsü, e-posta, ekran kaydı." },
        { en: "Rotate all credentials the identity could reach; review group memberships and shared secrets.", tr: "Kimliğin erişebildiği tüm kimlik bilgilerini döndür; grup üyeliklerini ve paylaşılan sırları gözden geçir." },
        { en: "HR and legal engaged before any interview; preserve evidence chain of custody.", tr: "Görüşmeden önce İK ve hukuk devreye alınır; kanıt zinciri korunur." },
        { en: "If personal data was exfiltrated, notify per the matrix; consider informing the municipality's works council where required.", tr: "Kişisel veri sızdırıldıysa matrise göre bildir; gerektiğinde belediyenin iş konseyini bilgilendirmeyi değerlendir." }
      ] },
    { id: "PB-03", t: { en: "Ransomware / wiper in the municipal enclave", tr: "Belediye güvenli bölgesinde fidye/silici yazılım" },
      steps: [
        { en: "Disconnect affected segments; do not power off if encryption is in progress and memory forensics is feasible.", tr: "Etkilenen segmentleri ayır; şifreleme sürüyorsa ve bellek adli incelemesi mümkünse kapatma." },
        { en: "Switch the city to manual dispatch procedure and inform the park supervisors; triage nodes keep running independently.", tr: "Şehri manuel yönlendirme prosedürüne geçir ve park sorumlularını bilgilendir; analiz düğümleri bağımsız çalışmaya devam eder." },
        { en: "Verify backups are intact and offline; restore the console and SIEM in an isolated environment first.", tr: "Yedeklerin bütün ve çevrimdışı olduğunu doğrula; önce konsol ve SIEM'i izole ortamda geri yükle." },
        { en: "Check whether the attacker reached park nodes through the management plane; if yes, treat each node as compromised.", tr: "Saldırganın yönetim düzleminden park düğümlerine ulaşıp ulaşmadığını kontrol et; ulaştıysa her düğümü ele geçirilmiş say." },
        { en: "Notify CSIRT (24 h) and the authority (72 h) if personal data is affected; coordinate messaging with the municipality.", tr: "Kişisel veri etkilendiyse CSIRT'yi (24 saat) ve otoriteyi (72 saat) bilgilendir; mesajlaşmayı belediye ile koordine et." },
        { en: "Post-incident: remove standing admin access to consoles, enforce application allowlisting, retest restore time against the RTO.", tr: "Olay sonrası: konsollara kalıcı yönetici erişimini kaldır, uygulama beyaz listesini zorunlu kıl, geri yükleme süresini RTO'ya karşı yeniden test et." }
      ] },
    { id: "PB-04", t: { en: "Camera stream interception or spoofing", tr: "Kamera akışının ele geçirilmesi veya sahtelenmesi" },
      steps: [
        { en: "Compare stream fingerprint and frame counters against the expected baseline; check certificate chain and 802.1X identity.", tr: "Akış parmak izini ve kare sayaçlarını beklenen taban çizgisiyle karşılaştır; sertifika zincirini ve 802.1X kimliğini kontrol et." },
        { en: "Physically inspect the camera, cabling and cabinet seals; photograph and record seal numbers.", tr: "Kamerayı, kablolamayı ve kabin mühürlerini fiziksel olarak incele; fotoğrafla ve mühür numaralarını kaydet." },
        { en: "Re-key the camera, re-pin the certificate, and verify that only the intended stream is accepted.", tr: "Kamerayı yeniden anahtarla, sertifikayı yeniden sabitle ve yalnızca amaçlanan akışın kabul edildiğini doğrula." },
        { en: "Assess whether an incident was masked during the anomaly window and review operator decisions in that period.", tr: "Anomali penceresinde bir olayın gizlenip gizlenmediğini değerlendir ve o dönemdeki operatör kararlarını incele." },
        { en: "Replace the device if tampering is confirmed; add the model to the watchlist and update detection rules.", tr: "Kurcalama doğrulanırsa cihazı değiştir; modeli izleme listesine ekle ve tespit kurallarını güncelle." }
      ] },
    { id: "PB-05", t: { en: "EFDI channel data spill or misclassification", tr: "EFDI kanalına veri sızması veya yanlış sınıflandırma" },
      steps: [
        { en: "Stop the connector and close the diode path immediately; the safety impact of stopping is acceptable compared with a spill.", tr: "Bağlayıcıyı durdur ve diyot yolunu derhal kapat; durdurmanın güvenlik etkisi sızma ile karşılaştırıldığında kabul edilebilir." },
        { en: "Capture the exact exported payloads from the connector audit log and classify what left.", tr: "Bağlayıcı denetim kaydından ihraç edilen tam yükleri al ve neyin çıktığını sınıflandır." },
        { en: "Notify the defence counterpart through the national channel; request deletion confirmation at the receiving end.", tr: "Savunma muhatabını ulusal kanal üzerinden bilgilendir; alıcı tarafta silme teyidi talep et." },
        { en: "If personal data crossed, treat as a GDPR/KVKK breach and run the notifiability assessment.", tr: "Kişisel veri geçtiyse GDPR/KVKK ihlali olarak ele al ve bildirim değerlendirmesini yürüt." },
        { en: "Root cause: schema drift, label table error or human release. Fix, add a regression test, and re-run the conformance suite before reopening.", tr: "Kök neden: şema kayması, etiket tablosu hatası veya insan hatası. Düzelt, regresyon testi ekle ve yeniden açmadan önce uygunluk setini tekrar çalıştır." }
      ] },
    { id: "PB-06", t: { en: "Supply-chain compromise (firmware, library, model)", tr: "Tedarik zinciri ihlali (ürün yazılımı, kütüphane, model)" },
      steps: [
        { en: "Freeze all deployments; identify affected serial numbers, versions and hashes from the SBOM.", tr: "Tüm dağıtımları dondur; SBOM'dan etkilenen seri numaralarını, sürümleri ve hash'leri belirle." },
        { en: "Verify signatures and compare against the build manifest; isolate any device whose measured boot differs.", tr: "İmzaları doğrula ve derleme manifestosuyla karşılaştır; ölçülen önyüklemesi farklı olan her cihazı izole et." },
        { en: "Notify the supplier and request an incident statement and fixed artefacts; exercise audit rights.", tr: "Tedarikçiyi bilgilendir, olay beyanı ve düzeltilmiş artefakt talep et; denetim haklarını kullan." },
        { en: "Assess exploitation evidence on nodes: outbound attempts, new processes, unusual model versions.", tr: "Düğümlerde istismar kanıtı ara: giden bağlantı denemeleri, yeni süreçler, olağandışı model sürümleri." },
        { en: "Roll back to the last known-good signed version; update the allowlist and the supplier risk rating.", tr: "Bilinen son iyi imzalı sürüme dön; beyaz listeyi ve tedarikçi risk notunu güncelle." }
      ] },
    { id: "PB-07", t: { en: "Loss of availability during a crisis", tr: "Kriz sırasında erişilebilirlik kaybı" },
      steps: [
        { en: "Declare degraded mode; confirm which nodes are autonomous and which need intervention.", tr: "Azaltılmış mod ilan et; hangi düğümlerin otonom, hangilerinin müdahale gerektirdiğini teyit et." },
        { en: "Dispatch field technicians with spare nodes and pre-provisioned keys; log every physical intervention.", tr: "Yedek düğümler ve önceden hazırlanmış anahtarlarla saha teknisyenlerini yönlendir; her fiziksel müdahaleyi kaydet." },
        { en: "Communicate the reduced capability to the municipality and, if public safety is materially affected, to the public.", tr: "Azalan yeteneği belediyeye ve kamusal güvenlik maddi olarak etkileniyorsa kamuoyuna bildir." },
        { en: "Restore power/network, verify attestation, run a smoke test on the acoustic path before re-enabling video triage.", tr: "Güç/ağı geri yükle, kanıtlamayı doğrula, video analizini yeniden açmadan önce akustik yolda duman testi çalıştır." },
        { en: "Record the gap duration against the 15-minute tolerance and escalate if exceeded.", tr: "Kesinti süresini 15 dakikalık toleransa göre kaydet ve aşılırsa escalate et." }
      ] }
  ]
};

SP.assurance = {
  pentests: [
    { id: "PT-01", when: "M9", scope: { en: "Internal pre-pilot: edge node, broker, purge mechanism, operator console", tr: "Pilot öncesi iç test: uç düğüm, broker, imha mekanizması, operatör konsolu" }, type: { en: "Internal grey-box", tr: "İç gri kutu" }, status: "planned" },
    { id: "PT-02", when: "M13", scope: { en: "External black-box before first city go-live, incl. physical access attempt", tr: "İlk şehir canlıya geçişi öncesi harici kara kutu, fiziksel erişim denemesi dahil" }, type: { en: "External", tr: "Harici" }, status: "planned" },
    { id: "PT-03", when: "M21", scope: { en: "EFDI connector, diode, label enforcement, cross-domain abuse cases", tr: "EFDI bağlayıcısı, diyot, etiket zorunluluğu, çapraz alan kötüye kullanım senaryoları" }, type: { en: "External + defence reviewer", tr: "Harici + savunma gözden geçiren" }, status: "planned" },
    { id: "PT-04", when: "M29", scope: { en: "Full stack retest incl. AI adversarial suite and all previous findings", tr: "YZ karşıt seti ve önceki tüm bulgular dahil tam yığın tekrar testi" }, type: { en: "External", tr: "Harici" }, status: "planned" },
    { id: "PT-05", when: "M34", scope: { en: "Final assurance and closure evidence for the commission", tr: "Komisyon için nihai güvence ve kapanış kanıtı" }, type: { en: "Verification", tr: "Doğrulama" }, status: "planned" }
  ],
  audits: [
    { id: "AU-01", when: "M6", t: { en: "ISO 27001 gap assessment", tr: "ISO 27001 fark analizi" }, out: { en: "Gap report + remediation plan", tr: "Fark raporu + iyileştirme planı" } },
    { id: "AU-02", when: "M10", t: { en: "ISO 27001 Stage 1 (documentation & readiness)", tr: "ISO 27001 Aşama 1 (dokümantasyon ve hazırlık)" }, out: { en: "Stage 1 report", tr: "Aşama 1 raporu" } },
    { id: "AU-03", when: "M12", t: { en: "ISO 27001 Stage 2 (certification audit)", tr: "ISO 27001 Aşama 2 (belgelendirme denetimi)" }, out: { en: "Certificate, scope statement", tr: "Sertifika, kapsam beyanı" } },
    { id: "AU-04", when: "M18, M30", t: { en: "Internal audit cycle (all clauses, sampled controls)", tr: "İç denetim döngüsü (tüm maddeler, örneklenmiş kontroller)" }, out: { en: "Internal audit report + CAPA", tr: "İç denetim raporu + DÖF" } },
    { id: "AU-05", when: "M24", t: { en: "Municipal DPO inspection of technical evidence", tr: "Belediye DPO'sunun teknik kanıt incelemesi" }, out: { en: "Inspection note per city", tr: "Şehir başına inceleme notu" } },
    { id: "AU-06", when: "M33", t: { en: "Surveillance audit readiness review", tr: "Gözetim denetimi hazırlık incelemesi" }, out: { en: "Readiness checklist", tr: "Hazırlık kontrol listesi" } }
  ],
  sdlc: [
    { g: { en: "Threat model per feature", tr: "Özellik başına tehdit modeli" }, when: { en: "Before design approval", tr: "Tasarım onayından önce" }, ev: "TM-###" },
    { g: { en: "Privacy review (DPIAdelta)", tr: "Gizlilik incelemesi (DPIA farkı)" }, when: { en: "Any change to data, retention or model purpose", tr: "Veri, saklama veya model amacında her değişiklik" }, ev: "PR-CHK" },
    { g: { en: "SAST + secret scanning", tr: "SAST + gizli bilgi taraması" }, when: { en: "Every commit (blocking on high)", tr: "Her commit (yüksek bulguda bloke)" }, ev: "CI-SAST" },
    { g: { en: "SCA + dependency allowlist", tr: "SCA + bağımlılık beyaz listesi" }, when: { en: "Every build", tr: "Her derleme" }, ev: "CI-SCA" },
    { g: { en: "DAST on the staging stack", tr: "Hazırlık ortamında DAST" }, when: { en: "Every release candidate", tr: "Her sürüm adayı" }, ev: "CI-DAST" },
    { g: { en: "SBOM + signed artefacts", tr: "SBOM + imzalı artefaktlar" }, when: { en: "Every release", tr: "Her sürüm" }, ev: "SBOM-###" },
    { g: { en: "Purge and attestation test", tr: "İmha ve kanıtlama testi" }, when: { en: "Every build touching the pipeline", tr: "Hattı etkileyen her derleme" }, ev: "PURGE-TEST" },
    { g: { en: "CISO release approval", tr: "CISO sürüm onayı" }, when: { en: "Before production/pilot promotion", tr: "Üretim/pilot terfisinden önce" }, ev: "REL-APPR" }
  ],
  training: [
    { who: { en: "All consortium staff", tr: "Tüm konsorsiyum personeli" }, what: { en: "Annual security & privacy essentials, 45 min, quiz ≥80%", tr: "Yıllık güvenlik ve gizlilik temelleri, 45 dk, test ≥%80" }, when: { en: "Onboarding + annually", tr: "İşe başlama + yıllık" } },
    { who: { en: "Engineers", tr: "Mühendisler" }, what: { en: "Secure coding, threat modelling, AI robustness", tr: "Güvenli kodlama, tehdit modelleme, YZ dayanıklılığı" }, when: { en: "Twice a year", tr: "Yılda iki kez" } },
    { who: { en: "Municipal operators", tr: "Belediye operatörleri" }, what: { en: "Lawful use, four-eyes rule, incident reporting, DPIA obligations", tr: "Hukuka uygun kullanım, dört göz kuralı, olay bildirimi, DPIA yükümlülükleri" }, when: { en: "Before console access + annually", tr: "Konsol erişiminden önce + yıllık" } },
    { who: { en: "Management / CEO", tr: "Yönetim / CEO" }, what: { en: "NIS2 governance duties, risk acceptance, incident decision-making", tr: "NIS2 yönetişim yükümlülükleri, risk kabulü, olay karar alma" }, when: { en: "Annually", tr: "Yıllık" } },
    { who: { en: "EPAB members", tr: "EPAB üyeleri" }, what: { en: "Technical primer on triage, minimisation and purge proof", tr: "Analiz, minimizasyon ve imha kanıtı üzerine teknik başlangıç" }, when: { en: "At appointment", tr: "Atanma sırasında" } }
  ],
  certRoadmap: [
    { m: "M6", s: { en: "Scope definition, SoA draft, risk assessment", tr: "Kapsam tanımı, Uygunluk Beyanı taslağı, risk değerlendirmesi" } },
    { m: "M9", s: { en: "Documented ISMS, internal audit #1, management review", tr: "Belgelenmiş BGYS, 1. iç denetim, yönetim gözden geçirmesi" } },
    { m: "M10", s: { en: "Stage 1 audit", tr: "Aşama 1 denetimi" } },
    { m: "M12", s: { en: "Stage 2 audit and certificate", tr: "Aşama 2 denetimi ve sertifika" } },
    { m: "M18", s: { en: "Extend scope to pilot operations; ISO/IEC 42001 gap analysis", tr: "Kapsamı pilot operasyonlara genişlet; ISO/IEC 42001 fark analizi" } },
    { m: "M30", s: { en: "Surveillance audit; consider ISO/IEC 27701 extension", tr: "Gözetim denetimi; ISO/IEC 27701 genişletmesini değerlendir" } }
  ]
};

SP.deliverables = [
  { id: "D1.2", t: { en: "Data Management Plan (security & retention annex)", tr: "Veri Yönetim Planı (güvenlik ve saklama eki)" }, wp: "WP1", lead: "Xena Vision", due: "M6", type: "DMP", level: "PU", role: { en: "Contributor — security and retention annex", tr: "Katkı — güvenlik ve saklama eki" }, status: "in-progress" },
  { id: "D2.2", t: { en: "DPIA methodology and template", tr: "DPIA metodolojisi ve şablonu" }, wp: "WP2", lead: "CEPS", due: "M8", type: "Report", level: "PU", role: { en: "Co-author — technical annex, purge evidence model", tr: "Ortak yazar — teknik ek, imha kanıt modeli" }, status: "in-progress" },
  { id: "D2.3", t: { en: "Legal & ethical compliance framework", tr: "Hukuki ve etik uyum çerçevesi" }, wp: "WP2", lead: "CEPS", due: "M12", type: "Report", level: "PU", role: { en: "Reviewer — technical feasibility of each obligation", tr: "Gözden geçiren — her yükümlülüğün teknik uygulanabilirliği" }, status: "planned" },
  { id: "D3.1", t: { en: "Security architecture and threat model", tr: "Güvenlik mimarisi ve tehdit modeli" }, wp: "WP3", lead: "Lotus Sirius", due: "M6", type: "Report", level: "PU", role: { en: "Owner", tr: "Sahip" }, status: "in-progress" },
  { id: "D3.2", t: { en: "Secure telemetry and key management specification", tr: "Güvenli telemetri ve anahtar yönetimi şartnamesi" }, wp: "WP3", lead: "Lotus Sirius", due: "M10", type: "Specification", level: "PU", role: { en: "Owner", tr: "Sahip" }, status: "planned" },
  { id: "D3.3", t: { en: "Air-gap operations and resilience test report", tr: "İzole ağ operasyonları ve dayanıklılık test raporu" }, wp: "WP3", lead: "Lotus Sirius", due: "M16", type: "Report", level: "SEN", role: { en: "Owner", tr: "Sahip" }, status: "planned" },
  { id: "D3.4", t: { en: "EFDI / NATO connector and STANAG conformance report", tr: "EFDI / NATO bağlayıcısı ve STANAG uygunluk raporu" }, wp: "WP3", lead: "Lotus Sirius", due: "M22", type: "Report", level: "SEN", role: { en: "Owner", tr: "Sahip" }, status: "planned" },
  { id: "D3.5", t: { en: "Post-quantum migration roadmap and crypto policy", tr: "Kuantum sonrası geçiş yol haritası ve kripto politikası" }, wp: "WP3", lead: "Lotus Sirius", due: "M24", type: "Report", level: "PU", role: { en: "Owner", tr: "Sahip" }, status: "planned" },
  { id: "D3.6", t: { en: "Security assurance, penetration test and audit report", tr: "Güvenlik güvencesi, sızma testi ve denetim raporu" }, wp: "WP3", lead: "Lotus Sirius", due: "M30", type: "Report", level: "SEN", role: { en: "Owner", tr: "Sahip" }, status: "planned" },
  { id: "D5.2", t: { en: "Hardened edge node reference design", tr: "Sertleştirilmiş uç düğüm referans tasarımı" }, wp: "WP5", lead: "3S Holding", due: "M14", type: "Report", level: "PU", role: { en: "Co-author — baseline, keys, tamper controls", tr: "Ortak yazar — taban, anahtarlar, kurcalama kontrolleri" }, status: "planned" },
  { id: "D6.2", t: { en: "Pilot security acceptance test reports (7 cities)", tr: "Pilot güvenlik kabul test raporları (7 şehir)" }, wp: "WP6", lead: "Municipalities", due: "M26", type: "Report", level: "SEN", role: { en: "Owner of the acceptance criteria and sign-off", tr: "Kabul kriterleri ve onayın sahibi" }, status: "planned" },
  { id: "D7.4", t: { en: "Standardisation and policy recommendations", tr: "Standardizasyon ve politika önerileri" }, wp: "WP7", lead: "UNIROMA1", due: "M34", type: "Report", level: "PU", role: { en: "Contributor — security standards chapter", tr: "Katkı — güvenlik standartları bölümü" }, status: "planned" }
];

SP.milestones = [
  { id: "MS3", m: "M8", t: { en: "Security architecture frozen; D3.1 accepted", tr: "Güvenlik mimarisi donduruldu; D3.1 kabul edildi" }, crit: { en: "CISO sign-off, threat model covers all trust boundaries", tr: "CISO onayı, tehdit modeli tüm güven sınırlarını kapsıyor" } },
  { id: "MS6", m: "M16", t: { en: "Air-gap failover demonstrated in a live park", tr: "İzole ağ yedeklemesi canlı parkta gösterildi" }, crit: { en: "60-minute WAN and grid interruption, triage continues", tr: "60 dakikalık WAN ve elektrik kesintisi, analiz sürüyor" } },
  { id: "MS8", m: "M22", t: { en: "EFDI connector demonstrated with classification labels", tr: "EFDI bağlayıcısı sınıflandırma etiketleriyle gösterildi" }, crit: { en: "STANAG conformance, no personal data in exports", tr: "STANAG uygunluğu, ihraçlarda kişisel veri yok" } },
  { id: "MS10", m: "M30", t: { en: "Final security audit and assurance pack", tr: "Nihai güvenlik denetimi ve güvence paketi" }, crit: { en: "Zero open critical/high findings, all evidence archived", tr: "Açık kritik/yüksek bulgu yok, tüm kanıtlar arşivlendi" } }
];
