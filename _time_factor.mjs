import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const dir = 'D:\\Hermes\\zhongnanmuzuo-website';
const now = '2026-06-28T18:43:00+08:00';
const published = '2026-06-01T00:00:00+08:00';

const files = [];
function walk(p, prefix) {
  for (const f of readdirSync(p, { withFileTypes: true })) {
    if (f.name === 'admin' || f.name === '.git' || f.name.startsWith('_')) continue;
    const fp = join(p, f.name);
    if (f.isDirectory()) { walk(fp, prefix + f.name + '/'); }
    else if (f.name.endsWith('.html')) { files.push(fp); }
  }
}
walk(dir, '');

for (const fp of files) {
  const buf = readFileSync(fp);
  let html = buf.toString('utf8');
  
  const tags = `
  <meta property="bytedance:published_time" content="${published}"/>
  <meta property="bytedance:lrDate_time" content="${now}"/>
  <meta property="bytedance:updated_time" content="${now}"/>`;
  
  // Insert after <head> or first existing meta tag
  if (html.includes('<meta property="bytedance:published_time"')) {
    console.log('SKIP (already has):', fp.replace(dir+'\\',''));
    continue;
  }
  
  // Insert after <meta charset=...> or after <head>
  if (html.includes('<meta charset="UTF-8">')) {
    html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">' + tags);
  } else if (html.includes('<meta charset="utf-8">')) {
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + tags);
  } else {
    html = html.replace('<head>', '<head>' + tags);
  }
  
  writeFileSync(fp, Buffer.from(html, 'utf8'));
  console.log('OK:', fp.replace(dir+'\\',''));
}
console.log(`\n${files.length} files processed`);
