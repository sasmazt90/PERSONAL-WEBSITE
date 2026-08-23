import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePortfolioData } from "@/contexts/PortfolioDataContext";
import { Award, Calendar, Hash, X, ExternalLink } from "lucide-react";
import HorizontalSlider from "./HorizontalSlider";

const certImages: Record<string, string> = {
  "Digital Transformation":
    "/assets/certificates/LinkedIn-Digital-Transformation.webp",
  "Prompt Design in Vertex AI":
    "/assets/certificates/Prompt Design in Vertex AI.webp",
  "Applied Marketing Analytics":
    "/assets/certificates/Applied-Marketing-Analytics.webp",
  "Leading Growth Strategy":
    "/assets/certificates/Leading-Growth-Strategy.webp",
  "Digital Marketing: Customer Engagement, Planning & Analytics":
    "/assets/certificates/Digital Marketing-Emeritus.webp",
  "Advanced Marketing Analytics":
    "/assets/certificates/Applied-Marketing-Analytics.webp",
  "Digital Marketing Fundamentals":
    "/assets/certificates/Digital Marketing-Emeritus.webp",
  "Marketing Analytics Specialization":
    "/assets/certificates/Leading-Growth-Strategy.webp",
};

export default function CertificationsSection() {
  const { t } = useLanguage();
  const { portfolioData } = usePortfolioData();
  const { certifications } = portfolioData;
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  const getCertImage = (title: string) => {
    return certImages[title] || null;
  };

  return (
    <section id="certifications" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Space_Grotesk']">
            {t("certifications.title")}
          </h2>
          <p className="mt-3 text-lg text-gray-500 font-['Nunito_Sans']">
            {t("certifications.subtitle")}
          </p>
          <div className="mt-4 w-16 h-1 bg-blue-600 rounded-full" />
        </div>

        <HorizontalSlider>
          {certifications.map((cert, i) => {
            const hasImage = getCertImage(cert.title);
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col ${
                  hasImage ? "cursor-pointer" : ""
                }`}
                onClick={() => hasImage && setSelectedCert(cert.title)}
              >
                {/* Top accent bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: cert.color }}
                />

                {hasImage && (
                  <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden border-b border-gray-100">
                    <img
                      src={getCertImage(cert.title)!}
                      alt={cert.title}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ backgroundColor: `${cert.color}15` }}
                  >
                    {cert.icon}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 font-['Space_Grotesk'] mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {cert.title}
                  </h3>

                  {/* Issuer */}
                  <p
                    className="text-sm font-semibold mb-3 font-['Nunito_Sans']"
                    style={{ color: cert.color }}
                  >
                    {cert.issuer}
                  </p>

                  {/* Meta */}
                  <div className="space-y-1.5 mb-4 flex-grow">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>{cert.date}</span>
                    </div>
                    {cert.credentialId && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Hash size={12} />
                        <span className="font-mono text-xs truncate">
                          {cert.credentialId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={14} style={{ color: cert.color }} />
                      <span className="text-xs font-semibold text-gray-500">
                        {t("certifications.certified")}
                      </span>
                    </div>
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </HorizontalSlider>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors z-10"
              aria-label={t("certifications.closePreview")}
            >
              <X size={20} />
            </button>
            <img
              src={getCertImage(selectedCert)!}
              alt={selectedCert}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
}
