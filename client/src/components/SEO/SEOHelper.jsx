import { Helmet } from 'react-helmet-async';

const SEOHelper = ({ title, description, image, slug }) => {
  const url = `https://coo-x-for.fun/resep/${slug || ''}`;
  return (
    <Helmet>
      <title>{title} | Coo-X-For.Fun</title>
      <meta name="description" content={description} />
      
      {/* Open Graph & Twitter Card */}
      <meta property="og:site_name" content="Coo-X-For.Fun" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      
      {/* RSS Links ke Backend */}
      <link rel="alternate" type="application/rss+xml" title="Resep Terbaru" href="http://localhost:5000/rss/recipes.xml" />
    </Helmet>
  );
};
export default SEOHelper;