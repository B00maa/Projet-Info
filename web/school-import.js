'use strict';

const SCHOOL_IMPORT_BYTES=4*1024*1024;

function schCsvRows(text) {
  text=text.replace(/^\uFEFF/,'');
  const header=text.split(/\r?\n/,1)[0].replace(/"(?:[^"]|"")*"/g,'');
  const separator=[';',',','\t'].reduce((best,character)=>
    header.split(character).length>header.split(best).length?character:best,';');
  const rows=[];
  let row=[],value='',quoted=false;
  for(let index=0;index<text.length;index++) {
    const char=text[index];
    if(char==='"'&&quoted&&text[index+1]==='"') { value+='"'; index++; }
    else if(char==='"'&&(quoted||!value)) quoted=!quoted;
    else if(char===separator&&!quoted) { row.push(value); value=''; }
    else if((char==='\n'||char==='\r')&&!quoted) {
      row.push(value);rows.push(row);row=[];value='';
      if(char==='\r'&&text[index+1]==='\n')index++;
    } else value+=char;
  }
  if(quoted)throw new Error('Le fichier CSV contient des guillemets non fermés.');
  row.push(value);rows.push(row);
  return rows;
}

function schExcelArchive(buffer) {
  const view=new DataView(buffer),decoder=new TextDecoder('utf-8',{fatal:true});
  const invalid=()=>new Error('Le fichier Excel est illisible. Enregistre-le au format .xlsx ou CSV.');
  let end=buffer.byteLength-22;
  const first=Math.max(0,end-65535);
  while(end>=first&&(view.getUint32(end,true)!==0x06054b50||end+22+view.getUint16(end+20,true)!==buffer.byteLength))end--;
  if(end<first||view.getUint16(end+4,true)!==0||view.getUint16(end+6,true)!==0)throw invalid();
  const count=view.getUint16(end+10,true);
  let offset=view.getUint32(end+16,true);
  if(count>512||offset>=end)throw invalid();
  const entries=new Map();
  for(let index=0;index<count;index++) {
    if(offset+46>end||view.getUint32(offset,true)!==0x02014b50)throw invalid();
    const nameLength=view.getUint16(offset+28,true);
    const next=offset+46+nameLength+view.getUint16(offset+30,true)+view.getUint16(offset+32,true);
    if(next>end)throw invalid();
    const name=decoder.decode(new Uint8Array(buffer,offset+46,nameLength));
    entries.set(name,{
      start:view.getUint32(offset+42,true),method:view.getUint16(offset+10,true),flags:view.getUint16(offset+8,true),
      length:view.getUint32(offset+20,true),size:view.getUint32(offset+24,true)
    });
    offset=next;
  }
  return async function readXml(path,required=true) {
    const entry=entries.get(path);
    if(!entry&&!required)return null;
    if(!entry||entry.start+30>buffer.byteLength||entry.size>SCHOOL_IMPORT_BYTES||
      (entry.flags&1)||view.getUint32(entry.start,true)!==0x04034b50)throw invalid();
    const position=entry.start+30+view.getUint16(entry.start+26,true)+view.getUint16(entry.start+28,true);
    if(position+entry.length>buffer.byteLength)throw invalid();
    const compressed=new Uint8Array(buffer,position,entry.length);
    let xml='';
    if(entry.method===0&&entry.size===entry.length)xml=decoder.decode(compressed);
    else if(entry.method===8) {
      const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      const reader=stream.getReader(),parts=[];
      let total=0;
      try {
        for(;;) {
          const {done,value}=await reader.read();
          if(done)break;
          total+=value.byteLength;
          if(total>entry.size){await reader.cancel();throw invalid();}
          parts.push(decoder.decode(value,{stream:true}));
        }
        parts.push(decoder.decode());
      } finally { reader.releaseLock(); }
      if(total!==entry.size)throw invalid();
      xml=parts.join('');
    } else throw invalid();
    if(/<!DOCTYPE/i.test(xml))throw invalid();
    const result=new DOMParser().parseFromString(xml,'application/xml');
    if(result.getElementsByTagName('parsererror').length)throw invalid();
    return result;
  };
}

const schExcelNodes=(parent,name)=>[...parent.getElementsByTagNameNS('*',name)];
const schExcelText=parent=>schExcelNodes(parent,'t').map(node=>node.textContent).join('');
const SCHOOL_EXCEL_COMPUTED=Symbol('Excel computed cell');

