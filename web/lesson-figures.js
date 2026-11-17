'use strict';

const LESSON_FIGURE_WIDTH=460;
const LESSON_FIGURE_HEIGHT=170;
const LESSON_FIGURE_CAPTIONS={
  'vector-complement':{
    fr:'Dans ℝ³, le plan F d’équation z = 0 et l’axe G des z sont supplémentaires. Le vecteur w se décompose en u ∈ F et v ∈ G.',
    en:'In ℝ³, the plane F given by z = 0 and the z-axis G are complementary. The vector w decomposes into u ∈ F and v ∈ G.',
    ar:'في ℝ³، المستوى F ذو المعادلة z = 0 ومحور z المسمّى G فضاءان متتامان. يتحلّل المتجه w إلى u من F وv من G.'
  },
  'vector-coordinates':{
    fr:'Le déplacement jusqu’à w = (4, 2) additionne 3u et v. Les coordonnées de w dans la base (u, v) sont (3, 1).',
    en:'Adding the displacements 3u and v reaches w = (4, 2). Its coordinates in the basis (u, v) are (3, 1).',
    ar:'نصل إلى w = (4, 2) بجمع 3u وv. إحداثيات w في الأساس (u, v) هي (3, 1).'
  },
  'equivalent-fractions':{
    fr:'Les deux bandes ont la même longueur. Deux tiers couvrent la même partie que quatre sixièmes.',
    en:'The bars have the same length. Two thirds cover the same share as four sixths.',
    ar:'للشريطين الطول نفسه. يغطي ثلثان الجزء نفسه الذي تغطيه أربعة أسداس.'
  }
};

function lessonFigureOps(kind) {
  if(!Object.hasOwn(LESSON_FIGURE_CAPTIONS,kind))return [];
  const ink='#263e37',green='#285f4b',blue='#256382',orange='#9b561f',grid='#cadbd3';
  const ops=[];
  const line=(points,color,width=1.3)=>ops.push({type:'line',points,color,width});
  const polygon=(points,color)=>ops.push({type:'polygon',points,color});
  const label=(text,x,y,color=ink,size=12)=>ops.push({type:'text',text,x,y,color,size,bold:true,align:'left'});
  function arrow(from,to,color,width=2) {
    const [x,y]=to,[dx,dy]=[x-from[0],y-from[1]],length=Math.hypot(dx,dy);
    const ux=dx/length,uy=dy/length;
    line([from,to],color,width);
    polygon([to,[x-8*ux-3*uy,y-8*uy+3*ux],[x-8*ux+3*uy,y-8*uy-3*ux]],color);
  }
  function dashed(from,to,color) {
    const lerp=t=>[from[0]+t*(to[0]-from[0]),from[1]+t*(to[1]-from[1])];
    for(let i=0;i<10;i+=2)line([lerp(i/10),lerp((i+1)/10)],color);
  }
  if(kind==='vector-complement'){
    const origin=[223,113],base=[322,111],tip=[322,43],lift=[223,45];
    const plane=[[98,121],[280,139],[365,91],[184,73]];
    line([[223,147],origin],blue,2);
    polygon(plane,'#dceee6');line([...plane,plane[0]],green,1.4);
    line([[140,124],[225,77]],grid);line([[193,130],[278,81]],grid);line([[245,135],[330,87]],grid);
    line([[142,97],[325,115]],grid);
    arrow(origin,[223,24],blue,1.8);
    arrow(origin,base,green);arrow(origin,tip,ink);
    dashed(lift,tip,blue);dashed(base,tip,orange);
    label('F : z = 0',270,127,green);label('G',232,33,blue);
    label('O',208,128);label('u',290,106,green);label('v',231,64,blue);label('w = u + v',329,47);
  }
  if(kind==='vector-coordinates'){
    const o=[102,115],p=(x,y)=>[o[0]+29*x,o[1]-29*y];
    for(let x=-1;x<=6;x++)line([p(x,-1),p(x,3.35)],grid,.7);
    for(let y=-1;y<=3;y++)line([p(-1,y),p(6,y)],grid,.7);
    arrow(p(-1,0),p(6.2,0),ink,1);arrow(p(0,-1),p(0,3.45),ink,1);
    label('x',287,119);label('y',108,23);label('O',89,130);
    dashed(p(4,0),p(4,2),grid);dashed(p(0,2),p(4,2),grid);
    label('4',215,132);label('2',88,61);
    arrow(o,p(3,3),green);arrow(p(3,3),p(4,2),orange);
    arrow(o,p(4,2),ink,1.8);
    label('3u',143,59,green);label('v',204,36,orange);label('w',227,59);
    label('u = (1, 1)',318,56,green);label('v = (1, -1)',318,80,orange);label('w = 3u + v',318,104);
  }
  if(kind==='equivalent-fractions'){
    for(const [y,denominator,numerator] of [[40,3,2],[102,6,4]]){
      const x=105,width=300,height=30,cell=width/denominator;
      polygon([[x,y],[x+cell*numerator,y],[x+cell*numerator,y+height],[x,y+height]],'#bfe3d0');
      line([[x,y],[x+width,y],[x+width,y+height],[x,y+height],[x,y]],green);
      for(let i=1;i<denominator;i++)line([[x+i*cell,y],[x+i*cell,y+height]],green);
      label(numerator+'/'+denominator,55,y+20,green,15);
    }
  }
  return ops;
}

function renderLessonFigure(kind,language) {
  const caption=LESSON_FIGURE_CAPTIONS[kind]?.[language];
  if(!caption)return '';
  const graphic=lessonFigureOps(kind).map(item=>{
    if(item.type==='text')return '<text x="'+item.x+'" y="'+item.y+'" fill="'+item.color+'" font-size="'+item.size+'">'+item.text+'</text>';
    const points=item.points.map(point=>point.join(',')).join(' ');
    return item.type==='line'?'<polyline points="'+points+'" fill="none" stroke="'+item.color+'" stroke-width="'+item.width+'" stroke-linejoin="round" stroke-linecap="round"/>':
      '<polygon points="'+points+'" fill="'+item.color+'"/>';
  }).join('');
  return '<figure class="lesson-figure" data-no-i18n="true"><svg viewBox="0 0 '+LESSON_FIGURE_WIDTH+' '+LESSON_FIGURE_HEIGHT+'" aria-hidden="true" direction="ltr">'+
    graphic+'</svg><figcaption dir="auto">'+caption+'</figcaption></figure>';
}
