import type { SupportedLanguage } from "@/content/homeLocalizationStatic";
import { productLongDescriptions } from "@/content/homeProductDetails";

type ProductItem = {
  title: string;
  category: string;
  image?: string;
  imageFit?: string;
  imagePosition?: string;
  imageClassName?: string;
  detailImages?: string[];
  video?: string;
  videoType?: string;
  detailLabel?: string;
  summary: string;
  outcome: string;
  detailBody?: string[];
  tags: string[];
  url?: string;
  linkLabel?: string;
  confidential?: boolean;
};

type CaseStudyItem = {
  brand: string;
  result: string;
  url: string;
};

type ToolClusterItem = {
  title: string;
  tools: string[];
  image?: string;
};

type CertificationItem = {
  title: string;
  issuer: string;
  date: string;
  image: string;
};

type EducationItem = {
  degree: string;
  school: string;
  period: string;
  location: string;
  logo?: string;
};

type SpeakingItem = {
  title: string;
  org: string;
  detail: string;
  logo: string;
  url: string;
};

type VideoItem = {
  title: string;
  url: string;
  image?: string;
};

function localizeCollection<T extends Record<string, unknown>>(
  items: T[],
  language: SupportedLanguage,
  lookup: Record<string, Partial<T>>,
  getKey: (item: T) => string
) {
  if (language === "en") {
    return items;
  }

  return items.map(item => {
    const override = lookup[getKey(item)];
    return override ? ({ ...item, ...override } as T) : item;
  });
}

