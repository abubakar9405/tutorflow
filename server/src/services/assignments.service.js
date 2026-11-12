exports.validMarks = (marks, maxMarks) =>
  Number.isFinite(marks) && marks >= 0 && marks <= maxMarks;

exports.isOverdue = (assignment) =>
  assignment.status === 'assigned' && new Date(assignment.dueDate) < new Date();
