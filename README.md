# AI Quest Academy

A free, game-style academy that takes a complete beginner to building AI agents. Six full tracks are live, 120 lessons in all:

- **AI Fluency** (start here, no coding): 20 lessons with 14 writing exercises, built on Anthropic's 4D AI Fluency Framework
- **Python for AI**, **Agentic AI**, **RAG and AI Frameworks**, **Algorithms and Machine Learning** and **Workflow Automation**: 100 lessons, 100 coding labs and 58 bonus challenges

Plus a **Certifications hub** that maps all four Claude certifications (Associate, Developer, Architect Foundations, Architect Professional) to Anthropic's free official prep courses and to the lessons here that build the same skills.

Every lesson has three parts:

- **Learn:** a real-world scenario, plain-English explanations, working code, common mistakes, how it's used in AI, an interview question with a strong answer, and key terms
- **Quiz:** instant feedback; missed questions come back until you get them right
- **Lab or practice:** write real Python in the browser with automatic tests, hints and solutions (RAG, ML and Automation labs add a harder **bonus challenge**). AI Fluency lessons use writing practice with checklist feedback instead of code.

It also has XP, levels, act badges, a daily streak, **Daily Review** (5 mixed questions a day that bring back the ones you missed), **practice tests** for every track, **interview practice**, a searchable **word bank** of 700 terms, and a **capstone generator** that gives every learner a unique portfolio project brief (industry + AI architecture + two constraints + a 4-week plan + a scoring rubric).

## Track 0: AI Fluency (no coding)

| Act | Lessons |
|---|---|
| 1. Understanding AI | What generative AI is, capabilities and limits, the 4D framework and three modes, the tool landscape, privacy |
| 2. Delegation and Description | Deciding what to delegate, describing tasks, prompting techniques, documents and data, reusable templates and projects |
| 3. Discernment | Evaluating output, fact-checking, the Description–Discernment loop, bias, thinking with AI |
| 4. Diligence and the road ahead | Owning your work, governance and risk, troubleshooting, team workflows and agents, capstone playbook |

The 4D AI Fluency Framework is by Rick Dakan, Joseph Feller and Anthropic (CC BY-NC-SA 4.0). Lessons here are original.

## Track 1: Python for AI

| Act | Lessons |
|---|---|
| 1. Foundations | First program, variables and types, strings and f-strings, decisions, loops |
| 2. Data and functions | Lists and tuples, dictionaries and sets, functions, errors and exceptions, modules and packages |
| 3. Real-world Python | Files and JSON, classes, inheritance and dataclasses, lambdas and generators, regex and text processing |
| 4. Python for AI | APIs and HTTP (REST, GraphQL, SOAP, webhooks, SDKs, MCP, auth), NumPy and pandas, algorithms and Big-O, vectors and cosine similarity, building a mini AI agent |

## Track 2: Agentic AI

| Act | Lessons |
|---|---|
| 1. How LLMs and the API work | What an LLM is, the Messages API, model selection and cost (caching, batches), prompt engineering, structured output |
| 2. Tools and agents | Tool use, tool design, the agentic loop, workflows vs agents, memory and context management |
| 3. Multi-agent, MCP and Claude Code | Planning patterns, multi-agent systems, Model Context Protocol, Claude Code and the Agent SDK, human in the loop |
| 4. Production-grade agents | Security and prompt injection, evals, reliability and streaming, observability and cost, capstone agent |

Agentic AI follows the public topic areas of Anthropic's developer certification. All practice questions are original; none are real exam questions. Labs run offline with scripted models that return data in the same shape as the real Messages API.

## Track 3: RAG and AI Frameworks

| Act | Lessons |
|---|---|
| 1. From documents to vectors | When to use RAG, loading and cleaning documents, chunking, TF-IDF, embeddings |
| 2. Search that actually works | Vector search and databases, metadata filters and access control, BM25, hybrid search with RRF, reranking |
| 3. Grounded generation and frameworks | Grounded prompts, citations and verification, query transformation, contextual chunks and small-to-big, LangChain and LlamaIndex |
| 4. Production RAG | Retrieval evals (recall@k, MRR, nDCG), answer faithfulness, text-to-SQL safety, incremental indexing and caching, capstone RAG system |

Every RAG lab builds a real piece of a retrieval system in plain Python, ending with a complete permission-aware hybrid RAG with citation checking and abstention.

## Track 4: Algorithms and Machine Learning

| Act | Lessons |
|---|---|
| 1. Data and classic models | Features, labels and leakage, EDA and outliers, linear regression and gradient descent, logistic regression, splits and cross-validation |
| 2. Evaluation and algorithms | Precision, recall, F1 and AUC, decision trees, random forests and boosting, k-means, scaling and PCA |
| 3. Neural networks from scratch | Feature engineering and pipelines, the forward pass, backpropagation, a mini autograd engine (tiny PyTorch), overfitting and regularization |
| 4. Modern AI and MLOps | CNNs, transformers and attention, fine-tuning and LoRA, MLOps and drift, capstone attrition model with fairness check |

Everything is built from scratch in plain Python, so learners see exactly what scikit-learn and PyTorch do underneath.

## Track 5: Workflow Automation

| Act | Lessons |
|---|---|
| 1. Automation foundations | Triggers and workflow engines, signed webhooks, cron scheduling, n8n items, expressions and AI nodes, the 2026 landscape from workflows to AI agents |
| 2. AI steps and reliability | Pagination and rate limits, AI classification steps, structured data validation, human approvals, retries and dead-letter queues |
| 3. Building and integrating | Idempotency, queues, background jobs and durable execution, FastAPI services, Slack and Teams messages, document extraction and generation |
| 4. Enterprise-grade automation | CRM, ERP and other system integrations with delta syncs, tamper-evident audit trails, secrets and least privilege, ROI, capstone onboarding automation |

Labs build the engine parts behind tools like n8n, Zapier and Make, ending with a production-style customer onboarding automation. Scenarios span retail, SaaS, support, finance and agencies, and lesson 5 covers the 2026 landscape: AI agent builders, durable execution engines, MCP and computer-use agents. Their outlines are already in the app.

## How it runs

No build step, no server, no sign-up. Open `index.html` in a browser, or serve the folder with any static host. Progress is saved in the browser.

Labs run real Python 3 in the browser using [Pyodide](https://pyodide.org). If Pyodide can't load, the app falls back to lite Python ([Skulpt](https://skulpt.org)). In lite mode, labs that use json, regex or eval need full Python.

## Project structure

```
index.html              Page shell: header, tabs, script tags
css/styles.css          All styles
js/data/                Content: one file per track, plus interview questions, tracks, capstone and certifications
js/engine/              The app: state and XP, lessons, quizzes, Python runtime, labs, word bank, capstone, certifications
js/main.js              Starts the app
CURRICULUM.md           How to add lessons and tracks
```

## Publish it free with GitHub Pages

1. In the repo, go to **Settings > Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
2. In about a minute it's live at `https://adithyasekhar.github.io/AD-s-SI-ai-quest-academy/`.

## Add a lesson or a whole new track

See [CURRICULUM.md](CURRICULUM.md). Each track's lessons are in their own file in `js/data/`. The certification map is `CERTS` in `js/data/certs.js`. A new track is a new data file, a script tag in `index.html` and one entry in `TRACKS`.

## About certifications

The Certifications tab links to Anthropic's official, free prep courses. The official courses and exams belong to Anthropic. Everything in AI Quest Academy is original practice material; none of it is real exam content.
