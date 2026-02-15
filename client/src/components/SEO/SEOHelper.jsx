import { Helmet } from 'react-helmet-async';

const SEOHelper = ({ title, description, image, slug }) => {
  const baseUrl = "https://www.coo-x-for.fun";
  const url = slug ? `${baseUrl}/#/resep/${slug}` : `${baseUrl}/`;
  
  return (
    <Helmet>
      <title>{title} | Coo-X-For.Fun</title>
      <meta name="description" content={description} />
      
      {/* Ini akan me-replace tag canonical jika yang di index.html sudah dihapus */}
      <link rel="canonical" href={url} />
      
      <meta property="og:site_name" content="Coo-X-For.Fun" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={slug ? "article" : "website"} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      <link rel="alternate" type="application/rss+xml" title="Resep Terbaru" href="https://www.coo-x-for.fun/rss/index.xml" />
    </Helmet>
  );
};

export default SEOHelper;