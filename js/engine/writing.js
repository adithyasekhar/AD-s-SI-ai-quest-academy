/* ---------- Writing practice (no-code labs) ---------- */
function wordCount(t){ return (t.trim().match(/\S+/g) || []).length; }
function renderWriteLab(){
  const L = cur.L, p = P(L.id), lab = L.lab;
  const draft = state.code[L.id] != null ? state.code[L.id] : "";
  lessonShell(`<article class="card">
    <h1>Practice: ${esc(L.title)}</h1>
    <p class="task">${fmt(lab.task)}</p>
    ${p.lab ? `<p class="notice">✓ You've already completed this practice. Try another version any time.</p>` : ""}
    <textarea class="editor write" id="ed" spellcheck="true" aria-label="Your answer" placeholder="Write your answer here…">${esc(draft)}</textarea>
    <div class="labbar">
      <button class="primary" id="wcheck">Check my answer</button>
      <button class="ghost" id="wex">See an example</button>
    </div>
    <p class="labnote">Your answer is checked against a simple checklist for the key ingredients. It can't judge quality the way a person can, so also reread your answer with the lesson in mind.</p>
    <ul class="checks" id="checks" aria-live="polite"></ul>
    <div class="hintbox" id="hb"></div>
    <div class="result" id="res" aria-live="polite"></div>
  </article>`);
  const ed = $("#ed");
  let t; ed.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.code[L.id] = ed.value; save(); }, 400); });
  $("#wex").onclick = () => { if(!p.lab) p.hint = true; save(); $("#hb").innerHTML = `<b>One strong example.</b> Yours should be about your own situation, not a copy.<pre style="white-space:pre-wrap">${esc(lab.example)}</pre>`; };
  $("#wcheck").onclick = () => {
    const text = ed.value; state.code[L.id] = text; save();
    const n = wordCount(text), min = lab.minWords || 0;
    const results = [{label: `At least ${min} words (you have ${n})`, ok: n >= min}]
      .concat(lab.checks.map(c => ({label: c.label, ok: new RegExp(c.re, "i").test(text)})));
    $("#checks").innerHTML = results.map(r => `<li class="${r.ok ? "ok" : "no"}">${r.ok ? "✓" : "✗"} ${esc(r.label)}</li>`).join("");
    if(results.every(r => r.ok)) passLab();
    else { const res = $("#res"); res.className = "result bad"; res.innerHTML = `<b>Almost there.</b><p>Add the missing ingredients marked ✗, then check again.</p>`; }
  };
}
