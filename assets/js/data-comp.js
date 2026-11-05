/* SAFE-PARKS CISO Portal — compliance matrix part 1: GDPR and KVKK (6698) */
window.SP = window.SP || {};

SP.compliance = [
  /* ---------------- GDPR ---------------- */
  { id: "G1", fw: "GDPR", ref: "Art. 5(1)(c)", prio: "high",
    req: { en: "Personal data must be adequate, relevant and limited to what is necessary.", tr: "Kişisel veriler amaçla ilgili, sınırlı ve gerekli olanla ölçülü olmalıdır." },
    ctrl: { en: "60-second rolling buffer only; no archive; object-class detection without identity features; audio analysed for event class (gunshot, scream, glass break) and never transcribed or voice-matched; metadata minimised to event type, coarse zone, timestamp.", tr: "Yalnızca 60 saniyelik döngüsel tampon; arşiv yok; kimlik özniteliği olmadan nesne sınıfı tespiti; ses yalnızca olay sınıfı (silah sesi, çığlık, cam kırılması) için analiz edilir, asla metne dökülmez veya ses eşleştirmesi yapılmaz; üstveri olay tipi, kaba bölge ve zaman damgasıyla sınırlıdır." },
    ev: "ARCH-§4 · CFG-BL-v1 · DM-§2.3", owner: "CTO", status: "ready" },

  { id: "G2", fw: "GDPR", ref: "Art. 5(1)(e)", prio: "critical",
    req: { en: "Data must be kept no longer than necessary (storage limitation).", tr: "Veriler gerekli olandan daha uzun süre saklanamaz (saklama sınırlaması)." },
    ctrl: { en: "Raw frames exist only in the volatile ring buffer (≤60 s). A triggered clip is analysed for ≤30 s and erased within 5 s of triage completion, including derived frames and embedding caches. Ephemeral volume keys are destroyed (crypto-erase) and purge is logged.", tr: "Ham kareler yalnızca uçucu döngüsel tamponda bulunur (≤60 sn). Tetiklenen klip ≤30 sn analiz edilir ve analiz tamamlandıktan sonra 5 sn içinde türetilmiş kareler ve gömme önbellekleri dahil silinir. Geçici birim anahtarları yok edilir (kripto-imha) ve imha kaydı tutulur." },
    ev: "PURGE-TEST · RET-MTX · LOG-DEL", owner: "CTO", status: "partial" },

  { id: "G3", fw: "GDPR", ref: "Art. 5(1)(a), 12–14", prio: "high",
    req: { en: "Lawfulness, fairness, transparency; information must be provided in a concise, intelligible form.", tr: "Hukuka uygunluk, dürüstlük, şeffaflık; bilgi kısa, anlaşılır biçimde sunulmalıdır." },
    ctrl: { en: "Physical signage at every park entrance + QR to a layered privacy notice in the local language and English; notice states buffer duration, trigger conditions, no biometrics, no archiving, DPO contact and rights. Accessibility variants (large print, audio, child-friendly pictograms).", tr: "Her park girişinde fiziksel tabela + yerel dilde ve İngilizce katmanlı gizlilik bildirimine QR; bildirim tampon süresini, tetikleme koşullarını, biyometri yokluğunu, arşiv olmadığını, DPO iletişimini ve hakları belirtir. Erişilebilirlik varyantları (büyük baskı, sesli, çocuk dostu piktogramlar)." },
    ev: "SIGN-01 · NOTICE-v2 · A11Y-CHK", owner: "CISO", status: "partial" },

  { id: "G4", fw: "GDPR", ref: "Art. 6", prio: "high",
    req: { en: "Processing requires a lawful basis; consent is rarely appropriate for public-space safety systems.", tr: "İşleme hukuki bir dayanak gerektirir; kamusal alan güvenliği sistemlerinde rıza genellikle uygun değildir." },
    ctrl: { en: "Basis is public task / official authority (municipal safety mandate) documented per city; a documented balancing test covers any legitimate-interest processing. Consent is not used for bystanders; it is used only for optional citizen-report accounts.", tr: "Dayanak, şehir bazında belgelenen kamu görevi / resmî yetkidir (belediye güvenlik görevi); meşru menfaat içeren işlemeler için belgelenmiş denge testi yapılır. Çevredeki kişiler için rıza kullanılmaz; rıza yalnızca isteğe bağlı vatandaş ihbar hesapları için alınır." },
    ev: "LEG-BASIS-01 · LIA-01", owner: "DPO", status: "partial" },

  { id: "G5", fw: "GDPR", ref: "Art. 9", prio: "critical",
    req: { en: "Biometric data for unique identification is a special category requiring explicit consent or a narrow exemption — the project must avoid it entirely.", tr: "Benzersiz tanımlama için biyometrik veri, açık rıza veya dar bir istisna gerektiren özel nitelikli veridir — proje bundan tamamen kaçınmalıdır." },
    ctrl: { en: "Zero-biometric design: face/iris/voice/gait recognition libraries are absent from the dependency tree and blocked in CI by an allowlist; model cards declare no identity output; cameras are fixed-focus and cannot pan to identify; no facial templates are ever generated.", tr: "Sıfır biyometrik tasarım: yüz/iris/ses/yürüyüş tanıma kütüphaneleri bağımlılık ağacında yoktur ve CI'da beyaz liste ile engellenir; model kartları kimlik çıktısı olmadığını beyan eder; kameralar sabit odaklıdır ve tanımlama için döndürülemez; hiçbir yüz şablonu üretilmez." },
    ev: "DEP-DENY · CI-GATE-BIO · MC-ALL", owner: "CTO", status: "ready" },

  { id: "G6", fw: "GDPR", ref: "Art. 22", prio: "high",
    req: { en: "No solely automated decision with legal or similarly significant effects.", tr: "Hukuki veya benzeri önemli etki doğuran tamamen otomatik karar alınamaz." },
    ctrl: { en: "The engine only ranks and flags. Dispatch, park closure, intervention or any measure affecting a person requires a named operator action; the operator ID, timestamp and rationale are logged as metadata.", tr: "Motor yalnızca sıralama ve işaretleme yapar. Yönlendirme, park kapatma, müdahale veya kişiyi etkileyen her tedbir adı belirli bir operatör eylemi gerektirir; operatör kimliği, zaman damgası ve gerekçe üstveri olarak kaydedilir." },
    ev: "OPS-FLOW-§3 · AUDIT-OPS", owner: "CISO", status: "ready" },

  { id: "G7", fw: "GDPR", ref: "Art. 25", prio: "high",
    req: { en: "Data protection by design and by default; safeguards built into the processing.", tr: "Tasarımdan itibaren ve varsayılan olarak veri koruma; güvenceler işlemenin içine yerleştirilmelidir." },
    ctrl: { en: "Retention floors cannot be increased by configuration (hard-coded maximums); biometric modules absent at build level; privacy-impacting changes require a DPIA delta and CISO sign-off before merge; default operator view shows no identifiable imagery.", tr: "Saklama sınırları konfigürasyonla artırılamaz (kod içinde sabit üst sınırlar); biyometrik modüller derleme düzeyinde yoktur; gizliliği etkileyen değişiklikler birleştirme öncesi DPIA farkı ve CISO onayı gerektirir; varsayılan operatör görünümünde tanımlanabilir görüntü yoktur." },
    ev: "PRIV-ADR-01 · PR-GATE", owner: "CISO", status: "partial" },

  { id: "G8", fw: "GDPR", ref: "Art. 28", prio: "high",
    req: { en: "Written processor contracts with instructions, confidentiality, assistance and audit rights.", tr: "Talimat, gizlilik, destek ve denetim haklarını içeren yazılı işleyen sözleşmeleri." },
    ctrl: { en: "DPAs with Xena Vision (AI), Lotus Sirius (security), 3S (infrastructure) and any subcontractor; sub-processor list and change notification; no processor may transfer data outside the EU/EEA or Türkiye; audit rights include on-site inspection of the park node.", tr: "Xena Vision (YZ), Lotus Sirius (güvenlik), 3S (altyapı) ve tüm alt yüklenicilerle DPA; alt işleyen listesi ve değişiklik bildirimi; hiçbir işleyen veriyi AB/AEA veya Türkiye dışına aktaramaz; denetim hakları park düğümünde yerinde incelemeyi kapsar." },
    ev: "DPA-REG · SUBPROC-LIST", owner: "DPO", status: "gap" },

  { id: "G9", fw: "GDPR", ref: "Art. 30", prio: "medium",
    req: { en: "Records of processing activities must be maintained and available to the authority.", tr: "İşleme faaliyetleri kaydı tutulmalı ve otoriteye sunulabilmelidir." },
    ctrl: { en: "ROPA per municipality generated from this portal (processing, purpose, categories, recipients, retention, TOMs reference, transfers = none); CISO supplies the technical fields, DPO signs.", tr: "Bu portaldan üretilen belediye bazlı ROPA (işleme, amaç, veri kategorileri, alıcılar, saklama, TOM referansı, aktarım = yok); teknik alanları CISO sağlar, DPO imzalar." },
    ev: "ROPA-07 · DPO-SIGN", owner: "DPO", status: "partial" },

  { id: "G10", fw: "GDPR", ref: "Art. 32", prio: "critical",
    req: { en: "Appropriate technical and organisational measures ensuring confidentiality, integrity, availability and resilience.", tr: "Gizlilik, bütünlük, erişilebilirlik ve dayanıklılığı sağlayan uygun teknik ve idari tedbirler." },
    ctrl: { en: "mTLS 1.3 with 90-day certificates, AES-256-GCM at rest and in transit, HSM-held keys, SSO + phishing-resistant MFA, deny-all egress, role-based least privilege, WORM audit logs, quarterly restore and purge tests, annual penetration test, air-gapped operation with 72-hour autonomy.", tr: "90 günlük sertifikalarla mTLS 1.3, bekleyen ve akan veride AES-256-GCM, HSM'de anahtarlar, SSO + oltalama dirençli MFA, tüm çıkışlar kapalı, role dayalı en az yetki, WORM denetim kayıtları, üç aylık geri yükleme ve imha testleri, yıllık sızma testi, 72 saat otonom çalışan izole mimari." },
    ev: "TOMs-01…20 · PENTEST-24", owner: "CISO", status: "partial" },

  { id: "G11", fw: "GDPR", ref: "Art. 33–34", prio: "critical",
    req: { en: "Notify the supervisory authority within 72 hours of becoming aware of a personal data breach; inform data subjects where high risk.", tr: "Kişisel veri ihlalini öğrenildikten sonra 72 saat içinde denetim otoritesine bildirmek; yüksek risk varsa ilgili kişileri bilgilendirmek." },
    ctrl: { en: "Detection via SOC rules on the metadata stream; incident commander runs a 72-hour clock with pre-drafted authority and subject templates; breach register maintained; decision on notifiability taken jointly by CISO and DPO with a documented rationale even when no notification is made.", tr: "Üstveri akışında SOC kurallarıyla tespit; olay komutanı önceden hazırlanmış otorite ve ilgili kişi şablonlarıyla 72 saatlik saat işletir; ihlal kaydı tutulur; bildirim gerekliliği CISO ve DPO tarafından ortaklaşa, bildirim yapılmasa dahi gerekçesi belgelenerek kararlaştırılır." },
    ev: "IR-PLAN-§5 · TPL-33 · BR-REG", owner: "CISO", status: "partial" },

  { id: "G12", fw: "GDPR", ref: "Art. 35–36", prio: "critical",
    req: { en: "DPIA required for systematic monitoring of a publicly accessible area on a large scale; prior consultation if residual risk remains high.", tr: "Kamunun erişimine açık alanın sistematik ve geniş ölçekli izlenmesinde DPIA zorunludur; artık risk yüksekse ön danışma gerekir." },
    ctrl: { en: "A DPIA per pilot city following EDPB criteria, with the CISO technical annex (data flow, purge proof, threat model, adversarial robustness), EPAB opinion and DPO sign-off. No go-live without a signed DPIA; prior consultation triggered automatically if residual risk is high.", tr: "EDPB kriterlerine göre pilot şehir başına DPIA; CISO teknik eki (veri akışı, imha kanıtı, tehdit modeli, karşıt dayanıklılık) ile birlikte EPAB görüşü ve DPO onayı. İmzalı DPIA olmadan canlıya geçiş yok; artık risk yüksekse ön danışma otomatik tetiklenir." },
    ev: "DPIA-TPL · DPIA-01…07", owner: "DPO", status: "partial" },

  { id: "G13", fw: "GDPR", ref: "Art. 44–49", prio: "critical",
    req: { en: "Transfers outside the EU/EEA require an adequacy decision or appropriate safeguards.", tr: "AB/AEA dışına aktarımlar yeterlilik kararı veya uygun güvenceler gerektirir." },
    ctrl: { en: "Architectural prohibition: all inference, storage and logging are on-premise; no cloud dependency; vendor remote support disabled by default and, when enabled, time-boxed, escorted and EU-based; no personal data crosses the pilot-country boundary; support bundles are generated locally and sanitised.", tr: "Mimari yasak: tüm çıkarım, saklama ve günlükleme yerinde yapılır; bulut bağımlılığı yok; tedarikçi uzaktan desteği varsayılan olarak kapalı, açıldığında süreli, refakatli ve AB merkezli; pilot ülke sınırını kişisel veri geçmez; destek paketleri yerelde üretilip arındırılır." },
    ev: "ARCH-§7 · FW-EGRESS · SUP-01", owner: "CISO", status: "ready" },

  { id: "G14", fw: "GDPR", ref: "Art. 37", prio: "medium",
    req: { en: "A DPO must be designated where core activities involve large-scale systematic monitoring.", tr: "Temel faaliyetler geniş ölçekli sistematik izleme içeriyorsa DPO atanmalıdır." },
    ctrl: { en: "Each municipality designates a DPO with published contact; the CISO provides technical briefings and evidence but never instructs the DPO; DPO independence and resourcing confirmed in writing.", tr: "Her belediye iletişimi yayımlanmış bir DPO atar; CISO teknik brifing ve kanıt sağlar ancak DPO'ya talimat vermez; DPO bağımsızlığı ve kaynakları yazılı olarak teyit edilir." },
    ev: "DPO-LIST · ORG-CHART", owner: "Municipalities", status: "partial" },

  /* ---------------- KVKK 6698 ---------------- */
  { id: "K1", fw: "KVKK", ref: "m.4", prio: "high",
    req: { en: "Processing must comply with law and honesty, be purpose-limited, proportionate, accurate and retained only as long as required.", tr: "İşleme hukuka ve dürüstlük kurallarına uygun, belirli amaçla sınırlı, ölçülü, doğru ve gerekli süre kadar saklanan olmalıdır." },
    ctrl: { en: "Same technical enforcement as GDPR Art. 5: 60 s buffer, 30 s analysis, no archive, purpose-bound trigger catalogue, documented retention matrix per municipality.", tr: "GDPR Md. 5 ile aynı teknik uygulama: 60 sn tampon, 30 sn analiz, arşiv yok, amaca bağlı tetikleyici kataloğu, belediye bazında belgelenmiş saklama matrisi." },
    ev: "RET-MTX · TRIG-CAT", owner: "CISO", status: "partial" },

  { id: "K2", fw: "KVKK", ref: "m.6", prio: "critical",
    req: { en: "Special categories of personal data (incl. biometrics for identification) may only be processed on limited legal grounds.", tr: "Özel nitelikli kişisel veriler (tanımlama amaçlı biyometrik veriler dahil) yalnızca sınırlı hukuki sebeplerle işlenebilir." },
    ctrl: { en: "No special-category data is processed: no biometric templates, no health data, no union/religion inference; model output restricted to object classes and ambient event types.", tr: "Özel nitelikli veri işlenmez: biyometrik şablon yok, sağlık verisi yok, sendika/din çıkarımı yok; model çıktısı nesne sınıfları ve ortam olay tipleriyle sınırlıdır." },
    ev: "CI-GATE-BIO · MC-ALL", owner: "CTO", status: "ready" },

  { id: "K3", fw: "KVKK", ref: "m.9", prio: "critical",
    req: { en: "Transfer of personal data abroad requires an explicit legal mechanism; the project must not depend on one.", tr: "Kişisel verilerin yurt dışına aktarımı açık bir hukuki mekanizma gerektirir; proje buna bağımlı olmamalıdır." },
    ctrl: { en: "No cross-border flow exists by design: inference, storage, logging and support tooling stay in the municipality; the EFDI export carries only aggregate, non-personal telemetry; suppliers may not access park data from outside the country, and remote access is disabled.", tr: "Tasarım gereği sınır ötesi akış yoktur: çıkarım, saklama, günlükleme ve destek araçları belediyede kalır; EFDI çıkışı yalnızca kişisel olmayan toplu telemetri taşır; tedarikçiler park verisine ülke dışından erişemez, uzaktan erişim kapalıdır." },
    ev: "ARCH-§7 · EFDI-SPEC-§6", owner: "CISO", status: "ready" },

  { id: "K4", fw: "KVKK", ref: "m.12", prio: "critical",
    req: { en: "The data controller must take all necessary technical and organisational measures and supervise compliance.", tr: "Veri sorumlusu gerekli tüm teknik ve idari tedbirleri almak ve uyumu denetlemek zorundadır." },
    ctrl: { en: "Encryption, hashing of identifiers, least privilege, MFA, log integrity, periodic audits, staff confidentiality undertakings, pen tests and verification of supplier compliance; the CISO evidence pack feeds the controller's audit file.", tr: "Şifreleme, tanımlayıcıların hash'lenmesi, en az yetki, MFA, günlük bütünlüğü, periyodik denetim, personel gizlilik taahhütleri, sızma testleri ve tedarikçi uyum doğrulaması; CISO kanıt paketi veri sorumlusunun denetim dosyasını besler." },
    ev: "TOMs-01…20 · AUDIT-FILE", owner: "CISO", status: "partial" },

  { id: "K5", fw: "KVKK", ref: "m.12/5 · Kurul 2019/10", prio: "critical",
    req: { en: "Breaches must be notified to the Board as soon as possible (72-hour expectation) and to affected persons without delay.", tr: "İhlaller Kurul'a en kısa sürede (72 saat beklentisi) ve ilgili kişilere gecikmeksizin bildirilmelidir." },
    ctrl: { en: "Same incident pipeline as GDPR, with a KVKK notification template, VERBİS-ready breach fields, and a Turkish-language subject notice; drill twice a year with each pilot municipality.", tr: "GDPR ile aynı olay hattı; KVKK bildirim şablonu, VERBİS'e uygun ihlal alanları ve Türkçe ilgili kişi bildirimi; her pilot belediye ile yılda iki tatbikat." },
    ev: "IR-PLAN-§6 · TPL-KVKK · DRILL-02", owner: "CISO", status: "partial" },

  { id: "K6", fw: "KVKK", ref: "m.13", prio: "medium",
    req: { en: "Data subjects may request information, access, correction, deletion and object; requests answered within 30 days.", tr: "İlgili kişiler bilgi, erişim, düzeltme, silme ve itiraz talep edebilir; talepler 30 gün içinde yanıtlanır." },
    ctrl: { en: "Single intake channel per municipality (web form + phone + posta); because no persistent personal data is retained, responses state the technical fact of non-retention with purge evidence; the CISO provides the technical statement template.", tr: "Belediye başına tek başvuru kanalı (web formu + telefon + posta); kalıcı kişisel veri tutulmadığından yanıtlar, imha kanıtıyla birlikte veri tutulmadığı teknik olgusunu belirtir; CISO teknik beyan şablonunu sağlar." },
    ev: "DSR-SOP · TPL-DSR", owner: "DPO", status: "partial" },

  { id: "K7", fw: "KVKK", ref: "m.16 · VERBİS", prio: "medium",
    req: { en: "Data controllers established in Türkiye must register with the Data Controllers' Registry where required.", tr: "Türkiye'de yerleşik veri sorumluları, gerekli olduğu hâlde Veri Sorumluları Sicili'ne kaydolmalıdır." },
    ctrl: { en: "VERBİS registration confirmed for Turkish pilot municipalities; the CISO supplies the processing description, retention and security sections; exemptions re-checked annually.", tr: "Türk pilot belediyelerinin VERBİS kaydı teyit edilir; CISO işleme açıklaması, saklama ve güvenlik bölümlerini sağlar; muafiyetler yıllık olarak yeniden kontrol edilir." },
    ev: "VERBIS-REG · ANN-SEC", owner: "Municipalities", status: "gap" },

  { id: "K8", fw: "KVKK", ref: "m.18", prio: "medium",
    req: { en: "Administrative fines apply for failure to comply with data security obligations (sanctions awareness).", tr: "Veri güvenliği yükümlülüklerine aykırılık hâlinde idari para cezası uygulanır (yaptırım farkındalığı)." },
    ctrl: { en: "Board-level reporting of KVKK exposure; controller-facing briefing at each pilot kick-off; contractual allocation of fines between partners reviewed by legal.", tr: "KVKK maruziyetinin yönetim kuruluna raporlanması; her pilot başlangıcında veri sorumlusuna brifing; cezaların ortaklar arasında sözleşmesel paylaşımı hukuk tarafından incelenir." },
    ev: "BRD-DECK · KICK-BRF", owner: "CEO", status: "partial" }
];
