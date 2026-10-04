import pages from '../content/pages.mjs';
import {videoSitemap} from '../content/video-seo.mjs';

export const prerender = true;
export function GET() {
 return new Response(videoSitemap(pages), {headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
