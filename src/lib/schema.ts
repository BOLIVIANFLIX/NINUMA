const SITE = "https://www.ninuma.es";

const NAP = {
  streetAddress: "Carrer de Guillem Massot, 48",
  addressLocality: "Palma de Mallorca",
  postalCode: "07003",
  addressRegion: "Islas Baleares",
  addressCountry: "ES",
};

const GEO = { latitude: "39.58018371443852", longitude: "2.648902538147053" };
const HOURS = ["Mo-Th 10:00-13:30", "Fr 10:30-13:30", "Sa 10:00-13:30"];
const TEL = "+34666138465";
const EMAIL = "ariadna@ninuma.es";

export function bakerySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE}/#bakery`,
    name: "NINUMÁ",
    alternateName: "NINUMA Sweet Design",
    description: "Atelier de pastelería conceptual y cafetería de especialidad en Palma de Mallorca.",
    url: SITE,
    image: `${SITE}/assets/img/og-image.png`,
    founder: { "@type": "Person", name: "Ariadna Salvador", jobTitle: "Fundadora y directora creativa" },
    address: { "@type": "PostalAddress", ...NAP },
    geo: { "@type": "GeoCoordinates", ...GEO },
    telephone: TEL,
    email: EMAIL,
    openingHours: HOURS,
    servesCuisine: "Pastelería conceptual",
    priceRange: "€€€",
    sameAs: [
      "https://www.instagram.com/ninuma_concept/",
      "https://www.tiktok.com/@ninuma_concept",
      "https://www.youtube.com/@ninuma_concept",
    ],
  };
}

export function cafeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE}/#cafe`,
    name: "NINUMÁ",
    url: SITE,
    image: `${SITE}/assets/img/og-image.png`,
    address: { "@type": "PostalAddress", ...NAP },
    telephone: TEL,
    openingHours: HOURS,
    servesCuisine: "Café de especialidad",
    priceRange: "€€€",
  };
}

export function breadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.item}`,
    })),
  };
}

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE}/obrador/#aboutpage`,
    mainEntity: bakerySchema(),
  };
}

export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE}/contacto/#contactpage`,
    mainEntity: bakerySchema(),
  };
}

export function itemListSchema(items: { name: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Product/Offer en JSON-LD para catálogos renderizados por JS (p.ej. /tienda/),
 * cuyo HTML inicial no lleva nombre/precio — así los rastreadores que no
 * ejecutan JavaScript (GPTBot y similares) también ven los productos. */
export function productListSchema(
  products: { nombre: string; imagen: string; precio: number; descripcion?: string | null; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.nombre,
        image: `${SITE}${p.imagen}`,
        description: p.descripcion || undefined,
        url: `${SITE}${p.url}`,
        offers: {
          "@type": "Offer",
          price: p.precio,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${SITE}${p.url}`,
        },
      },
    })),
  };
}

export function serviceSchema(serviceTypes: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@id": `${SITE}/#bakery` },
    areaServed: { "@type": "AdministrativeArea", name: "Islas Baleares" },
    serviceType: serviceTypes,
  };
}
