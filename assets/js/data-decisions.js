/* SAFE-PARKS CISO Portal — decisions requested from the CEO and the consortium steering committee.
   One source for the portal's governance view, the two-page brief and the Excel/Word decision table.
   Status lives in portal state (`decisions: { D1: "approved", ... }`) and defaults to "pending". */
window.SP = window.SP || {};

SP.decisions = [
  {
    id: "D1",
    t: { en: "Sign the CISO charter and notify the consortium", tr: "CISO tüzüğünü imzala ve konsorsiyuma bildir" },
    detail: {
      en: "Independent veto, incident command, unfiltered reporting to coordinator and EPAB.",
      tr: "Bağımsız veto, olay komutanlığı, koordinatör ve EPAB'a filtresiz raporlama."
    },
    owner: "CEO", due: "M1"
  },
  {
    id: "D2",
    t: { en: "Approve the WP3 security budget lines", tr: "WP3 güvenlik bütçe kalemlerini onayla" },
    detail: {
      en: "Personnel €285,000 plus equipment, subcontracting (pentest, certification), travel and other — total €285,000.",
      tr: "Personel €285.000 ve ekipman, alt yüklenici (sızma testi, belgelendirme), seyahat ve diğer — toplam €285.000."
    },
    owner: "CEO", due: "M1"
  },
  {
    id: "D3",
    t: {
      en: "Adopt “no cross-border personal data” as a contractual principle",
      tr: "“Sınır ötesi kişisel veri yok” ilkesini sözleşmesel ilke olarak kabul et"
    },
    detail: {
      en: "Local processing only; EFDI exports are aggregate and non-personal.",
      tr: "Yalnızca yerel işleme; EFDI ihraçları toplu ve kişisel veri içermez."
    },
    owner: { en: "CEO + consortium", tr: "CEO + konsorsiyum" }, due: "M3"
  },
  {
    id: "D4",
    t: {
      en: "Nominate the EPAB and confirm its 20-working-day opinion cycle",
      tr: "EPAB'ı ata ve 20 iş günü görüş döngüsünü teyit et"
    },
    detail: {
      en: "Independent ethics and privacy review before each pilot wave.",
      tr: "Her pilot dalgası öncesi bağımsız etik ve gizlilik incelemesi."
    },
    owner: { en: "Consortium", tr: "Konsorsiyum" }, due: "M4"
  },
  {
    id: "D5",
    t: { en: "Approve the assurance calendar", tr: "Güvence takvimini onayla" },
    detail: {
      en: "Penetration test before field data exists; ISO 27001 Stage 1 at M10, Stage 2 at M12.",
      tr: "Sahada veri oluşmadan sızma testi; ISO 27001 Aşama 1 M10, Aşama 2 M12."
    },
    owner: "CEO", due: "M6"
  },
  {
    id: "D6",
    t: { en: "Confirm the residual-risk acceptance route", tr: "Artık risk kabul yolunu teyit et" },
    detail: {
      en: "Any risk above tolerance is signed by the CEO with an expiry date. Nothing is submitted for acceptance today.",
      tr: "Tolerans üstü her risk, son kullanma tarihiyle CEO tarafından imzalanır. Bugün kabul için sunulan kalem yok."
    },
    owner: "CEO", due: "M1"
  }
];
