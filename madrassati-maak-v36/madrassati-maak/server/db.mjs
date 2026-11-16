import mysql from 'mysql2/promise';
import {readFileSync} from 'node:fs';

export function schoolPool(settings=process.env) {
  const uri=new URL(settings.MYSQL_URL||'');
  if(uri.protocol!=='mysql:'||!uri.pathname.slice(1))throw new Error('MYSQL_URL doit désigner une base MySQL.');
  const local=!!settings.MYSQL_SOCKET||['localhost','127.0.0.1','[::1]'].includes(uri.hostname);
  const tls=settings.MYSQL_CA_FILE?{ca:readFileSync(settings.MYSQL_CA_FILE),rejectUnauthorized:true}:
    local?undefined:{rejectUnauthorized:true};
  return mysql.createPool({
    host:uri.hostname,port:Number(uri.port||3306),user:decodeURIComponent(uri.username),
    password:decodeURIComponent(uri.password),database:decodeURIComponent(uri.pathname.slice(1)),
    socketPath:settings.MYSQL_SOCKET||undefined,ssl:tls,flags:'-FOUND_ROWS',
    charset:'UTF8MB4_0900_AI_CI',jsonStrings:true,decimalNumbers:true,connectionLimit:8
  });
}

function connectionQueries(connection) {
  return {
    prepare(sql) {
      return {bind(...values) {
        return {
          async all() { const [results]=await connection.execute(sql,values); return {results}; },
          async first() { const [rows]=await connection.execute(sql,values); return rows[0]??null; },
          async run() { const [result]=await connection.execute(sql,values); return {meta:{changes:result.affectedRows}}; },
          sql,values
        };
      }};
    }
  };
}

export function schoolDatabase(pool) {
  async function transaction(work) {
    const connection=await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result=await work(connectionQueries(connection));
      await connection.commit();
      return result;
    } catch(error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  return {
    ...connectionQueries(pool),transaction,
    batch(statements) {
      return transaction(async db=>{
        const results=[];
        for(const {sql,values} of statements)results.push(await db.prepare(sql).bind(...values).run());
        return results;
      });
    }
  };
}

export function schoolUploads(pool) {
  return {
    async put(key,file) {
      await pool.execute('INSERT INTO school_uploads (file_key,body) VALUES (?,?)',
        [key,Buffer.from(await file.arrayBuffer())]);
    },
    async get(key,{range}={}) {
      const [rows]=range
        ? await pool.execute('SELECT SUBSTRING(body,?,?) AS body FROM school_uploads WHERE file_key=?',
          [range.offset+1,range.length,key])
        : await pool.execute('SELECT body FROM school_uploads WHERE file_key=?',[key]);
      if(!rows.length)return null;
      const body=new Uint8Array(rows[0].body);
      return {body,arrayBuffer:async()=>body.buffer};
    },
    async delete(key) {
      await pool.execute('DELETE FROM school_uploads WHERE file_key=?',[key]);
    }
  };
}
