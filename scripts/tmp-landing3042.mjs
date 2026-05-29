const r = await fetch('http://localhost:3042/', {
  headers: {'Origin': 'http://localhost:3040'},
  redirect: 'manual'
});
console.log('Status:', r.status);
const text = await r.text();
// Strip HTML tags to get readable text
const cleaned = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log('Text (2000 chars):', cleaned.slice(0, 2000));
