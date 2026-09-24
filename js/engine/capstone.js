/* ---------- Capstone ---------- */
function hash(s){ let h = 2166136261; for(const c of s){ h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function pick(arr, h, salt){ return arr[hash(h + ":" + salt) % arr.length]; }
function makeBrief(name, seed){
  const key = name.trim().toLowerCase() + "#" + seed;
  const d = pick(CAP.domains, key, "d"), a = pick(CAP.archetypes, key, "a");
  const t1i = hash(key + ":t1") % CAP.twists.length; let t2i = hash(key + ":t2") % CAP.twists.length; if(t2i === t1i) t2i = (t2i + 1) % CAP.twists.length;
  return {d, a, twists:[CAP.twists[t1i], CAP.twists[t2i]], code: (hash(key) % 9000 + 1000)};
}
const art = w => /^(AI|[aeiou])/i.test(w) ? "an" : "a";
function briefText(name, b){
  return `CAPSTONE BRIEF for ${name} (#${b.code})
Build ${art(b.a.name)} ${b.a.name} for ${b.d.name}.

Who it's for: ${b.d.user}.
Core job: ${b.a.core}
Start with this data: ${b.d.data}.

Your two twists:
1. ${b.twists[0]}
2. ${b.twists[1]}

Required stack: Python 3.11+, Git and GitHub, pytest, API keys in environment variables, plus ${b.a.stack}.

Milestones (4 weeks):
Week 1: Scope, collect data, write 25 test questions or tasks with expected results.
Week 2: Build the core pipeline end to end, even if rough.
Week 3: Add the twists, guardrails and evals. Measure and record results.
Week 4: Clean up, write the README, record a 3-minute demo, publish on GitHub and LinkedIn.

Make it yours: add one feature no existing tool has. Put it in the first line of your README.

Scoring (100): ${CAP.rubric.map(([k,v])=>`${k} ${v}`).join("; ")}.`;
}
function renderCapstone(){
  setTab("capstone"); renderBar();
  const done = ALL.filter(x => isDone(x.l.id)).length;
  const name = state.cap.name;
  app.innerHTML = `<section class="hero"><h1>Your capstone project</h1>
    <p>Everyone gets a different brief: a unique mix of industry, AI architecture and constraints, based on your name. It's a portfolio project that proves you can build real AI, not just follow tutorials.</p></section>
    ${done < ALL.length ? `<p class="notice">Best after finishing the builder tracks (you've completed ${done} of ${ALL.length} lessons). You can preview your brief now.</p>` : ""}
    <div class="row"><input id="nm" placeholder="Your full name" aria-label="Your full name" value="${esc(name)}"><button class="primary" id="gen">${name ? "Show my brief" : "Generate my brief"}</button></div>
    <div id="brief"></div>`;
  const show = () => {
    const n = $("#nm").value.trim(); if(!n){ $("#nm").focus(); return; }
    if(n !== state.cap.name){ state.cap = {name:n, seed:0}; save(); }
    const b = makeBrief(n, state.cap.seed);
    $("#brief").innerHTML = `<article class="card brief" style="margin-top:16px">
      <p class="qcount">Brief #${b.code} for ${esc(n)}</p>
      <p class="pitch">Build ${art(b.a.name)} ${esc(b.a.name)} for ${esc(b.d.name.toLowerCase())}.</p>
      <div class="chips"><span class="chip2">${esc(b.d.name)}</span><span class="chip2">${esc(b.a.name)}</span></div>
      <h3>Who it's for</h3><p>${esc(b.d.user)}.</p>
      <h3>The core job</h3><p>${esc(b.a.core)}</p>
      <h3>Data to start with</h3><p>${esc(b.d.data)}. Use public or synthetic data only, never real personal data.</p>
      <h3>Your two twists</h3><ol><li>${esc(b.twists[0])}</li><li>${esc(b.twists[1])}</li></ol>
      <h3>Required stack</h3><p>Python 3.11+, Git and GitHub, pytest, API keys in environment variables, plus ${esc(b.a.stack)}.</p>
      <h3>Four-week plan</h3><ol>
        <li>Scope it, collect data, and write 25 test questions or tasks with expected results.</li>
        <li>Build the core pipeline end to end, even if it's rough.</li>
        <li>Add your twists, guardrails and evals. Measure and record results.</li>
        <li>Polish, write the README, record a 3-minute demo, publish on GitHub and LinkedIn.</li></ol>
      <h3>Make it yours</h3><p>Add one feature no existing tool has, and put it in the first line of your README. That's what interviewers remember.</p>
      <h3>How it's scored</h3><ul>${CAP.rubric.map(([k,v])=>`<li>${esc(k)}: ${v} points</li>`).join("")}</ul>
      <div class="row" style="margin-top:16px"><button class="primary" id="copy">Copy brief</button><button class="ghost" id="reroll">Give me a different brief</button></div>
      <p class="labnote" id="cmsg" aria-live="polite"></p>
    </article>`;
    $("#copy").onclick = async () => {
      const txt = briefText(n, b);
      try{ await navigator.clipboard.writeText(txt); $("#cmsg").textContent = "Copied. Paste it into your project's README."; }
      catch(e){ const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
        try{ document.execCommand("copy"); $("#cmsg").textContent = "Copied. Paste it into your project's README."; }catch(e2){ $("#cmsg").textContent = "Copy isn't allowed here. Select the text above and copy it manually."; }
        ta.remove(); }
    };
    $("#reroll").onclick = () => { state.cap.seed++; save(); show(); };
  };
  $("#gen").onclick = show;
  $("#nm").onkeydown = e => { if(e.key === "Enter") show(); };
  if(name) show();
}
