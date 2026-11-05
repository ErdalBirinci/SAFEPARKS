/* SAFE-PARKS CISO Portal — CISO mandate, objectives, 90-day plan, KPIs, reporting */
window.SP = window.SP || {};

SP.mandate = {
  charter: [
    { en: "The CISO owns the information security management system (ISMS) of Lotus Sirius for SAFE-PARKS, including the security workstream of WP3.", tr: "CISO, SAFE-PARKS kapsamında Lotus Sirius'un bilgi güvenliği yönetim sisteminin (BGYS) ve WP3 güvenlik iş akışının sahibidir." },
    { en: "The CISO holds an independent security veto over any release, pilot go-live or data-sharing arrangement with unresolved critical or high findings.", tr: "CISO, çözülmemiş kritik veya yüksek bulgu bulunan her sürüm, pilot devreye alma veya veri paylaşım düzenlemesi üzerinde bağımsız güvenlik vetosuna sahiptir." },
    { en: "The CISO reports functionally to the CEO and has an unfiltered reporting line to the Coordinator and EPAB on privacy-critical matters.", tr: "CISO işlevsel olarak CEO'ya raporlar; gizlilik açısından kritik konularda Koordinatör ve EPAB'a filtresiz raporlama hattına sahiptir." },
    { en: "The CISO is incident commander for severity 1–2 events and single point of contact for CSIRT, supervisory authorities (via the DPO) and defence counterparts.", tr: "CISO, 1–2 şiddet dereceli olaylarda olay komutanı; CSIRT, denetim otoriteleri (DPO üzerinden) ve savunma muhatapları için tek irtibat noktasıdır." },
    { en: "The CISO maintains the project risk register and the compliance evidence base; no risk may be closed without recorded verification.", tr: "CISO proje risk kaydını ve uyum kanıt tabanını yürütür; hiçbir risk kayıtlı doğrulama olmadan kapatılamaz." },
    { en: "The CISO controls the WP3 security budget lines for assurance (pentests, audits, certification) and may reallocate within the approved total, reporting to the CEO.", tr: "CISO, güvence (sızma testleri, denetimler, belgelendirme) için WP3 güvenlik bütçe kalemlerini kontrol eder ve onaylı toplam içinde CEO'ya raporlayarak yeniden tahsis edebilir." },
    { en: "The CISO does not decide on the lawfulness of processing; that is the DPO's and the municipality's responsibility as data controller. The CISO makes the technical facts auditable.", tr: "CISO işlemenin hukuka uygunluğuna karar vermez; bu, veri sorumlusu olarak DPO ve belediyenin sorumluluğundadır. CISO teknik olguları denetlenebilir kılar." },
    { en: "Delegation of any of these powers requires a written CEO decision that is notified to the Coordinator and EPAB within 5 working days.", tr: "Bu yetkilerin herhangi birinin devri, Koordinatör ve EPAB'a 5 iş günü içinde bildirilen yazılı CEO kararı gerektirir." }
  ],
  interfaces: [
    { k: { en: "Security → Privacy", tr: "Güvenlik → Gizlilik" }, v: { en: "TOMs, purge evidence, access logs, DPIA technical annex, incident facts for Art. 33/34.", tr: "TOM'lar, imha kanıtı, erişim kayıtları, DPIA teknik eki, Md. 33/34 için olay olguları." } },
    { k: { en: "Security → Engineering", tr: "Güvenlik → Mühendislik" }, v: { en: "Threat model, secure SDLC gates, hardening baselines, signed artefacts, SBOM.", tr: "Tehdit modeli, güvenli SDLC kapıları, sertleştirme tabanları, imzalı artefaktlar, SBOM." } },
    { k: { en: "Security → Defence", tr: "Güvenlik → Savunma" }, v: { en: "Classification labels, cross-domain release control, STANAG metadata, personnel clearance records.", tr: "Sınıflandırma etiketleri, çapraz alan çıkış kontrolü, STANAG üstverisi, personel güvenlik soruşturması kayıtları." } },
    { k: { en: "Security → Municipalities", tr: "Güvenlik → Belediyeler" }, v: { en: "Acceptance criteria, SOC runbooks, operator training, incident drills, patch advisories.", tr: "Kabul kriterleri, SOC el kitapları, operatör eğitimi, olay tatbikatları, yama bildirimleri." } }
  ],
  objectives: [
    { o: { en: "ISO/IEC 27001:2022 readiness at Lotus Sirius (scope: SAFE-PARKS)", tr: "Lotus Sirius'ta ISO/IEC 27001:2022 hazırlığı (kapsam: SAFE-PARKS)" }, target: "M12", kpi: { en: "Stage 2 audit passed, zero major nonconformities", tr: "Aşama 2 denetimi geçildi, büyük uygunsuzluk yok" } },
    { o: { en: "DPIA coverage of all pilot sites before go-live", tr: "Tüm pilot sahalarda canlıya geçiş öncesi DPIA kapsamı" }, target: "M10", kpi: { en: "7/7 signed DPIA + EPAB opinion", tr: "7/7 imzalı DPIA + EPAB görüşü" } },
    { o: { en: "Cryptographic baseline with post-quantum migration path", tr: "Kuantum sonrası geçiş yolunu içeren kriptografik taban" }, target: "M24", kpi: { en: "100% of links hybrid-capable; roadmap approved", tr: "Bağlantıların %100'ü hibrit uyumlu; yol haritası onaylı" } },
    { o: { en: "Verifiable data destruction (60s / 30s model)", tr: "Doğrulanabilir veri imhası (60s / 30s modeli)" }, target: "M9", kpi: { en: "Automated purge test passes on every build", tr: "Her derlemede otomatik imha testi geçer" } },
    { o: { en: "Incident readiness for 7 cities", tr: "7 şehir için olay hazırlığı" }, target: "M14", kpi: { en: "2 drills/year per site, MTTR < 4h for Sev-1", tr: "Saha başına yılda 2 tatbikat, Sev-1 için MTTR < 4s" } },
    { o: { en: "Supply-chain assurance for hardware and AI components", tr: "Donanım ve YZ bileşenleri için tedarik zinciri güvencesi" }, target: "M18", kpi: { en: "100% SBOM + signed vendor attestations", tr: "%100 SBOM + imzalı tedarikçi beyanları" } },
    { o: { en: "Security culture and role-based training", tr: "Güvenlik kültürü ve role dayalı eğitim" }, target: "M6", kpi: { en: "≥95% completion, phishing failure <5%", tr: "≥%95 tamamlama, oltalama başarısızlığı <%5" } }
  ]
};

