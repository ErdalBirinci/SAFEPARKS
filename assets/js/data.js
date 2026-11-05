/* SAFE-PARKS CISO Portal — core project data (bilingual) */
window.SP = window.SP || {};

SP.meta = {
  project: "SAFE-PARKS",
  tagline: {
    en: "Zero-Biometric On-Demand Triage for safer public spaces, parks and playgrounds",
    tr: "Parklar, çocuk oyun alanları ve kamusal alanlarda sıfır biyometrik, talep üzerine analiz"
  },
  programme: "Horizon Europe",
  call: "Cluster 3 — Civil Security for Society",
  gaNumber: "",
  coordinator: "Xena Vision",
  coordinatorCountry: "Türkiye",
  totalBudget: 4720000,
  partnerCount: 12,
  cityCount: 7,
  countries: ["Belgium", "Ukraine", "Türkiye", "Italy", "Romania"],
  durationMonths: 36,
  wp3Lead: "Lotus Sirius",
  wp3Budget: 285000,
  ownerRole: "CISO",
  cisoName: "",
  dpoName: "",
  classification: "PUBLIC REPOSITORY · working copy (client-side gate only)",
  assumptions: [
    { en: "36-month duration assumed; confirm against Grant Agreement Article 3.", tr: "36 ay süre varsayılmıştır; Grant Agreement Madde 3 ile doğrulanmalıdır." },
    { en: "City-level allocation of the 7 pilot municipalities is indicative only.", tr: "7 pilot belediyenin ülke dağılımı yalnızca göstergedir." },
    { en: "Budgets for WP1, WP2, WP4–WP7 are not published here; only total, WP3 and partner figures are authoritative.", tr: "WP1, WP2, WP4–WP7 bütçeleri burada yer almaz; yalnızca toplam, WP3 ve ortak tutarları esastır." },
    { en: "Grant Agreement number and CSIRT / supervisory authority contacts must be filled in by the coordinator.", tr: "Grant Agreement numarası ile CSIRT / denetim otoritesi irtibatları koordinatör tarafından doldurulmalıdır." }
  ]
};

