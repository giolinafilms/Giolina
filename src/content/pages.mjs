import {publishedPages} from '../config/public-paths.mjs';
const pages = import.meta.glob('./pages/*.json', { eager: true, import: 'default' });
export default publishedPages(Object.values(pages));
