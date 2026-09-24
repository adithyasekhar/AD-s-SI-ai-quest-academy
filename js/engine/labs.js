/* ---------- Lab ---------- */
function renderLab(){
  const L = cur.L, p = P(L.id), lab = L.lab;
  const code = state.code[L.id] != null ? state.code[L.id] : lab.starter;
  lessonShell(`<article class="card">
    <h1>Lab: ${esc(L.title)}</h1>
    <p class="task">${fmt(lab.task)}</p>
    ${p.lab ? `<p class="notice">✓ You've already passed this lab. Practice all you like.</p>` : ""}
    <textarea class="editor" id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Python code editor">${esc(code)}</textarea>
    <div class="labbar">
      <button class="primary" id="check">Check my answer</button>
      <button class="ghost" id="run">Run</button>
      <button class="ghost" id="hint">Hint</button>
      <button class="ghost" id="sol">Solution</button>
      <button class="ghost" id="reset">Reset code</button>
    </div>
    <pre class="console" id="con" aria-live="polite"><span class="dim">Output appears here. Press Run to try your code, or Check my answer to test it.</span></pre>
    <p class="labnote" id="rtnote">${rt.mode==="lite" ? liteNote() : ""}</p>
    <div class="hintbox" id="hb"></div>
    <div class="result" id="res" aria-live="polite"></div>
  </article>
  ${lab.bonus ? `<article class="card bonus">
    <h2>Bonus challenge ${p.bonus ? "✓" : "(+20 XP)"}</h2>
    <p class="task">${fmt(lab.bonus.task)}</p>
    <p class="labnote">Add your bonus code to the same editor above, below your main solution, then check it here.</p>
    <div class="labbar"><button class="primary" id="bcheck">Check bonus</button><button class="ghost" id="bhint">Hint</button><button class="ghost" id="bsol">Solution</button></div>
    <div class="hintbox" id="bhb"></div>
    <div class="result" id="bres" aria-live="polite"></div>
  </article>` : ""}`);
  const ed = $("#ed");
  let t; ed.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.code[L.id] = ed.value; save(); }, 400); });
  ed.addEventListener("keydown", e => {
    if(e.key === "Tab" && !e.shiftKey){ e.preventDefault(); insertAt(ed, "    "); }
    else if(e.key === "Enter"){
      const before = ed.value.slice(0, ed.selectionStart); const line = before.split("\n").pop();
      let ind = line.match(/^\s*/)[0]; if(/:\s*$/.test(line)) ind += "    ";
      e.preventDefault(); insertAt(ed, "\n" + ind);
    }
  });
  $("#run").onclick = () => execute(false);
  $("#check").onclick = () => execute(true);
  $("#hint").onclick = () => { if(!p.lab) p.hint = true; save(); $("#hb").innerHTML = `<b>Hint:</b> ${fmt(lab.hint)}`; };
  $("#sol").onclick = () => {
    if(!p.lab && !confirm("See the solution? You'll still pass by running it, but you'll earn less XP. Try the hint first if you haven't.")) return;
    if(!p.lab) p.sol = true; save();
    $("#hb").innerHTML = `<b>One possible solution.</b> Read it, then type it yourself. Typing it builds the skill.<pre><code>${esc(lab.solution)}</code></pre><button class="ghost" id="usesol">Put it in the editor</button>`;
    $("#usesol").onclick = () => { ed.value = lab.solution; state.code[L.id] = ed.value; save(); };
  };
  $("#reset").onclick = () => { if(confirm("Replace your code with the starter code?")){ ed.value = lab.starter; state.code[L.id] = lab.starter; save(); } };
  if(lab.bonus){
    $("#bcheck").onclick = () => executeBonus();
    $("#bhint").onclick = () => { $("#bhb").innerHTML = `<b>Hint:</b> ${fmt(lab.bonus.hint)}`; };
    $("#bsol").onclick = () => {
      if(!p.bonus && !confirm("See the bonus solution? You'll earn 5 XP instead of 20 if you use it.")) return;
      if(!p.bonus) p.bsol = true; save();
      $("#bhb").innerHTML = `<b>One possible bonus solution.</b> Add it below your main code.<pre><code>${esc(lab.bonus.solution)}</code></pre>`;
    };
  }
}
function insertAt(el, text){ const s = el.selectionStart, e = el.selectionEnd; el.setRangeText(text, s, e, "end"); el.dispatchEvent(new Event("input")); }
function liteNote(){ return "You're on lite Python, because this page can't load full Python. Labs that use json, regex, hashlib or eval need full Python. Open the GitHub Pages version to run everything."; }

let busy = false;
async function execute(check){
  if(busy) return; busy = true;
  const L = cur.L, lab = L.lab, ed = $("#ed"), con = $("#con"), res = $("#res");
  state.code[L.id] = ed.value; save();
  res.className = "result"; res.innerHTML = "";
  const status = m => { con.innerHTML = `<span class="dim">${esc(m)}</span>`; };
  try{
    await ensurePython(status);
    $("#rtnote").textContent = rt.mode === "lite" ? liteNote() : "";
    status(check ? "Running your code and the checks…" : "Running…");
    await new Promise(r => setTimeout(r, 20));
    const r = await runPython(ed.value, check ? lab.tests : null);
    const outHtml = r.out ? esc(r.out) : `<span class="dim">(no output)</span>`;
    con.innerHTML = outHtml + (r.err ? `\n<span class="err">${esc(r.err)}</span>` : "");
    if(check){
      if(r.err){ res.className = "result bad"; res.innerHTML = `<b>Your code hit an error.</b><p>${esc(r.err)}</p><p>Read the last line of the error: it names the problem. Fix that line and try again.</p>`; }
      else if(r.testErr){ const m = r.testErr.replace(/^AssertionError:?\s*/, "");
        res.className = "result bad"; res.innerHTML = `<b>Not yet.</b><p>${esc(m || "A check failed. Compare your result with the task.")}</p>`; }
      else passLab();
    }
  }catch(e){ con.innerHTML = `<span class="err">${esc(e.message)}</span>`; }
  finally{ busy = false; }
}
function passLab(){
  const p = P(cur.L.id), res = $("#res"), first = !p.lab;
  let gained = 0;
  if(first){ gained = p.sol ? 10 : (p.hint ? 40 : 50); addXP(gained); }
  const wasDone = isDone(cur.L.id);
  p.lab = true; bumpStreak(); const bonus = completeCheck(wasDone); save(); renderBar();
  document.querySelector('.step[data-s="lab"]').classList.add("ok");
  res.className = "result good";
  res.innerHTML = `<b><span class="pop">🎉</span> All checks passed!</b>
    <p>${first ? `+${gained} XP${!p.hint && !p.sol ? " (including a no-hints bonus)" : ""}.` : "Nice practice run."}${bonus}</p>
    ${p.quiz ? `<div class="celebrate">${nextButtons()}</div>` : `<button class="primary" id="toquiz2">Now take the quiz</button>`}`;
  if(p.quiz) wireNext(); else $("#toquiz2").onclick = () => { cur.step = "quiz"; renderLesson(); window.scrollTo(0,0); };
  res.scrollIntoView({behavior:"smooth", block:"nearest"});
}

/* ---------- Bonus challenges (harder follow-up labs) ---------- */
async function executeBonus(){
  if(busy) return; busy = true;
  const L = cur.L, lab = L.lab, ed = $("#ed"), res = $("#bres"), p = P(L.id);
  state.code[L.id] = ed.value; save();
  res.className = "result"; res.innerHTML = "";
  const status = m => { res.className = "result"; res.innerHTML = `<p class="labnote">${esc(m)}</p>`; };
  try{
    await ensurePython(status);
    status("Running your code and the bonus checks…");
    const r = await runPython(ed.value, lab.bonus.tests);
    if(r.err){ res.className = "result bad"; res.innerHTML = `<b>Your code hit an error.</b><p>${esc(r.err)}</p>`; }
    else if(r.testErr){ res.className = "result bad"; res.innerHTML = `<b>Not yet.</b><p>${esc(r.testErr.replace(/^AssertionError:?\s*/, "") || "A bonus check failed.")}</p>`; }
    else {
      let gained = 0;
      if(!p.bonus){ gained = p.bsol ? 5 : 20; addXP(gained); p.bonus = true; bumpStreak(); save(); renderBar(); }
      res.className = "result good"; res.innerHTML = `<b><span class="pop">⭐</span> Bonus complete!</b><p>${gained ? `+${gained} XP.` : "Nice practice run."} You're working above the lesson's level.</p>`;
    }
  }catch(e){ res.className = "result bad"; res.innerHTML = `<p>${esc(e.message)}</p>`; }
  finally{ busy = false; }
}
