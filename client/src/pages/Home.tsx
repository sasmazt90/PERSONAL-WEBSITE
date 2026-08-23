import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  ExternalLink,
  Globe,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Moon,
  Play,
  Sparkles,
  Sun,
  Trophy,
  Workflow,
  X,
  Youtube,
} from "lucide-react";
import type { BlogPost } from "@shared/blog";
import {
  localizeCaseStudies,
  localizeCertifications,
  localizeEducation,
  localizeProducts,
  localizeSpeaking,
  localizeToolClusters,
  localizeVideos,
} from "@/content/homeLocalizationContent";
import { localizeCareerTimeline } from "@/content/homeLocalizationCareer";
import {
  localizedAtsTags,
  localizedAwards,
  localizedHeroMetrics,
} from "@/content/homeLocalizationStatic";
import { usePortfolioData } from "@/contexts/PortfolioDataContext";
import { useSiteContent } from "@/contexts/SiteContentContext";
import {
  getFileNameFromUrl,
  getFileTypeFromUrl,
  getLinkDomain,
  isDownloadUrl,
  isExternalUrl,
  trackEvent,
} from "@/lib/analytics";
import { fetchPublicBlogPosts } from "@/lib/blogApi";

type Language = "en" | "de" | "tr";
type ThemeMode = "light" | "dark";
type MediaModal =
  | { type: "youtube"; url: string; title: string }
  | { type: "video"; url: string; title: string }
  | {
      type: "detail";
      title: string;
      image?: string;
      images?: string[];
      body: string[];
    }
  | null;

type ExperienceModal = TimelineItem | null;

type TimelineItem = {
  year: string;
  company: string;
  brand: string;
  role: string;
  location: string;
  logo: string;
  focus: string;
  meta: string[];
  detailCards?: { label: string; value: string }[];
  keySystems?: { title: string; body: string }[];
  coreResponsibilities?: string[];
  bullets: string[];
};

type CarouselCard = {
  key: string;
  content: ReactNode;
};

type AwardItem = {
  title: string;
  subtitle: string;
  level: string;
  org: string;
};

const navItems = [
  { key: "about", href: "#about" },
  { key: "journey", href: "#journey" },
  { key: "impact", href: "#impact" },
  { key: "products", href: "#products" },
  { key: "work", href: "#work" },
  { key: "tools", href: "#tools" },
  { key: "contact", href: "#contact" },
  { key: "blog", href: "#blog" },
] as const;

