const pages = import.meta.glob('./pages/*.json', { eager: true, import: 'default' });
export default Object.values(pages);
