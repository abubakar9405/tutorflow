// 3D mouse tilt for glass cards
const SEL = 'div[style*="1px solid"]';

document.addEventListener('mousemove', (e) => {
  const el = e.target.closest && e.target.closest(SEL);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty('--ry', `${x * 14}deg`);
  el.style.setProperty('--rx', `${-y * 14}deg`);
});

document.addEventListener('mouseout', (e) => {
  const el = e.target.closest && e.target.closest(SEL);
  if (!el || el.contains(e.relatedTarget)) return;
  el.style.setProperty('--rx', '0deg');
  el.style.setProperty('--ry', '0deg');
});
