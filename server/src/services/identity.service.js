// The ONLY place that decides which students a logged-in user may see.
// Today it matches by email. At deploy time, replace these two functions
// (for example with a linkedUserId on Student) and nothing else changes.
const Student = require('../models/Student');

exports.getLinkedStudents = async (user) => {
  if (user.role === 'parent') return Student.find({ parentEmail: user.email });
  if (user.role === 'student') return Student.find({ studentEmail: user.email });
  return [];
};

exports.canAccessStudent = async (user, studentId) => {
  if (user.role === 'tutor') return true;
  const list = await exports.getLinkedStudents(user);
  return list.some((s) => String(s._id) === String(studentId));
};
