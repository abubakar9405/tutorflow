const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

// Local disk for now. On a real deployment, swap this for cloud storage.
const dir = path.join(__dirname, '../../uploads');
fs.mkdirSync(dir, { recursive: true });

const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.txt'];

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Allowed files: pdf, png, jpg, doc, docx, txt'));
  },
});

module.exports = upload;
module.exports.dir = dir;
