/* SAFE-PARKS CISO Portal — risk register and STRIDE threat model */
window.SP = window.SP || {};

SP.risks = [
  { id: "R1", cat: "privacy", l: 3, i: 5, owner: "CISO", status: "treating", due: "M12",
    t: { en: "Function creep of the triage capability", tr: "Analiz yeteneğinin işlev kayması" },
    d: { en: "Once video triage exists, municipalities may be asked to use it for crowd control, protests, parking enforcement or profiling. Each extension changes the legal basis and the DPIA.", tr: "Video analizi bir kez kurulduğunda belediyelerden kalabalık kontrolü, eylemler, otopark denetimi veya profilleme için kullanılması istenebilir. Her genişleme hukuki dayanağı ve DPIA'yı değiştirir." },
    m: { en: "Purpose catalogue hard-coded in the policy engine; new purpose requires DPIA delta, EPAB opinion and CEO decision; annual purpose audit; contract clause limiting use.", tr: "Amaç kataloğu politika motorunda sabit; yeni amaç DPIA farkı, EPAB görüşü ve CEO kararı gerektirir; yıllık amaç denetimi; kullanımı sınırlayan sözleşme maddesi." } },

  { id: "R2", cat: "privacy", l: 2, i: 5, owner: "CTO", status: "treating", due: "M6",
    t: { en: "Biometric capability introduced through a model or library update", tr: "Model veya kütüphane güncellemesiyle biyometrik yeteneğin girmesi" },
    d: { en: "A dependency upgrade or a supplier model could add face detection or embedding extraction, silently turning the pilot into biometric surveillance.", tr: "Bir bağımlılık güncellemesi veya tedarikçi modeli yüz tespiti ya da gömme çıkarımı ekleyerek pilotu sessizce biyometrik gözetime dönüştürebilir." },
    m: { en: "Dependency allowlist, CI build gate that fails on biometric symbols, model card attestation, third-party code review, pentest scope explicitly tests for biometric outputs.", tr: "Bağımlılık beyaz listesi, biyometrik sembollerde başarısız olan CI kapısı, model kartı beyanı, üçüncü taraf kod incelemesi, sızma testi kapsamında biyometrik çıktı testi." } },

  { id: "R3", cat: "privacy", l: 3, i: 3, owner: "Municipalities", status: "open", due: "M10",
    t: { en: "Camera field of view captures private property or interiors", tr: "Kamera görüş alanının özel mülkü veya iç mekânları kapsaması" },
    d: { en: "Installation by local contractors without a documented survey can capture windows, gardens or playground changing areas, creating unlawful surveillance.", tr: "Belgelenmiş etüt olmadan yerel yüklenicilerce yapılan kurulum, pencereleri, bahçeleri veya oyun alanı soyunma bölümlerini kapsayarak hukuka aykırı gözetim yaratabilir." },
    m: { en: "Mandatory FOV survey with DPO sign-off before mounting, privacy masks, fixed lenses, photo evidence in the asset record, annual re-survey.", tr: "Montaj öncesi DPO onaylı zorunlu görüş alanı etüdü, gizlilik maskeleri, sabit lensler, varlık kaydında fotoğraf kanıtı, yıllık yeniden etüt." } },

  { id: "R4", cat: "insider", l: 2, i: 5, owner: "CISO", status: "treating", due: "M9",
    t: { en: "Insider exfiltration of footage, keys or event data", tr: "Görüntü, anahtar veya olay verisinin içeriden sızdırılması" },
    d: { en: "An administrator with standing access could export a clip, copy a key or dump the event store, causing a reportable breach and reputational damage.", tr: "Kalıcı erişimi olan bir yönetici klip kopyalayabilir, anahtar alabilir veya olay deposunu dökümleyebilir; bu da bildirime tabi ihlal ve itibar kaybı yaratır." },
    m: { en: "No standing frame access, break-glass with post-hoc review, HSM dual control, USB mass storage blocked, DLP on consoles, quarterly log review, vetting and NDAs.", tr: "Kalıcı kare erişimi yok, sonradan incelemeli acil erişim, HSM çift kontrol, USB depolama engelli, konsollarda DLP, üç aylık günlük incelemesi, güvenlik soruşturması ve gizlilik sözleşmeleri." } },

  { id: "R5", cat: "cyber", l: 3, i: 4, owner: "CISO", status: "treating", due: "M8",
    t: { en: "Ransomware or wiper reaches the municipal enclave", tr: "Fidye yazılımı veya silici yazılımın belediye güvenli bölgesine ulaşması" },
    d: { en: "The operator console and SIEM sit on municipal IT. A commodity ransomware incident there could halt dispatch and destroy evidence.", tr: "Operatör konsolu ve SIEM belediye BT'sinde bulunur. Buradaki sıradan bir fidye yazılımı olayı yönlendirmeyi durdurabilir ve kanıtları yok edebilir." },
    m: { en: "Segment the park management plane, offline immutable backups, EDR on consoles, application allowlisting, quarterly restore test, documented manual dispatch procedure.", tr: "Park yönetim düzlemini segmentle, çevrimdışı değiştirilemez yedekler, konsollarda EDR, uygulama beyaz listesi, üç aylık geri yükleme testi, belgelenmiş manuel yönlendirme prosedürü." } },

  { id: "R6", cat: "cyber", l: 2, i: 5, owner: "CTO", status: "treating", due: "M7",
    t: { en: "Park node compromised through an exposed management interface", tr: "Açık yönetim arayüzü üzerinden park düğümünün ele geçirilmesi" },
    d: { en: "Edge nodes are physically reachable. A default password, debug port or open SSH would allow full control of the triage stream.", tr: "Uç düğümler fiziksel olarak erişilebilir. Varsayılan parola, hata ayıklama portu veya açık SSH analiz akışının tam kontrolünü sağlar." },
    m: { en: "No default credentials, unique per-node keys, debug ports disabled and sealed, deny-all inbound, TPM-backed identity, port scan in every acceptance test.", tr: "Varsayılan kimlik bilgisi yok, düğüm başına tekil anahtarlar, hata ayıklama portları kapalı ve mühürlü, tüm girişler kapalı, TPM destekli kimlik, her kabul testinde port taraması." } },

  { id: "R7", cat: "supply", l: 2, i: 5, owner: "CISO", status: "treating", due: "M12",
    t: { en: "Backdoor in camera, NPU or gateway firmware", tr: "Kamera, NPU veya geçit ürün yazılımında arka kapı" },
    d: { en: "Hardware from global suppliers may contain undisclosed callbacks or remote capabilities that bypass the air gap.", tr: "Küresel tedarikçilerden gelen donanım, izole ağı atlayan açıklanmamış geri çağrılar veya uzaktan yetenekler içerebilir." },
    m: { en: "Signed firmware only, SBOM and attestation, country-of-origin review, outbound traffic baseline with alerts on any egress, hardware inspection, alternative vendor qualified.", tr: "Yalnızca imzalı ürün yazılımı, SBOM ve beyan, menşe ülke incelemesi, her çıkışta alarm veren giden trafik taban çizgisi, donanım incelemesi, alternatif tedarikçi yeterliliği." } },

  { id: "R8", cat: "operational", l: 4, i: 3, owner: "CTO", status: "open", due: "M14",
    t: { en: "Critical vulnerability stays unpatched because the node is air-gapped", tr: "Kritik güvenlik açığının düğüm izole olduğu için yamalanmaması" },
    d: { en: "Offline update cycles are slow and manual. A known exploited vulnerability may persist for weeks across seven cities.", tr: "Çevrimdışı güncelleme döngüleri yavaş ve manueldir. Bilinen istismar edilen bir açık yedi şehirde haftalarca sürebilir." },
    m: { en: "Monthly signed patch bundle, 7-day SLA for critical, patch compliance KPI, staged rollout with canary node, documented emergency update by two-person team.", tr: "Aylık imzalı yama paketi, kritik için 7 gün SLA, yama uyum KPI'sı, kanarya düğümle kademeli yayın, iki kişilik ekiple belgelenmiş acil güncelleme." } },

  { id: "R9", cat: "crypto", l: 2, i: 5, owner: "CISO", status: "treating", due: "M12",
    t: { en: "Key compromise or use of deprecated cryptography", tr: "Anahtar ele geçirilmesi veya kullanımdan kaldırılmış kripto kullanımı" },
    d: { en: "Keys generated on-node without an HSM, or legacy TLS retained for compatibility, would undermine the whole confidentiality model.", tr: "HSM olmadan düğümde üretilen anahtarlar veya uyumluluk için korunan eski TLS, tüm gizlilik modelini zayıflatır." },
    m: { en: "HSM-backed key ceremonies, 90-day rotation, TLS policy enforced by configuration baseline, cryptographic inventory reviewed quarterly, no self-signed certificates in production.", tr: "HSM destekli anahtar törenleri, 90 günlük rotasyon, konfigürasyon tabanıyla zorunlu TLS politikası, üç aylık kripto envanteri incelemesi, üretimde kendinden imzalı sertifika yok." } },

  { id: "R10", cat: "defence", l: 1, i: 5, owner: "CISO", status: "treating", due: "M20",
    t: { en: "Personal data spills into the EFDI defence channel", tr: "EFDI savunma kanalına kişisel veri sızması" },
    d: { en: "An over-broad export or a schema change could send identifiers, coordinates or free text into a defence network where GDPR cannot be enforced.", tr: "Aşırı geniş bir çıktı veya şema değişikliği tanımlayıcıları, koordinatları ya da serbest metni GDPR'ın uygulanamayacağı bir savunma ağına gönderebilir." },
    m: { en: "Allowlist schema at the diode, PII canary tokens tested every release, human release approval, quarterly exported-payload audit, immediate stop procedure.", tr: "Diyotta beyaz liste şeması, her sürümde test edilen kişisel veri kanarya belirteçleri, insan onaylı çıkış, üç aylık ihraç yükü denetimi, derhal durdurma prosedürü." } },

  { id: "R11", cat: "defence", l: 2, i: 4, owner: "CTO", status: "open", due: "M22",
    t: { en: "Incorrect classification labelling of defence-bound messages", tr: "Savunmaya giden mesajların sınıflandırma etiketlerinin yanlış olması" },
    d: { en: "STANAG 4774/4778 metadata is easy to misconfigure; a wrong label can either block a crisis message or expose it too widely.", tr: "STANAG 4774/4778 üstverisinin yanlış yapılandırılması kolaydır; hatalı etiket kriz mesajını engelleyebilir veya gereğinden geniş paylaşıma açabilir." },
    m: { en: "Label policy table approved by the national authority, automated conformance tests, schema validation, rejection of unlabelled payloads, conformance report D3.4.", tr: "Ulusal makamca onaylı etiket politikası tablosu, otomatik uygunluk testleri, şema doğrulama, etiketsiz yükün reddi, D3.4 uygunluk raporu." } },

  { id: "R12", cat: "availability", l: 3, i: 4, owner: "CTO", status: "treating", due: "M16",
    t: { en: "Loss of triage capability during a real emergency", tr: "Gerçek bir acil durumda analiz yeteneğinin kaybı" },
    d: { en: "Power loss, network outage or a failed watchdog could leave a park unmonitored exactly when an incident occurs.", tr: "Elektrik kesintisi, ağ kesintisi veya arızalı watchdog, tam da olay anında parkı izlemesiz bırakabilir." },
    m: { en: "72-hour autonomy with UPS and local generation, hardware watchdog, acoustic-only fallback, node health telemetry, monthly failover drill, spare node per city.", tr: "UPS ve yerel jeneratörle 72 saat otonomi, donanım watchdog, yalnızca akustik yedek mod, düğüm sağlığı telemetrisi, aylık yedekleme tatbikatı, şehir başına yedek düğüm." } },

  { id: "R13", cat: "ai", l: 3, i: 5, owner: "CTO", status: "open", due: "M20",
    t: { en: "False negative on weapon or fall detection", tr: "Silah veya düşme tespitinde yanlış negatif" },
    d: { en: "A missed detection in a playground incident is a safety failure with legal and ethical consequences, and undermines the project's justification.", tr: "Oyun alanı olayında kaçırılan tespit, hukuki ve etik sonuçları olan bir güvenlik başarısızlığıdır ve projenin gerekçesini zayıflatır." },
    m: { en: "Recall-focused validation per site and lighting condition, confidence thresholds tuned conservatively, acoustic cross-check, published performance envelope and limitations, no claim of guaranteed detection.", tr: "Saha ve aydınlatma koşulu başına duyarlılık odaklı doğrulama, temkinli ayarlanmış güven eşikleri, akustik çapraz kontrol, yayımlanmış performans zarfı ve sınırlamalar, garantili tespit iddiası yok." } },

  { id: "R14", cat: "ai", l: 4, i: 3, owner: "CISO", status: "treating", due: "M18",
    t: { en: "Alert fatigue from false positives desensitises operators", tr: "Yanlış pozitiflerden kaynaklanan alarm yorgunluğu operatörleri duyarsızlaştırması" },
    d: { en: "A high false-positive rate trains operators to dismiss alerts, which is how a real incident gets missed.", tr: "Yüksek yanlış pozitif oranı operatörleri alarmları yok saymaya alıştırır; gerçek olayların kaçırılması böyle olur." },
    m: { en: "Per-site threshold calibration, weekly false-positive review, suppression rules with expiry, operator feedback channel, KPI tracked monthly, capacity planning with the municipality.", tr: "Saha bazında eşik kalibrasyonu, haftalık yanlış pozitif incelemesi, süreli bastırma kuralları, operatör geri bildirim kanalı, aylık izlenen KPI, belediye ile kapasite planlaması." } },

  { id: "R15", cat: "legal", l: 3, i: 4, owner: "DPO", status: "open", due: "M10",
    t: { en: "Pilot goes live before a signed DPIA exists", tr: "İmzalı DPIA olmadan pilotun canlıya geçmesi" },
    d: { en: "Schedule pressure from field validation could push a city live without the DPIA and EPAB opinion, which is a direct Art. 35 breach.", tr: "Saha doğrulamasından gelen takvim baskısı bir şehri DPIA ve EPAB görüşü olmadan canlıya alabilir; bu doğrudan Md. 35 ihlalidir." },
    m: { en: "Go-live gate in the project plan requiring DPIA ID and EPAB opinion; CISO veto; site acceptance test checks the documents physically.", tr: "Proje planında DPIA kimliği ve EPAB görüşü isteyen canlıya geçiş kapısı; CISO vetosu; saha kabul testi belgeleri fiziksel olarak kontrol eder." } },

  { id: "R16", cat: "privacy", l: 2, i: 5, owner: "CISO", status: "treating", due: "M9",
    t: { en: "Support tooling creates an unintended cross-border transfer", tr: "Destek araçlarının istenmeyen sınır ötesi aktarım yaratması" },
    d: { en: "A vendor's default telemetry, crash dump or cloud logging feature can quietly export device and usage data outside the country.", tr: "Bir tedarikçinin varsayılan telemetrisi, çökme dökümü veya bulut günlükleme özelliği cihaz ve kullanım verisini sessizce ülke dışına çıkarabilir." },
    m: { en: "Egress deny-all verified by test, vendor telemetry disabled and validated, no crash reporting to external endpoints, sanitised support bundles, contractual prohibition.", tr: "Testle doğrulanmış tüm çıkışların kapatılması, tedarikçi telemetrisi devre dışı ve doğrulanmış, harici uçlara çökme raporu yok, arındırılmış destek paketleri, sözleşmesel yasak." } },

  { id: "R17", cat: "legal", l: 3, i: 4, owner: "DPO", status: "open", due: "M8",
    t: { en: "Legal basis differs between pilot countries and is inconsistently documented", tr: "Pilot ülkeleri arasında hukuki dayanağın farklı olması ve tutarsız belgelenmesi" },
    d: { en: "Municipal competences, police powers and KVKK/GDPR interfaces differ; one harmonised template may not hold in every city.", tr: "Belediye yetkileri, polis yetkileri ve KVKK/GDPR arayüzleri farklıdır; tek bir uyumlaştırılmış şablon her şehirde geçerli olmayabilir." },
    m: { en: "Country-specific legal annex prepared with WP2, DPO sign-off per city, local counsel review, EPAB opinion on divergences.", tr: "WP2 ile hazırlanan ülkeye özgü hukuki ek, şehir bazında DPO onayı, yerel hukuk incelemesi, farklılıklar için EPAB görüşü." } },

  { id: "R18", cat: "reputation", l: 3, i: 4, owner: "CEO", status: "open", due: "M24",
    t: { en: "Public backlash or media framing as mass surveillance", tr: "Kamuoyu tepkisi veya medyada kitlesel gözetim olarak çerçevelenme" },
    d: { en: "Even a privacy-preserving camera project can be portrayed as surveillance; trust loss can stop a pilot politically.", tr: "Gizliliği koruyan bir kamera projesi bile gözetim olarak sunulabilir; güven kaybı bir pilotu siyasi olarak durdurabilir." },
    m: { en: "Published privacy notice and plain-language explainer, open EPAB opinions, citizen engagement before installation, press kit with verifiable technical facts, rapid response protocol.", tr: "Yayımlanmış gizlilik bildirimi ve sade dil açıklaması, açık EPAB görüşleri, kurulum öncesi vatandaş katılımı, doğrulanabilir teknik olgular içeren basın kiti, hızlı yanıt protokolü." } },

  { id: "R19", cat: "supply", l: 3, i: 4, owner: "CISO", status: "treating", due: "M6",
    t: { en: "Vendor remote access enabled ad hoc during troubleshooting", tr: "Sorun giderme sırasında tedarikçi uzaktan erişiminin anlık açılması" },
    d: { en: "Operational pressure leads to a temporary tunnel that is never closed, bypassing the air gap and the transfer prohibition.", tr: "Operasyonel baskı, asla kapatılmayan ve izole ağı ve aktarım yasağını atlayan geçici bir tünel açılmasına yol açar." },
    m: { en: "Remote access not present in the product; maintenance window with physical presence and dual control; session recording; automatic expiry; audit of firewall rules monthly.", tr: "Üründe uzaktan erişim yok; fiziksel mevcudiyet ve çift kontrollü bakım penceresi; oturum kaydı; otomatik sona erme; güvenlik duvarı kurallarının aylık denetimi." } },

  { id: "R20", cat: "programme", l: 4, i: 3, owner: "Coordinator", status: "open", due: "M34",
    t: { en: "Schedule pressure erodes assurance activities", tr: "Takvim baskısının güvence faaliyetlerini aşındırması" },
    d: { en: "When a pilot wave slips, pentests and DPIA iterations are the first things cut, transferring risk to the public and to the municipalities.", tr: "Bir pilot dalgası geciktiğinde ilk kesilen şeyler sızma testleri ve DPIA iterasyonlarıdır; risk kamusal alana ve belediyelere aktarılır." },
    m: { en: "Assurance activities fixed in the DoA and WP3 budget, CISO veto on go-live, minimum test set defined as non-negotiable, escalation to EPAB if reduced.", tr: "Güvence faaliyetleri DoA ve WP3 bütçesinde sabit, canlıya geçişte CISO vetosu, vazgeçilemez asgari test seti tanımı, azaltılırsa EPAB'a escalasyon." } },

  { id: "R21", cat: "operational", l: 3, i: 3, owner: "CISO", status: "open", due: "M15",
    t: { en: "Metadata-only logging leaves investigation gaps", tr: "Yalnızca üstveri günlüklemesinin soruşturma boşlukları bırakması" },
    d: { en: "Because content is not logged, an incident may be hard to reconstruct; the tension between accountability and minimisation must be managed explicitly.", tr: "İçerik kaydedilmediği için bir olayın yeniden kurgulanması zor olabilir; hesap verebilirlik ile minimizasyon arasındaki gerilim açıkça yönetilmelidir." },
    m: { en: "Rich security metadata (who, what, when, node, result), hash chaining, external SIEM correlation, documented reconstruction procedure tested in drills.", tr: "Zengin güvenlik üstverisi (kim, ne, ne zaman, düğüm, sonuç), hash zinciri, harici SIEM korelasyonu, tatbikatlarda test edilen belgelenmiş yeniden kurgulama prosedürü." } },

  { id: "R22", cat: "crypto", l: 2, i: 3, owner: "CISO", status: "open", due: "M30",
    t: { en: "Post-quantum migration stalls after the roadmap", tr: "Kuantum sonrası geçişin yol haritasından sonra durması" },
    d: { en: "A roadmap without funded engineering becomes a document; long-lived park infrastructure will outlive the quantum transition window.", tr: "Mühendislik bütçesi olmayan yol haritası belge olarak kalır; uzun ömürlü park altyapısı kuantum geçiş penceresini aşacaktır." },
    m: { en: "Hybrid TLS pilot in M18, crypto-agility requirement in procurement, firmware update path for PQC, annual migration review with the CTO, CNSA 2.0 alignment tracked.", tr: "M18'de hibrit TLS pilotu, satın almada kripto çevikliği şartı, PQC için ürün yazılımı güncelleme yolu, CTO ile yıllık geçiş incelemesi, CNSA 2.0 uyumu takibi." } }
];

