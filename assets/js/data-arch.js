/* SAFE-PARKS CISO Portal — security architecture reference data */
window.SP = window.SP || {};

SP.arch = {
  principles: [
    { en: "Zero biometrics by construction — the capability is absent, not disabled by configuration.", tr: "Yapı gereği sıfır biyometri — yetenek yapılandırmayla kapatılmış değil, hiç yoktur." },
    { en: "On-demand, not continuous: no analytics run until an approved trigger exists.", tr: "Sürekli değil talep üzerine: onaylı bir tetik olmadan hiçbir analiz çalışmaz." },
    { en: "Local-first and cloud-free: inference, storage and logging stay in the municipality.", tr: "Önce yerel ve bulutsuz: çıkarım, saklama ve günlükleme belediyede kalır." },
    { en: "Default deny on every boundary: network, identity, data export and model capability.", tr: "Her sınırda varsayılan red: ağ, kimlik, veri çıkışı ve model yeteneği." },
    { en: "Fail safe, not fail open: a purge or integrity failure stops triage instead of continuing unverified.", tr: "Güvenli tarafa düş: imha veya bütünlük arızası doğrulanmamış şekilde devam etmek yerine analizi durdurur." },
    { en: "Human decision for anything that affects a person.", tr: "Kişiyi etkileyen her konuda insan kararı." },
    { en: "Verifiable, not asserted: every control emits evidence that can be independently checked.", tr: "Beyan değil kanıt: her kontrol bağımsız olarak doğrulanabilir kanıt üretir." },
    { en: "Crypto-agile for a 15-year physical lifetime.", tr: "15 yıllık fiziksel ömür için kripto çevikliği." }
  ],
  zones: [
    { id: "Z0", name: { en: "Field layer", tr: "Saha katmanı" }, tone: "ok",
      desc: { en: "Fixed cameras, acoustic sensors, smoke/heat detectors, cabinet tamper switches. No storage, no analytics, no credentials beyond a device certificate.", tr: "Sabit kameralar, akustik sensörler, duman/ısı dedektörleri, kabin kurcalama anahtarları. Depolama, analiz ve cihaz sertifikası dışında kimlik bilgisi yok." },
      nodes: ["IP camera (fixed lens)", "Acoustic sensor", "Smoke / heat detector", "Tamper switch", "802.1X"] },
    { id: "Z1", name: { en: "Edge compute (park cabinet)", tr: "Uç bilişim (park kabini)" }, tone: "accent",
      desc: { en: "The only place frames exist. 60 s volatile buffer, 30 s on-demand inference, purge engine, local broker, TPM/HSM trust anchor, watchdog. Air-gapped by default.", tr: "Karelerin bulunduğu tek yer. 60 sn uçucu tampon, 30 sn talep üzerine çıkarım, imha motoru, yerel broker, TPM/HSM güven çıpası, watchdog. Varsayılan olarak izole." },
      nodes: ["NPU inference node", "Ring buffer (tmpfs)", "Purge engine", "MQTT broker", "TPM 2.0 / HSM", "Watchdog"] },
    { id: "Z2", name: { en: "Municipal secure enclave", tr: "Belediye güvenli bölgesi" }, tone: "info",
      desc: { en: "Operator console, case management, SIEM, identity provider, evidence store. Connected to the park by a one-way management path only.", tr: "Operatör konsolu, vaka yönetimi, SIEM, kimlik sağlayıcı, kanıt deposu. Parka yalnızca tek yönlü yönetim yolu ile bağlanır." },
      nodes: ["Operator console", "SIEM (WORM)", "SSO / IdP", "Case management", "Evidence vault"] },
    { id: "Z3", name: { en: "Federated / defence domain", tr: "Federe / savunma alanı" }, tone: "warn",
      desc: { en: "Reached only through a hardware one-way diode, aggregate telemetry only, STANAG-labelled. No return path into the park.", tr: "Yalnızca donanımsal tek yönlü diyot üzerinden erişilir, yalnızca toplu telemetri, STANAG etiketli. Parka dönüş yolu yok." },
      nodes: ["Data diode", "EFDI adapter", "STANAG 4774/4778 labeller", "Civil protection C2", "Defence C2"] },
    { id: "Z4", name: { en: "Build & supply chain", tr: "Derleme ve tedarik zinciri" }, tone: "violet",
      desc: { en: "Isolated CI, signed artefacts, SBOM, reproducible builds, offline update media. The only route by which code enters Z1.", tr: "İzole CI, imzalı artefaktlar, SBOM, yeniden üretilebilir derlemeler, çevrimdışı güncelleme medyası. Kodun Z1'e girdiği tek yol." },
      nodes: ["CI pipeline", "SBOM store", "Signing service", "Write-once media", "Test lab"] }
  ],
  crypto: [
    { use: { en: "Camera → node", tr: "Kamera → düğüm" }, alg: "mTLS 1.3 · X25519", key: "ECDSA P-384", life: "90 d", note: { en: "Device certificate pinned per camera; no shared PSK.", tr: "Kamera başına sabitlenmiş cihaz sertifikası; paylaşılan PSK yok." } },
    { use: { en: "Node → broker", tr: "Düğüm → broker" }, alg: "mTLS 1.3 · X25519MLKEM768 (hybrid)", key: "ECDSA P-384 + ML-DSA-65", life: "90 d", note: { en: "Hybrid group from M18; classical fallback removed at M30.", tr: "M18'den itibaren hibrit grup; klasik geri dönüş M30'da kaldırılır." } },
    { use: { en: "Node → console", tr: "Düğüm → konsol" }, alg: "TLS 1.3 · AEAD only", key: "Internal CA", life: "90 d", note: { en: "Session-bound, 15-minute idle timeout, device binding.", tr: "Oturuma bağlı, 15 dakika boşta zaman aşımı, cihaz bağlama." } },
    { use: { en: "Data at rest", tr: "Bekleyen veri" }, alg: "AES-256-GCM", key: "TPM-sealed + municipal KEK", life: "Per boot", note: { en: "Volatile volumes only; no persistent video store exists.", tr: "Yalnızca uçucu birimler; kalıcı video deposu yoktur." } },
    { use: { en: "Audit log integrity", tr: "Denetim kaydı bütünlüğü" }, alg: "SHA-256 hash chain", key: "Signing service", life: "12 mo", note: { en: "Append-only WORM; daily head hash notarised offline.", tr: "Yalnızca eklemeli WORM; günlük baş hash çevrimdışı noterlenir." } },
    { use: { en: "Code & model signing", tr: "Kod ve model imzalama" }, alg: "ECDSA P-384 → hybrid ML-DSA-65", key: "HSM (FIPS 140-3 L3)", life: "1 y", note: { en: "Dual signature during transition; verification pinned at node.", tr: "Geçiş süresince çift imza; doğrulama düğümde sabitlenir." } },
    { use: { en: "EFDI export", tr: "EFDI çıkışı" }, alg: "XMLDSig / STANAG 4778 binding", key: "Release officer + HSM", life: "Per message", note: { en: "Signed, labelled, one-way; no confidentiality of content depends on the channel.", tr: "İmzalı, etiketli, tek yönlü; içerik gizliliği kanala bağlı değildir." } },
    { use: { en: "Backups & config", tr: "Yedekler ve konfigürasyon" }, alg: "AES-256-GCM + age", key: "Offline custodian", life: "1 y", note: { en: "Encrypted, offline, two-person access, annual restore test.", tr: "Şifreli, çevrimdışı, iki kişi erişimi, yıllık geri yükleme testi." } }
  ],
  ports: [
    { from: "Camera", to: "Edge node", proto: "MQTT over TLS", port: "8883", auth: "mTLS", policy: { en: "Only camera subnets; no other source accepted.", tr: "Yalnızca kamera alt ağları; başka kaynak kabul edilmez." } },
    { from: "Edge node", to: "Municipal broker", proto: "MQTT over TLS", port: "8883", auth: "mTLS + topic ACL", policy: { en: "Publish to own namespace only.", tr: "Yalnızca kendi ad alanına yayın." } },
    { from: "Console", to: "Edge node", proto: "HTTPS", port: "8443", auth: "mTLS + OIDC", policy: { en: "Break-glass path via jump host only.", tr: "Acil erişim yolu yalnızca atlama sunucusu üzerinden." } },
    { from: "Edge node", to: "Internet", proto: "any", port: "—", auth: "—", policy: { en: "DENY ALL. Verified by automated test on every deployment.", tr: "TÜMÜNÜ REDDET. Her dağıtımda otomatik testle doğrulanır." } },
    { from: "EFDI adapter", to: "Defence C2", proto: "One-way file/XML", port: "—", auth: "Signed payload", policy: { en: "Diode egress only; no return channel exists.", tr: "Yalnızca diyot çıkışı; dönüş kanalı yoktur." } },
    { from: "Admin", to: "Node", proto: "SSH (key only)", port: "22", auth: "FIDO2-backed key", policy: { en: "Disabled in production; enabled only in a recorded maintenance window.", tr: "Üretimde kapalı; yalnızca kayıtlı bakım penceresinde açılır." } },
    { from: "Node", to: "Local time source", proto: "NTS / GPS", port: "123", auth: "Authenticated", policy: { en: "No external NTP; local GPS with authenticated fallback.", tr: "Harici NTP yok; kimlik doğrulamalı yedekli yerel GPS." } },
    { from: "SIEM", to: "Node logs", proto: "Syslog over TLS", port: "6514", auth: "mTLS", policy: { en: "Push only; no pull from the park.", tr: "Yalnızca gönderim; parktan çekme yok." } }
  ],
  pqc: [
    { phase: "M12–M18", t: { en: "Cryptographic inventory", tr: "Kriptografik envanter" }, d: { en: "Every link, key, certificate and stored object with owner, algorithm, lifetime and data sensitivity.", tr: "Her bağlantı, anahtar, sertifika ve saklanan nesne; sahibi, algoritması, ömrü ve veri hassasiyetiyle." } },
    { phase: "M18–M24", t: { en: "Hybrid key agreement", tr: "Hibrit anahtar anlaşması" }, d: { en: "X25519MLKEM768 in node-to-broker and node-to-console paths; hybrid signatures for update bundles.", tr: "Düğüm-broker ve düğüm-konsol yollarında X25519MLKEM768; güncelleme paketlerinde hibrit imzalar." } },
    { phase: "M24–M30", t: { en: "PQC default", tr: "PQC varsayılan" }, d: { en: "ML-KEM (FIPS 203) default group, ML-DSA (FIPS 204) for code and model signing, edge performance validation.", tr: "Varsayılan grup ML-KEM (FIPS 203), kod ve model imzalamada ML-DSA (FIPS 204), uç performans doğrulaması." } },
    { phase: "M30+", t: { en: "Classical retirement", tr: "Klasiklerin kaldırılması" }, d: { en: "Classical-only paths removed; crypto-agility tested by swapping an algorithm without hardware change.", tr: "Yalnızca klasik yollar kaldırılır; donanım değişikliği olmadan algoritma değiştirilerek kripto çevikliği test edilir." } }
  ],
  efdi: [
    { k: { en: "Classification", tr: "Sınıflandırma" }, v: { en: "Every export carries STANAG 4774 confidentiality metadata and STANAG 4778 binding; unlabelled payloads are rejected.", tr: "Her çıktı STANAG 4774 gizlilik üstverisi ve STANAG 4778 bağlama taşır; etiketsiz yükler reddedilir." } },
    { k: { en: "Content", tr: "İçerik" }, v: { en: "Aggregate, non-personal situational indicators only: event class counts, coarse zone, 15-minute buckets, node health.", tr: "Yalnızca toplu, kişisel olmayan durumsal göstergeler: olay sınıfı sayımları, kaba bölge, 15 dakikalık kovalar, düğüm sağlığı." } },
    { k: { en: "Path", tr: "Yol" }, v: { en: "Hardware one-way diode with protocol break; schema allowlist; no inbound path; efdi adapter cannot read frames.", tr: "Protokol kırılmalı donanımsal tek yönlü diyot; şema beyaz listesi; giriş yolu yok; EFDI adaptörü kareleri okuyamaz." } },
    { k: { en: "Release control", tr: "Çıkış kontrolü" }, v: { en: "Human release officer approval per activation, with a reason code and a classification decision recorded.", tr: "Aktivasyon başına insan çıkış sorumlusu onayı; gerekçe kodu ve sınıflandırma kararı kaydedilir." } },
    { k: { en: "Assurance", tr: "Güvence" }, v: { en: "PII canaries on every payload, conformance suite per release, quarterly joint sample audit, immediate stop on anomaly.", tr: "Her yükte kişisel veri kanaryaları, sürüm başına uygunluk seti, üç aylık ortak örnek denetimi, anomalide derhal durdurma." } },
    { k: { en: "Legal boundary", tr: "Hukuki sınır" }, v: { en: "Because no personal data crosses, GDPR Art. 44 and KVKK Art. 9 are not engaged; this is verified by design review and audit, not assumed.", tr: "Kişisel veri geçmediği için GDPR Md. 44 ve KVKK Md. 9 devreye girmez; bu varsayım değil, tasarım incelemesi ve denetimle doğrulanır." } }
  ],
  resilience: [
    { k: { en: "Autonomy", tr: "Otonomi" }, v: { en: "72 hours without WAN or grid: UPS, local generation, local time, no external dependency in the inference path.", tr: "WAN veya elektrik olmadan 72 saat: UPS, yerel jeneratör, yerel zaman, çıkarım yolunda harici bağımlılık yok." } },
    { k: { en: "Degraded modes", tr: "Azaltılmış modlar" }, v: { en: "Acoustic-only detection when video fails; metadata-only display when the console loses the stream; manual dispatch card when SIEM is down.", tr: "Video arızalandığında yalnızca akustik tespit; konsol akışı kaybettiğinde yalnızca üstveri gösterimi; SIEM kapalıyken manuel yönlendirme kartı." } },
    { k: { en: "Recovery targets", tr: "Kurtarma hedefleri" }, v: { en: "RTO 4 h per node (spare swap), RPO not applicable for video (no retention) and 24 h for configuration.", tr: "Düğüm başına RTO 4 saat (yedek değişimi), video için RPO uygulanmaz (saklama yok), konfigürasyon için 24 saat." } },
    { k: { en: "Drills", tr: "Tatbikatlar" }, v: { en: "Monthly failover per city, quarterly tabletop, annual full-scale with the municipality's crisis team.", tr: "Şehir başına aylık yedekleme, üç aylık masa başı, belediyenin kriz ekibiyle yıllık tam ölçekli tatbikat." } }
  ]
};
