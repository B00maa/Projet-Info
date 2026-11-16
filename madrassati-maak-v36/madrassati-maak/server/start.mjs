import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {parseArgs} from 'node:util';
import {schoolPool,schoolDatabase,schoolUploads} from './db.mjs';
import worker from '../dist/server/index.js';

const {values}=parseArgs({options:{host:{type:'string'},port:{type:'string'},strictPort:{type:'boolean'}},strict:false});
const port=Number(values.port||process.env.PORT||5173);
const host=values.host||process.env.HOST||'127.0.0.1';
const origin=new URL(process.env.SCHOOL_ORIGIN||`http://127.0.0.1:${port}`).origin;
const pool=schoolPool();
await pool.query('SELECT 1 FROM school_accounts LIMIT 1');
const env={...process.env,DB:schoolDatabase(pool),BUCKET:schoolUploads(pool)};
const server=createServer(async(incoming,outgoing)=>{
  try {
    const url=new URL(incoming.url,origin);
    if(url.origin!==origin){outgoing.writeHead(400).end();return;}
    const headers=new Headers(incoming.headers);
    headers.delete('oai-authenticated-user-id');
    headers.delete('oai-authenticated-user-email');
    headers.set('cf-connecting-ip',incoming.socket.remoteAddress||'unknown');
    const options={method:incoming.method,headers};
    if(!['GET','HEAD'].includes(incoming.method))Object.assign(options,{body:Readable.toWeb(incoming),duplex:'half'});
    const response=await worker.fetch(new Request(url,options),env);
    outgoing.writeHead(response.status,Object.fromEntries(response.headers));
    if(response.body)await pipeline(Readable.fromWeb(response.body),outgoing);
    else outgoing.end();
  } catch(error) {
    if(!outgoing.headersSent)outgoing.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});
    if(!outgoing.destroyed)outgoing.end('Le service est momentanément indisponible.');
  }
});
server.listen(port,host,()=>console.log(`Madrassati Maâk écoute sur ${host}:${port}`));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>pool.end()));
