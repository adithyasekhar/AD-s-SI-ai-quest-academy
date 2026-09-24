/* ---------- Generic quiz session (lesson quiz, daily review, practice test) ---------- */
let qs = null;
function startSession(o){
  qs = Object.assign({queue: o.items.map((_,k)=>k), tried: new Set(), first: 0, requeue: true, results: []}, o);
  renderQ();
}
function renderQ(){
  if(!qs.queue.length) return qs.onDone();
  const item = qs.items[qs.queue[0]], q = item.q;
  const answered = qs.items.length - qs.queue.length;
  let body = "";
  if(q.t === "mcq"){
    body = `<div class="opts">${shuffle(q.o.map((t,i)=>({t,i}))).map(o=>`<button class="opt" data-i="${o.i}">${fmt(o.t)}</button>`).join("")}</div>`;
  } else {
    body = `<form class="fill" id="ff"><input id="fi" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type your answer" aria-label="Your answer"><button class="primary" type="submit">Check</button></form>`;
  }
  const src = item.from ? `<p class="qcount">From: ${esc(item.from)}</p>` : "";
  qs.shell(`<article class="card"><p class="qcount">${esc(qs.label)} ${answered+1} of ${qs.items.length}</p>${src}<h2 class="q">${fmt(q.q)}</h2>${q.c?`<pre><code>${esc(q.c)}</code></pre>`:""}${body}<div class="fb" id="fb" aria-live="polite"></div></article>`);
  if(q.t === "mcq"){
    app.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const ok = +b.dataset.i === q.a;
      app.querySelectorAll(".opt").forEach(x => { x.disabled = true; if(+x.dataset.i === q.a) x.classList.add("good"); });
      if(!ok) b.classList.add("bad");
      answerQ(ok, fmt(q.o[q.a]));
    });
  } else {
    const inp = $("#fi"); inp.focus({preventScroll:true});
    $("#ff").onsubmit = e => { e.preventDefault(); if(!inp.value.trim()) return;
      inp.disabled = true; e.target.querySelector("button").disabled = true;
      answerQ(q.a.some(a => norm(a) === norm(inp.value)), `<code>${esc(q.a[0])}</code>`); };
  }
}
function answerQ(ok, reveal){
  const qi = qs.queue[0], item = qs.items[qi], q = item.q, first = !qs.tried.has(qi);
  qs.tried.add(qi); if(ok && first) qs.first++;
  if(first) qs.results.push({item, ok});
  if(item.key){ if(!ok) state.missed[item.key] = (state.missed[item.key]||0) + 1; else if(first && state.missed[item.key]) { state.missed[item.key]--; if(!state.missed[item.key]) delete state.missed[item.key]; } save(); }
  const xpNote = ok && first && qs.xpEach ? `+${qs.xpEach} XP` : "";
  const fb = $("#fb"); fb.className = "fb " + (ok ? "good" : "bad");
  fb.innerHTML = `<p class="verdict">${ok ? `Correct! ${xpNote}` : "Not quite."}</p>
    ${!ok ? `<p>The answer: ${reveal}</p>` : ""}${q.x ? `<p>${fmt(q.x)}</p>` : ""}
    ${!ok && qs.requeue ? `<p class="small">This one comes back at the end.</p>` : ""}
    <button class="primary" id="next">${qs.queue.length === 1 && (ok || !qs.requeue) ? "Finish" : "Continue"}</button>`;
  const nx = $("#next"); nx.focus({preventScroll:true}); fb.scrollIntoView({behavior:"smooth", block:"nearest"});
  nx.onclick = () => { if(ok || !qs.requeue) qs.queue.shift(); else qs.queue.push(qs.queue.shift()); renderQ(); };
}

