/* ========== Live clock ========== */
function renderClock(){
  const el = document.getElementById('liveClock');
  const now = new Date();
  const d = now.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',year:'numeric'});
  el.textContent = `Today: ${d} | ${now.toLocaleTimeString()}`;
}
setInterval(renderClock, 1000); renderClock();

/* ========== Router ========== */
const app = document.getElementById('app');
const routes = {
  '/': Home,
  '/admissions': Admissions,
  '/placements': Placements,
  '/campus': CampusMap,
  '/knowledge': Knowledge,
  '/staff': Staff,
  '/gallery': Gallery,
  '/feedback': Feedback,
};
function router(){
  const path = location.hash.replace('#','') || '/';
  const View = routes[path] || NotFound;
  app.innerHTML = ''; app.appendChild(View()); window.scrollTo(0,0);
}
window.addEventListener('hashchange', router); router();

/* ========== Helpers ========== */
const card = html => { const d=document.createElement('div'); d.className='card'; d.innerHTML=html; return d; };
const row = (...els) => { const d=document.createElement('div'); d.style.display='flex'; d.style.gap='10px'; d.style.flexWrap='wrap'; els.forEach(e=>d.appendChild(e)); return d; };
function pillBtn(text, onclick){ const a=document.createElement('a'); a.className='pill'; a.href='javascript:void(0)'; a.textContent=text; a.onclick=onclick; return a; }

/* ========== Voice (accurate + concise) ========== */
function micListen(onText){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert('SpeechRecognition not supported'); return; }
  const rec = new SR(); rec.lang='en-IN'; rec.continuous=false; rec.interimResults=false;
  rec.onresult = e => onText(Array.from(e.results).map(r=>r[0].transcript).join(' '));
  rec.start();
}
function speak(text){
  if(!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text); u.lang='en-IN'; u.rate=1.0;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}

/* ========== Accurate facts from official sources ========== */
/* Official HKBK placements page (2023 figures) → 32.4 LPA, 94.3%, 375+ recruiters.
   AIML course page → HoD contact.
   2022–23 batch counts (offers/placed/companies) from Careers360. */
const FACTS = {
  highestPackage: '₹32.4 LPA',
  placementRate: 94.3,
  recruiters: '375+',
  offers2023: 1100,      // 2022–23 (Careers360)
  placed2023: 618,       // 2022–23
  companies2023: 242,    // 2022–23
  hod: { name:'Dr. Tabassum Ara', role:'Professor & HoD, AI-ML', email:'hod.aiml@hkbk.edu.in' }
};

/* short, human-first answers that read facts aloud */
function answer(q){
  const s=q.toLowerCase();
  if(/admission|apply|eligib|quota|fees|scholar/i.test(s)){
    const txt = 'Admissions for AI and ML consider CET, COMEDK, and Management quota. Scholarships and education-loan guidance are available. Want the step-by-step apply flow?';
    speak(txt); return txt;
  }
  if(/placement|package|salary|recruit|job/i.test(s)){
    const txt = `Placements are strong — ${FACTS.placementRate}% in 2023 with highest package ${FACTS.highestPackage}. In 2022–23: about ${FACTS.offers2023} offers, ${FACTS.placed2023} students placed, and ${FACTS.companies2023} companies visited.`;
    speak(txt); return txt;
  }
  if(/hod|head|professor|faculty|staff/i.test(s)){
    const txt = `AI-ML HoD is ${FACTS.hod.name}. You can reach her at ${FACTS.hod.email}. Want me to open the Staff page?`;
    speak(txt); return txt;
  }
  if(/map|campus|where|library|canteen|hostel|office/i.test(s)){
    const txt = 'Use the Campus Map page for quick directions to the Admissions Office, HoD AI-ML cabin, Library, Canteen, Prayer Room, Sports, Accounts, and Hostels.';
    speak(txt); return txt;
  }
  const txt = `Great question! Our AI-ML department features modern labs and a vibrant campus life with ${FACTS.placementRate}% placements and a highest package of ${FACTS.highestPackage}.`;
  speak(txt); return txt;
}

/* ========== Pages ========== */
function Home(){
  const wrap = document.createElement('div'); wrap.className='grid grid-2';

  const chat = card(`
    <h1>Chat with HK-Counselor</h1>
    <p class="tiny">Human-first voice. Short, accurate answers.</p>
    <div id="chatStream"></div>
  `);
  const stream = chat.querySelector('#chatStream');

  push('ai', 'Hello! I’m HK-Counselor — how can I help you today?');
  const input = document.createElement('input'); input.placeholder='Ask about admissions, placements, campus...';
  const ask = pillBtn('Ask', ()=>send(input.value));
  const mic = pillBtn('🎤 Speak', ()=>micListen(send));
  chat.appendChild(row(input, ask, mic));

  function push(role,text){
    const line=document.createElement('div'); line.className='tiny';
    line.style.display='flex'; line.style.gap='8px'; line.style.alignItems='baseline';
    const tag=document.createElement('strong'); tag.textContent=role.toUpperCase();
    const msg=document.createElement('div'); msg.textContent=text;
    line.append(tag,msg); stream.append(line);
  }
  function send(text){ if(!text) return; push('user',text); const a=answer(text); push('ai',a); input.value=''; }

  const highlights = card(`<h1>Highlights</h1>
    <div class="stats">
      <div class="stat"><div class="num">${FACTS.highestPackage}</div><div class="sub">Highest Package (2023)</div></div>
      <div class="stat"><div class="num">${FACTS.placementRate}%</div><div class="sub">Placement Rate (2023)</div></div>
      <div class="stat"><div class="num">${FACTS.recruiters}</div><div class="sub">Recruiters</div></div>
    </div>
  `);

  wrap.append(chat, highlights);
  return wrap;
}

