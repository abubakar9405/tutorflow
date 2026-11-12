// Colors status words in table cells (paid, unpaid, graded, absent, ...)
const MAP = {
  paid: 'ok', graded: 'ok', present: 'ok', completed: 'ok',
  submitted: 'info', scheduled: 'info', assigned: 'info',
  partial: 'warn', late: 'warn',
  unpaid: 'bad', absent: 'bad', cancelled: 'bad',
  unmarked: 'muted',
};

function tag() {
  document.querySelectorAll('td').forEach((td) => {
    const kind = MAP[td.textContent.trim().toLowerCase()];
    if (kind) {
      if (td.dataset.badge !== kind) td.dataset.badge = kind;
    } else if (td.dataset.badge) {
      delete td.dataset.badge;
    }
  });
}

new MutationObserver(tag).observe(document.body, { childList: true, subtree: true, characterData: true });
tag();
