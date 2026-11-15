import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {parseArgs} from 'node:util';

await import('./build-worker.mjs');
const {default:worker} = await import('../dist/server/index.js');
const {values} = parseArgs({options:{port:{type:'string'},host:{type:'string'},strictPort:{type:'boolean'}},strict:false});
const port = Number(values.port || process.env.PORT || 5173);
const host = values.host || process.env.HOST || '0.0.0.0';

createServer(async (incoming,outgoing) => {
  try {
    const url = new URL(incoming.url,`http://${incoming.headers.host}`);
    const request = new Request(url,{
      method:incoming.method,headers:incoming.headers,
      ...(['GET','HEAD'].includes(incoming.method) ? {} : {body:Readable.toWeb(incoming),duplex:'half'})
    });
    const response = await worker.fetch(request,{});
    outgoing.writeHead(response.status,Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(outgoing);
    else outgoing.end();
  } catch {
    outgoing.writeHead(500);
    outgoing.end();
  }
}).listen(port,host,() => console.log(`Madrassati Maâk preview listening on ${host}:${port}`));
