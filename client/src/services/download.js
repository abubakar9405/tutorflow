import api from './api';

// Downloads a protected file using the logged-in token.
export async function downloadFile(url, name) {
  const res = await api.get(url, { responseType: 'blob' });
  const href = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = href;
  a.download = name || 'file';
  a.click();
  URL.revokeObjectURL(href);
}