/* Lesson quiz */
function startLessonQuiz(){
  const L = cur.L, fresh = !P(L.id).quizXp;
  startSession({items: L.quiz.map((q,k) => ({q, key: L.id + ":" + k})), label: "Question", shell: lessonShell,
    xpEach: fresh ? 10 : 0, onDone: finishLessonQuiz});
}
function finishLessonQuiz(){
  const p = P(cur.L.id); let gained = 0;
  if(!p.quizXp){ gained = qs.first * 10; addXP(gained); p.quizXp = true; }
  const wasDone = isDone(cur.L.id);
  p.quiz = true; bumpStreak(); const bonus = completeCheck(wasDone); save(); renderBar();
  lessonShell(`<article class="card celebrate"><p class="big pop" aria-hidden="true">✅</p><h1>Quiz complete</h1>
    <p>${qs.first} of ${qs.items.length} right on the first try.${gained ? ` +${gained} XP.` : ""}${bonus}</p>
    ${(p.lab || !cur.L.lab) ? nextButtons() : `<button class="primary" id="tolab">${cur.L.lab.type === "write" ? "Go to the writing practice" : "Go to the coding lab"}</button>`}</article>`);
  if(!p.lab && cur.L.lab) $("#tolab").onclick = () => { cur.step = "lab"; renderLesson(); window.scrollTo(0,0); };
  else wireNext();
}
function completeCheck(wasDone){
  if(!wasDone && isDone(cur.L.id)){ addXP(25); const act = cur.t.acts.find(a=>a.n===cur.L.act);
    const actDone = cur.t.lessons.filter(l=>l.act===act.n).every(l=>isDone(l.id));
    return ` Lesson complete: +25 XP bonus.${actDone ? ` 🏅 You earned the ${act.badge} badge!` : ""}`; }
  return "";
}
function nextButtons(){
  const nxt = cur.t.lessons[cur.i+1];
  if(nxt) return `<button class="primary" id="nextl">Next lesson: ${esc(nxt.title)}</button><button class="ghost" id="map">All lessons</button>`;
  const other = LIVE.find(t => t.id !== cur.t.id && t.lessons.some(l => !isDone(l.id)));
  return `<p>You finished every lesson in ${esc(cur.t.title)}.</p>
    ${other ? `<button class="primary" id="nexttrack" data-t="${other.id}">Start ${esc(other.title)}</button>` : ""}
    <button class="${other ? "ghost" : "primary"}" id="tocap">Get my capstone brief</button><button class="ghost" id="map">All lessons</button>`;
}
function wireNext(){
  const n = $("#nextl"); if(n) n.onclick = () => openLesson(cur.i+1, "learn");
  const c = $("#tocap"); if(c) c.onclick = () => go("capstone");
  const nt = $("#nexttrack"); if(nt) nt.onclick = () => { state.track = nt.dataset.t; save(); openLesson(Math.max(0, nextIndex(T())), "learn"); };
  $("#map").onclick = () => go("track");
}

