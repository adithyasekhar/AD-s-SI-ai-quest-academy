/* ---------- Word bank ---------- */
function renderWords(){
  setTab("words"); renderBar();
  const all = ALL.flatMap(x => x.l.terms.map(([w,d]) => ({w, d, x, open: !!(state.prog[x.l.id] && state.prog[x.l.id].seen)})));
  const openN = all.filter(x=>x.open).length;
  app.innerHTML = `<section class="hero"><h1>Word bank</h1><p>${openN} of ${all.length} terms unlocked. Open a lesson to add its words. Use these in interviews, in docs and on LinkedIn: speaking the language is half the job.</p></section>
    <input class="search" id="q" type="search" placeholder="Search terms" aria-label="Search terms">
    <div class="words" id="wl"></div>`;
  const draw = f => {
    const list = all.filter(x => x.open && (!f || (x.w + " " + x.d).toLowerCase().includes(f.toLowerCase())));
    $("#wl").innerHTML = list.length ? list.map(x => `<div class="term"><b>${esc(x.w)}</b><span>${esc(x.d)}</span><span class="wordl">${esc(x.x.t.short)}, lesson ${x.x.i+1}: ${esc(x.x.l.title)}</span></div>`).join("")
      : `<p class="notice">${openN ? "No terms match that search." : "No words yet. Open lesson 1 to start your word bank."}</p>`;
  };
  $("#q").oninput = e => draw(e.target.value); draw("");
}
