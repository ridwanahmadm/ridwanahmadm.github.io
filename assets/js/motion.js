// Native scrolling: sticky project panels, restrained parallax, and accessible fallbacks.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const desktop=matchMedia('(min-width:901px) and (min-height:701px)');
let targets=[],cards=[],frame=0,observer,collageObserver,heroMax=60,travel=28,countDuration=900;
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
function prepareCollages(){
  collageObserver?.disconnect();
  const collages=[...document.querySelectorAll('.experience-collage')];
  collages.forEach(collage=>{
    if(reduced.matches||!('IntersectionObserver'in window)){collage.classList.add('is-open');return;}
    if(collage.classList.contains('is-open'))return;
    const offsets=[[-12,8,-18],[8,-6,12],[0,10,-4]];
    [...collage.children].forEach((image,i)=>{
      const [x,y,angle]=offsets[i%offsets.length];
      // Start all cards near the same center while retaining the final grid layout.
      image.style.setProperty('--stack-x',`${collage.clientWidth/2-image.offsetLeft-image.offsetWidth/2+x}px`);
      image.style.setProperty('--stack-y',`${collage.clientHeight/2-image.offsetTop-image.offsetHeight/2+y}px`);
      image.style.setProperty('--stack-angle',`${angle}deg`);
      image.style.setProperty('--unstack-delay',`${160+i*90}ms`);
    });
    collage.classList.add('stack-ready');
  });
  if(reduced.matches||!('IntersectionObserver'in window))return;
  collageObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      // Two frames ensure the initial pile is painted, even on a direct anchor visit.
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(entry.target.isConnected)entry.target.classList.add('is-open');
      }));
      collageObserver.unobserve(entry.target);
    });
  },{threshold:.3,rootMargin:'0px 0px -40px 0px'});
  collages.filter(c=>!c.classList.contains('is-open')).forEach(c=>collageObserver.observe(c));
}
function count(node){
  if(node.dataset.counted)return;node.dataset.counted='true';
  const value=Number(node.dataset.count);if(!Number.isFinite(value)||reduced.matches)return;
  const duration=countDuration,start=performance.now();
  const format=n=>(node.dataset.prefix||'')+new Intl.NumberFormat('en-US',{maximumFractionDigits:Number.isInteger(value)?0:2}).format(n)+(node.dataset.suffix||'');
  function step(now){const t=clamp((now-start)/duration);node.textContent=format(value*(1-(1-t)**4));if(t<1&&node.isConnected&&!reduced.matches)requestAnimationFrame(step);else node.textContent=format(value);}
  requestAnimationFrame(step);
}
function refreshStack(){
  const grid=document.querySelector('#project-grid');if(!grid)return;
  cards=[...grid.querySelectorAll('.project-card')];
  const enabled=document.body.dataset.page==='home'&&desktop.matches&&!reduced.matches&&cards.length>1;
  grid.classList.toggle('scroll-projects',enabled);
  // Large type, short viewports, or unusually long CMS copy must never be clipped.
  if(enabled&&cards.some(card=>card.offsetHeight>innerHeight-104))grid.classList.remove('scroll-projects');
  cards.forEach(card=>{card.style.removeProperty('--project-out');card.style.visibility='';});
}
function tick(){
  frame=0;if(document.hidden||reduced.matches)return;
  let moving=false;
  targets.forEach(item=>{
    const rect=item.anchor.getBoundingClientRect();
    if(item.hero)item.target=clamp(-rect.top*.15,0,heroMax);
    else if(rect.bottom>=0&&rect.top<=innerHeight){const progress=(innerHeight*.5-(rect.top+rect.height*.5))/innerHeight;item.target=clamp(progress*travel*item.depth,-travel,travel);}
    item.value+=(item.target-item.value)*.14;
    if(Math.abs(item.target-item.value)>.1)moving=true;
    item.node.style.translate='0 '+item.value.toFixed(2)+'px';
  });
  if(document.querySelector('.scroll-projects')){
    cards.forEach((card,i)=>{
      const next=cards[i+1];const out=next?clamp((innerHeight*.85-next.getBoundingClientRect().top)/(innerHeight*.85-120)):0;
      card.style.setProperty('--project-out',out.toFixed(4));
      card.style.visibility=out>=.999?'hidden':'';
    });
  }
  if(moving)frame=requestAnimationFrame(tick);
}
function schedule(){if(!frame&&!reduced.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
function initialize(){
  observer?.disconnect();const css=getComputedStyle(document.documentElement);
  heroMax=parseFloat(css.getPropertyValue('--hero-parallax-max'))||60;travel=parseFloat(css.getPropertyValue('--parallax-distance'))||28;
  countDuration=parseFloat(css.getPropertyValue('--count-duration'))||900;
  const stagger=parseFloat(css.getPropertyValue('--motion-stagger'))||70;
  const candidates=[...document.querySelectorAll('.hero-title,.hero-bottom,.hero-note,.section-label,.about-content,.stats-layout,.section-heading,.project-card,.all-works,.footer-main,.modal-body')];
  observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-visible');if(entry.target.matches('[data-count]'))count(entry.target);observer.unobserve(entry.target);}});
  },{threshold:.08,rootMargin:'0px 0px -24px 0px'}):null;
  candidates.forEach((node,i)=>{node.classList.add('motion-reveal');node.style.setProperty('--reveal-delay',i%3*stagger+'ms');if(reduced.matches||!observer||node.matches('.modal-body'))node.classList.add('motion-visible');else observer.observe(node);});
  document.querySelectorAll('[data-count]').forEach(node=>{if(reduced.matches||!observer)count(node);else observer.observe(node);});
  const previous=new Map(targets.map(t=>[t.node,t.value]));
  targets=[...document.querySelectorAll('.hero-title,.hero-bottom,.hero-media,.section-heading,.project-image img,.experience-mockup')].map(node=>({node,anchor:node.closest('.hero')||node.closest('.project-card')||node.closest('.stats-layout')||node.closest('section'),hero:!!node.closest('.hero'),depth:node.matches('img')?.6:1,value:previous.get(node)||0,target:0}));
  document.querySelectorAll('video').forEach(video=>{if(reduced.matches)video.pause();});
  prepareCollages();refreshStack();schedule();
}
reduced.addEventListener('change',()=>{
  cancelAnimationFrame(frame);frame=0;
  targets.forEach(t=>{t.node.style.removeProperty('translate');t.value=t.target=0;});
  document.querySelectorAll('video').forEach(v=>{if(reduced.matches)v.pause();else if(v.matches('.hero-media'))v.play().catch(()=>{});});
  initialize();
});
document.addEventListener('content-rendered',initialize);
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{prepareCollages();refreshStack();schedule();},{passive:true});
document.fonts?.ready.then(()=>{refreshStack();schedule();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});