const deProducts: Record<string, Partial<ProductItem>> = {
  "GEO & SEO Optimizer": {
    category: "Generative Engine Optimization",
    summary:
      "KI-gestützter GEO-Workflow zur Analyse der Markensichtbarkeit in Antwortmaschinen, zur Identifikation von Prompt-Lücken und zur Ableitung konkreter Optimierungsmaßnahmen.",
    outcome:
      "+34 pp KI-Sichtbarkeit, +43 Brand-Entity-Match-Score, +26 pp Traffic-Uplift und +4 pp Deckungsbeitrag.",
    detailBody: [
      "SITUATION — Marken fehlte eine strukturierte Methode, ihre Sichtbarkeit in LLM-Antworten zu diagnostizieren und Prompt-Lücken in Maßnahmen zu übersetzen.",
      "TASK & ACTION — Aufbau eines wiederholbaren GEO/LLMO-Workspace mit acht Werkzeugen für Brand Entities, Crawler-Simulation, Query Fan-Out, Prompt Research, Landingpages, Content-Erstellung, Content Checks und Benchmarking. Der Stack kombiniert OpenAI / OpenRouter, Express, React, Supabase, JWT, Rate Limiting und Zod.",
      "RESULT — +34 pp KI-Sichtbarkeit, +43 Brand-Entity-Match-Score, +26 pp Traffic-Uplift und +4 pp Deckungsbeitrag.",
    ],
  },
  "DIGITAL GROWTH ENGINE": {
    category: "KI-gestütztes Growth Operating System",
    detailLabel: "Details öffnen",
    summary:
      "Interne SaaS-Plattform für Growth-Leads, um Kampagnenperformance, Unit Economics, Forecasting, Experimentation und Budgetallokation in einem entscheidungsreifen Workspace zu steuern.",
    outcome:
      "Vereint Kampagnensteuerung, finanzielle Disziplin und Experimentier-Workflows in einer managementtauglichen Operating Layer für schnellere Wachstumsentscheidungen.",
    detailBody: [
      "DIGITAL GROWTH ENGINE ist ein KI-gestütztes internes SaaS-Produkt, das Growth- und Performance-Teams mehr Klarheit, Geschwindigkeit und finanzielle Disziplin in der Steuerung gibt. Mit Codex entwickelt, vereint die Plattform Kampagnenmanagement, Produktökonomie, Audience Tracking, Incrementality Testing, Forecasting, OPEX/CAPEX-Planung und Budgetallokation in einer einzigen Arbeitsumgebung.",
      "Statt mit voneinander getrennten Spreadsheets, Dashboards und Exporten aus Werbeplattformen zu arbeiten, können Growth-Teams damit bewerten, was tatsächlich profitables Wachstum treibt. Die Plattform unterstützt zentrale Kennzahlen wie CAC, ROAS, LTV, LTV:CAC, Deckungsbeitrag, allowable CAC, geschätzten Nettogewinn und inkrementellen Beitrag und bringt Teams vom passiven Reporting zur aktiven Steuerung.",
      "Besonders wertvoll ist sie für Teams, die schnell Antworten auf geschäftskritische Fragen brauchen: Welche Kampagnen sollten skaliert, welche pausiert, welche Tests als wirklich inkrementell gewertet und wie Budgets über Kanäle und Initiativen neu verteilt werden sollen. Das Ergebnis ist ein strukturierter, managementreifer Growth-Workflow, der Performance-Daten in konkrete Maßnahmen übersetzt.",
      "RESULT — Im zugehörigen Rollen-Scope wurden +35 % Sell-out-Wachstum, +14 pp Deckungsbeitrag und +36 % blended ROAS berichtet.",
    ],
    tags: [
      "Growth Analytics",
      "Performance Marketing",
      "Forecasting",
      "Experimentation",
      "Budgetallokation",
    ],
  },
  "AI-swers": {
    category: "KI-gestützte Multi-Model-Video-Engine",
    linkLabel: "Zum Kanal",
    summary:
      "Automatisiertes KI-Video-System, das mehrere Modelle orchestriert, um dynamische Debattenvideos zu erzeugen.",
    outcome:
      "Nutzer geben eine einzige Frage ein; das System verteilt sie an KI-Agenten, erzeugt filmische Videos passend zu den Antworten, ergänzt individuelle Voiceovers für jeden KI-Modell-Charakter und erstellt ein Thumbnail-Bild mit SEO-optimiertem YouTube-Titel, Beschreibung und Tags für den Upload-Prozess.",
    detailBody: [
      "SITUATION — Multi-Model-Vergleichscontent erforderte jede Woche wiederkehrende Generierung und Postproduktion.",
      "TASK & ACTION — Aufbau einer wiederholbaren Content Engine, die eine Frage an ChatGPT, Claude, Gemini, DeepSeek, Llama und Grok verteilt und anschließend Narration, filmische Szenen, FFmpeg-Komposition, Untertitel, Thumbnails und SEO-fertige YouTube-Metadaten orchestriert.",
      "RESULT — Der Kanal erreichte 10,3 Tsd. Abonnenten und 102 veröffentlichte Videos; live verifiziert am 23. August 2026.",
    ],
    tags: [
      "KI-Videogenerierung",
      "Multi-Agenten-Systeme",
      "Content-Automation",
      "Voice-Synthese",
      "Social-Media-Content",
      "Codex",
      "OpenAI API",
      "Sora",
      "Youtube",
      "DeepSeek",
      "Llama",
      "Grok",
      "Claude",
      "Gemini",
      "ChatGPT",
    ],
  },
  "Bluff Room": {
    category: "Mobiles Social-Deduction-Game",
    summary:
      "Multiplayer-Partyspiel für Freundesgruppen mit geheimen Rollen, Hinweisrunden und Gruppenabstimmungen.",
    outcome:
      "Spieler erstellen oder betreten Räume, erhalten Insider-, Outsider- oder Chaos-Rollen und punkten durch Bluffen, Deduktion und Überleben.",
    tags: ["iOS", "Multiplayer", "Social Deduction", "Partyspiel"],
  },
  "Gamebook AI": {
    category: "Vibe Coding / Generatives Storytelling",
    summary:
      "Interaktive Gamebook-Plattform, in der Nutzer selbst zu Figuren in KI-generierten Story-Welten mit Bild und Audio werden.",
    outcome:
      "Als multimodales Creator-Economy-Konzept mit verzweigter Narrative-Logik, Bildgenerierung und immersiven Audio-Layern entwickelt.",
    tags: ["LLM-Storytelling", "Bildgenerierung", "Personalisierung"],
  },
  "DIGITAL CARBON FOOTPRINT SCORE": {
    category: "Mobiles Sustainability-Produkt",
    summary:
      "iOS-Anwendung, die Konsumenten dabei hilft, CO2-Fußabdruck-Signale und Nachhaltigkeits-Trade-offs verständlich zu bewerten.",
    outcome:
      "Nachhaltigkeits-Scoring in eine leicht verständliche, verbraucherfreundliche Mobile Experience mit intelligenter Analyse übersetzt.",
    tags: ["iOS", "Nachhaltigkeitsintelligenz", "Consumer UX"],
  },
  "360 Real Estate Suite": {
    category: "KI-gestützte PropTech-SaaS",
    summary:
      "Property-Intelligence-Plattform für Virtual Staging, Listing-Workflows, operatives Management und immersive Präsentation.",
    outcome:
      "KI-basiertes Staging und Property Operations in einer einzigen Plattform vereint statt fragmentierter Immobilien-Tools.",
    tags: ["PropTech", "Virtual Staging", "Workflow-System"],
  },
  "See The Impact": {
    category: "ESG-Datenplattform",
    summary:
      "Sustainability-Intelligence-Plattform, die Marken und Produkte über Umwelt-Insights bewertbar macht.",
    outcome:
      "Als verbrauchernahe ESG-Transparenzoberfläche mit Scoring-, Vergleichs- und Bildungsfunktionen positioniert.",
    tags: ["ESG", "Consumer Product", "Scoring Engine"],
  },
  AdaptifAI: {
    category: "Content-Lokalisierung & Resizing",
    summary:
      "OCR- und GenAI-gestützter Lokalisierungsworkflow, der Marketing-Assets über Sprachen, Kanäle und Formate hinweg skaliert anpasst.",
    outcome:
      "Multilinguale Kreativadaption in einem kontrollierten Workflow gebündelt; der professionelle Einsatz berichtete -5 % OPEX, +60 % CTR und +25 % CVR.",
    detailBody: [
      "SITUATION — Manuelle multilinguale Asset-Adaption war langsam, kostenintensiv und über Sprachen, Kanäle und Formate hinweg inkonsistent.",
      "TASK & ACTION — Aufbau eines kontrollierten Workflows für 10 Sprachen und sechs Placement-Familien mit Next.js, FastAPI, EasyOCR + TrOCR, GPT-4o, Stable Diffusion und OpenCV. OCR-Filterung, Übersetzung, Inpainting, Safe-Zone-Previews und editierbarer Export sichern den Markenkontext bei skalierter Produktion.",
      "RESULT — Im in Portfolio und Lebensläufen dokumentierten professionellen Einsatz wurden -5 % OPEX, +60 % CTR und +25 % CVR erzielt.",
    ],
    tags: ["OCR", "Creative Localization", "Automation"],
  },
  "Amazon Re-Pricing & Market Pricing Tracking": {
    category: "Marketplace Pricing & Unit Economics",
    summary:
      "Amazon-Repricing- und Marktpreis-Tracking-System, das PIM/UVP, gematchte Wettbewerbs-SKUs, Händlerpreise, Bestand, Seller, Fulfillment und Promotions mit Margen-Guardrails verbindet.",
    outcome:
      "Pricing erzielte +11 % AOV und +12 pp Buy-Box-Anteil. Das verbundene hybride Amazon-Betriebsmodell erzielte +19 % Nettogewinn, +8 pp Marge und -10 pp OPEX; diese P&L-Ergebnisse werden getrennt von den Pricing-System-Ergebnissen ausgewiesen.",
    tags: ["Pricing Intelligence", "Retail Analytics", "Decision Support"],
  },
  "Omnichannel Funnel Tracking": {
    category: "Omnichannel Funnel Tracking",
    summary:
      "Power-Apps- / Power-Automate-gestützter Omnichannel-Workflow zur Reduktion repetitiver Arbeit und fragmentierter Entscheidungen.",
    outcome:
      "+12 pp Conversion Rate, +25 % Omnichannel Completion und -70 % OPEX gegenüber dem gedruckten Prozess.",
    tags: ["Power Apps", "NFC Journey", "Customer Journey Mapping"],
  },
  "CLV Based AI-Driven Visit Plan and Reporting": {
    category: "Field-Force-Planungsintelligenz",
    summary:
      "Mobile Planungsanwendung für HCP-Außendienstteams mit CLV-basierter KI-Priorisierung, Engagement-Scoring und Echtzeit-Traffic-Insights zur Optimierung von Routen und Tagesplänen.",
    outcome:
      "+30 % Außendienstproduktivität, +35 % High-Value-Account-Coverage, +20 % Routeneffizienz und -40 % Planungszeit.",
    tags: ["Power Apps", "CLV-Priorisierung", "Außendienstoptimierung"],
  },
  "Cross-Functional Project and Task Management": {
    category: "Interne Workflow-Orchestrierung",
    summary:
      "Interne Aufgaben- und Workflow-Anwendung für funktionsübergreifende und abteilungsinterne Zusammenarbeit entwickelt, inspiriert von strukturierten Operating Models wie Wrike und Asana.",
    outcome:
      "Schnellere funktionsübergreifende Umsetzung, standardisierte Workflows sowie weniger Koordination und manueller Aufwand.",
    tags: ["Power Apps", "Workflow-Automation", "Task Management"],
  },
  "Executive Reporting and Forecast": {
    category: "Executive Analytics & Forecasting",
    summary:
      "Prädiktive Analytics-Dashboards entwickelt, die Sell-out-Signale, Saisonalität und Sales-Trends kombinieren, um Forecasting und Bestandssteuerung zu unterstützen.",
    outcome:
      "Echtzeit-Commercial-Visibility, schnelleres Forecasting und Entscheiden sowie einheitliches Sales-, Stock- und Performance-Reporting.",
    tags: ["Power BI", "Forecasting", "Executive Dashboard"],
  },
  "Auto-Invoice OCR": {
    category: "Finance Process Automation",
    summary:
      "Power-Automate-Workflow aufgebaut, der Rechnungsdaten per OCR aus E-Mail-Anhängen extrahiert und validierte Informationen in einem einzigen operativen Dokument bündelt.",
    outcome:
      "-70 % manueller Bearbeitungsaufwand, -50 % Bearbeitungszeit, +25 % Datenqualität und 100 % Nachverfolgbarkeit.",
    tags: ["Power Automate", "OCR", "Back-Office-Automation"],
  },
  "BIODERMA PTA Challenge Web Application": {
    category: "Pharmacy Sales Activation",
    summary:
      "Apotheken-Challenge-Anwendung entwickelt, in der Kassenbons gescannt, BIODERMA-Produkte per OCR extrahiert und Mengen sowie Preise Teilnehmerkonten zugeordnet werden.",
    outcome:
      "Transparente, leaderboard-basierte Incentive-Programme für Apothekenteams ermöglicht und Kampagnentracking für reward-basierte Sales Activations vereinfacht.",
    tags: ["Power Apps", "OCR-Validierung", "Sales Activation"],
  },
};
const trProducts: Record<string, Partial<ProductItem>> = {
  "GEO & SEO Optimizer": {
    category: "Generative Engine Optimization",
    summary:
      "Markaların cevap motorlarındaki görünürlüğünü analiz eden, prompt düzeyindeki boşlukları belirleyen ve arama niyetini optimizasyon aksiyonlarına dönüştüren AI destekli GEO workflow'u.",
    outcome:
      "+34pp AI görünürlüğü, +43 marka varlığı eşleşme skoru, +26pp trafik artışı ve +4pp katkı marjı.",
    detailBody: [
      "SITUATION — Markaların LLM cevaplarındaki görünürlüğünü teşhis etmek ve prompt düzeyindeki boşlukları aksiyona çevirmek için yapılandırılmış bir yöntemi yoktu.",
      "TASK & ACTION — Brand entity, crawler simulation, query fan-out, prompt research, landing page, içerik üretimi, content check ve benchmark fonksiyonlarını kapsayan sekiz araçlı, tekrarlanabilir bir GEO/LLMO workspace'i geliştirildi. Stack; OpenAI / OpenRouter, Express, React, Supabase, JWT, rate limiting ve Zod'u birleştirir.",
      "RESULT — +34pp AI görünürlüğü, +43 marka varlığı eşleşme skoru, +26pp trafik artışı ve +4pp katkı marjı.",
    ],
  },
  "DIGITAL GROWTH ENGINE": {
    category: "Yapay Zeka Destekli Büyüme İşletim Sistemi",
    detailLabel: "Detayı Aç",
    summary:
      "Büyüme liderlerinin kampanya performansı, birim ekonomisi, forecasting, deney yönetimi ve bütçe dağılımını tek bir karar odaklı çalışma alanında yönetmesi için geliştirilen iç SaaS platformu.",
    outcome:
      "Kampanya yönetimi, finansal disiplin ve deney workflow'larını tek bir yönetici hazır operating layer içinde birleştirerek daha hızlı büyüme kararları alınmasını sağlar.",
    detailBody: [
      "DIGITAL GROWTH ENGINE, growth ve performance ekiplerinin daha fazla netlik, hız ve finansal disiplinle çalışmasına yardımcı olmak için tasarlanmış yapay zeka destekli bir iç SaaS ürünüdür. Codex ile geliştirilen platform; kampanya yönetimi, ürün ekonomisi, audience takibi, incrementality testleri, forecasting, OPEX/CAPEX planlaması ve bütçe dağılımını tek bir operasyon ortamında bir araya getirir.",
      "Birbirinden kopuk spreadsheet'ler, dashboard'lar ve reklam platformu export'larına dayanmak yerine, growth ekipleri DIGITAL GROWTH ENGINE ile gerçekten karlı büyümeyi neyin tetiklediğini değerlendirebilir. Platform CAC, ROAS, LTV, LTV:CAC, katkı marjı, allowable CAC, tahmini net kar ve incremental contribution gibi temel ticari metrikleri destekleyerek ekipleri pasif raporlamadan aktif karar almaya taşır.",
      "Özellikle şu sorulara hızlı yanıt verilmesi gereken senaryolarda değerlidir: Hangi kampanyalar ölçeklenmeli, hangileri durdurulmalı, hangi testler gerçekten incremental etki yarattı ve bütçe kanal ve inisiyatifler arasında nasıl yeniden dağıtılmalı? Sonuç, performans verisini aksiyona dönüştüren daha yapılandırılmış ve yöneticiye hazır bir growth workflow'udur.",
      "RESULT — İlgili rol kapsamında +%35 sell-out büyümesi, +14pp katkı marjı ve +%36 blended ROAS iyileşmesi raporlandı.",
    ],
    tags: [
      "Büyüme analitiği",
      "Performans pazarlaması",
      "Forecasting",
      "Deney yönetimi",
      "Bütçe dağılımı",
    ],
  },
  "AI-swers": {
    category: "Yapay Zeka Destekli Çoklu Model Video Üretim Motoru",
    linkLabel: "Kanala Git",
    summary:
      "Dinamik tartışma formatlı videolar üretmek için birden fazla yapay zeka modelini orkestre eden otomatik AI video içerik sistemi.",
    outcome:
      "Tek bir soru girilir; sistem bunu AI agent'lar arasında dağıtır, cevaplarla ilişkili sinematik videolar üretir, her AI model karakteri için özgün seslendirmeler ekler ve yükleme sürecinde kullanılmak üzere SEO optimize edilmiş YouTube başlığı, açıklaması ve tag'leriyle birlikte bir thumbnail görseli oluşturur.",
    detailBody: [
      "SITUATION — Çoklu model karşılaştırma içerikleri her hafta tekrarlayan üretim ve post-production çalışması gerektiriyordu.",
      "TASK & ACTION — Tek soruyu ChatGPT, Claude, Gemini, DeepSeek, Llama ve Grok'a yönlendiren; ardından anlatım, sinematik sahneler, FFmpeg kompozisyonu, altyazı, thumbnail ve SEO uyumlu YouTube metadata'sını orkestre eden tekrarlanabilir bir içerik motoru geliştirildi.",
      "RESULT — Kanal 10,3 bin aboneye ve 102 yayındaki videoya ulaştı; 23 Ağustos 2026 tarihinde canlı olarak doğrulandı.",
    ],
    tags: [
      "AI video üretimi",
      "Çoklu agent sistemleri",
      "İçerik otomasyonu",
      "Ses sentezi",
      "Sosyal medya içeriği",
      "Codex",
      "OpenAI API",
      "Sora",
      "Youtube",
      "DeepSeek",
      "Llama",
      "Grok",
      "Claude",
      "Gemini",
      "ChatGPT",
    ],
  },
  "Bluff Room": {
    category: "Mobil sosyal çıkarım oyunu",
    summary:
      "Arkadaş grupları için gizli roller, ipucu turları ve grup oylaması etrafında tasarlanmış çok oyunculu parti oyunu.",
    outcome:
      "Oyuncular oda kurar veya katılır, Insider, Outsider ya da Chaos rollerini alır; bluffing, dedüksiyon ve hayatta kalma üzerinden puan toplar.",
    tags: ["iOS", "Çok oyunculu", "Sosyal çıkarım", "Parti oyunu"],
  },
  "Gamebook AI": {
    category: "Vibe coding / Üretken hikaye anlatımı",
    summary:
      "Kullanıcıların görsel ve ses katmanlarıyla AI tarafından üretilen hikaye dünyalarının karakterine dönüştüğü interaktif gamebook üretim platformu.",
    outcome:
      "Dallanıp budaklanan anlatı mantığı, görsel üretimi ve immersif ses katmanlarıyla multimodal bir creator economy konsepti olarak geliştirildi.",
    tags: ["LLM hikaye anlatımı", "Görsel üretimi", "Kişiselleştirme"],
  },
  "DIGITAL CARBON FOOTPRINT SCORE": {
    category: "Mobil sürdürülebilirlik ürünü",
    summary:
      "Tüketicilerin karbon ayak izi sinyallerini ve sürdürülebilirlik trade-off'larını anlamasına yardımcı olan iOS uygulaması.",
    outcome:
      "Sürdürülebilirlik skorlamasını akıllı analizle desteklenen hafif ve kullanıcı dostu bir mobil deneyime dönüştürdü.",
    tags: ["iOS", "Sürdürülebilirlik zekası", "Consumer UX"],
  },
  "360 Real Estate Suite": {
    category: "Yapay zeka destekli PropTech SaaS",
    summary:
      "Sanal staging, listing workflow'ları, operasyonel yönetim ve immersif sunum için geliştirilmiş property intelligence platformu.",
    outcome:
      "Parçalı gayrimenkul araçları yerine AI staging ve property operations süreçlerini tek platformda birleştirdi.",
    tags: ["PropTech", "Sanal staging", "Workflow sistemi"],
  },
  "See The Impact": {
    category: "ESG veri platformu",
    summary:
      "Kullanıcıların markaları ve ürünleri çevresel insight katmanları üzerinden değerlendirmesine yardımcı olan sürdürülebilirlik zekası platformu.",
    outcome:
      "Skorlama, karşılaştırma ve eğitim özelliklerine sahip kullanıcı odaklı bir ESG şeffaflık arayüzü olarak konumlandı.",
    tags: ["ESG", "Tüketici ürünü", "Skorlama motoru"],
  },
  AdaptifAI: {
    category: "İçerik Lokalizasyonu & Resizing",
    summary:
      "Pazarlama asset'lerini dil, kanal ve kampanya formatları arasında ölçekli biçimde uyarlamak için geliştirilen OCR ve GenAI destekli lokalizasyon workflow'u.",
    outcome:
      "Çok dilli kreatif adaptasyonu tek bir kontrollü workflow'da topladı; profesyonel kullanım senaryosunda -%5 OPEX, +%60 CTR ve +%25 CVR raporlandı.",
    detailBody: [
      "SITUATION — Manuel çok dilli asset adaptasyonu; diller, kanallar ve placement formatları arasında yavaş, maliyetli ve tutarsızdı.",
      "TASK & ACTION — Next.js, FastAPI, EasyOCR + TrOCR, GPT-4o, Stable Diffusion ve OpenCV ile 10 dil ve altı placement ailesi için kontrollü bir workflow geliştirildi. OCR filtreleme, çeviri, inpainting, safe-zone preview ve düzenlenebilir export ile marka bağlamı korunarak üretim ölçeklendirildi.",
      "RESULT — Portföy ve CV'lerde belgelenen profesyonel kullanımda -%5 OPEX, +%60 CTR ve +%25 CVR elde edildi.",
    ],
    tags: ["OCR", "Kreatif lokalizasyon", "Otomasyon"],
  },
  "Amazon Re-Pricing & Market Pricing Tracking": {
    category: "Marketplace Fiyatlama ve Birim Ekonomisi",
    summary:
      "PIM/MSRP, eşleştirilmiş rakip SKU'ları, retailer fiyatları, stok, seller, fulfillment ve promosyon sinyallerini marj guardrail'leriyle birleştiren Amazon re-pricing ve pazar fiyatı takip sistemi.",
    outcome:
      "Fiyatlama +%11 AOV ve +12pp Buy Box payı sağladı. İlgili hibrit Amazon işletim modeli +%19 net kâr, +8pp marj ve -10pp OPEX sağladı; bu P&L sonuçları fiyatlama sistemi çıktılarından ayrı raporlanmaktadır.",
    tags: ["Fiyatlama zekası", "Perakende analitiği", "Karar desteği"],
  },
  "Omnichannel Funnel Tracking": {
    category: "Omnichannel Funnel Takibi",
    summary:
      "Tekrarlayan işleri ve parçalı kararları azaltmak üzere Power Apps / Power Automate destekli omnichannel workflow geliştirildi.",
    outcome:
      "+12pp conversion rate, +%25 omnichannel completion ve basılı sürece kıyasla -%70 OPEX.",
    tags: ["Power Apps", "NFC yolculuğu", "Müşteri yolculuğu haritalama"],
  },
  "CLV Based AI-Driven Visit Plan and Reporting": {
    category: "Saha ekipleri planlama zekası",
    summary:
      "HCP saha ekipleri için CLV tabanlı AI önceliklendirmesi, engagement scoring ve gerçek zamanlı trafik içgörüleri kullanan mobil ziyaret planlama aracı geliştirildi.",
    outcome:
      "+%30 saha verimliliği, +%35 yüksek değerli hesap kapsamı, +%20 rota verimliliği ve -%40 planlama süresi.",
    tags: ["Power Apps", "CLV önceliklendirme", "Saha optimizasyonu"],
  },
  "Cross-Functional Project and Task Management": {
    category: "İç workflow orkestrasyonu",
    summary:
      "Wrike ve Asana gibi araçlardaki yapılandırılmış operating model yaklaşımından esinlenen, departman içi ve çapraz fonksiyonel iş birliği için iç görev ve workflow uygulaması tasarlandı.",
    outcome:
      "Daha hızlı çapraz fonksiyonlu execution, standartlaştırılmış workflow'lar ve daha az koordinasyon ile manuel efor.",
    tags: ["Power Apps", "Workflow otomasyonu", "Görev yönetimi"],
  },
  "Executive Reporting and Forecast": {
    category: "Yönetici analitiği ve forecasting",
    summary:
      "Sell-out sinyalleri, mevsimsellik desenleri ve satış trendlerini birleştiren predictive analytics dashboard'ları geliştirilerek forecasting ve stok yönetimi desteklendi.",
    outcome:
      "Gerçek zamanlı ticari görünürlük, daha hızlı forecasting ve karar alma ile birleşik satış, stok ve performans raporlaması.",
    tags: ["Power BI", "Forecasting", "Yönetici dashboard'u"],
  },
  "Auto-Invoice OCR": {
    category: "Finans süreç otomasyonu",
    summary:
      "Gelen e-posta eklerindeki fatura bilgilerini OCR ile çıkaran ve doğrulanan veriyi tek bir operasyon dokümanında toplayan Power Automate workflow'u geliştirildi.",
    outcome:
      "-%70 manuel işlem eforu, -%50 işlem süresi, +%25 veri doğruluğu ve %100 izlenebilirlik.",
    tags: ["Power Automate", "OCR", "Back-office otomasyonu"],
  },
  "BIODERMA PTA Challenge Web Application": {
    category: "Eczane satış aktivasyonu",
    summary:
      "Kasa fişlerinin tarandığı, BIODERMA ürünlerinin OCR ile çıkarıldığı ve satış adetleri ile fiyatların katılımcı hesaplarına işlendiği eczane challenge uygulaması geliştirildi.",
    outcome:
      "Eczane ekipleri için şeffaf leaderboard tabanlı teşvik programlarını mümkün kıldı ve ödül bazlı satış aktivasyonlarında kampanya takibini kolaylaştırdı.",
    tags: ["Power Apps", "OCR doğrulama", "Satış aktivasyonu"],
  },
};
const deCaseStudies: Record<string, Partial<CaseStudyItem>> = {
  "BIODERMA x RTB House": {
    result:
      "32 % höhere Viewability und 22 % höhere Video Completion Rate durch Deep-Learning-Personalisierung.",
  },
  "BIODERMA TR x MikMak": {
    result:
      "3,3x höhere Purchase Intent Rate und 5,6x höhere zuordenbare Umsätze durch Omnichannel-Optimierung.",
  },
  "D&R x Criteo": {
    result:
      "22 % höherer ROI durch KI-gestützte Personalisierung und predictive Retargeting.",
  },
  "idefix x Related Digital": {
    result:
      "600 % ROI durch KI-gestützte Personalisierung und Marketing-Automation.",
  },
  "idefix x Google": {
    result:
      "10 % Umsatzwachstum und 5 % niedrigere Akquisekosten durch Smart-Shopping-Automation.",
  },
  "Institut Esthederm x BYYD": {
    result:
      "75 % Neukundenakquise durch interessenbasiertes Targeting und programmatic Video Advertising.",
  },
};
const trCaseStudies: Record<string, Partial<CaseStudyItem>> = {
  "BIODERMA x RTB House": {
    result:
      "Deep-learning tabanlı kişiselleştirme ile %32 daha yüksek viewability ve %22 daha yüksek video completion rate.",
  },
  "BIODERMA TR x MikMak": {
    result:
      "Omnichannel optimizasyon ile 3.3 kat daha yüksek purchase intent rate ve 5.6 kat daha yüksek atfedilebilir satış.",
  },
  "D&R x Criteo": {
    result:
      "Yapay zeka destekli kişiselleştirme ve predictive retargeting ile %22 daha yüksek ROI.",
  },
  "idefix x Related Digital": {
    result:
      "Yapay zeka destekli kişiselleştirme ve pazarlama otomasyonu ile %600 ROI.",
  },
  "idefix x Google": {
    result:
      "Smart Shopping otomasyonu ile %10 gelir büyümesi ve %5 daha düşük kullanıcı edinim maliyeti.",
  },
  "Institut Esthederm x BYYD": {
    result:
      "İlgi alanı bazlı hedefleme ve programatik video reklamcılığı ile %75 yeni kitle kazanımı.",
  },
};
const toolClusterTitles = {
  de: {
    "Performance & retail media": "Performance & Retail Media",
    "Analytics & BI": "Analytics & BI",
    "CRM & lifecycle": "CRM & Lifecycle",
    "Enterprise automation": "Enterprise Automation",
    "AI engineering & computer vision": "KI-Engineering & Computer Vision",
    "Product engineering": "Product Engineering",
    "Data, platform & visualization": "Daten, Plattform & Visualisierung",
    "Market intelligence": "Marktintelligenz",
    "Delivery stack": "Delivery Stack",
  },
  tr: {
    "Performance & retail media": "Performans & retail media",
    "Analytics & BI": "Analitik & BI",
    "CRM & lifecycle": "CRM & lifecycle",
    "Enterprise automation": "Kurumsal otomasyon",
    "AI engineering & computer vision": "AI mühendisliği & computer vision",
    "Product engineering": "Ürün mühendisliği",
    "Data, platform & visualization": "Veri, platform & görselleştirme",
    "Market intelligence": "Pazar zekası",
    "Delivery stack": "Teslimat stack'i",
  },
} as const;
const deEducation: Record<string, Partial<EducationItem>> = {
  "Istanbul University": {
    degree: "MSc in Marketing Management",
    location: "Istanbul, Türkei",
  },
  "Istanbul Technical University": {
    degree: "BSc in Molekularbiologie & Genetik",
    location: "Istanbul, Türkei",
  },
};
const trEducation: Record<string, Partial<EducationItem>> = {
  "Istanbul University": {
    degree: "Pazarlama Yönetimi Yüksek Lisansı",
    location: "İstanbul, Türkiye",
  },
  "Istanbul Technical University": {
    degree: "Moleküler Biyoloji ve Genetik Lisansı",
    location: "İstanbul, Türkiye",
  },
};
const deSpeaking: Record<string, Partial<SpeakingItem>> = {
  "Anadolu University": {
    title: "Gastredner",
    detail: "KI, Innovation und digitale Transformation bei SAM'25.",
  },
  "18 Mart University": {
    title: "Gastredner",
    detail:
      "Sessions zu E-Commerce, Digital Marketing, internationalem Karrieremanagement und Personal Branding.",
  },
  "Istanbul Technical University": {
    title: "Mentor",
    detail:
      "Jährliche Karriere-Mentorship und Leadership-Begleitung im Rahmen des ITU-Mentorship-Programms.",
  },
};
const trSpeaking: Record<string, Partial<SpeakingItem>> = {
  "Anadolu University": {
    title: "Konuk Konuşmacı",
    detail: "SAM'25 kapsamında yapay zeka, inovasyon ve dijital dönüşüm.",
  },
  "18 Mart University": {
    title: "Konuk Konuşmacı",
    detail:
      "E-ticaret, dijital pazarlama, uluslararası kariyer yönetimi ve kişisel markalaşma oturumları.",
  },
  "Istanbul Technical University": {
    title: "Mentor",
    detail:
      "İTÜ mentorluk programı kapsamında yıllık kariyer mentorlüğü ve liderlik yönlendirmesi.",
  },
};
const deVideos: Record<string, Partial<VideoItem>> = {
  "BIODERMA Interactive Skin Stories": {
    title: "BIODERMA Interaktive Skin Stories",
  },
};
const trVideos: Record<string, Partial<VideoItem>> = {
  "BIODERMA Interactive Skin Stories": {
    title: "BIODERMA İnteraktif Skin Stories",
  },
};