SP.partners = [
  { id: "P1", name: "Xena Vision", country: "Türkiye", type: { en: "Coordinator · Industry (AI)", tr: "Koordinatör · Sanayi (YZ)" }, budget: 500000, role: { en: "Project coordination, AI core (WP1, WP4)", tr: "Proje koordinasyonu, YZ çekirdeği (WP1, WP4)" }, sec: { en: "Coordinator security interface, AI Act provider obligations", tr: "Koordinatör güvenlik arayüzü, AI Act sağlayıcı yükümlülükleri" } },
  { id: "P2", name: "UNIROMA1 (Sapienza)", country: "Italy", type: { en: "Academia", tr: "Akademi" }, budget: 285000, role: { en: "Impact assessment, dissemination, standardisation (WP7)", tr: "Etki değerlendirmesi, yaygınlaştırma, standardizasyon (WP7)" }, sec: { en: "Research data ethics, publication review", tr: "Araştırma verisi etiği, yayın denetimi" } },
  { id: "P3", name: "3S Holding", country: "Türkiye", type: { en: "Industry (infrastructure)", tr: "Sanayi (altyapı)" }, budget: 285000, role: { en: "Edge & on-premise infrastructure, air-gapped deployment (WP5)", tr: "Uç ve yerel altyapı, izole ağ kurulumu (WP5)" }, sec: { en: "Hardware supply chain, secure provisioning, tamper protection", tr: "Donanım tedarik zinciri, güvenli kurulum, kurcalama koruması" } },
  { id: "P4", name: "CEPS", country: "Belgium", type: { en: "Policy research", tr: "Politika araştırması" }, budget: 285000, role: { en: "Legal, ethical & societal framework, EPAB secretariat (WP2)", tr: "Hukuki, etik ve toplumsal çerçeve, EPAB sekretaryası (WP2)" }, sec: { en: "GDPR/KVKK analysis, DPIA methodology", tr: "GDPR/KVKK analizi, DPIA metodolojisi" } },
  { id: "P5", name: "Lotus Sirius", country: "Türkiye", type: { en: "Industry (cyber & defence)", tr: "Sanayi (siber ve savunma)" }, budget: 285000, role: { en: "WP3 lead — cybersecurity, secure telemetry, NATO EFDI connector", tr: "WP3 lideri — siber güvenlik, güvenli telemetri, NATO EFDI bağlayıcısı" }, sec: { en: "CISO function, ISMS, crypto, incident response, EFDI integration", tr: "CISO fonksiyonu, BGYS, kripto, olay müdahalesi, EFDI entegrasyonu" } },
  { id: "M1", name: "Pilot Municipality 1", country: "Belgium", type: { en: "Municipality (pilot)", tr: "Belediye (pilot)" }, budget: 440000, role: { en: "Pilot site, data controller, operator console", tr: "Pilot saha, veri sorumlusu, operatör konsolu" }, sec: { en: "Controller obligations, DPO, local SOC, physical security", tr: "Veri sorumlusu yükümlülükleri, DPO, yerel SOC, fiziksel güvenlik" } },
  { id: "M2", name: "Pilot Municipality 2", country: "Ukraine", type: { en: "Municipality (pilot)", tr: "Belediye (pilot)" }, budget: 440000, role: { en: "Pilot site, data controller, resilience focus", tr: "Pilot saha, veri sorumlusu, dayanıklılık odağı" }, sec: { en: "Wartime resilience, offline operation, no cross-border transfer", tr: "Savaş koşullarında dayanıklılık, çevrimdışı çalışma, sınır ötesi aktarım yok" } },
  { id: "M3", name: "Pilot Municipality 3", country: "Ukraine", type: { en: "Municipality (pilot)", tr: "Belediye (pilot)" }, budget: 440000, role: { en: "Pilot site, data controller", tr: "Pilot saha, veri sorumlusu" }, sec: { en: "Air-gap validation, grid-loss scenarios", tr: "İzole ağ doğrulaması, elektrik kesintisi senaryoları" } },
  { id: "M4", name: "Pilot Municipality 4", country: "Türkiye", type: { en: "Municipality (pilot)", tr: "Belediye (pilot)" }, budget: 440000, role: { en: "Pilot site, data controller, KVKK workflow", tr: "Pilot saha, veri sorumlusu, KVKK iş akışı" }, sec: { en: "KVKK notification drill, VERBİS registration", tr: "KVKK bildirim tatbikatı, VERBİS kaydı" } },
  { id: "M5", name: "Pilot Municipality 5", country: "Türkiye", type: { en: "Municipality (pilot)", tr: "Belediye (pilot)" }, budget: 440000, role: { en: "Pilot site, data controller", tr: "Pilot saha, veri sorumlusu" }, sec: { en: "Playground deployment, children's data safeguards", tr: "Oyun alanı kurulumu, çocuk verisi korumaları" } },
  { id: "M6", name: "Pilot Municipality 6", country: "Italy", type: { en: "Municipality (pilot)", tr: "Belediye (pilot)" }, budget: 440000, role: { en: "Pilot site, data controller, Garante interface", tr: "Pilot saha, veri sorumlusu, Garante arayüzü" }, sec: { en: "GDPR supervisory authority liaison, DPIA filing", tr: "GDPR denetim otoritesi irtibatı, DPIA bildirimi" } },
  { id: "M7", name: "Pilot Municipality 7", country: "Romania", type: { en: "Municipality (pilot)", tr: "Belediye (pilot)" }, budget: 440000, role: { en: "Pilot site, data controller", tr: "Pilot saha, veri sorumlusu" }, sec: { en: "Co-financing verification, NIS2 transposition check", tr: "Eş finansman doğrulaması, NIS2 uyum kontrolü" } }
];

/* Seven pilot municipalities, in partner-id order. Country allocation is indicative (see meta.assumptions). */
SP.pilotCities = SP.partners.filter(function (p) { return /^M[1-7]$/.test(p.id); });