async function schExcelRows(bytes,{literalOnly=false}={}) {
  const read=schExcelArchive(bytes);
  const [workbook,relationships,strings]=await Promise.all([
    read('xl/workbook.xml'),read('xl/_rels/workbook.xml.rels'),read('xl/sharedStrings.xml',false)
  ]);
  const sheet=schExcelNodes(workbook,'sheet').find(entry=>!['hidden','veryHidden'].includes(entry.getAttribute('state')));
  const sheetId=sheet&&[...sheet.attributes].find(attribute=>attribute.localName==='id'&&attribute.prefix)?.value;
  const relation=schExcelNodes(relationships,'Relationship').find(entry=>entry.getAttribute('Id')===sheetId);
  const target=relation?.getAttribute('Target');
  if(!target||relation.getAttribute('TargetMode')==='External')throw new Error('Le fichier Excel ne contient pas de feuille lisible.');
  const path=new URL(target,'https://workbook.invalid/xl/');
  if(path.origin!=='https://workbook.invalid'||!path.pathname.startsWith('/xl/worksheets/')) {
    throw new Error('Le fichier Excel ne contient pas de feuille lisible.');
  }
  const document=await read(path.pathname.slice(1));
  const shared=strings?schExcelNodes(strings,'si').map(schExcelText):[];
  return schExcelNodes(document,'row').map(row=>{
    const values=[];
    for(const cell of schExcelNodes(row,'c')) {
      const column=/^[A-Z]+/.exec(cell.getAttribute('r')||'')?.[0];
      const index=column?[...column].reduce((number,letter)=>number*26+letter.charCodeAt(0)-64,0)-1:values.length;
      if(index>=64)continue;
      const kind=cell.getAttribute('t');
      const value=schExcelNodes(cell,'v')[0]?.textContent||'';
      values[index]=literalOnly&&(['e','b'].includes(kind)||schExcelNodes(cell,'f').length)?SCHOOL_EXCEL_COMPUTED:
        kind==='s'?shared[Number(value)]||'':kind==='inlineStr'?schExcelText(cell):value;
    }
    return values;
  });
}

const schImportHeader=value=>String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

async function schReadImport(file) {
  if(!file?.size||file.size>SCHOOL_IMPORT_BYTES)throw new Error('Choisis un fichier Excel ou CSV de 4 Mo maximum.');
  const bytes=await file.arrayBuffer();
  let rows;
  if(/\.xlsx$/i.test(file.name))rows=await schExcelRows(bytes);
  else if(/\.csv$/i.test(file.name)){
    const text=new TextDecoder().decode(bytes);
    rows=schCsvRows(text.includes('\uFFFD')?new TextDecoder('windows-1252').decode(bytes):text);
  } else throw new Error('Utilise un fichier .xlsx ou .csv.');
  const names=['nom','nom complet','nom et prenom','nom prenom','الاسم الكامل','الاسم'];
  const classes=['classe','القسم'];
  const headerIndex=rows.slice(0,8).findIndex(row=>{
    const labels=row.map(schImportHeader);
    return labels.some(label=>names.includes(label))&&labels.some(label=>classes.includes(label));
  });
  const headers=(rows[headerIndex]||[]).map(schImportHeader);
  const name=headers.findIndex(value=>names.includes(value));
  const firstName=headers.indexOf('prenom');
  const className=headers.findIndex(value=>classes.includes(value));
  const login=headers.findIndex(value=>['identifiant','identifiant scolaire','المعرف المدرسي','المعرّف المدرسي'].includes(value));
  if(name<0||className<0)throw new Error('Le fichier doit contenir les colonnes Nom et Classe.');
  const list=rows.slice(headerIndex+1).flatMap((row,index)=>row.some(cell=>String(cell).trim())?[{
    row:headerIndex+index+2,name:[row[firstName],row[name]].filter(Boolean).join(' ').trim(),
    className:String(row[className]||'').trim(),login:String(row[login]||'').trim()
  }]:[]);
  if(!list.length||list.length>200)throw new Error('Importe de 1 à 200 élèves à la fois.');
  return list;
}

