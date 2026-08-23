import type { SupportedLanguage } from "@/content/homeLocalizationStatic";

type CareerItem = {
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

const deCareerTimeline: Record<string, Partial<CareerItem>> = {
  "Lidyana.com|03/2014 - 01/2015": {
    brand: "Luxus-E-Commerce",
    role: "CRM- & E-Mail-Marketing-Spezialist",
    location: "Istanbul, Türkei",
    focus:
      "Stark umsetzungsorientierte Rolle mit Fokus auf Lifecycle-Kommunikation und Personalisierung im großen Maßstab.",
    meta: [
      "E-Mail- und CRM-Operations",
      "Kampagnenplanung und Segmentierung",
      "Unterstützung des Marketplace-Wachstums",
    ],
    detailCards: [
      { label: "Operativer Fokus", value: "E-Mail- und CRM-Operations" },
      { label: "Kampagnenumfang", value: "Kampagnenplanung und Segmentierung" },
      {
        label: "Wachstumsbeitrag",
        value: "Unterstützung des Marketplace-Wachstums",
      },
    ],
    keySystems: [
      {
        title: "Lifecycle-E-Mail-Struktur",
        body: "Automatisierte E-Mail-Flows aufgebaut, die Wiederkäufe und Nutzerengagement erhöhten.",
      },
      {
        title: "Personalisierungslogik",
        body: "Segmentierungs- und A/B-Testing-Disziplinen eingeführt, die Relevanz und kommerzielle Conversion verbesserten.",
      },
      {
        title: "CRM-Support",
        body: "Automationsschleifen mit aufgebaut, um Konsistenz entlang des gesamten Nutzerlebenszyklus sicherzustellen.",
      },
    ],
    coreResponsibilities: [
      "E-Mail-Marketing, Segmentierung und Deliverability-Management",
      "Umsetzung hochvolumiger CRM-Kampagnen mit klarem ROI-Fokus",
    ],
    bullets: [
      "Lifecycle-E-Mail-Struktur: Automatisierte E-Mail-Flows aufgebaut, die Wiederkäufe und Nutzerengagement erhöhten.",
      "Personalisierungslogik: Segmentierungs- und A/B-Testing-Disziplinen eingeführt, die Relevanz und kommerzielle Conversion verbesserten.",
      "CRM-Support: Automationsschleifen mit aufgebaut, um Konsistenz entlang des gesamten Nutzerlebenszyklus sicherzustellen.",
      "E-Mail-Marketing, Segmentierung und Deliverability-Management",
      "Umsetzung hochvolumiger CRM-Kampagnen mit klarem ROI-Fokus",
    ],
  },
  "Emarsys|01/2015 - 05/2016": {
    brand: "SAP Marketing Cloud",
    role: "Client\nManager",
    location: "Istanbul, Türkei",
    focus:
      "Beratungsrolle auf Enterprise-Niveau für globale Marken in Marketing-Automation, Retention und Lifecycle Economics.",
    meta: [
      "Enterprise-Kundenmandate",
      "E-Mail-Deliverability und Automation",
      "Workshops, Reporting und Integrationen",
    ],
    detailCards: [
      { label: "Kundenportfolio", value: "Enterprise-Kundenmandate" },
      {
        label: "Plattformfokus",
        value: "E-Mail-Deliverability und Automation",
      },
      { label: "Enablement", value: "Workshops, Reporting und Integrationen" },
    ],
    keySystems: [
      {
        title: "Lifecycle-Journey-Architektur",
        body: "Journey-Strukturen entworfen, die Kundenengagement und Retention verbesserten.",
      },
      {
        title: "Subscription Economics",
        body: "Modelle für wiederkehrende Umsätze und Churn-Reduktion entwickelt und damit Stabilität und LTV-Wachstum unterstützt.",
      },
      {
        title: "Platform Enablement",
        body: "Reporting- und Enablement-Strukturen aufgebaut, die Plattformnutzung und Entscheidungsqualität bei Enterprise-Kunden verbesserten.",
      },
    ],
    coreResponsibilities: [
      "CRM-Beratung, Marketing-Automation und Segmentierung",
      "Strategische Planung für Retention und abonnementbasierte Geschäftsmodelle",
    ],
    bullets: [
      "Lifecycle-Journey-Architektur: Journey-Strukturen entworfen, die Kundenengagement und Retention verbesserten.",
      "Subscription Economics: Modelle für wiederkehrende Umsätze und Churn-Reduktion entwickelt und damit Stabilität und LTV-Wachstum unterstützt.",
      "Platform Enablement: Reporting- und Enablement-Strukturen aufgebaut, die Plattformnutzung und Entscheidungsqualität bei Enterprise-Kunden verbesserten.",
      "CRM-Beratung, Marketing-Automation und Segmentierung",
      "Strategische Planung für Retention und abonnementbasierte Geschäftsmodelle",
    ],
  },
  "8digits|05/2016 - 05/2017": {
    brand: "MarTech SaaS",
    role: "Account Manager",
    location: "Istanbul, Türkei",
    focus:
      "Beratungsorientierte Rolle mit Behavioral Diagnostics und CRO-Roadmaps für wachstumsstarke D2C- und Shopify-Unternehmen.",
    meta: [
      "Multi-Vertical-Kundenportfolio",
      "CRO-Roadmaps und Funnel-Diagnostik",
      "Jira- / Asana-Projektmanagement",
    ],
    detailCards: [
      { label: "Kundenkontext", value: "Multi-Vertical-Kundenportfolio" },
      {
        label: "Analytischer Fokus",
        value: "CRO-Roadmaps und Funnel-Diagnostik",
      },
      { label: "Delivery", value: "Jira- / Asana-Projektmanagement" },
    ],
    keySystems: [
      {
        title: "D2C-Wachstumsberatung",
        body: "Shopify-spezifische Optimierungsstrategien für Start-ups und Scale-ups entwickelt und Verhaltensdaten in kommerzielle Maßnahmen übersetzt.",
      },
      {
        title: "Funnel-Diagnostik",
        body: "Frameworks aufgebaut, um Reibungspunkte im Nutzerverhalten sichtbar zu machen und Conversion sowie Retention messbar zu verbessern.",
      },
      {
        title: "Optimierungs-Backlogs",
        body: "Wachstumsempfehlungen und Experimentierstrategien über unterschiedliche Kundenportfolios hinweg aufgebaut und gesteuert.",
      },
    ],
    coreResponsibilities: [
      "CRO-Beratung, Behavioral Analytics und Funnel-Diagnostik",
      "Steuerung von Kundenbeziehungen und Umsetzung von Wachstumsstrategien",
    ],
    bullets: [
      "D2C-Wachstumsberatung: Shopify-spezifische Optimierungsstrategien für Start-ups und Scale-ups entwickelt und Verhaltensdaten in kommerzielle Maßnahmen übersetzt.",
      "Funnel-Diagnostik: Frameworks aufgebaut, um Reibungspunkte im Nutzerverhalten sichtbar zu machen und Conversion sowie Retention messbar zu verbessern.",
      "Optimierungs-Backlogs: Wachstumsempfehlungen und Experimentierstrategien über unterschiedliche Kundenportfolios hinweg aufgebaut und gesteuert.",
      "CRO-Beratung, Behavioral Analytics und Funnel-Diagnostik",
      "Steuerung von Kundenbeziehungen und Umsetzung von Wachstumsstrategien",
    ],
  },
  "D&R / idefix|05/2017 - 01/2020": {
    brand: "Retail & Culture Commerce",
    role: "Digital Marketing Specialist",
    location: "Istanbul, Türkei",
    focus:
      "Individuelle Fachrolle mit Fokus auf praktische Optimierung des digitalen Funnels und der Retention-Systeme.",
    meta: [
      "Hands-on-Ausführungsrolle",
      "Fokus auf CRM, Mobile und Retargeting",
      "Segmentierungsgetriebene Retention-Engine",
    ],
    detailCards: [
      { label: "Rollenfokus", value: "Hands-on-Ausführungsrolle" },
      { label: "Kanäle", value: "Fokus auf CRM, Mobile und Retargeting" },
      {
        label: "Wachstumssystem",
        value: "Segmentierungsgetriebene Retention-Engine",
      },
    ],
    keySystems: [
      {
        title: "CRM-Automation",
        body: "Trigger-basierte Kommunikationsflüsse und Lifecycle-Kampagnenstrukturen aufgebaut, die Wiederkäufe stärkten.",
      },
      {
        title: "CRO & A/B-Testing",
        body: "Ein systematisches Experimentierframework etabliert, um Funnel-Engpässe zu identifizieren und Conversion-Performance zu verbessern.",
      },
      {
        title: "SEO & On-Site-Optimierung",
        body: "Funnel-Analyse-Routinen und suchgetriebene Content-Verbesserungen umgesetzt, um organische Akquise zu stärken.",
      },
    ],
    coreResponsibilities: [
      "Steuerung von SEO, CRM-Automation und Retention-Programmen",
      "Lifecycle-Engagement durch datengetriebene Trigger-Kommunikation vorantreiben",
    ],
    bullets: [
      "CRM-Automation: Trigger-basierte Kommunikationsflüsse und Lifecycle-Kampagnenstrukturen aufgebaut, die Wiederkäufe stärkten.",
      "CRO & A/B-Testing: Ein systematisches Experimentierframework etabliert, um Funnel-Engpässe zu identifizieren und Conversion-Performance zu verbessern.",
      "SEO & On-Site-Optimierung: Funnel-Analyse-Routinen und suchgetriebene Content-Verbesserungen umgesetzt, um organische Akquise zu stärken.",
      "Steuerung von SEO, CRM-Automation und Retention-Programmen",
      "Lifecycle-Engagement durch datengetriebene Trigger-Kommunikation vorantreiben",
    ],
  },
  "D&R / idefix|01/2020 - 03/2021": {
    brand: "Retail & Culture Commerce",
    role: "Digital Marketing Manager",
    location: "Istanbul, Türkei",
    focus:
      "Performance und CRM für eines der größten Kultur- und Entertainment-Retail-Ökosysteme der Türkei verantwortet, inklusive 2 FTEs und integrierter Agenturpartner.",
    meta: [
      "2 direkte Mitarbeitende",
      "8-stellige Budgetverantwortung",
      "SEO/SEM, Paid Media, CRM und Mobile Growth",
    ],
    detailCards: [
      { label: "Team", value: "2 direkte Mitarbeitende" },
      { label: "Budget", value: "8-stellige Budgetverantwortung" },
      {
        label: "Funktionsbereich",
        value: "SEO/SEM, Paid Media, CRM und Mobile Growth",
      },
    ],
    keySystems: [
      {
        title: "Preisgekrönte Kampagnen",
        body: "Felis Award 2019, MIXX Awards 2020 und Social Media Awards 2020 für integrierte Kampagnen und Data Analytics gewonnen.",
      },
      {
        title: "Omnichannel-Framework",
        body: "Eine einheitliche Kampagnenstruktur über Web und Mobile aufgebaut und damit Akquise- und Retention-Funnels im High-Volume-Retail optimiert.",
      },
      {
        title: "Segmentierung & ROI",
        body: "Ein Targeting-Modell entwickelt, das Conversion-Effizienz und Umsatzbeitrag messbar steigerte.",
      },
      {
        title: "SEO- & Performance-Integration",
        body: "Organische Suche mit Paid Performance und CRM verzahnt, um den gesamten Nutzerlebenszyklus zu optimieren.",
      },
    ],
    coreResponsibilities: [
      "App Growth, CRM, SEO/SEM und Omnichannel-Mediaplanung",
      "Steuerung wirkungsstarker Kampagnen über Web, Mobile und Retail-Touchpoints hinweg",
    ],
    bullets: [
      "Preisgekrönte Kampagnen: Felis Award 2019, MIXX Awards 2020 und Social Media Awards 2020 für integrierte Kampagnen und Data Analytics gewonnen.",
      "Omnichannel-Framework: Eine einheitliche Kampagnenstruktur über Web und Mobile aufgebaut und damit Akquise- und Retention-Funnels im High-Volume-Retail optimiert.",
      "Segmentierung & ROI: Ein Targeting-Modell entwickelt, das Conversion-Effizienz und Umsatzbeitrag messbar steigerte.",
      "SEO- & Performance-Integration: Organische Suche mit Paid Performance und CRM verzahnt, um den gesamten Nutzerlebenszyklus zu optimieren.",
      "App Growth, CRM, SEO/SEM und Omnichannel-Mediaplanung",
      "Steuerung wirkungsstarker Kampagnen über Web, Mobile und Retail-Touchpoints hinweg",
    ],
  },
  "NAOS Türkiye|03/2021 - 04/2022": {
    brand: "BIODERMA / Institut Esthederm / Etat Pur",
    role: "Digital Marketing Manager",
    location: "Istanbul, Türkei",
    focus:
      "Die digitale Marketingfunktion von Grund auf aufgebaut, ein 6-köpfiges Team rekrutiert und die Grundlagen für Performance, Attribution und skalierbares Wachstum über mehrere Marken gelegt.",
    meta: [
      "6-köpfiges Digital-Team",
      "9-stelliges TRY-Budget",
      "Performance, SEO/SEM, Content und CRO",
    ],
    detailCards: [
      { label: "Team", value: "6-köpfiges Digital-Team" },
      { label: "Budget", value: "9-stelliges TRY-Budget" },
      { label: "Scope", value: "Performance, SEO/SEM, Content und CRO" },
    ],
    keySystems: [
      {
        title: "Funktionsaufbau von Grund auf",
        body: "Ein 6-köpfiges Team aufgebaut und ein skalierbares Ausführungsmodell mit klarer KPI-Governance etabliert.",
      },
      {
        title: "Attribution & Measurement",
        body: "Das erste Attributionsmodell der Marke konzipiert und damit Budgetallokation und Media-Effizienz verbessert.",
      },
      {
        title: "Growth Performance",
        body: "+35 % Website-Traffic-Wachstum und deutlich bessere Sichtbarkeit bei Rankings und Keywords durch SEO-getriebene Lokalisierung erzielt.",
      },
      {
        title: "Conversion & Experimentation",
        body: "Eine CRO-Experimentierlogik und ein Full-Funnel-Kanalframework eingeführt, um Traffic-Qualität und CVR zu verbessern.",
      },
      {
        title: "CRM- & E-Mail-Optimierung",
        body: "Spürbare Steigerungen bei E-Mail-Open-Rates und CTR erzielt, indem Media-, CRM- und E-Commerce-Loops besser verzahnt wurden.",
      },
      {
        title: "Execution Governance",
        body: "Einen strukturierteren Planungs- und Optimierungsrhythmus über Paid Media, SEO/SEM, CRM und E-Commerce hinweg etabliert.",
      },
    ],
    coreResponsibilities: [
      "Verantwortung für Paid Media, Performance Marketing, SEO/SEM und CRO",
      "Aufbau von Media- / CRM-Abstimmungsmodellen und Governance der Ausführung",
    ],
    bullets: [
      "Funktionsaufbau von Grund auf: Ein 6-köpfiges Team aufgebaut und ein skalierbares Ausführungsmodell mit klarer KPI-Governance etabliert.",
      "Attribution & Measurement: Das erste Attributionsmodell der Marke konzipiert und damit Budgetallokation und Media-Effizienz verbessert.",
      "Growth Performance: +35 % Website-Traffic-Wachstum und deutlich bessere Sichtbarkeit bei Rankings und Keywords durch SEO-getriebene Lokalisierung erzielt.",
      "Conversion & Experimentation: Eine CRO-Experimentierlogik und ein Full-Funnel-Kanalframework eingeführt, um Traffic-Qualität und CVR zu verbessern.",
      "CRM- & E-Mail-Optimierung: Spürbare Steigerungen bei E-Mail-Open-Rates und CTR erzielt, indem Media-, CRM- und E-Commerce-Loops besser verzahnt wurden.",
      "Execution Governance: Einen strukturierteren Planungs- und Optimierungsrhythmus über Paid Media, SEO/SEM, CRM und E-Commerce hinweg etabliert.",
      "Verantwortung für Paid Media, Performance Marketing, SEO/SEM und CRO",
      "Aufbau von Media- / CRM-Abstimmungsmodellen und Governance der Ausführung",
    ],
  },
  "NAOS Türkiye|04/2022 - 04/2024": {
    brand: "BIODERMA / Institut Esthederm / Etat Pur",
    role: "Digital Marketing & CRM Manager",
    location: "Istanbul, Türkei",
    focus:
      "Ein 10-köpfiges funktionsübergreifendes Team über Digital, CRM und Analytics geführt und ein integriertes Wachstumsmodell für Akquise, Lifecycle-Management, E-Commerce und Channel-Profitabilität aufgebaut.",
    meta: [
      "10-köpfige Organisation",
      "9-stelliges TRY-Jahresbudget",
      "Multi-Brand-Growth- und CRM-Governance",
    ],
    detailCards: [
      { label: "Organisation", value: "10-köpfige Organisation" },
      { label: "Budget", value: "9-stelliges TRY-Jahresbudget" },
      { label: "Governance", value: "Multi-Brand-Growth- und CRM-Governance" },
    ],
    keySystems: [
      {
        title: "Integriertes Wachstumsmodell",
        body: "Ein Operating Model etabliert, das +20 % Akquise, +69 % LTV-Wachstum und eine Verbesserung des LTV/CAC-Verhältnisses um rund 60 % erzielte.",
      },
      {
        title: "Amazon-Profitabilitätstransformation",
        body: "Auf ein Hybrid-1P-/3P-Modell umgestellt und damit -10 pp OPEX, +8 pp Marge und +19 % Nettogewinn erzielt.",
      },
      {
        title: "Marketplace AI & Experience",
        body: "Chatbot-Workflows eingeführt, die Store Ratings um +25 %, CSAT auf 4,3/5 und die Abschlussrate von Konversationen um +38 % steigerten.",
      },
      {
        title: "Content- & Search-Architektur",
        body: "Brand Stores mit suchgetriebener Architektur neu gestaltet und +50 % First-Page-Visibilität sowie +30 % Verbesserung in den Top-5-Platzierungen erzielt.",
      },
      {
        title: "Datenzentralisierung",
        body: "Die Datenarchitektur über Web, D2C, Mobile und CRM hinweg vereinheitlicht, um Entscheidungen, Retention-Logik und Performance-Transparenz zu beschleunigen.",
      },
      {
        title: "Professionelles Engagement",
        body: "Plattformen für HCP- und Apotheken-Engagement aufgebaut, um Non-Personal Promotion und omnichannel Reichweite zu stärken.",
      },
      {
        title: "Lifecycle- & Segmentierungs-Engine",
        body: "Eine CLV-/LTV-basierte Segmentierungs- und Lifecycle-Orchestrierung etabliert, um Priorisierung, Kundennutzen und Kanaleffizienz zu verbessern.",
      },
    ],
    coreResponsibilities: [
      "Verantwortung für Digital Marketing, CRM, E-Commerce sowie Akquise- / Retention-Funktionen",
      "Modellierung der Channel-Profitabilität über D2C, Web, Marketplace und E-Retail",
    ],
    bullets: [
      "Integriertes Wachstumsmodell: Ein Operating Model etabliert, das +20 % Akquise, +69 % LTV-Wachstum und eine Verbesserung des LTV/CAC-Verhältnisses um rund 60 % erzielte.",
      "Amazon-Profitabilitätstransformation: Auf ein Hybrid-1P-/3P-Modell umgestellt und damit -10 pp OPEX, +8 pp Marge und +19 % Nettogewinn erzielt.",
      "Marketplace AI & Experience: Chatbot-Workflows eingeführt, die Store Ratings um +25 %, CSAT auf 4,3/5 und die Abschlussrate von Konversationen um +38 % steigerten.",
      "Content- & Search-Architektur: Brand Stores mit suchgetriebener Architektur neu gestaltet und +50 % First-Page-Visibilität sowie +30 % Verbesserung in den Top-5-Platzierungen erzielt.",
      "Datenzentralisierung: Die Datenarchitektur über Web, D2C, Mobile und CRM hinweg vereinheitlicht, um Entscheidungen, Retention-Logik und Performance-Transparenz zu beschleunigen.",
      "Professionelles Engagement: Plattformen für HCP- und Apotheken-Engagement aufgebaut, um Non-Personal Promotion und omnichannel Reichweite zu stärken.",
      "Lifecycle- & Segmentierungs-Engine: Eine CLV-/LTV-basierte Segmentierungs- und Lifecycle-Orchestrierung etabliert, um Priorisierung, Kundennutzen und Kanaleffizienz zu verbessern.",
      "Verantwortung für Digital Marketing, CRM, E-Commerce sowie Akquise- / Retention-Funktionen",
      "Modellierung der Channel-Profitabilität über D2C, Web, Marketplace und E-Retail",
    ],
  },
  "NAOS Deutschland|04/2024 - Current": {
    year: "04/2024 - Heute",
    role: "Head of\nDigital",
    location: "München, Deutschland",
    focus:
      "Leitet die Agenda für Digital Commerce, Daten, Analytics und KI bei NAOS Deutschland über DACH hinweg mit funktionsübergreifender Verantwortung für Marketing-, Sales-, Medical- und Commercial-Teams sowie globale Partner und Agenturen.",
    meta: [
      "8-stelliges EUR-Jahresbudget für Digital",
      "Direkt: 1 FTE + funktionsübergreifende Squads",
      "DACH-Transformation und Executive-Stakeholder-Leadership",
    ],
    detailCards: [
      { label: "Budget", value: "8-stelliges EUR-Jahresbudget für Digital" },
      { label: "Team", value: "Direkt: 1 FTE + funktionsübergreifende Squads" },
      {
        label: "Transformationsfokus",
        value: "DACH-Transformation und Executive-Stakeholder-Leadership",
      },
    ],
    keySystems: [
      {
        title: "KI-gestützte Growth Engine",
        body: '"TranslAsset AI" (OCR + LLM + Image Inpainting) für automatisierte Lokalisierung konzipiert und damit -5 % OPEX, +60 % CTR und +25 % CVR erzielt.',
      },
      {
        title: "Pricing & Commercial Intelligence",
        body: "KI-gestützte Preisvalidierung und Wettbewerbs-Benchmarking entwickelt und damit +11 % AOV, +12 pp Buy-Box-Anteil, +14 pp Deckungsbeitrag, +30 % Preis-Compliance und +50 % schnellere Entscheidungen bei 40 % weniger manuellem Pricing-Aufwand erreicht.",
      },
      {
        title: "Retail Media & Growth",
        body: "Eine KI-getriebene Growth Engine aufgebaut, die +35 % Sell-out-Wachstum, +14 pp Deckungsbeitrag und +36 % blended ROAS erzielte.",
      },
      {
        title: "SEO- & PDP-Framework",
        body: "SEO-getriebene Produktbenennung und Full-Funnel-Content-Frameworks etabliert und damit +48 % First-Page-Visibilität sowie +9 pp Add-to-Cart-Rate erreicht.",
      },
      {
        title: "Organisationale Effizienz",
        body: '"Tasky AI" für Feedback-Routing und einen GenAI-gestützten PIM-Assistenten eingeführt, um eine compliant Self-Service-Produktintelligenzschicht aufzubauen.',
      },
      {
        title: "Workflow-Automation",
        body: "Power-Apps- / Power-Automate-Strukturen und KI-gestützte Sales-Planning-Anwendungen ausgerollt. Die E-Rezept-Journey erhöhte die Conversion von ca. 22 % auf 34 %, die Doctor Adoption um 40 % und die Pharmacy Funnel Completion um 25 % und senkte papierbasierten OPEX um 70 %; die KI-Visit-Planung steigerte Außendienstproduktivität um 25–30 %, High-Value-Account-Coverage um 35 % und Routeneffizienz um 20 % bei 40 % weniger Planungszeit.",
      },
      {
        title: "Commercial Visibility",
        body: "Executive-Dashboards und Forecasting-Systeme aufgebaut, um Echtzeitentscheidungen, Planungsdisziplin und funktionsübergreifende KPI-Transparenz zu stärken.",
      },
    ],
    coreResponsibilities: [
      "Full-Funnel Paid Media, CRM Lifecycle, D2C sowie Marketplace- / E-Retail-Wachstum",
      "Executive-Dashboarding und Forecasting für Echtzeit-Commercial-Visibility",
      "Führung der KI-Transformation und DSGVO-konformer digitaler Operations",
    ],
    bullets: [
      'KI-gestützte Growth Engine: "TranslAsset AI" (OCR + LLM + Image Inpainting) für automatisierte Lokalisierung konzipiert und damit -5 % OPEX, +60 % CTR und +25 % CVR erzielt.',
      "Pricing & Commercial Intelligence: KI-gestützte Preisvalidierung und Wettbewerbs-Benchmarking entwickelt und damit +11 % AOV, +12 pp Buy-Box-Anteil, +14 pp Deckungsbeitrag, +30 % Preis-Compliance und +50 % schnellere Entscheidungen bei 40 % weniger manuellem Pricing-Aufwand erreicht.",
      "Retail Media & Growth: Eine KI-getriebene Growth Engine aufgebaut, die +35 % Sell-out-Wachstum, +14 pp Deckungsbeitrag und +36 % blended ROAS erzielte.",
      "SEO- & PDP-Framework: SEO-getriebene Produktbenennung und Full-Funnel-Content-Frameworks etabliert und damit +48 % First-Page-Visibilität sowie +9 pp Add-to-Cart-Rate erreicht.",
      'Organisationale Effizienz: "Tasky AI" für Feedback-Routing und einen GenAI-gestützten PIM-Assistenten eingeführt, um eine compliant Self-Service-Produktintelligenzschicht aufzubauen.',
      "Workflow-Automation: Power-Apps- / Power-Automate-Strukturen und KI-gestützte Sales-Planning-Anwendungen ausgerollt. Die E-Rezept-Journey erhöhte die Conversion von ca. 22 % auf 34 %, die Doctor Adoption um 40 % und die Pharmacy Funnel Completion um 25 % und senkte papierbasierten OPEX um 70 %; die KI-Visit-Planung steigerte Außendienstproduktivität um 25–30 %, High-Value-Account-Coverage um 35 % und Routeneffizienz um 20 % bei 40 % weniger Planungszeit.",
      "Commercial Visibility: Executive-Dashboards und Forecasting-Systeme aufgebaut, um Echtzeitentscheidungen, Planungsdisziplin und funktionsübergreifende KPI-Transparenz zu stärken.",
      "Full-Funnel Paid Media, CRM Lifecycle, D2C sowie Marketplace- / E-Retail-Wachstum",
      "Executive-Dashboarding und Forecasting für Echtzeit-Commercial-Visibility",
      "Führung der KI-Transformation und DSGVO-konformer digitaler Operations",
    ],
  },
};

const trCareerTimeline: Record<string, Partial<CareerItem>> = {
  "Lidyana.com|03/2014 - 01/2015": {
    brand: "Lüks E-Ticaret",
    role: "CRM & E-Posta Pazarlama Uzmanı",
    location: "İstanbul, Türkiye",
    focus:
      "Lifecycle iletişimi ve ölçekli kişiselleştirme odağında, uygulama ağırlıklı bir rol.",
    meta: [
      "E-posta ve CRM operasyonları",
      "Kampanya planlama ve segmentasyon",
      "Marketplace büyümesine destek",
    ],
    detailCards: [
      { label: "Operasyonel Odak", value: "E-posta ve CRM operasyonları" },
      { label: "Kampanya Kapsamı", value: "Kampanya planlama ve segmentasyon" },
      { label: "Büyüme Katkısı", value: "Marketplace büyümesine destek" },
    ],
    keySystems: [
      {
        title: "Lifecycle E-Posta Yapısı",
        body: "Tekrar satın alma davranışını ve kullanıcı etkileşimini artıran otomatik e-posta akışları kurgulandı.",
      },
      {
        title: "Kişiselleştirme Mantığı",
        body: "Mesaj alaka düzeyini ve ticari dönüşümü iyileştiren segmentasyon ve A/B test disiplini uygulandı.",
      },
      {
        title: "CRM Desteği",
        body: "Kullanıcı yaşam döngüsü boyunca tutarlılığı sağlayan otomasyon döngülerinin kurulmasına katkı sağlandı.",
      },
    ],
    coreResponsibilities: [
      "E-posta pazarlaması, segmentasyon ve deliverability yönetimi",
      "ROI odaklı yüksek hacimli CRM kampanyalarının yürütülmesi",
    ],
    bullets: [
      "Lifecycle E-Posta Yapısı: Tekrar satın alma davranışını ve kullanıcı etkileşimini artıran otomatik e-posta akışları kurgulandı.",
      "Kişiselleştirme Mantığı: Mesaj alaka düzeyini ve ticari dönüşümü iyileştiren segmentasyon ve A/B test disiplini uygulandı.",
      "CRM Desteği: Kullanıcı yaşam döngüsü boyunca tutarlılığı sağlayan otomasyon döngülerinin kurulmasına katkı sağlandı.",
      "E-posta pazarlaması, segmentasyon ve deliverability yönetimi",
      "ROI odaklı yüksek hacimli CRM kampanyalarının yürütülmesi",
    ],
  },
  "Emarsys|01/2015 - 05/2016": {
    brand: "SAP Marketing Cloud",
    role: "Müşteri\nYöneticisi",
    location: "İstanbul, Türkiye",
    focus:
      "Global markalara yönelik pazarlama otomasyonu, retention ve lifecycle ekonomisi danışmanlığı verilen kurumsal düzeyde bir rol.",
    meta: [
      "Kurumsal müşteri portföyü",
      "E-posta deliverability ve otomasyon",
      "Workshop, raporlama ve entegrasyonlar",
    ],
    detailCards: [
      { label: "Müşteri Portföyü", value: "Kurumsal müşteri portföyü" },
      { label: "Platform Odağı", value: "E-posta deliverability ve otomasyon" },
      {
        label: "Yetkinleştirme",
        value: "Workshop, raporlama ve entegrasyonlar",
      },
    ],
    keySystems: [
      {
        title: "Lifecycle Journey Mimarisi",
        body: "Müşteri etkileşimini ve elde tutmayı güçlendiren journey yapıları tasarlandı.",
      },
      {
        title: "Abonelik Ekonomisi",
        body: "Tekrarlayan gelir ve churn azaltma modelleri geliştirilerek iş modelinin istikrarı ve LTV büyümesi desteklendi.",
      },
      {
        title: "Platform Yetkinleştirme",
        body: "Kurumsal müşterilerde platform kullanımını ve karar desteğini artıran raporlama ve enablement yapıları kuruldu.",
      },
    ],
    coreResponsibilities: [
      "CRM danışmanlığı, pazarlama otomasyonu ve segmentasyon",
      "Retention ve abonelik bazlı iş modelleri için stratejik planlama",
    ],
    bullets: [
      "Lifecycle Journey Mimarisi: Müşteri etkileşimini ve elde tutmayı güçlendiren journey yapıları tasarlandı.",
      "Abonelik Ekonomisi: Tekrarlayan gelir ve churn azaltma modelleri geliştirilerek iş modelinin istikrarı ve LTV büyümesi desteklendi.",
      "Platform Yetkinleştirme: Kurumsal müşterilerde platform kullanımını ve karar desteğini artıran raporlama ve enablement yapıları kuruldu.",
      "CRM danışmanlığı, pazarlama otomasyonu ve segmentasyon",
      "Retention ve abonelik bazlı iş modelleri için stratejik planlama",
    ],
  },
  "8digits|05/2016 - 05/2017": {
    brand: "MarTech SaaS",
    role: "Müşteri Yöneticisi",
    location: "İstanbul, Türkiye",
    focus:
      "Yüksek büyüme potansiyelli D2C ve Shopify tabanlı işler için davranışsal analizler ve CRO yol haritaları sunan danışmanlık rolü.",
    meta: [
      "Çok sektörlü müşteri portföyü",
      "CRO yol haritaları ve funnel analizi",
      "Jira / Asana proje yönetimi",
    ],
    detailCards: [
      { label: "Müşteri Bağlamı", value: "Çok sektörlü müşteri portföyü" },
      { label: "Analitik Odak", value: "CRO yol haritaları ve funnel analizi" },
      { label: "Teslimat Yapısı", value: "Jira / Asana proje yönetimi" },
    ],
    keySystems: [
      {
        title: "D2C Büyüme Danışmanlığı",
        body: "Start-up ve scale-up şirketler için Shopify odaklı optimizasyon stratejileri geliştirilerek davranış verisi ticari aksiyona dönüştürüldü.",
      },
      {
        title: "Funnel Diagnostiği",
        body: "Kullanıcı sürtünme noktalarını belirleyen framework'ler kurularak dönüşüm ve elde tutmada ölçülebilir iyileşmeler sağlandı.",
      },
      {
        title: "Optimizasyon Backlog'ları",
        body: "Farklı müşteri portföylerinde büyüme önerileri ve deney stratejileri oluşturulup yönetildi.",
      },
    ],
    coreResponsibilities: [
      "CRO danışmanlığı, davranış analitiği ve funnel diagnostiği",
      "Müşteri ilişkileri ve büyüme stratejisi uygulamasını yönetmek",
    ],
    bullets: [
      "D2C Büyüme Danışmanlığı: Start-up ve scale-up şirketler için Shopify odaklı optimizasyon stratejileri geliştirilerek davranış verisi ticari aksiyona dönüştürüldü.",
      "Funnel Diagnostiği: Kullanıcı sürtünme noktalarını belirleyen framework'ler kurularak dönüşüm ve elde tutmada ölçülebilir iyileşmeler sağlandı.",
      "Optimizasyon Backlog'ları: Farklı müşteri portföylerinde büyüme önerileri ve deney stratejileri oluşturulup yönetildi.",
      "CRO danışmanlığı, davranış analitiği ve funnel diagnostiği",
      "Müşteri ilişkileri ve büyüme stratejisi uygulamasını yönetmek",
    ],
  },
  "D&R / idefix|05/2017 - 01/2020": {
    brand: "Perakende ve Kültür Ticareti",
    role: "Dijital Pazarlama Uzmanı",
    location: "İstanbul, Türkiye",
    focus:
      "Dijital funnel ve retention sistemlerinin uygulamalı optimizasyonuna odaklanan bireysel katkı rolü.",
    meta: [
      "Uygulama ağırlıklı yürütme rolü",
      "CRM, mobil ve retargeting odağı",
      "Segmentasyon odaklı retention engine",
    ],
    detailCards: [
      { label: "Rol Odağı", value: "Uygulama ağırlıklı yürütme rolü" },
      { label: "Kanallar", value: "CRM, mobil ve retargeting odağı" },
      {
        label: "Büyüme Sistemi",
        value: "Segmentasyon odaklı retention engine",
      },
    ],
    keySystems: [
      {
        title: "CRM Otomasyonu",
        body: "Tekrar satın almayı güçlendiren tetiklemeli iletişim akışları ve lifecycle kampanya yapıları kuruldu.",
      },
      {
        title: "CRO & A/B Testleri",
        body: "Funnel darboğazlarını bulup çözmeye yönelik sistematik bir deney çerçevesi oluşturularak dönüşüm performansı iyileştirildi.",
      },
      {
        title: "SEO ve Site İçi Optimizasyon",
        body: "Organik kullanıcı kazanımını destekleyen funnel analiz rutinleri ve arama odaklı içerik iyileştirmeleri uygulandı.",
      },
    ],
    coreResponsibilities: [
      "SEO, CRM otomasyonu ve retention programlarını yönetmek",
      "Veri odaklı tetiklemeli iletişimlerle lifecycle etkileşimini büyütmek",
    ],
    bullets: [
      "CRM Otomasyonu: Tekrar satın almayı güçlendiren tetiklemeli iletişim akışları ve lifecycle kampanya yapıları kuruldu.",
      "CRO & A/B Testleri: Funnel darboğazlarını bulup çözmeye yönelik sistematik bir deney çerçevesi oluşturularak dönüşüm performansı iyileştirildi.",
      "SEO ve Site İçi Optimizasyon: Organik kullanıcı kazanımını destekleyen funnel analiz rutinleri ve arama odaklı içerik iyileştirmeleri uygulandı.",
      "SEO, CRM otomasyonu ve retention programlarını yönetmek",
      "Veri odaklı tetiklemeli iletişimlerle lifecycle etkileşimini büyütmek",
    ],
  },
  "D&R / idefix|01/2020 - 03/2021": {
    brand: "Perakende ve Kültür Ticareti",
    role: "Dijital Pazarlama Müdürü",
    location: "İstanbul, Türkiye",
    focus:
      "Türkiye'nin en büyük kültür ve eğlence perakende ekosistemlerinden birinde performans ve CRM yönetimi; 2 FTE ve entegre ajans partnerleri sorumluluğu.",
    meta: [
      "2 doğrudan ekip üyesi",
      "8 haneli bütçe yönetimi",
      "SEO/SEM, paid media, CRM ve mobil büyüme",
    ],
    detailCards: [
      { label: "Ekip", value: "2 doğrudan ekip üyesi" },
      { label: "Bütçe", value: "8 haneli bütçe yönetimi" },
      {
        label: "Fonksiyonel Kapsam",
        value: "SEO/SEM, paid media, CRM ve mobil büyüme",
      },
    ],
    keySystems: [
      {
        title: "Ödüllü Kampanyalar",
        body: "Felis Award 2019, MIXX Awards 2020 ve Social Media Awards 2020 ödülleri kazanıldı.",
      },
      {
        title: "Omnichannel Çerçeve",
        body: "Web ve mobil genelinde birleşik bir kampanya yapısı kurularak yüksek hacimli perakende için acquisition / retention funnel optimize edildi.",
      },
      {
        title: "Segmentasyon & ROI",
        body: "Dönüşüm verimliliği ve gelir katkısını ölçülebilir şekilde iyileştiren hedefleme modeli geliştirildi.",
      },
      {
        title: "SEO ve Performans Entegrasyonu",
        body: "Organik arama, paid performance ve CRM bir araya getirilerek tüm kullanıcı yaşam döngüsü optimize edildi.",
      },
    ],
    coreResponsibilities: [
      "App Growth, CRM, SEO/SEM ve omnichannel medya planlaması",
      "Web, mobil ve perakende temas noktalarında yüksek etkili kampanyaları yönetmek",
    ],
    bullets: [
      "Ödüllü Kampanyalar: Felis Award 2019, MIXX Awards 2020 ve Social Media Awards 2020 ödülleri kazanıldı.",
      "Omnichannel Çerçeve: Web ve mobil genelinde birleşik bir kampanya yapısı kurularak yüksek hacimli perakende için acquisition / retention funnel optimize edildi.",
      "Segmentasyon & ROI: Dönüşüm verimliliği ve gelir katkısını ölçülebilir şekilde iyileştiren hedefleme modeli geliştirildi.",
      "SEO ve Performans Entegrasyonu: Organik arama, paid performance ve CRM bir araya getirilerek tüm kullanıcı yaşam döngüsü optimize edildi.",
      "App Growth, CRM, SEO/SEM ve omnichannel medya planlaması",
      "Web, mobil ve perakende temas noktalarında yüksek etkili kampanyaları yönetmek",
    ],
  },
  "NAOS Türkiye|03/2021 - 04/2022": {
    brand: "BIODERMA / Institut Esthederm / Etat Pur",
    role: "Dijital Pazarlama Müdürü",
    location: "İstanbul, Türkiye",
    focus:
      "Dijital pazarlama fonksiyonu sıfırdan kuruldu; 6 kişilik ekip oluşturuldu ve markalar arası ölçeklenebilir büyüme için performans, attribution ve execution temelleri atıldı.",
    meta: [
      "6 kişilik dijital ekip",
      "9 haneli TRY bütçesi",
      "Performans, SEO/SEM, içerik ve CRO",
    ],
    detailCards: [
      { label: "Ekip", value: "6 kişilik dijital ekip" },
      { label: "Bütçe", value: "9 haneli TRY bütçesi" },
      { label: "Kapsam", value: "Performans, SEO/SEM, içerik ve CRO" },
    ],
    keySystems: [
      {
        title: "Fonksiyonu Sıfırdan Kurma",
        body: "6 kişilik ekip işe alındı ve net KPI yönetimiyle ölçeklenebilir bir execution modeli kuruldu.",
      },
      {
        title: "Attribution & Measurement",
        body: "Markanın ilk attribution modeli tasarlanarak bütçe dağılımı ve medya verimliliği güçlendirildi.",
      },
      {
        title: "Büyüme Performansı",
        body: "SEO odaklı lokalizasyon ile web sitesinde %35 trafik büyümesi ve arama görünürlüğünde belirgin iyileşme sağlandı.",
      },
      {
        title: "Dönüşüm ve Deney Katmanı",
        body: "Trafik kalitesi ve CVR'ı iyileştiren CRO deney katmanı ve full-funnel kanal çerçevesi devreye alındı.",
      },
      {
        title: "CRM ve E-Posta Optimizasyonu",
        body: "Media, CRM ve E-Ticaret döngüleri hizalanarak e-posta açılma oranı ve CTR'da anlamlı artışlar sağlandı.",
      },
      {
        title: "Execution Governance",
        body: "Paid media, SEO/SEM, CRM ve e-ticaret genelinde daha yapılandırılmış bir planlama ve optimizasyon ritmi kuruldu.",
      },
    ],
    coreResponsibilities: [
      "Paid Media, Performance Marketing, SEO/SEM ve CRO yönetimi",
      "Media / CRM hizalama modelleri ve execution governance kurulumu",
    ],
    bullets: [
      "Fonksiyonu Sıfırdan Kurma: 6 kişilik ekip işe alındı ve net KPI yönetimiyle ölçeklenebilir bir execution modeli kuruldu.",
      "Attribution & Measurement: Markanın ilk attribution modeli tasarlanarak bütçe dağılımı ve medya verimliliği güçlendirildi.",
      "Büyüme Performansı: SEO odaklı lokalizasyon ile web sitesinde %35 trafik büyümesi ve arama görünürlüğünde belirgin iyileşme sağlandı.",
      "Dönüşüm ve Deney Katmanı: Trafik kalitesi ve CVR'ı iyileştiren CRO deney katmanı ve full-funnel kanal çerçevesi devreye alındı.",
      "CRM ve E-Posta Optimizasyonu: Media, CRM ve E-Ticaret döngüleri hizalanarak e-posta açılma oranı ve CTR'da anlamlı artışlar sağlandı.",
      "Execution Governance: Paid media, SEO/SEM, CRM ve e-ticaret genelinde daha yapılandırılmış bir planlama ve optimizasyon ritmi kuruldu.",
      "Paid Media, Performance Marketing, SEO/SEM ve CRO yönetimi",
      "Media / CRM hizalama modelleri ve execution governance kurulumu",
    ],
  },
  "NAOS Türkiye|04/2022 - 04/2024": {
    brand: "BIODERMA / Institut Esthederm / Etat Pur",
    role: "Dijital Pazarlama & CRM Müdürü",
    location: "İstanbul, Türkiye",
    focus:
      "Digital, CRM ve Analytics fonksiyonlarını kapsayan 10 kişilik çapraz ekip yönetildi; acquisition, lifecycle yönetimi, e-ticaret ve kanal karlılığını kapsayan entegre büyüme modeli kuruldu.",
    meta: [
      "10 kişilik organizasyon",
      "9 haneli yıllık TRY bütçesi",
      "Çok markalı büyüme ve CRM governance",
    ],
    detailCards: [
      { label: "Organizasyon", value: "10 kişilik organizasyon" },
      { label: "Bütçe", value: "9 haneli yıllık TRY bütçesi" },
      { label: "Governance", value: "Çok markalı büyüme ve CRM governance" },
    ],
    keySystems: [
      {
        title: "Entegre Büyüme Modeli",
        body: "%20 acquisition, %69 LTV büyümesi ve yaklaşık %60 LTV/CAC iyileşmesi sağlayan operating model kuruldu.",
      },
      {
        title: "Amazon Karlılık Dönüşümü",
        body: "Hybrid 1P / 3P modele geçilerek -10pp OPEX, +8pp marj ve +%19 net kar artışı sağlandı.",
      },
      {
        title: "Marketplace AI & Experience",
        body: "Store rating'leri +%25 artıran, CSAT'i 4.3/5 seviyesine çıkaran ve konuşma tamamlama oranını +%38 yükselten chatbot akışları devreye alındı.",
      },
      {
        title: "İçerik ve Arama Mimarisi",
        body: "Marka mağazaları arama odaklı mimariyle yeniden kurgulanarak first-page görünürlüğünde +%50 ve Top-5 yerleşimlerinde +%30 iyileşme sağlandı.",
      },
      {
        title: "Veri Merkezileştirme",
        body: "Web, D2C, Mobile ve CRM genelinde veri mimarisi birleştirilerek karar alma, retention mantığı ve performans görünürlüğü sadeleştirildi.",
      },
      {
        title: "Profesyonel Etkileşim",
        body: "HCP ve eczane etkileşim platformları kurularak non-personal promotion ve omnichannel profesyonel erişim güçlendirildi.",
      },
      {
        title: "Lifecycle & Segmentasyon Engine",
        body: "Önceliklendirme, müşteri değeri ve kanal verimliliğini iyileştiren CLV / LTV tabanlı segmentasyon ve lifecycle orkestrasyonu kuruldu.",
      },
    ],
    coreResponsibilities: [
      "Dijital Pazarlama, CRM, E-Ticaret ve Acquisition / Retention fonksiyonlarını yönetmek",
      "D2C, Web, Marketplace ve E-Retail genelinde kanal karlılığı modellemek",
    ],
    bullets: [
      "Entegre Büyüme Modeli: %20 acquisition, %69 LTV büyümesi ve yaklaşık %60 LTV/CAC iyileşmesi sağlayan operating model kuruldu.",
      "Amazon Karlılık Dönüşümü: Hybrid 1P / 3P modele geçilerek -10pp OPEX, +8pp marj ve +%19 net kar artışı sağlandı.",
      "Marketplace AI & Experience: Store rating'leri +%25 artıran, CSAT'i 4.3/5 seviyesine çıkaran ve konuşma tamamlama oranını +%38 yükselten chatbot akışları devreye alındı.",
      "İçerik ve Arama Mimarisi: Marka mağazaları arama odaklı mimariyle yeniden kurgulanarak first-page görünürlüğünde +%50 ve Top-5 yerleşimlerinde +%30 iyileşme sağlandı.",
      "Veri Merkezileştirme: Web, D2C, Mobile ve CRM genelinde veri mimarisi birleştirilerek karar alma, retention mantığı ve performans görünürlüğü sadeleştirildi.",
      "Profesyonel Etkileşim: HCP ve eczane etkileşim platformları kurularak non-personal promotion ve omnichannel profesyonel erişim güçlendirildi.",
      "Lifecycle & Segmentasyon Engine: Önceliklendirme, müşteri değeri ve kanal verimliliğini iyileştiren CLV / LTV tabanlı segmentasyon ve lifecycle orkestrasyonu kuruldu.",
      "Dijital Pazarlama, CRM, E-Ticaret ve Acquisition / Retention fonksiyonlarını yönetmek",
      "D2C, Web, Marketplace ve E-Retail genelinde kanal karlılığı modellemek",
    ],
  },
  "NAOS Deutschland|04/2024 - Current": {
    year: "04/2024 - Günümüz",
    role: "Head of\nDigital",
    location: "Münih, Almanya",
    focus:
      "NAOS Deutschland için DACH genelinde dijital ticaret, veri, analitik ve yapay zeka gündemini yönetiyor; Marketing, Sales, Medical ve Commercial ekipleri ile global partnerler ve ajanslar üzerinde çapraz fonksiyonel sorumluluk taşıyor.",
    meta: [
      "8 haneli yıllık EUR dijital bütçesi",
      "Doğrudan: 1 FTE + çapraz fonksiyonel ekipler",
      "DACH dönüşümü ve üst düzey paydaş liderliği",
    ],
    detailCards: [
      { label: "Bütçe", value: "8 haneli yıllık EUR dijital bütçesi" },
      { label: "Ekip", value: "Doğrudan: 1 FTE + çapraz fonksiyonel ekipler" },
      {
        label: "Dönüşüm Odağı",
        value: "DACH dönüşümü ve üst düzey paydaş liderliği",
      },
    ],
    keySystems: [
      {
        title: "Yapay Zeka Destekli Growth Engine",
        body: '"TranslAsset AI" (OCR + LLM + Image Inpainting) ile otomatik lokalizasyon kurgulanarak -%5 OPEX, +%60 CTR ve +%25 CVR sağlandı.',
      },
      {
        title: "Fiyatlama ve Ticari Zeka",
        body: "Yapay zeka destekli fiyat doğrulama ve rakip benchmark sistemi geliştirilerek +%11 AOV, +12pp Buy Box payı, +14pp katkı marjı, +%30 fiyat uyumu ve +%50 daha hızlı karar alma sağlanırken manuel fiyatlama eforu %40 azaltıldı.",
      },
      {
        title: "Retail Media ve Büyüme",
        body: "+%35 sell-out büyümesi, +14pp katkı marjı ve +%36 blended ROAS iyileşmesi sağlayan yapay zeka odaklı growth engine kuruldu.",
      },
      {
        title: "SEO ve PDP Çerçevesi",
        body: "SEO odaklı ürün isimlendirme ve full-funnel içerik çerçeveleri oluşturularak +%48 first-page görünürlüğü ve +9pp add-to-cart oranı sağlandı.",
      },
      {
        title: "Organizasyonel Verimlilik",
        body: '"Tasky AI" ile feedback routing ve GenAI destekli PIM asistanı devreye alınarak compliant, self-service bir ürün zekası katmanı kuruldu.',
      },
      {
        title: "Workflow Otomasyonu",
        body: "Power Apps / Power Automate yapıları ve yapay zeka destekli satış planlama uygulamaları devreye alındı. E-reçete yolculuğu dönüşümü yaklaşık %22'den %34'e, doktor kullanımını %40 ve eczane funnel completion oranını %25 artırırken kağıt bazlı OPEX'i %70 azalttı; AI ziyaret planlama saha verimliliğini %25–30, yüksek değerli hesap kapsamını %35 ve rota verimliliğini %20 artırırken planlama süresini %40 azalttı.",
      },
      {
        title: "Ticari Görünürlük",
        body: "Gerçek zamanlı karar alma, planlama disiplini ve çapraz fonksiyonel KPI görünürlüğünü güçlendiren executive dashboard ve forecasting sistemleri kuruldu.",
      },
    ],
    coreResponsibilities: [
      "Full-funnel Paid Media, CRM Lifecycle, D2C ve Marketplace / E-Retail büyümesi",
      "Gerçek zamanlı ticari görünürlük için executive dashboard ve forecasting",
      "Yapay zeka dönüşümü ve GDPR uyumlu dijital operasyonların liderliği",
    ],
    bullets: [
      'Yapay Zeka Destekli Growth Engine: "TranslAsset AI" (OCR + LLM + Image Inpainting) ile otomatik lokalizasyon kurgulanarak -%5 OPEX, +%60 CTR ve +%25 CVR sağlandı.',
      "Fiyatlama ve Ticari Zeka: Yapay zeka destekli fiyat doğrulama ve rakip benchmark sistemi geliştirilerek +%11 AOV, +12pp Buy Box payı, +14pp katkı marjı, +%30 fiyat uyumu ve +%50 daha hızlı karar alma sağlanırken manuel fiyatlama eforu %40 azaltıldı.",
      "Retail Media ve Büyüme: +%35 sell-out büyümesi, +14pp katkı marjı ve +%36 blended ROAS iyileşmesi sağlayan yapay zeka odaklı growth engine kuruldu.",
      "SEO ve PDP Çerçevesi: SEO odaklı ürün isimlendirme ve full-funnel içerik çerçeveleri oluşturularak +%48 first-page görünürlüğü ve +9pp add-to-cart oranı sağlandı.",
      'Organizasyonel Verimlilik: "Tasky AI" ile feedback routing ve GenAI destekli PIM asistanı devreye alınarak compliant, self-service bir ürün zekası katmanı kuruldu.',
      "Workflow Otomasyonu: Power Apps / Power Automate yapıları ve yapay zeka destekli satış planlama uygulamaları devreye alındı. E-reçete yolculuğu dönüşümü yaklaşık %22'den %34'e, doktor kullanımını %40 ve eczane funnel completion oranını %25 artırırken kağıt bazlı OPEX'i %70 azalttı; AI ziyaret planlama saha verimliliğini %25–30, yüksek değerli hesap kapsamını %35 ve rota verimliliğini %20 artırırken planlama süresini %40 azalttı.",
      "Ticari Görünürlük: Gerçek zamanlı karar alma, planlama disiplini ve çapraz fonksiyonel KPI görünürlüğünü güçlendiren executive dashboard ve forecasting sistemleri kuruldu.",
      "Full-funnel Paid Media, CRM Lifecycle, D2C ve Marketplace / E-Retail büyümesi",
      "Gerçek zamanlı ticari görünürlük için executive dashboard ve forecasting",
      "Yapay zeka dönüşümü ve GDPR uyumlu dijital operasyonların liderliği",
    ],
  },
};

export function localizeCareerTimeline(
  items: CareerItem[],
  language: SupportedLanguage
) {
  return localizeCollection(
    items,
    language,
    language === "de" ? deCareerTimeline : trCareerTimeline,
    item => `${item.company}|${item.year}`
  );
}