const portfolioVerifiedDetailOverrides: Record<
  SupportedLanguage,
  Record<string, string[]>
> = {
  en: {
    "Tasky AI Workflow": [
      "SITUATION",
      "Cross-functional work was fragmented across messages, meetings and manual follow-ups, limiting visibility into ownership, deadlines and dependencies.",
      "TASK",
      "Reduce coordination friction safely and turn recurring collaboration into a structured operating workflow.",
      "ACTION",
      "Built a Power Apps workflow inspired by structured task-management operating models, with standardized intake, ownership, status, deadlines, dependencies, notifications and cross-team visibility.",
      "RESULT",
      "Created faster, more reliable operating workflows with clearer accountability, less manual coordination and a reusable governance layer across Marketing, Sales and Medical teams.",
    ],
    "Real-Time Executive Forecast": [
      "SITUATION",
      "Commercial and stock decisions relied on fragmented, backward-looking reporting across sell-out, seasonality, demand and campaign signals.",
      "TASK",
      "Give leadership one real-time decision surface for forecasting, stock management and scenario planning.",
      "ACTION",
      "Unified sell-out, stock, media and demand signals in Power BI with predictive forecasting, SKU/category views and executive scenario-planning dashboards.",
      "RESULT",
      "Improved planning speed, stock visibility and executive decision quality by replacing disconnected reporting with a single forward-looking commercial view.",
    ],
    "Invoice OCR Automation": [
      "SITUATION",
      "Invoice intake depended on repetitive manual reading, validation and consolidation of attachments arriving in different formats.",
      "TASK",
      "Reduce finance-process friction while preserving reliable, searchable and traceable records.",
      "ACTION",
      "Built a Power Automate workflow that detects inbound invoices, extracts fields with OCR, validates structured data and consolidates records into one operational dataset.",
      "RESULT",
      "Reduced repetitive finance administration and created a faster, more reliable and searchable invoice-intake workflow.",
    ],
  },
  de: {
    "Tasky AI Workflow": [
      "SITUATION",
      "Funktionsübergreifende Arbeit war über Nachrichten, Meetings und manuelle Follow-ups fragmentiert; Ownership, Deadlines und Abhängigkeiten waren nur begrenzt sichtbar.",
      "TASK",
      "Koordinationsaufwand sicher reduzieren und wiederkehrende Zusammenarbeit in einen strukturierten Operating Workflow überführen.",
      "ACTION",
      "Power-Apps-Workflow mit standardisiertem Intake, Ownership, Status, Deadlines, Abhängigkeiten, Benachrichtigungen und teamübergreifender Transparenz aufgebaut.",
      "RESULT",
      "Schnellere und verlässlichere Operating Workflows mit klarerer Verantwortlichkeit, weniger manueller Koordination und einer wiederverwendbaren Governance-Schicht für Marketing, Sales und Medical geschaffen.",
    ],
    "Real-Time Executive Forecast": [
      "SITUATION",
      "Commercial- und Bestandsentscheidungen basierten auf fragmentiertem, rückwärtsgerichtetem Reporting über Sell-out, Saisonalität, Nachfrage und Kampagnensignale.",
      "TASK",
      "Leadership eine Echtzeit-Entscheidungsoberfläche für Forecasting, Bestandssteuerung und Szenarioplanung geben.",
      "ACTION",
      "Sell-out-, Bestands-, Media- und Nachfragesignale in Power BI mit Predictive Forecasting, SKU-/Kategorieansichten und Executive-Szenariodashboards vereint.",
      "RESULT",
      "Planungsgeschwindigkeit, Bestandstransparenz und Qualität von Executive-Entscheidungen durch eine einheitliche, vorausschauende Commercial View verbessert.",
    ],
    "Invoice OCR Automation": [
      "SITUATION",
      "Der Rechnungseingang erforderte wiederkehrendes manuelles Lesen, Validieren und Konsolidieren unterschiedlich formatierter Anhänge.",
      "TASK",
      "Reibung im Finance-Prozess reduzieren und zugleich verlässliche, durchsuchbare und nachvollziehbare Datensätze erhalten.",
      "ACTION",
      "Power-Automate-Workflow zur Erkennung eingehender Rechnungen, OCR-Feldextraktion, Validierung strukturierter Daten und Konsolidierung in einem operativen Dataset aufgebaut.",
      "RESULT",
      "Wiederkehrende Finance-Administration reduziert und einen schnelleren, verlässlicheren und durchsuchbaren Invoice-Intake-Workflow geschaffen.",
    ],
  },
  tr: {
    "Tasky AI Workflow": [
      "SITUATION",
      "Çapraz fonksiyonlu işler mesajlar, toplantılar ve manuel takipler arasında parçalıydı; sahiplik, termin ve bağımlılık görünürlüğü sınırlıydı.",
      "TASK",
      "Koordinasyon sürtünmesini güvenli biçimde azaltmak ve tekrarlayan iş birliğini yapılandırılmış bir operating workflow'a dönüştürmek.",
      "ACTION",
      "Standart intake, sahiplik, durum, termin, bağımlılık, bildirim ve ekipler arası görünürlük içeren Power Apps workflow'u geliştirildi.",
      "RESULT",
      "Marketing, Sales ve Medical ekipleri için daha net accountability, daha az manuel koordinasyon ve tekrar kullanılabilir governance katmanıyla daha hızlı ve güvenilir operating workflow'lar oluşturuldu.",
    ],
    "Real-Time Executive Forecast": [
      "SITUATION",
      "Ticari ve stok kararları sell-out, mevsimsellik, talep ve kampanya sinyallerini parçalı ve geriye dönük biçimde raporlayan yapılara dayanıyordu.",
      "TASK",
      "Leadership'a forecasting, stok yönetimi ve senaryo planlama için tek bir gerçek zamanlı karar yüzeyi sunmak.",
      "ACTION",
      "Sell-out, stok, medya ve talep sinyalleri Power BI içinde predictive forecasting, SKU/kategori görünümleri ve executive senaryo dashboard'larıyla birleştirildi.",
      "RESULT",
      "Kopuk raporlamanın yerine ileriye dönük tek bir ticari görünüm kurularak planlama hızı, stok görünürlüğü ve executive karar kalitesi güçlendirildi.",
    ],
    "Invoice OCR Automation": [
      "SITUATION",
      "Fatura intake süreci farklı formatlardaki eklerin tekrar tekrar manuel okunmasına, doğrulanmasına ve birleştirilmesine dayanıyordu.",
      "TASK",
      "Güvenilir, aranabilir ve izlenebilir kayıtları korurken finans sürecindeki sürtünmeyi azaltmak.",
      "ACTION",
      "Gelen faturaları algılayan, alanları OCR ile çıkaran, yapılandırılmış veriyi doğrulayan ve kayıtları tek bir operasyonel dataset'te birleştiren Power Automate workflow'u geliştirildi.",
      "RESULT",
      "Tekrar eden finans yönetimi azaltıldı; daha hızlı, güvenilir ve aranabilir bir invoice-intake workflow'u oluşturuldu.",
    ],
  },
};

