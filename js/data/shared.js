/* =====================================================================
   Shared by every content file. Loaded first.
   Every track uses the same lesson shape (see CURRICULUM.md):
   { id, act, title, mins, hook, learn:[{h, p:[...], code}], ai,
     terms:[[word, meaning]], quiz:[...], lab:{task, starter, tests, hint, solution} }
   Code blocks use R`...` (String.raw) so backslashes stay exactly as typed.
   ===================================================================== */
const R = String.raw;
