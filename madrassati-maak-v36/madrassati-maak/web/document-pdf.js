'use strict';

const PDF_WIN_ANSI='€\0‚ƒ„…†‡ˆ‰Š‹Œ\0Ž\0\0‘’“”•–—˜™š›œ\0žŸ';
const PDF_THEMES={
  lesson:['#285d42','#eef6ef'],exercises:['#225974','#edf5f9'],
  exam:['#75491c','#fbf3e4'],correction:['#604672','#f5eff7'],
  grades:['#27566a','#edf5f7'],weekly:['#376150','#edf6ef'],resource:['#345b53','#eff6f4']
};
const PDF_LANGUAGE={
  fr:{lesson:'Cours',exercises:'Fiche d’exercices',exam:'Sujet d’examen',correction:'Corrigé professeur',
    grades:'Relevé des notes',weekly:'Dossier de la semaine',resource:'Ressource pédagogique',
    name:'Nom et prénom',date:'Date',page:'Page'},
  en:{lesson:'Lesson',exercises:'Practice sheet',exam:'Exam paper',correction:'Teacher answer key',
    grades:'Grade report',weekly:'Weekly study pack',resource:'Learning resource',name:'Full name',date:'Date',page:'Page'},
  ar:{lesson:'درس',exercises:'ورقة تمارين',exam:'موضوع الامتحان',correction:'تصحيح الأستاذ',
    grades:'كشف النقط',weekly:'ملف الأسبوع',resource:'مورد تعليمي',name:'الاسم الكامل',date:'التاريخ',page:'صفحة'}
};

function pdfLatinCode(char) {
  const code=char.codePointAt(0);
  if((code>=32&&code<=126)||(code>=160&&code<=255))return code;
  const index=PDF_WIN_ANSI.indexOf(char);
  return index>=0&&char!=='\0'?index+128:-1;
}

const pdfClean=value=>String(value??'').normalize('NFC')
  .replace(/[\u202f\u00a0\t]/g,' ').replace(/[‐‑‒–—]/g,'-')
  .replace(/\r\n?/g,'\n').replace(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,'');