/* Indicative pilot waves, aligned to the WP6 deployment window (M10–M34).
   The grant does not publish a per-city wave in this repository; keep this mapping
   as the single editable source for the evidence ledger's pilot-wave column. */
SP.pilotWaves = [
  { id: "W1", label: { en: "Wave 1", tr: "1. Dalga" }, months: { en: "M10–M18", tr: "M10–M18" }, cities: ["M1", "M2", "M3"] },
  { id: "W2", label: { en: "Wave 2", tr: "2. Dalga" }, months: { en: "M19–M26", tr: "M19–M26" }, cities: ["M4", "M5"] },
  { id: "W3", label: { en: "Wave 3", tr: "3. Dalga" }, months: { en: "M27–M34", tr: "M27–M34" }, cities: ["M6", "M7"] }
];

SP.pilotWaveOf = function (cityId) {
  var found = null;
  (SP.pilotWaves || []).forEach(function (w) {
    if (w.cities.indexOf(cityId) >= 0) found = w;
  });
  return found;
};

SP.wps = [
  { id: "WP1", name: { en: "Project Coordination & Management", tr: "Proje Koordinasyonu ve Yönetimi" }, lead: "Xena Vision", ls: { en: "Contributor — security reporting line to coordinator", tr: "Katkı — koordinatöre güvenlik raporlama hattı" }, months: "M1–M36" },
  { id: "WP2", name: { en: "Legal, Ethical & Societal Framework", tr: "Hukuki, Etik ve Toplumsal Çerçeve" }, lead: "CEPS", ls: { en: "Contributor — technical feasibility of GDPR/KVKK obligations, DPIA input", tr: "Katkı — GDPR/KVKK yükümlülüklerinin teknik uygulanabilirliği, DPIA girdisi" }, months: "M1–M24" },
  { id: "WP3", name: { en: "Cybersecurity, Secure Telemetry & NATO EFDI Connector", tr: "Siber Güvenlik, Güvenli Telemetri ve NATO EFDI Bağlayıcısı" }, lead: "Lotus Sirius", ls: { en: "Leader — architecture, crypto, air-gap, EFDI adapter, assurance", tr: "Lider — mimari, kripto, izole ağ, EFDI adaptörü, güvence" }, months: "M1–M34" },
  { id: "WP4", name: { en: "Zero-Biometric On-Demand Triage Engine", tr: "Sıfır Biyometrik Talep Üzerine Analiz Motoru" }, lead: "Xena Vision", ls: { en: "Contributor — model security, adversarial robustness, inference hardening", tr: "Katkı — model güvenliği, karşıt saldırı dayanıklılığı, çıkarım sertleştirme" }, months: "M2–M28" },
  { id: "WP5", name: { en: "Edge & On-Premise Infrastructure, Air-Gapped Deployment", tr: "Uç ve Yerel Altyapı, İzole Ağ Kurulumu" }, lead: "3S Holding", ls: { en: "Contributor — hardened node baseline, key injection, tamper controls", tr: "Katkı — sertleştirilmiş düğüm tabanı, anahtar yükleme, kurcalama kontrolleri" }, months: "M3–M30" },
  { id: "WP6", name: { en: "Pilot Deployment & Field Validation", tr: "Pilot Kurulum ve Saha Doğrulaması" }, lead: { en: "Municipalities (pilot chair)", tr: "Belediyeler (pilot başkanı)" }, ls: { en: "Contributor — security acceptance tests, SOC handover, operator training", tr: "Katkı — güvenlik kabul testleri, SOC devri, operatör eğitimi" }, months: "M10–M34" },
  { id: "WP7", name: { en: "Impact, Dissemination, Exploitation & Standardisation", tr: "Etki, Yaygınlaştırma, Kullanım ve Standardizasyon" }, lead: "UNIROMA1", ls: { en: "Contributor — security-by-design exploitation story, standard contributions", tr: "Katkı — tasarımdan güvenlik kullanım öyküsü, standart katkıları" }, months: "M6–M36" }
];

