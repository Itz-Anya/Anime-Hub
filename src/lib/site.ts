const FALLBACK_IMAGE = "https://i.ibb.co/WWvvNJgn/file-000000006b8c720795fe698bc77ac214.png";
const HERO_IMAGE = "https://i.ibb.co/206XZ90z/file-00000000c1147207ab7733ed4f6ac96f.jpg";

export const SITE = {
  name: process.env.REACT_APP_SITE_NAME || "Anime Hub",
  url: (process.env.REACT_APP_SITE_URL || "").replace(/\/$/, ""),
  image: process.env.REACT_APP_SITE_IMAGE || FALLBACK_IMAGE,
  hero: HERO_IMAGE,
  description:
    "Anime Hub is a modern anime discovery and tracking platform. Explore trending, seasonal, and top-rated anime, build watchlists, and track episodes.",
  tagline: "Discover, track & love anime",
  twitter: "@animehub",
};

export const SITE_IMAGE = SITE.image;
export const SITE_LOGO = SITE.image;
export const SITE_HERO = HERO_IMAGE;
