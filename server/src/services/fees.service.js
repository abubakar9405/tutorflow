exports.totalPaid = (invoice) => invoice.payments.reduce((sum, p) => sum + p.amount, 0);

exports.computeStatus = (invoice) => {
  const paid = exports.totalPaid(invoice);
  if (paid >= invoice.amount) return 'paid';
  if (paid > 0) return 'partial';
  return 'unpaid';
};

exports.defaultDueDate = (month) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 10);
};