SP.budgetCheck = {
  municipalities: 3080000,
  coordinator: 500000,
  partners: 285000,
  partnerCount: 4,
  wp3: 285000,
  total: 4720000
};

SP.wp3Budget = [
  { cat: { en: "Personnel", tr: "Personel" }, amount: 168000, note: { en: "19 PM: CTO 4, CISO 5, security engineers 6, crypto/PKI engineer 3, assurance 1", tr: "19 AD: CTO 4, CISO 5, güvenlik mühendisi 6, kripto/PKI mühendisi 3, güvence 1" } },
  { cat: { en: "Equipment", tr: "Ekipman" }, amount: 45000, note: { en: "HSM (FIPS 140-3 L3), data diode, test lab, tamper-evident kits", tr: "HSM (FIPS 140-3 L3), veri diyotu, test laboratuvarı, kurcalama setleri" } },
  { cat: { en: "Subcontracting", tr: "Alt yüklenici" }, amount: 42000, note: { en: "2 external penetration tests (24k), ISO 27001 certification audit (10k), legal/DPO advisory (8k)", tr: "2 harici sızma testi (24k), ISO 27001 belgelendirme denetimi (10k), hukuk/DPO danışmanlığı (8k)" } },
  { cat: { en: "Travel", tr: "Seyahat" }, amount: 15000, note: { en: "Consortium meetings, pilot site surveys, EPAB sessions", tr: "Konsorsiyum toplantıları, pilot saha incelemeleri, EPAB oturumları" } },
  { cat: { en: "Other direct costs", tr: "Diğer doğrudan maliyetler" }, amount: 15000, note: { en: "Certification, training, standards access, audit support", tr: "Belgelendirme, eğitim, standart erişimi, denetim desteği" } }
];

SP.wp3Tasks = [
  { id: "T3.1", name: { en: "Security architecture, threat model & requirements baseline", tr: "Güvenlik mimarisi, tehdit modeli ve gereksinim tabanı" }, months: "M1–M8", pm: 4, amount: 34400, out: "D3.1" },
  { id: "T3.2", name: { en: "Secure telemetry: MQTT/mTLS profile, municipal PKI & key management", tr: "Güvenli telemetri: MQTT/mTLS profili, belediye PKI ve anahtar yönetimi" }, months: "M3–M16", pm: 5, amount: 44200, out: "D3.2" },
  { id: "T3.3", name: { en: "Air-gapped resilience, offline update chain, failover", tr: "İzole ağ dayanıklılığı, çevrimdışı güncelleme zinciri, yedekleme" }, months: "M6–M20", pm: 3, amount: 26400, out: "D3.3" },
  { id: "T3.4", name: { en: "EFDI / NATO connector, STANAG metadata binding, cross-domain controls", tr: "EFDI / NATO bağlayıcısı, STANAG üstveri bağlama, çapraz alan kontrolleri" }, months: "M10–M24", pm: 4, amount: 35400, out: "D3.4" },
  { id: "T3.5", name: { en: "Post-quantum readiness & cryptographic policy", tr: "Kuantum sonrası hazırlık ve kriptografik politika" }, months: "M12–M30", pm: 1, amount: 9000, out: "D3.5" },
  { id: "T3.6", name: { en: "Security assurance: penetration tests, audits, ISO 27001 readiness", tr: "Güvenlik güvencesi: sızma testleri, denetimler, ISO 27001 hazırlığı" }, months: "M4–M34", pm: 2, amount: 18600, out: "D3.6" }
];

