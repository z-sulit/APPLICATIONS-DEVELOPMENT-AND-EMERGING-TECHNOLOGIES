const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
  console.error('Fatal Error: JWT_SECRET is not defined in the environment.');
  process.exit(1);
}

const app = require('./src/app');
const PORT = process.env.BLOG_PORT || 5000;

app.listen(PORT, () => {
  console.log(`Blog API running on port ${PORT}`);
});
