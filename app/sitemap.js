const CCAA_SLUGS = [
  "andalucia",
  "aragon",
  "asturias",
  "baleares",
  "canarias",
  "cantabria",
  "castilla-la-mancha",
  "castilla-y-leon",
  "cataluna",
  "comunitat-valenciana",
  "extremadura",
  "galicia",
  "la-rioja",
  "madrid",
  "murcia",
  "navarra",
  "pais-vasco",
  "ceuta",
  "melilla",
];

export default function sitemap() {
  const base = "https://www.cuantocuestaunpiso.es";

  const ccaaEntries = CCAA_SLUGS.map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...ccaaEntries,
  ];
}
