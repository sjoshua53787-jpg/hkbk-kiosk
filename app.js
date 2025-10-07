/* ---------- Live clock ---------- */
function renderClock(){
  const el = document.getElementById('liveClock');
  const now = new Date();
  const d = now.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',year:'numeric'});
  el.textContent = `Today: ${d} | Time: ${now.toLocaleTimeString()}`;
}
setInterval(renderClock, 1000); renderClock();

/* ---------- Tiny router (hash-based) ---------- */
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
}
window.addEventListener('hashchange', router);
router();

/* ---------- Helpers ---------- */
function card(html){ const d=document.createElement('div'); d.className='card'; d.innerHTML=html; return d; }
function row(...els){ const d=document.createElement('div'); d.className='row'; els.forEach(e=>d.appendChild(e)); return d; }
function button(label, onclick){ const b=document.createElement('button'); b.className='btn'; b.textContent=label; b.onclick=onclick; return b; }

/* ---------- Speech (mic) ---------- */
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
  speechSynthesis.cancel(); // Gemini-style interrupt
  speechSynthesis.speak(u);
}

/* ---------- Pages ---------- */
function Home(){
  const wrap = document.createElement('div');
  wrap.className = 'grid grid-2';

  /* Chat card */
  const chat = card(`<h1>Chat</h1>
    <p class="small">Human-first counselor. Ask anything — I’ll keep it short & helpful.</p>
    <div id="chatStream"></div>
  `);
  const stream = chat.querySelector('#chatStream');

  // initial message
  pushMsg('ai', `Hello there! I'm HK-Counselor, your personal guide at HKBK College of Engineering. I'm so glad you stopped by! What can I help you discover about HKBK today?`);

  // controls
  const askText = document.createElement('input');
  askText.placeholder = 'Type your question...';
  const askBtn = button('Ask', ()=>handleAsk(askText.value));
  const micBtn = button('🎤 Voice', ()=>micListen(handleAsk));
  chat.appendChild(row(askText, askBtn, micBtn));

  function handleAsk(text){
    if(!text) return;
    pushMsg('user', text);
    const reply = shortAnswer(text);
    pushMsg('ai', reply);
    speak(reply);
    askText.value = '';
  }
  function pushMsg(role, text){
    const line = document.createElement('div');
    line.className = 'row';
    const tag = document.createElement('span'); tag.className='badge'; tag.textContent = role.toUpperCase();
    const msg = document.createElement('div'); msg.textContent = text;
    line.append(tag,msg); stream.append(line);
  }
  function shortAnswer(q){
    const marketing = 'We’re proud of AI & ML — modern labs, vibrant campus life, 93%+ placements, highest package ₹32.4 LPA.';
    // tiny demo “knowledge”
    if(/admission|fee|apply|elig/i.test(q)) return 'For Admissions: AI & ML accepts CET/COMEDK/Management. Scholarships & loan help available. ' + marketing;
    if(/placement|job|package/i.test(q)) return 'Placements: 93%+ with highest ₹32.4 LPA. Roles in AI/ML, Data, Cloud, Full-stack. ' + marketing;
    if(/where|campus|map|hod|office/i.test(q)) return 'Use Campus Map page for directions: Admissions Office, HOD (AI&ML), Library, Canteen, Hostels, and more. ' + marketing;
    return `Great question! ${marketing}`;
  }

  /* Quick actions */
  const quick = card(`<h1>Quick actions</h1>`);
  quick.appendChild(row(
    button('AI&ML Admissions', ()=>handleAsk('Tell me about AI & ML admissions')),
    button('Placements', ()=>handleAsk('Placement records')),
    button('Campus Map', ()=>{ location.hash='#/campus'; })
  ));

  wrap.append(chat, quick);
  return wrap;
}

function Admissions(){
  const c = card(`<h1>Admissions — AI & ML</h1>
    <p class="small">Eligibility via CET/COMEDK/Management. Scholarships + education loan guidance available.</p>
    <form id="f" class="grid">
      <div><label>Name</label><input name="name" required></div>
      <div><label>Email</label><input name="email" type="email" required></div>
      <div><label>Program</label><select name="program"><option>AI & ML</option><option>CS</option><option>ECE</option></select></div>
      <div><label>Question</label><textarea name="msg" rows="4"></textarea></div>
      <button class="btn" type="submit">Submit Inquiry</button>
    </form>
  `);
  c.querySelector('#f').onsubmit = (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const entry = { name:fd.get('name'), email:fd.get('email'), program:fd.get('program'), msg:fd.get('msg'), created_at:new Date().to_
