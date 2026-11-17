import {copyFile, mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {extname} from 'node:path';

const mimeTypes = {
  '.css':'text/css; charset=utf-8',
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.mp3':'audio/mpeg',
  '.mp4':'video/mp4',
  '.svg':'image/svg+xml',
  '.webp':'image/webp',
  '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
const web = new URL('../web/',import.meta.url);
const dist = new URL('../dist/',import.meta.url);
const demoEntries = new Set(['index.html','app.js','roles.js','games.js','i18n-games.js']);
const assets = {};
for (const path of (await readdir(web,{recursive:true})).sort()) {
  const type = mimeTypes[extname(path)];
  if (!type || demoEntries.has(path)) continue;
  const bytes = await readFile(new URL(path,web));
  assets[`/${path}`] = {type,bytes:bytes.toString('base64')};
}
if (!assets['/school.html']) throw new Error('Missing web/school.html');
const workerSources=[
  'school-core','school-access','school-planning','school-grades','school-attendance',
  'school-work','school-communication','school-series','school-notifications','school-quizzes','teacher-course','index'
].map(name=>new URL('../worker/'+name+'.js',import.meta.url));
const sharedSources=['school-zip.js','teacher-lesson.js','lesson-calculations.js'].map(name=>new URL(name,web));
const worker=(await Promise.all([...sharedSources,...workerSources].map(file=>readFile(file,'utf8')))).join('\n');
await mkdir(new URL('server/',dist),{recursive:true});
await mkdir(new URL('.openai/',dist),{recursive:true});
await writeFile(new URL('server/index.js',dist),`const ASSETS = ${JSON.stringify(assets)};\n${worker}`);
await copyFile(new URL('../.openai/hosting.json',import.meta.url),new URL('.openai/hosting.json',dist));
