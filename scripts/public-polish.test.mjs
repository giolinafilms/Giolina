import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

test('short normal finger swipes browse films without opening playback; vertical drags stay vertical',()=>{
 const html=JSON.parse(readFileSync('src/content/pages/portfolio-2.json','utf8')).content;
 const dom=new JSDOM(html,{runScripts:'outside-only'}),w=dom.window;
 w.eval(readFileSync('public/love-minute.js','utf8'));
 const stage=w.document.querySelector('[data-short-stage]'),picker=w.document.querySelector('.gl-short-picker');
 const send=(type,x,y)=>{
  const e=new w.Event(type,{bubbles:true,cancelable:true});
  Object.defineProperties(e,{pointerType:{value:'touch'},pointerId:{value:1},isPrimary:{value:true},clientX:{value:x},clientY:{value:y}});
  stage.dispatchEvent(e);
 };
 send('pointerdown',200,100);send('pointermove',173,105);send('pointerup',173,105);
 assert.equal(picker.value,'1','27px normal swipe selects Together');
 stage.click();assert.equal(w.document.querySelectorAll('video,iframe').length,0,'swipe release cannot accidentally play');
 send('pointerdown',173,100);send('pointermove',200,104);send('pointerup',200,104);
 assert.equal(picker.value,'0','right swipe goes back');
 send('pointerdown',200,100);send('pointermove',204,120);send('pointermove',170,155);send('pointerup',170,155);
 assert.equal(picker.value,'0','vertical intent never browses films');
 send('pointerdown',200,100);send('pointermove',173,102);send('pointercancel',173,102);
 assert.equal(picker.value,'0','cancelled page gesture does not select a film');
 assert.equal(stage.querySelector('img').style.transform,'','gesture feedback resets');
 dom.window.close();
});

test('mobile contact bar hides during form editing and restores afterward',async()=>{
 const dom=new JSDOM('<nav class="gl-mobile-cta"></nav><input aria-label="Name"><button>Done</button>',{runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.eval(readFileSync('public/mobile-cta.js','utf8'));
 const bar=w.document.querySelector('nav');w.document.querySelector('input').focus();assert.equal(bar.hidden,true);
 w.document.querySelector('button').focus();assert.equal(bar.hidden,false);
 const dialog=w.document.createElement('dialog');w.document.body.append(dialog);dialog.setAttribute('open','');
 await Promise.resolve();assert.equal(bar.hidden,true);dialog.removeAttribute('open');await Promise.resolve();assert.equal(bar.hidden,false);
 dom.window.close();
});
