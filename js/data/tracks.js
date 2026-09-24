/* Future tracks: same 20-lesson shape (learn, quiz, lab, words). */
const TRACKS = [
  {id:"fluency", title:"AI Fluency (start here, no coding)", color:"#0F7C8C", live:true, short:"AI Fluency", lessons:FLU_LESSONS, acts:FLU_ACTS,
   blurb:"For everyone, in any field. Understand what AI can and can't do, and learn Anthropic's 4D framework: Delegation, Description, Discernment and Diligence. Writing practice instead of code. Prepares you for the Claude Certified Associate exam topics."},
  {id:"python", title:"Python for AI", color:"#2F6FB3", live:true, short:"Python", lessons:LESSONS, acts:ACTS,
   blurb:"From your first print() to building a retrieval engine and a mini agent. 20 lessons, 20 coding labs."},
  {id:"agentic", title:"Agentic AI", color:"#C23A57", live:true, short:"Agentic AI", lessons:AGENT_LESSONS, acts:AGENT_ACTS,
   blurb:"LLM APIs, prompting, tools, the agentic loop, multi-agent systems, MCP, Claude Code, security, evals and production. Aligned to the topic areas of Anthropic's developer certification. 20 lessons, 20 labs."},
  {id:"rag", title:"RAG and AI frameworks", color:"#A06A00", live:true, short:"RAG", lessons:RAG_LESSONS, acts:RAG_ACTS,
   blurb:"Build a real retrieval system from scratch: cleaning, chunking, TF-IDF, BM25, embeddings, vector search, permissions, hybrid search, reranking, citations, evals and production. 20 lessons, 20 labs, 19 bonus challenges."},
  {id:"ml", title:"Algorithms and machine learning", color:"#6A4BC4", live:true, short:"ML", lessons:ML_LESSONS, acts:ML_ACTS,
   blurb:"Build machine learning from scratch: regression, classification, trees, boosting, clustering, PCA, neural networks, backpropagation, a mini autograd engine, attention and LoRA. 20 lessons, 20 labs, 20 bonus challenges."},
  {id:"auto", title:"Workflow automation", color:"#3C8A3E", live:true, short:"Automation", lessons:AUTO_LESSONS, acts:AUTO_ACTS,
   blurb:"Build the engine behind n8n, Zapier and Make: triggers, signed webhooks, cron, expressions, AI steps, approvals, retries, idempotency, queues, FastAPI, enterprise integrations, audit trails and ROI. 20 lessons, 20 labs, 19 bonus challenges."}
];

/* Capstone generator ingredients (shaped by 2026 hiring signals:
   RAG, agents, evals, guardrails, shipping to production, domain focus). */
const CAP = {
  domains:[
    {name:"HR and people operations", data:"an employee handbook, benefits PDFs and a CSV of sample HR tickets", user:"a new employee in their first week"},
    {name:"Healthcare clinic operations", data:"public clinic FAQs, appointment rules and a synthetic schedule CSV", user:"a front-desk coordinator"},
    {name:"Agriculture advisory", data:"public crop guides, a weather API and a CSV of soil test results", user:"a small farmer using a phone in the field"},
    {name:"Retail and inventory", data:"a product catalog CSV, return policies and sample order history", user:"a store manager"},
    {name:"Personal finance", data:"sample bank-statement CSVs and public budgeting guides", user:"a young professional building a budget"},
    {name:"Education and tutoring", data:"open textbook chapters and a bank of practice questions", user:"a high school student preparing for an exam"},
    {name:"Legal and contracts", data:"public sample contracts and a clause checklist", user:"a small business owner reviewing a vendor contract"},
    {name:"Real estate", data:"public listing data, county records and mortgage guides", user:"a first-time home buyer"},
    {name:"Customer support", data:"product docs, a FAQ and past support tickets", user:"a support agent handling 50 tickets a day"},
    {name:"Travel planning", data:"public destination guides and a flights or weather API", user:"a family planning a one-week trip"},
    {name:"Manufacturing quality", data:"standard operating procedures and a CSV of defect logs", user:"a quality engineer on the shop floor"},
    {name:"Nonprofit services", data:"program eligibility rules and community resource lists", user:"a caseworker helping families find support"}
  ],
  archetypes:[
    {name:"RAG assistant with citations", core:"Answer questions from the documents and cite the exact source for every claim.", stack:"an embedding model, a vector store (Chroma, FAISS or pgvector) and an LLM API"},
    {name:"Tool-using agent", core:"Complete multi-step tasks by choosing and calling at least three tools you write.", stack:"an LLM API with tool calling, your own tool functions and a step limit"},
    {name:"Multi-agent team", core:"A planner agent splits the job, worker agents do the parts and a reviewer agent checks the result.", stack:"LangGraph or plain-Python orchestration and an LLM API"},
    {name:"AI automation pipeline", core:"An event triggers a pipeline that reads, classifies, drafts and routes work with no manual steps except approvals.", stack:"FastAPI webhooks or n8n, a scheduler and an LLM API"},
    {name:"RAG plus agent hybrid", core:"An agent that searches your documents as one of its tools and takes actions based on what it finds.", stack:"a vector store, an LLM API with tool calling and your own tools"}
  ],
  twists:[
    "Every answer must cite its source, and must say \"I don't know\" when the documents don't cover it.",
    "It must work in two languages of your choice.",
    "A human must approve any action that changes data or sends a message.",
    "Build an eval set of 25 real questions and reach an 80% pass rate. Report the number.",
    "Redact personal data (PII) before any text reaches the model.",
    "It must accept both PDF and CSV input.",
    "Stream answers to the user as they are generated.",
    "A full eval run must cost under $2. Track and report token usage.",
    "Expose at least one of your tools as an MCP server.",
    "Log every step (inputs, tool calls, outputs, timing) to a JSONL file and build a one-page report from it.",
    "It must run on a phone-sized screen with a simple web UI.",
    "Handle one failure mode on purpose: API timeout, bad JSON or an empty search result."
  ],
  rubric:[["Works end to end on real inputs",25],["Code quality: structure, type hints, tests",20],["Evaluation: measured results, not vibes",20],["Guardrails and safety",15],["README and 3-minute demo video",10],["Originality of your idea",10]]
};
