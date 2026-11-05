/* SAFE-PARKS CISO Portal — policy documents 06–09 and the CISO charter (bilingual) */
window.SP = window.SP || {};

SP.docs2 = [
  {
    id: "POL-06", code: "LS-SP-POL-06", owner: "CISO", version: "1.0", approval: "CEO", review: "Annual",
    title: { en: "Supplier & Supply Chain Security Policy", tr: "Tedarikçi ve Tedarik Zinciri Güvenliği Politikası" },
    purpose: { en: "Applies NIS2 Article 21(2)(d) to cameras, compute hardware, software components and services.", tr: "NIS2 Madde 21(2)(d)'yi kameralar, bilişim donanımı, yazılım bileşenleri ve hizmetler için uygular." },
    sections: [
      { h: { en: "1. Scope", tr: "1. Kapsam" }, p: [
        { en: "This policy covers every supplier that can affect the confidentiality, integrity or availability of the triage platform: camera vendors, NPU and server vendors, software libraries, managed services, penetration testers, auditors and cloud collaboration tools. It applies whether the supplier contracts with Lotus Sirius, the coordinator or a municipality.", tr: "Bu politika, analiz platformunun gizliliğini, bütünlüğünü veya erişilebilirliğini etkileyebilecek her tedarikçiyi kapsar: kamera üreticileri, NPU ve sunucu üreticileri, yazılım kütüphaneleri, yönetilen hizmetler, sızma testi firmaları, denetçiler ve bulut işbirliği araçları. Tedarikçinin Lotus Sirius, koordinatör veya bir belediye ile sözleşme yapması fark etmez." }
      ]},
      { h: { en: "2. Mandatory contract clauses", tr: "2. Zorunlu sözleşme maddeleri" }, list: [
        { en: "Security requirements annex referencing this policy and the applicable legal obligations.", tr: "Bu politikaya ve geçerli yasal yükümlülüklere atıf yapan güvenlik gereksinimleri eki." },
        { en: "Obligation to provide a machine-readable SBOM for every delivered version, including transitive dependencies.", tr: "Teslim edilen her sürüm için geçişli bağımlılıklar dahil makine okunabilir SBOM sağlama yükümlülüğü." },
        { en: "Vulnerability disclosure within 90 days of a fix being available, and immediately for actively exploited issues.", tr: "Düzeltme mevcut olduktan sonra 90 gün içinde, aktif istismar edilen sorunlar için derhal güvenlik açığı bildirimi." },
        { en: "No remote access to operational systems unless approved in writing, time-boxed, supervised and recorded.", tr: "Yazılı onay olmadan, süreli, gözetimli ve kayıtlı olmadıkça operasyonel sistemlere uzaktan erişim yok." },
        { en: "Prohibition on telemetry, crash reporting or 'phone home' features in any component processing park data.", tr: "Park verisi işleyen hiçbir bileşende telemetri, çökme raporlama veya 'eve bağlanma' özelliği yasağı." },
        { en: "Right to audit, including on-site inspection of the park node and its build artefacts.", tr: "Park düğümü ve derleme artefaktlarının yerinde incelenmesi dahil denetim hakkı." },
        { en: "Country-of-origin declaration for hardware, with notice of any change in manufacturing location.", tr: "Donanım için menşe ülke beyanı ve üretim yeri değişikliğinde bildirim." },
        { en: "Security update support period of at least five years, or the declared product lifetime.", tr: "En az beş yıl veya beyan edilen ürün ömrü kadar güvenlik güncellemesi desteği." },
        { en: "Immediate notification of any supply-chain compromise, and cooperation with incident response.", tr: "Her tedarik zinciri ihlalinin derhal bildirilmesi ve olay müdahalesiyle işbirliği." }
      ]},
      { h: { en: "3. Assessment and approval", tr: "3. Değerlendirme ve onay" }, p: [
        { en: "Before onboarding, every supplier completes a security questionnaire, provides its most recent independent assurance report and a sample SBOM, and is rated low, medium or high criticality. High-criticality suppliers (cameras, compute, brokers, EFDI components) additionally require an on-site or remote technical assessment and a signed firmware attestation.", tr: "Devreye almadan önce her tedarikçi güvenlik anketini doldurur, en güncel bağımsız güvence raporunu ve örnek SBOM'u sağlar ve düşük, orta veya yüksek kritiklik olarak derecelendirilir. Yüksek kritiklikli tedarikçiler (kameralar, bilişim, broker'lar, EFDI bileşenleri) ek olarak yerinde veya uzaktan teknik değerlendirme ve imzalı ürün yazılımı beyanı gerektirir." },
        { en: "Approval is recorded with a review date. A supplier that fails to provide an SBOM or refuses audit rights cannot be used for a high-criticality component, regardless of commercial pressure.", tr: "Onay, gözden geçirme tarihiyle kaydedilir. SBOM sağlamayan veya denetim hakkını reddeden tedarikçi, ticari baskı ne olursa olsun yüksek kritiklikli bir bileşen için kullanılamaz." }
      ]},
      { h: { en: "4. Monitoring and exit", tr: "4. İzleme ve çıkış" }, p: [
        { en: "Suppliers are reassessed annually and after any relevant incident. Every delivered component is verified against its SBOM at build time; an unexplained difference blocks the release. Exit plans require that keys, data and configuration are handed over in a documented format, that certificates are revoked, and that the supplier confirms destruction of any copies in writing.", tr: "Tedarikçiler yıllık ve ilgili her olaydan sonra yeniden değerlendirilir. Teslim edilen her bileşen derleme sırasında SBOM'uyla karşılaştırılır; açıklanamayan fark sürümü bloke eder. Çıkış planları anahtarların, verinin ve konfigürasyonun belgelenmiş biçimde devredilmesini, sertifikaların iptal edilmesini ve tedarikçinin varsa kopyaların imhasını yazılı olarak teyit etmesini gerektirir." }
      ]}
    ]
  },
  {
    id: "POL-07", code: "LS-SP-POL-07", owner: "CISO", version: "1.0", approval: "CEO", review: "Every model release",
    title: { en: "AI Security & Human Oversight Policy", tr: "YZ Güvenliği ve İnsan Gözetimi Politikası" },
    purpose: { en: "Connects AI Act obligations to engineering practice for a high-risk safety component with no biometric capability.", tr: "Biyometrik yeteneği olmayan yüksek riskli bir güvenlik bileşeni için AI Act yükümlülüklerini mühendislik pratiğine bağlar." },
    sections: [
      { h: { en: "1. Classification and prohibition", tr: "1. Sınıflandırma ve yasak" }, p: [
        { en: "The triage engine is classified as a high-risk AI safety component under Annex III(2). The classification is documented, reviewed at every material change of intended purpose, and applied voluntarily from the first pilot so that the project does not depend on the statutory timeline. ⚠ The final application date for Annex III obligations must be verified against the current legal text before each conformity milestone.", tr: "Analiz motoru, Ek III(2) kapsamında yüksek riskli YZ güvenlik bileşeni olarak sınıflandırılır. Sınıflandırma belgelenir, amaçta her esaslı değişiklikte gözden geçirilir ve projenin yasal takvime bağımlı olmaması için ilk pilotan itibaren gönüllü uygulanır. ⚠ Ek III yükümlülüklerinin nihai uygulama tarihi, her uygunluk kilometre taşından önce yürürlükteki mevzuata göre doğrulanmalıdır." },
        { en: "Prohibited by design and by contract: real-time remote biometric identification, biometric categorisation, emotion recognition, social scoring, and any use for predictive policing of individuals. A request for such capability is refused in writing and reported to the EPAB.", tr: "Tasarım ve sözleşme gereği yasak: gerçek zamanlı uzaktan biyometrik tanımlama, biyometrik kategorizasyon, duygu tanıma, sosyal puanlama ve bireylere yönelik öngörücü polislik. Bu tür bir yetenek talebi yazılı olarak reddedilir ve EPAB'a bildirilir." }
      ]},
      { h: { en: "2. Data governance", tr: "2. Veri yönetişimi" }, list: [
        { en: "Training data provenance is recorded: source, licence, collection date, preprocessing and any synthetic generation method.", tr: "Eğitim verisi kökeni kaydedilir: kaynak, lisans, toplama tarihi, ön işleme ve varsa sentetik üretim yöntemi." },
        { en: "No pilot footage is used for training without anonymisation, a documented legal basis and DPO approval.", tr: "Hiçbir pilot görüntüsü anonimleştirme, belgelenmiş hukuki dayanak ve DPO onayı olmadan eğitimde kullanılmaz." },
        { en: "Representativeness is assessed across age, gender presentation, skin tone, mobility aids, clothing, lighting, weather and season, with results published internally.", tr: "Temsil gücü yaş, cinsiyet görünümü, ten rengi, hareket yardımcıları, giysi, aydınlatma, hava ve mevsim bazında değerlendirilir; sonuçlar içeride yayımlanır." },
        { en: "Bias testing is a release gate: a model that fails the per-group recall threshold does not ship, even if its aggregate accuracy improves.", tr: "Yanlılık testi bir sürüm kapısıdır: grup bazında duyarlılık eşiğini geçemeyen model, toplam doğruluğu artsa bile sevk edilmez." }
      ]},
      { h: { en: "3. Human oversight", tr: "3. İnsan gözetimi" }, p: [
        { en: "The system ranks and explains; humans decide. The operator sees confidence, contributing factors and known limitations, and must select a reason code for every dismissal so that the feedback loop is auditable. Dispatch of emergency services requires confirmation by a second authorised person. A physical or on-screen stop control exists at every console and its use is logged, never penalised.", tr: "Sistem sıralar ve açıklar; kararı insan verir. Operatör güven skorunu, katkıda bulunan faktörleri ve bilinen sınırlamaları görür ve her ret için gerekçe kodu seçmek zorundadır; böylece geri bildirim döngüsü denetlenebilir olur. Acil servis yönlendirmesi ikinci yetkili kişinin onayını gerektirir. Her konsolda fiziksel veya ekran üzerinde durdurma kontrolü bulunur ve kullanımı kaydedilir, asla cezalandırılmaz." },
        { en: "Overtrust is treated as a risk: the interface must not present a single authoritative 'correct' answer, and operators are trained on failure modes including occlusion, night-time performance, crowds and children's play behaviour.", tr: "Aşırı güven bir risk olarak ele alınır: arayüz tek ve otoriter bir 'doğru' yanıt sunmamalıdır ve operatörler örtülme, gece performansı, kalabalık ve çocuk oyun davranışı dahil arıza biçimleri konusunda eğitilir." }
      ]},
      { h: { en: "4. Release controls", tr: "4. Sürüm kontrolleri" }, p: [
        { en: "A model may be deployed only with: a signed artefact and hash, a model card with intended purpose and limitations, the adversarial test report, the bias report, the data governance record, and CISO approval. Rollback to the previous signed model must be possible within 30 minutes without physical presence where the node has a local staging area.", tr: "Bir model yalnızca şunlarla dağıtılabilir: imzalı artefakt ve hash, amaç ve sınırlamaları içeren model kartı, karşıt test raporu, yanlılık raporu, veri yönetişimi kaydı ve CISO onayı. Düğümün yerel hazırlık alanı varsa fiziksel mevcudiyet olmadan 30 dakika içinde önceki imzalı modele geri dönüş mümkün olmalıdır." },
        { en: "Post-deployment monitoring covers drift, false-positive rate, false-negative reports from operators, and any change in the input distribution after a camera replacement or a firmware update.", tr: "Dağıtım sonrası izleme; kayma, yanlış pozitif oranı, operatörlerden gelen yanlış negatif bildirimleri ve kamera değişimi veya ürün yazılımı güncellemesi sonrası girdi dağılımındaki değişimi kapsar." }
      ]}
    ]
  },
  {
    id: "POL-08", code: "LS-SP-POL-08", owner: "CTO", version: "1.0", approval: "CISO", review: "Annual",
    title: { en: "Air-Gapped Operations & Offline Update Procedure", tr: "İzole Ağ Operasyonları ve Çevrimdışı Güncelleme Prosedürü" },
    purpose: { en: "Defines how a park keeps detecting incidents when the internet and the grid fail, and how code reaches an isolated node safely.", tr: "İnternet ve elektrik kesildiğinde parkın olayları tespit etmeye nasıl devam ettiğini ve kodun izole düğüme güvenle nasıl ulaştığını tanımlar." },
    sections: [
      { h: { en: "1. Isolation by default", tr: "1. Varsayılan izolasyon" }, p: [
        { en: "A park node has no route to the internet in any operating state. Egress is denied at the local firewall and verified by an automated test on every deployment; an unexpected outbound packet is a Sev-2. The management plane is a separate VLAN reachable only from the municipal enclave through a jump host with session recording.", tr: "Bir park düğümünün hiçbir işletim durumunda internete rotası yoktur. Çıkış yerel güvenlik duvarında reddedilir ve her dağıtımda otomatik testle doğrulanır; beklenmeyen giden paket Sev-2'dir. Yönetim düzlemi, yalnızca belediye güvenli bölgesinden oturum kayıtlı bir atlama sunucusu üzerinden erişilebilen ayrı bir VLAN'dır." },
        { en: "Time comes from an authenticated local source; name resolution is local; no external DNS, NTP or certificate status service is required for operation. Certificates are validated against a locally cached CRL refreshed during maintenance windows.", tr: "Zaman, kimlik doğrulamalı yerel kaynaktan gelir; ad çözümleme yereldir; işletim için harici DNS, NTP veya sertifika durum servisi gerekmez. Sertifikalar, bakım pencerelerinde yenilenen yerel önbellekli CRL'ye göre doğrulanır." }
      ]},
      { h: { en: "2. Autonomy targets", tr: "2. Otonomi hedefleri" }, list: [
        { en: "72 hours of operation without WAN or grid, using UPS and local generation.", tr: "WAN veya elektrik olmadan, UPS ve yerel jeneratörle 72 saat çalışma." },
        { en: "Degraded acoustic-only mode when the video path fails; the mode change is visible to the operator.", tr: "Video yolu arızalandığında yalnızca akustik azaltılmış mod; mod değişikliği operatöre görünür." },
        { en: "Hardware watchdog restarts the triage service within 60 seconds; three restarts in an hour raise a Sev-2.", tr: "Donanım watchdog analiz servisini 60 saniye içinde yeniden başlatır; bir saatte üç yeniden başlatma Sev-2 açar." },
        { en: "Spare node and pre-provisioned keys held in each city for a four-hour swap.", tr: "Her şehirde dört saatlik değişim için yedek düğüm ve önceden hazırlanmış anahtarlar." }
      ]},
      { h: { en: "3. Offline update chain", tr: "3. Çevrimdışı güncelleme zinciri" }, p: [
        { en: "Step 1: the build pipeline produces a signed bundle containing the image, SBOM, hashes and rollback image; two engineers sign it. Step 2: the bundle is written to write-once media in a controlled environment and sealed with a numbered seal. Step 3: at the site, two authorised persons verify the seal, the hash and the signature before installation. Step 4: the node verifies the signature against its pinned key, applies the update, re-attests, and records the result. Step 5: the rollback image is retained for 30 days.", tr: "Adım 1: derleme hattı imaj, SBOM, hash'ler ve geri dönüş imajı içeren imzalı bir paket üretir; iki mühendis imzalar. Adım 2: paket kontrollü ortamda tek yazımlı medyaya yazılır ve numaralı mühürle kapatılır. Adım 3: sahada iki yetkili kişi kurulumdan önce mührü, hash'i ve imzayı doğrular. Adım 4: düğüm sabitlenmiş anahtarına göre imzayı doğrular, güncellemeyi uygular, yeniden kanıtlar ve sonucu kaydeder. Adım 5: geri dönüş imajı 30 gün saklanır." },
        { en: "Emergency updates for actively exploited vulnerabilities may bypass the monthly cadence but never the signature, dual-control or verification steps. The CISO is informed before installation and receives the result within 24 hours.", tr: "Aktif istismar edilen güvenlik açıkları için acil güncellemeler aylık ritmi atlayabilir, ancak imza, çift kontrol veya doğrulama adımlarını asla atlayamaz. CISO kurulumdan önce bilgilendirilir ve sonucu 24 saat içinde alır." }
      ]},
      { h: { en: "4. Maintenance and evidence", tr: "4. Bakım ve kanıt" }, p: [
        { en: "Maintenance requires a scheduled window, a change ticket, physical presence, and a recorded session. No vendor may connect remotely; if a supplier insists, the request is refused and escalated. Each intervention produces a signed record with the seal number, the persons present, the commands executed and the post-check results, retained with the asset for five years.", tr: "Bakım planlı bir pencere, değişiklik kaydı, fiziksel mevcudiyet ve kayıtlı oturum gerektirir. Hiçbir tedarikçi uzaktan bağlanamaz; ısrar ederse talep reddedilir ve escalate edilir. Her müdahale mühür numarası, hazır bulunan kişiler, çalıştırılan komutlar ve son kontrol sonuçlarını içeren imzalı bir kayıt üretir ve varlıkla birlikte beş yıl saklanır." }
      ]}
    ]
  },
  {
    id: "POL-09", code: "LS-SP-POL-09", owner: "CISO", version: "1.0", approval: "CEO + national authority", review: "Annual",
    title: { en: "EFDI / Defence Data Sharing Policy", tr: "EFDI / Savunma Veri Paylaşım Politikası" },
    purpose: { en: "Defines exactly what may cross into the defence domain during a crisis, and what may never cross.", tr: "Kriz sırasında savunma alanına tam olarak neyin geçebileceğini ve neyin asla geçemeyeceğini tanımlar." },
    sections: [
      { h: { en: "1. Principle", tr: "1. İlke" }, p: [
        { en: "The defence channel receives situational awareness, not surveillance. No personal data, no imagery, no audio, no identifiers and no free text may cross the cross-domain boundary. This is a legal requirement (GDPR Art. 44, KVKK Art. 9) and a security requirement, because a defence network cannot enforce GDPR afterwards.", tr: "Savunma kanalı gözetim değil durumsal farkındalık alır. Kişisel veri, görüntü, ses, tanımlayıcı ve serbest metin çapraz alan sınırını geçemez. Bu hem hukuki (GDPR Md. 44, KVKK Md. 9) hem de güvenlik gereğidir; çünkü savunma ağı sonradan GDPR'ı uygulayamaz." }
      ]},
      { h: { en: "2. Permitted payload", tr: "2. İzin verilen yük" }, list: [
        { en: "Event class counts per coarse zone and per hour (fire, smoke, weapon-like sound, crowd density band, structural alarm).", tr: "Kaba bölge ve saat başına olay sınıfı sayımları (yangın, duman, silah benzeri ses, kalabalık yoğunluk bandı, yapısal alarm)." },
        { en: "Infrastructure health: node online/offline, power state, communication status, sensor faults.", tr: "Altyapı sağlığı: düğüm çevrimiçi/çevrimdışı, güç durumu, iletişim durumu, sensör arızaları." },
        { en: "Aggregate trend indicators with k-anonymity ≥10 and a minimum 15-minute time bucket.", tr: "k-anonimlik ≥10 ve en az 15 dakikalık zaman kovasıyla toplu eğilim göstergeleri." },
        { en: "Classification labels and handling caveats as required by STANAG 4774/4778.", tr: "STANAG 4774/4778'in gerektirdiği sınıflandırma etiketleri ve kullanım uyarıları." }
      ]},
      { h: { en: "3. Prohibited payload", tr: "3. Yasak yük" }, list: [
        { en: "Any image, frame, thumbnail, embedding or model output that could depict or identify a person.", tr: "Bir kişiyi betimleyebilecek veya tanımlayabilecek herhangi bir görüntü, kare, küçük resim, gömme vektörü veya model çıktısı." },
        { en: "Precise coordinates, addresses, camera identifiers or anything that permits re-identification of a location's visitors.", tr: "Hassas koordinatlar, adresler, kamera tanımlayıcıları veya bir konumun ziyaretçilerinin yeniden kimliklendirilmesine izin veren her şey." },
        { en: "Personal data of operators, citizens or municipal staff, including in error logs.", tr: "Operatörlerin, vatandaşların veya belediye personelinin kişisel verileri, hata günlüklerinde dahi." },
        { en: "Any executable content, script, macro or attachment.", tr: "Herhangi bir çalıştırılabilir içerik, betik, makro veya ek." }
      ]},
      { h: { en: "4. Technical and human controls", tr: "4. Teknik ve insani kontroller" }, p: [
        { en: "The path is a hardware-enforced one-way diode with a protocol break. The sending service validates every message against an allowlist schema and rejects unknown fields. Automated PII canaries (synthetic identifiers, coordinate patterns, name-like strings) run on every exported payload and fail closed. A human release officer approves each crisis-time activation, and the recipient confirms receipt and classification handling.", tr: "Yol, protokol kırılmalı donanımsal tek yönlü bir diyottur. Gönderen servis her mesajı beyaz liste şemasına göre doğrular ve bilinmeyen alanları reddeder. Otomatik kişisel veri kanaryaları (sentetik tanımlayıcılar, koordinat desenleri, isim benzeri dizeler) her ihraç yükünde çalışır ve kapalı yönde başarısız olur. İnsan çıkış sorumlusu her kriz aktivasyonunu onaylar ve alıcı teslim ile sınıflandırma işleyişini teyit eder." },
        { en: "Quarterly, a sample of exported payloads is reviewed jointly with the municipal DPO and the defence counterpart. Any personal data found is treated as a personal data breach regardless of volume, and the connector is stopped until the root cause is fixed and the conformance suite passes again.", tr: "Üç ayda bir, ihraç edilen yüklerin bir örneği belediye DPO'su ve savunma muhatabıyla birlikte incelenir. Bulunan herhangi bir kişisel veri, hacmi ne olursa olsun kişisel veri ihlali olarak ele alınır ve kök neden düzeltilip uygunluk seti yeniden geçene kadar bağlayıcı durdurulur." }
      ]}
    ]
  },
  {
    id: "CH-01", code: "LS-SP-CH-01", owner: "CEO", version: "1.0", approval: "CEO", review: "Annual",
    title: { en: "CISO Charter (SAFE-PARKS)", tr: "CISO Tüzüğü (SAFE-PARKS)" },
    purpose: { en: "Formal delegation of authority, independence and accountability for the CISO function on SAFE-PARKS.", tr: "SAFE-PARKS'ta CISO fonksiyonu için yetki, bağımsızlık ve hesap verebilirliğin resmî devri." },
    sections: [
      { h: { en: "1. Appointment and independence", tr: "1. Atama ve bağımsızlık" }, p: [
        { en: "The CISO is appointed by the CEO of Lotus Sirius and is a member of the SAFE-PARKS management team. The CISO has direct access to the CEO, to the coordinator and to the EPAB, and cannot be instructed to suppress a security finding, a risk or an incident. Performance is assessed on the security objectives in the mandate, not on delivery speed.", tr: "CISO, Lotus Sirius CEO'su tarafından atanır ve SAFE-PARKS yönetim ekibinin üyesidir. CISO; CEO'ya, koordinatöre ve EPAB'a doğrudan erişime sahiptir ve bir güvenlik bulgusunu, riskini veya olayını bastırması için talimat verilemez. Performansı teslimat hızına göre değil, yetki belgesindeki güvenlik hedeflerine göre değerlendirilir." }
      ]},
      { h: { en: "2. Authority", tr: "2. Yetki" }, list: [
        { en: "Veto any release, pilot go-live or data-sharing arrangement with unresolved critical or high findings.", tr: "Çözülmemiş kritik veya yüksek bulgusu olan her sürüm, pilot canlıya geçiş veya veri paylaşım düzenlemesini veto etme." },
        { en: "Declare Sev-1/2 incidents and direct containment across partners without prior approval.", tr: "Sev-1/2 olaylarını ilan etme ve ön onay olmadan ortaklar arasında kontrolü yönlendirme." },
        { en: "Approve cryptographic algorithms, key management procedures and any deviation from this policy.", tr: "Kriptografik algoritmaları, anahtar yönetimi prosedürlerini ve bu politikadan her sapmayı onaylama." },
        { en: "Require evidence from any partner or supplier and exercise audit rights.", tr: "Her ortaktan veya tedarikçiden kanıt isteme ve denetim haklarını kullanma." },
        { en: "Control the WP3 assurance budget lines (penetration tests, audits, certification).", tr: "WP3 güvence bütçe kalemlerini (sızma testleri, denetimler, belgelendirme) kontrol etme." },
        { en: "Escalate directly to the EPAB where privacy, ethics or fundamental rights are at stake.", tr: "Gizlilik, etik veya temel haklar söz konusu olduğunda doğrudan EPAB'a escalate etme." }
      ]},
      { h: { en: "3. Accountability and limits", tr: "3. Hesap verebilirlik ve sınırlar" }, p: [
        { en: "The CISO is accountable for the accuracy of the risk register, the completeness of the compliance evidence, the timeliness of notifications, and the honesty of reporting. The CISO is not the data protection officer and does not decide lawfulness; that decision belongs to the DPO and the municipality as controller. The CISO must document disagreement when the DPO's advice and the technical plan diverge, and the disagreement is reported to the EPAB.", tr: "CISO; risk kaydının doğruluğundan, uyum kanıtlarının bütünlüğünden, bildirimlerin zamanında yapılmasından ve raporlamanın dürüstlüğünden hesap verir. CISO veri koruma görevlisi değildir ve hukuka uygunluğa karar vermez; bu karar DPO'ya ve veri sorumlusu olarak belediyeye aittir. DPO görüşü ile teknik plan ayrıştığında CISO anlaşmazlığı belgelemeli ve anlaşmazlık EPAB'a bildirilmelidir." },
        { en: "The CISO may accept residual risk up to the defined tolerance. Above tolerance, only the CEO may accept, in writing, with a date and compensating controls. Acceptance does not transfer legal responsibility to the CISO.", tr: "CISO, tanımlı toleransa kadar artık riski kabul edebilir. Tolerans üstünde yalnızca CEO, tarih ve telafi edici kontrollerle yazılı olarak kabul edebilir. Kabul, hukuki sorumluluğu CISO'ya aktarmaz." }
      ]},
      { h: { en: "4. Review", tr: "4. Gözden geçirme" }, p: [
        { en: "This charter is reviewed annually and whenever the CISO role changes hands. Any restriction of the authority listed above must be a written CEO decision communicated to the coordinator and the EPAB within five working days, and is recorded in the project risk register as a governance risk.", tr: "Bu tüzük yılda bir ve CISO rolü el değiştirdiğinde gözden geçirilir. Yukarıda listelenen yetkilerin herhangi bir kısıtlanması, beş iş günü içinde koordinatör ve EPAB'a bildirilen yazılı bir CEO kararı olmalı ve proje risk kaydına yönetişim riski olarak işlenmelidir." }
      ]}
    ]
  }
];

SP.docs = SP.docs.concat(SP.docs2);
