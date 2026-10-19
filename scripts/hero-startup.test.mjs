import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const source=readFileSync('public/homepage-hero-video.js','utf8').replace(/^import Player[^\n]+\n/,'');
function setup(reduced=false){
 const page=JSON.parse(readFileSync('src/content/pages/index.json'));
 const dom=new JSDOM(page.content,{url:'https://giolinafilms.com/',runScripts:'outside-only'});
 const w=dom.window;w.matchMedia=()=>({matches:reduced});w.performance.getEntriesByType=()=>[];
 const handlers={};let players=0;
 w.Player=class{constructor(){players++;}on(name,fn){handlers[name]=fn;}ready(){return Promise.resolve();}setMuted(){return Promise.resolve();}play(){return Promise.reject({name:'NotAllowedError'});}setCurrentTime(){return new Promise(()=>{});}};
 w.eval(source);return {dom,w,handlers,players:()=>players};
}
test('hero requests the approved muted inline video immediately without a poster hold',()=>{
 const {dom,w,players}=setup();const frame=w.document.querySelector('.gl-hero-video iframe');
 assert.equal(players(),1);assert.equal(frame.src,frame.dataset.heroSrc);
 const url=new URL(frame.src);assert.equal(url.pathname,'/video/548643452');
 for(const key of ['autoplay','muted','playsinline'])assert.equal(url.searchParams.get(key),'1');
 assert(!w.document.querySelector('.gl-hero').classList.contains('gl-hero-video-visible'));dom.window.close();
});
test('advancing playback reveals video even when play is rejected and seek has not acknowledged',async()=>{
 const {dom,w,handlers}=setup();await new Promise(resolve=>setImmediate(resolve));
 assert(handlers.timeupdate,'player subscribed immediately');handlers.timeupdate({seconds:5});handlers.timeupdate({seconds:5.25});
 assert(w.document.querySelector('.gl-hero').classList.contains('gl-hero-video-visible'));dom.window.close();
});
test('reduced motion retains the fallback without requesting a video player',()=>{
 const {dom,w,players}=setup(true);assert.equal(players(),0);
 assert.equal(w.document.querySelector('.gl-hero-video iframe').getAttribute('src'),null);dom.window.close();
});

test('a seek jump alone does not hide the fallback',()=>{
 const {dom,w,handlers}=setup();handlers.timeupdate({seconds:0});handlers.timeupdate({seconds:5});
 assert(!w.document.querySelector('.gl-hero').classList.contains('gl-hero-video-visible'));
 handlers.timeupdate({seconds:5.25});assert(w.document.querySelector('.gl-hero').classList.contains('gl-hero-video-visible'));dom.window.close();
});