SP.wp3Interfaces = [
  { with: "WP4 (Xena Vision)", item: { en: "Model artefact signing, inference API authentication, adversarial test corpus, feature denylist (biometrics)", tr: "Model artefaktı imzalama, çıkarım API kimlik doğrulaması, karşıt test korpusu, öznitelik kara listesi (biyometri)" }, mech: { en: "Interface Control Document + monthly security sync", tr: "Arayüz Kontrol Dokümanı + aylık güvenlik senkronizasyonu" } },
  { with: "WP5 (3S Holding)", item: { en: "Hardened OS baseline, TPM/HSM key injection, tamper sensors, signed offline update media", tr: "Sertleştirilmiş işletim sistemi tabanı, TPM/HSM anahtar yükleme, kurcalama sensörleri, imzalı çevrimdışı güncelleme ortamı" }, mech: { en: "Build manifest + acceptance test suite", tr: "Derleme manifestosu + kabul test seti" } },
  { with: "WP2 (CEPS)", item: { en: "DPIA technical annex, retention enforcement evidence, TOM catalogue", tr: "DPIA teknik eki, saklama süresi uygulama kanıtı, TOM kataloğu" }, mech: { en: "Quarterly evidence pack", tr: "Üç aylık kanıt paketi" } },
  { with: "WP6 (Municipalities)", item: { en: "Security acceptance criteria, SOC runbooks, operator least-privilege roles, incident drills", tr: "Güvenlik kabul kriterleri, SOC el kitapları, operatör en az yetki rolleri, olay tatbikatları" }, mech: { en: "Site acceptance test (SAT) sign-off", tr: "Saha kabul testi (SAT) onayı" } },
  { with: "WP7 (UNIROMA1)", item: { en: "Standardisation contributions (ISO/IEC 27001, 42001, ETSI), exploitable security assets", tr: "Standardizasyon katkıları (ISO/IEC 27001, 42001, ETSI), kullanılabilir güvenlik varlıkları" }, mech: { en: "Contribution log", tr: "Katkı kaydı" } }
];