SP.risksAppetite = {
  statement: { en: "Zero tolerance for: biometric identification, continuous recording, cross-border personal data transfer, unencrypted links. Low tolerance for availability gaps >15 minutes during an active emergency. Moderate tolerance for innovation-related uncertainty when compensating controls and a dated review exist.", tr: "Sıfır tolerans: biyometrik tanımlama, sürekli kayıt, sınır ötesi kişisel veri aktarımı, şifrelenmemiş bağlantılar. Düşük tolerans: aktif bir acil durum sırasında 15 dakikayı aşan erişilebilirlik kaybı. Orta tolerans: telafi edici kontroller ve tarihli gözden geçirme bulunduğunda inovasyona bağlı belirsizlik." },
  thresholds: [
    { band: { en: "Critical (20–25)", tr: "Kritik (20–25)" }, action: { en: "Stop. CEO decision required; no go-live.", tr: "Dur. CEO kararı gerekir; canlıya geçiş yok." }, tone: "danger" },
    { band: { en: "High (12–19)", tr: "Yüksek (12–19)" }, action: { en: "Treatment plan with owner and date; CISO approval.", tr: "Sahip ve tarihli işlem planı; CISO onayı." }, tone: "warn" },
    { band: { en: "Medium (6–11)", tr: "Orta (6–11)" }, action: { en: "Monitor; treatment where cost-effective.", tr: "İzle; maliyet etkinse işlem uygula." }, tone: "info" },
    { band: { en: "Low (1–5)", tr: "Düşük (1–5)" }, action: { en: "Accept; annual review.", tr: "Kabul et; yıllık gözden geçirme." }, tone: "ok" }
  ]
};

