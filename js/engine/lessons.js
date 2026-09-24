/* ---------- Home ---------- */
function renderHome(){
  setTab("home"); renderBar();
  app.innerHTML = `
  <section class="hero">
    <h1>Become an AI engineer, one lesson at a time.</h1>
    <p>Start from zero. Every lesson explains one idea with real-world examples, checks it with a quiz, and ends with a coding lab you solve in your browser. A daily review keeps it fresh. Free, no sign-up, and progress stays on this device.</p>
  </section>
  ${TRACKS.map(t => {
    if(t.live){
      const done = t.lessons.filter(l => isDone(l.id)).length;
      return `<article class="track" style="--tc:${t.color}">
        <h2>${esc(t.title)}</h2><p>${esc(t.blurb)}</p>
        <div class="status">${done} of ${t.lessons.length} lessons complete</div>
        <button class="primary" data-track="${t.id}">${done ? "Continue" : "Start lesson 1"}</button>
      </article>`;
    }
    return `<article class="track soon" style="--tc:${t.color}">
      <h2>${esc(t.title)}</h2><p>${esc(t.blurb)}</p>
      <div class="status">Coming next: 20 lessons planned</div>
      <details><summary>See the 20 lessons</summary><ol>${t.outline.map(o=>`<li>${esc(o)}</li>`).join("")}</ol></details>
    </article>`;
  }).join("")}
  <section class="how">
    <div><h3>Recommended order</h3><p>Everyone: start with AI Fluency (no coding). Builders: then Python for AI. Then Agentic AI, RAG, Machine Learning and Workflow Automation in any order; all assume you can read Python functions, dictionaries and classes. Take Machine Learning first if you want the theory behind how models learn.</p></div>
    <div><h3>Learn, then prove it</h3><p>Plain-English explanations and working code, then a quiz with instant feedback and a lab with automatic tests.</p></div>
    <div><h3>A little every day</h3><p>Daily review mixes 5 questions from lessons you've opened, and brings back the ones you missed until you've got them.</p></div>
    <div><h3>Certification and interview practice</h3><p>The Agentic AI track follows the topic areas of Anthropic's developer certification. Every track has an exam-style practice test, and every lesson has an interview question with a strong model answer.</p></div>
    <div><h3>Build your own</h3><p>Finish with a capstone brief made just for you: a unique AI agent or RAG project for your portfolio.</p></div>
  </section>`;
  app.querySelectorAll("[data-track]").forEach(b => b.onclick = () => {
    state.track = b.dataset.track; save();
    const t = T(), i = nextIndex(t);
    i >= 0 ? openLesson(i) : go("track");
  });
}

/* ---------- Track map ---------- */
function trackSwitch(){
  return `<div class="switch" role="group" aria-label="Choose track">${LIVE.map(t =>
    `<button data-sw="${t.id}" aria-pressed="${t.id===T().id}">${esc(t.short)}</button>`).join("")}</div>`;
}
function wireSwitch(render){ app.querySelectorAll("[data-sw]").forEach(b => b.onclick = () => { state.track = b.dataset.sw; save(); render(); }); }
function renderTrack(){
  setTab("track"); renderBar();
  const t = T(), nextIdx = nextIndex(t);
  let html = `<section class="hero">${trackSwitch()}<h1>${esc(t.title)}</h1><p>Four acts, ${t.lessons.length} lessons. Each lesson: learn, quiz, lab. Finish an act to earn its badge.</p></section>`;
  for(const act of t.acts){
    const ls = t.lessons.map((l,i)=>({l,i})).filter(x => x.l.act === act.n);
    const d = ls.filter(x => isDone(x.l.id)).length;
    html += `<div class="acthead"><h2>Act ${act.n}: ${esc(act.title)}</h2>
      <span>${d === ls.length ? `<span class="badge-earned">🏅 ${esc(act.badge)}</span>` : `${d} of ${ls.length} done`}</span></div>
      <div class="lessons">${ls.map(({l,i}) => {
        const un = unlocked(t, i), dn = isDone(l.id), p = state.prog[l.id] || {};
        const status = !un ? "Locked" : dn ? "Complete" : (p.quiz || p.lab) ? "In progress" : (i === nextIdx ? "Start" : "Open");
        return `<button class="lrow ${dn?"done":""} ${i===nextIdx?"next":""}" data-i="${i}" ${un?"":"disabled"}>
          <span class="num">${dn ? "✓" : i+1}</span>
          <span><span class="t">${esc(l.title)}</span><br><span class="s">About ${l.mins} min, ${!l.lab ? "quiz only" : l.lab.type === "write" ? "with writing practice" : "with a coding lab"}</span></span>
          <span class="r">${status}</span></button>`;
      }).join("")}</div>`;
  }
  html += `<div class="foot"><p>Already know some of this?</p>
    <button class="ghost" id="unlock">${state.unlockAll ? "Lock lessons in order" : "Unlock all lessons"}</button>
    <button class="ghost" id="reset">Reset all progress</button></div>`;
  app.innerHTML = html;
  wireSwitch(renderTrack);
  app.querySelectorAll(".lrow:not(:disabled)").forEach(b => b.onclick = () => openLesson(+b.dataset.i));
  $("#unlock").onclick = () => { state.unlockAll = !state.unlockAll; save(); renderTrack(); };
  $("#reset").onclick = () => { if(confirm("Reset all XP, progress, saved code and streak in every track?")){ const tr = state.track; state = fresh(); state.track = tr; save(); renderTrack(); } };
}

