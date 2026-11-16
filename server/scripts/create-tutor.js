// Creates the tutor account (the only way to get one, since registration is closed).
// Usage: TUTOR_PASSWORD='your-password' node scripts/create-tutor.js "Your Name" you@example.com
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

(async () => {
  const [name, rawEmail] = process.argv.slice(2);
  const password = process.env.TUTOR_PASSWORD;
  if (!name || !rawEmail || !password || password.length < 8) {
    console.log('Usage: TUTOR_PASSWORD=<8+ chars> node scripts/create-tutor.js "Name" email');
    process.exit(1);
  }
  const email = rawEmail.toLowerCase().trim();
  await mongoose.connect(process.env.MONGO_URI);
  if (await User.findOne({ email })) {
    console.log('That email already has an account');
  } else {
    await User.create({ name, email, role: 'tutor', password: await bcrypt.hash(password, 10) });
    console.log('Tutor created:', email);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
