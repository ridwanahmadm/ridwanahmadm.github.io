// Personal static CMS. No client-side password pretending to protect repository writes.
// GitHub credentials only live in this module's memory, never in backups or browser storage.
import {el,clone,safeURL,validate,storage,hashContent} from './content.js';
const $=s=>document.querySelector(s);
let bundle,seed,active='hero',revision=0,previewRevision=-1,unsaved=false,timer,connection=null,projectDraft=null,projectIndex=null,editorDirty=false,busy=false;
const mediaURLs=[];
const tabs=['hero','about','experience','marquee','stats','work','projects','works','footer','navigation','brand','seo','ui'];
const names={hero:'Hero',about:'About',experience:'Work experience',marquee:'Marquee',stats:'Experience & mockups',work:'Featured work',projects:'Projects',works:'Works page',footer:'Contact & footer',navigation:'Navigation',brand:'Brand',seo:'SEO',ui:'Interface labels'};
const templates={experience:{company:'',role:'',detail:''},items:{value:0,prefix:'',suffix:'',label:''},mockups:{src:'',alt:'',type:'image'},gallery:{src:'',alt:'',type:'image'},body:{heading:'',text:'',image:{src:'',alt:'',type:'image'}},links:{label:'',href:''},navigation:{label:'',href:''}};
function say(text){$('#cms-status').textContent=text;}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function saveDraft(){clearTimeout(timer);try{await storage('set',clone(bundle));unsaved=false;$('#draft-state').textContent='Draft saved on this device';return true;}catch{unsaved=true;$('#draft-state').textContent='Draft not saved';say('Browser storage is unavailable or full. Export a backup before leaving.');return false;}}
function changed(){revision++;previewRevision=-1;unsaved=true;$('#draft-state').textContent='Saving draft…';$('#publish').disabled=true;timer=setTimeout(saveDraft,250);}
function valueAt(object,path){return path.reduce((v,k)=>v[k],object);}
function assign(object,path,value){const parent=valueAt(object,path.slice(0,-1));parent[path.at(-1)]=value;}
function labelName(key){return key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());}
function button(text,fn,cls='btn secondary'){const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;}
function fieldTree(object,rootPath,container,onChange=changed){
  const value=valueAt(object,rootPath);
  if(value&&typeof value==='object'&&!Array.isArray(value)&&'src'in value){mediaField(object,rootPath,container,onChange);return;}
  for(const [key,item]of Object.entries(value)){
    if(object===bundle.content && active==='about' && key==='experience')continue;
    if(object===projectDraft && rootPath.length===0 && ['image','subtitle'].includes(key))continue;
    const path=[...rootPath,key];
    if(Array.isArray(item)){
      const group=el('fieldset','editor-list');group.append(el('legend','',labelName(key)));
      item.forEach((entry,i)=>{const row=el('div','editor-item');const top=el('div','cms-top');top.append(el('span','eyebrow',`${labelName(key)} ${i+1}`),button('Remove',()=>{if(confirm(`Remove this ${labelName(key).toLowerCase()} item?`)){item.splice(i,1);onChange();rerender();}},'delete'));row.append(top);
        if(entry&&typeof entry==='object')fieldTree(object,[...path,i],row,onChange);else scalar(object,[...path,i],row,`${labelName(key)} ${i+1}`,onChange);
        group.append(row);
      });
      group.append(button('Add item',()=>{let entry;if(key==='items'&&rootPath.includes('marquee')||key==='tags')entry='';else entry=clone(templates[key]||item[0]||'');item.push(entry);onChange();rerender();}));container.append(group);
    }else if(item&&typeof item==='object'){const group=el('fieldset','editor-list');group.append(el('legend','',labelName(key)));fieldTree(object,path,group,onChange);container.append(group);}
    else scalar(object,path,container,labelName(key),onChange);
  }
  function rerender(){if(object===projectDraft)renderProjectForm();else renderEditor();}
}
function scalar(object,path,container,label,onChange){const value=valueAt(object,path);const wrapper=el('label','',label);const multiline=/headline|text|description|summary|subtitle|impact|note/i.test(path.at(-1));const input=el(multiline?'textarea':'input');input.dataset.path=path.join('.');
  if(typeof value==='boolean'){input.type='checkbox';input.checked=value;input.className='check-input';}
  else{if(input.tagName==='INPUT')input.type=typeof value==='number'?'number':'text';if(typeof value==='number'){input.step='any';}input.value=value??'';if(multiline)input.rows=3;}
  input.oninput=()=>{assign(object,path,typeof value==='boolean'?input.checked:typeof value==='number'?Number(input.value):input.value);onChange();};wrapper.append(input);container.append(wrapper);}