function Admissions(){
  const c = card(`<h1>Admissions — AI & ML</h1>
    <div class="grid">
      <div class="stat"><div class="num">CET / COMEDK / Management</div><div class="sub">Eligibility</div></div>
      <div class="stat"><div class="num">Scholarships + Loan Help</div><div class="sub">Support</div></div>
      <div class="stat"><div class="num">${FACTS.hod.name}</div><div class="sub">${FACTS.hod.role} • <a href="mailto:${FACTS.hod.email}">${FACTS.hod.email}</a></div></div>
    </div>
    <h2 style="margin-top:10px">Quick Inquiry</h2>
    <form id="inq" class="grid">
      <div><label>Name</label><input name="name" required></div>
      <div><label>Email</label><input name="email" type="email" required></div>
      <div><label>Program</label><select name="program"><option>AI & ML</option><option>CSE</option><option>ECE</option></select></div>
      <div><label>Your Question</label><textarea name="msg" rows="4" placeholder="Scholarship? Eligibility?"></textarea></div>
      <button class="pill" type="submit">Submit</button>
    </form>
  `);
  c.querySelector('#inq').onsubmit = (e)=>{
    e.preventDefault();
    const fd=new FormData(e.target); const entry=Object.fromEntries(fd.entries());
    entry.created_at=new Date().toISOString();
    const all=JSON.parse(localStorage.getItem('admissions')||'[]'); all.push(entry);
    localStorage.setItem('admissions',JSON.stringify(all));
    alert('Thanks! Saved locally (demo).'); e.target.reset();
  };
  return c;
}

function Placements(){
  const wrap=document.createElement('div'); wrap.className='grid';

  // overview stats
  wrap.appendChild(card(`
    <h1>Placements Overview</h1>
    <div class="stats">
      <div class="stat"><div class="num">${FACTS.highestPackage}</div><div class="sub">Highest Package (2023)</div></div>
      <div class="stat"><div class="num">${FACTS.placementRate}%</div><div class="sub">Placement Rate (2023)</div></div>
      <div class="stat"><div class="num">${FACTS.offers2023}+</div><div class="sub">Offers (2022–23)</div></div>
      <div class="stat"><div class="num">${FACTS.placed2023}</div><div class="sub">Students Placed (2022–23)</div></div>
    </div>
    <p class="tiny">Official 2023 stats from HKBK site; batch counts from Careers360 (2022–23).</p>
  `));

  // bar: Offers vs Placed vs Companies
  const bar=card(`<h2>Offers vs Placed vs Companies (2022–23)</h2><canvas id="bar2023" height="120"></canvas>`);
  wrap.appendChild(bar);

  // pie: Placement Rate 2023
  const pie=card(`<h2>Placement Rate (2023)</h2><canvas id="pie2023" height="120"></canvas>`);
  wrap.appendChild(pie);

  // flow
  wrap.appendChild(card(`
    <h2>Placement Journey</h2>
    <div class="flow">
      <div class="node">Prep & Training</div><div class="arrow">➜</div>
      <div class="node">Aptitude + Soft Skills</div><div class="arrow">➜</div>
      <div class="node">On-Campus Drives</div><div class="arrow">➜</div>
      <div class="node">Interviews</div><div class="arrow">➜</div>
      <div class="node">Offer & Onboarding</div>
    </div>
  `));

  // render charts
  requestAnimationFrame(()=>{
    if(!window.Chart) return;
    new Chart(document.getElementById('bar2023'), {
      type:'bar',
      data:{ labels:['Offers','Placed','Companies'],
        datasets:[{ label:'2022–23', data:[FACTS.offers2023, FACTS.placed2023, FACTS.companies2023] }]
      },
      options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
    });
    new Chart(document.getElementById('pie2023'), {
      type:'pie',
      data:{ labels:['Placed (94.3%)','Remaining (5.7%)'], datasets:[{ data:[FACTS.placementRate, 100-FACTS.placementRate] }] },
      options:{ responsive:true }
    });
  });

  return wrap;
}