SP.riskCats = {
  privacy: { en: "Privacy", tr: "Gizlilik" },
  cyber: { en: "Cyber", tr: "Siber" },
  insider: { en: "Insider", tr: "İç tehdit" },
  supply: { en: "Supply chain", tr: "Tedarik zinciri" },
  operational: { en: "Operational", tr: "Operasyonel" },
  crypto: { en: "Cryptography", tr: "Kriptografi" },
  defence: { en: "Defence / EFDI", tr: "Savunma / EFDI" },
  ai: { en: "AI safety", tr: "YZ güvenliği" },
  legal: { en: "Legal", tr: "Hukuk" },
  availability: { en: "Availability", tr: "Erişilebilirlik" },
  reputation: { en: "Reputation", tr: "İtibar" },
  programme: { en: "Programme", tr: "Program" }
};

SP.threats = [
  { id: "T1", asset: { en: "Camera → edge stream", tr: "Kamera → uç akışı" }, stride: "S", threat: { en: "Spoofed camera injects pre-recorded or synthetic video to mask a real incident", tr: "Sahte kamera, gerçek bir olayı gizlemek için önceden kaydedilmiş veya sentetik video enjekte eder" }, ctrl: { en: "802.1X device identity, camera certificate pinning, frame counter and timestamp monotonicity checks, anomaly alert on stream restart during an incident.", tr: "802.1X cihaz kimliği, kamera sertifika sabitleme, kare sayacı ve zaman damgası monotonluk kontrolü, olay sırasında akış yeniden başlamasında anomali alarmı." } },
  { id: "T2", asset: { en: "Telemetry channel", tr: "Telemetri kanalı" }, stride: "T", threat: { en: "On-path attacker alters trigger messages or suppresses an alert", tr: "Aradaki saldırgan tetik mesajlarını değiştirir veya alarmı bastırır" }, ctrl: { en: "mTLS 1.3 with mutual authentication, message-level signature, sequence numbers, per-message replay window, broker ACLs.", tr: "Karşılıklı kimlik doğrulamalı mTLS 1.3, mesaj düzeyinde imza, sıra numaraları, mesaj başına tekrar oynatma penceresi, broker ACL'leri." } },
  { id: "T3", asset: { en: "Event log", tr: "Olay günlüğü" }, stride: "R", threat: { en: "Operator denies having viewed a stream or having dismissed an alert", tr: "Operatör bir akışı görüntülediğini veya alarmı reddettiğini inkâr eder" }, ctrl: { en: "Signed, append-only audit log with hash chaining, WORM storage, four-eyes on live view, per-action attribution.", tr: "Hash zincirli, yalnızca eklemeli ve imzalı denetim günlüğü, WORM depolama, canlı görüntüde dört göz kuralı, eylem başına atıf." } },
  { id: "T4", asset: { en: "Event metadata", tr: "Olay üstverisi" }, stride: "I", threat: { en: "Metadata exposure allows re-identification of a person in a small park", tr: "Üstveri açığı küçük bir parkta kişinin yeniden kimliklendirilmesini sağlar" }, ctrl: { en: "Coarse geozones, time bucketing in analytics, no free text, no export at event level, k-anonymity check before publication.", tr: "Kaba coğrafi bölgeler, analitikte zaman kovalama, serbest metin yok, olay düzeyinde ihraç yok, yayın öncesi k-anonimlik kontrolü." } },
  { id: "T5", asset: { en: "Edge node", tr: "Uç düğüm" }, stride: "D", threat: { en: "Resource exhaustion or storage filling disables triage", tr: "Kaynak tükenmesi veya depolama dolması analizi devre dışı bırakır" }, ctrl: { en: "Memory-only pipeline with fixed caps, watchdog, health telemetry, disk quota alarms, rate limiting per camera, graceful degradation.", tr: "Sabit sınırlı yalnızca bellek hattı, watchdog, sağlık telemetrisi, disk kotası alarmları, kamera başına hız sınırlama, zarif bozulma." } },
  { id: "T6", asset: { en: "Edge node", tr: "Uç düğüm" }, stride: "E", threat: { en: "Local attacker with physical access boots an unsigned image and gains root", tr: "Fiziksel erişimi olan yerel saldırgan imzasız imaj başlatıp root elde eder" }, ctrl: { en: "Secure Boot, signed kernel, dm-verity, sealed debug ports, TPM attestation, tamper switch triggers lock and alert.", tr: "Secure Boot, imzalı çekirdek, dm-verity, mühürlü hata ayıklama portları, TPM kanıtlama, kurcalama anahtarı kilitlenme ve alarm üretir." } },
  { id: "T7", asset: { en: "Broker", tr: "Broker" }, stride: "E", threat: { en: "Over-permissive MQTT ACL lets a compromised node subscribe to all park topics", tr: "Aşırı izinli MQTT ACL, ele geçirilen bir düğümün tüm park konularına abone olmasını sağlar" }, ctrl: { en: "Per-node topic namespaces, default-deny ACL, client certificate per device, quarterly ACL review, broker hardening baseline.", tr: "Düğüm başına konu ad alanları, varsayılan red ACL, cihaz başına istemci sertifikası, üç aylık ACL incelemesi, broker sertleştirme tabanı." } },
  { id: "T8", asset: { en: "Triage model", tr: "Analiz modeli" }, stride: "T", threat: { en: "Adversarial patch, laser or looped video causes false negative", tr: "Karşıt yama, lazer veya döngüsel video yanlış negatife yol açar" }, ctrl: { en: "Adversarial training and test suite, multi-frame temporal consistency, glare and obstruction detection, camera health attestation, acoustic cross-check.", tr: "Karşıt eğitim ve test seti, çok kareli zamansal tutarlılık, parlama ve engellenme tespiti, kamera sağlığı beyanı, akustik çapraz kontrol." } },
  { id: "T9", asset: { en: "Model supply chain", tr: "Model tedarik zinciri" }, stride: "T", threat: { en: "Tampered model artefact or poisoned training data changes behaviour", tr: "Kurcalanmış model artefaktı veya zehirlenmiş eğitim verisi davranışı değiştirir" }, ctrl: { en: "Signed model artefacts with hash pinning, provenance for datasets, isolated training environment, evaluation gate before deployment, rollback to previous signed model.", tr: "Hash sabitlemeli imzalı model artefaktları, veri kümeleri için köken kaydı, izole eğitim ortamı, dağıtım öncesi değerlendirme kapısı, önceki imzalı modele geri dönüş." } },
  { id: "T10", asset: { en: "Key management", tr: "Anahtar yönetimi" }, stride: "I", threat: { en: "Extracted key decrypts stored metadata or forged certificates are accepted", tr: "Çıkarılan anahtar saklanan üstveriyi çözer veya sahte sertifikalar kabul edilir" }, ctrl: { en: "Non-exportable HSM keys, TPM-sealed storage keys, short-lived certificates, OCSP/CRL checks, dual control for ceremonies, revocation drill.", tr: "Dışa aktarılamayan HSM anahtarları, TPM ile mühürlenmiş depolama anahtarları, kısa ömürlü sertifikalar, OCSP/CRL kontrolleri, törenlerde çift kontrol, iptal tatbikatı." } },
  { id: "T11", asset: { en: "Update channel", tr: "Güncelleme kanalı" }, stride: "T", threat: { en: "Malicious update bundle is installed during a maintenance window", tr: "Bakım penceresinde kötü niyetli güncelleme paketi kurulur" }, ctrl: { en: "Dual-signed bundles, hash verification at the node, reproducible builds, two-person installation, change ticket with rollback plan, post-install attestation.", tr: "Çift imzalı paketler, düğümde hash doğrulama, yeniden üretilebilir derlemeler, iki kişiyle kurulum, geri dönüş planlı değişiklik kaydı, kurulum sonrası kanıtlama." } },
  { id: "T12", asset: { en: "Operator console", tr: "Operatör konsolu" }, stride: "S", threat: { en: "Credential theft via phishing leads to impersonation of a dispatcher", tr: "Oltalama ile kimlik bilgisi hırsızlığı yönlendiricinin taklit edilmesine yol açar" }, ctrl: { en: "Phishing-resistant FIDO2 MFA, device binding, impossible-travel and behaviour alerts, 15-minute session timeout, quarterly phishing simulation.", tr: "Oltalama dirençli FIDO2 MFA, cihaz bağlama, imkânsız seyahat ve davranış alarmları, 15 dakikalık oturum zaman aşımı, üç aylık oltalama simülasyonu." } },
  { id: "T13", asset: { en: "EFDI gateway", tr: "EFDI geçidi" }, stride: "I", threat: { en: "Over-broad export or mislabelled message releases sensitive information", tr: "Aşırı geniş çıktı veya yanlış etiketlenmiş mesaj hassas bilgiyi paylaşıma açar" }, ctrl: { en: "One-way diode, schema allowlist, label enforcement (STANAG 4774/4778), human release, PII canaries, quarterly audit of exports.", tr: "Tek yönlü diyot, şema beyaz listesi, etiket zorunluluğu (STANAG 4774/4778), insan onaylı çıkış, kişisel veri kanaryaları, ihraçların üç aylık denetimi." } },
  { id: "T14", asset: { en: "Municipal enclave", tr: "Belediye güvenli bölgesi" }, stride: "E", threat: { en: "Compromised municipal account pivots into the park management plane", tr: "Ele geçirilen belediye hesabı park yönetim düzlemine sıçrar" }, ctrl: { en: "Separate identity domain for park operations, no trust relationship with municipal AD, jump host with session recording, least-privilege roles, quarterly access review.", tr: "Park operasyonları için ayrı kimlik alanı, belediye AD'si ile güven ilişkisi yok, oturum kayıtlı atlama sunucusu, en az yetki rolleri, üç aylık erişim gözden geçirmesi." } },
  { id: "T15", asset: { en: "Citizen report channel", tr: "Vatandaş ihbar kanalı" }, stride: "S", threat: { en: "False or malicious reports are used to direct cameras at a person", tr: "Yanlış veya kötü niyetli ihbarlar kameraların bir kişiye yönlendirilmesi için kullanılır" }, ctrl: { en: "Rate limiting and account verification, report reason codes, operator review before any live view, abuse pattern detection, no user-controlled camera targeting.", tr: "Hız sınırlama ve hesap doğrulama, ihbar neden kodları, canlı görüntüden önce operatör incelemesi, kötüye kullanım deseni tespiti, kullanıcı kontrollü kamera hedefleme yok." } }
];
