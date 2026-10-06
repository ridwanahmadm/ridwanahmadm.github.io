// Shared schema helpers. Imported and edited values are always rendered as text.
export const clone = value => structuredClone(value);
export const el = (tag, cls = '', text) => { const node = document.createElement(tag); node.className = cls; if (text !== undefined) node.textContent = text; return node; };
export function safeURL(value, media = false) {
  if (typeof value !== 'string' || !value.trim()) return '';
  if (/^(javascript|data|blob|file|vbscript):/i.test(value.trim())) return '';
  if (!media && value.startsWith('#')) return value;
  try { const u = new URL(value, new URL('../../', import.meta.url)); return ['https:', 'http:'].includes(u.protocol) || (!media && ['mailto:', 'tel:'].includes(u.protocol)) ? u.href : ''; } catch { return ''; }
}
export function validate(data) {
  const errors = [];
  if (!data || data.schemaVersion !== 2) return ['Expected content schema version 2.'];
  const required = ['seo','brand','hero','about','marquee','stats','work','works','footer','ui'];
  for (const key of required) if (!data[key] || typeof data[key] !== 'object' || Array.isArray(data[key])) errors.push(`Missing section: ${key}.`);
  if (!Array.isArray(data.projects) || !Array.isArray(data.navigation)) errors.push('Projects and navigation must be lists.');
  if (errors.length) return errors;
  const text = (v,path) => { if(typeof v !== 'string' || !v.trim()) errors.push(`${path} is required.`); };
  ['title','description','worksTitle'].forEach(k=>text(data.seo[k],`SEO ${k}`));
  for(const key of ['hero','about','work','works']) text(data[key].headline,`${key} headline`);
  text(data.brand.name,'Brand name');text(data.footer.heading,'Footer heading');
  for(const key of ['hero','about','marquee','stats','work','footer']) if(typeof data[key].enabled!=='boolean')errors.push(`${key} visibility must be true or false.`);
  if(!Number.isInteger(data.work.featuredLimit)||data.work.featuredLimit<0)errors.push('Featured limit must be a non-negative whole number.');
  for(const [key,list] of [['about experience',data.about.experience],['marquee items',data.marquee.items],['stats items',data.stats.items]]) if(!Array.isArray(list))errors.push(`${key} must be a list.`);
  if(data.stats.mockups!==undefined&&!Array.isArray(data.stats.mockups))errors.push('Experience mockups must be a list.');
  if(data.about.learning!==undefined&&(!data.about.learning||typeof data.about.learning!=='object'||Array.isArray(data.about.learning)))errors.push('Learning content must be an object.');
  if(errors.length)return errors;
  const slugs=new Set();
  data.projects.forEach((p,i)=>{
    text(p.title,`Project ${i+1} title`);text(p.summary,`Project ${i+1} summary`);
    if(typeof p.slug!=='string'||!(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(p.slug)||slugs.has(p.slug))errors.push(`Project ${i+1} needs a unique lowercase slug.`);slugs.add(p.slug);
    if(typeof p.published!=='boolean'||!Number.isFinite(p.order))errors.push(`Project ${i+1}: invalid publication/order.`);
    for(const key of ['tags','gallery','body','links'])if(!Array.isArray(p[key]))errors.push(`Project ${i+1} ${key} must be a list.`);
    if(!p.cover?.src)errors.push(`Project ${i+1} cover image is required.`);
  });
  function walk(value,path='content'){
    if(Array.isArray(value)){value.forEach((v,i)=>walk(v,`${path}[${i+1}]`));return;}
    if(!value||typeof value!=='object')return;
    for(const [key,v]of Object.entries(value)){
      if(['__proto__','constructor','prototype'].includes(key))errors.push('Unsafe content key.');
      if(['src','href','ctaLink'].includes(key)&&v && !safeURL(v,key==='src'))errors.push(`${path}.${key}: invalid URL.`);
      walk(v,`${path}.${key}`);
    }
    if('src'in value&&value.src){text(value.alt,`${path} alt text`);if(!['image','video'].includes(value.type))errors.push(`${path}: invalid media type.`);}
  }
  walk(data);
  data.stats.items?.forEach((s,i)=>{if(!Number.isFinite(s.value)||s.value<0)errors.push(`Stat ${i+1}: invalid value.`);text(s.label,`Stat ${i+1} label`);});
  if(data.footer.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.footer.email))errors.push('Invalid contact email.');
  return errors;
}
const DB='ridwan-content-studio-v2';
export async function storage(action,value){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('drafts');request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{const db=request.result,tx=db.transaction('drafts',action==='get'?'readonly':'readwrite'),store=tx.objectStore('drafts');const op=action==='get'?store.get('current'):action==='delete'?store.delete('current'):store.put(value,'current');let result;op.onsuccess=()=>result=op.result;tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};};
  });
}
export async function hashContent(text){const bytes=new TextEncoder().encode(text);const header=new TextEncoder().encode(`blob ${bytes.length}\0`);const input=new Uint8Array(header.length+bytes.length);input.set(header);input.set(bytes,header.length);return [...new Uint8Array(await crypto.subtle.digest('SHA-1',input))].map(v=>v.toString(16).padStart(2,'0')).join('');}
