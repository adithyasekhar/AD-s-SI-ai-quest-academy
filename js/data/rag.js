/* =====================================================================
   TRACK 3: RAG AND AI FRAMEWORKS
   Every lab builds a real piece of a retrieval system in plain Python.
   New quality fields used here: mistakes, interview {q, a}, lab.bonus {task, tests, hint, solution}.
   ===================================================================== */
const RAG_ACTS = [
  {n:1, title:"From documents to vectors", badge:"Retrieval Apprentice"},
  {n:2, title:"Search that actually works", badge:"Search Engineer"},
  {n:3, title:"Grounded generation and frameworks", badge:"RAG Builder"},
  {n:4, title:"Production RAG", badge:"RAG Architect"}
];

const RAG_LESSONS = [
/* ---------------- ACT 1 ---------------- */
{ id:"r01", act:1, title:"Why RAG, and when not to use it", mins:35,
  hook:"Leadership wants an assistant that answers employee questions from 3,000 pages of HR policy. The model has never seen those pages. Do you retrain it, paste everything in, or retrieve what's needed?",
  learn:[
    {h:"Three ways to give a model knowledge", p:[
      "Long context: paste the documents into the prompt. Simple and accurate for a few documents, but slow and costly at scale, and it breaks when your content is bigger than the context window.",
      "Fine-tuning: train the model further on examples. It's good for teaching a style, format or specialized behavior. It's poor for facts that change, can't easily cite sources, and needs retraining for every update.",
      "Retrieval-augmented generation (RAG): search your content for the passages relevant to each question and put only those in the prompt. It handles large, changing knowledge, can cite exact sources and respects permissions. It's the default architecture for AI over private data."]},
    {h:"The RAG pipeline", p:[
      "Indexing (done ahead of time): load documents, clean them, split them into chunks, turn chunks into searchable form (keywords and embeddings), and store them with metadata.",
      "Answering (for every question): transform the query if needed, retrieve candidate chunks, rerank them, build a grounded prompt with the best chunks, generate an answer with citations, and check it. Most RAG failures are retrieval failures: if the right chunk never reaches the prompt, no model can answer correctly."],
     code:R`question = "How many PTO days do new hires get?"
hits = search(question, k=3)                 # retrieval
prompt = build_prompt(question, hits)        # augmentation
answer = llm(prompt)                         # generation`},
    {h:"When not to use RAG", p:[
      "If all your content fits comfortably in the context window and rarely changes, just include it, with prompt caching to keep it cheap. If you need a behavior or format rather than knowledge, use prompting or fine-tuning. If the question needs exact numbers from a database (\"total overtime last month\"), query the database (lesson 18). RAG shines for large, changing, text-heavy knowledge."]}
  ],
  mistakes:["Blaming the model when the real problem is that retrieval never found the right chunk.","Using fine-tuning to teach facts that change every quarter.","Building complex RAG when the whole knowledge base fits in one cached prompt."],
  ai:"RAG is the most common architecture in enterprise AI. Knowing when to use it, and when simpler options win, is a core design skill.",
  interview:{q:"When would you choose RAG over fine-tuning?", a:"When the model needs knowledge that's large, private or changes often, and when answers must cite sources or respect per-user permissions. Fine-tuning is better for teaching a consistent style, format or narrow skill. Often you combine them: fine-tune or prompt for behavior, retrieve for facts."},
  terms:[["RAG","Retrieval-augmented generation: retrieve relevant passages, then generate an answer from them."],["Indexing","Preparing documents ahead of time so they can be searched."],["Retrieval","Finding the passages most relevant to a question."],["Grounding","Basing an answer on provided sources."],["Fine-tuning","Further training a model on examples to change its behavior."],["Long-context prompting","Putting whole documents directly into the prompt."]],
  quiz:[
    {t:"mcq", q:"A company's 40-page handbook changes once a year and fits easily in context. Simplest good option?", o:["Full RAG with a vector database","Include it in the prompt with prompt caching","Fine-tune a model","Train a model from scratch"], a:1},
    {t:"mcq", q:"Policies change weekly and answers must cite the exact source. Best fit?", o:["Fine-tuning","RAG","A bigger model with no documents","Higher temperature"], a:1},
    {t:"mcq", q:"The bot answers wrongly, and the right passage wasn't in the prompt. The failure is in…", o:["Generation","Retrieval","Tokenization","The API key"], a:1},
    {t:"mcq", q:"Which is part of indexing, not answering?", o:["Chunking documents","Reranking hits for a question","Generating the answer","Checking citations"], a:0}
  ],
  lab:{
    task:"Build the smallest possible RAG: keyword retrieval plus a grounded prompt.\n\n1. tokenize(text): lowercase words made of letters and digits, as a list. Use re.findall(r\"[a-z0-9]+\", text.lower()).\n2. keyword_search(query, docs, k=2): docs maps id to text. A doc's score is the number of distinct query words that appear in it. Return up to k ids with score above 0, best first; ties keep the docs' original order.\n3. rag_prompt(question, docs, ids): return exactly this shape (one <document> line per id, in order):\n<documents>\n<document id=\"ID\">TEXT</document>\n</documents>\n\nAnswer using only the documents above. If the answer isn't there, say \"I don't know.\"\n\n<question>QUESTION</question>",
    starter:R`import re

DOCS = {
    "pto": "New hires get 15 PTO days per year. PTO accrues monthly.",
    "benefits": "Health insurance starts on the first day of the month after hire.",
    "remote": "Employees may work remotely up to 3 days per week.",
}

def tokenize(text):
    return []

def keyword_search(query, docs, k=2):
    return []

def rag_prompt(question, docs, ids):
    return ""

q = "How many PTO days do new hires get?"
print(rag_prompt(q, DOCS, keyword_search(q, DOCS)))`,
    tests:R`assert tokenize("PTO: 15 days, per-year!") == ["pto", "15", "days", "per", "year"], "Got " + str(tokenize("PTO: 15 days, per-year!"))
assert keyword_search("How many PTO days do new hires get?", DOCS) == ["pto", "remote"], "Got " + str(keyword_search("How many PTO days do new hires get?", DOCS))
assert keyword_search("remote work", DOCS, k=5) == ["remote"], "Only return docs with a score above 0"
assert keyword_search("zzz", DOCS) == [], "No matches gives []"
p = rag_prompt("Q?", DOCS, ["remote"])
exp = '<documents>\n<document id="remote">Employees may work remotely up to 3 days per week.</document>\n</documents>\n\nAnswer using only the documents above. If the answer isn\'t there, say "I don\'t know."\n\n<question>Q?</question>'
assert p == exp, "The prompt format doesn't match. Got:\n" + p`,
    hint:"keyword_search: q = set(tokenize(query)); scores = [(len(q & set(tokenize(t))), i) for i in docs]; then sorted(..., key=lambda x: -x[0]) keeps ties in order. Keep only score > 0 and slice [:k].",
    solution:R`import re

DOCS = {
    "pto": "New hires get 15 PTO days per year. PTO accrues monthly.",
    "benefits": "Health insurance starts on the first day of the month after hire.",
    "remote": "Employees may work remotely up to 3 days per week.",
}

def tokenize(text):
    return re.findall(r"[a-z0-9]+", text.lower())

def keyword_search(query, docs, k=2):
    q = set(tokenize(query))
    scored = [(len(q & set(tokenize(text))), doc_id) for doc_id, text in docs.items()]
    ranked = sorted(scored, key=lambda x: -x[0])
    return [doc_id for score, doc_id in ranked if score > 0][:k]

def rag_prompt(question, docs, ids):
    lines = [f'<document id="{i}">{docs[i]}</document>' for i in ids]
    return ("<documents>\n" + "\n".join(lines) + "\n</documents>\n\n"
            "Answer using only the documents above. If the answer isn't there, say \"I don't know.\"\n\n"
            f"<question>{question}</question>")

q = "How many PTO days do new hires get?"
print(rag_prompt(q, DOCS, keyword_search(q, DOCS)))`,
    bonus:{
      task:"Bonus: the word \"the\" or \"do\" shouldn't make a document look relevant. Add an optional stopwords parameter: keyword_search(query, docs, k=2, stopwords=None). When given, ignore those words in the query.",
      tests:R`D = {"a": "the cat sat", "b": "dogs do bark", "c": "the dog ran"}
assert keyword_search("do the dogs", D, k=3) == ["b", "a", "c"], "Without stopwords, the and do count. Got " + str(keyword_search("do the dogs", D, k=3))
assert keyword_search("do the dogs", D, k=3, stopwords={"the", "do"}) == ["b"], "With stopwords, only dogs should count"`,
      hint:"At the top: q = set(tokenize(query)); if stopwords: q = q - set(stopwords).",
      solution:R`def keyword_search(query, docs, k=2, stopwords=None):
    q = set(tokenize(query))
    if stopwords:
        q -= set(stopwords)
    scored = [(len(q & set(tokenize(text))), doc_id) for doc_id, text in docs.items()]
    ranked = sorted(scored, key=lambda x: -x[0])
    return [doc_id for score, doc_id in ranked if score > 0][:k]`}}
},
{ id:"r02", act:1, title:"Loading and cleaning documents", mins:35,
  hook:"Your first RAG demo answers a question with \"Cookie settings | Accept all | Skip to content\". The retriever did its job; the documents were full of junk.",
  learn:[
    {h:"Garbage in, garbage out", p:[
      "Real documents are messy: HTML full of menus and scripts, PDFs with headers, footers and page numbers on every page, scanned images, tables that turn into word soup, duplicated pages. Everything you index is something retrieval can wrongly return, so cleaning is not optional."]},
    {h:"Loaders by format", p:[
      "HTML: remove scripts, styles, navigation and footers; keep headings. PDF: tools like pypdf or pdfplumber extract text; layout-aware parsers (Unstructured, Docling and similar) keep headings and tables; scanned PDFs need OCR. Office files: python-docx, openpyxl. Frameworks bundle loaders for hundreds of formats, but always inspect the output yourself before indexing."],
     code:R`from pypdf import PdfReader
reader = PdfReader("handbook.pdf")
pages = [p.extract_text() or "" for p in reader.pages]
print(pages[0][:300])      # ALWAYS eyeball what you extracted`},
    {h:"Metadata is half the value", p:[
      "Keep a record for each document: id, title, source URL or path, department, last-updated date, owner and who's allowed to see it. Metadata powers filters (\"only 2025 policies\"), permissions, citations and freshness. Also remove exact duplicates, which otherwise crowd the top results with the same text."]}
  ],
  mistakes:["Indexing raw HTML with menus and cookie banners.","Never looking at extracted PDF text, then discovering tables became gibberish.","Dropping metadata, so you can't filter, cite or enforce permissions later."],
  ai:"Data preparation decides the ceiling of RAG quality. Teams that invest in clean, well-labeled documents beat teams with fancier models.",
  interview:{q:"Your RAG answers are poor. Where do you start investigating?", a:"Look at the data and retrieval before the model. Inspect the extracted text for junk, check chunk boundaries, then test whether the correct chunk appears in the top results for real questions. Most quality problems come from parsing, chunking or retrieval, not generation."},
  terms:[["Document loader","Code that reads a file format and extracts its text."],["Boilerplate","Repeated junk like menus, footers and cookie banners."],["OCR","Optical character recognition: turning images of text into text."],["Metadata","Facts about a document: source, date, owner, permissions."],["Deduplication","Removing repeated copies of the same content."],["Layout-aware parsing","Extraction that preserves headings, lists and tables."]],
  quiz:[
    {t:"mcq", q:"A scanned PDF returns no text at all. You need…", o:["OCR","A bigger model","Chunking","Reranking"], a:0},
    {t:"mcq", q:"Why store a last-updated date with every document?", o:["To filter to current policies and handle freshness","It makes embeddings better","The model requires it","It saves tokens"], a:0},
    {t:"mcq", q:"The same paragraph appears in 12 copies of a template. Risk?", o:["None","Duplicates crowd out other relevant results","It speeds search","Better citations"], a:1}
  ],
  lab:{
    task:"Write a cleaner for HTML pages.\n\n1. clean_html(html): remove <script>...<\/script> and <style>...</style> blocks entirely (any case, across lines), remove every other tag, convert entities like &amp; with html.unescape, collapse all whitespace to single spaces and strip.\n2. get_title(html): the text inside <title>...</title>, stripped, or \"\" if there isn't one.\n3. make_record(source, html): {\"id\": source, \"title\": the title or the source if there's no title, \"text\": clean_html(html), \"chars\": length of that text}.",
    starter:R`import re, html as htmllib

def clean_html(html):
    return html

def get_title(html):
    return ""

def make_record(source, html):
    return {}

page = "<html><head><title>PTO Policy</title><style>p{color:red}</style></head><body><p>New hires get <b>15</b> days &amp; more.</p><script>track()</scr" "ipt></body></html>"
print(make_record("pto.html", page))`,
    tests:R`page = """<html><head><title> PTO Policy </title><STYLE>p {color:red}</STYLE></head>
<body><nav>Home</nav><p>New hires get <b>15</b>
   days &amp; more.</p><script type="x">
track("visit")
</scr""" """ipt></body></html>"""
t = clean_html(page)
assert "track" not in t and "color" not in t, "Remove script and style contents too. Got: " + t
assert t == "PTO Policy Home New hires get 15 days & more.", "Got: " + repr(t)
assert get_title(page) == "PTO Policy", "Got: " + repr(get_title(page))
assert get_title("<p>no title</p>") == "", "No title gives an empty string"
r = make_record("pto.html", page)
assert r == {"id": "pto.html", "title": "PTO Policy", "text": t, "chars": len(t)}, "Got " + str(r)
assert make_record("x.html", "<p>Hi</p>")["title"] == "x.html", "Fall back to the source when there's no title"`,
    hint:"Use re.sub(r\"<(script|style)\\b.*?</\\1>\", \" \", html, flags=re.S | re.I) to drop those blocks, then re.sub(r\"<[^>]+>\", \" \", ...) for other tags, then htmllib.unescape, then re.sub(r\"\\s+\", \" \", ...).strip().",
    solution:R`import re, html as htmllib

def clean_html(html):
    t = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = htmllib.unescape(t)
    return re.sub(r"\s+", " ", t).strip()

def get_title(html):
    m = re.search(r"<title>(.*?)</title>", html, flags=re.S | re.I)
    return m.group(1).strip() if m else ""

def make_record(source, html):
    text = clean_html(html)
    return {"id": source, "title": get_title(html) or source, "text": text, "chars": len(text)}

page = "<html><head><title>PTO Policy</title><style>p{color:red}</style></head><body><p>New hires get <b>15</b> days &amp; more.</p><script>track()</scr" "ipt></body></html>"
print(make_record("pto.html", page))`,
    bonus:{
      task:"Bonus: write dedupe(records) that removes records whose text is the same as an earlier record's text, ignoring case and extra spaces. Keep the first copy and the original order.",
      tests:R`recs = [{"id": "a", "text": "PTO is 15 days"}, {"id": "b", "text": "pto  is 15 DAYS"}, {"id": "c", "text": "Remote work: 3 days"}, {"id": "d", "text": "PTO is 15 days"}]
assert [r["id"] for r in dedupe(recs)] == ["a", "c"], "Got " + str([r["id"] for r in dedupe(recs)])`,
      hint:"Keep a set of normalized keys: \" \".join(r[\"text\"].lower().split()).",
      solution:R`def dedupe(records):
    seen, out = set(), []
    for r in records:
        key = " ".join(r["text"].lower().split())
        if key not in seen:
            seen.add(key)
            out.append(r)
    return out`}}
},
{ id:"r03", act:1, title:"Chunking strategies", mins:40,
  hook:"The answer to \"Can I carry over PTO?\" sits right where your chunker cut the policy in half. One chunk has the question's words, the other has the answer, and neither is enough alone.",
  learn:[
    {h:"Why chunk at all", p:[
      "You retrieve chunks, not whole documents, so the prompt gets the specific passages that matter. Chunk size is a trade-off: small chunks are precise but may lose context; large chunks keep context but dilute relevance and waste tokens. A few hundred tokens per chunk is a common starting point, then tune with evals."]},
    {h:"Common strategies", p:[
      "Fixed-size with overlap: every N words, with the last M words repeated in the next chunk so ideas cut at a boundary appear whole in one of them. Structure-aware: split on paragraphs, headings or sentences, merging small pieces up to a size limit; this respects how humans wrote the document. Recursive splitting (popular in frameworks) tries big separators first (sections), then smaller ones (paragraphs, sentences) only when a piece is still too big. Semantic chunking splits where the topic changes, using embeddings."],
     code:R`words = text.split()
size, overlap = 200, 40
step = size - overlap
chunks = [" ".join(words[i:i + size]) for i in range(0, len(words), step)]`},
    {h:"Keep the chunk's identity", p:[
      "Every chunk should carry its document id, position and metadata so you can cite it, filter it and fetch neighbors. Lesson 14 goes further: adding the document title and section heading to each chunk makes retrieval noticeably better."]}
  ],
  mistakes:["Choosing a chunk size once and never testing it against real questions.","Splitting in the middle of sentences, tables or list items.","Overlap so large that most chunks are duplicates, wasting storage and crowding results."],
  ai:"Chunking is one of the biggest and cheapest levers on RAG quality. Changing it usually matters more than changing the embedding model.",
  interview:{q:"How do you choose a chunk size?", a:"Start from the content's structure (paragraphs or sections) with a size of a few hundred tokens and modest overlap, then measure with a retrieval eval set: recall at k for real questions. Try a smaller and a larger size and keep what scores best. Different document types can use different strategies."},
  terms:[["Chunk","A piece of a document that's indexed and retrieved on its own."],["Chunk overlap","Words repeated between neighboring chunks so boundaries don't lose meaning."],["Recursive splitting","Splitting by large separators first, then smaller ones only when needed."],["Semantic chunking","Splitting where the topic changes."],["Structure-aware chunking","Splitting on headings, paragraphs or sentences."]],
  quiz:[
    {t:"mcq", q:"Chunks are huge (5,000 words). Likely effect?", o:["Sharper retrieval","Diluted relevance and wasted tokens","Better citations","No effect"], a:1},
    {t:"mcq", q:"What does overlap protect against?", o:["Losing an idea that's cut at a chunk boundary","Slow embeddings","Duplicate documents","Prompt injection"], a:0},
    {t:"fill", q:"With size 100 and overlap 20, how many new words does each chunk start after the previous start?", a:["80"]}
  ],
  lab:{
    task:"Write two chunkers.\n\n1. chunk_words(text, size, overlap): raise ValueError if overlap >= size. Take words[i:i + size] starting at i = 0 and moving forward by size - overlap each time. Stop after the chunk that reaches the end of the text, so there's no tiny trailing chunk that's already covered. Return a list of strings (words joined by spaces). Empty text gives [].\n2. chunk_paragraphs(text, max_words): split into paragraphs on blank lines. Merge consecutive paragraphs into one chunk while the total word count stays at most max_words; join merged paragraphs with a blank line (\"\\n\\n\"). A paragraph longer than max_words becomes a chunk by itself.",
    starter:R`import re

def chunk_words(text, size, overlap):
    return []

def chunk_paragraphs(text, max_words):
    return []

print(chunk_words("a b c d e f g", 3, 1))`,
    tests:R`assert chunk_words("a b c d e f g", 3, 1) == ["a b c", "c d e", "e f g"], "Got " + str(chunk_words("a b c d e f g", 3, 1))
assert chunk_words("a b c d e f g h", 3, 1) == ["a b c", "c d e", "e f g", "g h"], "Got " + str(chunk_words("a b c d e f g h", 3, 1))
assert chunk_words("a b", 5, 2) == ["a b"], "Short text is one chunk"
assert chunk_words("", 5, 2) == [], "Empty text gives []"
try:
    chunk_words("a b c", 3, 3); ok = False
except ValueError:
    ok = True
assert ok, "overlap >= size should raise ValueError"
text = "PTO is 15 days.\n\nIt accrues monthly.\n\n  \n\nUnused PTO carries over up to five days each year into January."
assert chunk_paragraphs(text, 8) == ["PTO is 15 days.\n\nIt accrues monthly.", "Unused PTO carries over up to five days each year into January."], "Got " + str(chunk_paragraphs(text, 8))
assert chunk_paragraphs(text, 100) == ["PTO is 15 days.\n\nIt accrues monthly.\n\nUnused PTO carries over up to five days each year into January."], "Everything fits in one chunk"`,
    hint:"chunk_words: loop with i = 0; append; if i + size >= len(words): break; i += size - overlap. chunk_paragraphs: paras = [p.strip() for p in re.split(r\"\\n\\s*\\n\", text) if p.strip()], then keep a current list and its word count.",
    solution:R`import re

def chunk_words(text, size, overlap):
    if overlap >= size:
        raise ValueError("overlap must be smaller than size")
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        chunks.append(" ".join(words[i:i + size]))
        if i + size >= len(words):
            break
        i += size - overlap
    return chunks

def chunk_paragraphs(text, max_words):
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks, cur, count = [], [], 0
    for p in paras:
        n = len(p.split())
        if cur and count + n > max_words:
            chunks.append("\n\n".join(cur))
            cur, count = [], 0
        cur.append(p)
        count += n
    if cur:
        chunks.append("\n\n".join(cur))
    return chunks

print(chunk_words("a b c d e f g", 3, 1))`,
    bonus:{
      task:"Bonus: write chunk_sentences(text, max_words). Split into sentences after ., ! or ? followed by whitespace, then pack consecutive sentences into chunks (joined by a single space) while the word count stays at most max_words. A single long sentence becomes its own chunk.",
      tests:R`t = "PTO is 15 days. It accrues monthly! Can it carry over? Yes, up to five days."
assert chunk_sentences(t, 9) == ["PTO is 15 days. It accrues monthly!", "Can it carry over? Yes, up to five days."], "Got " + str(chunk_sentences(t, 9))
assert chunk_sentences("One long sentence with many many words here.", 3) == ["One long sentence with many many words here."], "Long sentences stay whole"`,
      hint:"sentences = re.split(r\"(?<=[.!?])\\s+\", text.strip()), then use the same packing loop as chunk_paragraphs with \" \" as the joiner.",
      solution:R`def chunk_sentences(text, max_words):
    sents = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]
    chunks, cur, count = [], [], 0
    for s in sents:
        n = len(s.split())
        if cur and count + n > max_words:
            chunks.append(" ".join(cur))
            cur, count = [], 0
        cur.append(s)
        count += n
    if cur:
        chunks.append(" ".join(cur))
    return chunks`}}
},
{ id:"r04", act:1, title:"Text as numbers: bag of words and TF-IDF", mins:40,
  hook:"Search engines ranked web pages decades before neural embeddings existed. The core idea, words that are rare across documents but frequent in this one matter most, still powers search today.",
  learn:[
    {h:"Bag of words", p:[
      "Turn text into a list of words, drop very common words (stopwords like \"the\" and \"is\"), and count them. Word order is ignored, hence \"bag\". Two texts are similar if they share many of the same words."]},
    {h:"TF-IDF", p:[
      "Term frequency (TF): how often a word appears in this document, divided by the document's length. Inverse document frequency (IDF): log(N / df), where N is the number of documents and df is how many contain the word. A word in every document gets IDF 0 (no information); a rare word gets a high IDF. TF × IDF gives each word a weight, and each document becomes a sparse vector of weights."],
     code:R`import math
N = 1000                      # documents
df_pto, df_policy = 12, 900   # how many contain each word
print(round(math.log(N / df_pto), 2))     # 4.42  rare, informative
print(round(math.log(N / df_policy), 2))  # 0.11  common, weak`},
    {h:"Sparse vs dense", p:[
      "TF-IDF vectors are sparse: one slot per vocabulary word, mostly zeros. They're great at exact terms (employee IDs, error codes, product names) but blind to synonyms: \"vacation\" won't match \"paid time off\". Dense embeddings (next lesson) capture meaning. Modern systems use both (lesson 9)."]}
  ],
  mistakes:["Forgetting to lowercase and normalize, so PTO and pto are different words.","Removing stopwords that matter in your domain, like \"not\" in policies.","Expecting keyword methods to understand synonyms."],
  ai:"TF-IDF's ideas live on in BM25, the keyword half of almost every production hybrid search system.",
  interview:{q:"Why does IDF use a logarithm?", a:"So weights grow slowly: a word in 1 of 1,000 documents is more informative than one in 10, but not 100 times more. The log dampens extreme values and a word that appears everywhere gets weight near zero."},
  terms:[["Stopword","A very common word usually ignored in search, like the or is."],["Term frequency (TF)","How often a word appears in a document, relative to its length."],["Document frequency (df)","How many documents contain a word."],["IDF","Inverse document frequency: log(N / df), high for rare words."],["TF-IDF","A word weight: term frequency times inverse document frequency."],["Sparse vector","A vector with one slot per vocabulary word, mostly zeros."]],
  quiz:[
    {t:"mcq", q:"A word appears in every document. Its IDF is…", o:["Very high","0","1","Negative infinity"], a:1, x:"log(N / N) = log(1) = 0."},
    {t:"mcq", q:"Which query does keyword search handle better than embeddings?", o:["Error code E-4471","\"How do I take time off?\" matched to \"vacation\"","Paraphrased questions","Questions in another language"], a:0},
    {t:"mcq", q:"TF-IDF vectors are…", o:["Dense","Sparse","Always length 1","Binary"], a:1}
  ],
  lab:{
    task:"Implement TF-IDF.\n\n1. tokens(text): lowercase letter/digit words, excluding STOP words.\n2. idf(docs): docs is a list of texts. Return {term: math.log(N / df)} for every term in any doc.\n3. tfidf(text, idf_map): for each term in tokens(text), weight = (count / number of tokens) × idf_map.get(term, 0). Return {term: weight} for weights above 0. Empty text gives {}.",
    starter:R`import re, math

STOP = {"the", "a", "an", "is", "of", "to", "and", "in", "for", "on", "per", "get", "do"}

def tokens(text):
    return []

def idf(docs):
    return {}

def tfidf(text, idf_map):
    return {}

DOCS = ["New hires get 15 PTO days per year.", "PTO accrues monthly.", "Health insurance starts on day one."]
print(tfidf(DOCS[0], idf(DOCS)))`,
    tests:R`DOCS = ["New hires get 15 PTO days per year.", "PTO accrues monthly.", "Health insurance starts on day one."]
assert tokens("The PTO is 15 days!") == ["pto", "15", "days"], "Got " + str(tokens("The PTO is 15 days!"))
I = idf(DOCS)
assert abs(I["pto"] - math.log(3 / 2)) < 1e-9, "pto is in 2 of 3 docs"
assert abs(I["insurance"] - math.log(3)) < 1e-9, "insurance is in 1 of 3 docs"
assert "the" not in I, "Stopwords shouldn't appear"
v = tfidf("PTO PTO insurance", I)
assert abs(v["pto"] - 2/3 * math.log(1.5)) < 1e-9 and abs(v["insurance"] - 1/3 * math.log(3)) < 1e-9, "Got " + str(v)
assert tfidf("unknownword", I) == {}, "Terms with no IDF get weight 0 and are left out"
assert tfidf("", I) == {}, "Empty text gives {}"`,
    hint:"idf: count df with a dict, adding 1 per doc for each term in set(tokens(doc)). tfidf: toks = tokens(text); use collections.Counter(toks); weight = c / len(toks) * idf_map.get(t, 0).",
    solution:R`import re, math
from collections import Counter

STOP = {"the", "a", "an", "is", "of", "to", "and", "in", "for", "on", "per", "get", "do"}

def tokens(text):
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP]

def idf(docs):
    df = Counter()
    for d in docs:
        df.update(set(tokens(d)))
    n = len(docs)
    return {t: math.log(n / c) for t, c in df.items()}

def tfidf(text, idf_map):
    toks = tokens(text)
    if not toks:
        return {}
    out = {}
    for t, c in Counter(toks).items():
        w = c / len(toks) * idf_map.get(t, 0)
        if w > 0:
            out[t] = w
    return out

DOCS = ["New hires get 15 PTO days per year.", "PTO accrues monthly.", "Health insurance starts on day one."]
print(tfidf(DOCS[0], idf(DOCS)))`,
    bonus:{
      task:"Bonus: write search(query, docs, k) that ranks documents by cosine similarity between TF-IDF vectors (dicts). Return the indexes of the top k docs with similarity above 0, best first.",
      tests:R`DOCS = ["New hires get 15 PTO days per year.", "PTO accrues monthly.", "Health insurance starts on day one."]
assert search("when does insurance start", DOCS, 2) == [2], "Got " + str(search("when does insurance start", DOCS, 2))
assert search("pto days for new hires", DOCS, 3) == [0, 1], "Got " + str(search("pto days for new hires", DOCS, 3))`,
      hint:"Sparse cosine: dot = sum(a[t] * b.get(t, 0) for t in a); norms with math.sqrt(sum(v * v for v in a.values())). Guard against zero norms.",
      solution:R`def search(query, docs, k):
    I = idf(docs)
    q = tfidf(query, I)
    def cos(a, b):
        dot = sum(v * b.get(t, 0) for t, v in a.items())
        na = math.sqrt(sum(v * v for v in a.values()))
        nb = math.sqrt(sum(v * v for v in b.values()))
        return dot / (na * nb) if na and nb else 0.0
    scores = [(cos(q, tfidf(d, I)), i) for i, d in enumerate(docs)]
    return [i for s, i in sorted(scores, key=lambda x: -x[0]) if s > 0][:k]`}}
},
{ id:"r05", act:1, title:"Embeddings: meaning as vectors", mins:40,
  hook:"An employee asks \"Can I take time off for my wedding?\" The policy says \"leave for personal events\". Not one word matches, yet a good search should find it. That's what embeddings are for.",
  learn:[
    {h:"Dense embeddings", p:[
      "An embedding model turns text into a fixed-length list of numbers (a dense vector, often 256 to 3,072 dimensions) trained so that texts with similar meaning get nearby vectors. Search becomes geometry: embed the question, find the closest chunk vectors."]},
    {h:"Choosing and using embedding models", p:[
      "Options include hosted APIs (Voyage AI, which Anthropic points developers to, plus OpenAI, Cohere and Google) and open-source models you can run yourself (sentence-transformers families like BGE and E5). Compare them on your own eval set, not on leaderboards alone. Consider domain fit, languages, dimensions (storage cost), speed and price.",
      "Rules that always apply: embed queries and documents with the same model (vectors from different models aren't comparable); some models expect different input types for queries and documents; normalize vectors when using cosine similarity; embed in batches; cache embeddings, and re-embed everything if you switch models."],
     code:R`import voyageai
vo = voyageai.Client()                        # reads VOYAGE_API_KEY
# check the docs for current model names
docs = vo.embed(chunks, model="voyage-3.5", input_type="document").embeddings
q = vo.embed([question], model="voyage-3.5", input_type="query").embeddings[0]`},
    {h:"What this lab builds", p:[
      "Real embedding models need a download or API key, so the lab builds a toy embedding with the hashing trick: each word is hashed into one of N slots with a +1 or −1 sign, then the vector is normalized. It captures word overlap, not true meaning, but it has exactly the same interface and math as the real thing: text in, fixed-length unit vector out, cosine to compare."]}
  ],
  mistakes:["Embedding queries with one model and documents with another.","Forgetting to re-embed the whole index after switching models.","Embedding the same text repeatedly instead of caching."],
  ai:"Embeddings are the foundation of semantic search, recommendations, clustering and deduplication, not just RAG.",
  interview:{q:"Your team wants to switch embedding models. What has to happen?", a:"Re-embed every chunk with the new model (old and new vectors aren't comparable), rebuild the index, and compare both models on the retrieval eval set before switching traffic. Plan for the cost and time of the re-embed."},
  terms:[["Embedding","A dense vector representing the meaning of text."],["Embedding model","A model that turns text into embeddings."],["Dimensions","The length of an embedding vector."],["Normalization","Scaling a vector to length 1."],["Hashing trick","Mapping words to vector slots with a hash function instead of a vocabulary."],["Embedding cache","Stored embeddings so the same text isn't embedded twice."]],
  quiz:[
    {t:"mcq", q:"Queries embedded with model A, documents with model B. Result?", o:["Works fine","Similarities are meaningless: vectors aren't comparable","Faster search","Better recall"], a:1},
    {t:"mcq", q:"What do embeddings capture that TF-IDF misses?", o:["Exact IDs","Similar meaning with different words","Word counts","Document length"], a:1},
    {t:"mcq", q:"After normalization, cosine similarity equals…", o:["The dot product","The sum of both vectors","The distance squared","Zero"], a:0}
  ],
  lab:{
    task:"Build a toy embedding model with the hashing trick. stable_hash is provided (Python's built-in hash changes between runs, so we can't use it).\n\n1. embed(text, dim=16): start with dim zeros. For each word (lowercase letters/digits), h = stable_hash(word), slot = h % dim, sign = +1 if (h // dim) % 2 == 0 else −1; add sign to that slot. Then normalize to length 1. If the vector is all zeros, return it unchanged.\n2. cosine(a, b): dot product divided by the product of lengths; 0.0 if either length is 0.\n3. most_similar(query, texts, dim=16): the index of the text whose embedding is most similar to the query's.",
    starter:R`import re, math

def stable_hash(word):
    h = 0
    for ch in word:
        h = (h * 31 + ord(ch)) % (2 ** 32)
    return h

def embed(text, dim=16):
    return [0.0] * dim

def cosine(a, b):
    return 0.0

def most_similar(query, texts, dim=16):
    return 0

print(embed("PTO days"))`,
    tests:R`v = embed("PTO days for new hires")
assert len(v) == 16, "Vector should have dim slots"
assert abs(math.sqrt(sum(x * x for x in v)) - 1) < 1e-9, "Normalize to length 1"
assert embed("", 8) == [0.0] * 8, "Empty text stays all zeros"
assert abs(cosine(embed("pto days"), embed("DAYS pto")) - 1) < 1e-9, "Same words in any order and case give cosine 1"
assert cosine([0, 0], [1, 2]) == 0.0, "Zero vectors give 0.0"
h = stable_hash("pto"); raw = [0.0] * 16; raw[h % 16] += 1 if (h // 16) % 2 == 0 else -1
assert all(abs(a - b) < 1e-9 for a, b in zip(embed("pto"), raw)), "Check the slot and sign rule"
texts = ["health insurance starts day one", "new hires get 15 pto days", "remote work three days"]
assert most_similar("how many pto days do new hires get", texts, 64) == 1, "Expected index 1"`,
    hint:"embed: for w in re.findall(r\"[a-z0-9]+\", text.lower()): h = stable_hash(w); vec[h % dim] += 1 if (h // dim) % 2 == 0 else -1. Then n = math.sqrt(sum(x * x for x in vec)); return [x / n for x in vec] if n else vec.",
    solution:R`import re, math

def stable_hash(word):
    h = 0
    for ch in word:
        h = (h * 31 + ord(ch)) % (2 ** 32)
    return h

def embed(text, dim=16):
    vec = [0.0] * dim
    for w in re.findall(r"[a-z0-9]+", text.lower()):
        h = stable_hash(w)
        vec[h % dim] += 1 if (h // dim) % 2 == 0 else -1
    n = math.sqrt(sum(x * x for x in vec))
    return [x / n for x in vec] if n else vec

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

def most_similar(query, texts, dim=16):
    q = embed(query, dim)
    scores = [cosine(q, embed(t, dim)) for t in texts]
    return max(range(len(texts)), key=lambda i: scores[i])

print(embed("PTO days"))`,
    bonus:{
      task:"Bonus: embedding calls cost money. Write a class CachedEmbedder(dim) with embed(text) that returns embed(text, dim) but only computes each distinct text once, and a calls attribute counting real computations.",
      tests:R`c = CachedEmbedder(16)
a = c.embed("pto days"); b = c.embed("pto days"); c.embed("remote work")
assert a == b and c.calls == 2, "Cache repeated texts. calls = " + str(c.calls)`,
      hint:"Store results in self.cache = {}; on a miss, increment self.calls and compute.",
      solution:R`class CachedEmbedder:
    def __init__(self, dim):
        self.dim, self.cache, self.calls = dim, {}, 0
    def embed(self, text):
        if text not in self.cache:
            self.calls += 1
            self.cache[text] = embed(text, self.dim)
        return self.cache[text]`}}
},
/* ---------------- ACT 2 ---------------- */
{ id:"r06", act:2, title:"Vector search and vector databases", mins:35,
  hook:"Your prototype compares the question with every chunk, one by one. At 5,000 chunks it's instant. At 50 million it takes minutes. Time to understand vector indexes.",
  learn:[
    {h:"Exact (brute-force) search", p:[
      "Compute similarity between the query and every vector, and keep the top k. It's perfectly accurate and fine up to tens or hundreds of thousands of vectors, especially with NumPy. It's the right starting point for most projects."]},
    {h:"Approximate nearest neighbor (ANN)", p:[
      "For millions of vectors, ANN indexes trade a tiny bit of accuracy for huge speed. HNSW builds a layered graph of neighbors and walks it toward the query. IVF clusters vectors and only searches the closest clusters. Product quantization compresses vectors to save memory. Settings trade recall against speed, so measure recall after tuning."]},
    {h:"What a vector database adds", p:[
      "Storage and persistence, ANN indexes, metadata filtering, updates and deletes, replication and access control. Popular choices: FAISS (a library, not a database), Chroma (easy local start), pgvector (vectors inside PostgreSQL, great if you already run Postgres), Pinecone, Weaviate, Qdrant and Milvus (dedicated services). Many teams start with pgvector or Chroma and only move when scale demands it."],
     code:R`import chromadb
client = chromadb.Client()
col = client.create_collection("handbook")
col.add(ids=["pto#0"], documents=["New hires get 15 PTO days."],
        metadatas=[{"dept": "HR", "year": 2025}])
hits = col.query(query_texts=["vacation for new staff"], n_results=3)`}
  ],
  mistakes:["Adding a dedicated vector database before you have a retrieval problem it solves.","Tuning ANN for speed and never checking that recall dropped.","Storing vectors without the chunk text and metadata you need for citations."],
  ai:"Vector search is infrastructure every AI engineer should understand well enough to choose, size and debug.",
  interview:{q:"When is brute-force vector search good enough?", a:"When the collection is small to medium (up to roughly hundreds of thousands of vectors) and latency targets are met. It's exact, simple and has nothing to tune. Move to ANN when latency or cost at your scale requires it, and verify recall on your eval set after the switch."},
  terms:[["Vector index","A structure that makes finding similar vectors fast."],["Brute-force search","Comparing the query with every vector; exact but slow at scale."],["ANN","Approximate nearest neighbor: fast, nearly exact vector search."],["HNSW","A graph-based ANN index widely used by vector databases."],["Vector database","A database built to store and search vectors with metadata."],["pgvector","A PostgreSQL extension that adds vector search."]],
  quiz:[
    {t:"mcq", q:"You have 20,000 chunks and already run PostgreSQL. Sensible choice?", o:["A new dedicated vector cluster","pgvector, or even brute-force search","No search at all","A graph database"], a:1},
    {t:"mcq", q:"What do ANN indexes trade away for speed?", o:["A little recall accuracy","All metadata","The ability to update","Security"], a:0},
    {t:"mcq", q:"FAISS is best described as…", o:["A full managed database","A library for fast vector search","An embedding model","A reranker"], a:1}
  ],
  lab:{
    task:"Build a small in-memory vector index.\n\nclass VectorIndex(dim):\n  add(id, vector, text): store it. Raise ValueError if len(vector) != dim.\n  search(query, k=3): cosine similarity against every stored vector. Return a list of (id, score rounded to 4) for the top k, best first. Ties keep insertion order.\n  __len__: the number of stored items.\n  get_text(id): the stored text.",
    starter:R`import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

class VectorIndex:
    def __init__(self, dim):
        self.dim = dim

idx = VectorIndex(3)`,
    tests:R`idx = VectorIndex(3)
idx.add("pto", [1, 0, 0], "PTO policy")
idx.add("benefits", [0, 1, 0], "Benefits guide")
idx.add("mixed", [1, 1, 0], "PTO and benefits FAQ")
assert len(idx) == 3, "__len__ should count items"
assert idx.search([1, 0, 0], k=2) == [("pto", 1.0), ("mixed", 0.7071)], "Got " + str(idx.search([1, 0, 0], k=2))
assert idx.search([0, 0, 1], k=3) == [("pto", 0.0), ("benefits", 0.0), ("mixed", 0.0)], "Ties keep insertion order"
assert idx.get_text("mixed") == "PTO and benefits FAQ"
try:
    idx.add("bad", [1, 2], "x"); ok = False
except ValueError:
    ok = True
assert ok, "Wrong dimensions should raise ValueError"`,
    hint:"Store items in a list of (id, vector, text) to keep order, plus a dict for get_text. search: scored = [(id, round(cosine(query, v), 4)) for id, v, t in self.items]; return sorted(scored, key=lambda x: -x[1])[:k].",
    solution:R`import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

class VectorIndex:
    def __init__(self, dim):
        self.dim = dim
        self.items = []
        self.texts = {}
    def add(self, id, vector, text):
        if len(vector) != self.dim:
            raise ValueError("expected dimension " + str(self.dim))
        self.items.append((id, vector, text))
        self.texts[id] = text
    def search(self, query, k=3):
        scored = [(i, round(cosine(query, v), 4)) for i, v, t in self.items]
        return sorted(scored, key=lambda x: -x[1])[:k]
    def __len__(self):
        return len(self.items)
    def get_text(self, id):
        return self.texts[id]

idx = VectorIndex(3)`,
    bonus:{
      task:"Bonus: real indexes must handle changes. Add delete(id) (remove the item; raise KeyError if missing) and upsert(id, vector, text) (replace an existing id in place, keeping its position, or add it if new).",
      tests:R`ix = VectorIndex(2)
ix.add("a", [1, 0], "A"); ix.add("b", [0, 1], "B")
ix.upsert("a", [0, 1], "A2")
assert ix.search([0, 1], k=2) == [("a", 1.0), ("b", 1.0)] and ix.get_text("a") == "A2", "upsert should replace in place"
ix.upsert("c", [1, 0], "C")
assert len(ix) == 3, "upsert adds new ids"
ix.delete("b")
assert len(ix) == 2 and [i for i, s in ix.search([1, 1], k=5)] == ["a", "c"], "delete should remove b"
try:
    ix.delete("zzz"); ok = False
except KeyError:
    ok = True
assert ok, "Deleting a missing id should raise KeyError"`,
      hint:"Find the position with next((n for n, it in enumerate(self.items) if it[0] == id), None).",
      solution:R`def _pos(self, id):
    return next((n for n, it in enumerate(self.items) if it[0] == id), None)

def delete(self, id):
    n = self._pos(id)
    if n is None:
        raise KeyError(id)
    self.items.pop(n)
    del self.texts[id]

def upsert(self, id, vector, text):
    n = self._pos(id)
    if n is None:
        self.add(id, vector, text)
    else:
        self.items[n] = (id, vector, text)
        self.texts[id] = text

VectorIndex._pos, VectorIndex.delete, VectorIndex.upsert = _pos, delete, upsert`}}
},
{ id:"r07", act:2, title:"Metadata filters and access control", mins:35,
  hook:"An intern asks the HR assistant about \"executive compensation\" and gets the confidential board memo, with a helpful citation. Retrieval quality was perfect. Security wasn't.",
  learn:[
    {h:"Filters narrow the search", p:[
      "Metadata filters restrict retrieval to chunks that match conditions: department is HR, year is 2025 or later, region is US, document type is policy. They improve precision (no outdated or irrelevant content) and let users scope questions. Most vector databases support filters natively."]},
    {h:"Pre-filtering vs post-filtering", p:[
      "Pre-filtering applies the filter first, then searches only matching chunks. Post-filtering searches everything and removes non-matching results afterward, which can leave you with too few or zero results if the top hits were filtered out. Prefer pre-filtering, especially for permissions."]},
    {h:"Permissions belong in retrieval", p:[
      "Store who may see each chunk (groups or roles copied from the source system) and filter by the current user's groups before anything reaches the prompt. Never rely on the model to \"not mention\" restricted content: once it's in the context, it can leak. This is often called security trimming, and it's non-negotiable for enterprise RAG, especially over HR, payroll and legal data."],
     code:R`hits = collection.query(
    query_texts=[question], n_results=5,
    where={"$and": [{"dept": "HR"}, {"year": {"$gte": 2025}}]})`}
  ],
  mistakes:["Filtering permissions after generation, or asking the model to hide restricted content.","Post-filtering so aggressively that nothing relevant remains.","Letting permission metadata go stale when access changes in the source system."],
  ai:"Access control is usually the deciding factor in whether an enterprise approves a RAG deployment over sensitive data.",
  interview:{q:"How do you prevent a RAG system from leaking documents a user can't access?", a:"Enforce permissions at retrieval time: store access metadata on every chunk, sync it from the source system, and pre-filter by the user's identity and groups so restricted chunks never enter the prompt. Log retrievals for audit, and test with users of different roles."},
  terms:[["Metadata filter","A condition that restricts which chunks can be retrieved."],["Pre-filtering","Applying filters before similarity search."],["Post-filtering","Removing results after search, which can leave too few."],["Security trimming","Removing content a user isn't allowed to see before it's used."],["Access control list (ACL)","The groups or people allowed to see an item."]],
  quiz:[
    {t:"mcq", q:"Where should permission checks happen in RAG?", o:["In the system prompt","At retrieval, before chunks reach the prompt","After the answer is shown","Nowhere; users are trusted"], a:1},
    {t:"mcq", q:"Post-filtering returned zero results even though matching docs exist. Why?", o:["The top results were all filtered out","Embeddings failed","The API key expired","Chunks are too small"], a:0},
    {t:"mcq", q:"A user asks only about current policies. Best tool?", o:["A year or date metadata filter","A higher temperature","Longer chunks","A bigger model"], a:0}
  ],
  lab:{
    task:"Build filtered, permission-aware search. Chunks are dicts with \"id\", \"text\", \"dept\", \"year\" and \"groups\" (a list).\n\n1. can_see(chunk, user_groups): True if the chunk's groups include \"everyone\" or share any group with user_groups.\n2. matches(chunk, filters): every key in filters must match. If the filter value is a list, the chunk's value must be in it; otherwise it must be equal. A missing key in the chunk means no match.\n3. filtered_search(query, chunks, user_groups, filters, score, k=3): pre-filter by can_see and matches, then rank by score(query, text), highest first. Return the ids of the top k with score above 0.",
    starter:R`def can_see(chunk, user_groups):
    return True

def matches(chunk, filters):
    return True

def filtered_search(query, chunks, user_groups, filters, score, k=3):
    return []

def overlap_score(q, t):
    return len(set(q.lower().split()) & set(t.lower().split()))`,
    tests:R`def overlap_score(q, t):
    return len(set(q.lower().split()) & set(t.lower().split()))
C = [
  {"id": "pto24", "text": "pto policy 12 days", "dept": "HR", "year": 2024, "groups": ["everyone"]},
  {"id": "pto25", "text": "pto policy 15 days", "dept": "HR", "year": 2025, "groups": ["everyone"]},
  {"id": "exec", "text": "executive pto and pay policy", "dept": "HR", "year": 2025, "groups": ["hr-leaders"]},
  {"id": "it", "text": "laptop policy", "dept": "IT", "year": 2025, "groups": ["everyone"]},
]
assert can_see(C[0], []) is True and can_see(C[2], ["staff"]) is False and can_see(C[2], ["staff", "hr-leaders"]) is True
assert matches(C[1], {"dept": "HR", "year": [2025, 2026]}) and not matches(C[0], {"year": [2025]})
assert not matches(C[0], {"region": "US"}), "A missing key means no match"
r = filtered_search("pto policy", C, ["staff"], {}, overlap_score)
assert r == ["pto24", "pto25", "it"], "Staff must never see exec. Got " + str(r)
r = filtered_search("pto policy", C, ["hr-leaders"], {"year": 2025}, overlap_score)
assert r == ["pto25", "exec", "it"], "Got " + str(r)
assert filtered_search("pto", C, ["staff"], {"dept": "IT"}, overlap_score) == [], "Only scores above 0"`,
    hint:"can_see: \"everyone\" in chunk[\"groups\"] or bool(set(chunk[\"groups\"]) & set(user_groups)). matches: loop filters; if key not in chunk: return False; check isinstance(value, list). Then filter, score, sort and slice.",
    solution:R`def can_see(chunk, user_groups):
    return "everyone" in chunk["groups"] or bool(set(chunk["groups"]) & set(user_groups))

def matches(chunk, filters):
    for key, value in filters.items():
        if key not in chunk:
            return False
        if isinstance(value, list):
            if chunk[key] not in value:
                return False
        elif chunk[key] != value:
            return False
    return True

def filtered_search(query, chunks, user_groups, filters, score, k=3):
    pool = [c for c in chunks if can_see(c, user_groups) and matches(c, filters)]
    scored = [(score(query, c["text"]), c["id"]) for c in pool]
    return [i for s, i in sorted(scored, key=lambda x: -x[0]) if s > 0][:k]

def overlap_score(q, t):
    return len(set(q.lower().split()) & set(t.lower().split()))`,
    bonus:{
      task:"Bonus: support range filters. A filter value can be a dict with \"gte\" and/or \"lte\", like {\"year\": {\"gte\": 2025}}. Update matches so ranges work alongside equality and lists.",
      tests:R`c = {"id": "x", "year": 2025, "dept": "HR"}
assert matches(c, {"year": {"gte": 2025}}) and matches(c, {"year": {"gte": 2020, "lte": 2025}})
assert not matches(c, {"year": {"gte": 2026}}) and not matches(c, {"year": {"lte": 2024}})
assert matches(c, {"dept": ["HR", "IT"], "year": {"lte": 2030}}), "Mixed filters should work"`,
      hint:"Inside the loop: if isinstance(value, dict): check \"gte\" in value and chunk[key] < value[\"gte\"] means no match; same for lte.",
      solution:R`def matches(chunk, filters):
    for key, value in filters.items():
        if key not in chunk:
            return False
        v = chunk[key]
        if isinstance(value, dict):
            if "gte" in value and v < value["gte"]:
                return False
            if "lte" in value and v > value["lte"]:
                return False
        elif isinstance(value, list):
            if v not in value:
                return False
        elif v != value:
            return False
    return True`}}
},
{ id:"r08", act:2, title:"Keyword search done right: BM25", mins:40,
  hook:"A user searches for error code \"WD-4417\". Semantic search returns chunks about errors in general. Only exact keyword matching finds the one page that mentions that code.",
  learn:[
    {h:"BM25 improves on TF-IDF", p:[
      "BM25 (Best Matching 25) is the standard keyword ranking in search engines like Elasticsearch and OpenSearch. Two improvements over raw TF-IDF: term frequency saturates (the 10th mention of a word adds much less than the 1st), and long documents are penalized a little so they don't win just by containing more words."]},
    {h:"The formula, piece by piece", p:[
      "For each query term: IDF × (tf × (k1 + 1)) / (tf + k1 × (1 − b + b × doc_length / average_length)). IDF here is ln((N − df + 0.5) / (df + 0.5) + 1). k1 (typically 1.2 to 2.0) controls how fast term frequency saturates. b (typically 0.75) controls the length penalty: b = 0 ignores length, b = 1 fully normalizes it. The document's score is the sum over query terms."],
     code:R`from rank_bm25 import BM25Okapi
bm25 = BM25Okapi([doc.lower().split() for doc in docs])
scores = bm25.get_scores("error wd-4417".split())`},
    {h:"When keywords beat meaning", p:[
      "Exact identifiers (codes, SKUs, employee IDs), names, acronyms, rare jargon and quoted phrases. Embeddings can blur these into \"something similar\". That's why production systems combine both (next lesson)."]}
  ],
  mistakes:["Relying only on embeddings, then failing every query with an ID or error code.","Tokenizing documents and queries differently.","Leaving k1 and b at defaults without checking them on your data."],
  ai:"BM25 is decades old and still in almost every serious retrieval stack, which makes it one of the best-value algorithms you can learn.",
  interview:{q:"What do k1 and b control in BM25?", a:"k1 controls term-frequency saturation: higher k1 lets repeated terms keep adding score for longer. b controls document-length normalization: b = 0 ignores length and b = 1 fully normalizes, so long documents don't win just by being long."},
  terms:[["BM25","A keyword ranking function with saturating term frequency and length normalization."],["k1","The BM25 parameter controlling term-frequency saturation."],["b","The BM25 parameter controlling document-length normalization."],["Saturation","Diminishing returns from repeating the same word."],["Lexical search","Search based on matching the actual words."]],
  quiz:[
    {t:"mcq", q:"Which query most needs keyword search?", o:["\"How do I request time off?\"","\"Employee EMP-20931 payroll error\"","\"What's the vibe of our culture?\"","\"Explain benefits simply\""], a:1},
    {t:"mcq", q:"In BM25, setting b = 0 means…", o:["Document length is ignored","Term frequency is ignored","IDF is ignored","All scores are 0"], a:0},
    {t:"mcq", q:"Why does BM25 saturate term frequency?", o:["So stuffing a word many times doesn't dominate the score","To save memory","To handle synonyms","It doesn't"], a:0}
  ],
  lab:{
    task:"Implement BM25. docs is a list of token lists.\n\nclass BM25(docs, k1=1.5, b=0.75):\n  Store N, each doc's length, the average length avgdl and document frequencies.\n  idf(term): math.log((N - df + 0.5) / (df + 0.5) + 1).\n  score(query_tokens, i): sum over query tokens of idf × tf × (k1 + 1) / (tf + k1 × (1 − b + b × len_i / avgdl)).\n  search(query_tokens, k=3): list of (index, score rounded to 4) for scores above 0, best first, ties by index.",
    starter:R`import math
from collections import Counter

class BM25:
    def __init__(self, docs, k1=1.5, b=0.75):
        self.docs = docs
        self.k1, self.b = k1, b

    def idf(self, term):
        return 0.0

    def score(self, query_tokens, i):
        return 0.0

    def search(self, query_tokens, k=3):
        return []

docs = [d.split() for d in ["pto days new hires", "error wd-4417 payroll sync failed", "payroll runs biweekly"]]
print(BM25(docs).search(["payroll", "error"]))`,
    tests:R`docs = [d.split() for d in ["pto days new hires", "error wd-4417 payroll sync failed", "payroll runs biweekly", "pto pto pto pto carryover"]]
bm = BM25(docs)
assert abs(bm.idf("payroll") - math.log((4 - 2 + 0.5) / (2 + 0.5) + 1)) < 1e-9, "Check the idf formula"
def ref(q, i, k1=1.5, b=0.75):
    N = len(docs); avg = sum(map(len, docs)) / N; s = 0.0
    for t in q:
        df = sum(1 for d in docs if t in d); tf = docs[i].count(t)
        if tf:
            s += math.log((N - df + 0.5) / (df + 0.5) + 1) * tf * (k1 + 1) / (tf + k1 * (1 - b + b * len(docs[i]) / avg))
    return s
for i in range(4):
    assert abs(bm.score(["pto", "payroll"], i) - ref(["pto", "payroll"], i)) < 1e-9, "score mismatch on doc " + str(i)
r = bm.search(["wd-4417"])
assert r == [(1, round(ref(["wd-4417"], 1), 4))], "Got " + str(r)
r = bm.search(["pto"], k=5)
assert [i for i, s in r] == [3, 0], "Repeated terms should rank higher, but saturate. Got " + str(r)
assert bm.search(["nothing"]) == [], "No matches gives []"
b0 = BM25(docs, b=0)
assert abs(b0.score(["payroll"], 1) - b0.score(["payroll"], 2)) < 1e-9, "With b=0, length doesn't matter"`,
    hint:"In __init__: self.N = len(docs); self.lens = [len(d) for d in docs]; self.avgdl = sum(self.lens) / self.N; self.df = Counter(t for d in docs for t in set(d)); self.tfs = [Counter(d) for d in docs].",
    solution:R`import math
from collections import Counter

class BM25:
    def __init__(self, docs, k1=1.5, b=0.75):
        self.docs = docs
        self.k1, self.b = k1, b
        self.N = len(docs)
        self.lens = [len(d) for d in docs]
        self.avgdl = sum(self.lens) / self.N if self.N else 0
        self.df = Counter(t for d in docs for t in set(d))
        self.tfs = [Counter(d) for d in docs]

    def idf(self, term):
        df = self.df.get(term, 0)
        return math.log((self.N - df + 0.5) / (df + 0.5) + 1)

    def score(self, query_tokens, i):
        s = 0.0
        for t in query_tokens:
            tf = self.tfs[i].get(t, 0)
            if tf:
                norm = self.k1 * (1 - self.b + self.b * self.lens[i] / self.avgdl)
                s += self.idf(t) * tf * (self.k1 + 1) / (tf + norm)
        return s

    def search(self, query_tokens, k=3):
        scored = [(i, round(self.score(query_tokens, i), 4)) for i in range(self.N)]
        return [x for x in sorted(scored, key=lambda x: -x[1]) if x[1] > 0][:k]

docs = [d.split() for d in ["pto days new hires", "error wd-4417 payroll sync failed", "payroll runs biweekly"]]
print(BM25(docs).search(["payroll", "error"]))`,
    bonus:{
      task:"Bonus: explainability. Add explain(query_tokens, i) to BM25 that returns {term: contribution rounded to 4} for each query term with a contribution above 0. The contributions should add up to the score.",
      tests:R`docs = [d.split() for d in ["pto days new hires", "error wd-4417 payroll sync failed"]]
bm = BM25(docs)
e = bm.explain(["payroll", "error", "pto"], 1)
assert set(e) == {"payroll", "error"}, "Only terms that contribute. Got " + str(e)
assert abs(sum(e.values()) - bm.score(["payroll", "error"], 1)) < 1e-3, "Contributions should sum to the score"`,
      hint:"Reuse score on one term at a time: {t: round(self.score([t], i), 4) for t in query_tokens if self.score([t], i) > 0}.",
      solution:R`def explain(self, query_tokens, i):
    out = {}
    for t in query_tokens:
        c = self.score([t], i)
        if c > 0:
            out[t] = round(c, 4)
    return out

BM25.explain = explain`}}
},
{ id:"r09", act:2, title:"Hybrid search and rank fusion", mins:35,
  hook:"Keyword search nails \"WD-4417\" but misses \"time off for my wedding\". Vector search is the opposite. Why choose? Run both and fuse the results.",
  learn:[
    {h:"Why hybrid wins", p:[
      "Keyword (BM25) and vector search fail on different queries, so combining them catches more relevant chunks than either alone. Hybrid search is now the default recommendation for production RAG, and most vector databases support it."]},
    {h:"Fusing rankings", p:[
      "Their scores aren't comparable (BM25 might score 12.7 while cosine is 0.83), so fusing raw scores is tricky. Reciprocal Rank Fusion (RRF) uses only positions: each result gets 1 / (k + rank) from each list it appears in, summed across lists, with k usually 60. Results ranked well by both methods rise to the top. It's simple, robust and needs no tuning to start."],
     code:R`# rank 1 in BM25 and rank 3 in vector search:
score = 1 / (60 + 1) + 1 / (60 + 3)     # 0.0164 + 0.0159 = 0.0323`},
    {h:"Weighting", p:[
      "If your eval shows one method matters more for your users (say, lots of ID lookups), weight its list more: weight × 1 / (k + rank). Alternatively, normalize scores to 0–1 and take a weighted sum. Always choose by measuring recall on real questions."]}
  ],
  mistakes:["Adding raw BM25 and cosine scores together as if they were on the same scale.","Retrieving only the top 3 from each method; fusion works best with a deeper pool (20 to 50 each).","Skipping evaluation, so nobody knows whether hybrid actually helped."],
  ai:"Hybrid retrieval plus reranking is the backbone of most high-quality RAG systems today.",
  interview:{q:"Why use reciprocal rank fusion instead of adding scores?", a:"Scores from BM25 and vector search live on different, unbounded scales, so adding them lets one method dominate unpredictably. RRF uses only ranks, which are comparable across methods, and rewards results that multiple methods agree on. It's robust without tuning."},
  terms:[["Hybrid search","Combining keyword and vector search results."],["Rank fusion","Merging several ranked lists into one."],["Reciprocal Rank Fusion (RRF)","Fusion using 1 / (k + rank) summed across lists."],["Retrieval pool","The number of candidates fetched before fusion or reranking."],["Score normalization","Rescaling scores to a common range before combining."]],
  quiz:[
    {t:"mcq", q:"A result is rank 1 in both lists (k = 60). Its RRF score is about…", o:["2","0.033","0.016","60"], a:1, x:"1/61 + 1/61 ≈ 0.0328."},
    {t:"mcq", q:"Why not just add BM25 and cosine scores?", o:["Different scales make one dominate unpredictably","It's too slow","Python can't add floats","It's illegal"], a:0},
    {t:"mcq", q:"Hybrid search is most valuable because…", o:["Keyword and vector search fail on different queries","It uses fewer tokens","It removes chunking","It replaces evals"], a:0}
  ],
  lab:{
    task:"Implement reciprocal rank fusion.\n\n1. rrf(rankings, k=60): rankings is a list of ranked id lists (best first; rank starts at 1). Each id's score is the sum of 1 / (k + rank) over the lists it appears in. Return a list of (id, score rounded to 5), best first. Ties keep the order ids were first seen.\n2. hybrid(query, keyword_fn, vector_fn, pool=20, top_n=3): call both functions with (query, pool), fuse with rrf and return just the top_n ids.",
    starter:R`def rrf(rankings, k=60):
    return []

def hybrid(query, keyword_fn, vector_fn, pool=20, top_n=3):
    return []

print(rrf([["a", "b", "c"], ["c", "a", "d"]]))`,
    tests:R`r = rrf([["a", "b", "c"], ["c", "a", "d"]])
assert r == [("a", round(1/61 + 1/62, 5)), ("c", round(1/63 + 1/61, 5)), ("b", round(1/62, 5)), ("d", round(1/63, 5))], "Got " + str(r)
assert rrf([["x", "y"], ["y", "x"]]) == [("x", round(1/61 + 1/62, 5)), ("y", round(1/62 + 1/61, 5))], "Ties keep first-seen order"
assert rrf([["a"], ["b"]], k=0) == [("a", 1.0), ("b", 1.0)], "Respect k"
assert rrf([]) == [], "No lists gives []"
calls = []
kw = lambda q, n: calls.append(("kw", n)) or ["e4417", "errors", "payroll"]
vec = lambda q, n: calls.append(("vec", n)) or ["errors", "sync-guide", "e4417"]
assert hybrid("wd-4417 sync error", kw, vec, pool=30, top_n=2) == ["errors", "e4417"], "errors is rank 2 and 1; e4417 is rank 1 and 3. Got " + str(hybrid("x", kw, vec))
assert ("kw", 30) in calls and ("vec", 30) in calls, "Pass pool to both retrievers"`,
    hint:"Use a dict for scores and a list for first-seen order: for lst in rankings: for rank, i in enumerate(lst, start=1): if i not in scores: order.append(i); scores[i] = scores.get(i, 0) + 1 / (k + rank). Then sorted(order, key=lambda i: -scores[i]).",
    solution:R`def rrf(rankings, k=60):
    scores, order = {}, []
    for lst in rankings:
        for rank, i in enumerate(lst, start=1):
            if i not in scores:
                order.append(i)
            scores[i] = scores.get(i, 0) + 1 / (k + rank)
    ranked = sorted(order, key=lambda i: -scores[i])
    return [(i, round(scores[i], 5)) for i in ranked]

def hybrid(query, keyword_fn, vector_fn, pool=20, top_n=3):
    fused = rrf([keyword_fn(query, pool), vector_fn(query, pool)])
    return [i for i, s in fused[:top_n]]

print(rrf([["a", "b", "c"], ["c", "a", "d"]]))`,
    bonus:{
      task:"Bonus: write weighted_rrf(rankings, weights, k=60), where each list's contribution is multiplied by its weight. Same output format as rrf.",
      tests:R`r = weighted_rrf([["a", "b"], ["b", "a"]], [2.0, 1.0])
assert [i for i, s in r] == ["a", "b"] and r[0][1] == round(2/61 + 1/62, 5), "Got " + str(r)
r = weighted_rrf([["a", "b"], ["b", "a"]], [1.0, 3.0])
assert [i for i, s in r] == ["b", "a"], "The heavier list should win. Got " + str(r)`,
      hint:"Same as rrf, but loop with zip(rankings, weights) and add w / (k + rank).",
      solution:R`def weighted_rrf(rankings, weights, k=60):
    scores, order = {}, []
    for lst, w in zip(rankings, weights):
        for rank, i in enumerate(lst, start=1):
            if i not in scores:
                order.append(i)
            scores[i] = scores.get(i, 0) + w / (k + rank)
    return [(i, round(scores[i], 5)) for i in sorted(order, key=lambda i: -scores[i])]`}}
},
{ id:"r10", act:2, title:"Reranking", mins:35,
  hook:"Your hybrid search puts the right chunk at position 9. The prompt only takes the top 4. A reranker looks closer at the candidates and moves it to position 1.",
  learn:[
    {h:"Two-stage retrieval", p:[
      "Stage 1 (retrieval) is fast and broad: fetch 20 to 100 candidates with hybrid search. Stage 2 (reranking) is slow and precise: score each candidate against the query with a stronger model and keep the best few. You get recall from stage 1 and precision from stage 2."]},
    {h:"How rerankers work", p:[
      "Embedding search encodes query and chunk separately (a bi-encoder), so it never sees them together. A reranker is usually a cross-encoder: it reads the query and chunk together and outputs a relevance score, which is far more accurate but too slow to run on the whole collection. Options include hosted rerank APIs (Cohere, Voyage and others), open-source cross-encoders, or asking an LLM to judge relevance. Anthropic's contextual retrieval research found reranking on top of hybrid search reduced retrieval failures further."],
     code:R`import voyageai
vo = voyageai.Client()
# check the docs for current model names
ranked = vo.rerank(question, [c["text"] for c in candidates],
                   model="rerank-2.5", top_k=4)`},
    {h:"Beyond relevance", p:[
      "Set a minimum score so irrelevant chunks don't pad the prompt; if nothing passes, answer \"I don't know\" instead of guessing. Remove near-duplicates so four copies of the same paragraph don't fill every slot (maximal marginal relevance does this more formally)."]}
  ],
  mistakes:["Reranking only the top 5, so the reranker can't rescue a good chunk sitting at position 15.","Always filling the prompt with k chunks even when they're irrelevant.","Letting near-duplicate chunks take every slot."],
  ai:"Reranking is one of the highest-impact upgrades you can add to an existing RAG system, often improving answer quality without touching anything else.",
  interview:{q:"What's the difference between a bi-encoder and a cross-encoder?", a:"A bi-encoder embeds query and document separately, so document vectors can be precomputed and searched fast, but it never compares them jointly. A cross-encoder reads both together and scores relevance directly: much more accurate, but too slow for the whole collection. That's why we retrieve with bi-encoders and rerank with cross-encoders."},
  terms:[["Reranker","A model that re-scores retrieved candidates for relevance."],["Two-stage retrieval","Broad fast retrieval, then precise reranking."],["Bi-encoder","Encodes query and document separately (embedding search)."],["Cross-encoder","Reads query and document together to score relevance."],["Relevance threshold","A minimum score a chunk needs to be used."],["MMR","Maximal marginal relevance: balancing relevance with diversity."]],
  quiz:[
    {t:"mcq", q:"Why not run a cross-encoder over the entire collection?", o:["Too slow: it must read every query-document pair","It's less accurate","It can't read text","It's not allowed"], a:0},
    {t:"mcq", q:"No candidate passes the relevance threshold. Best behavior?", o:["Use them anyway","Say you don't know or ask a clarifying question","Pick randomly","Retry with a higher temperature"], a:1},
    {t:"mcq", q:"How many candidates should usually go into the reranker?", o:["Exactly the final number","A larger pool, like 20 to 100","One","All documents"], a:1}
  ],
  lab:{
    task:"Build a reranking stage. cross_score(query, text) is a provided stand-in for a cross-encoder (it rewards matching word pairs more than single words).\n\n1. rerank(query, candidates, top_n=3, min_score=0.0): candidates are dicts with \"id\" and \"text\". Score each, keep scores at or above min_score, sort best first (ties keep candidate order), and return up to top_n (id, score) tuples.\n2. two_stage(query, retrieve, pool=20, top_n=3, min_score=0.0): candidates = retrieve(query, pool), then rerank them.",
    starter:R`import re

def cross_score(query, text):
    q = re.findall(r"[a-z0-9]+", query.lower())
    t = re.findall(r"[a-z0-9]+", text.lower())
    words = len(set(q) & set(t))
    pairs = len(set(zip(q, q[1:])) & set(zip(t, t[1:])))
    return round((words + 2 * pairs) / (len(set(q)) + 1), 3)

def rerank(query, candidates, top_n=3, min_score=0.0):
    return []

def two_stage(query, retrieve, pool=20, top_n=3, min_score=0.0):
    return []`,
    tests:R`C = [{"id": "a", "text": "carry over unused days to next year"},
     {"id": "b", "text": "PTO carry over rules: unused PTO carries over up to five days"},
     {"id": "c", "text": "office holiday party"},
     {"id": "d", "text": "PTO balance and accrual"}]
q = "can unused PTO carry over"
r = rerank(q, C, top_n=3)
assert [i for i, s in r] == ["b", "a", "d"], "Got " + str(r)
assert r[0][1] == cross_score(q, C[1]["text"]), "Return the cross_score values"
assert [i for i, s in rerank(q, C, top_n=5, min_score=0.5)] == ["b", "a"], "Respect min_score. Got " + str(rerank(q, C, top_n=5, min_score=0.5))
assert rerank("zebra", C, min_score=0.1) == [], "Nothing relevant gives []"
seen = []
def retrieve(query, n):
    seen.append(n)
    return C
assert [i for i, s in two_stage(q, retrieve, pool=50, top_n=1)] == ["b"] and seen == [50], "two_stage should fetch pool candidates then rerank"`,
    hint:"scored = [(c[\"id\"], cross_score(query, c[\"text\"])) for c in candidates]; keep s >= min_score; sorted(..., key=lambda x: -x[1])[:top_n].",
    solution:R`import re

def cross_score(query, text):
    q = re.findall(r"[a-z0-9]+", query.lower())
    t = re.findall(r"[a-z0-9]+", text.lower())
    words = len(set(q) & set(t))
    pairs = len(set(zip(q, q[1:])) & set(zip(t, t[1:])))
    return round((words + 2 * pairs) / (len(set(q)) + 1), 3)

def rerank(query, candidates, top_n=3, min_score=0.0):
    scored = [(c["id"], cross_score(query, c["text"])) for c in candidates]
    kept = [x for x in scored if x[1] >= min_score]
    return sorted(kept, key=lambda x: -x[1])[:top_n]

def two_stage(query, retrieve, pool=20, top_n=3, min_score=0.0):
    return rerank(query, retrieve(query, pool), top_n, min_score)`,
    bonus:{
      task:"Bonus: write diversify(ranked, texts, max_overlap=0.7). ranked is a list of (id, score); texts maps id to text. Walk down the list and keep an item only if its word-set Jaccard similarity (shared words ÷ all distinct words) with every already-kept item is at most max_overlap.",
      tests:R`texts = {"a": "pto carries over five days", "b": "pto carries over five days max", "c": "sick leave rules"}
ranked = [("a", 0.9), ("b", 0.88), ("c", 0.5)]
assert diversify(ranked, texts) == [("a", 0.9), ("c", 0.5)], "Near-duplicate b should be dropped. Got " + str(diversify(ranked, texts))
assert diversify(ranked, texts, max_overlap=0.9) == ranked, "A looser threshold keeps b"`,
      hint:"jac = len(A & B) / len(A | B) with A and B as sets of lowercase words.",
      solution:R`def diversify(ranked, texts, max_overlap=0.7):
    kept = []
    for i, s in ranked:
        a = set(texts[i].lower().split())
        ok = True
        for j, _ in kept:
            b = set(texts[j].lower().split())
            if len(a & b) / len(a | b) > max_overlap:
                ok = False
                break
        if ok:
            kept.append((i, s))
    return kept`}}
},
/* ---------------- ACT 3 ---------------- */
{ id:"r11", act:3, title:"Building the grounded prompt", mins:35,
  hook:"You retrieved perfect chunks, then dumped 40 of them into the prompt in random order with no instructions. The model got confused and blended two policies together.",
  learn:[
    {h:"Anatomy of a grounded prompt", p:[
      "Put the sources first, each clearly delimited and numbered with its document name. Then give instructions: answer only from the sources, cite them, and say a specific fallback phrase when the answer isn't there. Put the question last. Numbered sources make citations easy to check (lesson 12)."],
     code:R`<sources>
<source id="1" doc="pto_policy.pdf">New hires get 15 PTO days per year.</source>
<source id="2" doc="carryover.pdf">Up to 5 unused days carry over.</source>
</sources>

Answer from the sources only. Cite sources like [1]. If the sources don't
contain the answer, reply exactly: I don't know.

<question>How many PTO days can I carry over?</question>`},
    {h:"Context packing", p:[
      "You have a token budget for context. Add chunks in order of relevance until the budget is full; if one doesn't fit, try the next smaller one rather than stopping. More isn't always better: irrelevant chunks add cost and distraction."]},
    {h:"Order matters", p:[
      "Models attend most reliably to the beginning and end of long contexts; information buried in the middle can be missed (the \"lost in the middle\" effect). Put the strongest chunks first. With many chunks, some teams place the best at both ends. Keeping context short and relevant is the most reliable fix."]}
  ],
  mistakes:["No explicit fallback, so the model guesses when sources don't cover the question.","Sources without ids, so citations can't be verified.","Packing every retrieved chunk regardless of relevance or budget."],
  ai:"The grounded prompt is where retrieval quality turns into answer quality. Small changes here often fix large problems.",
  interview:{q:"How do you reduce hallucinations in a RAG answer?", a:"Retrieve well and only include relevant chunks, instruct the model to answer only from the numbered sources with citations, give an explicit \"I don't know\" fallback, then verify: check citations point to real sources and quoted text actually appears in them. Measure faithfulness with evals."},
  terms:[["Grounded prompt","A prompt that supplies sources and asks for answers based only on them."],["Context packing","Choosing which chunks fit the token budget."],["Fallback phrase","The exact reply to give when sources lack the answer."],["Lost in the middle","Models attending less to information buried mid-context."],["Source id","A number or key that lets answers cite a specific chunk."]],
  quiz:[
    {t:"mcq", q:"Why number each source in the prompt?", o:["So citations like [2] can be checked","To save tokens","Models require numbers","For sorting only"], a:0},
    {t:"mcq", q:"Where should the question go?", o:["After the sources and instructions","Before all sources","In the middle","In the system prompt only"], a:0},
    {t:"mcq", q:"The next chunk doesn't fit the budget, but a smaller one after it would. Best packing?", o:["Stop immediately","Skip it and try the next one","Cut the chunk in half mid-sentence","Drop the question"], a:1}
  ],
  lab:{
    task:"1. pack_context(chunks, budget, count): chunks are already sorted best first. Add each chunk if count(chunk[\"text\"]) fits in the remaining budget; otherwise skip it and keep trying later chunks. Return the chosen chunks in their original order.\n2. grounded_prompt(question, chunks): chunks have \"doc\" and \"text\". Return exactly:\n<sources>\n<source id=\"1\" doc=\"DOC\">TEXT</source>\n...\n</sources>\n\nAnswer from the sources only. Cite sources like [1]. If the sources don't contain the answer, reply exactly: I don't know.\n\n<question>QUESTION</question>",
    starter:R`def pack_context(chunks, budget, count):
    return chunks

def grounded_prompt(question, chunks):
    return ""

words = lambda t: len(t.split())`,
    tests:R`words = lambda t: len(t.split())
C = [{"doc": "a", "text": "one two three four five"}, {"doc": "b", "text": "one two three four five six seven"},
     {"doc": "c", "text": "one two"}, {"doc": "d", "text": "one"}]
assert [c["doc"] for c in pack_context(C, 8, words)] == ["a", "c", "d"], "Skip chunks that don't fit, keep trying. Got " + str([c["doc"] for c in pack_context(C, 8, words)])
assert pack_context(C, 0, words) == [], "Zero budget gives []"
assert pack_context(C, 100, words) == C, "Everything fits"
p = grounded_prompt("Carry over?", [{"doc": "pto.pdf", "text": "15 days."}, {"doc": "co.pdf", "text": "Up to 5 carry over."}])
exp = ('<sources>\n<source id="1" doc="pto.pdf">15 days.</source>\n<source id="2" doc="co.pdf">Up to 5 carry over.</source>\n</sources>\n\n'
       "Answer from the sources only. Cite sources like [1]. If the sources don't contain the answer, reply exactly: I don't know.\n\n"
       "<question>Carry over?</question>")
assert p == exp, "Format doesn't match. Got:\n" + p`,
    hint:"pack_context: left = budget; for c in chunks: n = count(c[\"text\"]); if n <= left: keep it and subtract. grounded_prompt: enumerate(chunks, start=1) to number sources.",
    solution:R`def pack_context(chunks, budget, count):
    left, out = budget, []
    for c in chunks:
        n = count(c["text"])
        if n <= left:
            out.append(c)
            left -= n
    return out

def grounded_prompt(question, chunks):
    lines = [f'<source id="{i}" doc="{c["doc"]}">{c["text"]}</source>' for i, c in enumerate(chunks, start=1)]
    return ("<sources>\n" + "\n".join(lines) + "\n</sources>\n\n"
            "Answer from the sources only. Cite sources like [1]. If the sources don't contain the answer, reply exactly: I don't know.\n\n"
            f"<question>{question}</question>")

words = lambda t: len(t.split())`,
    bonus:{
      task:"Bonus: fight \"lost in the middle\". Write edge_order(items): items are sorted best first; return them with the best at the start and the second-best at the end, alternating inward. [1, 2, 3, 4, 5] becomes [1, 3, 5, 4, 2].",
      tests:R`assert edge_order([1, 2, 3, 4, 5]) == [1, 3, 5, 4, 2], "Got " + str(edge_order([1, 2, 3, 4, 5]))
assert edge_order([1, 2, 3, 4]) == [1, 3, 4, 2], "Got " + str(edge_order([1, 2, 3, 4]))
assert edge_order([]) == [] and edge_order(["a"]) == ["a"]`,
      hint:"Items at even positions (0, 2, 4…) go in order; items at odd positions go at the end in reverse: items[0::2] + items[1::2][::-1].",
      solution:R`def edge_order(items):
    return items[0::2] + items[1::2][::-1]`}}
},
{ id:"r12", act:3, title:"Citations and verification", mins:35,
  hook:"The bot says \"Per policy [3], you get 25 PTO days.\" There are only two sources, and neither says 25. A citation that isn't checked is just decoration.",
  learn:[
    {h:"Why citations matter", p:[
      "Citations let users verify answers and build trust, and they let you automatically detect unsupported claims. In regulated areas like HR, finance and healthcare, an answer without a traceable source often isn't acceptable at all."]},
    {h:"Ways to get citations", p:[
      "Prompted citations: ask for markers like [1] tied to numbered sources. Quote-then-answer: ask the model to first extract exact quotes from the sources, then answer using only those quotes. Native citations: Claude's API can return citations that point to exact passages in documents you provide, which is more reliable than parsing markers yourself."]},
    {h:"Verify automatically", p:[
      "Check that every cited number refers to a real source. Flag answer sentences with no citation. If the answer quotes text, check the quote actually appears in a source. On failure, retry, show the answer with a warning, or fall back to \"I don't know\". These checks are cheap and catch many hallucinations before users see them."],
     code:R`import re
cited = {int(n) for n in re.findall(r"\[(\d+)\]", answer)}
invalid = [n for n in cited if not 1 <= n <= len(sources)]`}
  ],
  mistakes:["Displaying citations without checking that they point to real sources.","Accepting quotes that don't appear in any source.","Asking for citations but not providing numbered or named sources to cite."],
  ai:"Verified citations turn a RAG demo into something compliance teams can approve.",
  interview:{q:"How would you detect a hallucinated citation automatically?", a:"Parse the citation markers, confirm each refers to a provided source, check that quoted spans appear verbatim in the cited source, and optionally run an entailment or LLM-judge check that the cited passage supports the sentence. Flag or regenerate on failure."},
  terms:[["Citation","A reference linking a claim to its source."],["Quote-then-answer","Extract exact quotes first, then answer from them."],["Native citations","API-provided pointers to exact source passages."],["Citation validation","Checking that citations and quotes match real sources."],["Unsupported claim","A statement with no backing in the sources."]],
  quiz:[
    {t:"mcq", q:"An answer cites [4] but only 3 sources were given. This is…", o:["Fine","An invalid citation to flag or regenerate","A reranking issue","A chunking issue"], a:1},
    {t:"mcq", q:"What does quote-then-answer help with?", o:["Grounding answers in exact source text","Faster embeddings","Lower cost","Longer answers"], a:0},
    {t:"mcq", q:"A quoted sentence appears in no source. Likely…", o:["A hallucinated quote","A caching issue","Correct behavior","A rate limit"], a:0}
  ],
  lab:{
    task:"Verify a RAG answer.\n\n1. citations(answer): a sorted list of the distinct numbers in markers like [2].\n2. check_answer(answer, n_sources): return {\"invalid\": sorted cited numbers outside 1..n_sources, \"uncited\": sentences with no [n] marker}. Split sentences after . ! or ? followed by whitespace. The sentence \"I don't know.\" never counts as uncited.\n3. bad_quotes(answer, source_texts): return every text in double quotes (\"...\") in the answer that doesn't appear in any source, ignoring case. Keep the answer's order.",
    starter:R`import re

def citations(answer):
    return []

def check_answer(answer, n_sources):
    return {"invalid": [], "uncited": []}

def bad_quotes(answer, source_texts):
    return []`,
    tests:R`a = "New hires get 15 days [1]. Up to 5 carry over [2][2]. Managers approve requests. Bonus days exist [4]."
assert citations(a) == [1, 2, 4], "Got " + str(citations(a))
r = check_answer(a, 2)
assert r == {"invalid": [4], "uncited": ["Managers approve requests."]}, "Got " + str(r)
assert check_answer("I don't know.", 3) == {"invalid": [], "uncited": []}, "The fallback isn't an uncited claim"
S = ["New hires get 15 PTO days per year.", "Up to 5 unused days carry over."]
ans = 'The policy says "new hires get 15 PTO days" and "all days carry over forever" [2].'
assert bad_quotes(ans, S) == ["all days carry over forever"], "Got " + str(bad_quotes(ans, S))
assert bad_quotes("No quotes here [1].", S) == []`,
    hint:"citations: sorted({int(n) for n in re.findall(r\"\\[(\\d+)\\]\", answer)}). Sentences: [s for s in re.split(r\"(?<=[.!?])\\s+\", answer.strip()) if s]. Quotes: re.findall(r'\"([^\"]+)\"', answer).",
    solution:R`import re

def citations(answer):
    return sorted({int(n) for n in re.findall(r"\[(\d+)\]", answer)})

def check_answer(answer, n_sources):
    invalid = [n for n in citations(answer) if not 1 <= n <= n_sources]
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", answer.strip()) if s]
    uncited = [s for s in sentences if not re.search(r"\[\d+\]", s) and s != "I don't know."]
    return {"invalid": invalid, "uncited": uncited}

def bad_quotes(answer, source_texts):
    joined = [s.lower() for s in source_texts]
    return [q for q in re.findall(r'"([^"]+)"', answer) if not any(q.lower() in s for s in joined)]`,
    bonus:{
      task:"Bonus: write clean_for_display(answer) that removes citation markers like [1] or [2][3] and tidies spaces, including any space left before punctuation.",
      tests:R`assert clean_for_display("You get 15 days [1]. Up to 5 carry over [2][3].") == "You get 15 days. Up to 5 carry over.", "Got " + repr(clean_for_display("You get 15 days [1]. Up to 5 carry over [2][3]."))`,
      hint:"Remove markers with re.sub(r\"\\s*\\[\\d+\\]\", \"\", text), then collapse repeated spaces.",
      solution:R`def clean_for_display(answer):
    t = re.sub(r"\s*\[\d+\]", "", answer)
    t = re.sub(r"\s+([.,!?])", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()`}}
},
{ id:"r13", act:3, title:"Query transformation", mins:35,
  hook:"Turn 3 of a chat: \"what about for part-timers?\" Searching those five words finds nothing useful. The question needs the conversation's context before it can be searched.",
  learn:[
    {h:"Users don't write good search queries", p:[
      "They use pronouns, follow-ups, slang, typos and multi-part questions. Query transformation rewrites the question into something retrieval can handle, before searching."]},
    {h:"Techniques", p:[
      "Condensing: turn a follow-up plus chat history into a standalone question (\"What is the PTO policy for part-time employees?\"). Multi-query: generate several phrasings or synonyms, search each, merge the results. Decomposition: split \"Compare the PTO and sick leave rules\" into two searches. HyDE (hypothetical document embeddings): ask the model to write a hypothetical answer and search with that, because answers look more like documents than questions do. Keep a cheap model on this step and skip it when the question is already standalone."],
     code:R`condensed = llm(f"""Rewrite the last question as a standalone search query.
<history>{history}</history>
<question>{question}</question>
Return only the query.""")`},
    {h:"Merging multiple searches", p:[
      "Run each query, then merge: keep each chunk's best score (or use RRF across the lists), remove duplicates, and rank. More queries means better recall but more cost and latency, so measure the gain."]}
  ],
  mistakes:["Searching raw follow-up questions like \"what about that one?\".","Calling an LLM to rewrite every query, even ones that are already clear.","Generating many query variants without deduplicating the merged results."],
  ai:"Query transformation is how conversational RAG stays accurate beyond the first question.",
  interview:{q:"What is HyDE and why does it help?", a:"Hypothetical Document Embeddings: the model drafts a plausible answer to the question, and you embed that draft to search. Answers are phrased like the documents you're searching, so the draft often lands closer to relevant chunks than the short question does. The draft is only used for searching, never shown as the answer."},
  terms:[["Query rewriting","Transforming a user question into a better search query."],["Condensing","Turning a follow-up plus history into a standalone question."],["Multi-query retrieval","Searching several phrasings and merging results."],["Query decomposition","Splitting a complex question into simpler searches."],["HyDE","Searching with a model-written hypothetical answer."]],
  quiz:[
    {t:"mcq", q:"Follow-up question: \"and for contractors?\" What should happen before search?", o:["Condense it with chat history into a standalone question","Search it as-is","Ignore it","Raise temperature"], a:0},
    {t:"mcq", q:"\"Compare the dental and vision plans\" is best handled by…", o:["Decomposition into two searches","A single keyword search","HyDE only","No retrieval"], a:0},
    {t:"mcq", q:"The main cost of multi-query retrieval is…", o:["More searches and latency","Worse recall","Losing citations","Breaking permissions"], a:0}
  ],
  lab:{
    task:"1. expand(query, synonyms): synonyms maps a word to a list of alternatives. Return a list starting with the original query, then, for each word in the query (in order) that has synonyms, one variant per synonym with that word replaced. Match words in lowercase, and return variants in lowercase.\n2. multi_search(queries, search, k=3): search(q) returns a list of (id, score). Keep each id's best score across all queries. Return the top k ids, best first; ties keep the order ids were first seen.\n3. condense(history, question, llm): if the question contains none of the words it, that, this, they, those or one (as whole words, any case), return it unchanged without calling llm. Otherwise return llm(prompt).strip(), where the prompt includes the last 4 history lines joined with newlines and the question.",
    starter:R`import re

PRONOUNS = {"it", "that", "this", "they", "those", "one"}

def expand(query, synonyms):
    return [query]

def multi_search(queries, search, k=3):
    return []

def condense(history, question, llm):
    return question`,
    tests:R`S = {"pto": ["vacation", "time off"], "rules": ["policy"]}
assert expand("PTO carryover rules", S) == ["PTO carryover rules", "vacation carryover rules", "time off carryover rules", "pto carryover policy"], "Got " + str(expand("PTO carryover rules", S))
assert expand("sick leave", S) == ["sick leave"]
R = {"pto rules": [("a", 0.5), ("b", 0.9)], "vacation rules": [("c", 0.95), ("a", 0.7)], "x": []}
assert multi_search(["pto rules", "vacation rules", "x"], lambda q: R[q], k=3) == ["c", "b", "a"], "Got " + str(multi_search(["pto rules", "vacation rules", "x"], lambda q: R[q]))
calls = []
fake = lambda p: calls.append(p) or "  PTO policy for part-time employees  "
assert condense(["user: what's the PTO policy?"], "How many days for new hires?", fake) == "How many days for new hires?" and calls == [], "Standalone questions skip the LLM"
h = ["user: hi", "assistant: hello", "user: what's the PTO policy?", "assistant: 15 days", "user: ok"]
assert condense(h, "What about that for part-timers?", fake) == "PTO policy for part-time employees", "Use the LLM's rewrite"
assert "user: what's the PTO policy?" in calls[0] and "user: hi" not in calls[0] and "What about that for part-timers?" in calls[0], "Prompt should include the last 4 history lines and the question"`,
    hint:"expand: words = query.lower().split(); for i, w in enumerate(words): for s in synonyms.get(w, []): variants.append(\" \".join(words[:i] + [s] + words[i+1:])). condense: set(re.findall(r\"[a-z']+\", question.lower())) & PRONOUNS.",
    solution:R`import re

PRONOUNS = {"it", "that", "this", "they", "those", "one"}

def expand(query, synonyms):
    words = query.lower().split()
    out = [query]
    for i, w in enumerate(words):
        for s in synonyms.get(w, []):
            out.append(" ".join(words[:i] + [s] + words[i + 1:]))
    return out

def multi_search(queries, search, k=3):
    best, order = {}, []
    for q in queries:
        for i, s in search(q):
            if i not in best:
                order.append(i)
                best[i] = s
            else:
                best[i] = max(best[i], s)
    return sorted(order, key=lambda i: -best[i])[:k]

def condense(history, question, llm):
    if not set(re.findall(r"[a-z']+", question.lower())) & PRONOUNS:
        return question
    prompt = ("Rewrite the question as a standalone search query.\n<history>\n"
              + "\n".join(history[-4:]) + "\n</history>\n<question>" + question + "</question>")
    return llm(prompt).strip()`,
    bonus:{
      task:"Bonus: write decompose(question). If the question starts with \"compare \" (any case), return [\"X\", \"Y\"] from \"compare X and Y\" (strip a trailing ?). If it contains \" and \" elsewhere, return the two sides of the first \" and \". Otherwise return [question].",
      tests:R`assert decompose("Compare the dental plan and the vision plan?") == ["the dental plan", "the vision plan"], "Got " + str(decompose("Compare the dental plan and the vision plan?"))
assert decompose("What is PTO and how does it accrue") == ["What is PTO", "how does it accrue"]
assert decompose("What is PTO?") == ["What is PTO?"]`,
      hint:"q = question.strip(); if q.lower().startswith(\"compare \"): q = q[8:].rstrip(\"?\"). Then split once on \" and \".",
      solution:R`def decompose(question):
    q = question.strip()
    if q.lower().startswith("compare "):
        q = q[8:].rstrip("?")
        if " and " in q:
            a, b = q.split(" and ", 1)
            return [a.strip(), b.strip()]
        return [q]
    if " and " in q:
        a, b = q.split(" and ", 1)
        return [a.strip(), b.strip()]
    return [question]`}}
},
{ id:"r14", act:3, title:"Contextual chunks and small-to-big retrieval", mins:40,
  hook:"A chunk reads: \"The limit is 5 days.\" Limit of what? Which policy? Which year? Stripped of its context, even a perfectly retrieved chunk is ambiguous.",
  learn:[
    {h:"Chunks lose context", p:[
      "Once split, a chunk may not say which document, section or entity it's about. Both keyword and vector search then struggle, and the model can misattribute facts. The fix is to put the missing context back."]},
    {h:"Contextual retrieval", p:[
      "Prepend context to each chunk before embedding and keyword indexing: at minimum the document title and section heading (\"PTO Policy 2025 > Carryover: The limit is 5 days.\"). Anthropic's contextual retrieval approach goes further, using a model to write a short situating sentence for each chunk from the full document, and reported large reductions in retrieval failures, especially combined with hybrid search and reranking. Prompt caching makes generating that context affordable."]},
    {h:"Small-to-big (parent-child) retrieval", p:[
      "Search over small, precise chunks, but send the model their larger parent section or document. Precision in search, full context in generation. A variant, the sentence window, retrieves one sentence and includes its neighbors."],
     code:R`hits = search(question, k=5)                    # small chunks
parents = unique([c.parent_id for c in hits])   # e.g. whole sections
context = [load_section(p) for p in parents]   # what the model reads`}
  ],
  mistakes:["Indexing bare chunks with no title or section, so \"the limit\" is ambiguous.","Sending tiny chunks to the model when it needs the surrounding section.","Expanding to whole huge documents and blowing the context budget."],
  ai:"Adding context to chunks is one of the most effective, well-evidenced upgrades for RAG over long, structured documents.",
  interview:{q:"Explain small-to-big retrieval.", a:"Index small chunks so similarity search is precise, keep a link from each chunk to its parent section or document, and at answer time send the parents (deduplicated, within budget) to the model. You get precise matching and enough surrounding context for a correct answer."},
  terms:[["Contextual retrieval","Adding document and section context to chunks before indexing."],["Contextual header","A prefix like \"Title > Section:\" added to a chunk."],["Parent-child chunks","Small chunks linked to the larger section they came from."],["Small-to-big","Search small chunks, return their bigger parents."],["Sentence window","Retrieve a sentence and include its neighbors."]],
  quiz:[
    {t:"mcq", q:"Why prepend the title and section to each chunk?", o:["It restores context that helps both search and the model","It saves tokens","It hides the chunk","It's required by embeddings"], a:0},
    {t:"mcq", q:"In small-to-big retrieval, what's searched?", o:["Small chunks","Whole documents only","Titles only","Nothing"], a:0},
    {t:"mcq", q:"What makes generating per-chunk context with an LLM affordable at scale?", o:["Prompt caching of the full document","Higher temperature","Longer chunks","Streaming"], a:0}
  ],
  lab:{
    task:"Work with a markdown document. A line starting with \"# \" is the title; a line starting with \"## \" starts a section; other non-empty lines are body text.\n\n1. sections(md): return a list of (title, heading, body) for each section, where body is its non-empty lines joined by single spaces. Skip sections with no body.\n2. contextualize(doc_id, md): return a list of chunks, one per section: {\"id\": f\"{doc_id}#{n}\" (n from 0), \"text\": f\"[{title} > {heading}] {body}\", \"parent\": doc_id}.\n3. small_to_big(hit_ids, chunks, docs): chunks maps chunk id to chunk; docs maps doc id to full text. Return the full texts of the parent docs of the hits, each once, in the order their first hit appears.",
    starter:R`def sections(md):
    return []

def contextualize(doc_id, md):
    return []

def small_to_big(hit_ids, chunks, docs):
    return []

MD = """# PTO Policy 2025
## Accrual
New hires get 15 days per year.
Days accrue monthly.
## Carryover
The limit is 5 days.
## Notes
"""
print(contextualize("pto", MD))`,
    tests:R`MD = """# PTO Policy 2025
## Accrual
New hires get 15 days per year.

Days accrue monthly.
## Carryover
The limit is 5 days.
## Notes
"""
assert sections(MD) == [("PTO Policy 2025", "Accrual", "New hires get 15 days per year. Days accrue monthly."), ("PTO Policy 2025", "Carryover", "The limit is 5 days.")], "Got " + str(sections(MD))
c = contextualize("pto", MD)
assert c[1] == {"id": "pto#1", "text": "[PTO Policy 2025 > Carryover] The limit is 5 days.", "parent": "pto"}, "Got " + str(c[1])
assert len(c) == 2, "Empty sections produce no chunk"
chunks = {x["id"]: x for x in c + contextualize("sick", "# Sick Leave\n## Days\nTen days.")}
docs = {"pto": "FULL PTO", "sick": "FULL SICK"}
assert small_to_big(["pto#1", "sick#0", "pto#0"], chunks, docs) == ["FULL PTO", "FULL SICK"], "Unique parents in first-hit order"`,
    hint:"Walk the lines: track title and heading; when a new \"## \" line starts (or the text ends), close the previous section if its body list isn't empty.",
    solution:R`def sections(md):
    out, title, heading, body = [], "", None, []
    def close():
        if heading is not None and body:
            out.append((title, heading, " ".join(body)))
    for line in md.splitlines():
        s = line.strip()
        if s.startswith("## "):
            close()
            heading, body = s[3:].strip(), []
        elif s.startswith("# "):
            title = s[2:].strip()
        elif s:
            body.append(s)
    close()
    return out

def contextualize(doc_id, md):
    return [{"id": f"{doc_id}#{n}", "text": f"[{t} > {h}] {b}", "parent": doc_id}
            for n, (t, h, b) in enumerate(sections(md))]

def small_to_big(hit_ids, chunks, docs):
    seen, out = set(), []
    for h in hit_ids:
        p = chunks[h]["parent"]
        if p not in seen:
            seen.add(p)
            out.append(docs[p])
    return out

MD = """# PTO Policy 2025
## Accrual
New hires get 15 days per year.
Days accrue monthly.
## Carryover
The limit is 5 days.
## Notes
"""
print(contextualize("pto", MD))`,
    bonus:{
      task:"Bonus: write sentence_window(sentences, hit, w=1): return the sentence at index hit plus up to w sentences on each side, joined by spaces, staying inside the list.",
      tests:R`S = ["A.", "B.", "C.", "D.", "E."]
assert sentence_window(S, 2) == "B. C. D." and sentence_window(S, 0) == "A. B." and sentence_window(S, 4, w=2) == "C. D. E."`,
      hint:"\" \".join(sentences[max(0, hit - w): hit + w + 1]).",
      solution:R`def sentence_window(sentences, hit, w=1):
    return " ".join(sentences[max(0, hit - w): hit + w + 1])`}}
},
{ id:"r15", act:3, title:"Frameworks: LangChain, LlamaIndex and plain Python", mins:40,
  hook:"A teammate says: \"Just use LangChain.\" Another says: \"Frameworks are bloat.\" Both are partly right. Understanding what frameworks actually do lets you choose wisely.",
  learn:[
    {h:"What frameworks give you", p:[
      "Ready-made components with shared interfaces: document loaders, text splitters, embedding and LLM wrappers, vector store connectors, retrievers, rerankers, output parsers, and ways to compose them into pipelines. You can swap one vector store for another by changing a line, and connectors for hundreds of sources come built in."]},
    {h:"The main options", p:[
      "LangChain: general building blocks for LLM apps, with LCEL, a pipe syntax where each component's output feeds the next (retriever | prompt | llm | parser). LangGraph, from the same team, builds stateful agents as graphs. LlamaIndex: focused on data and retrieval, with strong ingestion, indexing and query engines. Haystack: production-oriented pipelines. Many teams also use provider SDKs directly with a few hundred lines of their own code."],
     code:R`from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
chain = retriever_step | prompt | llm | StrOutputParser()
answer = chain.invoke("How many PTO days do new hires get?")`},
    {h:"Choosing", p:[
      "Frameworks speed up prototypes and give you connectors. They also add abstraction layers, frequent API changes and harder debugging. Plain Python gives full control and transparency. A common path: prototype with a framework, then keep it where it helps and replace hot paths with simple code you fully understand. Whatever you choose, the concepts in this track are the same underneath. The lab builds a tiny pipe-style framework so you can see there's no magic."]}
  ],
  mistakes:["Adopting a framework before understanding the pipeline it hides.","Being unable to debug because you can't see the exact prompt the framework sent.","Rewriting a working system every time a framework releases a new abstraction."],
  ai:"Framework fluency is common in job descriptions; understanding what's underneath is what makes you effective when something breaks.",
  interview:{q:"When would you avoid a framework like LangChain?", a:"When the pipeline is simple, when you need full control over prompts, latency and costs, or when debugging through abstraction layers is slowing the team. I'd still use frameworks for fast prototyping or when their integrations save real work, and make sure we can inspect every prompt and call they make."},
  terms:[["LangChain","A popular framework of composable building blocks for LLM apps."],["LCEL","LangChain Expression Language: composing steps with the | operator."],["LangGraph","A framework for building stateful agents as graphs."],["LlamaIndex","A framework focused on ingesting, indexing and querying data for LLMs."],["Runnable / component","A pipeline step with a standard interface like invoke()."],["Abstraction cost","The debugging and flexibility price of hidden layers."]],
  quiz:[
    {t:"mcq", q:"In LCEL, what does retriever | prompt | llm mean?", o:["Each step's output feeds the next step","They run in random order","It's a logical OR","They run on separate servers"], a:0},
    {t:"mcq", q:"Which framework is most focused on data ingestion and indexing?", o:["LlamaIndex","FastAPI","pytest","NumPy"], a:0},
    {t:"mcq", q:"Your framework-based app gives a strange answer. First debugging step?", o:["Inspect the exact prompt and retrieved chunks it sent","Switch frameworks","Increase max_tokens","Rewrite everything"], a:0}
  ],
  lab:{
    task:"Build a tiny pipe-style framework.\n\nclass Step(fn, name):\n  invoke(x) returns fn(x).\n  step_a | step_b returns a Pipeline of both steps.\n\nclass Pipeline(steps):\n  pipeline | step (or | another Pipeline) returns a new, longer Pipeline, leaving the original unchanged.\n  invoke(x) runs each step in order, passing each output to the next. It also sets self.trace to a list of (step name, output) pairs, so you can see every intermediate result.\n  names returns the list of step names.",
    starter:R`class Step:
    def __init__(self, fn, name):
        self.fn, self.name = fn, name

class Pipeline:
    def __init__(self, steps):
        self.steps = list(steps)
        self.trace = []

retrieve = Step(lambda q: {"q": q, "docs": ["New hires get 15 PTO days."]}, "retrieve")
prompt = Step(lambda d: f"Docs: {d['docs']}\nQ: {d['q']}", "prompt")
llm = Step(lambda p: "ANSWER: 15 days", "llm")
parse = Step(lambda s: s.replace("ANSWER: ", ""), "parse")`,
    tests:R`retrieve = Step(lambda q: {"q": q, "docs": ["New hires get 15 PTO days."]}, "retrieve")
prompt = Step(lambda d: f"Docs: {d['docs']}\nQ: {d['q']}", "prompt")
llm = Step(lambda p: "ANSWER: 15 days", "llm")
parse = Step(lambda s: s.replace("ANSWER: ", ""), "parse")
assert parse.invoke("ANSWER: x") == "x", "Step.invoke should call fn"
first = retrieve | prompt
assert isinstance(first, Pipeline) and first.names == ["retrieve", "prompt"], "Step | Step makes a Pipeline"
chain = first | llm | parse
assert chain.names == ["retrieve", "prompt", "llm", "parse"] and first.names == ["retrieve", "prompt"], "| returns a new Pipeline and leaves the old one alone"
assert chain.invoke("PTO for new hires?") == "15 days", "Got " + repr(chain.invoke("PTO for new hires?"))
assert [n for n, o in chain.trace] == ["retrieve", "prompt", "llm", "parse"] and chain.trace[2][1] == "ANSWER: 15 days", "trace should record each step's output"
both = (retrieve | prompt) | (llm | parse)
assert both.names == ["retrieve", "prompt", "llm", "parse"], "Pipeline | Pipeline should join them"`,
    hint:"Step.__or__(self, other): return Pipeline([self]) | other. Pipeline.__or__: extra = other.steps if isinstance(other, Pipeline) else [other]; return Pipeline(self.steps + extra). names can be a @property.",
    solution:R`class Step:
    def __init__(self, fn, name):
        self.fn, self.name = fn, name
    def invoke(self, x):
        return self.fn(x)
    def __or__(self, other):
        return Pipeline([self]) | other

class Pipeline:
    def __init__(self, steps):
        self.steps = list(steps)
        self.trace = []
    def __or__(self, other):
        extra = other.steps if isinstance(other, Pipeline) else [other]
        return Pipeline(self.steps + extra)
    @property
    def names(self):
        return [s.name for s in self.steps]
    def invoke(self, x):
        self.trace = []
        for s in self.steps:
            x = s.invoke(x)
            self.trace.append((s.name, x))
        return x

retrieve = Step(lambda q: {"q": q, "docs": ["New hires get 15 PTO days."]}, "retrieve")
prompt = Step(lambda d: f"Docs: {d['docs']}\nQ: {d['q']}", "prompt")
llm = Step(lambda p: "ANSWER: 15 days", "llm")
parse = Step(lambda s: s.replace("ANSWER: ", ""), "parse")`,
    bonus:{
      task:"Bonus: add batch(inputs) to Pipeline that returns a list of invoke results, one per input. Then add a Parallel(branches) step class: Parallel({\"a\": pipeline_or_step, ...}) with name \"parallel\" whose invoke(x) returns {key: branch.invoke(x)}, and that works inside a pipeline with |.",
      tests:R`up = Step(str.upper, "up"); ex = Step(lambda s: s + "!", "ex")
assert (up | ex).batch(["a", "b"]) == ["A!", "B!"]
par = Parallel({"shout": up | ex, "length": Step(len, "len")})
assert (Step(str.strip, "strip") | par).invoke("  hi ") == {"shout": "HI!", "length": 2}, "Parallel should run every branch on the same input"`,
      hint:"Make Parallel a subclass of Step: super().__init__(lambda x: {k: b.invoke(x) for k, b in branches.items()}, \"parallel\").",
      solution:R`def batch(self, inputs):
    return [self.invoke(x) for x in inputs]
Pipeline.batch = batch

class Parallel(Step):
    def __init__(self, branches):
        super().__init__(lambda x: {k: b.invoke(x) for k, b in branches.items()}, "parallel")`}}
},
/* ---------------- ACT 4 ---------------- */
{ id:"r16", act:4, title:"Evaluating retrieval", mins:40,
  hook:"You switched chunk size from 500 to 300 words and it \"feels better\". Your manager asks for numbers. Retrieval metrics turn feelings into evidence.",
  learn:[
    {h:"The golden set", p:[
      "Collect 30 to 200 real questions, each labeled with the chunk or document ids that contain the answer. Include easy, hard, keyword-style, paraphrased and no-answer questions. Real user questions from logs make the best golden sets. This one dataset lets you compare every chunking, embedding, hybrid and reranking choice objectively."]},
    {h:"Core metrics", p:[
      "Recall@k: of the relevant items, what share appear in the top k? The most important metric for RAG, since the model can't use what wasn't retrieved. Precision@k: of the top k, what share are relevant? MRR (mean reciprocal rank): the average of 1 / rank of the first relevant result, which rewards putting it near the top. nDCG: rewards relevant results more the higher they appear, and supports graded relevance."],
     code:R`retrieved = ["c7", "c2", "c9", "c4"]
relevant = {"c2", "c4"}
recall_at_3 = len(relevant & set(retrieved[:3])) / len(relevant)   # 0.5
reciprocal_rank = 1 / 2                                          # first hit at rank 2`},
    {h:"Use it like an engineer", p:[
      "Run the golden set for every change, track metrics over time, and look at the failures by hand: they tell you whether the fix is chunking, query rewriting, hybrid search or metadata. Retrieval evals are fast and cheap because no LLM generation is involved, so run them often."]}
  ],
  mistakes:["Judging retrieval changes by trying three questions by hand.","Only measuring final answers, so you can't tell whether retrieval or generation failed.","A golden set made only of easy questions the system already handles."],
  ai:"Measured retrieval quality is what separates professional RAG work from demos, and it's what makes your capstone convincing to an interviewer.",
  interview:{q:"Which metric matters most for RAG retrieval, and why?", a:"Recall at k, usually, because if the relevant chunk isn't in the top k passed to the model, the answer can't be grounded no matter how good the model is. MRR or nDCG then tell you how high it ranks, which matters for context budgets and reranking."},
  terms:[["Golden set","Questions labeled with their correct sources or answers."],["Recall@k","Share of relevant items found in the top k results."],["Precision@k","Share of the top k results that are relevant."],["MRR","Mean reciprocal rank: average of 1 / rank of the first relevant result."],["nDCG","A ranking metric that rewards relevant results appearing higher."]],
  quiz:[
    {t:"mcq", q:"2 relevant chunks; the top 5 contains 1 of them. Recall@5 is…", o:["0.2","0.5","1.0","0.1"], a:1},
    {t:"mcq", q:"The first relevant result is at rank 4. Its reciprocal rank is…", o:["4","0.25","0.4","1"], a:1},
    {t:"mcq", q:"Why are retrieval evals cheap to run often?", o:["No LLM generation is needed","They skip the golden set","They use random data","They're not cheap"], a:0}
  ],
  lab:{
    task:"1. recall_at_k(retrieved, relevant, k): share of relevant ids found in retrieved[:k]; 0.0 if relevant is empty.\n2. precision_at_k(retrieved, relevant, k): relevant items in retrieved[:k], divided by k.\n3. reciprocal_rank(retrieved, relevant): 1 / position of the first relevant id (positions start at 1), or 0.0.\n4. evaluate(golden, search, k=3): golden is a list of {\"q\", \"relevant\"}. Call search(q) for each. Return {\"recall\": mean recall@k rounded to 3, \"mrr\": mean reciprocal rank rounded to 3, \"misses\": questions with recall@k of 0}.",
    starter:R`def recall_at_k(retrieved, relevant, k):
    return 0.0

def precision_at_k(retrieved, relevant, k):
    return 0.0

def reciprocal_rank(retrieved, relevant):
    return 0.0

def evaluate(golden, search, k=3):
    return {"recall": 0.0, "mrr": 0.0, "misses": []}`,
    tests:R`r = ["c7", "c2", "c9", "c4"]
assert recall_at_k(r, ["c2", "c4"], 3) == 0.5 and recall_at_k(r, ["c2", "c4"], 4) == 1.0
assert recall_at_k(r, [], 3) == 0.0, "No relevant items gives 0.0"
assert abs(precision_at_k(r, ["c2", "c4"], 4) - 0.5) < 1e-9 and abs(precision_at_k(r, ["c2"], 2) - 0.5) < 1e-9
assert reciprocal_rank(r, ["c9", "c4"]) == 1/3 and reciprocal_rank(r, ["zz"]) == 0.0
G = [{"q": "pto days", "relevant": ["pto#0"]}, {"q": "carryover", "relevant": ["pto#1", "faq#3"]}, {"q": "wd-4417", "relevant": ["err#2"]}]
S = {"pto days": ["pto#0", "x"], "carryover": ["x", "faq#3", "y", "pto#1"], "wd-4417": ["a", "b", "c"]}
e = evaluate(G, lambda q: S[q], k=3)
assert e == {"recall": 0.5, "mrr": 0.5, "misses": ["wd-4417"]}, "Got " + str(e)`,
    hint:"recall: len(set(relevant) & set(retrieved[:k])) / len(set(relevant)). reciprocal_rank: for pos, i in enumerate(retrieved, start=1): if i in relevant: return 1 / pos.",
    solution:R`def recall_at_k(retrieved, relevant, k):
    rel = set(relevant)
    return len(rel & set(retrieved[:k])) / len(rel) if rel else 0.0

def precision_at_k(retrieved, relevant, k):
    return len(set(relevant) & set(retrieved[:k])) / k

def reciprocal_rank(retrieved, relevant):
    rel = set(relevant)
    for pos, i in enumerate(retrieved, start=1):
        if i in rel:
            return 1 / pos
    return 0.0

def evaluate(golden, search, k=3):
    recalls, rrs, misses = [], [], []
    for g in golden:
        res = search(g["q"])
        rc = recall_at_k(res, g["relevant"], k)
        recalls.append(rc)
        rrs.append(reciprocal_rank(res, g["relevant"]))
        if rc == 0:
            misses.append(g["q"])
    n = len(golden) or 1
    return {"recall": round(sum(recalls) / n, 3), "mrr": round(sum(rrs) / n, 3), "misses": misses}`,
    bonus:{
      task:"Bonus: write ndcg_at_k(retrieved, relevant, k) with binary relevance: DCG = sum of 1 / log2(position + 1) over relevant items in the top k (positions from 1). Divide by the ideal DCG (all relevant items at the top). Return 0.0 if there are no relevant items. Round to 4.",
      tests:R`assert ndcg_at_k(["a", "b", "c"], ["a"], 3) == 1.0
assert ndcg_at_k(["x", "a", "c"], ["a"], 3) == round(1 / math.log2(3), 4), "Got " + str(ndcg_at_k(["x", "a", "c"], ["a"], 3))
assert ndcg_at_k(["x", "y"], ["a"], 2) == 0.0 and ndcg_at_k(["a"], [], 1) == 0.0`,
      hint:"import math. dcg = sum(1 / math.log2(p + 1) for p, i in enumerate(retrieved[:k], start=1) if i in rel); ideal = sum(1 / math.log2(p + 1) for p in range(1, min(len(rel), k) + 1)).",
      solution:R`import math

def ndcg_at_k(retrieved, relevant, k):
    rel = set(relevant)
    if not rel:
        return 0.0
    dcg = sum(1 / math.log2(p + 1) for p, i in enumerate(retrieved[:k], start=1) if i in rel)
    ideal = sum(1 / math.log2(p + 1) for p in range(1, min(len(rel), k) + 1))
    return round(dcg / ideal, 4)`}}
},
{ id:"r17", act:4, title:"Evaluating answers: faithfulness and relevance", mins:40,
  hook:"Retrieval recall is 95%, but users still report wrong answers. The right chunks arrive; the model then adds details that aren't in them. You need to measure the answers too.",
  learn:[
    {h:"What to measure", p:[
      "Faithfulness (groundedness): is every claim in the answer supported by the retrieved context? Answer relevance: does it actually address the question? Correctness: does it match a reference answer, when you have one? Context precision and context recall: did retrieval bring the right material? Frameworks such as RAGAS package these metrics; you can also build them yourself."]},
    {h:"How to grade", p:[
      "Break the answer into claims or sentences and check each against the context. Cheap heuristics (word overlap, exact quote matching) catch obvious problems. LLM-as-judge with a clear rubric (\"Is this sentence fully supported by the context? Answer yes or no, then explain\") handles paraphrase. Calibrate judges against human labels on a sample, and keep the judge prompt versioned like any other code."],
     code:R`judge_prompt = """<context>{context}</context>
<claim>{sentence}</claim>
Is the claim fully supported by the context? Reply with SUPPORTED or UNSUPPORTED."""`},
    {h:"No-answer questions", p:[
      "Include questions your documents can't answer. The right behavior is \"I don't know\"; confident answers to these are hallucinations. Track this separately: it's often the metric that improves most when you tune prompts."]}
  ],
  mistakes:["Only checking whether the answer sounds good.","Trusting an LLM judge without ever comparing it with human judgment.","Leaving no-answer questions out of the eval set."],
  ai:"Answer-level evals complete the picture: retrieval metrics tell you what the model saw, faithfulness tells you what it did with it.",
  interview:{q:"How would you measure hallucination in a RAG system?", a:"Split answers into claims and check each against the retrieved context, with code heuristics for quotes and numbers and an LLM judge calibrated on human labels for paraphrased claims. Report a faithfulness score, and track no-answer questions separately, since confident answers there are pure hallucinations."},
  terms:[["Faithfulness","Whether every claim in an answer is supported by the context."],["Answer relevance","Whether the answer addresses the question asked."],["Context recall","Whether retrieval brought all the needed information."],["RAGAS","An open-source framework of RAG evaluation metrics."],["Judge calibration","Checking an LLM judge's grades against human labels."],["No-answer question","A test question the documents can't answer."]],
  quiz:[
    {t:"mcq", q:"Retrieval recall is high but answers include made-up details. Which metric exposes it?", o:["Faithfulness","Recall@k","Latency","Chunk size"], a:0},
    {t:"mcq", q:"For a question the documents can't answer, the ideal answer is…", o:["A best guess","\"I don't know\" or a clear statement that it isn't covered","A random source","A longer answer"], a:1},
    {t:"mcq", q:"Why calibrate an LLM judge against human labels?", o:["To know how far to trust its grades","To make it faster","To save tokens","It's not needed"], a:0}
  ],
  lab:{
    task:"Build a heuristic faithfulness checker.\n\n1. content_words(text): lowercase letter/digit words that aren't in STOP and have at least 2 characters.\n2. supported(sentence, context, threshold=0.6): the share of the sentence's content words found in the context's content words is at least threshold. A sentence with no content words counts as supported.\n3. faithfulness(answer, context): split the answer into sentences (after . ! or ? plus whitespace). Return (score, unsupported), where score is supported sentences ÷ all sentences, rounded to 2, and unsupported lists the failing sentences. An empty answer gives (1.0, []).",
    starter:R`import re

STOP = {"the", "a", "an", "is", "are", "of", "to", "and", "in", "for", "on", "per", "you", "your", "can", "up", "at", "be", "it", "get"}

def content_words(text):
    return []

def supported(sentence, context, threshold=0.6):
    return True

def faithfulness(answer, context):
    return (1.0, [])`,
    tests:R`ctx = "New hires get 15 PTO days per year. Up to 5 unused days carry over into January."
assert content_words("You get 15 PTO days!") == ["15", "pto", "days"], "Got " + str(content_words("You get 15 PTO days!"))
assert supported("New hires get 15 PTO days.", ctx) is True
assert supported("Managers must approve requests in writing.", ctx) is False
assert supported("It is.", ctx) is True, "No content words counts as supported"
ans = "New hires get 15 PTO days per year. Up to 5 days carry over. Unused sick leave pays out at retirement."
s, bad = faithfulness(ans, ctx)
assert s == 0.67 and bad == ["Unused sick leave pays out at retirement."], "Got " + str((s, bad))
assert faithfulness("", ctx) == (1.0, [])`,
    hint:"content_words: [w for w in re.findall(r\"[a-z0-9]+\", text.lower()) if w not in STOP and len(w) >= 2]. supported: cw = content_words(sentence); ctxw = set(content_words(context)); share = sum(w in ctxw for w in cw) / len(cw).",
    solution:R`import re

STOP = {"the", "a", "an", "is", "are", "of", "to", "and", "in", "for", "on", "per", "you", "your", "can", "up", "at", "be", "it", "get"}

def content_words(text):
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP and len(w) >= 2]

def supported(sentence, context, threshold=0.6):
    cw = content_words(sentence)
    if not cw:
        return True
    ctx = set(content_words(context))
    return sum(w in ctx for w in cw) / len(cw) >= threshold

def faithfulness(answer, context):
    sents = [s for s in re.split(r"(?<=[.!?])\s+", answer.strip()) if s]
    if not sents:
        return (1.0, [])
    bad = [s for s in sents if not supported(s, context)]
    return (round((len(sents) - len(bad)) / len(sents), 2), bad)`,
    bonus:{
      task:"Bonus: write answer_relevance(question, answer): the share of the question's content words that appear in the answer, rounded to 2 (1.0 if the question has none). Then write judge_prompt(context, sentence) that returns exactly:\n<context>CONTEXT</context>\n<claim>SENTENCE</claim>\nIs the claim fully supported by the context? Reply with SUPPORTED or UNSUPPORTED.",
      tests:R`assert answer_relevance("How many PTO days carry over?", "Up to 5 days carry over.") == 0.5, "Got " + str(answer_relevance("How many PTO days carry over?", "Up to 5 days carry over."))
assert judge_prompt("C", "S") == "<context>C</context>\n<claim>S</claim>\nIs the claim fully supported by the context? Reply with SUPPORTED or UNSUPPORTED."`,
      hint:"Question content words: how, many, pto, days, carry, over minus stopwords. Count how many appear in set(content_words(answer)).",
      solution:R`def answer_relevance(question, answer):
    q = content_words(question)
    if not q:
        return 1.0
    a = set(content_words(answer))
    return round(sum(w in a for w in q) / len(q), 2)

def judge_prompt(context, sentence):
    return (f"<context>{context}</context>\n<claim>{sentence}</claim>\n"
            "Is the claim fully supported by the context? Reply with SUPPORTED or UNSUPPORTED.")`}}
},
{ id:"r18", act:4, title:"Beyond text: tables, SQL and other data", mins:40,
  hook:"\"What's our average overtime by department this quarter?\" No document contains that answer. It lives in a database, and chunk retrieval can't add numbers.",
  learn:[
    {h:"Route by question type", p:[
      "Unstructured questions (policies, how-tos) go to document retrieval. Aggregations and exact lookups (counts, totals, averages, \"which employees…\") go to structured data: SQL, a reporting API or a spreadsheet. A router, whether rules or a small model, picks the path. Agentic RAG generalizes this: give an agent retrieval and query tools and let it choose."]},
    {h:"Text-to-SQL, safely", p:[
      "The model writes SQL from the question and the table schema, your code runs it, and the model explains the result. Safety is essential: use a read-only database user, allow only SELECT, restrict to approved tables or views, reject multiple statements, add a LIMIT, set timeouts and log every query. Never run model-written SQL with write permissions."],
     code:R`schema = "employees(id, name, dept, hire_date), overtime(emp_id, week, hours)"
sql = llm(f"Schema: {schema}\nWrite one read-only SQL SELECT for: {question}")
ok, reason = safe_sql(sql, allowed={"employees", "overtime"})
rows = db.execute(sql) if ok else None`},
    {h:"Other data types", p:[
      "Tables inside documents: extract them as structured rows or markdown rather than word soup. Images, scans and diagrams: OCR or vision-capable models that read them directly. Knowledge graphs and GraphRAG: store entities and relationships (employee reports to manager, policy applies to region) to answer multi-hop questions that plain chunk retrieval misses."]}
  ],
  mistakes:["Trying to answer aggregate number questions from text chunks.","Running generated SQL with a user that can write or drop tables.","Flattening tables into text so rows and columns can't be told apart."],
  ai:"Real enterprise questions mix documents and data. Routing and safe text-to-SQL are what make an assistant useful to analysts and managers, not just employees reading policies.",
  interview:{q:"How do you make text-to-SQL safe?", a:"Read-only credentials, an allowlist of tables or curated views, only single SELECT statements, a forced LIMIT and timeout, row-level security for user permissions, validation of the SQL before running it, and full logging. Prefer exposing well-defined views over raw tables."},
  terms:[["Query routing","Sending each question to the right data source or method."],["Text-to-SQL","Having a model write SQL from a natural-language question."],["Read-only credentials","Database access that can't change data."],["Allowlist","The explicit list of permitted tables or actions."],["Agentic RAG","An agent that chooses among retrieval and data tools."],["GraphRAG","Retrieval over a knowledge graph of entities and relationships."]],
  quiz:[
    {t:"mcq", q:"\"How many people joined HR in 2025?\" should go to…", o:["SQL or a reporting API","Chunk retrieval over policies","The system prompt","Nowhere"], a:0},
    {t:"mcq", q:"Which is a must for running model-generated SQL?", o:["A read-only database user","Admin credentials","Multiple statements per query","No logging"], a:0},
    {t:"mcq", q:"\"Who manages the people who approved Ravi's leave?\" is a multi-hop question suited to…", o:["A knowledge graph","TF-IDF","Chunk overlap","Temperature tuning"], a:0}
  ],
  lab:{
    task:"1. route(question): return \"sql\" if the lowercased question contains any of: how many, average, total, count, sum, highest, lowest, most, least. Otherwise \"docs\".\n2. safe_sql(sql, allowed): return (True, \"ok\") or (False, reason), checking in this order:\n   Strip whitespace and one trailing semicolon. If a semicolon remains: \"multiple statements\".\n   It must start with SELECT (any case): otherwise \"not a select\".\n   If it contains a forbidden word (insert, update, delete, drop, alter, create, grant, truncate, attach, pragma) as a whole word, any case: \"forbidden: WORD\" (lowercase, the first found in that list's order).\n   Every table name after FROM or JOIN must be in allowed: otherwise \"table not allowed: NAME\".",
    starter:R`import re

FORBIDDEN = ["insert", "update", "delete", "drop", "alter", "create", "grant", "truncate", "attach", "pragma"]

def route(question):
    return "docs"

def safe_sql(sql, allowed):
    return (True, "ok")`,
    tests:R`assert route("How many people joined HR in 2025?") == "sql" and route("What is the average overtime?") == "sql"
assert route("Can I carry over PTO?") == "docs"
A = {"employees", "overtime"}
assert safe_sql("SELECT dept, AVG(hours) FROM overtime JOIN employees ON id = emp_id GROUP BY dept;", A) == (True, "ok")
assert safe_sql("select * from employees; drop table employees", A) == (False, "multiple statements")
assert safe_sql("DELETE FROM employees", A) == (False, "not a select")
assert safe_sql("SELECT * FROM salaries", A) == (False, "table not allowed: salaries")
assert safe_sql("SELECT 1 FROM employees WHERE note = 'we update weekly'", A) == (False, "forbidden: update"), "Whole-word check catches update"
assert safe_sql("SELECT updated_at FROM employees", A) == (True, "ok"), "updated_at is not the word update"`,
    hint:"Forbidden: re.search(r\"\\b\" + w + r\"\\b\", s, re.I). Tables: re.findall(r\"\\b(?:from|join)\\s+([a-zA-Z_][a-zA-Z0-9_]*)\", s, re.I).",
    solution:R`import re

FORBIDDEN = ["insert", "update", "delete", "drop", "alter", "create", "grant", "truncate", "attach", "pragma"]

def route(question):
    q = question.lower()
    keys = ["how many", "average", "total", "count", "sum", "highest", "lowest", "most", "least"]
    return "sql" if any(k in q for k in keys) else "docs"

def safe_sql(sql, allowed):
    s = sql.strip()
    if s.endswith(";"):
        s = s[:-1].strip()
    if ";" in s:
        return (False, "multiple statements")
    if not s.lower().startswith("select"):
        return (False, "not a select")
    for w in FORBIDDEN:
        if re.search(r"\b" + w + r"\b", s, re.I):
            return (False, "forbidden: " + w)
    for t in re.findall(r"\b(?:from|join)\s+([a-zA-Z_][a-zA-Z0-9_]*)", s, re.I):
        if t not in allowed:
            return (False, "table not allowed: " + t)
    return (True, "ok")`,
    bonus:{
      task:"Bonus: write add_limit(sql, n=100): if the query has no LIMIT clause (whole word, any case), append \" LIMIT n\" (dropping one trailing semicolon first). If it already has a LIMIT larger than n, lower it to n.",
      tests:R`assert add_limit("SELECT * FROM employees;") == "SELECT * FROM employees LIMIT 100"
assert add_limit("SELECT * FROM employees LIMIT 5", 100) == "SELECT * FROM employees LIMIT 5"
assert add_limit("select * from employees limit 5000", 100) == "select * from employees limit 100"`,
      hint:"m = re.search(r\"\\blimit\\s+(\\d+)\", s, re.I); if m and int(m.group(1)) > n: replace that number.",
      solution:R`def add_limit(sql, n=100):
    s = sql.strip()
    if s.endswith(";"):
        s = s[:-1].strip()
    m = re.search(r"\blimit\s+(\d+)", s, re.I)
    if not m:
        return f"{s} LIMIT {n}"
    if int(m.group(1)) > n:
        return s[:m.start(1)] + str(n) + s[m.end(1):]
    return s`}}
},
{ id:"r19", act:4, title:"Running RAG in production", mins:40,
  hook:"The handbook was updated on Monday. On Friday the bot still quotes the old parental leave policy. A RAG system is only as current as its index.",
  learn:[
    {h:"Keeping the index fresh", p:[
      "Re-index incrementally: store a fingerprint (content hash) for each document, and on each sync only add new documents, re-process changed ones and delete removed ones. Full rebuilds are simpler but slow and costly. Trigger syncs on a schedule or from webhooks when source systems change, and always delete chunks of removed documents: stale content is worse than no content."]},
    {h:"Speed and cost", p:[
      "Cache frequent answers and embeddings. Normalize questions before caching so \"PTO carryover?\" and \"pto  carryover\" hit the same entry, and expire entries when underlying documents change. Use prompt caching for long, stable system prompts. Keep the context small with reranking and thresholds. Stream the final answer."]},
    {h:"Operate it", p:[
      "Log each request: query, retrieved ids and scores, prompt size, answer, citations, latency and cost. Monitor no-result rates, \"I don't know\" rates and user feedback (thumbs up or down), and turn bad cases into eval items. Watch security continuously: documents can contain prompt injections, so treat retrieved text as untrusted data, and keep permissions in sync."],
     code:R`import hashlib
def fingerprint(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]`}
  ],
  mistakes:["Rebuilding the whole index nightly when only a few documents changed.","Forgetting to delete chunks of removed documents.","Caching answers without invalidating them when documents change."],
  ai:"Production RAG is mostly operations: freshness, caching, monitoring and security. This is where most real-world effort goes after the demo.",
  interview:{q:"How do you keep a RAG index in sync with changing documents?", a:"Store a content hash per document and run incremental syncs: add new documents, re-chunk and re-embed changed ones, delete chunks for removed ones. Trigger on a schedule or source-system webhooks, invalidate related caches, and monitor sync lag and failures."},
  terms:[["Incremental indexing","Updating only new, changed or removed documents."],["Content hash / fingerprint","A short code that changes whenever the content changes."],["Stale content","Outdated information still in the index."],["Answer cache","Stored answers reused for repeated questions."],["Cache invalidation","Removing cached results when their source data changes."],["Feedback loop","Turning user feedback and failures into improvements and eval cases."]],
  quiz:[
    {t:"mcq", q:"How do you detect that a document changed without re-reading everything?", o:["Compare content hashes","Ask the model","Check the file name","Wait for users to complain"], a:0},
    {t:"mcq", q:"A policy was deleted at the source. The index should…", o:["Keep its chunks forever","Delete its chunks","Mark it as popular","Re-embed it"], a:1},
    {t:"mcq", q:"Why normalize questions before caching?", o:["So trivially different wordings hit the same entry","To encrypt them","To make them longer","It's required by JSON"], a:0}
  ],
  lab:{
    task:"1. plan_sync(indexed, docs): indexed maps doc id to its stored fingerprint; docs maps doc id to current text. Return {\"add\": sorted new ids, \"update\": sorted ids whose fingerprint changed, \"delete\": sorted ids no longer in docs, \"unchanged\": count of the rest}.\n2. class AnswerCache(max_size=100):\n   key(question): lowercase, remove characters that aren't letters, digits or spaces, collapse spaces, strip.\n   get(question): the cached answer or None; count self.hits and self.misses.\n   put(question, answer): store it. If the cache is over max_size, remove the oldest entry.\n   invalidate(doc_id): remove every entry whose answer was stored with that doc id (put takes an optional doc_ids list).",
    starter:R`import hashlib, re

def fingerprint(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

def plan_sync(indexed, docs):
    return {"add": [], "update": [], "delete": [], "unchanged": 0}

class AnswerCache:
    def __init__(self, max_size=100):
        self.max_size = max_size
        self.hits = self.misses = 0`,
    tests:R`indexed = {"pto": fingerprint("15 days"), "old": fingerprint("x"), "remote": fingerprint("3 days")}
docs = {"pto": "15 days", "remote": "2 days", "sick": "10 days"}
assert plan_sync(indexed, docs) == {"add": ["sick"], "update": ["remote"], "delete": ["old"], "unchanged": 1}, "Got " + str(plan_sync(indexed, docs))
c = AnswerCache(max_size=2)
assert c.key("  PTO   carry-over?? ") == "pto carryover", "Got " + repr(c.key("  PTO   carry-over?? "))
assert c.get("pto carryover") is None
c.put("PTO carryover?", "5 days", doc_ids=["pto"])
assert c.get("pto  CARRYOVER") == "5 days" and (c.hits, c.misses) == (1, 1), "Normalize keys and count hits and misses"
c.put("remote days?", "3", doc_ids=["remote"]); c.put("sick days?", "10", doc_ids=["sick"])
assert c.get("PTO carryover?") is None, "The oldest entry should be evicted past max_size"
c.invalidate("remote")
assert c.get("remote days") is None and c.get("sick days") == "10", "invalidate removes entries tied to that doc"`,
    hint:"Use a dict for entries (dicts keep insertion order) and another dict mapping key to its doc_ids. Evict with next(iter(self.data)).",
    solution:R`import hashlib, re

def fingerprint(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

def plan_sync(indexed, docs):
    add = sorted(d for d in docs if d not in indexed)
    delete = sorted(d for d in indexed if d not in docs)
    update = sorted(d for d in docs if d in indexed and fingerprint(docs[d]) != indexed[d])
    unchanged = sum(1 for d in docs if d in indexed and fingerprint(docs[d]) == indexed[d])
    return {"add": add, "update": update, "delete": delete, "unchanged": unchanged}

class AnswerCache:
    def __init__(self, max_size=100):
        self.max_size = max_size
        self.hits = self.misses = 0
        self.data, self.docs = {}, {}
    def key(self, question):
        q = re.sub(r"[^a-z0-9 ]", "", question.lower())
        return re.sub(r"\s+", " ", q).strip()
    def get(self, question):
        k = self.key(question)
        if k in self.data:
            self.hits += 1
            return self.data[k]
        self.misses += 1
        return None
    def put(self, question, answer, doc_ids=None):
        k = self.key(question)
        self.data.pop(k, None)
        self.data[k] = answer
        self.docs[k] = set(doc_ids or [])
        while len(self.data) > self.max_size:
            old = next(iter(self.data))
            del self.data[old]
            self.docs.pop(old, None)
    def invalidate(self, doc_id):
        for k in [k for k, d in self.docs.items() if doc_id in d]:
            self.data.pop(k, None)
            self.docs.pop(k, None)`,
    bonus:{
      task:"Bonus: add time-to-live. Write TTLCache(ttl) with put(question, answer, now) and get(question, now), where now is a number of seconds. An entry expires when now minus its stored time is greater than ttl. Reuse AnswerCache.key for normalization.",
      tests:R`t = TTLCache(ttl=60)
t.put("PTO?", "15", now=0)
assert t.get("pto", now=60) == "15" and t.get("pto", now=61) is None, "Entries expire after ttl seconds"`,
      hint:"Store (answer, time) pairs; on get, check now - stored_time > ttl.",
      solution:R`class TTLCache:
    def __init__(self, ttl):
        self.ttl, self.data = ttl, {}
        self._k = AnswerCache().key
    def put(self, question, answer, now):
        self.data[self._k(question)] = (answer, now)
    def get(self, question, now):
        item = self.data.get(self._k(question))
        if item is None or now - item[1] > self.ttl:
            return None
        return item[0]`}}
},
{ id:"r20", act:4, title:"Capstone: a complete RAG system", mins:60,
  hook:"Put the whole track together: chunking, hybrid retrieval with permissions, fusion, a confidence threshold, a grounded prompt, citation checking and an honest \"I don't know\". This is the core of a portfolio-ready RAG project.",
  learn:[
    {h:"The architecture", p:[
      "Index: split each document into chunks with ids that link back to the document, and store each chunk's tokens, embedding and permissions. Ask: filter by permissions, rank with keyword overlap and with embeddings, fuse with RRF, keep the top k, check confidence, build a numbered grounded prompt, call the model, verify its citations, and return the answer with the source ids it cited."]},
    {h:"Swapping in real components", p:[
      "Replace the toy embedding with a real embedding model, keyword overlap with BM25, the scripted model with the Claude API, and add a reranker between fusion and the prompt. Put the index in pgvector or Chroma, add the eval harness from lessons 16 and 17, and wrap it in a FastAPI endpoint with authentication. The structure you build here stays the same."],
     code:R`answer = client.messages.create(
    model="claude-sonnet-4-6", max_tokens=600,
    system="You answer employee questions from company sources only.",
    messages=[{"role": "user", "content": prompt}],
).content[0].text`},
    {h:"What you now know", p:[
      "When to use RAG, document cleaning, chunking, TF-IDF, BM25, embeddings, vector indexes, filters and permissions, hybrid search with fusion, reranking, grounded prompts, citations, query transformation, contextual retrieval, frameworks, retrieval and answer evals, structured data and production operations. That's the full modern RAG stack."]}
  ],
  mistakes:["Skipping the confidence check, so weak retrieval still produces confident answers.","Trusting model citations without verifying them.","Letting permissions be checked anywhere other than retrieval."],
  ai:"This capstone plus a golden-set eval report is exactly the kind of project that stands out in AI engineering interviews.",
  interview:{q:"Walk me through your RAG architecture.", a:"Ingestion cleans and chunks documents with contextual headers and permission metadata, then indexes them for BM25 and vectors. At query time I condense the question, run permission-filtered hybrid retrieval, fuse with RRF, rerank, apply a relevance threshold, and build a numbered grounded prompt. The answer's citations and quotes are verified before returning. A golden set tracks recall@k, MRR and faithfulness on every change."},
  terms:[["End-to-end RAG","The full path from documents to a verified, cited answer."],["Confidence threshold","The minimum retrieval score needed to attempt an answer."],["Abstention","Declining to answer when evidence is weak."],["Citation verification","Checking cited sources exist and support the answer."],["RAG harness","The code around retrieval and generation: filters, checks, logging."]],
  quiz:[
    {t:"mcq", q:"The best retrieval score is very low. What should the system do?", o:["Answer anyway","Abstain with \"I don't know\" without calling the model","Retry with higher temperature","Show random sources"], a:1},
    {t:"mcq", q:"The model cites [3] when only two sources were given. The system should…", o:["Show the answer","Reject it and fall back safely","Add a third source","Ignore citations"], a:1},
    {t:"mcq", q:"Where are permissions enforced in this architecture?", o:["At retrieval, before ranking","In the model's instructions","After the answer","Nowhere"], a:0}
  ],
  lab:{
    task:"Finish MiniRAG. Helpers are provided: tokenize, embed, cosine and rrf.\n\nindex(docs): docs are {\"id\", \"text\", \"groups\"}. Split each doc's words into chunks of self.size words; chunk ids are f\"{doc_id}#{n}\" (n from 0). Store each chunk as {\"id\", \"doc\", \"text\", \"groups\", \"vec\": embed(text)} in self.chunks.\n\nretrieve(question, user_groups, k=3):\n1. Allowed chunks: groups include \"everyone\" or share a group with user_groups.\n2. Keyword ranking: allowed chunk ids with at least one shared token, sorted by shared-token count (ties keep chunk order).\n3. Vector ranking: allowed chunk ids with cosine above 0, sorted by cosine.\n4. Fuse with rrf and return the top k chunk dicts, plus the best cosine among them (0.0 if none): (chunks, best).\n\nask(question, user_groups):\n1. If no chunks or best < self.min_score: return {\"answer\": \"I don't know.\", \"sources\": []} without calling the LLM.\n2. Otherwise build a prompt with numbered sources, one per line: [1] TEXT, then a blank line, then Question: QUESTION. Call self.llm(prompt).\n3. Find cited numbers like [2]. If any is outside 1..number of chunks, return the \"I don't know.\" result. Otherwise return {\"answer\": the reply, \"sources\": sorted chunk ids that were cited}.",
    starter:R`import re, math

def tokenize(text):
    return re.findall(r"[a-z0-9]+", text.lower())

def embed(text, dim=64):
    vec = [0.0] * dim
    for w in tokenize(text):
        h = 0
        for ch in w:
            h = (h * 31 + ord(ch)) % (2 ** 32)
        vec[h % dim] += 1 if (h // dim) % 2 == 0 else -1
    n = math.sqrt(sum(x * x for x in vec))
    return [x / n for x in vec] if n else vec

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

def rrf(rankings, k=60):
    scores, order = {}, []
    for lst in rankings:
        for rank, i in enumerate(lst, start=1):
            if i not in scores:
                order.append(i)
            scores[i] = scores.get(i, 0) + 1 / (k + rank)
    return sorted(order, key=lambda i: -scores[i])

class MiniRAG:
    def __init__(self, llm, size=9, min_score=0.2):
        self.llm, self.size, self.min_score = llm, size, min_score
        self.chunks = []

    def index(self, docs):
        pass

    def retrieve(self, question, user_groups, k=3):
        return ([], 0.0)

    def ask(self, question, user_groups):
        return {"answer": "I don't know.", "sources": []}`,
    tests:R`DOCS = [
  {"id": "pto", "groups": ["everyone"], "text": "New hires get 15 PTO days per year. PTO accrues monthly from the start date. Up to 5 unused PTO days carry over into January."},
  {"id": "remote", "groups": ["everyone"], "text": "Employees may work remotely up to 3 days per week with manager approval."},
  {"id": "exec", "groups": ["hr-leaders"], "text": "Executive bonus pool is 20 percent of salary and PTO is unlimited for executives."},
]
prompts = []
def llm(p):
    prompts.append(p)
    return "Up to 5 unused PTO days carry over [1]."
rag = MiniRAG(llm)
rag.index(DOCS)
assert [c["id"] for c in rag.chunks] == ["pto#0", "pto#1", "pto#2", "remote#0", "remote#1", "exec#0", "exec#1"], "Got " + str([c["id"] for c in rag.chunks])
assert rag.chunks[1]["text"] == "accrues monthly from the start date. Up to 5", "Chunks are self.size words"
hits, best = rag.retrieve("how many unused PTO days carry over", ["staff"])
assert all(not h["id"].startswith("exec") for h in hits), "Staff must never retrieve exec chunks"
assert hits[0]["id"] == "pto#2" and best > 0.2, "Got " + str([h["id"] for h in hits]) + " best=" + str(best)
r = rag.ask("how many unused PTO days carry over", ["staff"])
assert r == {"answer": "Up to 5 unused PTO days carry over [1].", "sources": ["pto#2"]}, "Got " + str(r)
assert prompts[-1].startswith("[1] ") and prompts[-1].endswith("\n\nQuestion: how many unused PTO days carry over"), "Check the prompt format"
n = len(prompts)
assert rag.ask("zebra migration patterns", ["staff"]) == {"answer": "I don't know.", "sources": []} and len(prompts) == n, "Weak retrieval should abstain without calling the LLM"
bad = MiniRAG(lambda p: "It is 99 days [7].")
bad.index(DOCS)
assert bad.ask("how many unused PTO days carry over", ["staff"])["answer"] == "I don't know.", "Invalid citations should fall back"
leader = MiniRAG(lambda p: "Executive PTO is unlimited [1].")
leader.index(DOCS)
h, b = leader.retrieve("executive PTO unlimited", ["hr-leaders"])
assert h[0]["id"] == "exec#1", "HR leaders can retrieve exec chunks. Got " + str([x["id"] for x in h])`,
    hint:"index: words = d[\"text\"].split(); for n, i in enumerate(range(0, len(words), self.size)): text = \" \".join(words[i:i + self.size]). retrieve: keyword ranking uses len(set(tokenize(question)) & set(tokenize(c[\"text\"]))). ask: cited = {int(x) for x in re.findall(r\"\\[(\\d+)\\]\", reply)}.",
    solution:R`import re, math

def tokenize(text):
    return re.findall(r"[a-z0-9]+", text.lower())

def embed(text, dim=64):
    vec = [0.0] * dim
    for w in tokenize(text):
        h = 0
        for ch in w:
            h = (h * 31 + ord(ch)) % (2 ** 32)
        vec[h % dim] += 1 if (h // dim) % 2 == 0 else -1
    n = math.sqrt(sum(x * x for x in vec))
    return [x / n for x in vec] if n else vec

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

def rrf(rankings, k=60):
    scores, order = {}, []
    for lst in rankings:
        for rank, i in enumerate(lst, start=1):
            if i not in scores:
                order.append(i)
            scores[i] = scores.get(i, 0) + 1 / (k + rank)
    return sorted(order, key=lambda i: -scores[i])

class MiniRAG:
    def __init__(self, llm, size=9, min_score=0.2):
        self.llm, self.size, self.min_score = llm, size, min_score
        self.chunks = []

    def index(self, docs):
        for d in docs:
            words = d["text"].split()
            for n, i in enumerate(range(0, len(words), self.size)):
                text = " ".join(words[i:i + self.size])
                self.chunks.append({"id": f"{d['id']}#{n}", "doc": d["id"], "text": text,
                                    "groups": d["groups"], "vec": embed(text)})

    def retrieve(self, question, user_groups, k=3):
        allowed = [c for c in self.chunks
                   if "everyone" in c["groups"] or set(c["groups"]) & set(user_groups)]
        q_tokens, q_vec = set(tokenize(question)), embed(question)
        kw = [(len(q_tokens & set(tokenize(c["text"]))), c["id"]) for c in allowed]
        kw_rank = [i for s, i in sorted(kw, key=lambda x: -x[0]) if s > 0]
        cos = {c["id"]: cosine(q_vec, c["vec"]) for c in allowed}
        vec_rank = [i for i in sorted(cos, key=lambda i: -cos[i]) if cos[i] > 0]
        ids = rrf([kw_rank, vec_rank])[:k]
        by_id = {c["id"]: c for c in allowed}
        hits = [by_id[i] for i in ids]
        best = max((cos[i] for i in ids), default=0.0)
        return (hits, best)

    def ask(self, question, user_groups):
        dont_know = {"answer": "I don't know.", "sources": []}
        hits, best = self.retrieve(question, user_groups)
        if not hits or best < self.min_score:
            return dont_know
        prompt = "\n".join(f"[{n}] {c['text']}" for n, c in enumerate(hits, start=1))
        prompt += "\n\nQuestion: " + question
        reply = self.llm(prompt)
        cited = {int(x) for x in re.findall(r"\[(\d+)\]", reply)}
        if any(not 1 <= n <= len(hits) for n in cited):
            return dont_know
        return {"answer": reply, "sources": sorted(hits[n - 1]["id"] for n in cited)}`}
}
];