function CampusMap(){
  const SPOTS = [
    ['Admissions Office','Ground Floor – Admin Block'],
    ['HoD (AI-ML) Cabin','Block C – 2nd Floor'],
    ['Main Library','Block B – 1st Floor'],
    ['Canteen','Near Central Courtyard'],
    ['Prayer Room','Block A – Ground'],
    ['Sports Facilities','Behind Block D'],
    ['Accounts Section','Admin Block – 1st Floor'],
    ['Washroom','Every floor – near stairwell'],
    ['Hostels','Boys (North Wing), Girls (South Wing)']
  ];
  const grid=document.createElement('div'); grid.className='grid grid-2';
  const hues=['#eef2ff','#e9fdf4','#fff6e6','#f7f3ff'];
  SPOTS.forEach(([name,desc],i)=>{
    const el=card(`<h2>${name}</h2><div class="tiny">${desc}</div>`); el.style.background=hues[i%hues.length];
    grid.appendChild(el);
  });
  return grid;
}

function Knowledge(){
  return card(`<h1>Knowledge Base</h1>
    <ul class="tiny">
      <li><strong>Admissions</strong>: CET/COMEDK/Management; scholarships + education-loan guidance.</li>
      <li><strong>AI-ML Dept</strong>: Modern labs, industry talks, projects & hackathons.</li>
      <li><strong>Placements</strong>: ${FACTS.placementRate}% (2023), highest ${FACTS.highestPackage}; strong AI/ML, Data, Cloud, Full-stack roles.</li>
    </ul>
  `);
}

function Staff(){
  const grid=document.createElement('div'); grid.className='grid grid-2';

  // Verified HoD card
  grid.appendChild(staffCard({
    name: FACTS.hod.name,
    role: FACTS.hod.role,
    email: FACTS.hod.email,
    expertise: 'Artificial Intelligence & Machine Learning',
    subjects: 'AI, ML, Research Guidance',
    photo: 'https://placehold.co/120x120/2563eb/ffffff?text=HOD' // replace with official image later
  }));

  // add more staff cards later with official names/photos from the HKBK site
  grid.appendChild(card(`<p class="tiny">Add more AI-ML faculty cards from the official faculty list when ready.</p>`));
  return grid;
}
function staffCard(p){
  const c=document.createElement('div'); c.className='card'; c.style.display='flex'; c.style.gap='12px'; c.style.alignItems='center';
  c.innerHTML = `
    <img src="${p.photo}" width="88" height="88" style="border-radius:12px" alt="${p.name}">
    <div>
      <h2>${p.name}</h2>
      <div class="tiny">${p.role}</div>
      <div>Subjects: ${p.subjects}</div>
      <div class="tiny"><a href="mailto:${p.email}">${p.email}</a></div>
    </div>`;
  return c;
}

function Gallery(){
  const ITEMS = [
    ['Student Trophies','https://placehold.co/520x280/10b981/ffffff?text=Trophies'],
    ['Major Projects','https://placehold.co/520x280/2563eb/ffffff?text=Projects'],
    ['AI & ML Labs','https://placehold.co/520x280/f59e0b/1a1a1a?text=Labs'],
  ];
  const grid=document.createElement('div'); grid.className='grid grid-2';
  ITEMS.forEach(([t,src])=>{
    const g=card(`<img class="thumb" src="${src}" alt="${t}"><h2>${t}</h2>`); grid.appendChild(g);
  });
  return grid;
}

function Feedback(){
  const wrap=document.createElement('div'); wrap.className='grid grid-2';

  const ratings={staff:0,hospitality:0,campus:0,first:0};
  function Stars(label,key){
    const box=document.createElement('div'); const title=document.createElement('div'); title.className='tiny'; title.textContent=label;
    const row=document.createElement('div');
    for(let i=1;i<=5;i++){
      const s=document.createElement('span'); s.className='star'; s.textContent='★';
      s.onclick=()=>{ ratings[key]=i; [...row.children].forEach((c,idx)=>c.classList.toggle('selected', idx<i)); };
      row.appendChild(s);
    }
    box.append(title,row); return box;
  }

  const left=card('<h1>Rate your experience</h1>');
  left.append(Stars('Staff','staff'), Stars('Hospitality','hospitality'), Stars('Campus','campus'), Stars('First Experience','first'));

  const right=card('<h1>Say more (voice or text)</h1>');
  const ta=document.createElement('textarea'); ta.rows=6; ta.placeholder='Your comments…';
  const voice=pillBtn('🎙️ Voice Note (demo)', ()=>speak('Voice note is demo only; not stored on a server.'));
  const save=pillBtn('Submit', ()=>{
    const entry={...ratings, text:ta.value, created_at:new Date().toISOString()};
    const all=JSON.parse(localStorage.getItem('feedback')||'[]'); all.push(entry);
    localStorage.setItem('feedback',JSON.stringify(all));
    alert('Thanks for the feedback!');
    ta.value=''; ['staff','hospitality','campus','first'].forEach(k=>ratings[k]=0);
  });
  right.append(ta, document.createElement('div'), row(voice, save));

  wrap.append(left,right); return wrap;
}

function NotFound(){ return card('<h1>Page not found</h1><p class="tiny">Use the buttons above.</p>'); }
