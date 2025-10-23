"use client";

import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterCreator?: string;
  twitterSite?: string;
  twitterImage?: string; // Added twitterImage prop
}

export function Seo({
  title = "Home Links - Find Your Dream Home in Kerala",
  description = "Explore properties for sale and rent across all districts of Kerala. Find apartments, houses, and land with ease.",
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = "summary_large_image",
  twitterCreator,
  twitterSite,
  twitterImage, // Destructure twitterImage
}: SeoProps) {
  const defaultOgUrl = typeof window !== 'undefined' ? window.location.href : 'https://homelinks.com'; // Replace with your actual domain

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl || defaultOgUrl} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={ogUrl || defaultOgUrl} />
      <meta property="twitter:title" content={ogTitle || title} />
      <meta property="twitter:description" content={ogDescription || description} />
      {(twitterImage || ogImage) && <meta property="twitter:image" content={twitterImage || ogImage} />} {/* Use twitterImage or fallback to ogImage */}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
    </Helmet>
  );
}