function mediaPreview(m){
  if(!m.src)return el('p','cms-note','No media selected.');let src=safeURL(m.src,true);if(bundle.assets[m.src]){const asset=bundle.assets[m.src];src=URL.createObjectURL(new Blob([Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0))],{type:asset.type}));mediaURLs.push(src);}const node=el(m.type==='video'?'video':'img','media-preview');node.src=src;if(m.type==='video')node.controls=true;else node.alt=m.alt;return node;
}
async function upload(file){
  if(!file)throw Error('Choose a file.');if(file.size>15*1024*1024)throw Error('Choose a file smaller than 15 MB.');
  let blob,ext;
  if(/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type)){
    const bitmap=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob)throw Error('Image could not be compressed.');ext='webp';
  }else if(['video/mp4','video/webm'].includes(file.type)){if(file.size>8*1024*1024)throw Error('Looping videos must be smaller than 8 MB.');blob=file;ext=file.type==='video/mp4'?'mp4':'webm';}
  else throw Error('Upload PNG, JPG, WebP, GIF, AVIF, MP4, or WebM. SVG uploads are not accepted.');
  const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
  const path=`assets/img/uploads/${crypto.randomUUID()}.${ext}`;bundle.assets[path]={base64,type:blob.type};return {src:path,type:ext==='webp'?'image':'video'};
}
function mediaField(object,path,container,onChange){
  const m=valueAt(object,path);const box=el('div','media-field');box.append(mediaPreview(m));
  for(const key of ['src','alt'])scalar(object,[...path,key],box,key==='src'?'Media path or URL':'Alt text (required for media)',onChange);
  const type=el('label','','Media type');const select=el('select');['image','video'].forEach(t=>{const o=el('option','',t);o.value=t;select.append(o);});select.value=m.type;select.onchange=()=>{m.type=select.value;onChange();};type.append(select);box.append(type);
  const fileLabel=el('label','file-button btn secondary','Upload / replace');const file=el('input');file.type='file';file.accept='image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm';file.onchange=async()=>{try{const previous=m.src;Object.assign(m,await upload(file.files[0]));if(previous.startsWith('assets/img/uploads/'))bundle.deletions.push(previous);onChange();if(object===projectDraft)renderProjectForm();else renderEditor();say('Media added to draft. Enter descriptive alt text before previewing.');}catch(e){say(e.message);}};fileLabel.append(file);box.append(fileLabel,button('Remove media',()=>{if(!m.src||!confirm('Remove this media?'))return;if(m.src.startsWith('assets/img/uploads/'))bundle.deletions.push(m.src);m.src='';m.alt='';onChange();if(object===projectDraft)renderProjectForm();else renderEditor();}));container.append(box);
}
function renderEditor(){
  mediaURLs.splice(0).forEach(URL.revokeObjectURL);const area=$('#section-editor');area.replaceChildren(el('h2','',names[active]));$('#editor-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===active?'page':'false'));
  if(active==='projects'){area.append(button('Add project',()=>editProject(null),'btn'));const list=el('div','cms-projects');const projects=bundle.content.projects;
    projects.forEach((p,i)=>{const row=el('div','cms-project');const title=button(String(i+1).padStart(2,'0')+' / '+p.title,()=>editProject(i),'project-edit');title.append(el('small','',p.published?'Published':'Unpublished'));row.append(title,button('Edit',()=>editProject(i)),button(p.published?'Unpublish':'Publish',()=>{p.published=!p.published;changed();renderEditor();}),button('Move up',()=>move(i,-1)),button('Move down',()=>move(i,1)),button('Delete',()=>{if(confirm(`Delete “${p.title}”?`)){projects.splice(i,1);reorder();changed();renderEditor();}},'delete'));row.querySelectorAll('button')[3].disabled=i===0;row.querySelectorAll('button')[4].disabled=i===projects.length-1;list.append(row);});area.append(list);return;
  }
  if(active==='experience'){area.append(el('p','cms-note','Add, edit, or remove roles, including HSI — Shortener. Changes appear in the About section.'));fieldTree({experience:bundle.content.about.experience},[],area);}
  else if(active==='navigation'){fieldTree({navigation:bundle.content.navigation},[],area);}
  else fieldTree(bundle.content,[active],area);
}
function reorder(){bundle.content.projects.forEach((p,i)=>p.order=i);}
function move(i,delta){const list=bundle.content.projects;[list[i],list[i+delta]]=[list[i+delta],list[i]];reorder();changed();renderEditor();}
function editProject(index){projectIndex=index;projectDraft=index===null?{title:'',slug:'',subtitle:'',summary:'',category:'',image:'',description:'',impact:'',role:'Product design',tags:[],cover:{src:'',alt:'',type:'image'},gallery:[],body:[],links:[],order:bundle.content.projects.length,published:false}:clone(bundle.content.projects[index]);editorDirty=false;$('#editor-title').textContent=index===null?'New project':'Edit project';renderProjectForm();$('#edit-dialog').showModal();}
function renderProjectForm(){$('#project-fields').replaceChildren();fieldTree(projectDraft,[],$('#project-fields'),()=>{editorDirty=true;});}
$('#project-form').onsubmit=e=>{e.preventDefault();projectDraft.subtitle=projectDraft.summary;projectDraft.image=projectDraft.cover.src;const candidate=clone(bundle.content);if(projectIndex===null)candidate.projects.push(projectDraft);else candidate.projects[projectIndex]=projectDraft;const errors=validate(candidate);if(errors.length){say(errors.slice(0,6).join(' '));alert(errors.slice(0,6).join('\n'));return;}bundle.content=candidate;reorder();editorDirty=false;$('#edit-dialog').close();changed();renderEditor();say('Project saved to draft.');};
function cancelProject(){if(editorDirty&&!confirm('Discard unsaved project changes?'))return;editorDirty=false;$('#edit-dialog').close();}
$('#cancel-edit').onclick=cancelProject;$('#edit-dialog').addEventListener('cancel',e=>{e.preventDefault();cancelProject();});
$('#preview').onclick=async()=>{const errors=validate(bundle.content);if(errors.length){say(errors.slice(0,8).join(' '));return;}const win=window.open('about:blank','portfolio-draft');if(!await saveDraft()){win?.close();return;}if(win){win.location.href='../index.html?preview=1';previewRevision=revision;$('#publish').disabled=!connection;say('Draft preview opened. Review it before publishing.');}else say('Allow this preview tab to open, then try again.');};
$('#export').onclick=()=>{download(JSON.stringify(bundle,null,2)+'\n','portfolio-backup.json');say('Backup exported, including uploaded media.');};
$('#import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>40*1024*1024)throw Error('Backup exceeds 40 MB.');const imported=JSON.parse(await file.text());const next=imported.content?imported:{content:imported,assets:{},deletions:[]};const errors=validate(next.content);if(errors.length)throw Error(errors.slice(0,6).join(' '));for(const [path,a]of Object.entries(next.assets||{})){if(!/^assets\/img\/uploads\/[a-zA-Z0-9.-]+$/.test(path)||!['image/webp','video/mp4','video/webm'].includes(a.type)||!/^[A-Za-z0-9+/]*={0,2}$/.test(a.base64))throw Error('Invalid uploaded media in backup.');}if(!confirm('Replace the local draft with this backup?'))return;bundle={content:next.content,assets:next.assets||{},deletions:next.deletions||[],baseSha:bundle.baseSha};reorder();changed();renderEditor();await saveDraft();say('Backup imported. Preview before publishing.');}catch(e){say('Import failed: '+e.message);}finally{$('#import').value='';}};
$('#discard').onclick=async()=>{if(!confirm('Discard the local draft and reload the site content?'))return;bundle=clone(seed);changed();renderEditor();await saveDraft();say('Draft reset to site content.');};
async function api(path,method='GET',body){if(!connection)throw Error('Connect a repository first.');const response=await fetch(`https://api.github.com/repos/${encodeURIComponent(connection.owner)}/${encodeURIComponent(connection.repository)}/${path}`,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+connection.token,'X-GitHub-Api-Version':'2026-03-10',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(!response.ok)throw Error(`GitHub ${response.status}: ${response.status===401?'check your token':response.status===403?'check Contents permissions':response.status===404?'check owner, repository, branch, and initial site upload':response.status===422?'branch changed or is protected; reconnect and try again':'request failed'}.`);return response.json();}
const branchPath=()=>encodeURIComponent(connection.branch);
async function remoteFile(){return api(`contents/data/projects.json?ref=${branchPath()}`);}
$('#connect-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget;const proposed={owner:f.elements.owner.value.trim(),repository:f.elements.repository.value.trim(),branch:f.elements.branch.value.trim(),token:f.elements.token.value.trim()};f.elements.token.value='';connection=proposed;try{if(!/^[\w.-]+$/.test(proposed.owner)||!/^[\w.-]+$/.test(proposed.repository))throw Error('Enter valid GitHub owner/repository names.');await api(`git/ref/heads/${branchPath()}`);const remote=await remoteFile();$('#connection-status').textContent=`Connected to ${proposed.owner}/${proposed.repository} · ${proposed.branch}. ${remote.sha===bundle.baseSha?'Content matches this draft’s base.':'Repository content differs. Load repository content or export your draft before resolving.'}`;$('#load-remote').disabled=false;$('#publish').disabled=previewRevision!==revision||remote.sha!==bundle.baseSha;}catch(err){connection=null;$('#connection-status').textContent=err.message;$('#publish').disabled=true;}};
$('#disconnect').onclick=()=>{connection=null;$('#connect-form').elements.token.value='';$('#publish').disabled=true;$('#load-remote').disabled=true;$('#connection-status').textContent='Disconnected. Token cleared.';};
$('#load-remote').onclick=async()=>{if(!confirm('Replace your draft with repository content? Export a backup first if needed.'))return;try{const remote=await remoteFile();const bytes=Uint8Array.from(atob(remote.content.replace(/\s/g,'')),c=>c.charCodeAt(0));const content=JSON.parse(new TextDecoder().decode(bytes));const errors=validate(content);if(errors.length)throw Error(errors[0]);bundle={content,assets:{},deletions:[],baseSha:remote.sha};reorder();changed();renderEditor();await saveDraft();say('Repository content loaded.');}catch(e){say(e.message);}};
$('#publish').onclick=async()=>{
  if(busy)return;const errors=validate(bundle.content);if(errors.length){say(errors[0]);return;}if(previewRevision!==revision){say('Preview the latest draft before publishing.');return;}if(!connection){say('Connect a repository first.');return;}if(!confirm(`Publish this reviewed draft to ${connection.owner}/${connection.repository} (${connection.branch})?`))return;
  busy=true;$('#publish').disabled=true;$('#cms-content').inert=true;
  try{
    const remote=await remoteFile();if(remote.sha!==bundle.baseSha)throw Error('Repository content changed. Export your draft, load current repository content, and reconcile before publishing.');
    const ref=await api(`git/ref/heads/${branchPath()}`);const head=await api(`git/commits/${ref.object.sha}`);const tree=[{path:'data/projects.json',mode:'100644',type:'blob',content:JSON.stringify(bundle.content,null,2)+'\n'}];
    const used=new Set();(function scan(v){if(v&&typeof v==='object'){if(typeof v.src==='string')used.add(v.src);Object.values(v).forEach(scan);}})(bundle.content);
    for(const [path,asset]of Object.entries(bundle.assets)){if(!used.has(path))continue;const blob=await api('git/blobs','POST',{content:asset.base64,encoding:'base64'});tree.push({path,mode:'100644',type:'blob',sha:blob.sha});}
    const deletions=[...new Set(bundle.deletions)].filter(path=>/^assets\/img\/uploads\/[a-zA-Z0-9.-]+$/.test(path)&&!used.has(path));
    if(deletions.length){const existing=await api(`git/trees/${head.tree.sha}?recursive=1`);if(existing.truncated)throw Error('Repository tree is too large to safely delete assets.');for(const path of deletions)if(existing.tree.some(e=>e.path===path))tree.push({path,mode:'100644',type:'blob',sha:null});}
    const next=await api('git/trees','POST',{base_tree:head.tree.sha,tree});const commit=await api('git/commits','POST',{message:$('#commit-message').value.trim()||'Update portfolio content',tree:next.sha,parents:[ref.object.sha]});
    await api(`git/refs/heads/${branchPath()}`,'PATCH',{sha:commit.sha,force:false});
    bundle.baseSha=await hashContent(JSON.stringify(bundle.content,null,2)+'\n');bundle.assets={};bundle.deletions=[];await saveDraft();seed=clone(bundle);
    $('#publish-result').replaceChildren(el('span','','Content committed. GitHub Pages will update after deployment. '));const a=el('a','text-link','View commit');a.href=`https://github.com/${encodeURIComponent(connection.owner)}/${encodeURIComponent(connection.repository)}/commit/${commit.sha}`;a.target='_blank';a.rel='noopener';$('#publish-result').append(a);say('Published content successfully.');
  }catch(e){$('#publish-result').textContent=e.message;}finally{busy=false;$('#cms-content').inert=false;$('#publish').disabled=!connection||previewRevision!==revision;}
};
addEventListener('beforeunload',e=>{if(unsaved||editorDirty||busy){e.preventDefault();e.returnValue='';}});
async function start(){try{const response=await fetch('../data/projects.json');if(!response.ok)throw Error('Content file unavailable.');const text=await response.text();const content=JSON.parse(text);const errors=validate(content);if(errors.length)throw Error(errors[0]);seed={content,assets:{},deletions:[],baseSha:await hashContent(text)};let draft;try{draft=await storage('get');}catch{}bundle=draft&&validate(draft.content).length===0?draft:clone(seed);bundle.assets??={};bundle.deletions??=[];reorder();tabs.forEach(tab=>{const b=button(names[tab],()=>{active=tab;renderEditor();});b.dataset.tab=tab;$('#editor-tabs').append(b);});$('#cms-content').hidden=false;document.querySelector('.wordmark').textContent=bundle.content.brand.name;const olderDraft=draft&&draft.baseSha!==seed.baseSha;$('#draft-state').textContent=olderDraft?'Older local draft restored':draft?'Local draft restored':'Site content loaded';$('#discard').textContent='Reset to latest site content';renderEditor();say(olderDraft?'This saved draft is based on an older version of the site. Export a backup to keep your edits, then choose Reset to latest site content to load the Figma revision.':'Choose a section to edit.');}catch(e){say(e.message+' Run this site through an HTTP server.');}}start();
