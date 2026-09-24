/* ---------- Certifications hub ---------- */
function renderCerts(){
  setTab("certs"); renderBar();
  state.certDone = state.certDone || {};
  const link = id => { const x = findLesson(id); if(!x) return "";
    return `<button class="lk ${isDone(id) ? "done" : ""}" data-l="${id}">${isDone(id) ? "✓ " : ""}${esc(x.t.short)} ${x.i + 1}: ${esc(x.l.title)}</button>`; };
  const coverage = c => { const ids = [...new Set(c.modules.flatMap(m => m.ours))]; const d = ids.filter(isDone).length; return ids.length ? Math.round(d / ids.length * 100) : 0; };
  app.innerHTML = `<section class="hero"><h1>Claude certifications</h1>
    <p>Anthropic offers four Claude certifications, each with free official prep courses. This page maps every exam area to the lessons here that build the same skills, so you can study in both places.</p></section>
    <p class="notice">The official courses and exams belong to Anthropic; start with them. Everything in AI Quest is original practice material. None of it is real exam content, and exam questions must never be shared.</p>
    ${CERTS.map(c => {
      const official = (c.courses || c.prereqs).map((name, k) => { const key = c.id + ":" + k;
        return `<label class="oc"><input type="checkbox" data-oc="${key}" ${state.certDone[key] ? "checked" : ""}><span>${esc(name)}</span></label>`; }).join("");
      return `<article class="card cert">
        <h2>${esc(c.name)}</h2>
        <p>${esc(c.who)}</p>
        <div class="status" style="color:var(--py);font-weight:700">AI Quest coverage completed: ${coverage(c)}%</div>
        <p><a class="ext" href="${c.official}" target="_blank" rel="noopener">Open the official prep path ↗</a></p>
        <h3>${c.courses ? "Official prep courses" : "Recommended before the official course"}</h3>
        ${official || "<p>None listed.</p>"}
        <h3>Exam areas and where to practice here</h3>
        ${c.modules.map(m => `<div class="mod"><b>${esc(m.name)}</b><p>${esc(m.covers)}</p>
          ${m.ours.length ? `<div class="links">${m.ours.map(link).join("")}</div>` : ""}
          ${m.gap ? `<p class="gap">${esc(m.gap)}</p>` : ""}</div>`).join("")}
        <div class="row" style="margin-top:12px">${c.recommended.map(tid => { const t = trackById(tid); return `<button class="ghost" data-test="${tid}">${esc(t.short)} practice test</button>`; }).join("")}</div>
      </article>`; }).join("")}`;
  app.querySelectorAll("[data-oc]").forEach(cb => cb.onchange = () => { state.certDone[cb.dataset.oc] = cb.checked; save(); });
  app.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { const x = findLesson(b.dataset.l); state.track = x.t.id; save(); openLesson(x.i, "learn"); });
  app.querySelectorAll("[data-test]").forEach(b => b.onclick = () => startPracticeTest(b.dataset.test));
}
