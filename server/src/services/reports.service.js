exports.attendanceSummary = (sessions) => {
  const count = (a) => sessions.filter((s) => s.attendance === a).length;
  const present = count('present');
  const late = count('late');
  const absent = count('absent');
  const marked = present + late + absent;
  return {
    total: sessions.length,
    present,
    late,
    absent,
    unmarked: count('unmarked'),
    rate: marked ? Math.round(((present + late) / marked) * 100) : null,
  };
};

exports.assignmentSummary = (assignments) => {
  const graded = assignments.filter((a) => a.status === 'graded');
  const percents = graded.map((a) => (a.marksObtained / a.maxMarks) * 100);
  const avg = percents.length ? Math.round(percents.reduce((s, p) => s + p, 0) / percents.length) : null;
  const now = new Date();
  return {
    total: assignments.length,
    graded: graded.length,
    submitted: assignments.filter((a) => a.status === 'submitted').length,
    overdue: assignments.filter((a) => a.status === 'assigned' && new Date(a.dueDate) < now).length,
    averagePercent: avg,
  };
};

exports.feeSummary = (invoices) => {
  const billed = invoices.reduce((s, i) => s + i.amount, 0);
  const paid = invoices.reduce((s, i) => s + i.payments.reduce((x, p) => x + p.amount, 0), 0);
  return {
    invoices: invoices.length,
    billed,
    paid,
    pending: billed - paid,
    unpaidInvoices: invoices.filter((i) => i.status !== 'paid').length,
  };
};