SP.governance = {
  roles: [
    { role: "CEO", org: "Lotus Sirius", duty: { en: "Strategic representation to EU/NATO/defence stakeholders; 285k budget accountability; EPAB relationship; consortium contracts.", tr: "AB/NATO/savunma paydaşları nezdinde stratejik temsil; 285k bütçe hesap verebilirliği; EPAB ilişkisi; konsorsiyum sözleşmeleri." }, kpi: { en: "Budget execution ≥95%, zero unresolved ethics escalations", tr: "Bütçe gerçekleşmesi ≥%95, çözülmemiş etik escalasyonu sıfır" } },
    { role: "CTO", org: "Lotus Sirius", duty: { en: "WP3 technical leadership, architecture design, air-gap integration, EFDI/STANAG adapters, technical verification of data protection controls.", tr: "WP3 teknik liderliği, mimari tasarımı, izole ağ entegrasyonu, EFDI/STANAG adaptörleri, veri koruma kontrollerinin teknik doğrulaması." }, kpi: { en: "Design reviews on time, zero critical findings open >30 days", tr: "Tasarım gözden geçirmeleri zamanında, 30 günü aşan kritik bulgu yok" } },
    { role: "CISO", org: "Lotus Sirius", duty: { en: "Security strategy & ISMS, risk register, assurance (pentest/audit), incident command, crypto & PQC policy, privacy-engineering evidence, WP3 security workstream control.", tr: "Güvenlik stratejisi ve BGYS, risk kaydı, güvence (sızma testi/denetim), olay komutanlığı, kripto ve PQC politikası, gizlilik mühendisliği kanıtları, WP3 güvenlik iş akışı kontrolü." }, kpi: { en: "Compliance readiness ≥90% by M12, MTTR <4h (Sev1), 100% DPIA coverage", tr: "M12'de uyum hazırlığı ≥%90, MTTR <4s (Sev1), %100 DPIA kapsamı" } },
    { role: "WP3 Lead", org: "Lotus Sirius (CTO acting)", duty: { en: "Deliverable quality, effort and cost control, task-level planning, interface management with WP4/WP5.", tr: "Çıktı kalitesi, efor ve maliyet kontrolü, görev düzeyinde planlama, WP4/WP5 arayüz yönetimi." }, kpi: { en: "All WP3 deliverables accepted first pass", tr: "Tüm WP3 çıktıları ilk sunumda kabul" } },
    { role: "DPO", org: "Each municipality", duty: { en: "Independent DPO function: DPIA advice, ROPA, data subject rights, breach notification to authority, VERBİS.", tr: "Bağımsız DPO işlevi: DPIA görüşü, ROPA, ilgili kişi hakları, otoriteye ihlal bildirimi, VERBİS." }, kpi: { en: "DPIA signed before go-live, notifications within legal deadline", tr: "Canlıya geçiş öncesi DPIA imzası, yasal sürede bildirim" } },
    { role: "EPAB", org: "Consortium", duty: { en: "Ethics & Privacy Advisory Board: reviews DPIA, purpose limitation, function-creep risk, publishes opinions.", tr: "Etik ve Gizlilik Danışma Kurulu: DPIA, amaç sınırlaması, işlev kayması riskini inceler, görüş yayımlar." }, kpi: { en: "Opinion issued within 20 working days of submission", tr: "Başvurudan itibaren 20 iş günü içinde görüş" } },
    { role: { en: "Coordinator (PMO)", tr: "Koordinatör (PMO)" }, org: "Xena Vision", duty: { en: "Contractual reporting, milestone acceptance, GA compliance, security annex integration.", tr: "Sözleşmesel raporlama, kilometre taşı kabulü, GA uyumu, güvenlik ekinin entegrasyonu." }, kpi: { en: "Zero late periodic reports", tr: "Gecikmiş dönemsel rapor yok" } }
  ],
  raci: {
    cols: ["CEO", "CISO", "CTO", "DPO/EPAB", "Coordinator", "Municipalities"],
    rows: [
      { a: { en: "Security architecture approval (WP3)", tr: "Güvenlik mimarisi onayı (WP3)" }, v: ["I", "A", "R", "C", "I", "C"] },
      { a: { en: "Cryptographic standard & PQC roadmap", tr: "Kriptografik standart ve PQC yol haritası" }, v: ["I", "A", "R", "C", "I", "I"] },
      { a: { en: "Air-gap deployment go/no-go per site", tr: "Saha bazında izole ağ devreye alma kararı" }, v: ["I", "A", "R", "C", "C", "R"] },
      { a: { en: "EFDI / NATO connector release approval", tr: "EFDI / NATO bağlayıcı sürüm onayı" }, v: ["A", "R", "R", "C", "C", "I"] },
      { a: { en: "DPIA approval per pilot city", tr: "Pilot şehir bazında DPIA onayı" }, v: ["I", "C", "C", "A/R", "C", "R"] },
      { a: { en: "Incident declaration & authority notification", tr: "Olay ilanı ve otorite bildirimi" }, v: ["I", "A", "R", "R", "I", "R"] },
      { a: { en: "Penetration test scope & acceptance", tr: "Sızma testi kapsamı ve kabulü" }, v: ["I", "A", "C", "I", "I", "C"] },
      { a: { en: "WP3 security budget reallocation", tr: "WP3 güvenlik bütçesi yeniden tahsisi" }, v: ["A", "C", "R", "I", "C", "I"] },
      { a: { en: "Partner / supplier security assessment", tr: "Ortak / tedarikçi güvenlik değerlendirmesi" }, v: ["I", "A", "C", "C", "C", "I"] },
      { a: { en: "Production change on live park nodes", tr: "Canlı park düğümlerinde üretim değişikliği" }, v: ["I", "A", "R", "I", "I", "R"] },
      { a: { en: "Cross-border data transfer decision", tr: "Sınır ötesi veri aktarımı kararı" }, v: ["A", "R", "C", "A", "C", "R"] },
      { a: { en: "Public / media communication after incident", tr: "Olay sonrası kamuoyu / medya iletişimi" }, v: ["A", "C", "I", "C", "R", "R"] },
      { a: { en: "Security training programme", tr: "Güvenlik eğitim programı" }, v: ["I", "A", "C", "C", "I", "R"] }
    ],
    legend: { R: { en: "Responsible (does the work)", tr: "Uygulayan (işi yapan)" }, A: { en: "Accountable (single owner, signs off)", tr: "Hesap veren (tek sahip, onaylayan)" }, C: { en: "Consulted", tr: "Görüşülen" }, I: { en: "Informed", tr: "Bilgilendirilen" } }
  },
  decisionRights: [
    { d: { en: "Block a release on unresolved critical/high security finding", tr: "Çözülmemiş kritik/yüksek güvenlik bulgusunda sürümü bloke etme" }, who: "CISO", note: { en: "Absolute veto; escalation to CEO within 24h, documented in risk register.", tr: "Mutlak veto; 24 saat içinde CEO'ya escalasyon, risk kaydına işlenir." } },
    { d: { en: "Refuse a pilot deployment (privacy/security grounds)", tr: "Pilot kurulumu reddetme (gizlilik/güvenlik gerekçesiyle)" }, who: "CISO + DPO", note: { en: "Joint decision; DPO opinion is binding for GDPR/KVKK matters.", tr: "Ortak karar; DPO görüşü GDPR/KVKK konularında bağlayıcıdır." } },
    { d: { en: "Declare Sev-1 incident and activate crisis team", tr: "Sev-1 olay ilanı ve kriz ekibini aktive etme" }, who: "CISO", note: { en: "No pre-authorisation needed; coordinator informed within 1h.", tr: "Ön onay gerekmez; koordinatör 1 saat içinde bilgilendirilir." } },
    { d: { en: "Approve cryptographic algorithms / key lengths", tr: "Kriptografik algoritma / anahtar uzunluğu onayı" }, who: "CISO", note: { en: "CTO consulted; deviations require written risk acceptance by CEO.", tr: "CTO görüşü alınır; sapmalar CEO'nun yazılı risk kabulünü gerektirir." } },
    { d: { en: "Share any data with defence / NATO channels", tr: "Savunma / NATO kanallarıyla veri paylaşımı" }, who: "CEO + CISO", note: { en: "Only aggregate, non-personal telemetry; national authority release where required.", tr: "Yalnızca kişisel veri içermeyen toplu telemetri; gerektiğinde ulusal makam onayı." } },
    { d: { en: "Accept residual risk above tolerance", tr: "Tolerans üstü artık riskin kabulü" }, who: "CEO", note: { en: "CISO recommends; acceptance recorded with expiry date and compensating controls.", tr: "CISO önerir; kabul, son kullanma tarihi ve telafi edici kontrollerle kaydedilir." } }
  ],
  epab: {
    mandate: { en: "Independent advisory board reviewing ethics, fundamental rights, purpose limitation and function-creep risks of the triage model. Issues non-binding opinions that must be answered in writing by the coordinator.", tr: "Analiz modelinin etik, temel haklar, amaç sınırlaması ve işlev kayması risklerini inceleyen bağımsız danışma kurulu. Koordinatörün yazılı yanıt vermek zorunda olduğu, bağlayıcı olmayan görüşler yayımlar." },
    composition: { en: "5–7 members: legal scholar, data protection expert, ethicist, child-safety specialist, municipal representative, civil-society observer, CISO (non-voting technical rapporteur).", tr: "5–7 üye: hukuk akademisyeni, veri koruma uzmanı, etik uzmanı, çocuk güvenliği uzmanı, belediye temsilcisi, sivil toplum gözlemcisi, CISO (oy hakkı olmayan teknik raportör)." },
    cadence: { en: "Quarterly plenary + ad-hoc for DPIA of each pilot wave; 20 working-day opinion turnaround.", tr: "Üç aylık genel kurul + her pilot dalgasının DPIA'sı için özel toplantı; 20 iş günü görüş süresi." },
    quorum: { en: "Quorum 4 members including at least one legal and one ethics member.", tr: "Yeter sayı: en az bir hukuk ve bir etik üye dahil 4 üye." },
    cisoObligations: { en: "Submit DPIA technical annex, adversarial test results and any purpose change 10 working days before the session; publish responses in the project repository within 10 working days after.", tr: "DPIA teknik eki, karşıt test sonuçları ve amaç değişikliklerini oturumdan 10 iş günü önce sunmak; yanıtları 10 iş günü içinde proje deposunda yayımlamak." }
  }
};
