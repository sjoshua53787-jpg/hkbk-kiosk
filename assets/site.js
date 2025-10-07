// Quick facts (edit if your college updates numbers)
window.FACTS = {
  highestPackage: '₹32.4 LPA',
  placementRate: 94.3,
  recruiters: '375+',
  offers2023: 1100,
  placed2023: 618,
  companies2023: 242,
  hod: { name:'Dr. Tabassum Ara', role:'Professor & HoD, AI-ML', email:'hod.aiml@hkbk.edu.in' }
};

// Render header + nav on every page
window.renderShell = function(activeLabel){
  const el = document.getElementById('site-header');
  if(!el) return;
  el.innerHTML = `
    <div class="hero">
      <div class="container hero-inner">
        <div class="brand">
          <img class="logo" src="https://placehold.co/220x54/2563eb/ffffff?text=HKBK+Logo" alt="HKBK Logo">
          <span class="tag">HK-Counselor</span>
        </div>
        <div id="liveClock" class="chip">—</div>
      </div>
    </div>
    <nav class="nav container">
      ${nav('../Home/','Home',activeLabel)}
      ${nav('../Admissions/','Admissions',activeLabel)}
      ${nav('../Placements/','Placements',activeLabel)}
      ${nav('../CampusMap/','Campus map',activeLabel)}
      ${nav('../Knowledge/','Knowledge',activeLabel)}
      ${nav('../Staff/','Staff',activeLabel)}
      ${nav('../Gallery/','Gallery',activeLabel)}
      ${nav('../Feedback/','Feedback',activeLabel)}
    </nav>`;
  startClock();
};
function nav(href,label,active){
  return `<a class="pill" href="${href}" ${label===active?'style="outline:2px solid var(--brand)"':''}>${label}</a>`;
}

// Live date/time
function startClock(){
  function tick(){
    const el=document.getElementById('liveClock');
    if(el){el.textContent=new Date().toLocaleString();}
  }
  tick(); clearInterval(window.__clock); window.__clock=setInterval(tick,1000);
}

// Browser voice helpers
window.micListen=function(cb){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("SpeechRecognition not supported in this browser.");return;}
  const rec=new SR(); rec.lang='en-IN'; rec.continuous=false; rec.interimResults=false;
  rec.onresult=e=>cb(Array.from(e.results).map(r=>r[0].transcript).join(' ')); rec.start();
};
window.speak=function(t){ if(!window.speechSynthesis) return; const u=new SpeechSynthesisUtterance(t); u.lang='en-IN'; u.rate=1.0; speechSynthesis.cancel(); speechSynthesis.speak(u); };

// Short, accurate assistant answers
window.answer=function(q){
  const s=(q||'').toLowerCase();
  if(/admission|apply|eligib|quota|fees|scholar/.test(s)){
    const t='Admissions for AI & ML consider CET, COMEDK, and Management quota. Scholarships and education-loan guidance are available.';
    speak(t); return t;
  }
  if(/placement|package|salary|recruit|job/.test(s)){
    const f=FACTS;
    const t=`Placements are strong — ${f.placementRate}% in 2023 with highest package ${f.highestPackage}. In 2022–23: about ${f.offers2023} offers, ${f.placed2023} students placed, and ${f.companies2023} companies visited.`;
    speak(t); return t;
  }
  if(/hod|head|professor|faculty|staff/.test(s)){
    const h=FACTS.hod; const t=`AI-ML HoD is ${h.name}. Contact: ${h.email}.`;
    speak(t); return t;
  }
  if(/map|campus|where|library|canteen|hostel|office/.test(s)){
    const t='See Campus Map for directions to Admissions Office, HoD AI-ML cabin, Library, Canteen, Prayer Room, Sports, Accounts, and Hostels.';
    speak(t); return t;
  }
  const f=FACTS; const t=`Great question! AI-ML has modern labs and a vibrant campus life with ${f.placementRate}% placements and highest ${f.highestPackage}.`;
  speak(t); return t;
};
