import api from './api';

const VIEWABLE = ['application/pdf', 'text/plain'];

// Opens PDFs, images and text in a new tab; other files are downloaded.
// The tab is opened first, inside the click, so pop-up blockers allow it.
export async function downloadFile(url, name) {
  const tab = window.open('', '_blank');
  try {
    const res = await api.get(url, { responseType: 'blob' });
    const type = res.data.type || '';
    const href = URL.createObjectURL(res.data);
    if (tab && (type.startsWith('image/') || VIEWABLE.includes(type))) {
      tab.location.href = href;
      setTimeout(() => URL.revokeObjectURL(href), 60000);
      return;
    }
    if (tab) tab.close();
    const a = document.createElement('a');
    a.href = href;
    a.download = name || 'file';
    a.click();
    URL.revokeObjectURL(href);
  } catch (err) {
    if (tab) tab.close();
    throw err;
  }
}
