'use strict';

function schoolScrollSnapshot() {
  return {x:window.scrollX,y:window.scrollY,sidebar:document.querySelector('.sidebar')?.scrollTop||0,
    role:document.body.dataset.space||''};
}

function restoreSchoolScroll(position,{page=true,sidebar=true}={}) {
  const menu=document.querySelector('.sidebar');
  if(sidebar&&menu&&position.role===(document.body.dataset.space||'')) menu.scrollTop=position.sidebar;
  if(page&&(window.scrollX!==position.x||window.scrollY!==position.y)) {
    window.scrollTo({left:position.x,top:position.y,behavior:'instant'});
  }
}
