/* SAFE-PARKS CISO Portal — compliance matrix part 2: NIS2, EU AI Act, ISO/IEC 27001, CRA, NATO/defence */
window.SP = window.SP || {};

SP.compliance2 = [
  /* ---------------- NIS2 ---------------- */
  { id: "N1", fw: "NIS2", ref: "Art. 21(2)(a), Art. 20", prio: "high",
    req: { en: "Risk-analysis and information security policies, approved and overseen by management bodies.", tr: "Yönetim organlarınca onaylanan ve gözetilen risk analizi ve bilgi güvenliği politikaları." },
    ctrl: { en: "ISMS policy set (9 documents in this portal), annual management review with CEO sign-off, security objectives cascaded into WP3 task plans; management training record kept for Art. 20(2).", tr: "BGYS politika seti (bu portalda 9 doküman), CEO imzalı yıllık yönetim gözden geçirmesi, güvenlik hedeflerinin WP3 görev planlarına yayılması; Md. 20(2) için yönetim eğitimi kaydı." },
    ev: "POL-01…09 · MR-2026", owner: "CEO", status: "partial" },

  { id: "N2", fw: "NIS2", ref: "Art. 21(2)(d)", prio: "high",
    req: { en: "Supply chain security: assess and manage risks from direct suppliers and service providers.", tr: "Tedarik zinciri güvenliği: doğrudan tedarikçi ve hizmet sağlayıcılardan kaynaklanan riskleri değerlendirmek ve yönetmek." },
    ctrl: { en: "Tier-1 supplier register with security questionnaire, SBOM requirement, secure-boot and signed-firmware attestation for cameras/NPUs, contractual right to audit, country-of-origin review for hardware, 90-day vulnerability disclosure obligation.", tr: "Güvenlik anketi, SBOM şartı, kamera/NPU için güvenli önyükleme ve imzalı ürün yazılımı beyanı, sözleşmesel denetim hakkı, donanım için menşe ülke incelemesi ve 90 günlük güvenlik açığı bildirim yükümlülüğü içeren 1. seviye tedarikçi kaydı." },
    ev: "SUP-REG · SBOM-POL", owner: "CISO", status: "gap" },

  { id: "N3", fw: "NIS2", ref: "Art. 21(2)(e)", prio: "high",
    req: { en: "Secure development, vulnerability handling and disclosure.", tr: "Güvenli geliştirme, güvenlik açığı yönetimi ve bildirimi." },
    ctrl: { en: "Secure SDLC gates (threat model, SAST/DAST/SCA, secret scanning, signed artefacts), CVD policy with 90-day coordinated disclosure, internal vulnerability backlog with SLA 7/30/90 days by severity.", tr: "Güvenli SDLC kapıları (tehdit modeli, SAST/DAST/SCA, gizli bilgi taraması, imzalı artefaktlar), 90 günlük koordineli açıklama politikası, şiddete göre 7/30/90 gün SLA'lı iç güvenlik açığı birikimi." },
    ev: "SDLC-GATE · CVD-POL", owner: "CTO", status: "partial" },

  { id: "N4", fw: "NIS2", ref: "Art. 21(2)(f)", prio: "medium",
    req: { en: "Policies and procedures to assess the effectiveness of security measures.", tr: "Güvenlik tedbirlerinin etkinliğini değerlendirmeye yönelik politika ve prosedürler." },
    ctrl: { en: "Quarterly control testing, annual external penetration test, ISO 27001 internal audit cycle, KPI dashboard reviewed monthly; findings tracked to closure with retest evidence.", tr: "Üç aylık kontrol testleri, yıllık harici sızma testi, ISO 27001 iç denetim döngüsü, aylık incelenen KPI panosu; bulgular tekrar test kanıtıyla kapatılır." },
    ev: "KPI-BOARD · IA-PLAN", owner: "CISO", status: "partial" },

  { id: "N5", fw: "NIS2", ref: "Art. 21(2)(g),(i),(j)", prio: "high",
    req: { en: "Cyber hygiene, training, HR security, access control, asset management, MFA and secure communications.", tr: "Siber hijyen, eğitim, insan kaynakları güvenliği, erişim kontrolü, varlık yönetimi, MFA ve güvenli iletişim." },
    ctrl: { en: "Asset inventory tied to the park node serials; joiner/mover/leaver process for consortium staff; phishing-resistant MFA for all administrative access; encrypted voice/data channels for incident bridge; quarterly awareness campaign.", tr: "Park düğümü seri numaralarına bağlı varlık envanteri; konsorsiyum personeli için işe alım/rol değişimi/ayrılık süreci; tüm yönetici erişimlerinde oltalama dirençli MFA; olay köprüsü için şifreli ses/veri kanalları; üç aylık farkındalık kampanyası." },
    ev: "ASSET-INV · IAM-POL · TRN-PLAN", owner: "CISO", status: "partial" },

  { id: "N6", fw: "NIS2", ref: "Art. 21(2)(h)", prio: "high",
    req: { en: "Use of cryptography and, where appropriate, encryption.", tr: "Kriptografi ve uygun olduğunda şifreleme kullanımı." },
    ctrl: { en: "Crypto policy with approved algorithms (AES-256-GCM, SHA-256/SHA-3, ECDSA P-384, hybrid X25519+ML-KEM), key lifecycle in HSM, 90-day certificate rotation, no deprecated TLS, crypto inventory with owner and review date.", tr: "Onaylı algoritmaları içeren kripto politikası (AES-256-GCM, SHA-256/SHA-3, ECDSA P-384, hibrit X25519+ML-KEM), HSM'de anahtar yaşam döngüsü, 90 günlük sertifika rotasyonu, kullanımdan kaldırılmış TLS yok, sahibi ve gözden geçirme tarihi olan kripto envanteri." },
    ev: "CRYPTO-POL · KEY-INV", owner: "CISO", status: "partial" },

  { id: "N7", fw: "NIS2", ref: "Art. 23", prio: "critical",
    req: { en: "Incident reporting: early warning within 24 h, incident notification within 72 h, final report within one month.", tr: "Olay bildirimi: 24 saat içinde erken uyarı, 72 saat içinde olay bildirimi, bir ay içinde nihai rapor." },
    ctrl: { en: "Two-track notification matrix (GDPR/KVKK + NIS2) pre-mapped in the IR plan; CSIRT and competent-authority contacts stored offline; 24 h early warning template requires only known facts, no speculation; final report template with root cause and cross-border impact.", tr: "IR planında önceden eşlenmiş iki hatlı bildirim matrisi (GDPR/KVKK + NIS2); CSIRT ve yetkili otorite irtibatları çevrimdışı saklanır; 24 saatlik erken uyarı şablonu yalnızca bilinen olguları gerektirir, tahmin içermez; kök neden ve sınır ötesi etkiyi içeren nihai rapor şablonu." },
    ev: "IR-PLAN-§6 · TPL-NIS2", owner: "CISO", status: "partial" },

  /* ---------------- EU AI Act ---------------- */
  { id: "A1", fw: "AI Act", ref: "Art. 5(1)(h)", prio: "critical",
    req: { en: "Real-time remote biometric identification in publicly accessible spaces is prohibited for law enforcement and must not be introduced by design.", tr: "Kamunun erişimine açık alanlarda gerçek zamanlı uzaktan biyometrik tanımlama yasaktır ve tasarımla da sokulmamalıdır." },
    ctrl: { en: "Documented non-use: no biometric templates, no 1:1 or 1:N matching, no emotion or gait recognition; capability denylist enforced in CI and in procurement contracts; independent verification in each pentest scope.", tr: "Belgelenmiş kullanılmama: biyometrik şablon yok, 1:1 veya 1:N eşleştirme yok, duygu veya yürüyüş tanıma yok; yetenek kara listesi CI'da ve satın alma sözleşmelerinde uygulanır; her sızma testi kapsamında bağımsız doğrulama." },
    ev: "BIO-DECL · CI-GATE-BIO", owner: "CISO", status: "ready" },

  { id: "A2", fw: "AI Act", ref: "Art. 6 · Annex III(2)", prio: "critical",
    req: { en: "AI used as a safety component in the management and operation of critical infrastructure is high-risk.", tr: "Kritik altyapının yönetimi ve işletiminde güvenlik bileşeni olarak kullanılan YZ yüksek risklidir." },
    ctrl: { en: "Classification memo concludes high-risk (safety component, public space). The project therefore applies the Chapter III obligations voluntarily from pilot start, not waiting for the statutory date; classification reviewed if the intended purpose changes. ⚠ Confirm the final high-risk timeline: a pending omnibus proposal may defer Annex III obligations — verify before each conformity milestone.", tr: "Sınıflandırma notu yüksek risk sonucuna varır (güvenlik bileşeni, kamusal alan). Bu nedenle proje, yasal tarihi beklemeden Bölüm III yükümlülüklerini pilot başlangıcından itibaren gönüllü uygular; amaç değişirse sınıflandırma yeniden değerlendirilir. ⚠ Nihai yüksek risk takvimini doğrula: bekleyen omnibus önerisi Ek III yükümlülüklerini erteleyebilir — her uygunluk kilometre taşından önce teyit et." },
    ev: "AI-CLASS-01", owner: "CISO", status: "partial" },

  { id: "A3", fw: "AI Act", ref: "Art. 9", prio: "high",
    req: { en: "A risk management system must run continuously across the AI lifecycle.", tr: "Yapay zeka yaşam döngüsü boyunca sürekli işleyen bir risk yönetim sistemi bulunmalıdır." },
    ctrl: { en: "AI risk register integrated into the project risk register with model-level entries (false negative on weapon detection, false positive flood, drift, data poisoning); reviewed at every model release; residual risks documented in the instructions for use.", tr: "Model düzeyinde kayıtlar (silah tespitinde yanlış negatif, yanlış pozitif seli, kayma, veri zehirleme) içeren ve proje risk kaydına entegre YZ risk kaydı; her model sürümünde gözden geçirilir; artık riskler kullanım talimatlarında belgelenir." },
    ev: "AI-RISK-REG · MC-REL", owner: "CTO", status: "partial" },

  { id: "A4", fw: "AI Act", ref: "Art. 10", prio: "high",
    req: { en: "Data governance for training, validation and testing datasets: relevance, representativeness, bias examination.", tr: "Eğitim, doğrulama ve test veri kümeleri için veri yönetişimi: ilgililik, temsil gücü, yanlılık incelemesi." },
    ctrl: { en: "Training only on licensed or synthetic datasets and anonymised pilot recordings with documented provenance; no biometric labels; representativeness analysis across age, gender presentation, mobility aids, lighting and season; bias test report per release.", tr: "Eğitim yalnızca lisanslı veya sentetik veri kümeleri ile kökeni belgelenmiş anonimleştirilmiş pilot kayıtlarla; biyometrik etiket yok; yaş, cinsiyet görünümü, hareket yardımcıları, aydınlatma ve mevsim bazında temsil analizi; sürüm başına yanlılık test raporu." },
    ev: "DG-PLAN · BIAS-RPT", owner: "CTO", status: "gap" },

  { id: "A5", fw: "AI Act", ref: "Art. 12, 19", prio: "high",
    req: { en: "Automatic logging over the lifetime of the system, with retention appropriate to the intended purpose and applicable law.", tr: "Sistemin ömrü boyunca, amaca ve yürürlükteki hukuka uygun saklama süresiyle otomatik günlük kaydı." },
    ctrl: { en: "Logs capture model version, input hash, confidence, decision, operator action and purge confirmation — never frames or biometric features. Retention: 12 months WORM for security logs, 30 days for triage events, reconciled with GDPR storage limitation in the DPIA.", tr: "Günlükler model sürümü, girdi hash'i, güven skoru, karar, operatör eylemi ve imha teyidini kaydeder — asla kare veya biyometrik öznitelik kaydetmez. Saklama: güvenlik günlükleri 12 ay WORM, analiz olayları 30 gün; DPIA'da GDPR saklama sınırlamasıyla uzlaştırılır." },
    ev: "LOG-SCHEMA · RET-MTX", owner: "CISO", status: "partial" },

  { id: "A6", fw: "AI Act", ref: "Art. 13–14", prio: "high",
    req: { en: "Transparency and instructions for use; effective human oversight, including the ability to intervene or stop the system.", tr: "Şeffaflık ve kullanım talimatları; sisteme müdahale veya durdurma imkânı dahil etkili insan gözetimi." },
    ctrl: { en: "Operator UI shows confidence, alternatives and 'why flagged'; hard stop button per node; two-person rule for dispatch of armed/emergency response; instructions for use in EN + local language with explicit limitations (crowds, occlusion, night, children).", tr: "Operatör arayüzü güven skorunu, alternatifleri ve 'neden işaretlendi' bilgisini gösterir; düğüm başına acil durdurma düğmesi; acil müdahale yönlendirmesinde iki kişi kuralı; EN + yerel dilde, açık sınırlamalarla (kalabalık, örtülme, gece, çocuklar) kullanım talimatları." },
    ev: "UX-OVERSIGHT · IFU-v1", owner: "CTO", status: "partial" },

  { id: "A7", fw: "AI Act", ref: "Art. 15", prio: "high",
    req: { en: "Appropriate levels of accuracy, robustness and cybersecurity, including resilience to adversarial manipulation.", tr: "Uygun doğruluk, dayanıklılık ve siber güvenlik; karşıt manipülasyona dayanıklılık dahil." },
    ctrl: { en: "Adversarial testing per release (patch attacks, glare/laser, looped video injection, label poisoning), signed model artefacts with hash pinning, input provenance checks (camera attestation), fallback to acoustic-only mode on anomaly.", tr: "Sürüm başına karşıt testler (yama saldırıları, parlama/lazer, döngüsel video enjeksiyonu, etiket zehirleme), hash sabitlemeli imzalı model artefaktları, girdi köken kontrolü (kamera beyanı), anomali durumunda yalnızca akustik moda geri dönüş." },
    ev: "ADV-RPT · MODEL-SIGN", owner: "CTO", status: "gap" },

  { id: "A8", fw: "AI Act", ref: "Art. 26, 43, 47, 49", prio: "medium",
    req: { en: "Deployer obligations, conformity assessment, CE marking and EU declaration of conformity for high-risk systems.", tr: "Yüksek riskli sistemler için uygulayıcı yükümlülükleri, uygunluk değerlendirmesi, CE işareti ve AB uygunluk beyanı." },
    ctrl: { en: "Provider (Xena Vision) owns technical documentation and conformity; municipalities as deployers assign trained operators, monitor logs, report serious incidents within 15 days and keep the declaration; CISO verifies the evidence pack at each pilot wave.", tr: "Teknik dokümantasyon ve uygunluk sağlayıcıya (Xena Vision) aittir; uygulayıcı olarak belediyeler eğitimli operatör atar, günlükleri izler, ciddi olayları 15 gün içinde bildirir ve beyanı saklar; CISO her pilot dalgasında kanıt paketini doğrular." },
    ev: "AI-DOC-PACK · DEPL-CHK", owner: "Coordinator", status: "gap" },

  /* ---------------- ISO/IEC 27001:2022 ---------------- */
  { id: "I1", fw: "ISO 27001", ref: "A.5.7", prio: "medium",
    req: { en: "Threat intelligence relevant to the organisation shall be collected and analysed.", tr: "Kuruluşla ilgili tehdit istihbaratı toplanmalı ve analiz edilmelidir." },
    ctrl: { en: "Monthly review of ICS/OT and physical-security advisories, ENISA threat landscape, vendor PSIRT feeds; indicators mapped to park-node detection rules; a threat-intel log is part of the monthly report.", tr: "ICS/OT ve fiziksel güvenlik bildirimlerinin, ENISA tehdit manzarasının ve tedarikçi PSIRT akışlarının aylık incelenmesi; göstergeler park düğümü tespit kurallarına eşlenir; tehdit istihbaratı kaydı aylık raporun parçasıdır." },
    ev: "TI-LOG · MR-SEC", owner: "CISO", status: "partial" },

  { id: "I2", fw: "ISO 27001", ref: "A.5.19–5.22", prio: "high",
    req: { en: "Supplier relationships, ICT supply chain and cloud service security.", tr: "Tedarikçi ilişkileri, bilişim tedarik zinciri ve bulut hizmeti güvenliği." },
    ctrl: { en: "Supplier security policy, pre-contract assessment, security requirements in every PO, annual reassessment, no cloud processing of park data (cloud use limited to non-personal project collaboration).", tr: "Tedarikçi güvenlik politikası, sözleşme öncesi değerlendirme, her satın alma siparişinde güvenlik şartları, yıllık yeniden değerlendirme, park verisinin bulutta işlenmemesi (bulut yalnızca kişisel olmayan proje işbirliği için)." },
    ev: "SUP-POL · SUP-REG", owner: "CISO", status: "gap" },

  { id: "I3", fw: "ISO 27001", ref: "A.5.29–5.30, A.8.13–8.14", prio: "high",
    req: { en: "ICT readiness for business continuity, backup and redundancy.", tr: "İş sürekliliği için bilişim hazırlığı, yedekleme ve yedeklilik." },
    ctrl: { en: "72-hour autonomous operation (local power, local time source, no WAN dependency); configuration backups encrypted and stored offline; yearly full restore test; degraded mode documented for each park node.", tr: "72 saat otonom çalışma (yerel güç, yerel zaman kaynağı, WAN bağımlılığı yok); konfigürasyon yedekleri şifreli ve çevrimdışı; yılda bir tam geri yükleme testi; her park düğümü için azaltılmış mod belgelenir." },
    ev: "BCP-01 · RESTORE-TEST", owner: "CTO", status: "partial" },

  { id: "I4", fw: "ISO 27001", ref: "A.8.8–8.9", prio: "high",
    req: { en: "Management of technical vulnerabilities and secure configuration.", tr: "Teknik güvenlik açıklarının ve güvenli yapılandırmanın yönetimi." },
    ctrl: { en: "CIS Level 2 baseline with hashed build manifest, monthly authenticated vulnerability scan, 7/30/90-day remediation SLA, offline patch packages signed and dual-controlled, configuration drift detection.", tr: "Hash'lenmiş derleme manifestosu ile CIS Seviye 2 tabanı, aylık kimlik doğrulamalı güvenlik açığı taraması, 7/30/90 gün iyileştirme SLA'sı, imzalı ve çift kontrollü çevrimdışı yama paketleri, konfigürasyon kayması tespiti." },
    ev: "HARD-BL · VULN-SLA", owner: "CTO", status: "partial" },

  { id: "I5", fw: "ISO 27001", ref: "A.8.15–8.16", prio: "high",
    req: { en: "Logging, monitoring and clock synchronisation.", tr: "Günlükleme, izleme ve saat senkronizasyonu." },
    ctrl: { en: "Central collector in the municipal enclave, NTP from authenticated local source, integrity-protected logs, alerting on purge failure, camera tamper, mTLS failure and config change; no payload logging.", tr: "Belediye güvenli bölgesinde merkezi toplayıcı, kimlik doğrulamalı yerel kaynaktan NTP, bütünlük korumalı günlükler; imha hatası, kamera kurcalama, mTLS hatası ve konfigürasyon değişikliğinde alarm; yük (payload) günlüklemesi yok." },
    ev: "LOG-ARCH · ALERT-CAT", owner: "CISO", status: "partial" },

  { id: "I6", fw: "ISO 27001", ref: "A.8.10, A.8.11, A.8.24", prio: "high",
    req: { en: "Information deletion, data masking and use of cryptography.", tr: "Bilgi silme, veri maskeleme ve kriptografi kullanımı." },
    ctrl: { en: "Crypto-erase of ephemeral volumes, masking of operator identifiers in analytics exports, documented key management procedure with separation of duties and HSM-backed root of trust.", tr: "Geçici birimlerin kripto-imhası, analitik çıktılarında operatör tanımlayıcılarının maskelenmesi, görevler ayrılığı ve HSM destekli güven kökü içeren belgelenmiş anahtar yönetimi prosedürü." },
    ev: "CRYPTO-POL · DEL-PROC", owner: "CTO", status: "partial" },

  { id: "I7", fw: "ISO 27001", ref: "A.7.1–7.4, A.7.9", prio: "medium",
    req: { en: "Physical and environmental security, including equipment siting and off-premises assets.", tr: "Fiziksel ve çevresel güvenlik; ekipman yerleşimi ve tesis dışı varlıklar dahil." },
    ctrl: { en: "Locked, ventilated cabinets with tamper switches and seals; IP66 rating; key custody with two-person access; asset register per cabinet; camera field-of-view survey to exclude private property and windows.", tr: "Kurcalama anahtarı ve mühürlü kilitli, havalandırmalı kabinler; IP66 sınıfı; iki kişi erişimli anahtar zimmeti; kabin başına varlık kaydı; özel mülk ve pencereleri dışarıda bırakan kamera görüş alanı etüdü." },
    ev: "PHYS-STD · FOV-SURVEY", owner: "Municipalities", status: "partial" },

  { id: "I8", fw: "ISO 27001", ref: "A.5.24–5.28, A.6.3", prio: "high",
    req: { en: "Incident management and security awareness training.", tr: "Olay yönetimi ve güvenlik farkındalığı eğitimi." },
    ctrl: { en: "Documented incident process with severity matrix, on-call rotation, lessons-learned register; role-based training for engineers, operators, management; competence records retained.", tr: "Şiddet matrisi, nöbet rotasyonu ve ders kaydı içeren belgelenmiş olay süreci; mühendisler, operatörler ve yönetim için role dayalı eğitim; yetkinlik kayıtları saklanır." },
    ev: "IR-PLAN · TRN-REC", owner: "CISO", status: "partial" },

  /* ---------------- CRA ---------------- */
  { id: "C1", fw: "CRA", ref: "Art. 13–14", prio: "medium",
    req: { en: "Manufacturers of products with digital elements must handle vulnerabilities and report actively exploited ones.", tr: "Dijital unsurlar içeren ürünlerin üreticileri güvenlik açıklarını yönetmeli ve aktif istismar edilenleri bildirmelidir." },
    ctrl: { en: "Applicability assessment: evaluate whether the park software is placed on the market as a product (vs. research prototype). If in scope: SBOM, coordinated disclosure, 24-hour exploited-vulnerability reporting to ENISA/CSIRT from 11 September 2026, security update support period defined.", tr: "Uygulanabilirlik değerlendirmesi: park yazılımının ürün olarak piyasaya arz edilip edilmediğini (araştırma prototipi yerine) değerlendir. Kapsamda ise: SBOM, koordineli açıklama, 11 Eylül 2026'dan itibaren ENISA/CSIRT'ye 24 saatlik istismar bildirimi, güvenlik güncellemesi destek süresi tanımı." },
    ev: "CRA-ASSESS", owner: "CISO", status: "gap" },

  /* ---------------- NATO / defence ---------------- */
  { id: "D1", fw: "NATO", ref: "STANAG 4774 / 4778", prio: "high",
    req: { en: "Confidentiality metadata labelling and binding must accompany exchanged information.", tr: "Değiş tokuş edilen bilgiye gizlilik üstverisi etiketleme ve bağlama eşlik etmelidir." },
    ctrl: { en: "EFDI connector emits XML with 4774 confidentiality labels and 4778 binding, signed at export; unlabelled payloads are rejected by the gateway; label policy table approved by the national classification authority. ⚠ Confirm required classification scheme with the defence counterpart.", tr: "EFDI bağlayıcısı 4774 gizlilik etiketleri ve 4778 bağlama içeren, çıkışta imzalanan XML üretir; etiketsiz yükler geçit tarafından reddedilir; etiket politikası tablosu ulusal sınıflandırma makamınca onaylanır. ⚠ Gerekli sınıflandırma şemasını savunma muhatabıyla doğrula." },
    ev: "EFDI-SPEC-§4 · LBL-TBL", owner: "CTO", status: "gap" },

  { id: "D2", fw: "NATO", ref: "Cross-domain", prio: "critical",
    req: { en: "Crisis-time sharing with defence and civil protection must not create a path for personal data or malware to cross domains.", tr: "Kriz anında savunma ve sivil koruma ile paylaşım, kişisel veri veya zararlı yazılımın alanlar arası geçiş yolunu oluşturmamalıdır." },
    ctrl: { en: "Hardware-enforced one-way data diode for egress; protocol break with schema validation; aggregate-only content (event class, coarse geolocation, timestamp, node health); no identifiers, no imagery, no free text; quarterly review of exported payloads.", tr: "Çıkış için donanımsal tek yönlü veri diyotu; şema doğrulamalı protokol kırılması; yalnızca toplu içerik (olay sınıfı, kaba konum, zaman damgası, düğüm sağlığı); tanımlayıcı, görüntü ve serbest metin yok; ihraç edilen yüklerin üç aylık incelenmesi." },
    ev: "DIODE-SPEC · EFDI-SPEC-§6", owner: "CISO", status: "gap" },

  { id: "D3", fw: "NATO", ref: "Personnel & facility security", prio: "high",
    req: { en: "Personnel with access to defence-connected components require appropriate vetting and facility controls.", tr: "Savunma bağlantılı bileşenlere erişen personel uygun güvenlik soruşturması ve tesis kontrolleri gerektirir." },
    ctrl: { en: "Named, vetted personnel list for the connector workstream; need-to-know access; no third-country national access without written approval; TEMPEST-aware rack placement; visitor and media control at the connector rack.", tr: "Bağlayıcı iş akışı için adı belirli, soruşturması yapılmış personel listesi; bilmesi gereken kadar erişim; yazılı onay olmadan üçüncü ülke vatandaşı erişimi yok; TEMPEST farkındalıklı kabin yerleşimi; bağlayıcı kabininde ziyaretçi ve medya kontrolü." },
    ev: "PERS-LIST · FAC-STD", owner: "CEO", status: "gap" }
];