SP.plan90 = [
  {
    phase: { en: "Days 1–30 · Establish", tr: "1–30. Gün · Yerleşme" },
    goal: { en: "Make the security baseline visible and undisputed.", tr: "Güvenlik tabanını görünür ve tartışmasız hale getir." },
    actions: [
      { id: "a1", t: { en: "Inventory all assets in scope: park nodes, cameras, brokers, operator consoles, EFDI gateway, build systems.", tr: "Kapsamdaki tüm varlıkları envanterle: park düğümleri, kameralar, broker'lar, operatör konsolları, EFDI geçidi, derleme sistemleri." } },
      { id: "a2", t: { en: "Stand up the risk register (this portal) and assign owners for the top 10 risks.", tr: "Risk kaydını (bu portal) devreye al ve ilk 10 risk için sahip ata." } },
      { id: "a3", t: { en: "Confirm the legal/contractual perimeter: Grant Agreement security annex, DPAs, pilot site agreements.", tr: "Hukuki/sözleşmesel çerçeveyi doğrula: Grant Agreement güvenlik eki, DPA'lar, pilot saha sözleşmeleri." } },
      { id: "a4", t: { en: "Issue the CISO charter for CEO signature and notify the consortium.", tr: "CISO tüzüğünü CEO imzasına sun ve konsorsiyuma bildir." } },
      { id: "a5", t: { en: "Verify the biometric denylist: models, libraries and features that must never ship.", tr: "Biyometrik kara listeyi doğrula: asla sevk edilmemesi gereken modeller, kütüphaneler ve öznitelikler." } }
    ]
  },
  {
    phase: { en: "Days 31–60 · Control", tr: "31–60. Gün · Kontrol" },
    goal: { en: "Turn policy into enforced technical configuration.", tr: "Politikayı uygulanan teknik konfigürasyona dönüştür." },
    actions: [
      { id: "b1", t: { en: "Freeze a hardened node baseline (CIS Level 2, no remote support, deny-all egress) and hash it.", tr: "Sertleştirilmiş düğüm tabanını dondur (CIS Seviye 2, uzaktan destek yok, tüm çıkışlar kapalı) ve hash'le." } },
      { id: "b2", t: { en: "Deploy mTLS with 90-day certificates from the municipal PKI; remove all shared credentials.", tr: "Belediye PKI'sından 90 günlük sertifikalarla mTLS devreye al; tüm paylaşılan kimlik bilgilerini kaldır." } },
      { id: "b3", t: { en: "Implement the purge test harness: prove the 60s buffer and 30s window erase within 5s.", tr: "İmha test düzeneğini kur: 60s tamponun ve 30s pencerenin 5s içinde silindiğini kanıtla." } },
      { id: "b4", t: { en: "Enable central logging with metadata-only schema and 12-month WORM retention.", tr: "Yalnızca üstveri şeması ve 12 aylık WORM saklama ile merkezi günlüklemeyi aç." } },
      { id: "b5", t: { en: "Run the first tabletop exercise: camera-stream interception + credential compromise.", tr: "İlk masa başı tatbikatını yap: kamera akışı ele geçirme + kimlik bilgisi ihlali." } }
    ]
  },
  {
    phase: { en: "Days 61–90 · Assure", tr: "61–90. Gün · Güvence" },
    goal: { en: "Produce evidence a regulator or auditor can accept.", tr: "Denetçinin veya otoritenin kabul edebileceği kanıt üret." },
    actions: [
      { id: "c1", t: { en: "Commission an internal penetration test of the pilot stack before any field data exists.", tr: "Sahada veri oluşmadan pilot yığının iç sızma testini başlat." } },
      { id: "c2", t: { en: "Publish the DPIA technical annex template and complete city #1 DPIA with its DPO.", tr: "DPIA teknik ek şablonunu yayımla ve 1. şehir DPIA'sını DPO ile tamamla." } },
      { id: "c3", t: { en: "Deliver the EFDI data-sharing decision note: what may leave, at which classification.", tr: "EFDI veri paylaşım karar notunu teslim et: hangi veri, hangi sınıflandırmayla çıkabilir." } },
      { id: "c4", t: { en: "Baseline the KPIs and issue the first monthly CISO report to the coordinator.", tr: "KPI'ları taban çizgisine oturt ve koordinatöre ilk aylık CISO raporunu sun." } },
      { id: "c5", t: { en: "Open the ISO 27001 gap assessment and schedule Stage 1 for month 10.", tr: "ISO 27001 fark analizini başlat ve Aşama 1'i 10. ay için planla." } }
    ]
  },
  {
    phase: { en: "Month 4–6 · Scale", tr: "4–6. Ay · Ölçekleme" },
    goal: { en: "Make the model repeatable across seven cities.", tr: "Modeli yedi şehirde tekrarlanabilir kıl." },
    actions: [
      { id: "d1", t: { en: "Turn the site security acceptance test into a repeatable checklist with evidence slots.", tr: "Saha güvenlik kabul testini kanıt alanlarıyla tekrarlanabilir kontrol listesine dönüştür." } },
      { id: "d2", t: { en: "Certify two municipal SOC operators per city and hand over runbooks.", tr: "Şehir başına iki belediye SOC operatörünü sertifikalandır ve el kitaplarını devret." } },
      { id: "d3", t: { en: "Run the first cross-border tabletop with WP2 and all DPOs (no data leaves premises).", tr: "WP2 ve tüm DPO'larla ilk sınır ötesi masa başı tatbikatını yap (tesisten veri çıkmaz)." } },
      { id: "d4", t: { en: "Publish the PQC migration roadmap draft and start hybrid TLS pilots.", tr: "PQC geçiş yol haritası taslağını yayımla ve hibrit TLS pilotlarına başla." } }
    ]
  }
];