/* ---------- Lesson ---------- */
let cur = null;
function openLesson(i, step){
  const t = T(), L = t.lessons[i]; P(L.id).seen = true; save();
  cur = {t, i, L, step: step || (P(L.id).quiz && L.lab && !P(L.id).lab ? "lab" : "learn")};
  renderLesson(); window.scrollTo(0,0);
}
function lessonShell(inner){
  const L = cur.L, p = P(L.id);
  setTab("track");
  app.innerHTML = `
    <div class="lhead"><button class="back" id="back">All lessons</button><span class="lno">${esc(cur.t.short)}: lesson ${cur.i+1} of ${cur.t.lessons.length}</span></div>
    <div class="steps" role="tablist">
      <button class="step" data-s="learn" ${cur.step==="learn"?'aria-current="step"':""}>Learn</button>
      <button class="step ${p.quiz?"ok":""}" data-s="quiz" ${cur.step==="quiz"?'aria-current="step"':""}>Quiz</button>
      ${L.lab ? `<button class="step ${p.lab?"ok":""}" data-s="lab" ${cur.step==="lab"?'aria-current="step"':""}>${L.lab.type === "write" ? "Practice" : "Lab"}</button>` : ""}
    </div>${inner}`;
  if(!L.lab) app.querySelector(".steps").style.gridTemplateColumns = "repeat(2,1fr)";
  $("#back").onclick = () => go("track");
  app.querySelectorAll(".step").forEach(b => b.onclick = () => { cur.step = b.dataset.s; renderLesson(); window.scrollTo(0,0); });
}
function renderLesson(){ if(cur.step === "lab" && cur.L.lab && cur.L.lab.type === "write") return renderWriteLab(); ({learn:renderLearn, quiz:startLessonQuiz, lab:renderLab})[cur.step](); }

function renderLearn(){
  const L = cur.L;
  const sections = L.learn.map(s => `<h2>${esc(s.h)}</h2>${(s.p||[]).map(p=>`<p>${fmt(p)}</p>`).join("")}
    ${s.table ? `<div class="tablewrap"><table class="bigo"><thead><tr>${s.table[0].map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${s.table.slice(1).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
    ${s.code ? `<pre><code>${esc(s.code)}</code></pre>` : ""}`).join("");
  lessonShell(`<article class="card">
    <h1>${esc(L.title)}</h1>
    <div class="hook"><b>Real-world scenario</b>${fmt(L.hook)}</div>
    ${sections}
    ${L.mistakes ? `<h2>Common mistakes</h2><ul class="mist">${L.mistakes.map(m=>`<li>${fmt(m)}</li>`).join("")}</ul>` : ""}
    <div class="ailink"><b>Why it matters: </b>${fmt(L.ai)}</div>
    ${L.interview ? `<h2>Interview question</h2><div class="iv"><p class="ivq">${fmt(L.interview.q)}</p><details><summary>Show a strong answer</summary><p>${fmt(L.interview.a)}</p></details></div>` : ""}
    <h2>Words to know</h2>
    <div class="terms">${L.terms.map(([w,d])=>`<div class="term"><b>${esc(w)}</b><span>${esc(d)}</span></div>`).join("")}</div>
    <button class="primary" id="toquiz">Take the quiz</button>
  </article>`);
  $("#toquiz").onclick = () => { cur.step = "quiz"; renderLesson(); window.scrollTo(0,0); };
}
