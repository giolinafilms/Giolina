import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
test('Love in a Minute distinguishes horizontal swipe, vertical scroll and tap; only tap starts audible media',()=>{
 const dom=new JSDOM(`<section data-short-browser><button data-short-stage><img><span>Play Film</span></button><span data-short-count></span><select><option value="0">One</option><option value="1">Two</option></select><button data-short-prev></button><button data-short-next></button></section><script id="gl-short-data" type="application/json">[{"title":"One","poster":"/one.jpg","width":1080,"height":1920,"src":"/one.mp4"},{"title":"Two","poster":"/two.jpg","width":1920,"height":1080,"vimeo":"123"}]</script>`,{url:'https://preview.example.test',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};let plays=0;
 w.HTMLMediaElement.prototype.play=function(){assert(w.document.querySelector('dialog').open);assert.equal(this.muted,false);assert.equal(this.volume,1);plays++;return Promise.resolve();};w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};
 w.eval(readFileSync(new URL('../../public/love-minute.js',import.meta.url),'utf8'));const stage=w.document.querySelector('[data-short-stage]');let time=1000;w.Date.now=()=>time;
 function pointer(type,x,y){const e=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:1,pointerType:'touch',isPrimary:true,clientX:x,clientY:y});stage.dispatchEvent(e);}
 assert.equal(w.document.querySelectorAll('video,iframe').length,0);pointer('pointerdown',250,80);pointer('pointermove',150,85);pointer('pointerup',150,85);stage.click();assert.equal(w.document.querySelector('select').value,'1');assert.equal(w.document.querySelectorAll('video,iframe').length,0);
 pointer('pointerdown',100,80);pointer('pointerup',180,250);assert.equal(w.document.querySelector('select').value,'1');time+=600;stage.click();assert.equal(w.document.querySelectorAll('iframe').length,1);assert(w.document.querySelector('iframe').src.includes('muted=0'));w.document.querySelector('.gl-film-close').click();assert.equal(w.document.querySelectorAll('video,iframe').length,0);
 w.document.querySelector('[data-short-prev]').click();stage.click();assert.equal(plays,1);w.document.querySelector('.gl-film-close').click();assert.equal(w.document.querySelectorAll('video,iframe').length,0);dom.window.close();
});
