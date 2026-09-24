/* =====================================================================
   ENGINE (multi-track)
   ===================================================================== */
const KEY = "aiqa-v1";
const fresh = () => ({xp:0, prog:{}, code:{}, streak:0, lastDay:null, unlockAll:false, cap:{name:"", seed:0},
                      track:"python", daily:null, missed:{}});
function load(){ try{ const r = localStorage.getItem(KEY); if(r) return Object.assign(fresh(), JSON.parse(r)); }catch(e){} return fresh(); }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
let state = load();

const $ = s => document.querySelector(s);
const app = $("#app");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
const norm = s => String(s).toLowerCase().replace(/\s+/g,"").replace(/["'%]/g,"");
function shuffle(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

const LIVE = TRACKS.filter(t => t.live);
const trackById = id => LIVE.find(t => t.id === id) || LIVE[0];
const T = () => trackById(state.track);
const P = id => (state.prog[id] = state.prog[id] || {});
const LESSON_BY_ID = {};
const isDone = id => { const p = state.prog[id]; if(!p || !p.quiz) return false; const l = LESSON_BY_ID[id]; return !l || !l.lab || !!p.lab; };
const unlocked = (track, i) => state.unlockAll || i === 0 || isDone(track.lessons[i-1].id);
const ALL = LIVE.flatMap(t => t.lessons.map((l, i) => ({t, l, i})));
ALL.forEach(x => LESSON_BY_ID[x.l.id] = x.l);
const findLesson = id => ALL.find(x => x.l.id === id);

/* XP, levels, streak */
const TITLES = ["Beginner","Explorer","Coder","Builder","Problem solver","Engineer","AI builder","Agent builder","AI engineer","AI architect"];
const PER_LEVEL = 300;
function addXP(n){ state.xp += n; }
const dayStr = d => d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
function bumpStreak(){ const t=dayStr(new Date()); if(state.lastDay===t) return; const y=dayStr(new Date(Date.now()-864e5)); state.streak = state.lastDay===y ? state.streak+1 : 1; state.lastDay=t; }
function liveStreak(){ const t=dayStr(new Date()), y=dayStr(new Date(Date.now()-864e5)); return (state.lastDay===t||state.lastDay===y) ? state.streak : 0; }
function renderBar(){
  const lvl = Math.floor(state.xp / PER_LEVEL) + 1;
  $("#rank").textContent = `Level ${lvl}: ${TITLES[Math.min(lvl-1, TITLES.length-1)]}`;
  $("#xp").textContent = `${state.xp} XP`;
  $("#xpfill").style.width = ((state.xp % PER_LEVEL) / PER_LEVEL * 100) + "%";
  const s = liveStreak();
  $("#streak").textContent = s ? `🔥 ${s}` : "";
  $("#streak").setAttribute("aria-label", s ? `${s} day streak` : "");
  $("#streak").title = "Days in a row you've completed a quiz, lab or daily review";
}
function setTab(name){ document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-current", t.dataset.go===name ? "page" : "false")); }
function go(name){ window.scrollTo(0,0); ({home:renderHome, track:renderTrack, daily:renderDaily, certs:renderCerts, words:renderWords, capstone:renderCapstone})[name](); }
document.querySelectorAll(".tab").forEach(t => t.onclick = () => go(t.dataset.go));
$("#brand").onclick = () => go("home");
const nextIndex = track => track.lessons.findIndex((l,k) => !isDone(l.id) && unlocked(track, k));
