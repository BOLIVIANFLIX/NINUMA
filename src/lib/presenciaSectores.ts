export interface SectorPresencia {
  slug: string;
  n: string;
  title: string;
  text: string;
  items: string[];
  metaTitle: string;
  metaDescription: string;
}

// Un sector = una página propia en /presencia/[slug]/ (ver esa ruta), además de
// la tarjeta en el hub /presencia/. Cada uno apunta a una intención de búsqueda
// distinta ("postres para hoteles Mallorca" vs. "catering dulce eventos
// privados Mallorca") en vez de competir todos por la misma página genérica.
export const SECTORES_PRESENCIA: SectorPresencia[] = [
  {
    slug: "hoteles",
    n: "01",
    title: "Hoteles de lujo y boutique",
    text: "Amenities de habitación, cartas exclusivas de postre para restaurante o carta de té de tarde. Una firma de pastelería propia que el huésped lleva en la memoria.",
    items: ["Amenities gourmet de bienvenida", "Carta de postre de autor", "Turn-down service de pastelería", "Caja para regalar en check-out"],
    metaTitle: "Pastelería para hoteles de lujo en Palma de Mallorca · NINUMÁ",
    metaDescription:
      "Amenities de habitación, cartas de postre exclusivas y turn-down service de pastelería de autor para hoteles de lujo y boutique en Palma de Mallorca.",
  },
  {
    slug: "restaurantes",
    n: "02",
    title: "Restaurantes y gastrobares",
    text: "El postre es el último sabor que se recuerda de una comida. Ofrecemos una carta de postres de encargo o piezas en exclusiva que elevan el cierre de tu menú sin necesidad de un equipo de pastelería propio.",
    items: ["Carta de postres de temporada", "Petit fours de autor", "Pastas de té y panes especiales", "Repostería para brunch o desayunos"],
    metaTitle: "Carta de postres para restaurantes en Palma de Mallorca · NINUMÁ",
    metaDescription:
      "Carta de postres de temporada, petit fours de autor y repostería para brunch, pensada para restaurantes y gastrobares de Palma de Mallorca sin equipo de pastelería propio.",
  },
  {
    slug: "beach-clubs",
    n: "03",
    title: "Beach clubs",
    text: "El criterio no se negocia por el sol. Piezas pensadas para el calor, la sal y la temporada de Mallorca: resistentes, bellas y con argumento.",
    items: ["Postres de playa resistentes al calor", "Bombonería de temporada", "Pastelería para cócteles y bienvenidas", "Propuesta de fin de tarde"],
    metaTitle: "Pastelería para beach clubs en Mallorca · NINUMÁ",
    metaDescription: "Postres resistentes al calor, bombonería de temporada y pastelería para cócteles pensada para beach clubs de Mallorca.",
  },
  {
    slug: "co-branding",
    n: "04",
    title: "Co-Branding",
    text: "Tu marca tiene una identidad. La nuestra también. Cuando coinciden, el resultado es una pieza que los dos podéis firmar. Con el ADN visual de ambas marcas, lo que tenga sentido.",
    items: ["Ediciones limitadas de marca compartida", "Packaging con identidad dual", "Acciones de lanzamiento o presentación", "Colaboraciones para lifestyle, moda y diseño"],
    metaTitle: "Colaboraciones de co-branding con marcas en Mallorca · NINUMÁ",
    metaDescription: "Ediciones limitadas de marca compartida, packaging con identidad dual y colaboraciones de pastelería conceptual para marcas en Mallorca.",
  },
  {
    slug: "regalos-corporativos",
    n: "05",
    title: "Regalos corporativos",
    text: "Nada de cajas genéricas. El regalo corporativo de NINUMÁ lleva dentro una idea, una referencia a tu empresa o a la persona que lo recibe. Tú nos cuentas, nosotros lo convertimos.",
    items: ["Bombonería personalizada con concepto", "Packaging con branding de empresa", "Piezas para clientes, equipo o eventos", "Pedidos desde una unidad"],
    metaTitle: "Regalos corporativos personalizados en Mallorca · NINUMÁ",
    metaDescription: "Bombonería personalizada con concepto y packaging con branding de empresa — regalos corporativos de pastelería de autor en Palma de Mallorca.",
  },
  {
    slug: "eventos-privados",
    n: "06",
    title: "Eventos privados",
    text: "Aniversarios, lanzamientos de marca, fiestas privadas, cenas conceptuales. Una propuesta construida desde tu idea: qué quieres que sienta tu invitado cuando se lleva el primer bocado a la boca.",
    items: ["Mesa dulce de autor", "Bombonería personalizada", "Packaging y presentación exclusiva", "Experiencia gastronómica conceptual"],
    metaTitle: "Catering dulce para eventos privados en Mallorca · NINUMÁ",
    metaDescription: "Mesa dulce de autor y bombonería personalizada para aniversarios, lanzamientos de marca y cenas conceptuales en Palma de Mallorca.",
  },
];
