const SCHOOL_CRC32 = Uint32Array.from({length:256},(_,index)=>{
  let crc=index;
  for (let bit=0;bit<8;bit++) crc=(crc>>>1)^((crc&1) ? 0xedb88320 : 0);
  return crc>>>0;
});

function schoolZip(entries) {
  const data=[],directory=[];
  const text=new TextEncoder();
  let position=0,directorySize=0;
  for (const {name,bytes} of entries) {
    const label=text.encode(name);
    let crc=0xffffffff;
    for (const byte of bytes) crc=(crc>>>8)^SCHOOL_CRC32[(crc^byte)&255];
    crc=(crc^0xffffffff)>>>0;

    const local=new Uint8Array(30+label.length);
    const l=new DataView(local.buffer);
    l.setUint32(0,0x04034b50,true);
    l.setUint16(4,20,true);
    l.setUint16(6,0x0800,true);
    l.setUint16(12,0x0021,true);
    l.setUint32(14,crc,true);
    l.setUint32(18,bytes.length,true);
    l.setUint32(22,bytes.length,true);
    l.setUint16(26,label.length,true);
    local.set(label,30);

    const central=new Uint8Array(46+label.length);
    const c=new DataView(central.buffer);
    c.setUint32(0,0x02014b50,true);
    c.setUint16(4,20,true);
    c.setUint16(6,20,true);
    c.setUint16(8,0x0800,true);
    c.setUint16(14,0x0021,true);
    c.setUint32(16,crc,true);
    c.setUint32(20,bytes.length,true);
    c.setUint32(24,bytes.length,true);
    c.setUint16(28,label.length,true);
    c.setUint32(42,position,true);
    central.set(label,46);
    data.push(local,bytes);
    directory.push(central);
    position+=local.length+bytes.length;
    directorySize+=central.length;
  }
  const end=new Uint8Array(22);
  const e=new DataView(end.buffer);
  e.setUint32(0,0x06054b50,true);
  e.setUint16(8,entries.length,true);
  e.setUint16(10,entries.length,true);
  e.setUint32(12,directorySize,true);
  e.setUint32(16,position,true);
  return new Blob([...data,...directory,end],{type:'application/zip'});
}