function schCsvDownload(name,rows) {
  const cell=value=>'"'+String(value??'').replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"';
  const contents=rows.map(row=>row.map(cell).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF',contents],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}

function schImportDialog() {
  schoolUI.editor=null;
  schShowDialog('Importer Excel ou CSV',`<form class="form" data-school-form="school-import-preview">
    <p>La première feuille doit contenir les colonnes Nom et Classe. La colonne Identifiant est facultative.</p>
    <div><label for="schoolImportFile">Fichier des élèves</label><input id="schoolImportFile" name="file" type="file"
      accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required>
      <p class="school-small school-muted">200 élèves et 4 Mo maximum par fichier.</p></div>
    ${schError()}<div class="school-actions"><button class="btn primary" type="submit">Prévisualiser l’import</button>
      <a class="btn secondary" href="/assets/madrassati-modele-eleves.xlsx" download>Télécharger le modèle Excel</a>
      <button class="btn secondary small" type="button" data-school-action="import-template">Modèle CSV</button></div></form>`);
}

async function schImportPreview(form,button) {
  if(schoolUI.busy)return;
  schoolUI.busy=true;
  button.disabled=true;
  const error=form.querySelector('[data-school-error]');
  error.textContent='';
  try {
    const rows=await schReadImport(form.elements.file.files[0]);
    const plan=await schRequest('/accounts/import/preview',{rows});
    if(!form.isConnected||!schDialog().open)return;
    schoolUI.editor={kind:'import',rows,plan};
    schShowDialog('Aperçu de l’import',`<form class="form" data-school-form="school-import">
      ${plan.classes.length?`<ul class="school-checks">${plan.classes.map(row=>`<li><strong>${schValue(row.name)}</strong>
        <span class="tag mint" data-no-i18n="true">+${row.added} · ${row.total}</span><span>Élèves après import</span></li>`).join('')}</ul>`:''}
      ${plan.newClasses.length?`<p class="school-muted"><span>Nouvelles classes</span> · ${schValue(plan.newClasses.join(', '))}</p>`:''}
      <div class="school-table-wrap school-import-table"><table class="school-table">
      <thead><tr><th scope="col">Ligne</th><th scope="col">Nom</th><th scope="col">Classe</th><th scope="col">Vérification</th></tr></thead>
      <tbody>${plan.items.map(item=>`<tr><td>${item.row}</td><td>${schValue(item.name)}</td><td>${schValue(item.className)}</td>
        <td>${item.error?`<span class="tag orange">${schEsc(item.error)}</span>`:'<span class="tag mint">Prêt à importer</span>'}</td></tr>`).join('')}</tbody></table></div>
      ${schError()}<div class="school-actions"><button type="submit" class="btn primary" ${plan.ready===rows.length?'':'disabled'}>Créer les comptes élèves</button>
      <button type="button" class="btn secondary" data-school-action="school-import">Choisir un autre fichier</button></div></form>`);
  } catch(failure) {
    error.textContent=tr(failure.message);
  } finally {
    schoolUI.busy=false;button.disabled=false;
  }
}

function schCredentialsDialog(entries) {
  schoolUI.credentials=entries;
  schShowDialog('Accès scolaires',`<div class="school-stack">
    <p>Conservez ces accès et remettez-les en privé aux personnes concernées. Les codes sont affichés une seule fois.</p>
    <div class="school-table-wrap school-import-table"><table class="school-table"><thead><tr><th scope="col">Nom</th>
      <th scope="col">Identifiant scolaire</th><th scope="col">Code personnel</th></tr></thead>
      <tbody>${entries.map(row=>`<tr><td>${schValue(row.name)}${row.className?`<div class="school-muted school-small">${schValue(row.className)}</div>`:''}</td>
        <td><code dir="ltr" data-no-i18n="true">${schEsc(row.login)}</code></td>
        <td><code dir="ltr" data-no-i18n="true">${schEsc(row.code)}</code></td></tr>`).join('')}</tbody></table></div>
    <div><button type="button" class="btn secondary" data-school-action="download-codes">Télécharger les accès Excel</button></div></div>`);
}

function schMemberCodeDialog(id) {
  const member=schoolUI.data.directory.accounts.find(entry=>entry.id===id&&entry.active);
  if(!member)return;
  schShowDialog(member.login?'Réinitialiser le code':'Créer un accès scolaire',`<form class="form" data-school-form="member-code"
    data-id="${id}" data-revision="${member.access_revision||0}">
    <p>${schValue(member.name)}</p>
    ${member.login?'<p>Le nouveau code remplacera l’ancien et déconnectera les sessions scolaires en cours.</p>':''}
    ${schError()}<div><button type="submit" class="btn primary">Générer le code personnel</button></div></form>`);
}
