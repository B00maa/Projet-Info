'use strict';

const PDF_MATH_COMMANDS={
  times:'×',cdot:'·',div:'÷',pm:'±',mp:'∓',le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',
  approx:'≈',equiv:'≡',propto:'∝',infty:'∞',in:'∈',notin:'∉',subset:'⊂',subseteq:'⊆',
  cup:'∪',cap:'∩',emptyset:'∅',perp:'⊥',parallel:'∥',angle:'∠',circ:'°',
  to:'→',rightarrow:'→',leftarrow:'←',Rightarrow:'⇒',implies:'⇒',Leftrightarrow:'⇔',iff:'⇔',
  alpha:'α',beta:'β',gamma:'γ',delta:'δ',Delta:'Δ',theta:'θ',lambda:'λ',mu:'μ',pi:'π',rho:'ρ',
  sigma:'σ',Sigma:'Σ',phi:'φ',omega:'ω',Omega:'Ω',sum:'∑',prod:'∏',int:'∫',partial:'∂',
  ldots:'…',cdots:'⋯',dots:'…',big:'',Big:'',bigl:'',bigr:'',quad:'  ',qquad:'    ',
  sin:'sin',cos:'cos',tan:'tan',ln:'ln',log:'log',lim:'lim',
  ',':' ',':':' ',';':' ',' ':' ','!':'','{':'{','}':'}','%':'%','_':'_','$':'$'
};
const PDF_MATH_SETS={N:'ℕ',Z:'ℤ',Q:'ℚ',R:'ℝ',C:'ℂ'};
const PDF_MATH_DELIMITERS=/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$|(?<![\\$])\$([^$\n]+)\$(?![\p{Nd}$])/gu;
const PDF_MATH_NUMBER=String.raw`\p{Nd}+(?:[.,]\p{Nd}+)?`;
const PDF_MATH_COMMAND=String.raw`\\(?:[a-z]+|[{}%_$,;!: ])`;
const PDF_MATH_LETTER=String.raw`[a-z\u0370-\u03ff](?!\p{L})`;
const PDF_MATH_TERM=String.raw`(?:${PDF_MATH_NUMBER}(?:${PDF_MATH_LETTER})?|[a-zα-ω](?=[₀₁₂₃₄₅₆₇₈₉ₚᵢ])|[α-ω](?=[a-z](?!\p{L}))|${PDF_MATH_LETTER}|${PDF_MATH_COMMAND}|(?:Vect|dim|rg|span|rank)(?= *\(| +[A-Z](?!\p{L}))|[:,]|!=|[…∞+\-−*/⁄=×÷·≤≥≠≈≡<>±∓°%^_⁰¹²³⁴⁵⁶⁷⁸⁹⁻ⁿᵢ₀₁₂₃₄₅₆₇₈₉ₚ{}()[\]√ℕℤℚℝℂ∈∉∩∪⊂⊆⊕])`;
const PDF_MATH_BARE=new RegExp(String.raw`(?<![\p{N}\p{Script=Latin}\p{Script=Greek}_])${PDF_MATH_TERM}(?: *${PDF_MATH_TERM})*`,'giu');
const PDF_MATH_SIGNAL=/[=+−×÷≤≥≠≈≡<>±∓√ℕℤℚℝℂ∈∉∩∪⊂⊆⊕⁰¹²³⁴⁵⁶⁷⁸⁹⁻ⁿᵢ₀₁₂₃₄₅₆₇₈₉ₚ]|(?:[\p{L}\p{N}…)}\]])\s*[-*/⁄^_]\s*(?=[\p{L}\p{N}…({\[+−-])|\\[a-z]+/iu;
const PDF_MATH_BARE_ARGUMENT=String.raw`(?:\([^()]+\)|${PDF_MATH_NUMBER}|[a-zA-Z\u0370-\u03ff]|…)`;
const PDF_MATH_FRACTION=new RegExp(String.raw`(?<![\p{L}\p{N}./⁄])(${PDF_MATH_BARE_ARGUMENT}) *[/⁄] *([+−-]?${PDF_MATH_BARE_ARGUMENT})(?![\p{L}\p{N}/⁄]|[.,]\p{Nd}| *[/⁄])`,'gu');
const PDF_MATH_SCRIPT_ARGUMENT=new RegExp(String.raw`^(?:${PDF_MATH_COMMAND}|[+−-]?${PDF_MATH_NUMBER}|\p{L})`,'iu');
const PDF_MATH_TEX_ARGUMENT=new RegExp(String.raw`^(?:${PDF_MATH_COMMAND}|[\p{L}\p{Nd}])`,'iu');
const pdfTextIsRtl=value=>/\p{Script=Arabic}/u.test(value.replace(/[^\p{L}]/gu,''));

function pdfMathArgument(source,index,groups,shorthand) {
  while(source[index]===' ')index++;
  const start=source[index];
  const end={'{':'}','(':')','[':']'}[start];
  if(start&&end&&groups.includes(start)) {
    let depth=1;
    for(let cursor=index+1;cursor<source.length;cursor++) {
      if(source[cursor]==='\\'){cursor++;continue;}
      if(source[cursor]===start)depth++;
      if(source[cursor]===end&&!--depth)return {value:source.slice(index+1,cursor),end:cursor+1};
    }
    return null;
  }
  const value=shorthand&&source.slice(index).match(shorthand)?.[0];
  return value?{value,end:index+value.length}:null;
}

function pdfMathSpans(value) {
  const spans=[];
  const text=part=>{if(part)spans.push({text:part});};
  function bare(part) {
    let start=0;
    for(const match of part.matchAll(PDF_MATH_BARE)) {
      const punctuation=match[0].match(/^[,:] */)?.[0]||'';
      const formula=match[0].slice(punctuation.length).replace(/[,:]$/,'');
      const offset=match.index+punctuation.length;
      const end=offset+formula.length,after=part[end]||'';
      const coordinates=/^\( *[+−-]?\p{Nd}+ *(?:, *[+−-]?\p{Nd}+ *){1,3}\)$/u.test(formula);
      if(!(/[\p{L}\p{N}…∞]/u.test(formula)&&(PDF_MATH_SIGNAL.test(formula)||coordinates))||
        /^\p{Nd}{1,4}[-/⁄]\p{Nd}{1,2}[-/⁄]\p{Nd}{1,4}$/u.test(formula))continue;
      if(/[\p{Script=Latin}\p{Script=Greek}\p{N}]/u.test(after)&&/\p{N}$/u.test(formula))continue;
      // Keep answer labels with the surrounding prose.
      const label=formula.match(/^(?:[A-Z]|\p{Nd}+)\) +/u)?.[0]||'';
      text(part.slice(start,offset)+label);
      spans.push({math:formula.slice(label.length)});
      start=end;
    }
    text(part.slice(start));
  }
  let start=0;
  for(const match of value.matchAll(PDF_MATH_DELIMITERS)) {
    bare(value.slice(start,match.index));
    spans.push({math:match.slice(1,5).find(part=>part!==undefined).trim()});
    start=match.index+match[0].length;
  }
  bare(value.slice(start));
  return spans;
}

function pdfMathPen(ops,color,left=0,top=0,scale=1) {
  return {
    text(text,x,y,size,bold,direction) {
      ops.push({type:'text',text,x:left+x*scale,y:top+y*scale,size:size*scale,bold,direction,color,align:'left'});
    },
    rect(x,y,width,height) {
      ops.push({type:'rect',x:left+x*scale,y:top+y*scale,width:width*scale,height:height*scale,color});
    },
    line(points,width) {
      ops.push({type:'line',points:points.map(([x,y])=>[left+x*scale,top+y*scale]),width:width*scale,color});
    },
    scaled(x,y,ratio) {return pdfMathPen(ops,color,left+x*scale,top+y*scale,scale*ratio);}
  };
}

function pdfMathTextBox(value,size,bold,measure,direction=pdfTextIsRtl(value)?'rtl':undefined) {
  return {width:measure(value,size,bold),ascent:size*.82,descent:size*.22,
    draw(pen,x,y) {
      pen.text(value,x,y,size,bold,direction);
    }};
}

function pdfMathRow(parts) {
  let width=0,ascent=0,descent=0;
  for(const part of parts) {
    width+=part.width;
    ascent=Math.max(ascent,part.ascent);
    descent=Math.max(descent,part.descent);
  }
  return {width,ascent,descent,draw(pen,x,y) {
    for(const part of parts){part.draw(pen,x,y);x+=part.width;}
  }};
}

function pdfMathFraction(numerator,denominator,size) {
  const width=Math.max(numerator.width,denominator.width)+size*.40;
  const rule=-size*.26,gap=size*.15,thickness=size*.055;
  const above=rule-gap-numerator.descent;
  const below=rule+thickness+gap+denominator.ascent;
  return {width,ascent:numerator.ascent-above,descent:below+denominator.descent,draw(pen,x,y) {
    numerator.draw(pen,x+(width-numerator.width)/2,y+above);
    pen.rect(x+size*.06,y+rule,width-size*.12,thickness);
    denominator.draw(pen,x+(width-denominator.width)/2,y+below);
  }};
}

function pdfMathRadical(radicand,degree,size) {
  const before=Math.max(size*.78,(degree?.width||0)+size*.38);
  const width=before+radicand.width+size*.17;
  const top=-radicand.ascent-size*.18;
  const bottom=Math.max(size*.08,radicand.descent);
  return {width,ascent:Math.max(-top,-top*.54+(degree?.ascent||0)),descent:bottom,draw(pen,x,y) {
    radicand.draw(pen,x+before,y);
    degree?.draw(pen,x,y+top*.54);
    pen.line([[x+before-size*.69,y-size*.22],[x+before-size*.55,y-size*.30],
      [x+before-size*.34,y+bottom],[x+before-size*.07,y+top],[x+width-size*.06,y+top]],size*.062);
  }};
}

function pdfMathScripts(upper,lower,size) {
  const rise=size*.49,drop=size*.31,offset=size*.055;
  return {width:Math.max(upper?.width||0,lower?.width||0)+offset,
    ascent:upper?rise+upper.ascent:0,descent:lower?drop+lower.descent:0,draw(pen,x,y) {
      upper?.draw(pen,x+offset,y-rise);
      lower?.draw(pen,x+offset,y+drop);
    }};
}

function pdfMathBox(value,size,bold,measure,depth=0) {
  const raw=text=>pdfMathTextBox(text,size,bold,measure,'ltr');
  if(depth>=8)return raw(value);
  const source=value.replace(PDF_MATH_FRACTION,(all,top,bottom,offset)=>{
    const before=value.slice(0,offset),after=value.slice(offset+all.length);
    if(/(?:[\^_√/⁄]|\\sqrt)\s*[+−-]?\s*$/.test(before)||/^\s*[\^_⁰¹²³⁴⁵⁶⁷⁸⁹⁻₀₁₂₃₄₅₆₇₈₉]/.test(after))return all;
    const ungroup=part=>part.startsWith('(')&&part.endsWith(')')?part.slice(1,-1):part;
    return '\\frac{'+ungroup(top)+'}{'+ungroup(bottom)+'}';
  }).replace(/<=/g,'≤').replace(/>=/g,'≥').replace(/!=/g,'≠');
  const child=(text,scale)=>pdfMathBox(text,size*scale,bold,measure,depth+1);
  const parts=[];
  let plain='';
  const add=box=>{if(plain)parts.push(raw(plain));plain='';parts.push(box);};
  const tokens=/\\([a-zA-Z]+|[{}%_$,;!: ])|([√_^])|([^\\√_^]+|\\)/gy;
  let match;
  while((match=tokens.exec(source))) {
    const [,command,mark,text]=match;
    const start=tokens.lastIndex;
    if(command==='left'||command==='right'){
      if(source[start]==='.')tokens.lastIndex++;
      continue;
    }
    if(command&&Object.hasOwn(PDF_MATH_COMMANDS,command)) {
      plain+=PDF_MATH_COMMANDS[command];continue;
    }
    if(['frac','dfrac','tfrac'].includes(command)) {
      const first=pdfMathArgument(source,start,'{',PDF_MATH_TEX_ARGUMENT);
      const second=first&&pdfMathArgument(source,first.end,'{',PDF_MATH_TEX_ARGUMENT);
      if(second){
        add(pdfMathFraction(child(first.value,.83),child(second.value,.83),size));
        tokens.lastIndex=second.end;continue;
      }
    }
    if(command==='sqrt'||mark==='√') {
      const degree=command==='sqrt'?pdfMathArgument(source,start,'['):null;
      const root=pdfMathArgument(source,degree?.end||start,command==='sqrt'?'{':'{(',PDF_MATH_SCRIPT_ARGUMENT);
      if(root){
        add(pdfMathRadical(child(root.value,1),degree&&child(degree.value,.55),size));
        tokens.lastIndex=root.end;continue;
      }
    }
    if(['text','mathrm','mathbf','operatorname','mathbb'].includes(command)) {
      const argument=pdfMathArgument(source,start,'{');
      if(argument){
        const value=command==='mathbb'&&Object.hasOwn(PDF_MATH_SETS,argument.value)?PDF_MATH_SETS[argument.value]:argument.value;
        add(pdfMathTextBox(value,size,bold,measure));
        tokens.lastIndex=argument.end;continue;
      }
    }
    if((mark==='^'||mark==='_')&&(plain.trim()||parts.length)) {
      const first=pdfMathArgument(source,start,'{(',PDF_MATH_SCRIPT_ARGUMENT);
      if(first){
        const other=mark==='^'?'_':'^';
        const second=source[first.end]===other?pdfMathArgument(source,first.end+1,'{(',PDF_MATH_SCRIPT_ARGUMENT):null;
        const upper=mark==='^'?first:second,lower=mark==='_'?first:second;
        plain=plain.trimEnd();
        add(pdfMathScripts(upper&&child(upper.value,.69),lower&&child(lower.value,.69),size));
        tokens.lastIndex=second?.end||first.end;continue;
      }
    }
    plain+=(text||match[0]).replace(/-/g,'−');
  }
  if(plain)parts.push(raw(plain));
  return pdfMathRow(parts);
}

function pdfMathLines(value,width,size,bold,measure) {
  const spans=pdfMathSpans(value);
  if(!spans.some(span=>span.math!==undefined))return null;
  const rtl=spans.some(span=>span.text&&pdfTextIsRtl(span.text));
  const words=[];
  let word=[];
  for(const span of spans){
    if(span.math!==undefined){
      if(span.math)word.push(pdfMathBox(span.math,size,bold,measure));
      continue;
    }
    for(const part of span.text.split(/( +)/).filter(Boolean)){
      if(part[0]===' '){if(word.length)words.push(word);word=[];}
      else word.push(part);
    }
  }
  if(word.length)words.push(word);
  if(!words.length)return [''];

  const textBox=text=>pdfMathTextBox(text,size,bold,measure);
  const gap={width:measure(' ',size,bold),ascent:0,descent:0,draw(){}};
  const spaces=count=>Array(count).fill(gap);
  function group(parts,reverse=false) {
    const runs=[];
    for(const part of parts){
      if(typeof part==='string'&&typeof runs.at(-1)==='string')runs[runs.length-1]+=part;
      else runs.push(part);
    }
    if(reverse)runs.reverse();
    return pdfMathRow(runs.flatMap(run=>{
      if(typeof run!=='string')return [run];
      const leading=run.length-run.trimStart().length,trailing=run.length-run.trimEnd().length;
      const content=run.trim();
      if(!content)return spaces(run.length);
      return [...spaces(reverse?trailing:leading),textBox(content),...spaces(reverse?leading:trailing)];
    }));
  }
  const lines=[];
  let row=[],used=0;
  const flush=()=>{if(row.length)lines.push(group(row,rtl));row=[];used=0;};
  for(const parts of words){
    const box=group(parts,rtl);
    if(row.length&&used+gap.width+box.width>width)flush();
    if(box.width>width){
      if(parts.every(part=>typeof part==='string')){
        for(const character of parts.join('')){
          const advance=measure(character,size,bold);
          if(row.length&&used+advance>width)flush();
          row.push(character);used+=advance;
        }
        continue;
      }
      const scale=width/box.width;
      lines.push({width,ascent:box.ascent*scale,descent:box.descent*scale,draw(pen,x,y) {
        box.draw(pen.scaled(x,y,scale),0,0);
      }});
      continue;
    }
    if(row.length){row.push(' ');used+=gap.width;}
    row.push(...parts);used+=box.width;
  }
  flush();
  return lines;
}
