/* =====================================================================
   CERTIFICATIONS HUB: maps Anthropic's official, free prep courses to
   lessons in this academy. Official content lives on Anthropic's site;
   everything here is original practice material, not exam questions.
   ===================================================================== */
const SJ = "https://anthropic-partners.skilljar.com/";
const CERTS = [
  { id:"associate", name:"Claude Certified Associate – Foundations",
    who:"For knowledge workers who use AI tools at work: operations, marketing, project management, education, communications and more. No coding needed.",
    official:SJ + "path/claude-certified-associate-foundations",
    prereqs:["Claude 101","AI Fluency: Framework & Foundations","AI Capabilities and Limitations"],
    modules:[
      {name:"Claude Platform & Model Foundations", covers:"Choosing the entry point, features, model and context before you prompt.", ours:["f01","f02","f04","a03"]},
      {name:"Prompting & Task Execution", covers:"Structured, repeatable prompting and breaking down complex requests.", ours:["f07","f08","a04"]},
      {name:"Evaluating & Validating Claude's Output", covers:"Checking accuracy and completeness, spotting hallucinations and bias.", ours:["f11","f12","f14"]},
      {name:"Workflow Integration & Solution Design", covers:"Deciding which workflow steps to delegate and communicating value and limits.", ours:["f06","f19","f15"]},
      {name:"Configuration & Knowledge Management", covers:"Setting up projects, instructions and knowledge sources that stay accurate.", ours:["f10","a10"]},
      {name:"Governance, Risk & Responsible Use", covers:"Judging what's safe and appropriate to bring to AI.", ours:["f05","f16","f17"]},
      {name:"Troubleshooting & Optimization", covers:"Diagnosing weak output, finding the root cause and making fixes stick.", ours:["f13","f18"]}
    ],
    recommended:["fluency"] },
  { id:"developer", name:"Claude Certified Developer – Foundations",
    who:"For hands-on builders who write production code, build agents and run evals.",
    official:SJ + "path/claude-certified-developer-foundations",
    prereqs:["Claude 101","Claude Code 101","Claude Platform 101","Claude Code in Action","AI Fluency: Framework & Foundations","Building with the Claude API","Introduction to Model Context Protocol","Model Context Protocol: Advanced Topics","AI Capabilities and Limitations"],
    modules:[
      {name:"MSO Foundations", covers:"Tokens, the context window, sampling, model tiers, SDK vs REST.", ours:["a01","a02","a03"]},
      {name:"Production-Grade Prompting, Agents & Tool Use", covers:"Prompts, tool schemas, the tool-use loop, context and agent design.", ours:["a04","a05","a06","a07","a08","a09","a10","a11","a12"]},
      {name:"Claude Code, MCP & Integration", covers:"Claude Code permissions and project context, Skills and plugins, MCP.", ours:["a13","a14","w04"], gap:"Agent Skills and plugin packaging are only touched on here; use the official course."},
      {name:"Production Engineering, Evals & Security", covers:"Evals, tracing, cost and latency budgets, prompt injection and secrets.", ours:["a15","a16","a17","a18","a19","w18"]},
      {name:"Accelerators & IP Contribution", covers:"Packaging a working build into something reusable across projects.", ours:["a20","w13"], gap:"Packaging reusable accelerators is covered lightly; use the official course."}
    ],
    recommended:["python","agentic","rag"] },
  { id:"architect_f", name:"Claude Certified Architect – Foundations",
    who:"For people designing Claude solutions: agents, tools and MCP, Claude Code, prompting and context management.",
    official:SJ + "page/claude-certified-architect-foundations-prep-courses",
    prereqs:[],
    courses:["AI Fluency: Framework & Foundations","Building with the Claude API","Claude on Google Cloud","Claude Code in Action","Claude 101","Claude with Amazon Bedrock","Introduction to Model Context Protocol"],
    modules:[
      {name:"AI Fluency", covers:"Delegation, Description, Discernment and Diligence.", ours:["f03","f06","f07","f11","f16"]},
      {name:"Building with the Claude API", covers:"Messages, tools, structured output, RAG and agents.", ours:["a02","a05","a06","a08","r20"]},
      {name:"Claude Code in Action", covers:"Configuring and steering Claude Code safely.", ours:["a14"]},
      {name:"Model Context Protocol", covers:"Servers, clients, tools, resources and prompts.", ours:["a13"]},
      {name:"Claude on Google Cloud and Amazon Bedrock", covers:"Running Claude through cloud platforms.", ours:[], gap:"Cloud platform specifics aren't covered here; use the official courses."}
    ],
    recommended:["agentic","rag"] },
  { id:"architect_p", name:"Claude Certified Architect – Professional",
    who:"For experienced end-to-end system designers who take Claude solutions from discovery to production.",
    official:SJ + "path/claude-certified-architect-professional",
    prereqs:["Claude 101","Claude Code in Action","AI Fluency: Framework & Foundations","Building with the Claude API","Introduction to Model Context Protocol","AI Capabilities and Limitations"],
    modules:[
      {name:"Claude Platform & Solution Design", covers:"Turning ambiguous problems into scoped, cost-conscious architectures.", ours:["a03","a09","a12","r01"]},
      {name:"Enterprise Integration & Production", covers:"From proof of concept to production: cost, latency, reliability, integration patterns.", ours:["a18","a19","w16","w12"]},
      {name:"Responsible AI, Safety & Risk for Architects", covers:"The full safety stack: input and output screening, tool authorization, failing closed.", ours:["a15","a16","a17","f17"]},
      {name:"Stakeholder Engagement, Lifecycle & GTM", covers:"Discovery with non-technical stakeholders, trade-offs, handoffs.", ours:["f19","w19"], gap:"Stakeholder discovery and go-to-market are covered lightly; use the official course."},
      {name:"Team Enablement & Operational Productivity", covers:"Helping a team adopt and run a live Claude system.", ours:["f10","f19","a14"]}
    ],
    recommended:["agentic","rag","auto"] }
];
