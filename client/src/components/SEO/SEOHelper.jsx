import { Helmet } from 'react-helmet-async';

const SEOHelper = ({ title, description, image, slug }) => {
  const url = `https://coo-x-for.fun/resep/${slug || ''}`;
  return (
    <Helmet>
      <title>{title} | Coo-X-For.Fun</title>
      <meta name="description" content={description} />
      
      <meta property="og:site_name" content="Coo-X-For.Fun" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      
      <link rel="alternate" type="application/rss+xml" title="Resep Terbaru" href="https://coo-x-for-fun.vercel.app/rss/recipes.xml" />
    </Helmet>
  );
};
export default SEOHelper;