SP.frameworks = [
  { id: "GDPR", name: { en: "GDPR (EU) 2016/679", tr: "GDPR (AB) 2016/679" }, note: { en: "Primary privacy regime for EU pilot cities.", tr: "AB pilot şehirleri için birincil gizlilik rejimi." } },
  { id: "KVKK", name: { en: "KVKK Law No. 6698 (Türkiye)", tr: "6698 sayılı KVKK" }, note: { en: "Applies to Turkish pilot cities and the coordinator.", tr: "Türk pilot şehirleri ve koordinatör için geçerlidir." } },
  { id: "NIS2", name: { en: "NIS2 Directive (EU) 2022/2555", tr: "NIS2 Direktifi (AB) 2022/2555" }, note: { en: "Municipal scope depends on national transposition — verify per country.", tr: "Belediye kapsamı ulusal aktarıma bağlıdır — ülke bazında doğrulanmalıdır." } },
  { id: "AI Act", name: { en: "EU AI Act (EU) 2024/1689", tr: "AB YZ Yasası (AB) 2024/1689" }, note: { en: "Triage engine treated as high-risk safety component.", tr: "Analiz motoru yüksek riskli güvenlik bileşeni olarak ele alınır." } },
  { id: "ISO 27001", name: { en: "ISO/IEC 27001:2022", tr: "ISO/IEC 27001:2022" }, note: { en: "Certification target for Lotus Sirius (M12).", tr: "Lotus Sirius için belgelendirme hedefi (M12)." } },
  { id: "CRA", name: { en: "Cyber Resilience Act (EU) 2024/2847", tr: "Siber Dayanıklılık Yasası (AB) 2024/2847" }, note: { en: "Applicability to be confirmed; reporting duties from 11 Sep 2026.", tr: "Uygulanabilirlik teyit edilecek; bildirim yükümlülükleri 11 Eylül 2026'dan itibaren." } },
  { id: "NATO", name: { en: "NATO / EFDI standards", tr: "NATO / EFDI standartları" }, note: { en: "STANAG 4774/4778 metadata, FMN alignment, cross-domain controls.", tr: "STANAG 4774/4778 üstverisi, FMN uyumu, çapraz alan kontrolleri." } }
];

SP.statusWeights = { ready: 1, partial: 0.5, gap: 0, na: null };
