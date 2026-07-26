import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";

// Renders a schema.org JSON-LD blob describing the photographer as a
// LocalBusiness (with ProfessionalService), a Person, and the site itself.
// One <script> per node is preferred by Google over a single @graph array
// because it lets them index each entity independently.
export function HomepageJsonLd() {
  const siteUrl = getSiteUrl();
  const businessId = `${siteUrl}/#business`;
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;

  const heroImage = `${siteUrl}/portfolio/hero.webp`;

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: siteConfig.legalName,
    alternateName: siteConfig.photographerName,
    url: siteUrl,
    image: heroImage,
    jobTitle: "Documentary Photographer",
    worksFor: { "@id": businessId },
    sameAs: [siteConfig.instagram.url],
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.region,
      addressCountry: siteConfig.location.countryCode,
    },
  };

  const business = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": businessId,
    name: siteConfig.seo.siteName,
    alternateName: `${siteConfig.photographerName} Photography`,
    description: siteConfig.seo.homeDescription,
    url: siteUrl,
    image: heroImage,
    logo: heroImage,
    telephone: siteConfig.phone,
    priceRange: "€€",
    founder: { "@id": personId },
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.region,
      addressCountry: siteConfig.location.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.location.latitude,
      longitude: siteConfig.location.longitude,
    },
    areaServed: siteConfig.location.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    sameAs: [siteConfig.instagram.url],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer service",
      areaServed: siteConfig.location.countryCode,
      availableLanguage: ["English", "Spanish"],
    },
    knowsAbout: siteConfig.services.map((service) => service.name),
    makesOffer: siteConfig.services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        serviceType: service.name,
        areaServed: siteConfig.location.city,
        provider: { "@id": businessId },
      },
    })),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteConfig.seo.siteName,
    description: siteConfig.seo.homeDescription,
    inLanguage: "en",
    publisher: { "@id": businessId },
  };

  return (
    <>
      {[business, person, website].map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify can leak "<" into HTML — escape it per Next.js JSON-LD guide.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
