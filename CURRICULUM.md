# Adding lessons and tracks

All content is plain JavaScript data in `js/data/`. There is no build step: edit a file, refresh the page.

## Where things live

| File | What's in it |
|---|---|
| `js/data/shared.js` | `R` (String.raw, used for code blocks). Loaded first. |
| `js/data/fluency.js` | `FLU_ACTS`, `FLU_LESSONS` (Track 0: AI Fluency) |
| `js/data/python.js` | `ACTS`, `LESSONS` (Track 1: Python for AI) |
| `js/data/agentic.js` | `AGENT_ACTS`, `AGENT_LESSONS` (Track 2: Agentic AI) |
| `js/data/rag.js` | `RAG_ACTS`, `RAG_LESSONS` (Track 3: RAG) |
| `js/data/ml.js` | `ML_ACTS`, `ML_LESSONS` (Track 4: Algorithms and ML) |
| `js/data/automation.js` | `AUTO_ACTS`, `AUTO_LESSONS` (Track 5: Workflow Automation) |
| `js/data/interview.js` | `INTERVIEW`: interview questions for the Python and Agentic lessons |
| `js/data/tracks.js` | `TRACKS` (the track list) and `CAP` (capstone generator ingredients) |
| `js/data/certs.js` | `CERTS`: the certifications hub |

## Lesson shape

```js
{ id:"r01", act:1, title:"Why RAG, and when not to use it", mins:35,
  hook:"A real-world scenario that opens the lesson.",
  learn:[
    {h:"Section heading", p:["Paragraph", "Paragraph"], code:R`optional code block`}
  ],
  mistakes:["Common mistake", "..."],            // optional
  ai:"How this is used in AI work.",
  interview:{q:"Question", a:"Strong answer"},   // optional (or add it to INTERVIEW)
  terms:[["Word", "Meaning"]],                   // feeds the word bank
  quiz:[
    {t:"mcq",  q:"Question", o:["A", "B", "C", "D"], a:1},   // a = index of the right option
    {t:"fill", q:"What does `int(\"7\") + 3` give?", a:["10"]} // a = accepted answers
  ],
  lab:{ task, starter, tests, hint, solution,     // Python lab; tests are assert statements
        bonus:{task, tests, hint, solution} }     // optional harder challenge
}
```

- `id` must be unique across all tracks. Each track uses its own prefix (`f`, `p`, `a`, `r`, `m`, `w`...).
- `act` must match an entry in that track's `*_ACTS` array.
- Wrap `starter`, `tests` and `solution` in `R\`...\`` so backslashes stay exactly as typed.
- In quiz text, `backticks` render as inline code.

### No-code lessons

Set `lab:null` for no practice, or use a writing lab:

```js
lab:{ type:"write", task:"Instructions", minWords:15,
      checks:[{label:"What the learner should do", re:"regex the answer must match"}],
      example:"A model answer" }
```

## Adding a track

1. Create `js/data/<track>.js` with `<TRACK>_ACTS` and `<TRACK>_LESSONS`.
2. Add a `<script>` tag for it in `index.html`, before `tracks.js`.
3. Add an entry to `TRACKS` in `js/data/tracks.js`:
   `{id, title, color, live:true, short, lessons:<TRACK>_LESSONS, acts:<TRACK>_ACTS, blurb}`.

## Engine

The app itself is in `js/engine/`. It's split by feature: `core.js` (state, progress, XP, navigation), `lessons.js`, `quiz.js` (quizzes, daily review, practice tests, interview practice), `python-runtime.js` (Pyodide and Skulpt), `labs.js`, `writing.js`, `words.js`, `capstone.js`, `certs.js`. `js/main.js` starts the app.

These are classic scripts, not ES modules, so they share one global scope and the site still works when opened straight from disk. Load order in `index.html` matters: `shared.js` first, then the content files, then `core.js` before the rest of the engine.