/* ---------- Daily review and practice test ---------- */
function seededShuffle(arr, seed){ let h = hash(seed); const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function questionPool(onlySeen, trackId){
  return ALL.filter(x => (!trackId || x.t.id === trackId) && (!onlySeen || (state.prog[x.l.id] && state.prog[x.l.id].seen)))
    .flatMap(x => x.l.quiz.map((q,k) => ({q, key: x.l.id + ":" + k, from: `${x.t.short}, lesson ${x.i+1}: ${x.l.title}`, act: x.l.act, track: x.t})));
}
function dailySet(){
  const today = dayStr(new Date());
  if(state.daily && state.daily.day === today) return state.daily;
  const pool = questionPool(true);
  const missed = pool.filter(p => state.missed[p.key]).sort((a,b) => state.missed[b.key] - state.missed[a.key]).slice(0, 3);
  const rest = seededShuffle(pool.filter(p => !state.missed[p.key]), today).slice(0, 5 - missed.length);
  state.daily = {day: today, keys: shuffle(missed.concat(rest)).map(p => p.key), done: false, score: 0};
  save(); return state.daily;
}
function renderDaily(){
  setTab("daily"); renderBar();
  const d = dailySet(), pool = questionPool(true), missedN = Object.keys(state.missed).length;
  app.innerHTML = `<section class="hero"><h1>Practice a little every day</h1>
    <p>Short, daily practice beats cramming. Your daily set grows harder as you open more lessons, and questions you missed come back until you get them right.</p></section>
    <div class="modes">
      <article class="track" style="--tc:var(--gold)">
        <h2>Today's review</h2>
        ${!d.keys.length ? `<p>Open your first lesson to start getting daily questions.</p><button class="primary" id="startl">Go to lessons</button>`
          : d.done ? `<p>Done for today: ${d.score} of ${d.keys.length} right. Come back tomorrow for a new set.</p><button class="ghost" id="again">Practice today's set again</button>`
          : `<p>${d.keys.length} questions from ${pool.length} you've unlocked${missedN ? `, including ones you missed before` : ""}. +5 XP for each first-try answer.</p><button class="primary" id="startd">Start today's review</button>`}
      </article>
      <article class="track" style="--tc:var(--py)">
        <h2>Practice tests</h2>
        <p>20 mixed questions from a whole track, exam style: one attempt each, with explanations, and a score by topic at the end. All questions are original practice questions, not real exam questions.</p>
        <div class="row">${LIVE.map(t => `<button class="ghost" data-test="${t.id}">${esc(t.short)}</button>`).join("")}</div>
      </article>
      <article class="track" style="--tc:#6A4BC4">
        <h2>Interview practice</h2>
        <p>${ivPool().length ? `Answer out loud, then compare with a strong answer. ${ivPool().length} questions from lessons you've opened.` : "Open a lesson to unlock its interview question."}</p>
        ${ivPool().length ? `<button class="primary" id="startiv">Practice an interview question</button>` : ""}
      </article>
    </div>`;
  const sl = $("#startl"); if(sl) sl.onclick = () => go("track");
  const byKey = k => pool.find(p => p.key === k);
  const runDaily = (awardXP) => startSession({items: d.keys.map(byKey).filter(Boolean), label: "Review question", requeue: false,
    xpEach: awardXP ? 5 : 0, shell: pageShell("daily"), onDone: () => {
      const gained = awardXP ? qs.first * 5 : 0;
      if(awardXP){ addXP(gained); d.done = true; d.score = qs.first; bumpStreak(); save(); renderBar(); }
      pageShell("daily")(`<article class="card celebrate"><p class="big pop" aria-hidden="true">📅</p><h1>Daily review done</h1>
        <p>${qs.first} of ${qs.items.length} right.${gained ? ` +${gained} XP.` : ""} Missed questions will come back in future reviews.</p>
        <button class="primary" id="back2">Back to practice</button></article>`);
      $("#back2").onclick = () => go("daily");
    }});
  const sd = $("#startd"); if(sd) sd.onclick = () => runDaily(true);
  const ag = $("#again"); if(ag) ag.onclick = () => runDaily(false);
  app.querySelectorAll("[data-test]").forEach(b => b.onclick = () => startPracticeTest(b.dataset.test));
  const si = $("#startiv"); if(si) si.onclick = () => showInterview();
}
function pageShell(tab){ return inner => { setTab(tab); app.innerHTML = `<div class="lhead"><button class="back" id="back">Back</button></div>${inner}`; $("#back").onclick = () => go(tab); }; }
function startPracticeTest(trackId){
  const pool = shuffle(questionPool(false, trackId)).slice(0, 20);
  startSession({items: pool, label: "Question", requeue: false, xpEach: 0, shell: pageShell("daily"), onDone: () => {
    const t = trackById(trackId), byAct = {};
    for(const r of qs.results){ const a = r.item.act; byAct[a] = byAct[a] || {ok:0, n:0}; byAct[a].n++; if(r.ok) byAct[a].ok++; }
    const pct = Math.round(qs.first / qs.items.length * 100);
    const weak = t.acts.filter(a => byAct[a.n] && byAct[a.n].ok / byAct[a.n].n < 0.7);
    bumpStreak(); save(); renderBar();
    pageShell("daily")(`<article class="card"><h1>${esc(t.short)} practice test: ${pct}%</h1>
      <p>${qs.first} of ${qs.items.length} correct. Aim for 80% or higher on several different practice tests before booking a real exam, and build at least one real project with the API.</p>
      <h2>Score by topic</h2>
      ${t.acts.filter(a => byAct[a.n]).map(a => { const s = byAct[a.n]; const p = Math.round(s.ok/s.n*100);
        return `<p><b>Act ${a.n}: ${esc(a.title)}</b>: ${s.ok} of ${s.n}</p><div class="scorebar"><div style="width:${p}%"></div></div>`; }).join("")}
      ${weak.length ? `<p>Review next: ${weak.map(a => esc(a.title)).join(", ")}.</p>` : `<p>Strong across every topic. Keep your daily reviews going.</p>`}
      <button class="primary" id="retake">Take another practice test</button></article>`);
    $("#retake").onclick = () => startPracticeTest(trackId);
  }});
}

/* Interview practice */
function ivPool(){ return ALL.filter(x => x.l.interview && state.prog[x.l.id] && state.prog[x.l.id].seen); }
function showInterview(){
  const pool = ivPool(); if(!pool.length) return go("daily");
  state.ivSeen = state.ivSeen || [];
  let fresh = pool.filter(x => !state.ivSeen.includes(x.l.id));
  if(!fresh.length){ state.ivSeen = []; fresh = pool; }
  const x = fresh[Math.floor(Math.random() * fresh.length)];
  state.ivSeen.push(x.l.id); save();
  pageShell("daily")(`<article class="card">
    <p class="qcount">${esc(x.t.short)}, lesson ${x.i+1}: ${esc(x.l.title)}</p>
    <h2 class="q">${fmt(x.l.interview.q)}</h2>
    <p class="labnote">Answer out loud or write it down first. Aim for 3 to 5 sentences: what it is, why it matters, and a real example.</p>
    <details class="iv"><summary>Show a strong answer</summary><p>${fmt(x.l.interview.a)}</p></details>
    <div class="row" style="margin-top:14px"><button class="primary" id="nextiv">Next question</button><button class="ghost" id="doneiv">Done</button></div>
  </article>`);
  $("#nextiv").onclick = showInterview;
  $("#doneiv").onclick = () => go("daily");
}
