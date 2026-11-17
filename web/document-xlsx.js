'use strict';

const SCHOOL_XLSX_MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const xlsxXml=value=>String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\uFFFE\uFFFF]/g,'')
  .replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const XLSX_MAIN='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const XLSX_REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const XLSX_PACKAGE_REL='http://schemas.openxmlformats.org/package/2006/relationships';

function xlsxDate(value) {
  if(!value)return '';
  const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const date=Date.parse((match?match[3]+'-'+match[2]+'-'+match[1]:value)+'T00:00:00Z');
  return Number.isFinite(date)?{date:date/86400000+25569}:value;
}

function xlsxColumn(index) {
  let name='';
  for(let n=index+1;n>0;n=Math.floor((n-1)/26))name=String.fromCharCode(65+(n-1)%26)+name;
  return name;
}

function xlsxCell(address,value,style) {
  if(value&&typeof value.date==='number')return '<c r="'+address+'" s="'+(style+2)+'"><v>'+value.date+'</v></c>';
  if(typeof value==='number'&&Number.isFinite(value))return '<c r="'+address+'" s="'+style+'"><v>'+value+'</v></c>';
  if(value===null||value===undefined||value==='')return '<c r="'+address+'" s="'+style+'"/>';
  return '<c r="'+address+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+xlsxXml(value)+'</t></is></c>';
}

function schoolWorkbookSheet(spec) {
  const {headers,rows,widths,subtitle,rightToLeft}=spec;
  const last=xlsxColumn(headers.length-1);
  const end=3+Math.max(rows.length,1);
  const line=(index,height,cells)=>'<row r="'+index+'" ht="'+height+'" customHeight="1">'+cells+'</row>';
  const cells=(row,index,style)=>headers.map((_,column)=>xlsxCell(xlsxColumn(column)+index,row[column],style)).join('');
  const data=[
    line(1,32,xlsxCell('A1',spec.title,1)),
    line(2,24,xlsxCell('A2',subtitle,2)),
    line(3,28,cells(headers,3,3)),
    ...rows.map((row,index)=>line(index+4,23,cells(row,index+4,index%2?5:4)))
  ];
  const columns=headers.map((_,index)=>{
    const width=widths?.[index]||20;
    return '<col min="'+(index+1)+'" max="'+(index+1)+'" width="'+width+'" customWidth="1"/>';
  }).join('');
  return '<worksheet xmlns="'+XLSX_MAIN+'"><dimension ref="A1:'+last+end+'"/>'+
    '<sheetViews><sheetView workbookViewId="0" showGridLines="0"'+(rightToLeft?' rightToLeft="1"':'')+'>'+
    '<pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/>'+
    '<selection pane="bottomLeft" activeCell="A4" sqref="A4"/></sheetView></sheetViews>'+
    '<sheetFormatPr defaultRowHeight="23"/><cols>'+columns+'</cols><sheetData>'+data.join('')+'</sheetData>'+
    '<autoFilter ref="A3:'+last+end+'"/>'+
    '<mergeCells count="2"><mergeCell ref="A1:'+last+'1"/><mergeCell ref="A2:'+last+'2"/></mergeCells>'+
    '<pageMargins left="0.4" right="0.4" top="0.55" bottom="0.55" header="0.25" footer="0.25"/></worksheet>';
}

function schoolWorkbookStyles(accent) {
  const font=(size,color,bold=false)=>'<font>'+(bold?'<b/>':'')+'<sz val="'+size+'"/><color rgb="FF'+color+'"/><name val="Calibri"/></font>';
  const fill=color=>'<fill><patternFill patternType="solid"><fgColor rgb="FF'+color+'"/><bgColor indexed="64"/></patternFill></fill>';
  const style=(fontId,fillId,borderId=0,format=0)=>'<xf numFmtId="'+format+'" fontId="'+fontId+'" fillId="'+fillId+'" borderId="'+borderId+
    '" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"'+(format?' applyNumberFormat="1"':'')+'><alignment vertical="center"/></xf>';
  return '<styleSheet xmlns="'+XLSX_MAIN+'"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts>'+
    '<fonts count="4">'+font(11,'203D37')+font(17,'FFFFFF',true)+
    font(11,'405950')+font(11,'FFFFFF',true)+'</fonts><fills count="6"><fill><patternFill patternType="none"/></fill>'+
    '<fill><patternFill patternType="gray125"/></fill>'+fill(accent)+fill('EAF3EF')+fill('FFFFFF')+fill('F0F6F3')+'</fills>'+
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/>'+
    '<bottom style="thin"><color rgb="FFD7E5DB"/></bottom><diagonal/></border></borders>'+
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
    '<cellXfs count="8">'+[style(0,0),style(1,2),style(2,3),style(3,2),style(0,4,1),style(0,5,1),
      style(0,4,1,164),style(0,5,1,164)].join('')+
    '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
}

function makeSchoolWorkbook(sheets,accent='285D42') {
  const rootType='application/vnd.openxmlformats-officedocument.spreadsheetml.';
  const type=(path,value)=>'<Override PartName="/'+path+'" ContentType="'+rootType+value+'+xml"/>';
  const relation=(index,kind,target)=>'<Relationship Id="rId'+index+'" Type="'+XLSX_REL+'/'+kind+'" Target="'+target+'"/>';
  const names=sheets.map((sheet,index)=>'<sheet name="'+xlsxXml(sheet.name)+'" sheetId="'+(index+1)+'" r:id="rId'+(index+1)+'"/>');
  const sheetPaths=sheets.map((_,index)=>'worksheets/sheet'+(index+1)+'.xml');
  const entries={
    '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
      '<Default Extension="xml" ContentType="application/xml"/>'+type('xl/workbook.xml','sheet.main')+
      type('xl/styles.xml','styles')+sheetPaths.map(path=>type('xl/'+path,'worksheet')).join('')+'</Types>',
    '_rels/.rels':'<Relationships xmlns="'+XLSX_PACKAGE_REL+'">'+relation(1,'officeDocument','xl/workbook.xml')+'</Relationships>',
    'xl/workbook.xml':'<workbook xmlns="'+XLSX_MAIN+'" xmlns:r="'+XLSX_REL+'"><bookViews><workbookView/></bookViews>'+
      '<sheets>'+names.join('')+'</sheets></workbook>',
    'xl/_rels/workbook.xml.rels':'<Relationships xmlns="'+XLSX_PACKAGE_REL+'">'+
      sheetPaths.map((path,index)=>relation(index+1,'worksheet',path)).join('')+relation(sheets.length+1,'styles','styles.xml')+'</Relationships>',
    'xl/styles.xml':schoolWorkbookStyles(accent)
  };
  sheets.forEach((sheet,index)=>{entries['xl/'+sheetPaths[index]]=schoolWorkbookSheet(sheet);});
  const encoder=new TextEncoder();
  const archive=schoolZip(Object.entries(entries).map(([name,source])=>({name,bytes:encoder.encode(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+source)})));
  return new Blob([archive],{type:SCHOOL_XLSX_MIME});
}

function saveSchoolWorkbook(sheets,filename,accent) {
  saveDownload(makeSchoolWorkbook(sheets,accent),filename);
}
