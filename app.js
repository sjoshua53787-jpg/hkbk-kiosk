/* ====== Live clock ====== */
function renderClock(){
  const el = document.getElementById('liveClock');
  const now = new Date();
  const d = now.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',year:'numeric'});
  el.textContent = `Today: ${d} | Time: ${now.toLocaleTimeString()}`;
}
setInterval(renderClock, 1000); renderClock();

/* ====== Tiny router ====== */
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
  app.innerHTML = '';
  app.appendChild(View());
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', router); router();

/* ====== Helpers ====== */
function card(html){ const d=document.createElement('div'); d.className='card'; d.innerHTML=html; return d; }
function row(...els){ const d=document.createElement('div'); d.className='row'; els.forEach(e=>d.appendChild(e)); return d; }
function button(label, onclick, accent){ const b=document.createElement('button'); b.className='btn'; b.textContent=label; if(accent) b.style.borderColor=accent; b.onclick=onclick; return b; }

/* ====== Speech (mic) ====== */
function micListen(onText){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert('SpeechRecognition not supported'); return; }
  const rec = new SR();
  rec.lang = 'en-IN'; rec.continuous = false; rec.interimResults = false;
  rec.onresult = (e)=> {
    const text = Array.from(e.results).map(r=>r[0].transcript).join(' ');
    onText(text);
  };
  rec.start();
}
function speak(text){
  if(!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-IN';
  u.rate = 1.0;
  speechSynthesis.cancel(); // interrupt current speech
  speechSynthesis.speak(u);
}

/* ====== Accurate knowledge (HKBK quick facts) ======
Sources used (summarized here so the assistant stays accurate):
- Official placements page: 32.4 LPA highest, 94.3% placements, 375+ recruiters (2023). 
- 2022–23 batch figures reported: ~1100 offers, 618 students placed, ~242 companies visited.
- AIML HOD: Dr. Tabassum Ara; hod.aiml@hkbk.edu.in (from the AIML course page).

We keep answers concise and cite in-text.
===================================================== */
const FACTS = {
  highestPackage: '₹32.4 LPA (2023)',
  placementRate: '94.3% (2023)',
  recruiters: '375+ (overall)',
  offers2023: 1100,       // 2022-23 batch offers
  placed2023: 618,        // 2022-23 batch placed
  companies2023: 242,     // 2022-23 batch companies visited
  hod: {
    name: 'Dr. Tabassum Ara',
    role: 'Professor & HoD, AI-ML',
    email: 'hod.aiml@hkbk.edu.in'
  }
};

/* ====== Smart, short answers (human-first) ====== */
function shortAnswer(q){
  const s = q.toLowerCase();

  if(/admission|apply|eligib|quota|fees?|scholar/i.test(s)){
    const ans = `Admissions for AI&ML consider CET/COMEDK/Management. Scholarships + education loan guidance available. Want steps to apply now?`;
    speak(ans); return ans + ' (Source: HKBK admissions info)';
  }
  if(/placement|package|job|salary|recruit/i.test(s)){
    const ans = `Placements are strong — ${FACTS.placementRate}, highest package ${FACTS.highestPackage}. In 2022–23: ~${FACTS.offers2023} offers, ${FACTS.placed2023} students placed, ~${FACTS.companies2023} companies.`;
    speak(ans); return ans + ' (Sources: HKBK placements page + 2022–23 batch reports)';
  }
  if(/hod|head|professor|staff|faculty/i.test(s)){
    const ans = `AI-ML HoD is ${FACTS.hod.name}. You can reach her at ${FACTS.hod.email}. Want to see the staff cards?`;
    speak(ans); return ans + ' (Source: HKBK AI-ML course page)';
  }
  if(/where|campus|map|block|office|library|canteen|hostel/i.test(s)){
    const ans = `Navigate via Campus Map: Admissions Office, HoD (AI-ML), Library, Canteen, Prayer Room, Sports, Accounts, Hostels — all listed with quick notes.`;
    speak(ans); return ans;
  }
  // default pivot
  const ans = `Great question! Quick tip: our AI-ML dept has modern labs, vibrant campus life, ${FACTS.placementRate}, highest package ${FACTS.highestPackage}.`;
  speak(ans); return ans;
}

/* ====== Pages ====== */
function Home(){
  const wrap = document.createElement('div');
  wrap.className = 'grid grid-2';

  const chat = card(`
    <h1>Chat with HK-Counselor</h1>
    <p class="small">Human-first voice, brief answers, instant mic interrupt.</p>
    <div class="chips">
      <span class="chip">AI & ML Admissions</span>
      <span class="chip">Placements</span>
      <span class="chip">Campus Map</span>
      <span class="chip">Scholarships</span>
    </div>
    <div id="chatStream" style="margin-top:8px"></div>
  `);
  const stream = chat.querySelector('#chatStream');

  pushMsg('ai', `Hello! I’m HK-Counselor — your friendly guide at HKBK. What can I help you discover today?`);

  const askText = document.createElement('input');
  askText.placeholder = 'Type your question...';
  const askBtn = button('Ask', ()=>handleAsk(askText.value), '#5b8cfe');
  const micBtn = button('🎤 Voice', ()=>micListen(handleAsk), '#7bda89');
  chat.appendChild(row(askText, askBtn, micBtn));

  function handleAsk(text){
    if(!text) return;
    pushMsg('user', text);
    const reply = shortAnswer(text);
    pushMsg('ai', reply);
    askText.value = '';
  }
  function pushMsg(role, text){
    const line = document.createElement('div');
    line.className = 'row';
    const tag = document.createElement('span'); tag.className='badge'; tag.textContent = role.toUpperCase();
    const msg = document.createElement('div'); msg.textContent = text;
    line.append(tag,msg); stream.append(line);
  }

  const quick = card(`<h1>Highlights</h1>`);
  quick.append(
    row(
      divStat(`${FACTS.highestPackage}`, 'Highest Package'),
      divStat(`${FACTS.placementRate}`, 'Placement Rate'),
      divStat(`${FACTS.recruiters}`, 'Recruiters')
    )
  );

  wrap.append(chat, quick);
  return wrap;
}

function divStat(value, sub){
  const d=document.createElement('div'); d.className='stat';
  d.innerHTML = `<div style="font-size:20px">${value}</div><div class="sub">${sub}</div>`;
  return d;
}

function Admissions(){
  const c = card(`<h1>Admissions — AI & ML</h1>
    <div class="kv">
      <div>Eligibility</div><div>CET / COMEDK / Management</div>
      <div>Scholarships</div><div>Merit & need-based; loan guidance available</div>
      <div>Contact (HoD)</div><div><strong>${FACTS.hod.name}</strong> • ${FACTS.hod.role} • <a href="mailto:${FACTS.hod.email}">${FACTS.hod.email}</a></div>
    </div>
    <h2 style="margin-top:12px">Quick Inquiry</h2>
    <form id="f" class="grid">
      <div><label>Name</label><input name="name" required></div>
      <div><label>Email</label><input name="email" type="email" required></div>
      <div><label>Program</label><select name="program"><option>AI & ML</option><option>CS</option><option>ECE</option></select></div>
      <div><label>Your Question</label><textarea name="msg" rows="4" placeholder="Scholarships? Eligibility?"></textarea></div>
      <button class="btn" type="submit">Submit Inquiry</button>
    </form>
  `);
  c.querySelector('#f').onsubmit = (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const entry = Object.fromEntries(fd.entries());
    entry.created_at = new Date().toISOString();
    const arr = JSON.parse(localStorage.getItem('admissions')||'[]'); arr.push(entry);
    localStorage.setItem('admissions', JSON.stringify(arr));
    alert('Thanks! Saved locally (demo).'); e.target.reset();
  };
  return c;
}

function Placements(){
  const wrap = document.createElement('div'); wrap.className='grid';

  // Stats card
  wrap.appendChild(card(`
    <h1>Placements Overview</h1>
    <div class="grid grid-2">
      ${divStat(`${FACTS.highestPackage}`, 'Highest Package').outerHTML}
      ${divStat(`${FACTS.placementRate}`, 'Placement Rate').outerHTML}
      ${divStat(`${FACTS.offers2023}+`, 'Offers (2022–23)').outerHTML}
      ${divStat(`${FACTS.placed2023}`, 'Students Placed (2022–23)').outerHTML}
    </div>
    <p class="small" style="margin-top:6px">
      Sources: HKBK placements page (2023 figures) and batch reports for 2022–23 offers/placed/companies.
    </p>
  `));

  // Bar chart: Offers vs Placed vs Companies (2022–23)
  const barCard = card(`<h2>2022–23: Offers vs Placed vs Companies</h2><canvas id="bar2023" height="120"></canvas>`);
  wrap.appendChild(barCard);

  // Pie chart: Placement Rate 2023
  const pieCard = card(`<h2>Placement Rate (2023)</h2><canvas id="pie2023" height="120"></canvas>`);
  wrap.appendChild(pieCard);

  // Simple flow "journey"
  const flow = card(`
    <h2>Placement Journey (Flow)</h2>
    <div class="flow">
      <div class="node">Prep & Training</div><div class="arrow">➜</div>
      <div class="node">Aptitude + Soft Skills</div><div class="arrow">➜</div>
      <div class="node">On-Campus Drives</div><div class="arrow">➜</div>
      <div class="node">Interviews</div><div class="arrow">➜</div>
      <div class="node">Offer & Onboarding</div>
    </div>
  `);
  wrap.appendChild(flow);

  // render charts after nodes are in DOM
  requestAnimationFrame(()=>{
    if(window.Chart){
      const bar = new Chart(document.getElementById('bar2023'), {
        type: 'bar',
        data: {
          labels: ['Offers', 'Placed', 'Companies'],
          datasets: [{
            label: '2022–23',
            data: [FACTS.offers2023, FACTS.placed2023, FACTS.companies2023],
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      const pie = new Chart(document.getElementById('pie2023'), {
        type: 'pie',
        data: {
          labels: ['Placed (94.3%)', 'Remaining (5.7%)'],
          datasets: [{ data: [94.3, 5.7] }]
        },
        options: { responsive: true }
      });
    }
  });

  return wrap;
}

function CampusMap(){
  const SPOTS = [
    ['Admissions Office','Ground Floor – Admin Block'],
    ['HOD (AI&ML) Cabin','Block C – 2nd Floor'],
    ['Main Library','Block B – 1st Floor'],
    ['Canteen','Near Central Courtyard'],
    ['Prayer Room','Block A – Ground'],
    ['Sports Facilities','Behind Block D'],
    ['Accounts Section','Admin Block – 1st Floor'],
    ['Washroom','Every floor – near stairwell'],
    ['Hostels','Boys (North Wing), Girls (South Wing)']
  ];
  const wrap = document.createElement('div'); wrap.className='grid grid-2';
  SPOTS.forEach(([name,desc],i)=>{
    const hue = ['#eef3ff','#fdf5e6','#f1fff1','#fff0f6'][i%4];
    const cardEl = card(`<h2>${name}</h2><div class="small">${desc}</div>`);
    cardEl.style.background = hue;
    wrap.appendChild(cardEl);
  });
  return wrap;
}

function Knowledge(){
  return card(`<h1>Knowledge Base</h1>
    <ul class="list">
      <li><strong>Admissions</strong>: CET/COMEDK/Management; scholarships & education loan guidance available.</li>
      <li><strong>AI & ML Dept</strong>: Modern labs, projects, hackathons, industry talks.</li>
      <li><strong>Placements</strong>: ${FACTS.placementRate}, highest ${FACTS.highestPackage}; strong roles in AI/ML, Data, Cloud, Full-stack.</li>
    </ul>
  `);
}

function Staff(){
  const grid = document.createElement('div'); grid.className='grid grid-2';

  // Verified HoD card (from official site)
  const hod = {
    name: FACTS.hod.name,
    role: FACTS.hod.role,
    photo: 'https://placehold.co/120x120/5b8cfe/ffffff?text=HOD', // replace with official image when available
    email: FACTS.hod.email,
    subjects: 'AI, ML, Research Guidance',
    expertise: 'Artificial Intelligence & Machine Learning'
  };
  grid.appendChild(staffCard(hod));

  // Add more faculty later as you collect official names/photos
  const note = card(`<p class="small">For the full AI-ML faculty list and photos, add more cards here using official names & images from the HKBK website.</p>`);
  grid.appendChild(note);

  return grid;
}

function staffCard(s){
  const item = document.createElement('div'); item.className='card row';
  item.innerHTML = `
    <img src="${s.photo}" width="88" height="88" style="border-radius:12px" alt="${s.name}">
    <div>
      <h2>${s.name}</h2>
      <div class="small">${s.role}</div>
      <div>Subjects: ${s.subjects}</div>
      <div class="small">Expertise: ${s.expertise}</div>
      <div class="small"><a href="mailto:${s.email}">${s.email}</a></div>
    </div>`;
  return item;
}

function Gallery(){
  const ITEMS = [
    ['Student Trophies','https://placehold.co/480x260/7bda89/ffffff?text=Trophies'],
    ['Major Projects','https://placehold.co/480x260/5b8cfe/ffffff?text=Projects'],
    ['AI & ML Labs','https://placehold.co/480x260/ffb84d/1a1a1a?text=Labs'],
  ];
  const grid = document.createElement('div'); grid.className='grid grid-2';
  ITEMS.forEach(([title,src])=>{
    const cardEl = card(`<img class="thumb" src="${src}" alt="${title}"><h2>${title}</h2>`);
    grid.appendChild(cardEl);
  });
  return grid;
}

function Feedback(){
  const wrap = document.createElement('div'); wrap.className='grid grid-2';

  const ratings = {staff:0,hospitality:0,campus:0,first:0};
  function StarRow(label,key){
    const box = document.createElement('div');
    const title = document.createElement('div'); title.className='small'; title.textContent = label;
    const rowEl = document.createElement('div');
    for(let i=1;i<=5;i++){
      const s=document.createElement('span'); s.className='star'; s.textContent='★';
      s.onclick=()=>{
        ratings[key]=i;
        [...rowEl.children].forEach((c,idx)=>c.classList.toggle('selected', idx<i));
      };
      rowEl.appendChild(s);
    }
    box.append(title,rowEl); return box;
  }

  const left = card('<h1>Rate your experience</h1>');
  left.append(
    StarRow('Staff','staff'),
    StarRow('Hospitality','hospitality'),
    StarRow('Campus','campus'),
    StarRow('First Experience','first'),
  );

  const right = card('<h1>Say more (voice or text)</h1>');
  const ta = document.createElement('textarea'); ta.rows=6; ta.placeholder='Your comments…';
  const voice = button('🎙️ Voice Note (demo)', ()=> speak('Recording is a demo only; not stored on a server.'));
  const save = button('Submit', ()=>{
    const entry = {...ratings, text:ta.value, created_at:new Date().toISOString()};
    const all = JSON.parse(localStorage.getItem('feedback')||'[]'); all.push(entry);
    localStorage.setItem('feedback', JSON.stringify(all));
    alert('Thanks for the feedback!');
    ta.value='';
    ['staff','hospitality','campus','first'].forEach(k=>ratings[k]=0);
  }, '#ffb84d');
  right.append(ta, document.createElement('div'), row(voice, save));

  wrap.append(left,right);
  return wrap;
}

function NotFound(){
  return card('<h1>Page not found</h1><p class="small">Use the buttons above.</p>');
}