SP.kpis = [
  { id: "K1", name: { en: "Compliance readiness", tr: "Uyum hazırlığı" }, def: { en: "Weighted share of applicable controls rated 'ready' in the compliance matrix.", tr: "Uyum matrisinde 'hazır' olarak derecelendirilen uygulanabilir kontrollerin ağırlıklı payı." }, target: "≥90% by M12", freq: { en: "Monthly", tr: "Aylık" }, owner: "CISO", auto: "compliance" },
  { id: "K2", name: { en: "Critical/high findings open >30 days", tr: "30 günü aşan kritik/yüksek bulgu" }, def: { en: "Count of unresolved critical or high findings older than 30 days across pentests and audits.", tr: "Sızma testleri ve denetimlerde 30 günden eski, çözülmemiş kritik veya yüksek bulgu sayısı." }, target: "0", freq: { en: "Weekly", tr: "Haftalık" }, owner: "CISO" },
  { id: "K3", name: { en: "Mean time to detect (MTTD), Sev-1/2", tr: "Ortalama tespit süresi (MTTD), Sev-1/2" }, def: { en: "Median time from first telemetry anomaly to incident declaration.", tr: "İlk telemetri anomalisinden olay ilanına kadar medyan süre." }, target: "<15 min", freq: { en: "Per incident", tr: "Olay başına" }, owner: "SOC" },
  { id: "K4", name: { en: "Mean time to contain (MTTC), Sev-1", tr: "Ortalama kontrol altına alma (MTTC), Sev-1" }, def: { en: "Median time from declaration to containment of the affected node or account.", tr: "İlandan etkilenen düğüm veya hesabın kontrol altına alınmasına kadar medyan süre." }, target: "<4 h", freq: { en: "Per incident", tr: "Olay başına" }, owner: "CISO" },
  { id: "K5", name: { en: "Patch SLA adherence", tr: "Yama SLA uyumu" }, def: { en: "Share of critical patches applied within 7 days (internet-facing 72 h), measured on air-gapped update cycles.", tr: "7 gün içinde uygulanan kritik yamaların payı (internet erişimli 72 saat), izole güncelleme döngülerinde ölçülür." }, target: "≥95%", freq: { en: "Monthly", tr: "Aylık" }, owner: "CTO" },
  { id: "K6", name: { en: "MFA / unique identity coverage", tr: "MFA / tekil kimlik kapsamı" }, def: { en: "Share of human accounts on SSO + phishing-resistant MFA; zero shared accounts.", tr: "SSO + oltalama dirençli MFA kullanan insan hesaplarının payı; paylaşılan hesap yok." }, target: "100%", freq: { en: "Monthly", tr: "Aylık" }, owner: "CISO" },
  { id: "K7", name: { en: "Verified purge success", tr: "Doğrulanmış imha başarısı" }, def: { en: "Share of automated purge tests passing (buffer ≤60s, analysis window ≤30s, erasure ≤5s).", tr: "Geçen otomatik imha testlerinin payı (tampon ≤60s, analiz penceresi ≤30s, silme ≤5s)." }, target: "100%", freq: { en: "Every build", tr: "Her derleme" }, owner: "CTO" },
  { id: "K8", name: { en: "DPIA coverage", tr: "DPIA kapsamı" }, def: { en: "Pilot sites with a signed DPIA and EPAB opinion before go-live.", tr: "Canlıya geçiş öncesi imzalı DPIA ve EPAB görüşü bulunan pilot saha sayısı." }, target: "7/7", freq: { en: "Per site", tr: "Saha başına" }, owner: "DPO", auto: "dpia" },
  { id: "K9", name: { en: "Security training completion", tr: "Güvenlik eğitimi tamamlama" }, def: { en: "Share of consortium staff completing annual role-based security and privacy training.", tr: "Yıllık role dayalı güvenlik ve gizlilik eğitimini tamamlayan konsorsiyum personelinin payı." }, target: "≥95%", freq: { en: "Quarterly", tr: "Üç aylık" }, owner: "CISO" },
  { id: "K10", name: { en: "Phishing simulation failure rate", tr: "Oltalama simülasyonu başarısızlık oranı" }, def: { en: "Share of recipients clicking a simulated credential-harvesting link.", tr: "Simüle kimlik avı bağlantısına tıklayan alıcıların payı." }, target: "<5%", freq: { en: "Quarterly", tr: "Üç aylık" }, owner: "CISO" },
  { id: "K11", name: { en: "Air-gap failover success", tr: "İzole ağ yedekleme başarısı" }, def: { en: "Share of drills where the park node continued triage through a 60-minute WAN and grid interruption.", tr: "60 dakikalık WAN ve elektrik kesintisi boyunca park düğümünün analizi sürdürdüğü tatbikatların payı." }, target: "100%", freq: { en: "Per drill", tr: "Tatbikat başına" }, owner: "CTO" },
  { id: "K12", name: { en: "SBOM coverage", tr: "SBOM kapsamı" }, def: { en: "Share of shipped components (edge, broker, connector, models) with a signed SBOM and provenance.", tr: "İmzalı SBOM ve köken bilgisi bulunan sevk edilmiş bileşenlerin (uç, broker, bağlayıcı, modeller) payı." }, target: "100%", freq: { en: "Per release", tr: "Sürüm başına" }, owner: "CTO" },
  { id: "K13", name: { en: "Notification timeliness", tr: "Bildirim zamanlılığı" }, def: { en: "Share of notifiable incidents reported within legal deadlines (GDPR 72h, NIS2 24h, KVKK 72h).", tr: "Yasal süreler içinde bildirilen bildirime tabi olayların payı (GDPR 72s, NIS2 24s, KVKK 72s)." }, target: "100%", freq: { en: "Per incident", tr: "Olay başına" }, owner: "DPO/CISO" },
  { id: "K14", name: { en: "Human oversight rate", tr: "İnsan gözetimi oranı" }, def: { en: "Share of triage alerts dispatched only after documented operator confirmation.", tr: "Yalnızca belgelenmiş operatör onayından sonra yönlendirilen analiz uyarılarının payı." }, target: "100%", freq: { en: "Monthly", tr: "Aylık" }, owner: "CISO", auto: "oversight" }
];