const PDF_RTL_VISIBLE=/[\u0600-\u06ff]/;
const PDF_COMPACT_MATH_SPAN=/[+\-]?(?:[0-9٠-٩۰-۹a-z]+\s*)?[√(]?[0-9٠-٩۰-۹a-z…][0-9٠-٩۰-۹a-z….,²³%()]*(?:\s*[+*/=×÷−^<>]\s*[√(]?[0-9٠-٩۰-۹a-z…][0-9٠-٩۰-۹a-z….,²³%()]*)+/gi;
const pdfBodyText=value=>pdfClean(value).replace(/^ *(\\\[|\$\$)([\s\S]*?)(\\\]|\$\$) *$/gm,
  (whole,open,math,close)=>((open==='$$')===(close==='$$'))?open+math.trim().replace(/\s+/g,' ')+close:whole);

function wrapDocumentLine(value,maxWidth,measure) {
  const text=pdfClean(value).trim();
  if(!text)return [''];
  const lines=[];
  let line='';
  for(const word of text.split(/\s+/)) {
    const withWord=line?line+' '+word:word;
    if(measure(withWord)<=maxWidth){line=withWord;continue;}
    if(line)lines.push(line);
    line='';
    for(const character of word) {
      if(line&&measure(line+character)>maxWidth){lines.push(line);line='';}
      line+=character;
    }
  }
  if(line)lines.push(line);
  return lines;
}

function pdfTextBlocks(body) {
  return pdfClean(body).split(/\n\s*\n/).map(part=>{
    const lines=part.trim().split('\n').map(line=>line.replace(/^#{1,6}\s+/,'').replace(/\*\*([^*]+)\*\*/g,'$1'));
    const first=lines[0];
    const named=/^(?:(?:Exercice|Exercise|Question|Partie|Part|التمرين|السؤال|الجزء)\s+\S+|Objectifs?|À retenir|Consignes?|Comprendre|Notions du cours|Exemple travaillé|Learning objectives|Key concepts|Worked example|Takeaways|Instructions|الأهداف|التعليمات|مثال تطبيقي|خلاصة)(?:$|[ .:()-])/i.test(first);
    const heading=lines.length>1&&named;
    return {heading:heading?first:'',text:(heading?lines.slice(1):lines).join('\n')};
  }).filter(entry=>entry.heading||entry.text);
}

function pdfPagePlan(spec,measure) {
  const lang=PDF_LANGUAGE[spec.language]||PDF_LANGUAGE.fr;
  const rtl=spec.language==='ar';
  const [color,light]=PDF_THEMES[spec.kind]||PDF_THEMES.resource;
  const ink='#203731',muted='#485e56',line='#d5e2da';
  const left=46,right=549,width=right-left,bottom=778;
  const pages=[];
  let ops,y;
  const x=rtl?right:left,align=rtl?'right':'left';
  const rect=(x,y,width,height,fill)=>ops.push({type:'rect',x,y,width,height,color:fill});
  const put=(value,x,y,size,color=ink,bold=false,align='left')=>{
    if(typeof value==='object') {value.draw(pdfMathPen(ops,color),align==='right'?x-value.width:x,y);return;}
    const text=pdfClean(value);
    if(text)ops.push({type:'text',text,x,y,size,color,bold,align});
  };
  const fit=(s,w,size,bold=false)=>wrapDocumentLine(s,w,t=>measure(t,size,bold));
  const fitMath=(s,w,size,bold=false)=>spec.math?pdfMathLines(pdfClean(s),w,size,bold,measure)||fit(s,w,size,bold):fit(s,w,size,bold);
  function lineMetrics(value,size,step) {
    const above=typeof value==='object'?Math.max(0,value.ascent-size*.82):0;
    const below=typeof value==='object'?Math.max(0,value.descent-size*.28):0;
    return {value,above,height:value?step+above+below:9};
  }
  const titleLines=(size,step)=>fitMath(spec.title,width,size,true).map(value=>lineMetrics(value,size,step));
  const separator=()=>rect(left,y,width,.65,line);

  function start(first) {
    ops=[];pages.push(ops);
    rect(0,0,595,7,color);
    put('Madrassati Maâk',left,35,10.5,ink,true);
    put(spec.kicker||lang[spec.kind]||lang.resource,right,35,10.5,color,true,'right');
    rect(left,48,width,.8,line);
    if(!first){
      y=69;
      for(const {value,above,height} of titleLines(12,16).slice(0,2)){
        put(value,x,y+above,12,color,true,align);y+=height;
      }
      y+=13;
      return;
    }
    const size=spec.kind==='exam'||spec.kind==='grades'?26:25;
    y=86;
    for(const {value,above,height} of titleLines(size,size+5)) {
      put(value,x,y+above,size,ink,true,align);y+=height;
    }
    if(spec.subtitle) {
      y+=2;
      for(const value of fit(spec.subtitle,width,11.3)) {put(value,x,y,11.3,muted,false,align);y+=16;}
    }
    if(spec.meta?.length) {
      y+=4;
      const columnSize=width/2;
      for(let index=0;index<spec.meta.length;index+=2) {
        const cells=spec.meta.slice(index,index+2).map(([label,value])=>({
          label:fit(label,columnSize-30,9.3,true),value:fit(value,columnSize-30,10.5)
        }));
        const height=Math.max(...cells.map(cell=>14+cell.label.length*12+cell.value.length*14))+5;
        rect(left,y-4,width,height,light);
        cells.forEach(({label,value},index)=>{
          const edge=rtl?right-14-index*columnSize:left+14+index*columnSize;
          label.forEach((text,j)=>put(text,edge,y+10+j*12,9.3,color,true,align));
          value.forEach((text,j)=>put(text,edge,y+10+label.length*12+j*14,10.5,ink,false,align));
        });
        y+=height+1;
      }
    }
    if(spec.studentFields) {
      y+=18;
      const start=rtl?right-130:left+118;
      put(lang.name,x,y,10.8,ink,true,align);
      rect(rtl?start-160:start,y+2,160,.7,line);
      put(lang.date,rtl?left+190:right-181,y,10.8,ink,true,rtl?'right':'left');
      rect(rtl?left:right-123,y+2,123,.7,line);
      y+=18;
    }
    y+=20;
  }
  const room=height=>{if(y+height>bottom)start(false);};
  start(true);
  const blocks=spec.sections||pdfTextBlocks(spec.math?pdfBodyText(spec.body):spec.body);
  for(const block of blocks.flatMap(item=>item.exercises?[item,...item.exercises]:[item])) {
    const text=block.exercises?[]:(spec.math?pdfBodyText(block.text):pdfClean(block.text)).split('\n')
      .flatMap(value=>fitMath(value,width,11.3)).map(value=>lineMetrics(value,11.3,16));
    const references=block.reference?fit(block.reference.label,width,10.6,true):[];
    if(block.heading){
      const heading=fit(block.heading,width-26,12,true);
      const headingHeight=heading.length*17;
      const needed=headingHeight+15+text.reduce((sum,line)=>sum+line.height,0)+references.length*17+
        (block.exercises?.length?112:0);
      room(needed<bottom-116?needed:headingHeight+15+(text[0]?.height||0));
      if(block.section)ops.push({type:'anchor',id:block.section,y:y-17});
      rect(left,y-13,width,headingHeight+9,light);
      rect(rtl?right-3:left,y-13,3,headingHeight+9,color);
      heading.forEach((value,index)=>put(value,rtl?right-12:left+12,y+index*17+1,12,color,true,align));
      y+=headingHeight+15;
    }
    for(const {value,above,height} of text){
      room(height);
      put(value,x,y+above,11.3,ink,false,align);y+=height;
    }
    if(block.reference){
      const size=10.6;
      for(const label of references){
        const linkWidth=measure(label,size,true);
        room(20);
        put(label,x,y,size,color,true,align);
        const start=rtl?x-linkWidth:x;
        rect(start,y+2,linkWidth,.45,color);
        ops.push({type:'link',id:block.reference.section,x:start,y:y-11,width:linkWidth,height:15});
        y+=17;
      }
    }
    if(block.diagram&&typeof lessonFigureOps==='function'&&LESSON_FIGURE_CAPTIONS[block.diagram]){
      const caption=fit(LESSON_FIGURE_CAPTIONS[block.diagram][spec.language]||LESSON_FIGURE_CAPTIONS[block.diagram].fr,width,9.8);
      const scale=Math.min(1,width/LESSON_FIGURE_WIDTH);
      const height=LESSON_FIGURE_HEIGHT*scale;
      const offset=left+(width-LESSON_FIGURE_WIDTH*scale)/2;
      room(height+caption.length*13+12);
      for(const item of lessonFigureOps(block.diagram)){
        if(item.type==='text')put(item.text,offset+item.x*scale,y+item.y*scale,item.size*scale,item.color,true);
        else ops.push({...item,width:item.width&&item.width*scale,points:item.points.map(([px,py])=>[offset+px*scale,y+py*scale])});
      }
      y+=height;
      for(const line of caption){put(line,x,y,9.8,muted,false,align);y+=13;}
    }
    y+=10;
  }

  if(spec.table?.headers?.length) {
    const {headers,rows}=spec.table;
    const weights=spec.table.widths||headers.map(()=>1);
    const scale=width/weights.reduce((sum,value)=>sum+value,0);
    const columns=weights.map((value,index)=>({width:value*scale,
      x:(rtl?right:left)+(rtl?-1:1)*weights.slice(0,index).reduce((sum,v)=>sum+v,0)*scale}));
    const wrapped=(row,bold)=>headers.map((_,index)=>fit(row[index],columns[index].width-18,10.4,bold));
    const paintRow=(cells,bg,fg,bold)=>{
      const height=Math.max(...cells.map(cell=>cell.length))*14+13;
      if(bg)rect(left,y-12,width,height,bg);
      cells.forEach((cell,index)=>{
        const col=columns[index];
        cell.forEach((text,i)=>put(text,col.x+(rtl?-9:9),y+2+i*14,10.4,fg,bold,align));
      });
      y+=height;separator();
    };
    const header=wrapped(headers,true);
    room(54);
    paintRow(header,color,'#ffffff',true);
    rows.forEach((row,index)=>{
      const cells=wrapped(row,false);
      const height=Math.max(...cells.map(cell=>cell.length))*14+13;
      if(y+height>bottom){start(false);paintRow(header,color,'#ffffff',true);}
      paintRow(cells,index%2?light:null,ink,false);
    });
  }

  for(const [index,page] of pages.entries()) {
    ops=page;
    rect(left,797,width,.8,line);
    put('Madrassati Maâk',left,818,9,muted,true);
    put(lang.page+' '+(index+1)+' / '+pages.length,right,818,9,muted,false,'right');
  }
  return pages;
}

function makeSchoolDocumentPdf(spec) {
  const measureCanvas=typeof document==='undefined'?null:document.createElement('canvas').getContext('2d');
  const font='Arial, "Noto Naskh Arabic", "DejaVu Sans", sans-serif';
  const measure=(text,size,bold)=>{
    if(text.includes('−'))return text.split('−').reduce((width,part,index)=>width+measure(part,size,bold)+(index?size*.549:0),0);
    if(!measureCanvas)return [...text].length*size*.62;
    measureCanvas.font=(bold?'700 ':'400 ')+size+'px '+font;
    return measureCanvas.measureText(text).width;
  };
  const pages=pdfPagePlan(spec,measure);
  const raster=pages.some(page=>page.some(entry=>entry.type==='text'&&[...entry.text].some(char=>char!=='−'&&pdfLatinCode(char)<0)));
  return raster ? rasterDocumentPages(pages,font) : vectorDocumentPages(pages,measure);
}

function documentPdfBytes(objects) {
  const encoder=new TextEncoder();
  const bytes=value=>typeof value==='string'?encoder.encode(value):value;
  const parts=[bytes('%PDF-1.4\n')],offsets=[];
  let length=parts[0].byteLength;
  objects.forEach((value,index)=>{
    offsets.push(length);
    const chunk=[bytes((index+1)+' 0 obj\n'),...[value].flat().map(bytes),bytes('\nendobj\n')];
    parts.push(...chunk);
    length+=chunk.reduce((sum,piece)=>sum+piece.byteLength,0);
  });
  parts.push(bytes('xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'+
    offsets.map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')+
    'trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+length+'\n%%EOF\n'));
  return new Blob(parts,{type:'application/pdf'});
}

function appendPdfLessonLinks(objects,pages,pageNumber) {
  const destinations=new Map();
  for(const [index,page] of pages.entries())for(const item of page){
    if(item.type==='anchor')destinations.set(item.id,[pageNumber(index),842-item.y]);
  }
  for(const [index,page] of pages.entries()){
    const annotations=[];
    for(const link of page){
      if(link.type!=='link'||!destinations.has(link.id))continue;
      const [target,top]=destinations.get(link.id);
      const bounds=[link.x,842-link.y-link.height,link.x+link.width,842-link.y].map(number=>number.toFixed(2));
      objects.push('<< /Type /Annot /Subtype /Link /Rect ['+bounds.join(' ')+'] /Border [0 0 0] /Dest ['+target+' 0 R /XYZ 0 '+top.toFixed(2)+' 0] >>');
      annotations.push(objects.length+' 0 R');
    }
    const pageObject=pageNumber(index)-1;
    if(annotations.length)objects[pageObject]=objects[pageObject].slice(0,-2)+'/Annots ['+annotations.join(' ')+'] >>';
  }
}

function vectorDocumentPages(pages,measure) {
  const color=value=>value.match(/[0-9a-f]{2}/gi).map(channel=>(parseInt(channel,16)/255).toFixed(4)).join(' ');
  const literal=value=>[...value].map(char=>{
    const code=pdfLatinCode(char);
    return code>126?'\\'+code.toString(8).padStart(3,'0'):/[\\()]/.test(char)?'\\'+char:char;
  }).join('');
  const minusMap=['/CIDInit /ProcSet findresource begin','12 dict begin','begincmap',
    '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
    '/CMapName /MadrassatiMinus def','/CMapType 2 def','1 begincodespacerange','<00> <FF>','endcodespacerange',
    '1 beginbfchar','<2D> <2212>','endbfchar','endcmap','CMapName currentdict /CMap defineresource pop','end','end'].join('\n');
  const objects=['<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids ['+pages.map((_,index)=>(7+index*2)+' 0 R').join(' ')+'] /Count '+pages.length+' >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Symbol /ToUnicode 6 0 R >>',
    '<< /Length '+minusMap.length+' >>\nstream\n'+minusMap+'\nendstream'];
  pages.forEach((items,index)=>{
    const stream=items.map(item=>{
      const {x,y,width,height,text,size,bold,align}=item;
      if(item.type==='anchor'||item.type==='link')return '';
      const paint=color(item.color);
      if(item.type==='rect')return paint+' rg '+[x,842-y-height,width,height].join(' ')+' re f';
      if(item.type==='line')return paint+' RG '+width+' w '+item.points.map(([px,py],index)=>px+' '+(842-py)+(index?' l':' m')).join(' ')+' S';
      if(item.type==='polygon')return paint+' rg '+item.points.map(([px,py],index)=>px+' '+(842-py)+(index?' l':' m')).join(' ')+' h f';
      let position=align==='right'?x-measure(text,size,bold):x;
      return text.split(/(−)/).filter(Boolean).map(part=>{
        const minus=part==='−';
        const run=paint+' rg BT /F'+(minus?3:bold?2:1)+' '+size+' Tf '+position.toFixed(3)+' '+(842-y).toFixed(3)+' Td ('+(minus?'-':literal(part))+') Tj ET';
        position+=measure(part,size,bold);
        return run;
      }).join('\n');
    }).join('\n');
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents '+(8+index*2)+' 0 R >>');
    objects.push('<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream');
  });
  appendPdfLessonLinks(objects,pages,index=>7+index*2);
  return documentPdfBytes(objects);
}

function rasterDocumentPages(pages,font) {
  const canvas=document.createElement('canvas');canvas.width=1190;canvas.height=1684;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Impossible de préparer le document dans ce navigateur.');
  const objects=['<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids ['+pages.map((_,index)=>(3+index*3)+' 0 R').join(' ')+'] /Count '+pages.length+' >>'];
  ctx.scale(2,2);
  pages.forEach((items,index)=>{
    ctx.fillStyle='#fff';ctx.fillRect(0,0,595,842);
    for(const item of items){
      if(item.type==='anchor'||item.type==='link')continue;
      ctx.fillStyle=item.color;
      if(item.type==='rect'){ctx.fillRect(item.x,item.y,item.width,item.height);continue;}
      if(item.type==='line'||item.type==='polygon'){
        const [[x,y],...points]=item.points;
        ctx.strokeStyle=item.color;ctx.lineWidth=item.width;ctx.beginPath();ctx.moveTo(x,y);
        for(const [px,py] of points)ctx.lineTo(px,py);
        if(item.type==='line')ctx.stroke();else {ctx.closePath();ctx.fill();}
        continue;
      }
      ctx.direction=item.direction||(PDF_RTL_VISIBLE.test(item.text)?'rtl':'ltr');
      ctx.textAlign=item.align;
      ctx.font=(item.bold?'700 ':'400 ')+item.size+'px '+font;
      // A left-to-right override keeps Arabic-Indic operands in the written order.
      const text=item.direction==='ltr'?'\u202d'+item.text+'\u202c':
        !item.direction&&ctx.direction==='rtl'?item.text.replace(PDF_COMPACT_MATH_SPAN,span=>'\u2066'+span+'\u2069'):item.text;
      ctx.fillText(text,item.x,item.y);
    }
    const jpeg=Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.92).split(',')[1]),char=>char.charCodeAt(0));
    const image=4+index*3;
    const command='q 595 0 0 842 0 0 cm /Im1 Do Q';
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 '+image+' 0 R >> >> /Contents '+(image+1)+' 0 R >>');
    objects.push(['<< /Type /XObject /Subtype /Image /Width 1190 /Height 1684 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n',jpeg,'\nendstream']);
    objects.push('<< /Length '+command.length+' >>\nstream\n'+command+'\nendstream');
  });
  appendPdfLessonLinks(objects,pages,index=>3+index*3);
  return documentPdfBytes(objects);
}

function saveSchoolDocument(spec,filename) {
  saveDownload(makeSchoolDocumentPdf(spec),filename);
}
