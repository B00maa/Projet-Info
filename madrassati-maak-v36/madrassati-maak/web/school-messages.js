'use strict';

function schMessagesPage() {
  const data=schoolUI.data;
  const id=data.account.id;
  const contacts=data.contacts||[];
  const threads=new Map();
  for(const message of data.messages||[]) {
    const outgoing=message.sender_id===id;
    const peer=outgoing?message.recipient_id:message.sender_id;
    if(!threads.has(peer))threads.set(peer,{id:peer,name:outgoing?message.recipient_name:message.sender_name,messages:[],unread:0});
    const thread=threads.get(peer);
    thread.messages.push(message);
    if(!outgoing&&!message.read_at)thread.unread++;
  }
  const peer=schoolUI.peer||threads.keys().next().value||'';
  const thread=threads.get(peer);
  const contact=contacts.find(row=>row.id===peer);
  return `<div class="school-title"><h1>Messagerie</h1></div><div class="school-message-layout">
    <section class="card school-stack"><div><label for="schoolMessageContact">Destinataire</label>
      <select id="schoolMessageContact">${schOpt('','Choisir un contact',peer)}
        ${contacts.map(row=>schOpt(row.id,row.name+' · '+tr(SCHOOL_ROLE_NAMES[row.role]),peer)).join('')}
        ${thread&&!contact?schOpt(thread.id,thread.name,peer):''}</select></div>
      <h2>Conversations</h2>${threads.size?`<ul class="school-thread-list">${[...threads.values()].map(row=>
      `<li><button type="button" class="btn ${row.id===peer?'primary':'secondary'}" data-school-action="message-peer"
        data-id="${row.id}" aria-pressed="${row.id===peer}">${schValue(row.name)}${row.unread?
        `<span class="school-nav-count" data-no-i18n="true">${row.unread}</span>`:''}</button></li>`).join('')}</ul>`:
        schEmpty('Aucune conversation.')}</section>
    <section class="card school-stack">
      ${peer?`<div class="school-session-top"><h2>${schValue(contact?.name||thread?.name)}</h2>
        ${thread?.unread?`<button type="button" class="btn secondary small" data-school-action="messages-read"
          data-id="${peer}">Marquer comme lu</button>`:''}</div>
        ${thread?`<ol class="school-messages">${[...thread.messages].reverse().map(message=>{
          const outgoing=message.sender_id===id;
          return `<li class="${outgoing?'outgoing':'incoming'}"><p class="school-text" data-no-i18n="true" dir="auto">${schEsc(message.body)}</p>
            <small class="school-muted">${schValue(schTimestamp(message.created_at))}${outgoing&&message.read_at?' · <span>Lu</span>':''}</small></li>`;
        }).join('')}</ol>`:schEmpty('Aucun message dans cette conversation.')}
        ${contact?`<form class="form school-block" data-school-form="message" data-id="${peer}">
          <div><label for="schoolMessageBody">Message</label><textarea id="schoolMessageBody" name="body" dir="auto" maxlength="3000" required></textarea></div>
          ${schError()}<div><button type="submit" class="btn primary">Envoyer le message</button></div></form>`:
          schEmpty('Ce contact ne fait plus partie de ton espace.')}`:schEmpty('Choisis un contact pour écrire un message.')}</section></div>`;
}

function schAnnouncementsPage() {
  const data=schoolUI.data;
  const admin=data.account.role==='administration';
  const notices=data.announcements||[];
  return `<div class="school-title"><h1>Annonces</h1>${admin?
    '<button type="button" class="btn primary" data-school-action="new-announcement">Nouvelle annonce</button>':''}</div>
    <div class="school-stack">${notices.length?notices.map(item=>`<article class="card school-stack">
      <div class="school-session-top"><div><h2>${schValue(item.title)}</h2>
        <div class="school-meta">${item.class_name?schValue(item.class_name):'<span>Toute l’école</span>'} ·
          ${schValue(schTimestamp(item.created_at))}</div></div>
        ${admin&&item.require_receipt?`<span class="tag mint">${schValue(item.confirmations)} <span>Confirmations</span></span>`:''}
        ${item.read_at?'<span class="tag mint">Lecture confirmée</span>':''}</div>
      <p class="school-text" data-no-i18n="true" dir="auto">${schEsc(item.body)}</p>
      ${item.require_receipt&&!item.read_at&&item.author_id!==data.account.id?
        `<div><button class="btn secondary" type="button" data-school-action="announcement-read"
          data-id="${item.id}">Confirmer la lecture</button></div>`:''}</article>`).join(''):
      `<section class="card">${schEmpty('Aucune annonce publiée.')}</section>`}</div>`;
}

function schAnnouncementEditor() {
  const classes=schoolUI.data.directory.classes;
  schShowDialog('Nouvelle annonce',`<form class="form" data-school-form="announcement">
    <div><label for="schoolAnnouncementTitle">Titre</label><input id="schoolAnnouncementTitle" name="title" maxlength="120" required></div>
    <div><label for="schoolAnnouncementClass">Destinataires</label><select id="schoolAnnouncementClass" name="classId">
      ${schOpt('','Toute l’école')}${classes.map(row=>schOpt(row.id,row.name)).join('')}</select></div>
    <div><label for="schoolAnnouncementBody">Message</label><textarea id="schoolAnnouncementBody" name="body" dir="auto"
      maxlength="4000" required></textarea></div>
    <label class="school-inline-check"><input type="checkbox" name="requireReceipt" value="1"> Demander une confirmation de lecture</label>
    ${schError()}<div><button class="btn primary" type="submit">Publier l’annonce</button></div></form>`);
}

function schCommunicationSubmit(form,button) {
  const kind=form.dataset.schoolForm;
  if(!['message','announcement'].includes(kind))return false;
  const data=Object.fromEntries(new FormData(form));
  if(kind==='message'){
    schMutation(button,'/messages',{recipient:form.dataset.id,body:data.body},'Le message a été envoyé.');
  } else {
    schMutation(button,'/announcement',{...data,requireReceipt:data.requireReceipt==='1'},'L’annonce a été publiée.',{close:true});
  }
  return true;
}

function schCommunicationAction(button) {
  const {schoolAction:action,id}=button.dataset;
  if(action==='message-peer'){
    schoolUI.peer=id;schRender();
    schNode('schoolMessageContact')?.focus({preventScroll:true});
  } else if(action==='messages-read'){
    schMutation(button,'/messages/read',{peer:id},'La conversation a été marquée comme lue.');
  } else if(action==='new-announcement'){
    schAnnouncementEditor();
  } else if(action==='announcement-read'){
    schMutation(button,'/announcement/read',{id},'La lecture a été confirmée.');
  } else return false;
  return true;
}
