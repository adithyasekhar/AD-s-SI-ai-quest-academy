/* ---------- Python runtime: Pyodide (full Python), Skulpt fallback (lite) ---------- */
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const SKULPT = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/";
const PRELUDE = R`__lines__ = []
__bprint = print
def print(*args, sep=" ", end="\n"): __lines__.append(sep.join(str(a) for a in args) + end); __bprint(*args, sep=sep, end=end)
def __out(): return "".join(__lines__)
`;
let rt = {mode:null, py:null, loading:null};
function loadScript(src){ return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Could not load " + src)); document.head.appendChild(s); }); }
function ensurePython(status){
  if(rt.mode) return Promise.resolve();
  if(!rt.loading) rt.loading = (async () => {
    try{
      status("Loading Python. The first time takes about 10 seconds…");
      await loadScript(PYODIDE + "pyodide.js");
      rt.py = await Promise.race([ loadPyodide({indexURL: PYODIDE}), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 30000)) ]);
      rt.mode = "full";
    }catch(e){
      status("Full Python isn't available here. Loading lite Python…");
      try{
        await loadScript(SKULPT + "skulpt.min.js"); await loadScript(SKULPT + "skulpt-stdlib.js");
        rt.mode = "lite";
      }catch(e2){ rt.loading = null; throw new Error("Python couldn't load. Check your internet connection and try again."); }
    }
  })();
  return rt.loading;
}
function lastLine(msg){ const ls = String(msg).trim().split("\n").filter(Boolean); return ls[ls.length-1] || String(msg); }
function pyLineOf(msg){ const m = [...String(msg).matchAll(/File "<exec>", line (\d+)/g)]; return m.length ? m[m.length-1][1] : null; }

async function runPython(code, tests){
  if(rt.mode === "full"){
    const py = rt.py, ns = py.globals.get("dict")();
    let out = "", err = null, testErr = null;
    try{
      py.runPython(PRELUDE, {globals: ns});
      try{ await py.runPythonAsync(code, {globals: ns}); }
      catch(e){ const ln = pyLineOf(e.message); err = (ln ? `Line ${ln}: ` : "") + lastLine(e.message); }
      out = py.runPython("__out()", {globals: ns});
      if(tests != null && !err){
        try{ await py.runPythonAsync(tests, {globals: ns}); }
        catch(e){ testErr = lastLine(e.message); }
      }
    } finally { ns.destroy(); }
    return {out, err, testErr};
  }
  // lite mode (Skulpt)
  const Sk = window.Sk; let out = "", err = null, testErr = null;
  const PRE_LINES = PRELUDE.split("\n").length - 1;
  const userLines = code.split("\n").length;
  Sk.configure({output: t => out += t, read: f => { if(!Sk.builtinFiles || !Sk.builtinFiles.files[f]) throw "File not found: '" + f + "'"; return Sk.builtinFiles.files[f]; }, __future__: Sk.python3, execLimit: 8000});
  const program = PRELUDE + code + (tests != null ? "\n__bprint('\\u0000TESTS')\n" + tests : "");
  try{ await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, program, true)); }
  catch(e){
    let msg = e.toString(); const m = msg.match(/on line (\d+)/);
    const ln = m ? +m[1] - PRE_LINES : null;
    msg = msg.replace(/ on line \d+/, "");
    if(ln && ln > userLines) testErr = msg; else err = (ln ? `Line ${ln}: ` : "") + msg;
  }
  const cut = out.indexOf("\u0000TESTS");
  if(cut >= 0) out = out.slice(0, cut);
  if(tests != null && !err && !testErr && cut < 0) err = "Your code stopped before the checks could run.";
  return {out, err, testErr};
}
