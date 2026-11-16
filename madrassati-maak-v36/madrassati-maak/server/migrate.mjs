import {readFile} from 'node:fs/promises';
import {schoolPool} from './db.mjs';

export async function initializeSchool(pool) {
  for(const name of ['001-school.sql','002-parcours.sql']) {
    const migration=await readFile(new URL('../mysql/'+name,import.meta.url),'utf8');
    for(const statement of migration.split(';').map(sql=>sql.trim()).filter(Boolean)) {
      await pool.query(statement);
    }
  }
}

if(process.argv[1]&&import.meta.url===new URL(process.argv[1],'file://').href) {
  const pool=schoolPool();
  try { await initializeSchool(pool); console.log('La base MySQL de Madrassati Maâk est prête.'); }
  finally { await pool.end(); }
}
