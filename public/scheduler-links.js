// Scheduler navigation is always external. Never replace the GioLina tab.
const isScheduler = link => {
 try {
  const url = new URL(link.href, document.baseURI);
  return url.origin === 'https://clients.giolina.co' && url.pathname.startsWith('/schedule/');
 } catch { return false; }
};
const prepareScheduler = link => {
 link.target = '_blank';
 link.rel = 'noopener noreferrer';
};
document.querySelectorAll('a[href]').forEach(link => { if (isScheduler(link)) prepareScheduler(link); });
document.addEventListener('click', event => {
 const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
 if (!link || !isScheduler(link)) return;
 prepareScheduler(link);
 // Keep native modified/middle-click behavior. A plain click opens directly
 // within the user gesture, without any router/current-page navigation.
 if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
 event.preventDefault();
 event.stopImmediatePropagation();
 window.open(link.href, '_blank', 'noopener,noreferrer');
}, true);
