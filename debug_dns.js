const dns = require('dns');
const dotenv = require('dotenv');
const result = dotenv.config({ path: '.env' });

if (result.error) {
  console.error('Error loading .env', result.error);
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
console.log('SUPABASE_URL:', url);

if (!url) {
  console.error('SUPABASE_URL is missing');
  process.exit(1);
}

const hostname = new URL(url).hostname;
console.log('Hostname:', hostname);

dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('DNS Lookup Failed:', err);
  } else {
    console.log('Address:', address);
  }
});