export function localizeProducts(
  items: ProductItem[],
  language: SupportedLanguage
) {
  const localizedItems = localizeCollection(
    items,
    language,
    language === "de" ? deProducts : trProducts,
    item => item.title
  );

  const descriptions = productLongDescriptions[language] as Partial<
    Record<string, readonly string[]>
  >;

  return localizedItems.map(item => {
    const detailBody =
      portfolioVerifiedDetailOverrides[language][item.title] ??
      descriptions[item.title];

    return {
      ...item,
      detailBody: detailBody ? [...detailBody] : item.detailBody,
    };
  });
}

export function localizeCaseStudies(
  items: CaseStudyItem[],
  language: SupportedLanguage
) {
  return localizeCollection(
    items,
    language,
    language === "de" ? deCaseStudies : trCaseStudies,
    item => item.brand
  );
}

export function localizeToolClusters(
  items: ToolClusterItem[],
  language: SupportedLanguage
) {
  if (language === "en") {
    return items;
  }

  const titles =
    language === "de" ? toolClusterTitles.de : toolClusterTitles.tr;
  return items.map(item => ({
    ...item,
    title: titles[item.title as keyof typeof titles] ?? item.title,
  }));
}

export function localizeCertifications(
  items: CertificationItem[],
  _language: SupportedLanguage
) {
  return items;
}

export function localizeEducation(
  items: EducationItem[],
  language: SupportedLanguage
) {
  return localizeCollection(
    items,
    language,
    language === "de" ? deEducation : trEducation,
    item => item.school
  );
}

export function localizeSpeaking(
  items: SpeakingItem[],
  language: SupportedLanguage
) {
  return localizeCollection(
    items,
    language,
    language === "de" ? deSpeaking : trSpeaking,
    item => item.org
  );
}

export function localizeVideos(
  items: VideoItem[],
  language: SupportedLanguage
) {
  return localizeCollection(
    items,
    language,
    language === "de" ? deVideos : trVideos,
    item => item.title
  );
}
