import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {test} from 'node:test';
import mysql from 'mysql2/promise';
import {schoolDatabase,schoolPool,schoolUploads} from './db.mjs';
import {initializeSchool} from './migrate.mjs';
import worker from '../dist/server/index.js';

const origin='https://school-tests.example';
const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Casablanca',dateStyle:'short',timeStyle:'short'});
const minute=offset=>formatter.format(Date.now()+offset*60000).replace(' ','T');
const form=fields=>{
  const data=new FormData();
  for(const [key,value] of Object.entries(fields))data.set(key,value);
  return data;
};

test('parcours et évaluations sur un serveur MySQL',async()=>{
  const uri=new URL(process.env.MYSQL_TEST_URL||'');
  const name='madrassati_test_'+randomUUID().replaceAll('-','');
  uri.pathname='/';
  const bootstrap=await mysql.createConnection(uri.href);
  await bootstrap.query('CREATE DATABASE `'+name+'` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci');
  uri.pathname='/'+name;
  const pool=schoolPool({MYSQL_URL:uri.href});
  try {
    await initializeSchool(pool);
    const [[server]]=await pool.query('SELECT VERSION() AS version');
    assert.match(server.version,/^8\.4\./);
    const env={DB:schoolDatabase(pool),BUCKET:schoolUploads(pool),SCHOOL_SETUP_CODE:'activation-integration-4b0717a7'};
    async function api(path,{cookie,body,status=200}={}) {
      const headers=new Headers({origin});
      if(cookie)headers.set('cookie',cookie);
      if(body!==undefined&&!(body instanceof FormData))headers.set('content-type','application/json');
      const response=await worker.fetch(new Request(origin+'/api/school'+path,{
        method:body===undefined?'GET':'POST',headers,
        ...(body===undefined?{}:{body:body instanceof FormData?body:JSON.stringify(body)})
      }),env);
      const content=response.headers.get('content-type')?.includes('application/json')?await response.json():await response.text();
      assert.equal(response.status,status,path+' '+JSON.stringify(content));
      return {content,cookie:response.headers.get('set-cookie')?.split(';')[0]};
    }
    const get=(cookie,path,status)=>api(path,{cookie,status}).then(result=>result.content);
    const post=(cookie,path,body,status)=>api(path,{cookie,body,status}).then(result=>result.content);
    const page=(cookie,name)=>get(cookie,'/state?view='+name);
    const login=credentials=>api('/auth/login',{body:credentials}).then(result=>result.cookie);
    async function activate({credential}) {
      const cookie=await login(credential);
      return (await api('/auth/password',{cookie,body:{
        currentPassword:credential.code,newPassword:'Phrase secrète fictive de vérification'
      }})).cookie;
    }
    for(const path of ['/','/ecole','/index.html']) {
      const html=await (await worker.fetch(new Request(origin+path),env)).text();
      assert.match(html,/id="schoolApp"/);
      assert.doesNotMatch(html,/MAQUETTE|id="app"/);
    }
    await get(undefined,'/state',401);
    assert.equal((await get(undefined,'/auth/info')).setupState,'ready');
    await post(undefined,'/auth/setup',{setupCode:'incorrect'},401);
    const setup=await post(undefined,'/auth/setup',{setupCode:env.SCHOOL_SETUP_CODE},201);
    const admin=await login(setup.credential);
    await post(admin,'/classes',{name:'2e Bac',stream:'Sciences physiques'});
    await post(admin,'/classes',{name:'1re année primaire'});
    const {directory}=await page(admin,'classes');
    const level=directory.classes.find(row=>row.name==='2e Bac · Sciences physiques').id;
    const primary=directory.classes.find(row=>row.name==='1re année primaire').id;
    const create=(role,name,fields)=>post(admin,'/accounts',{role,name,...fields});
    const teacher=await create('professeur','Professeure de test',{subject:'Mathématiques',classIds:[level]});
    const alice=await create('eleve','Alice de test',{classIds:[level]});
    const bilal=await create('eleve','Bilal de test',{classIds:[level]});
    const other=await create('eleve','Camille de test',{classIds:[primary]});
    const parent=await create('parent','Parent de test',{childIds:[alice.id]});
    const [prof,a,b,c,family]=await Promise.all([teacher,alice,bilal,other,parent].map(activate));
    for(const section of ['eleves','professeurs','parents','comptes'])assert.ok((await page(admin,section)).directory.accounts.length>=5);
    const support=new File(['%PDF-1.4\nChapitre de test\n%%EOF'],'suites.pdf',{type:'application/pdf'});
    const chapter=(await post(prof,'/chapter',form({class:level,title:'Suites numériques',
      description:'Identifier la raison d’une suite.',exercise:'Calculer le troisième terme.',support}))).id;
    await post(prof,'/chapter',form({class:primary,title:'Niveau non attribué',description:'Test'}),403);
    await get(c,'/session?session='+chapter,404);
    assert.match(await get(a,'/file/'+chapter),/Chapitre de test/);
    await get(a,'/slots',404);
    await post(a,'/chapter/open',{id:chapter,stage:'cours'});
    assert.equal((await page(a,'aujourdhui')).learning.next,chapter);
    await post(a,'/chapter/help',{id:chapter,question:'Comment reconnaître la raison ?'});
    assert.match((await page(prof,'messages')).messages[0].body,/Suites numériques/);
    const questions=[{prompt:'Quelle est la raison de 2, 5, 8 ?',choices:['2','3','6'],correct:1,explanation:'La différence est constante.'}];
    await post(prof,'/quiz',{id:chapter,questions,revision:0});
    await post(a,'/quiz/submit',{id:chapter,revision:1,answers:[0]});
    assert.deepEqual((await page(a,'revoir')).learning.chapters[0].review,[questions[0].prompt]);
    await post(a,'/quiz/submit',{id:chapter,revision:1,answers:[1]});
    assert.ok((await page(family,'progression')).learning.chapters[0].completed_at);
    assert.equal((await get(prof,'/quiz/results?session='+chapter)).completed,1);
    assert.equal((await get(prof,'/chapter/progress?chapter='+chapter)).roster.length,2);
    await post(a,'/homework/submit',form({session:chapter,revision:'0',answer:'Le troisième terme vaut 8.'}));
    assert.ok((await page(family,'devoirs')).homework[0].submitted_at);
    const evaluation={title:'Contrôle des suites',kind:'test',classId:level,opens:minute(-5),closes:minute(120),
      duration:5,instruction:'Déterminer la raison et expliquer la démarche.',rubric:'Raison 8 points, démarche 12 points.'};
    const id=(await post(prof,'/assessment',evaluation)).id;
    const detail='/assessment/detail?id='+id;
    const submit=(cookie,revision,fields,status)=>post(cookie,'/assessment/submission',
      form({id,revision:String(revision),...fields}),status);
    assert.equal((await get(a,detail)).assessment.instruction,'');
    await get(c,detail,404);
    const opened=await post(a,'/assessment/start',{id});
    assert.equal(opened.copy.revision,1);
    assert.ok(opened.deadline>Date.now()&&opened.deadline<Date.now()+6*60000);
    assert.equal((await get(b,detail)).status,'afaire');
    await submit(a,1,{action:'draft',answer:'Ma démarche.'});
    assert.equal((await get(a,detail)).copy.answer,'Ma démarche.');
    assert.equal((await get(family,detail)).copy,null);
    await pool.execute('UPDATE school_assessment_submissions SET started_at=? WHERE assessment_id=? AND student_id=?',
      [Date.now()-6*60000,id,alice.id]);
    await submit(a,2,{action:'submit',answer:'Raison 3.'},409);
    await post(prof,'/assessment/extend',{id,student:alice.id,closes:minute(240),extraMinutes:12});
    assert.equal((await get(a,detail)).status,'brouillon');
    const copy=new File(['%PDF-1.4\nCopie manuscrite\n%%EOF'],'test.pdf',{type:'application/pdf'});
    await submit(a,2,{action:'submit',answer:'Raison 3.',file:copy});
    await submit(a,3,{action:'submit',answer:'Autre réponse'},409);
    const download='/assessment/file?id='+id+'&student='+alice.id;
    assert.match(await get(prof,download),/Copie manuscrite/);
    await get(b,download,404);
    await post(prof,'/assessment/correct',{id,student:alice.id,revision:3,score:'18.5',feedback:'Démarche claire.'});
    assert.equal((await get(family,detail)).copy.feedback,'');
    await post(admin,'/period',{action:'open',closes:minute(120),timeZone:'Africa/Casablanca'});
    const {period}=await page(admin,'notes');
    const draft=await post(prof,'/evaluation/draft',{assessmentId:id,assessmentRevision:1,periodId:period.id,draftRevision:0,
      scores:{[alice.id]:18.5}});
    assert.equal(draft.revision,1);
    assert.equal((await page(prof,'notes')).evaluations[0].scores[alice.id],18.5);
    const grade=await post(prof,'/evaluation',{assessmentId:id,assessmentRevision:1,periodId:period.id,draftRevision:1,
      scores:{[alice.id]:18.5}});
    await post(admin,'/period/close',{id:period.id,revision:period.revision});
    await post(admin,'/period/publish',{id:period.id,revision:(await page(admin,'notes')).period.revision,action:'now'});
    assert.equal((await get(family,'/grade?id='+grade.id)).score,18.5);
    assert.equal((await get(family,detail)).copy.feedback,'Démarche claire.');
    assert.ok((await page(a,'notifications')).notifications.some(row=>row.kind==='note'));
    const flexible=(await post(prof,'/assessment',{...evaluation,title:'Remise libre',duration:''})).id;
    const untimed=await post(b,'/assessment/start',{id:flexible});
    assert.equal(untimed.deadline,untimed.assessment.closes_at);
    await post(admin,'/accounts/edit',{id:bilal.id,revision:1,name:'Bilal de test',classIds:[primary]});
    await get(b,'/session?session='+chapter,404);
    assert.deepEqual((await page(b,'cours')).courses,[]);
    assert.equal((await get(prof,'/chapter/progress?chapter='+chapter)).roster.length,1);
  } finally {
    await pool.end();
    await bootstrap.query('DROP DATABASE `'+name+'`');
    await bootstrap.end();
  }
});
