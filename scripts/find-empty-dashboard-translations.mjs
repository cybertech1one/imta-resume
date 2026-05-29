import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const poPath = join(process.cwd(), 'locales', 'fr-FR.po');
const content = readFileSync(poPath, 'utf-8');
const lines = content.split('\n');

// Dashboard paths to filter by
const dashboardPaths = [
  'src/routes/dashboard/-components/',
  'src/routes/dashboard/career/',
  'src/routes/dashboard/interview/',
  'src/routes/dashboard/jobs/',
  'src/routes/dashboard/settings/',
  'src/routes/dashboard/ai-mentor',
  'src/routes/dashboard/networking/',
  'src/routes/dashboard/tools/',
];

// Parse PO file into entries
const entries = [];
let currentEntry = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.startsWith('#:')) {
    if (!currentEntry) {
      currentEntry = { refs: [], msgid: null, msgstr: null, lineStart: i };
    }
    currentEntry.refs.push(line.slice(2).trim());
  } else if (line.startsWith('msgid ')) {
    if (!currentEntry) currentEntry = { refs: [], msgid: null, msgstr: null, lineStart: i };
    let msgid = line.slice(6);
    // Handle multi-line msgid
    while (i + 1 < lines.length && lines[i + 1].startsWith('"')) {
      i++;
      msgid += '\n' + lines[i];
    }
    currentEntry.msgid = msgid;
    currentEntry.msgidLine = i;
  } else if (line.startsWith('msgstr ')) {
    let msgstr = line.slice(7);
    // Handle multi-line msgstr
    while (i + 1 < lines.length && lines[i + 1].startsWith('"')) {
      i++;
      msgstr += '\n' + lines[i];
    }
    currentEntry.msgstr = msgstr;
    currentEntry.msgstrLine = i;
    entries.push(currentEntry);
    currentEntry = null;
  } else if (line === '' || line.startsWith('#')) {
    // skip
  }
}

// Filter to dashboard-referenced entries with empty msgstr
const dashboardEmpty = entries.filter(e => {
  if (!e.refs || e.refs.length === 0) return false;
  const refStr = e.refs.join(' ');
  const isDashboard = dashboardPaths.some(p => refStr.includes(p));
  if (!isDashboard) return false;
  // Empty msgstr is exactly ""
  const isEmpty = e.msgstr === '""' || e.msgstr === '""\n""' || e.msgstr === '' ||
                  (e.msgstr && e.msgstr.trim() === '""');
  return isEmpty;
});

console.log(`Total entries parsed: ${entries.length}`);
console.log(`Dashboard-referenced entries with empty msgstr: ${dashboardEmpty.length}`);

// Write list for inspection
const output = dashboardEmpty.map(e => ({
  refs: e.refs,
  msgid: e.msgid,
  msgstr: e.msgstr
}));

writeFileSync('scripts/dashboard-empty-list.json', JSON.stringify(output, null, 2));
console.log('Written to scripts/dashboard-empty-list.json');