SP.reporting = {
  monthly: [
    { en: "One-page posture summary: readiness %, open critical/high findings, incidents, purge test status.", tr: "Tek sayfa durum özeti: hazırlık %, açık kritik/yüksek bulgular, olaylar, imha testi durumu." },
    { en: "Risk register delta: new, escalated, closed risks with owners and dates.", tr: "Risk kaydı farkı: yeni, yükselen, kapanan riskler; sahipler ve tarihler." },
    { en: "Deliverable status against WP3 plan and effort/budget burn.", tr: "WP3 planına göre çıktı durumu ve efor/bütçe tüketimi." },
    { en: "Evidence of the month: one artefact (log sample, pentest retest, DPIA annex).", tr: "Ayın kanıtı: bir artefakt (günlük örneği, sızma testi tekrar testi, DPIA eki)." }
  ],
  quarterly: [
    { en: "EPAB pack: DPIA updates, purpose-limitation review, adversarial test results, open ethics questions.", tr: "EPAB paketi: DPIA güncellemeleri, amaç sınırlaması incelemesi, karşıt test sonuçları, açık etik sorular." },
    { en: "KPI trend with root cause for any target miss.", tr: "Hedef sapmalarının kök nedeniyle birlikte KPI eğilimi." },
    { en: "Supplier and partner assurance status (attestations, SBOM, audit rights exercised).", tr: "Tedarikçi ve ortak güvence durumu (beyanlar, SBOM, kullanılan denetim hakları)." },
    { en: "Training and phishing simulation results by partner.", tr: "Ortağa göre eğitim ve oltalama simülasyonu sonuçları." }
  ],
  steering: [
    { en: "Decisions requested, with security recommendation and consequence of delay.", tr: "Talep edilen kararlar; güvenlik önerisi ve gecikmenin sonucu ile birlikte." },
    { en: "Residual risk acceptance requests above tolerance (CEO signature).", tr: "Tolerans üstü artık risk kabul talepleri (CEO imzası)." },
    { en: "Cross-WP dependencies at risk (WP2 legal, WP4 model, WP5 hardware, WP6 sites).", tr: "Risk altındaki WP'ler arası bağımlılıklar (WP2 hukuk, WP4 model, WP5 donanım, WP6 sahalar)." }
  ]
};