const toYoutubeEmbed = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
  return match
    ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`
    : url;
};

const toYoutubeThumbnail = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

const detailSectionHeadings = new Set([
  "PROBLEM",
  "SOLUTION",
  "ACTION",
  "RESULT",
  "SORUN",
  "ÇÖZÜM",
  "AKSİYON",
  "SONUÇ",
  "LÖSUNG",
  "AKTION",
  "ERGEBNIS",
]);

const isDetailSectionHeading = (value: string) =>
  detailSectionHeadings.has(value.trim().toLocaleUpperCase("tr-TR"));

const secondaryCtaClass =
  "inline-flex items-center gap-2 rounded-full border border-[#f4d68a] bg-[#fffbeb] px-4 py-2.5 text-sm font-bold text-[#bb4d00] shadow-[0_8px_18px_rgba(187,77,0,0.10)] transition hover:border-[#e7b84f] hover:bg-[#fff4d6] hover:text-[#963d00] dark:border-[#f4d68a]/45 dark:bg-[#fffbeb] dark:text-[#bb4d00]";

const heroPhotos = [
  "/assets/photos/tolgar-photo-1.webp",
  "/assets/photos/tolgar-photo-5.webp",
  "/assets/profile/profile-picture.webp",
  "/assets/photos/naos-annual-meeting-2023.webp",
  "/assets/photos/naos-annual-meeting-2022.webp",
  "/assets/photos/naos-annual-meeting-2021.webp",
];

const atsTags = [
  "Digital Transformation",
  "Growth Strategy",
  "Go-to-Market Strategy",
  "Stakeholder Management",
  "Team Leadership",
  "Generative AI Systems Design",
  "Data-Driven Decision Making",
  "Pricing Intelligence",
  "CLV/LTV Modeling",
  "Funnel Diagnostics",
  "Behavioral Analysis",
  "Digital Platform Design",
  "Low-Code Development",
  "Marketing Automation",
  "Omnichannel Strategy",
  "Performance Marketing",
  "CRM Strategy",
  "E-commerce Growth",
  "Power BI",
  "Power Apps",
  "Microsoft Dynamics 365",
];

const awards: AwardItem[] = [
  {
    title: "Felis Awards 2019 - Best Integrated Campaign",
    subtitle: '"Okumak Ne Guzel Sey"',
    level: "Winner",
    org: "idefix",
  },
  {
    title: "MIXX Awards Turkiye 2020 - Best Integrated Campaign",
    subtitle: '"Okumak Ne Guzel Sey"',
    level: "Bronze",
    org: "idefix",
  },
  {
    title: "Social Media Awards Turkey 2020",
    subtitle: "Silver - Social Media Data Analytics",
    level: "Silver",
    org: "idefix",
  },
];

function getToolClusterIcon(title: string) {
  const normalized = title.toLowerCase();
  if (
    normalized.includes("analytics") ||
    normalized.includes("analitik") ||
    normalized.includes("data") ||
    normalized.includes("daten") ||
    normalized.includes("bi")
  ) {
    return <BarChart3 size={18} />;
  }
  if (normalized.includes("crm") || normalized.includes("customer")) {
    return <Workflow size={18} />;
  }
  if (
    normalized.includes("performance") ||
    normalized.includes("performans") ||
    normalized.includes("paid")
  ) {
    return <Cpu size={18} />;
  }
  return <Database size={18} />;
}

function getAwardIcon(level: string) {
  if (level.toLowerCase().includes("winner")) return <Trophy size={18} />;
  if (level.toLowerCase().includes("silver")) return <BadgeCheck size={18} />;
  return <Trophy size={18} />;
}

function getToolClusterVisual(title: string, dark: boolean, image?: string) {
  if (image) {
    return (
      <div
        className={`relative h-32 overflow-hidden rounded-[1.3rem] border ${dark ? "border-white/10 bg-[#17364a]" : "border-[#dce7f9] bg-[#f8fbff]"}`}
      >
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  const normalized = title.toLowerCase();
  if (normalized.includes("performance") || normalized.includes("performans")) {
    return (
      <div
        className={`relative h-32 overflow-hidden rounded-[1.3rem] ${dark ? "bg-[#17364a]" : "bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)]"}`}
      >
        <div className="absolute inset-x-5 bottom-5 flex items-end gap-3">
          <div className="h-12 w-10 rounded-t-[1rem] bg-[#2563eb]" />
          <div className="h-20 w-10 rounded-t-[1rem] bg-[#0ea5e9]" />
          <div className="h-16 w-10 rounded-t-[1rem] bg-[#22c55e]" />
          <div className="h-24 w-10 rounded-t-[1rem] bg-[#f59e0b]" />
        </div>
      </div>
    );
  }
  if (
    normalized.includes("analytics") ||
    normalized.includes("analitik") ||
    normalized.includes("bi")
  ) {
    return (
      <div
        className={`relative h-32 overflow-hidden rounded-[1.3rem] ${dark ? "bg-[#17364a]" : "bg-[linear-gradient(135deg,#eff6ff_0%,#e0f2fe_100%)]"}`}
      >
        <div className="absolute inset-x-3 bottom-5 top-5 rounded-[1rem] border border-dashed border-[#93c5fd]" />
        <div className="absolute inset-x-8 bottom-9 h-1 rounded-full bg-[#bfdbfe]" />
        <div className="absolute bottom-9 left-10 h-12 w-10 rounded-t-[1rem] bg-[#2563eb]" />
        <div className="absolute bottom-9 left-24 h-20 w-10 rounded-t-[1rem] bg-[#38bdf8]" />
        <div className="absolute bottom-9 left-38 h-16 w-10 rounded-t-[1rem] bg-[#14b8a6]" />
        <div className="absolute right-10 top-9 h-16 w-16 rounded-full border-4 border-[#2563eb]/25 border-t-[#2563eb]" />
      </div>
    );
  }
  if (normalized.includes("crm")) {
    return (
      <div
        className={`relative h-32 overflow-hidden rounded-[1.3rem] ${dark ? "bg-[#17364a]" : "bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_100%)]"}`}
      >
        <div className="absolute left-6 top-7 h-16 w-16 rounded-2xl bg-white/90 shadow-sm" />
        <div className="absolute right-6 top-7 h-16 w-16 rounded-2xl bg-white/90 shadow-sm" />
        <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22c55e]" />
        <div className="absolute left-[5.5rem] top-[3.9rem] h-1 w-20 bg-[#86efac]" />
        <div className="absolute right-[5.5rem] top-[3.9rem] h-1 w-20 bg-[#86efac]" />
      </div>
    );
  }
  if (
    normalized.includes("market intelligence") ||
    normalized.includes("marktintelligenz") ||
    normalized.includes("pazar zekası")
  ) {
    return (
      <div
        className={`relative h-32 overflow-hidden rounded-[1.3rem] ${dark ? "bg-[#17364a]" : "bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_100%)]"}`}
      >
        <div className="absolute left-8 top-8 h-16 w-16 rounded-full border-[10px] border-[#fb923c]" />
        <div className="absolute left-[5.5rem] top-[4.8rem] h-10 w-2 rotate-45 rounded-full bg-[#fb923c]" />
        <div className="absolute right-8 top-8 rounded-[1rem] bg-white/90 px-4 py-3 text-sm font-bold text-[#9a3412]">
          Retail
        </div>
        <div className="absolute right-8 bottom-8 rounded-[1rem] bg-white/90 px-4 py-3 text-sm font-bold text-[#9a3412]">
          Benchmark
        </div>
      </div>
    );
  }
  return (
    <div
      className={`relative h-32 overflow-hidden rounded-[1.3rem] ${dark ? "bg-[#17364a]" : "bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)]"}`}
    >
      <div className="absolute left-6 top-8 right-6 grid grid-cols-3 gap-3">
        <div className="h-12 rounded-2xl bg-white/90" />
        <div className="h-12 rounded-2xl bg-white/90" />
        <div className="h-12 rounded-2xl bg-white/90" />
      </div>
      <div className="absolute left-6 right-6 bottom-7 h-4 rounded-full bg-white/75" />
    </div>
  );
}

function getTimelineLogoSurfaceClass(company: string) {
  const normalized = company.toLowerCase();
  if (normalized.includes("lidyana")) return "bg-black";
  if (normalized.includes("8digits")) return "bg-[#31445f]";
  if (normalized.includes("naos")) return "bg-[#103654]";
  return "bg-white";
}

function getTimelineNodeClass(company: string) {
  const normalized = company.toLowerCase();
  if (normalized.includes("lidyana")) return "bg-black";
  if (normalized.includes("8digits")) return "bg-[#31445f]";
  if (normalized.includes("naos")) return "bg-[#103654]";
  return "bg-white";
}

const translations = {
  en: {
    nav: {
      about: "Summary",
      journey: "Career",
      impact: "Business Results",
      products: "Portfolio",
      work: "Authority",
      tools: "Capabilities & Credentials",
      contact: "Contact",
      blog: "BLOG",
    },
    badge: "Head of Digital & AI Transformation Leader",
    title:
      "Head of Digital & CRM | E-Commerce & Growth | AI, Analytics & Transformation",
    summary:
      "Senior digital and business transformation leader with 12+ years of experience delivering technology-driven growth, commercial rigor and scalable operating models across regulated healthcare, retail and consumer markets.",
    cta: "Contact",
    heroLabel: "Head of Digital",
    aboutEyebrow: "About",
    aboutTitle: "A leadership profile built on measurable commercial outcomes.",
    aboutBody1:
      "Builds commercial growth systems across digital marketing, performance marketing, e-commerce, CRM, growth marketing and AI.",
    aboutBody2:
      "Frames Digital transformation as a business growth engine, turning complex channel, customer and operational challenges into clear priorities and measurable outcomes.",
    aboutBody3:
      "Combines strategic leadership with hands-on execution to scale teams, improve decision-making and create performance systems executives can trust.",
    journeyEyebrow: "Career Journey",
    journeyTitle:
      "A decade-long record of building digital capability and commercial impact.",
    impactEyebrow: "Measurable Impact",
    impactTitle:
      "Concrete business outcomes delivered across markets and growth stages.",
    impactSubtitle: "Key performance improvements (%)",
    competencyTitle: "Competency profile",
    productsEyebrow: "AI Innovation, Digital Video & Product Portfolio",
    productsTitle:
      "AI-powered applications, digital video production and operating solutions built across experimental product concepts and enterprise-grade workflow design.",
    vibeCodingTitle: "Vibe Coding",
    powerAppsTitle: "Power Apps",
    powerAppsSubtitle:
      "Low-code enterprise applications built with Microsoft Power Apps and Power Automate for streamlined operations and digital transformation.",
    workEyebrow: "Industry Impact & Recognition",
    workTitle:
      "Award-winning campaigns, measurable growth case studies and contributions to the digital marketing community.",
    awardsTitle: "Awards",
    caseStudiesTitle: "Selected Case Studies",
    videoTitle: "Digital Video Production",
    videoSubtitle:
      "Selected video production work developed across brand communication, campaign activation and commercial storytelling.",
    toolsEyebrow: "Core Competencies",
    toolsTitle:
      "Technology stack and advanced certifications supporting CRM, analytics, performance marketing and AI-enabled growth systems.",
    credentialsEyebrow: "Advanced Certifications",
    credentialsTitle: "Advanced Certifications",
    stageEyebrow: "Leadership Moments",
    stageTitle:
      "Selected moments from annual meetings, business storytelling and executive presentations.",
    contactEyebrow: "Contact",
    contactTitle:
      "Open to strategic digital, e-commerce and AI transformation conversations.",
    contactBody:
      "Available for leadership opportunities, advisory discussions and executive conversations around growth, CRM, analytics and AI-enabled transformation.",
    measurableLabels: [
      "OPEX Reduction",
      "Acquisition Growth",
      "LTV Increase",
      "Sell-out Growth",
      "Margin Uplift",
      "Conversion Rate",
    ],
    competencies: [
      { label: "AI / GenAI", value: 92 },
      { label: "Performance Marketing", value: 90 },
      { label: "CRM & Automation", value: 88 },
      { label: "Data Analytics", value: 91 },
      { label: "Team Leadership", value: 86 },
      { label: "Strategy", value: 94 },
    ],
    languagesTitle: "Languages",
    speakingTitle: "Speaking & Mentorship",
    educationTitle: "Education",
    certificationsTitle: "Certifications",
    openLive: "Open Product",
    watchWalkthrough: "Watch Demo",
    seeDetails: "See Details",
    longDescription: "Long Description",
    openCase: "View Case Study",
    watchVideo: "Watch",
    emailLabel: "Email",
    websiteLabel: "Website",
    closeCareerDetail: "Close career detail",
    previousCareerDetail: "Previous career detail",
    nextCareerDetail: "Next career detail",
    keySystems: "Key Systems & Achievements",
    coreResponsibilities: "Core Responsibilities",
    confidential: "Confidential",
    caseStudyLabel: "Case Study",
    period: "Period",
    location: "Location",
    keyResponsibilities: "Key Responsibilities & Achievements",
    locationValue: "Munich, Germany",
    footer: "Digital growth, AI systems and transformation leadership.",
    themeToggleDark: "Toggle dark mode",
    themeToggleLight: "Toggle light mode",
    heroPhotoLabel: "Hero photo",
    privateProject:
      "Private enterprise project. Public visuals intentionally withheld.",
    toolsCountSuffix: "tools",
    linkedinLabel: "LinkedIn",
    aboutCompetenciesTitle: "Core Competencies",
  },
  de: {
    nav: {
      about: "Zusammenfassung",
      journey: "Karriere",
      impact: "Business-Ergebnisse",
      products: "Portfolio",
      work: "Autorität",
      tools: "Fähigkeiten & Nachweise",
      contact: "Kontakt",
      blog: "BLOG",
    },
    badge: "Head of Digital & KI-Transformationsleiter",
    title:
      "Head of Digital & CRM | E-Commerce & Wachstum | KI, Analytics & Transformation",
    summary:
      "Führungskraft für digitale Transformation mit über 12 Jahren Erfahrung in technologiegetriebenem Wachstum, operativer Exzellenz und skalierbaren Modellen in regulierten Healthcare-, Retail- und Consumer-Umfeldern.",
    cta: "Kontakt",
    heroLabel: "Head of Digital",
    aboutEyebrow: "Überblick",
    aboutTitle:
      "Ein Führungsprofil mit klarem Fokus auf messbare Geschäftsergebnisse.",
    aboutBody1:
      "Verbindet Wachstumsstrategie, CRM, Analytics, Marketplace Execution und KI-gestützte Operations zu einer integrierten Management-Disziplin.",
    aboutBody2:
      "Vereint strategische Klarheit mit operativer Umsetzung und verfügt über eine belastbare Erfolgsbilanz beim Aufbau von Teams, Performance-Systemen und skalierbaren digitalen Strukturen.",
    aboutBody3:
      "Aktuell führt er die DACH-Digitaltransformation bei NAOS Deutschland (BIODERMA) in München und verbindet strategische Vision mit operativer Umsetzung für messbaren Geschäftseffekt.",
    journeyEyebrow: "Karriereweg",
    journeyTitle:
      "Ein Jahrzehnt Aufbau digitaler Fähigkeiten und kommerzieller Wirkung.",
    impactEyebrow: "Messbare Wirkung",
    impactTitle:
      "Konkrete Geschäftsergebnisse über verschiedene Märkte und Wachstumsphasen hinweg.",
    impactSubtitle: "Wesentliche Leistungsverbesserungen (%)",
    competencyTitle: "Kompetenzprofil",
    productsEyebrow: "Vibe Coding & KI-Produkte",
    productsTitle:
      "Persönlich entwickelte Anwendungen mit KI, Low-Code und No-Code.",
    workEyebrow: "Ausgewählte Arbeiten",
    workTitle:
      "Relevante Fallstudien und Arbeiten im Bereich digitale Videoproduktion.",
    awardsTitle: "Auszeichnungen",
    videoTitle: "Digitale Videoproduktion",
    videoSubtitle:
      "Ausgewählte Videoarbeiten aus Markenkommunikation, Kampagnenaktivierung und kommerziellem Storytelling.",
    toolsEyebrow: "Kernkompetenzen",
    toolsTitle:
      "Plattformen und Tools für skalierbare Growth-Systeme in CRM, Analytics, Performance und BI.",
    credentialsEyebrow: "Profil",
    credentialsTitle:
      "Ausbildung, Speaking und Zertifizierungen als Fundament der Arbeit.",
    stageEyebrow: "Leadership Moments",
    stageTitle:
      "Ausgewählte Momente aus Annual Meetings, Business Storytelling und Executive Presentations.",
    contactEyebrow: "Kontakt",
    contactTitle:
      "Offen für strategische Gespräche zu Digital, E-Commerce und KI-Transformation.",
    contactBody:
      "Verfügbar für Führungsrollen, Advisory-Mandate und strategische Gespräche rund um Growth, CRM, Analytics und AI-enabled Transformation.",
    measurableLabels: [
      "OPEX-Reduktion",
      "Akquisitionswachstum",
      "LTV-Steigerung",
      "Sell-out-Wachstum",
      "Margenplus",
      "Conversion-Rate",
    ],
    competencies: [
      { label: "AI / GenAI", value: 92 },
      { label: "Performance Marketing", value: 90 },
      { label: "CRM & Automation", value: 88 },
      { label: "Data Analytics", value: 91 },
      { label: "Team Leadership", value: 86 },
      { label: "Strategie", value: 94 },
    ],
    languagesTitle: "Sprachen",
    speakingTitle: "Vorträge & Mentoring",
    educationTitle: "Ausbildung",
    certificationsTitle: "Zertifizierungen",
    openLive: "Produkt öffnen",
    watchWalkthrough: "Demo ansehen",
    seeDetails: "Details ansehen",
    longDescription: "Ausführliche Beschreibung",
    openCase: "Fallstudie öffnen",
    watchVideo: "Ansehen",
    emailLabel: "E-Mail",
    websiteLabel: "Webseite",
    closeCareerDetail: "Karrieredetail schließen",
    previousCareerDetail: "Vorheriges Karrieredetail",
    nextCareerDetail: "Nächstes Karrieredetail",
    keySystems: "Wichtige Systeme & Erfolge",
    coreResponsibilities: "Kernverantwortungen",
    confidential: "Vertraulich",
    caseStudyLabel: "Fallstudie",
    period: "Zeitraum",
    location: "Standort",
    keyResponsibilities: "Wichtigste Verantwortlichkeiten & Erfolge",
    locationValue: "München, Deutschland",
    footer: "Digitales Wachstum, KI-Systeme und Transformationsführung.",
    themeToggleDark: "Dunkelmodus aktivieren",
    themeToggleLight: "Hellmodus aktivieren",
    heroPhotoLabel: "Hero-Foto",
    privateProject:
      "Vertrauliches Unternehmensprojekt. Öffentliche Visuals werden bewusst nicht gezeigt.",
    toolsCountSuffix: "Tools",
    linkedinLabel: "LinkedIn",
    aboutCompetenciesTitle: "Kernkompetenzen",
  },
  tr: {
    nav: {
      about: "Özet",
      journey: "Kariyer",
      impact: "İş Sonuçları",
      products: "Portföy",
      work: "Otorite",
      tools: "Yetkinlikler & Belgeler",
      contact: "İletişim",
      blog: "BLOG",
    },
    badge: "Head of Digital & Yapay Zeka Dönüşüm Lideri",
    title:
      "Head of Digital & CRM | E-Ticaret & Büyüme | Yapay Zeka, Analitik & Dönüşüm",
    summary:
      "Regüle sağlık, perakende ve tüketici odaklı sektörlerde teknoloji destekli büyüme, ticari disiplin ve ölçeklenebilir operasyon modelleri geliştiren 12+ yıllık deneyime sahip dijital dönüşüm lideri.",
    cta: "İletişim",
    heroLabel: "Head of Digital",
    aboutEyebrow: "Hakkımda",
    aboutTitle: "Ölçülebilir ticari sonuçlara odaklanan bir liderlik profili.",
    aboutBody1:
      "Büyüme stratejisi, CRM, analitik, marketplace yönetimi ve yapay zeka destekli operasyonları tek bir entegre yönetim disiplini altında birleştirir.",
    aboutBody2:
      "Stratejik bakış açısını uygulama gücüyle bir araya getirir; ekip ölçekleme, karmaşıklığı sadeleştirme ve güvenilir performans sistemleri kurma konusunda güçlü bir geçmişe sahiptir.",
    aboutBody3:
      "Şu anda Münih'te NAOS Deutschland (BIODERMA) bünyesinde DACH dijital dönüşümünü yönetiyor; stratejik vizyonu uygulama gücüyle birleştirerek ölçülebilir iş etkisi yaratıyor.",
    journeyEyebrow: "Kariyer Yolculuğu",
    journeyTitle:
      "Dijital yetkinlik ve ticari etki inşa edilen on yıllık bir kariyer yolculuğu.",
    impactEyebrow: "Ölçülebilir Etki",
    impactTitle:
      "Farklı pazarlar ve büyüme aşamalarında üretilen somut iş sonuçları.",
    impactSubtitle: "Temel performans gelişimleri (%)",
    competencyTitle: "Yetkinlik profili",
    productsEyebrow: "Vibe Coding & Yapay Zeka Ürünleri",
    productsTitle:
      "AI, low-code ve no-code ile bizzat geliştirilen uygulamalar.",
    workEyebrow: "Seçili İşler",
    workTitle:
      "Öne çıkan vaka analizleri ve dijital video prodüksiyon çalışmaları.",
    awardsTitle: "Ödüller",
    videoTitle: "Dijital Video Prodüksiyon",
    videoSubtitle:
      "Marka iletişimi, kampanya aktivasyonu ve ticari hikaye anlatımı odağında geliştirilen seçili video prodüksiyon işleri.",
    toolsEyebrow: "Temel Yetkinlikler",
    toolsTitle:
      "CRM, analitik, performans ve iş zekası ekseninde ölçeklenebilir büyüme sistemleri için kullandığım platformlar ve araçlar.",
    credentialsEyebrow: "Profil",
    credentialsTitle:
      "Eğitim, konuşmalar ve sertifikalarla desteklenen profesyonel arka plan.",
    stageEyebrow: "Leadership Moments",
    stageTitle:
      "Yıllık toplantılar, iş hikayeciliği ve yönetici sunumlarından seçili anlar.",
    contactEyebrow: "İletişim",
    contactTitle:
      "Dijital, e-ticaret ve yapay zeka dönüşümü odağında stratejik görüşmelere açığım.",
    contactBody:
      "Liderlik rolleri, danışmanlık fırsatları ve growth, CRM, analitik ile yapay zeka destekli dönüşüm başlıklarında üst düzey görüşmeler için ulaşabilirsiniz.",
    measurableLabels: [
      "OPEX Azalışı",
      "Kullanıcı Kazanımı",
      "LTV Artışı",
      "Sell-out Büyümesi",
      "Marj Artışı",
      "Dönüşüm Oranı",
    ],
    competencies: [
      { label: "AI / GenAI", value: 92 },
      { label: "Performance Marketing", value: 90 },
      { label: "CRM & Automation", value: 88 },
      { label: "Data Analytics", value: 91 },
      { label: "Team Leadership", value: 86 },
      { label: "Strategy", value: 94 },
    ],
    languagesTitle: "Diller",
    speakingTitle: "Konuşmalar & Mentorluk",
    educationTitle: "Eğitim",
    certificationsTitle: "Sertifikalar",
    openLive: "Ürünü Aç",
    watchWalkthrough: "Demoyu İzle",
    seeDetails: "Detayları Gör",
    longDescription: "Uzun Açıklama",
    openCase: "Vaka Analizini Aç",
    watchVideo: "İzle",
    emailLabel: "E-posta",
    websiteLabel: "Web Sitesi",
    closeCareerDetail: "Kariyer detayını kapat",
    previousCareerDetail: "Önceki kariyer detayı",
    nextCareerDetail: "Sonraki kariyer detayı",
    keySystems: "Temel Sistemler ve Başarılar",
    coreResponsibilities: "Temel Sorumluluklar",
    confidential: "Gizli",
    caseStudyLabel: "Vaka Analizi",
    period: "Dönem",
    location: "Konum",
    keyResponsibilities: "Temel Sorumluluklar ve Başarılar",
    locationValue: "Münih, Almanya",
    footer: "Dijital büyüme, yapay zeka sistemleri ve dönüşüm liderliği.",
    themeToggleDark: "Karanlık modu aç",
    themeToggleLight: "Aydınlık modu aç",
    heroPhotoLabel: "Hero fotoğrafı",
    privateProject:
      "Gizli kurumsal proje. Kamuya açık görseller bilinçli olarak paylaşılmıyor.",
    toolsCountSuffix: "araç",
    linkedinLabel: "LinkedIn",
    aboutCompetenciesTitle: "Temel Yetkinlikler",
  },
} as const;

const measurableImpactValues = [18, 35, 69, 40, 14, 25];

const languageLevels = {
  en: [
    { name: "Turkish", level: "Native", width: "100%" },
    { name: "English", level: "Expert (C2)", width: "96%" },
    { name: "German", level: "Elementary (A2)", width: "30%" },
  ],
  de: [
    { name: "Türkisch", level: "Muttersprache", width: "100%" },
    { name: "Englisch", level: "Experte (C2)", width: "96%" },
    { name: "Deutsch", level: "Grundlagen (A2)", width: "30%" },
  ],
  tr: [
    { name: "Türkçe", level: "Ana dil", width: "100%" },
    { name: "İngilizce", level: "İleri (C2)", width: "96%" },
    { name: "Almanca", level: "Temel (A2)", width: "30%" },
  ],
} as const;

function parseTimelineStartValue(value: string) {
  const normalized = value.replace(/\u2013|\u2014/g, "-").trim();
  const firstPart = normalized.split("-")[0]?.trim() ?? normalized;
  const monthYear = firstPart.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthYear) {
    return Number(monthYear[2]) * 100 + Number(monthYear[1]);
  }
  const yearOnly = firstPart.match(/^(\d{4})$/);
  if (yearOnly) {
    return Number(yearOnly[1]) * 100 + 1;
  }
  return Number.MAX_SAFE_INTEGER;
}

function getTimelineDisplayDate(value: string) {
  const normalized = value.replace(/\u2013|\u2014/g, "-").trim();
  return normalized.split("-")[0]?.trim() ?? normalized;
}

function getExperienceCompanyLabel(item: TimelineItem) {
  if (
    item.company === "NAOS Deutschland" ||
    item.company === "Emarsys" ||
    item.company === "NAOS Türkiye"
  ) {
    return `${item.company} (${item.brand})`;
  }

  return item.company;
}

function getCareerModalIndex(items: TimelineItem[], item: TimelineItem) {
  return items.findIndex(
    candidate =>
      candidate.year === item.year &&
      candidate.company === item.company &&
      candidate.role === item.role
  );
}

function getRelativeCareer(
  items: TimelineItem[],
  item: TimelineItem,
  direction: -1 | 1
) {
  const index = getCareerModalIndex(items, item);
  if (index < 0) return item;
  return items[(index + direction + items.length) % items.length];
}

function getCareerMetaLabel(value: string, index: number) {
  const normalized = value.toLowerCase();

  if (
    normalized.includes("budget") ||
    normalized.includes("figure") ||
    normalized.includes("try") ||
    normalized.includes("eur")
  ) {
    return "Budget";
  }

  if (
    normalized.includes("team") ||
    normalized.includes("fte") ||
    normalized.includes("person") ||
    normalized.includes("reports") ||
    normalized.includes("organization")
  ) {
    return "Team";
  }

  if (
    normalized.includes("client") ||
    normalized.includes("portfolio") ||
    normalized.includes("retainers")
  ) {
    return "Client Portfolio";
  }

  if (
    normalized.includes("crm") ||
    normalized.includes("seo") ||
    normalized.includes("cro") ||
    normalized.includes("growth")
  ) {
    return "Functional Scope";
  }

  return index === 0 ? "Scope" : "Operating Focus";
}

export default function Home() {
  const { portfolioData } = usePortfolioData();
  const { siteContent } = useSiteContent();
  const { personalInfo } = portfolioData;
  const youtubeUrl = "https://www.youtube.com/@AI-swers";
  const {
    aiProducts: sourceAiProducts,
    careerTimeline: sourceCareerTimeline,
    caseStudies: sourceCaseStudies,
    certifications: sourceCertifications,
    education: sourceEducation,
    speaking: sourceSpeaking,
    toolClusters: sourceToolClusters,
    videoPortfolio: sourceVideoPortfolio,
  } = siteContent;

  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mediaModal, setMediaModal] = useState<MediaModal>(null);
  const [experienceModal, setExperienceModal] = useState<ExperienceModal>(null);
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const journeyRef = useRef<HTMLElement | null>(null);
  const t = translations[language] as typeof translations.en;
  const localizedContent = useMemo(
    () => ({
      heroMetrics: localizedHeroMetrics[language],
      atsTags: localizedAtsTags[language],
      awards: localizedAwards[language],
      aiProducts: localizeProducts(sourceAiProducts, language),
      careerTimeline: localizeCareerTimeline(sourceCareerTimeline, language),
      caseStudies: localizeCaseStudies(sourceCaseStudies, language),
      certifications: localizeCertifications(sourceCertifications, language),
      education: localizeEducation(sourceEducation, language),
      speaking: localizeSpeaking(sourceSpeaking, language),
      toolClusters: localizeToolClusters(sourceToolClusters, language),
      videoPortfolio: localizeVideos(sourceVideoPortfolio, language),
    }),
    [
      language,
      sourceAiProducts,
      sourceCareerTimeline,
      sourceCaseStudies,
      sourceCertifications,
      sourceEducation,
      sourceSpeaking,
      sourceToolClusters,
      sourceVideoPortfolio,
    ]
  );
  const {
    heroMetrics,
    atsTags: aboutTags,
    awards: awardsList,
    aiProducts,
    careerTimeline,
    caseStudies,
    certifications,
    education,
    speaking,
    toolClusters,
    videoPortfolio,
  } = localizedContent;
  const orderedCareerTimeline = useMemo<TimelineItem[]>(
    () =>
      [...careerTimeline].sort(
        (a, b) =>
          parseTimelineStartValue(a.year) - parseTimelineStartValue(b.year)
      ),
    [careerTimeline]
  );
  const activeCareer =
    experienceModal ?? orderedCareerTimeline[orderedCareerTimeline.length - 1];
  const activeCareerDetailCards = activeCareer
    ? [
        { label: t.period, value: activeCareer.year },
        { label: t.location, value: activeCareer.location },
        ...(activeCareer.detailCards ??
          activeCareer.meta.map((value, index) => ({
            label: getCareerMetaLabel(value, index),
            value,
          }))),
      ].filter(item => item.value)
    : [];
  const experienceDetailCards = experienceModal
    ? [
        { label: t.period, value: experienceModal.year },
        { label: t.location, value: experienceModal.location },
        ...(experienceModal.detailCards ??
          experienceModal.meta.map((value, index) => ({
            label: getCareerMetaLabel(value, index),
            value,
          }))),
      ].filter(item => item.value)
    : [];
  const backgroundImage =
    theme === "dark"
      ? "/assets/backgrounds/background-dark-theme.webp"
      : "/assets/backgrounds/background-light-theme.webp";
  const portfolioSection = {
    eyebrow:
      language === "de"
        ? "KI-Innovation, Digital Video & Produktportfolio"
        : language === "tr"
          ? "Yapay Zeka İnovasyonu, Dijital Video ve Ürün Portföyü"
          : "AI Innovation, Digital Video & Product Portfolio",
    title:
      language === "de"
        ? "KI-gestützte Anwendungen, digitale Videoproduktion und operative Produktsysteme aus experimentellen Konzepten und skalierbaren Workflow-Designs."
        : language === "tr"
          ? "Deneysel ürün fikirlerinden kurumsal workflow tasarımlarına uzanan yapay zeka uygulamaları, dijital video prodüksiyonları ve operasyonel ürün sistemleri."
          : "AI-powered applications, digital video production and operating solutions built across experimental product concepts and enterprise-grade workflow design.",
  };
  const competenciesSection = {
    eyebrow:
      language === "de"
        ? "Kernkompetenzen"
        : language === "tr"
          ? "Temel Yetkinlikler"
          : "Core Competencies",
    title:
      language === "de"
        ? "Technologie-Stack und weiterführende Zertifizierungen als Fundament für skalierbare CRM-, Analytics-, Performance- und KI-Growth-Systeme."
        : language === "tr"
          ? "CRM, analitik, performans pazarlaması ve yapay zeka destekli büyüme sistemlerini destekleyen teknoloji altyapısı ve ileri düzey sertifikasyonlar."
          : "Technology stack and advanced certifications supporting CRM, analytics, performance marketing and AI-enabled growth systems.",
    technologyStack:
      language === "de"
        ? "Technologie-Stack"
        : language === "tr"
          ? "Teknoloji Altyapısı"
          : "Technology Stack",
    advancedCertifications:
      language === "de"
        ? "Weiterführende Zertifizierungen"
        : language === "tr"
          ? "İleri Düzey Sertifikalar"
          : "Advanced Certifications",
  };
  const trackCta = (
    ctaText: string,
    ctaType: string,
    destinationUrl: string,
    sectionName: string
  ) => {
    trackEvent("cta_click", {
      cta_text: ctaText,
      cta_type: ctaType,
      destination_url: destinationUrl,
      section_name: sectionName,
    });

    if (isExternalUrl(destinationUrl)) {
      trackEvent("external_link_click", {
        link_text: ctaText,
        destination_url: destinationUrl,
        link_domain: getLinkDomain(destinationUrl),
        section_name: sectionName,
      });
    }

    if (isDownloadUrl(destinationUrl)) {
      trackEvent("file_download_click", {
        file_name: getFileNameFromUrl(destinationUrl),
        file_url: destinationUrl,
        file_type: getFileTypeFromUrl(destinationUrl),
        section_name: sectionName,
      });
    }
  };
  const trackProject = (
    product: (typeof aiProducts)[number],
    sectionName: string,
    destinationUrl?: string | null
  ) => {
    trackEvent("project_click", {
      project_name: product.title,
      project_category: product.category,
      project_url: destinationUrl ?? product.url ?? "",
      section_name: sectionName,
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    fetchPublicBlogPosts()
      .then(collection => {
        if (!cancelled) setBlogPosts(collection.posts);
      })
      .catch(() => {
        if (!cancelled) setBlogPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroPhotoIndex(current => (current + 1) % heroPhotos.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const node = journeyRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const raw = (viewport * 0.88 - rect.top) / (rect.height * 1.25);
      const clamped = Math.max(0, Math.min(1, raw));
      setJourneyProgress(clamped);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const buildProductCard = (
    product: (typeof aiProducts)[number],
    portrait: boolean
  ) => ({
    key: product.title,
    content: (
      <article className="portfolio-panel-light flex h-full min-h-[480px] flex-col transition duration-300 hover:-translate-y-1 hover:border-[#c9daf6] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] dark:hover:border-white/20 dark:hover:shadow-none">
        <div
          className={`flex items-start justify-between gap-3 ${product.confidential ? "min-h-[12rem]" : "min-h-[8.5rem]"}`}
        >
          <div
            className={`flex flex-1 flex-col ${product.confidential ? "min-h-[12rem]" : "min-h-[8.5rem]"}`}
          >
            <p
              className={`${product.confidential ? "min-h-[3.5rem]" : "min-h-[2.5rem]"} text-xs font-bold uppercase tracking-[0.24em] text-[#2563eb] dark:text-[#8cc8ff]`}
            >
              {product.category}
            </p>
            <h3
              className={`mt-3 font-['Space_Grotesk'] text-2xl font-bold text-[#0f172a] dark:text-white ${product.confidential ? "min-h-[8.5rem]" : "min-h-[4.5rem]"}`}
            >
              {product.title}
            </h3>
          </div>
          {product.confidential ? (
            <span className="shrink-0 rounded-full border border-amber-300/40 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-300/25 dark:bg-amber-500/10 dark:text-amber-200">
              {t.confidential}
            </span>
          ) : null}
        </div>
        {product.image ? (
          <div
            className={`mt-5 w-full overflow-hidden rounded-[1.5rem] border border-[#e4ecf8] bg-white dark:border-white/10 dark:bg-black/20 ${portrait ? "aspect-[4/5]" : "aspect-[312/250]"}`}
          >
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className={`h-full w-full ${portrait ? "aspect-[4/5]" : "aspect-[312/250]"} ${product.imageFit === "contain" ? "object-contain p-4" : "object-cover"} ${product.imageClassName ?? ""}`}
              style={{
                objectPosition:
                  product.imagePosition ??
                  (product.title === "DIGITAL GROWTH ENGINE"
                    ? "left top"
                    : "center"),
              }}
            />
          </div>
        ) : (
          <div className="mt-5 flex aspect-[312/250] w-full items-center rounded-[1.5rem] border border-dashed border-[#d8e6ff] bg-[#f8fbff] px-5 py-12 text-sm text-[#64748b] dark:border-white/12 dark:bg-white/4 dark:text-white/78">
            {t.privateProject}
          </div>
        )}
        <div className="mt-5 min-h-[16rem]">
          <p className="text-[0.98rem] leading-8 text-[#4b5b72] dark:text-white/88">
            {product.summary}
          </p>
          <p className="mt-3 text-[0.98rem] leading-8 text-[#617086] dark:text-white/74">
            {product.outcome}
          </p>
        </div>
        <div className="mt-4 min-h-[6.5rem] flex flex-wrap content-start gap-2">
          {product.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full border border-[#dce7f9] bg-[#f7faff] px-3 py-1 text-xs font-semibold text-[#4b5b72] dark:border-white/10 dark:bg-white/8 dark:text-white/88"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex min-h-[4rem] flex-wrap items-end gap-3 pt-6">
          {product.video ? (
            <button
              type="button"
              onClick={() => {
                trackProject(product, "products", product.video);
                trackCta(
                  t.watchWalkthrough,
                  "video",
                  product.video!,
                  "products"
                );
                setMediaModal({
                  type: product.videoType === "youtube" ? "youtube" : "video",
                  url: product.video!,
                  title: product.title,
                });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Play size={15} />
              {t.watchWalkthrough}
            </button>
          ) : null}
          {product.detailBody?.length ||
          (product.confidential && (product.summary || product.outcome)) ? (
            <button
              type="button"
              onClick={() => {
                trackProject(product, "products");
                trackCta(t.seeDetails, "details", "", "products");
                setMediaModal({
                  type: "detail",
                  title: product.title,
                  image: product.image,
                  images: product.detailImages,
                  body: product.detailBody?.length
                    ? product.detailBody
                    : [product.summary, product.outcome].filter(Boolean),
                });
              }}
              className={secondaryCtaClass}
            >
              {t.seeDetails}
            </button>
          ) : null}
          {product.url && !product.confidential ? (
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                const label = product.linkLabel ?? t.openLive;
                trackProject(product, "products", product.url);
                trackCta(label, "external", product.url!, "products");
              }}
              className={secondaryCtaClass}
            >
              {product.linkLabel ?? t.openLive}
            </a>
          ) : null}
        </div>
      </article>
    ),
  });

  const vibeCards = useMemo<CarouselCard[]>(
    () =>
      aiProducts
        .filter(product => !product.confidential)
        .map(product => buildProductCard(product, false)),
    [aiProducts, t.openLive, t.seeDetails, t.watchWalkthrough]
  );

  const powerAppCards = useMemo<CarouselCard[]>(
    () =>
      aiProducts
        .filter(product => product.confidential)
        .map(product => buildProductCard(product, false)),
    [aiProducts, t.openLive, t.seeDetails, t.watchWalkthrough]
  );

  const videoCards = useMemo<CarouselCard[]>(
    () =>
      videoPortfolio.map(video => ({
        key: video.title,
        content: (
          <button
            type="button"
            onClick={() => {
              trackCta(t.watchVideo, "video", video.url, "video_portfolio");
              setMediaModal({
                type: "youtube",
                url: video.url,
                title: video.title,
              });
            }}
            className="group h-full overflow-hidden rounded-[1.75rem] border border-[#dce7f9] bg-white text-left transition hover:border-[#cadcf6] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102230] dark:hover:border-white/20 dark:hover:shadow-none"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={video.image ?? toYoutubeThumbnail(video.url)}
                alt={video.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0f172a]">
                  <Play size={18} />
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                  {t.watchVideo}
                </span>
              </div>
            </div>
            <div className="min-h-[110px] p-5">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#0f172a] dark:text-white">
                {video.title}
              </h3>
            </div>
          </button>
        ),
      })),
    [videoPortfolio, t.watchVideo]
  );

  const toolCards = useMemo<CarouselCard[]>(
    () =>
      toolClusters.map(cluster => ({
        key: cluster.title,
        content: (
          <div className="h-full rounded-[1.75rem] border border-[#dce7f9] bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#cadcf6] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102230] dark:shadow-none dark:hover:border-white/20 dark:hover:shadow-none">
            {getToolClusterVisual(
              cluster.title,
              theme === "dark",
              cluster.image
            )}
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb] dark:bg-[#0f2530] dark:text-[#8cc8ff]">
              {getToolClusterIcon(cluster.title)}
            </div>
            <h3 className="mt-4 font-['Space_Grotesk'] text-xl font-bold text-[#0f172a] dark:text-white">
              {cluster.title}
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {cluster.tools.map(tool => (
                <span
                  key={tool}
                  className="rounded-full border border-[#dce7f9] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#4b5b72] dark:border-white/10 dark:bg-white/6 dark:text-white/78"
                >
                  {tool}
                </span>
              ))}
            </div>
            <div className="mt-6 border-t border-[#e7eef8] pt-4 text-sm text-[#7a8699] dark:border-white/10 dark:text-white/56">
              {cluster.tools.length} {t.toolsCountSuffix}
            </div>
          </div>
        ),
      })),
    [toolClusters, theme]
  );

  const certificationCards = useMemo<CarouselCard[]>(
    () =>
      certifications.map(item => ({
        key: item.title,
        content: (
          <div className="h-full overflow-hidden rounded-[1.75rem] border border-[#dce7f9] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#cadcf6] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102230] dark:shadow-none dark:hover:border-white/20 dark:hover:shadow-none">
            <img
              src={item.image}
              alt={item.title}
              className="aspect-[4/2.2] w-full object-cover"
            />
            <div className="space-y-3 p-5">
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#0f172a] dark:text-white">
                {item.title}
              </h3>
              <p className="text-base text-[#5b667b] dark:text-[#8cc8ff]">
                {item.issuer}
              </p>
              <p className="text-sm text-[#7a8699] dark:text-white/56">
                {item.date}
              </p>
            </div>
          </div>
        ),
      })),
    [certifications]
  );
  const blogCards = useMemo<CarouselCard[]>(
    () =>
      blogPosts.map(post => {
        const thumbnail =
          post.visuals.find(visual => visual.visualType === "thumbnail") ||
          post.visuals.find(visual => visual.visualType === "hero") ||
          post.visuals[0];
        const title = post.seo[language]?.title || post.topic;
        const tags = post.categories?.length
          ? post.categories
          : ["Digital Growth Systems"];
        return {
          key: post.id,
          content: (
            <Reveal className="h-full">
              <article
                className={`flex h-full min-h-[31rem] flex-col overflow-hidden rounded-[1.75rem] border transition hover:-translate-y-1 ${
                  theme === "dark"
                    ? "border-white/10 bg-[#102230] hover:border-white/20"
                    : "border-[#dce7f9] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.05)] hover:border-[#cadcf6] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                }`}
              >
                <div className="h-52 overflow-hidden bg-[#eef4ff] dark:bg-[#0f2530]">
                  {thumbnail?.url ? (
                    <img
                      src={thumbnail.url}
                      alt={thumbnail.alt[language] || title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-[#5b667b] dark:text-white/64">
                      {thumbnail?.prompt || "SASMAZ blog visual"}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3
                    className={`font-['Space_Grotesk'] text-2xl font-bold leading-tight ${theme === "dark" ? "text-white" : "text-[#0f172a]"}`}
                  >
                    {title}
                  </h3>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {tags.slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase leading-4 tracking-[0.1em] ${
                          theme === "dark"
                            ? "bg-white/8 text-[#a9d4ff]"
                            : "bg-[#eef4ff] text-[#2563eb]"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-7">
                    <a
                      href={`/blog/${post.slug.canonical}/${language}`}
                      onClick={() =>
                        trackEvent("blog_click", {
                          blog_title: title,
                          blog_slug: post.slug.canonical,
                          blog_url: `/blog/${post.slug.canonical}/${language}`,
                          section_name: "blog",
                        })
                      }
                      className="inline-flex items-center justify-center rounded-[1.1rem] bg-[#2563eb] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_rgba(37,99,235,0.20)] transition hover:bg-[#1d4ed8]"
                    >
                      Read Now
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ),
        };
      }),
    [blogPosts, language, theme]
  );

  return (
    <div
      className="min-h-screen bg-[#f5f8fc] text-[#0f172a] transition-colors dark:bg-[#06131a] dark:text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="sticky top-0 z-40 border-b border-[#d6e0f0] bg-white/88 backdrop-blur-xl dark:border-white/10 dark:bg-[#07141c]/84">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <div className="hidden lg:block" />
          <nav className="hidden items-center justify-center gap-2 overflow-x-auto text-sm text-[#516079] dark:text-white/68 lg:flex">
            {navItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                className={`min-w-fit rounded-full px-3 py-2 transition hover:bg-[#eff5ff] hover:text-[#0f172a] dark:hover:bg-white/8 dark:hover:text-white ${
                  item.key === "blog"
                    ? "font-extrabold uppercase tracking-[0.18em] text-[#0f172a] dark:text-white"
                    : ""
                }`}
              >
                {t.nav[item.key]}
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-2">
            <div className="relative">
              <select
                value={language}
                onChange={event => setLanguage(event.target.value as Language)}
                className="rounded-full border border-[#dce7f9] bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#0f172a] outline-none dark:border-white/10 dark:bg-white/6 dark:text-white"
              >
                <option value="en">EN</option>
                <option value="de">DE</option>
                <option value="tr">TR</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() =>
                setTheme(current => (current === "light" ? "dark" : "light"))
              }
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dce7f9] bg-white text-[#0f172a] transition hover:border-[#bfd3f6] dark:border-white/10 dark:bg-white/6 dark:text-white"
              aria-label={
                theme === "light" ? t.themeToggleDark : t.themeToggleLight
              }
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(245,248,252,0.76)_52%,rgba(237,244,255,0.82)_100%)] dark:bg-[linear-gradient(180deg,rgba(7,20,28,0.86)_0%,rgba(11,31,41,0.82)_54%,rgba(7,20,28,0.9)_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(37,99,235,0.08),transparent_28%),radial-gradient(circle_at_88%_30%,rgba(59,130,246,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_16%_22%,rgba(76,162,255,0.16),transparent_26%),radial-gradient(circle_at_86%_28%,rgba(77,201,255,0.10),transparent_22%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] opacity-70 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,144,255,0.35)_0,rgba(74,144,255,0.0)_8%),radial-gradient(circle_at_60%_35%,rgba(74,144,255,0.28)_0,rgba(74,144,255,0.0)_7%),radial-gradient(circle_at_40%_58%,rgba(74,144,255,0.28)_0,rgba(74,144,255,0.0)_7%),radial-gradient(circle_at_75%_62%,rgba(74,144,255,0.32)_0,rgba(74,144,255,0.0)_7%),radial-gradient(circle_at_30%_78%,rgba(74,144,255,0.26)_0,rgba(74,144,255,0.0)_7%),linear-gradient(115deg,transparent_0%,transparent_18%,rgba(116,171,255,0.35)_18.5%,transparent_19.2%,transparent_100%),linear-gradient(150deg,transparent_0%,transparent_34%,rgba(116,171,255,0.24)_34.6%,transparent_35.2%,transparent_100%),linear-gradient(72deg,transparent_0%,transparent_56%,rgba(116,171,255,0.2)_56.4%,transparent_57%,transparent_100%)]" />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8e6ff] bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#2563eb] dark:border-[#163243] dark:bg-[#0f2530] dark:text-[#8cc8ff]">
                <Sparkles size={16} />
                {t.badge}
              </div>
              <div className="space-y-5">
                <h1 className="max-w-4xl font-['Space_Grotesk'] text-5xl font-bold leading-[0.95] text-[#0f172a] dark:text-white sm:text-6xl lg:text-[5.6rem]">
                  Ibrahim Tolgar
                  <br />
                  Sasmaz
                </h1>
                <p className="text-xl font-semibold leading-tight text-[#2563eb] dark:text-[#8cc8ff] sm:text-2xl">
                  {t.title}
                </p>
                <p className="max-w-2xl text-[1.02rem] leading-8 text-[#5b667b] dark:text-white/72 sm:text-[1.1rem]">
                  {t.summary}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-[#64748b] dark:text-white/64">
                <a
                  href={`mailto:${personalInfo.email}`}
                  onClick={() =>
                    trackCta(
                      personalInfo.email,
                      "email",
                      `mailto:${personalInfo.email}`,
                      "hero"
                    )
                  }
                  className="inline-flex items-center gap-2 transition hover:text-[#2563eb] dark:hover:text-[#8cc8ff]"
                >
                  <Mail size={18} />
                  {personalInfo.email}
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackCta(
                      t.linkedinLabel,
                      "linkedin",
                      personalInfo.linkedin,
                      "hero"
                    )
                  }
                  className="inline-flex items-center gap-2 transition hover:text-[#2563eb] dark:hover:text-[#8cc8ff]"
                >
                  <ExternalLink size={18} />
                  {t.linkedinLabel}
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackCta("YouTube", "youtube", youtubeUrl, "hero")
                  }
                  className="inline-flex items-center gap-2 transition hover:text-[#2563eb] dark:hover:text-[#8cc8ff]"
                >
                  <Youtube size={18} />
                  YouTube
                </a>
                <span className="inline-flex items-center gap-2">
                  <MapPin size={18} />
                  {t.locationValue}
                </span>
              </div>
              <div>
                <a
                  href={`mailto:${personalInfo.email}`}
                  onClick={() =>
                    trackCta(
                      t.cta,
                      "email",
                      `mailto:${personalInfo.email}`,
                      "hero"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-[1.2rem] bg-[#2563eb] px-7 py-4 text-lg font-bold text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
                >
                  <Mail size={20} />
                  {t.cta}
                </a>
              </div>
            </div>

            <div className="relative flex flex-col items-center gap-0 pt-4 lg:items-end lg:pt-0">
              <div className="w-full max-w-[430px] rounded-[2rem] border border-[#dce7f9] bg-white p-2 shadow-[0_28px_80px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[#102230] dark:shadow-none">
                <div className="relative overflow-hidden rounded-[1.6rem]">
                  {heroPhotos.map((photo, index) => (
                    <img
                      key={photo}
                      src={photo}
                      alt={personalInfo.name}
                      className={`absolute inset-0 aspect-[4/4.8] w-full object-cover object-top transition-opacity duration-700 ${index === heroPhotoIndex ? "opacity-100" : "opacity-0"}`}
                    />
                  ))}
                  <div className="relative aspect-[4/4.8] w-full" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {heroPhotos.map((photo, index) => (
                      <button
                        key={photo}
                        type="button"
                        onClick={() => setHeroPhotoIndex(index)}
                        className={`h-2.5 rounded-full transition ${index === heroPhotoIndex ? "w-8 bg-white" : "w-2.5 bg-white/55"}`}
                        aria-label={`${t.heroPhotoLabel} ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 -mt-7 grid w-full max-w-[540px] gap-4 sm:grid-cols-2 lg:-mt-12">
                {heroMetrics.map(metric => (
                  <div
                    key={metric.label}
                    className="rounded-[1.8rem] border border-[#dce7f9] bg-white px-6 py-5 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102230] dark:shadow-none"
                  >
                    <AnimatedMetric
                      value={metric.value}
                      colorClass="text-[#2563eb] dark:text-[#8cc8ff]"
                    />
                    <div className="mt-2 text-lg leading-7 text-[#64748b] dark:text-white/62">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <SectionHeading
            eyebrow={t.aboutEyebrow}
            title={t.aboutTitle}
            dark={theme === "dark"}
          />
          <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <Reveal className="rounded-[2rem] border border-[#314760] bg-[#152a3b] p-8 shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
              <div className="grid gap-14 text-[1.1rem] leading-9 text-white/84">
                <p>{t.aboutBody1}</p>
                <p>{t.aboutBody2}</p>
                <p>{t.aboutBody3 ?? t.summary}</p>
              </div>
            </Reveal>

            <div className="grid gap-4">
              <Reveal className="rounded-[2rem] border border-[#314760] bg-[#152a3b] p-5 shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
                <div className="mb-5 flex items-center gap-3">
                  <GraduationCap size={18} className="text-[#9fd0ff]" />
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white">
                    {t.educationTitle}
                  </h3>
                </div>
                <div className="grid gap-4">
                  {education.map(item => (
                    <div
                      key={item.degree}
                      className="flex gap-4 rounded-[1.35rem] border border-[#314760] bg-[#1a3143] p-4"
                    >
                      {item.logo ? (
                        <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1rem] bg-white p-2">
                          <img
                            src={item.logo}
                            alt={item.school}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1rem] bg-white font-['Space_Grotesk'] text-2xl font-bold text-[#2563eb]">
                          IU
                        </div>
                      )}
                      <div>
                        <h4 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                          {item.degree}
                        </h4>
                        <p className="text-sm font-semibold text-[#7cc0ff]">
                          {item.school}
                        </p>
                        <p className="mt-1 text-sm text-white/56">
                          {item.period} | {item.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal className="rounded-[2rem] border border-[#314760] bg-[#152a3b] p-5 shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
                <div className="mb-5 flex items-center gap-3">
                  <Languages size={18} className="text-[#9fd0ff]" />
                  <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white">
                    {t.languagesTitle}
                  </h3>
                </div>
                <div className="grid gap-4">
                  {languageLevels[language].map(item => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">
                          {item.name}
                        </span>
                        <span className="text-white/56">{item.level}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-[#8cc8ff]"
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal className="mt-4 rounded-[2rem] border border-[#314760] bg-[#152a3b] p-8 shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
            <div className="mb-5 font-['Space_Grotesk'] text-[2rem] font-bold text-white">
              {t.aboutCompetenciesTitle}
            </div>
            <div className="flex flex-wrap gap-3">
              {aboutTags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full border border-[#3c546d] bg-[#22384a] px-4 py-2 text-sm font-semibold text-white/84"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        <section
          id="journey"
          ref={journeyRef}
          className="bg-white py-20 dark:bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t.journeyEyebrow}
              title={t.journeyTitle}
              dark={false}
            />
            <div className="rounded-[2rem] border border-[#dce7f9] bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
              <div className="relative overflow-hidden px-2 pt-4 pb-3 sm:px-4 lg:px-6">
                <div className="absolute left-6 right-6 top-[8.9rem] h-1 rounded-full bg-[#d8e6ff] sm:left-8 sm:right-8 lg:left-10 lg:right-10" />
                <div className="absolute left-6 right-6 top-[8.9rem] h-1 overflow-hidden rounded-full sm:left-8 sm:right-8 lg:left-10 lg:right-10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#60a5fa_100%)] transition-[width] duration-[1400ms] ease-out"
                    style={{ width: `${journeyProgress * 100}%` }}
                  />
                </div>
                <div
                  className="relative grid gap-3 sm:gap-4 lg:gap-6"
                  style={{
                    gridTemplateColumns: `repeat(${orderedCareerTimeline.length}, minmax(0, 1fr))`,
                  }}
                >
                  {orderedCareerTimeline.map((item, index) => {
                    const itemProgress =
                      orderedCareerTimeline.length === 1
                        ? 1
                        : index / (orderedCareerTimeline.length - 1);
                    const isHighlighted =
                      Math.abs(journeyProgress - itemProgress) < 0.07 ||
                      journeyProgress > itemProgress;
                    return (
                      <button
                        key={`${item.year}-${item.company}`}
                        type="button"
                        onClick={() => {
                          trackEvent("experience_click", {
                            company_name: getExperienceCompanyLabel(item),
                            role_title: item.role,
                            experience_period: item.year,
                            section_name: "journey",
                          });
                          setExperienceModal(item);
                        }}
                        className="group flex min-w-0 flex-col items-center text-center"
                      >
                        <div
                          className={`min-h-[96px] whitespace-pre-line text-sm font-bold leading-tight sm:min-h-[88px] sm:text-[0.95rem] lg:text-[1.02rem] ${isHighlighted ? "text-[#0f172a]" : "text-[#4b5b72]"}`}
                        >
                          {item.role}
                        </div>
                        <div
                          className={`relative z-10 mt-3 flex h-[68px] w-[68px] items-center justify-center rounded-full border-[6px] shadow-[0_14px_26px_rgba(15,23,42,0.12)] transition-all duration-500 group-hover:scale-[1.12] group-hover:animate-pulse sm:h-[74px] sm:w-[74px] lg:h-[82px] lg:w-[82px] ${getTimelineNodeClass(item.company)} ${isHighlighted ? "scale-[1.08] border-[#cfe1ff]" : "border-[#eef3fa]"}`}
                        >
                          <div
                            className={`flex h-[44px] w-[44px] items-center justify-center rounded-[0.35rem] sm:h-[48px] sm:w-[48px] lg:h-[52px] lg:w-[52px] ${getTimelineLogoSurfaceClass(item.company)}`}
                          >
                            <img
                              src={item.logo}
                              alt={item.company}
                              className="max-h-[34px] max-w-[34px] object-contain sm:max-h-[36px] sm:max-w-[36px] lg:max-h-[40px] lg:max-w-[40px]"
                            />
                          </div>
                        </div>
                        <div
                          className={`mt-4 min-h-[2.5rem] text-base font-medium sm:text-[1.05rem] lg:text-lg ${isHighlighted ? "text-[#0f172a]" : "text-[#66768e]"}`}
                        >
                          {getTimelineDisplayDate(item.year)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Reveal
                key={`${activeCareer.company}-${activeCareer.year}`}
                className="hidden mx-auto mt-2 max-w-4xl overflow-hidden rounded-[1.9rem] border border-[#dce7f9] bg-[#f8fbff] shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#163243] dark:shadow-none"
              >
                <div className="flex flex-wrap items-center gap-4 border-b border-[#dce7f9] bg-[linear-gradient(180deg,#dbeafe_0%,#cfe2ff_100%)] px-6 py-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,#17364a_0%,#163243_100%)]">
                  <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.2rem] bg-white p-2">
                    <img
                      src={activeCareer.logo}
                      alt={activeCareer.company}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="whitespace-pre-line font-['Space_Grotesk'] text-[2rem] font-bold text-[#0f172a] dark:text-white">
                      {activeCareer.role}
                    </h3>
                    <p className="mt-2 text-2xl text-[#2563eb] dark:text-[#8cc8ff]">
                      {getExperienceCompanyLabel(activeCareer)}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeCareerDetailCards.map(card => (
                      <CareerMetaCard
                        key={`${card.label}-${card.value}`}
                        label={card.label}
                        value={card.value}
                        dark={theme === "dark"}
                      />
                    ))}
                  </div>
                  <div className="mt-8 font-['Space_Grotesk'] text-2xl font-bold text-[#0f172a] dark:text-white">
                    {t.keyResponsibilities}
                  </div>
                  <div className="mt-5 grid gap-4">
                    {activeCareer.bullets.map(bullet => (
                      <Reveal key={bullet} className="flex gap-4 text-left">
                        <span className="text-2xl leading-none text-[#2563eb] dark:text-[#8cc8ff]">
                          ✓
                        </span>
                        <p className="text-lg leading-8 text-[#415166] dark:text-white/80">
                          {bullet}
                        </p>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="impact"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <SectionHeading
            eyebrow={t.impactEyebrow}
            title={t.impactTitle}
            dark={theme === "dark"}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title={t.impactSubtitle}
              icon={
                <Sparkles
                  size={18}
                  className="text-[#2563eb] dark:text-[#8cc8ff]"
                />
              }
              dark={theme === "dark"}
            >
              <ImpactChart
                labels={t.measurableLabels}
                values={measurableImpactValues}
                dark={theme === "dark"}
              />
            </Panel>
            <Panel
              title={t.competencyTitle}
              icon={
                <BriefcaseBusiness
                  size={18}
                  className="text-[#2563eb] dark:text-[#8cc8ff]"
                />
              }
              dark={theme === "dark"}
            >
              <RadarChart skills={t.competencies} dark={theme === "dark"} />
            </Panel>
          </div>
        </section>

        <section
          id="products"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <SectionHeading
            title={portfolioSection.eyebrow}
            description={portfolioSection.title}
            dark={theme === "dark"}
          />
          <div className="space-y-12">
            <div>
              <SubsectionHeader
                title={t.vibeCodingTitle ?? "Vibe Coding"}
                dark={theme === "dark"}
              />
              <Carousel cards={vibeCards} />
            </div>
            <div>
              <SubsectionHeader
                title={t.powerAppsTitle ?? "Power Apps"}
                description={t.powerAppsSubtitle ?? ""}
                dark={theme === "dark"}
              />
              <Carousel cards={powerAppCards} />
            </div>
            <div>
              <SubsectionHeader
                title={t.videoTitle}
                description={t.videoSubtitle}
                dark={theme === "dark"}
              />
              <Carousel cards={videoCards} />
            </div>
          </div>
        </section>

        <section
          id="work"
          className="border-y border-[#dce6f5] bg-white py-20 dark:border-white/10 dark:bg-[#081920]"
        >
          <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title={t.workEyebrow}
              description={t.workTitle}
              dark={theme === "dark"}
            />
            <div>
              <SubsectionHeader
                title={t.awardsTitle ?? "Awards"}
                dark={theme === "dark"}
              />
              <div className="grid gap-4 lg:grid-cols-3">
                {awardsList.map(award => (
                  <Reveal
                    key={award.title}
                    className="rounded-[1.75rem] border border-[#dce7f9] bg-[#fbfdff] p-6 shadow-[0_16px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#102230] dark:shadow-none"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d6] text-[#b97300] dark:bg-[#2b2414] dark:text-[#ffd571]">
                      {getAwardIcon(award.level)}
                    </div>
                    <div className="inline-flex rounded-full bg-[#fff1c9] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#b97300]">
                      {award.level}
                    </div>
                    <h4 className="mt-5 font-['Space_Grotesk'] text-2xl font-bold text-[#0f172a] dark:text-white">
                      {award.title}
                    </h4>
                    <p className="mt-2 text-lg italic text-[#5f6d83] dark:text-white/62">
                      {award.subtitle}
                    </p>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb] dark:text-[#8cc8ff]">
                      {award.org}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <SubsectionHeader
                title={t.caseStudiesTitle ?? "Selected Case Studies"}
                dark={theme === "dark"}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {caseStudies.map(study => (
                  <Reveal key={study.brand}>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        trackEvent("project_click", {
                          project_name: study.brand,
                          project_category: "case_study",
                          project_url: study.url,
                          section_name: "case_studies",
                        });
                        trackCta(
                          t.openCase,
                          "case_study",
                          study.url,
                          "case_studies"
                        );
                      }}
                      className="block rounded-[1.75rem] border border-[#dce7f9] bg-[#fbfdff] p-6 transition hover:-translate-y-1 hover:border-[#c9daf6] hover:shadow-[0_16px_30px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-[#102230] dark:hover:border-white/20 dark:hover:shadow-none"
                    >
                      <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563eb] dark:text-[#8cc8ff]">
                        {t.caseStudyLabel}
                      </div>
                      <h3 className="mt-4 font-['Space_Grotesk'] text-xl font-bold text-[#0f172a] dark:text-white">
                        {study.brand}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#556273] dark:text-white/72">
                        {study.result}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb] dark:text-[#8cc8ff]">
                        {t.openCase}
                        <ExternalLink size={14} />
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <SubsectionHeader
                title={t.speakingTitle}
                dark={theme === "dark"}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {speaking.map(item => (
                  <Reveal key={`${item.title}-${item.org}`} className="h-full">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        trackCta(item.title, "speaking", item.url, "speaking")
                      }
                      className="block h-full rounded-[1.75rem] border border-[#dce7f9] bg-[#fbfdff] p-6 transition hover:-translate-y-1 hover:border-[#c9daf6] hover:shadow-[0_16px_30px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-[#102230] dark:hover:border-white/20 dark:hover:shadow-none"
                    >
                      <div className="flex h-full min-h-[20rem] flex-col">
                        <div className="flex items-start gap-4">
                          <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.25rem] bg-white p-3 dark:bg-white/90">
                            <img
                              src={item.logo}
                              alt={item.org}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="inline-flex rounded-full bg-[#def6e8] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0d9f4f]">
                              {item.title}
                            </div>
                            <h4 className="mt-3 font-['Space_Grotesk'] text-xl font-bold text-[#0f172a] dark:text-white">
                              {item.org}
                            </h4>
                            <p className="mt-3 text-sm leading-7 text-[#556273] dark:text-white/72">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="tools"
          className="border-y border-[#dce6f5] bg-white/84 py-20 backdrop-blur-[2px] dark:border-white/10 dark:bg-[#081920]/86"
        >
          <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title={competenciesSection.eyebrow}
              description={competenciesSection.title}
              dark={theme === "dark"}
            />
            <div>
              <SubsectionHeader
                title={competenciesSection.technologyStack}
                dark={theme === "dark"}
              />
              <Carousel cards={toolCards} />
            </div>
            <div>
              <SubsectionHeader
                title={competenciesSection.advancedCertifications}
                dark={theme === "dark"}
              />
              <Carousel cards={certificationCards} />
            </div>
          </div>
        </section>

        <section
          id="blog"
          className="border-b border-[#dce6f5] bg-[#f8fbff]/88 py-20 backdrop-blur-[2px] dark:border-white/10 dark:bg-[#0b1f29]/88"
        >
          <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="BLOG"
              description={
                language === "de"
                  ? "Operator-Notizen zu KI-Marketing, E-Commerce-Wachstum, Performance-Systemen und echter Umsetzung."
                  : language === "tr"
                    ? "Yapay zeka pazarlaması, e-ticaret büyümesi, performans sistemleri ve gerçek uygulama mantığı üzerine operator notları."
                    : "Operator notes on AI marketing, e-commerce growth, performance systems and real execution logic."
              }
              dark={theme === "dark"}
            />
            {blogCards.length ? (
              <Carousel cards={blogCards} />
            ) : (
              <Reveal
                className={`rounded-[1.75rem] border p-8 text-center ${
                  theme === "dark"
                    ? "border-white/10 bg-[#102230] text-white/68"
                    : "border-[#dce7f9] bg-white text-[#5b667b]"
                }`}
              >
                Blog content is being prepared.
              </Reveal>
            )}
          </div>
        </section>

        <section
          id="contact"
          className="border-t border-[#dce6f5] bg-[#edf3fb] dark:border-white/10 dark:bg-[#07141c]"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-[#d8e6ff] bg-[#eef4ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#2563eb] dark:border-[#163243] dark:bg-[#0f2530] dark:text-[#8cc8ff]">
                {t.contactEyebrow}
              </div>
              <h2 className="max-w-5xl font-['Space_Grotesk'] text-[2.2rem] font-bold leading-tight text-[#0f172a] dark:text-white sm:text-[2.8rem] lg:text-[4rem]">
                {t.contactTitle}
              </h2>
              <p className="max-w-4xl text-[1.02rem] font-normal leading-8 text-[#5b667b] dark:text-white/68">
                {t.contactBody}
              </p>
            </div>
            <div className="grid gap-4">
              <ContactCard
                icon={<Mail size={18} />}
                label={t.emailLabel}
                value={personalInfo.email}
                href={`mailto:${personalInfo.email}`}
                onClick={() =>
                  trackCta(
                    t.emailLabel,
                    "email",
                    `mailto:${personalInfo.email}`,
                    "contact"
                  )
                }
                dark={theme === "dark"}
              />
              <ContactCard
                icon={<Linkedin size={18} />}
                label={t.linkedinLabel}
                value="/ibrahim-tolgar-sasmaz"
                href={personalInfo.linkedin}
                onClick={() =>
                  trackCta(
                    t.linkedinLabel,
                    "linkedin",
                    personalInfo.linkedin,
                    "contact"
                  )
                }
                dark={theme === "dark"}
              />
              <ContactCard
                icon={<Youtube size={18} />}
                label="YouTube"
                value="AI-SWERS"
                href={youtubeUrl}
                onClick={() =>
                  trackCta("YouTube", "youtube", youtubeUrl, "contact")
                }
                dark={theme === "dark"}
              />
              <ContactCard
                icon={<Globe size={18} />}
                label={t.websiteLabel}
                value="sasmaz.digital"
                href="https://www.sasmaz.digital"
                onClick={() =>
                  trackCta(
                    t.websiteLabel,
                    "website",
                    "https://www.sasmaz.digital",
                    "contact"
                  )
                }
                dark={theme === "dark"}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dce6f5] bg-white px-4 py-6 text-sm text-[#64748b] dark:border-white/10 dark:bg-[#07141c] dark:text-white/48 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {personalInfo.name} | {t.footer}
          </p>
          <p>www.sasmaz.digital</p>
        </div>
      </footer>

      {mediaModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02080b]/88 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#041118] shadow-2xl shadow-black/40">
            <button
              type="button"
              onClick={() => setMediaModal(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/35 text-white"
            >
              <X size={18} />
            </button>
            <div className="border-b border-white/8 px-6 py-5 pr-16">
              <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
                {mediaModal.title}
              </h3>
            </div>
            <div
              className={
                mediaModal.type === "detail"
                  ? "max-h-[calc(90vh-6rem)] overflow-y-auto bg-[#041118]"
                  : "aspect-video w-full bg-black"
              }
            >
              {mediaModal.type === "youtube" ? (
                <iframe
                  src={toYoutubeEmbed(mediaModal.url)}
                  title={mediaModal.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : mediaModal.type === "detail" ? (
                <div className="p-6 sm:p-8">
                  {mediaModal.images?.length ? (
                    <div
                      className={`grid gap-4 ${
                        mediaModal.images.length > 1
                          ? "md:grid-cols-[1.45fr_0.55fr]"
                          : "grid-cols-1"
                      }`}
                    >
                      {mediaModal.images.map((image, index) => (
                        <div
                          key={image}
                          className={`overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#06151b] ${
                            index === 0
                              ? "aspect-[16/9]"
                              : "min-h-[18rem] md:min-h-0"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${mediaModal.title} — ${index + 1}`}
                            className={`h-full w-full ${
                              index === 0 ? "object-cover" : "object-contain"
                            } object-center`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : mediaModal.image ? (
                    <div className="aspect-[16/9] max-h-[32rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#06151b]">
                      <img
                        src={mediaModal.image}
                        alt={mediaModal.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  ) : null}
                  <div className="mt-6 space-y-5">
                    {mediaModal.body.map((paragraph, index) =>
                      isDetailSectionHeading(paragraph) ? (
                        <h4
                          key={`${paragraph}-${index}`}
                          className="pt-3 font-['Space_Grotesk'] text-xl font-bold text-white"
                        >
                          {paragraph}
                        </h4>
                      ) : (
                        <div
                          key={`${paragraph}-${index}`}
                          className="flex gap-3 text-[1.02rem] leading-8 text-white/84"
                        >
                          <span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-[#8cc8ff]" />
                          <p>{paragraph}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <video
                  src={mediaModal.url}
                  controls
                  autoPlay
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {experienceModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02080b]/72 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#dce7f9] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.24)] max-h-[90vh]">
            <button
              type="button"
              onClick={() => setExperienceModal(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#dce7f9] bg-white text-[#0f172a]"
              aria-label={t.closeCareerDetail}
            >
              <X size={18} />
            </button>
            <button
              type="button"
              onClick={() =>
                setExperienceModal(
                  getRelativeCareer(orderedCareerTimeline, experienceModal, -1)
                )
              }
              className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#dce7f9] bg-white/95 text-[#0f172a] shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:border-[#2563eb] hover:text-[#2563eb]"
              aria-label={t.previousCareerDetail}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() =>
                setExperienceModal(
                  getRelativeCareer(orderedCareerTimeline, experienceModal, 1)
                )
              }
              className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#dce7f9] bg-white/95 text-[#0f172a] shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:border-[#2563eb] hover:text-[#2563eb]"
              aria-label={t.nextCareerDetail}
            >
              <ChevronRight size={22} />
            </button>
            <div className="flex flex-wrap items-center gap-4 border-b border-[#dce7f9] bg-[linear-gradient(180deg,#dbeafe_0%,#cfe2ff_100%)] px-6 py-6">
              <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.2rem] bg-white p-2">
                <img
                  src={experienceModal.logo}
                  alt={experienceModal.company}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h3 className="whitespace-pre-line font-['Space_Grotesk'] text-[2rem] font-bold leading-tight text-[#0f172a]">
                  {experienceModal.role}
                </h3>
                <p className="mt-2 text-2xl text-[#2563eb]">
                  {getExperienceCompanyLabel(experienceModal)}
                </p>
              </div>
            </div>
            <div className="max-h-[calc(90vh-9rem)] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {experienceDetailCards.map(card => (
                  <CareerMetaCard
                    key={`${card.label}-${card.value}`}
                    label={card.label}
                    value={card.value}
                    dark={false}
                  />
                ))}
              </div>
              <p className="mt-8 text-lg leading-8 text-[#415166]">
                {experienceModal.focus}
              </p>

              {experienceModal.keySystems?.length ? (
                <div className="mt-8">
                  <div className="font-['Space_Grotesk'] text-2xl font-bold text-[#0f172a]">
                    {t.keySystems}
                  </div>
                  <div className="mt-5 grid gap-4">
                    {experienceModal.keySystems.map(item => (
                      <div key={item.title} className="flex gap-4 text-left">
                        <span className="mt-3 h-2.5 w-2.5 flex-shrink-0 rotate-45 bg-[#2563eb]" />
                        <p className="text-lg leading-8 text-[#415166]">
                          <span className="font-bold text-[#0f172a]">
                            {item.title}:{" "}
                          </span>
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {experienceModal.coreResponsibilities?.length ? (
                <div className="mt-8">
                  <div className="font-['Space_Grotesk'] text-2xl font-bold text-[#0f172a]">
                    {t.coreResponsibilities}
                  </div>
                  <div className="mt-5 grid gap-3">
                    {experienceModal.coreResponsibilities.map(
                      responsibility => (
                        <div
                          key={responsibility}
                          className="flex gap-4 text-left"
                        >
                          <span className="mt-1 text-xl font-bold leading-8 text-[#2563eb]">
                            &gt;
                          </span>
                          <p className="text-lg leading-8 text-[#415166]">
                            {responsibility}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {!experienceModal.keySystems?.length ? (
                <>
                  <div className="mt-8 font-['Space_Grotesk'] text-2xl font-bold text-[#0f172a]">
                    {t.keyResponsibilities}
                  </div>
                  <div className="mt-5 grid gap-4">
                    {experienceModal.bullets.map(bullet => (
                      <div key={bullet} className="flex gap-4 text-left">
                        <span className="mt-3 h-2.5 w-2.5 flex-shrink-0 rotate-45 bg-[#2563eb]" />
                        <p className="text-lg leading-8 text-[#415166]">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  dark,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  dark: boolean;
}) {
  return (
    <Reveal className="mb-10 space-y-3">
      {eyebrow ? (
        <p
          className={`text-xs font-bold uppercase tracking-[0.3em] ${dark ? "text-[#8cc8ff]" : "text-[#2563eb]"}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`max-w-5xl font-['Space_Grotesk'] text-[2.2rem] font-bold leading-tight sm:text-[2.8rem] lg:text-[4rem] ${dark ? "text-white" : "text-[#0f172a]"}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`max-w-4xl text-[1.02rem] font-normal leading-8 ${dark ? "text-white/68" : "text-[#5b667b]"}`}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

function SubsectionHeader({
  title,
  description,
  dark,
}: {
  title: string;
  description?: string;
  dark: boolean;
}) {
  return (
    <div className="mb-6 space-y-2">
      <h3
        className={`font-['Space_Grotesk'] text-[2rem] font-bold leading-tight ${dark ? "text-white" : "text-[#0f172a]"}`}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={`max-w-4xl text-[1.02rem] font-normal leading-8 ${dark ? "text-white/68" : "text-[#5b667b]"}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  dark,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  dark: boolean;
}) {
  return (
    <Reveal
      className={`rounded-[1.75rem] border p-6 ${dark ? "border-white/10 bg-[#102230]" : "border-[#dce7f9] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.05)]"}`}
    >
      <div className="mb-5 flex items-center gap-3">
        {icon}
        <h3
          className={`font-['Space_Grotesk'] text-xl font-bold ${dark ? "text-white" : "text-[#0f172a]"}`}
        >
          {title}
        </h3>
      </div>
      <div className="grid gap-4">{children}</div>
    </Reveal>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  onClick,
  dark,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  onClick?: () => void;
  dark: boolean;
}) {
  const content = (
    <div
      className={`flex min-w-[280px] items-center gap-4 rounded-[1.5rem] border p-5 transition hover:-translate-y-1 ${dark ? "border-white/10 bg-[#102230] hover:border-white/20" : "border-[#dce7f9] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)] hover:border-[#cadcf6] hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? "bg-[#0f2530] text-[#8cc8ff]" : "bg-[#eef4ff] text-[#2563eb]"}`}
      >
        {icon}
      </div>
      <div>
        <div
          className={`text-xs font-bold uppercase tracking-[0.22em] ${dark ? "text-white/40" : "text-[#7a8699]"}`}
        >
          {label}
        </div>
        <div
          className={`mt-1 text-sm font-semibold ${dark ? "text-white" : "text-[#0f172a]"}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick}>
      {content}
    </a>
  ) : (
    content
  );
}

function CareerMetaCard({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark: boolean;
}) {
  return (
    <Reveal
      className={`rounded-[1.25rem] border p-4 ${dark ? "border-white/10 bg-white/4" : "border-[#dce7f9] bg-white"}`}
    >
      <div className={`text-sm ${dark ? "text-white/56" : "text-[#7a8699]"}`}>
        {label}
      </div>
      <div
        className={`mt-1 text-xl font-semibold ${dark ? "text-white" : "text-[#0f172a]"}`}
      >
        {value}
      </div>
    </Reveal>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function AnimatedMetric({
  value,
  colorClass,
}: {
  value: string;
  colorClass: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const renderedValue = useAnimatedMetricValue(value, visible);
  return (
    <div
      ref={ref}
      className={`font-['Space_Grotesk'] text-4xl font-bold tracking-tight sm:text-5xl ${colorClass}`}
    >
      {renderedValue}
    </div>
  );
}

function useAnimatedMetricValue(value: string, active: boolean) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!active) {
      setDisplay(preserveAffixes(value, 0));
      return;
    }
    const { numeric, decimals, prefix, suffix } = splitMetricValue(value);
    if (numeric === null) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const duration = 1200;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(
        `${prefix}${formatMetricNumber(numeric * eased, decimals)}${suffix}`
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return display;
}

function splitMetricValue(value: string) {
  const match = value.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return { prefix: "", numeric: null, suffix: value, decimals: 0 };
  const [, prefix, numericPart, suffix] = match;
  return {
    prefix,
    numeric: Number(numericPart),
    suffix,
    decimals: numericPart.includes(".") ? numericPart.split(".")[1]!.length : 0,
  };
}

function formatMetricNumber(value: number, decimals: number) {
  const rounded =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return rounded.replace(/\.0+$/, "");
}

function preserveAffixes(value: string, numeric: number) {
  const parts = splitMetricValue(value);
  if (parts.numeric === null) return value;
  return `${parts.prefix}${formatMetricNumber(numeric, parts.decimals)}${parts.suffix}`;
}

function ImpactChart({
  labels,
  values,
  dark,
}: {
  labels: readonly string[];
  values: readonly number[];
  dark: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const colors = [
    "#9f0023",
    "#ffe89a",
    "#1f4873",
    "#18d23e",
    "#4280e8",
    "#ff9314",
  ];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const chartHeight = 290;

  return (
    <div ref={ref} className="grid grid-cols-6 items-end gap-3 pt-4 sm:gap-4">
      {labels.map((label, index) => {
        const isActive = activeIndex === index;
        const normalizedHeight = Math.max(
          (values[index] / 70) * chartHeight,
          92
        );
        return (
          <div
            key={label}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            className="group relative flex h-[27rem] flex-col justify-end text-center"
            tabIndex={0}
          >
            {isActive ? (
              <div
                className={`absolute left-1/2 top-3 z-10 min-w-[10rem] -translate-x-1/2 rounded-[1.4rem] border px-5 py-4 text-left shadow-xl ${dark ? "border-white/10 bg-[#102230] text-white" : "border-[#e4ecf8] bg-white text-[#0f172a]"}`}
              >
                <div className="font-['Space_Grotesk'] text-lg font-bold leading-tight">
                  {label}
                </div>
                <div className="mt-1 text-2xl font-bold text-[#2563eb]">{`+${values[index]}%`}</div>
              </div>
            ) : null}
            <div className="relative flex h-[22rem] items-end justify-center">
              <div className="absolute inset-x-3 bottom-0 top-2 rounded-t-[1rem] border-x border-t border-dashed border-[#d5dfef] dark:border-white/10" />
              <div
                className="relative z-10 mt-auto w-[76%] rounded-t-[2rem] shadow-[0_18px_30px_rgba(15,23,42,0.10)] transition-all duration-1000 ease-out group-hover:-translate-y-1"
                style={{
                  height: visible ? `${normalizedHeight}px` : "0px",
                  backgroundColor: colors[index],
                  transitionDelay: `${index * 90}ms`,
                }}
              />
            </div>
            <div
              className={`mt-4 text-sm leading-5 sm:text-[0.95rem] ${dark ? "text-white/72" : "text-[#5f6d83]"}`}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RadarChart({
  skills,
  dark,
}: {
  skills: ReadonlyArray<{ readonly label: string; readonly value: number }>;
  dark: boolean;
}) {
  const size = 340;
  const center = size / 2;
  const radius = 125;
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const angles = skills.map(
    (_, index) => (Math.PI * 2 * index) / skills.length - Math.PI / 2
  );
  const levelFractions = [0.2, 0.4, 0.6, 0.8, 1];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    let start: number | null = null;
    const duration = 900;
    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const raw = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgress(eased);
      if (raw < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const polygonPoints = skills
    .map((skill, index) => {
      const r = (skill.value / 100) * radius * progress;
      const x = center + Math.cos(angles[index]) * r;
      const y = center + Math.sin(angles[index]) * r;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div ref={ref} className="flex items-center justify-center py-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-[22rem] w-[22rem] overflow-visible"
      >
        {levelFractions.map(fraction => {
          const points = skills
            .map((_, index) => {
              const r = radius * fraction;
              const x = center + Math.cos(angles[index]) * r;
              const y = center + Math.sin(angles[index]) * r;
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={fraction}
              points={points}
              fill="none"
              stroke={dark ? "rgba(255,255,255,0.12)" : "#d8e3f2"}
              strokeWidth="1"
            />
          );
        })}
        {skills.map((_, index) => {
          const x = center + Math.cos(angles[index]) * radius;
          const y = center + Math.sin(angles[index]) * radius;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={dark ? "rgba(255,255,255,0.12)" : "#d8e3f2"}
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={polygonPoints}
          fill="rgba(37,99,235,0.18)"
          stroke="#2563eb"
          strokeWidth="3"
        />
        {skills.map((skill, index) => {
          const r = (skill.value / 100) * radius * progress;
          const x = center + Math.cos(angles[index]) * r;
          const y = center + Math.sin(angles[index]) * r;
          return (
            <circle
              key={`${skill.label}-dot`}
              cx={x}
              cy={y}
              r="4.5"
              fill="#2563eb"
              opacity={0.65 + progress * 0.35}
            />
          );
        })}
        {skills.map((skill, index) => {
          const labelRadius = radius + 24;
          const x = center + Math.cos(angles[index]) * labelRadius;
          const y = center + Math.sin(angles[index]) * labelRadius;
          return (
            <text
              key={skill.label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill={dark ? "rgba(255,255,255,0.72)" : "#6b778c"}
            >
              {skill.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Carousel({ cards }: { cards: CarouselCard[] }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);
  const [visibleCards, setVisibleCards] = useState(1);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) {
        setPerView(3.35);
        setVisibleCards(3);
      } else if (window.innerWidth >= 768) {
        setPerView(2.32);
        setVisibleCards(2);
      } else {
        setPerView(1.14);
        setVisibleCards(1);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, cards.length - visibleCards);
  const goPrev = () => setIndex(current => Math.max(0, current - 1));
  const goNext = () => setIndex(current => Math.min(maxIndex, current + 1));

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
    dragDeltaX.current = 0;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    dragDeltaX.current = event.clientX - dragStartX.current;
  };

  const handlePointerEnd = () => {
    if (dragStartX.current === null) return;
    const threshold = 50;
    if (dragDeltaX.current <= -threshold) {
      goNext();
    } else if (dragDeltaX.current >= threshold) {
      goPrev();
    }
    dragStartX.current = null;
    dragDeltaX.current = 0;
  };

  useEffect(() => {
    setIndex(current => Math.min(current, maxIndex));
  }, [maxIndex]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-3">
        <CarouselArrow
          direction="left"
          onClick={goPrev}
          disabled={index === 0}
        />
        <CarouselArrow
          direction="right"
          onClick={goNext}
          disabled={index >= maxIndex}
        />
      </div>
      <div
        className="overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="flex items-stretch gap-4 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {cards.map(card => (
            <div
              key={card.key}
              className="w-full shrink-0"
              style={{ flexBasis: `${100 / perView}%` }}
            >
              <div className="h-full">{card.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {direction === "left" ? (
        <ChevronLeft size={20} />
      ) : (
        <ChevronRight size={20} />
      )}
    </button>
  );
}
