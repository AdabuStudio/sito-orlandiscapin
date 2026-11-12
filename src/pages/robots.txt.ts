import type { APIRoute } from 'astro';
import { getSettings } from '../lib/content';
import { absolute } from '../lib/seo/url';

export const GET: APIRoute = async () => {
  const s = await getSettings();
  const staging = import.meta.env.PUBLIC_STAGE === 'staging';
  const body = staging
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${absolute(s, '/sitemap.xml')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
