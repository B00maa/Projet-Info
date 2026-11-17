'use strict';

const LESSON_CALCULATIONS=['rank','spanDimension','kernelDimension','sumDimension','intersectionDimension','coordinates'];

function lessonFraction(numerator,denominator=1n) {
  let a=numerator<0n?-numerator:numerator,b=denominator<0n?-denominator:denominator;
  while(b)[a,b]=[b,a%b];
  const divisor=denominator<0n?-a:a;
  return [numerator/divisor,denominator/divisor];
}

function lessonNumber(value) {
  if(typeof value!=='string'&&typeof value!=='number')return null;
  const match=String(value).trim().replace(/−/g,'-').match(/^([+-]?\d{1,6})(?:\/([+-]?\d{1,6})|[.,](\d{1,6}))?$/);
  if(!match)return null;
  const [,integer,divisor,decimal]=match;
  if(decimal)return lessonFraction(BigInt(integer+decimal),10n**BigInt(decimal.length));
  const denominator=BigInt(divisor||1);
  return denominator===0n?null:lessonFraction(BigInt(integer),denominator);
}

function lessonNumberText([n,d]) {return d===1n?String(n):n+'/'+d;}

function lessonMatrix(value) {
  if(!Array.isArray(value)||!value.length||value.length>8)return null;
  const width=value[0]?.length;
  if(!Number.isInteger(width)||width<1||width>8||value.some(row=>!Array.isArray(row)||row.length!==width))return null;
  const matrix=value.map(row=>row.map(lessonNumber));
  return matrix.every(row=>row.every(Boolean))?matrix:null;
}

function lessonRref(matrix) {
  const rows=matrix.map(row=>row.slice()),pivots=[];
  for(let column=0;column<rows[0].length&&pivots.length<rows.length;column++){
    const level=pivots.length;
    const pivot=rows.findIndex((row,index)=>index>=level&&row[column][0]!==0n);
    if(pivot===-1)continue;
    [rows[pivot],rows[level]]=[rows[level],rows[pivot]];
    const [p,q]=rows[level][column];
    rows[level]=rows[level].map(([n,d])=>lessonFraction(n*q,d*p));
    for(const [index,row] of rows.entries()){
      const [r,s]=row[column];
      if(index===level||r===0n)continue;
      rows[index]=row.map(([a,b],j)=>{
        const [c,d]=rows[level][j];
        return lessonFraction(a*s*d-r*c*b,b*s*d);
      });
    }
    pivots.push(column);
  }
  return {rows,pivots};
}

function checkLessonCalculation(claim) {
  const type=claim?.type;
  if(!LESSON_CALCULATIONS.includes(type))return null;
  const matrix=lessonMatrix(claim?.matrix);
  if(!matrix)return null;
  const columns=matrix[0].length;
  const rank=lessonRref(matrix).pivots.length;
  let result=[String(rank)];
  if(type==='kernelDimension')result=[String(columns-rank)];
  if(type==='sumDimension'||type==='intersectionDimension'){
    const other=lessonMatrix(claim.otherMatrix);
    if(other?.length!==matrix.length)return null;
    const whole=lessonRref(matrix.map((row,index)=>[...row,...other[index]])).pivots.length;
    result=[String(type==='sumDimension'?whole:rank+lessonRref(other).pivots.length-whole)];
  }
  if(type==='coordinates'){
    if(rank!==columns||!Array.isArray(claim.vector)||claim.vector.length!==matrix.length)return null;
    const vector=claim.vector.map(lessonNumber);
    if(!vector.every(Boolean))return null;
    const solved=lessonRref(matrix.map((row,index)=>[...row,vector[index]]));
    if(solved.pivots.length!==columns)return null;
    result=solved.rows.slice(0,columns).map(row=>lessonNumberText(row[columns]));
  }
  const answer=Array.isArray(claim.answer)&&claim.answer.length===result.length?claim.answer.map(lessonNumber):[];
  const provided=answer.map(value=>value?lessonNumberText(value):'');
  return {type,result,provided,valid:result.every((value,index)=>value===provided[index])};
}
