import { MOVIES } from "@/lib/movies";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Schema.org description of what this page is, for search engines.
 *
 * Three graphs:
 *   WebSite         the site itself, plus the in-page search, which is what
 *                   can earn a sitelinks search box on the brand query
 *   CollectionPage  says this page *is* a catalog rather than an article
 *   ItemList        the titles it covers, so the subject is not left to be
 *                   guessed from poster alt text
 *
 * The list carries names and years only. Each entry deserves a full Movie or
 * TVSeries graph, but that needs a URL per title to hang it on, and every title
 * currently lives at the same address.
 */
export function StructuredData() {
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/#collection`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: {
        "@type": "Thing",
        name: "Marvel Cinematic Universe",
        description:
          "Marvel films and series across Marvel Studios, 20th Century Fox, Sony and Marvel Television.",
      },
      mainEntity: { "@id": `${SITE_URL}/#catalog` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#catalog`,
      name: `${SITE_NAME} catalog`,
      numberOfItems: MOVIES.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: MOVIES.map((movie, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": movie.kind === "series" ? "TVSeries" : "Movie",
          name: movie.title,
          datePublished: movie.releaseDate,
          ...(movie.director ? { director: { "@type": "Person", name: movie.director } } : {}),
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Content is our own catalog, not user input, and JSON.stringify escapes
      // the quotes. `<` is escaped anyway so the string cannot close the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
