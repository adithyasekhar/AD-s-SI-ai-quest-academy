/* =====================================================================
   TRACK 5: WORKFLOW AUTOMATION
   Labs build the engine parts behind tools like n8n, Zapier and Make:
   triggers, webhooks, cron, expressions, retries, idempotency, queues,
   approvals, integrations and audit trails.
   ===================================================================== */
const AUTO_ACTS = [
  {n:1, title:"Automation foundations", badge:"Automator"},
  {n:2, title:"AI steps and reliability", badge:"Reliability Engineer"},
  {n:3, title:"Building and integrating", badge:"Integration Builder"},
  {n:4, title:"Enterprise-grade automation", badge:"Automation Architect"}
];

const AUTO_LESSONS = [
/* ---------------- ACT 1 ---------------- */
{ id:"w01", act:1, title:"Triggers, actions and workflows", mins:30,
  hook:"Every morning, an operations coordinator at an online store copies new orders into the shipping tool, the invoicing system and a spreadsheet, then emails each customer. It takes three hours and something is always missed. That's a workflow waiting to be automated.",
  learn:[
    {h:"The anatomy of an automation", p:[
      "A trigger starts the workflow: an event (a new order is placed), a schedule (every weekday at 8am), a webhook call, a new email or a manual button. Then a sequence of steps runs: actions (create a ticket, send a message), transformations (reshape data), conditions (only if the order ships express) and waits (until approval). Each step reads data from earlier steps and adds its own."]},
    {h:"Workflows as data", p:[
      "Tools like n8n, Zapier, Make and Power Automate store a workflow as a definition: a trigger plus an ordered list of steps with settings, usually saved as JSON. An engine reads the definition, runs each step and passes a context from step to step. That's why workflows can be versioned, exported, reviewed and tested like code."],
     code:R`workflow = {
  "trigger": {"type": "event", "name": "new_order"},
  "steps": [
    {"action": "create_invoice"},
    {"action": "notify_customer"},
    {"action": "book_express", "when": ["shipping", "express"]},
  ],
}`},
    {h:"What to automate first", p:[
      "Good candidates are frequent, rule-based, stable and painful: copy-paste between systems, routine notifications, report generation, data cleanup. Map the current process with the people who do it before automating it, or you'll just automate the confusion faster."]}
  ],
  mistakes:["Automating a broken process instead of fixing it first.","Building one giant workflow that does everything, so nobody can debug it.","Not talking to the people who do the work today, and missing the exceptions they handle."],
  ai:"AI makes automations smarter (reading emails, classifying requests), but the backbone is always triggers, steps and data passing. Master that and every tool feels familiar.",
  interview:{q:"How do you decide which processes to automate?", a:"I look for tasks that are frequent, rule-based, stable and error-prone, then estimate time saved against build and maintenance cost. I map the current process with the people doing it, simplify it first, and start with a small, high-value slice I can measure."},
  terms:[["Trigger","The event, schedule or call that starts a workflow."],["Action","A step that does something, like creating a record or sending a message."],["Workflow","A trigger plus an ordered set of steps."],["Context","The data passed along and added to as steps run."],["Condition","A rule that decides whether a step runs."],["Workflow definition","The saved description of a workflow, often JSON."]],
  quiz:[
    {t:"mcq", q:"\"Every weekday at 7am, email the open-tickets report\" uses which trigger?", o:["Schedule","Webhook","Manual button","New email"], a:0},
    {t:"mcq", q:"Which task is the best first automation candidate?", o:["Daily copy of new orders between two systems","A one-time executive strategy memo","Negotiating a vendor contract","Choosing a company strategy"], a:0},
    {t:"mcq", q:"Why store workflows as definitions (data)?", o:["They can be versioned, reviewed and tested like code","It's faster to type","Engines can't run code","It hides them from auditors"], a:0}
  ],
  lab:{
    task:"Build a tiny workflow engine. actions maps an action name to a function that takes the context dict and returns a dict of updates.\n\nrun_workflow(workflow, event, actions): start the context as a copy of event. For each step: if it has \"when\": [key, value] and context.get(key) != value, log (action, \"skipped\") and continue. Otherwise call the action, merge its returned dict into the context and log (action, \"done\"). Return (context, log).",
    starter:R`def run_workflow(workflow, event, actions):
    context = dict(event)
    log = []
    return (context, log)

actions = {
    "create_invoice": lambda ctx: {"invoice": "INV-" + str(ctx["order_id"])},
    "notify_customer": lambda ctx: {"notified": ctx["email"]},
    "book_express": lambda ctx: {"courier": "booked"},
}
workflow = {"trigger": {"type": "event", "name": "new_order"},
            "steps": [{"action": "create_invoice"}, {"action": "notify_customer"},
                      {"action": "book_express", "when": ["shipping", "express"]}]}
print(run_workflow(workflow, {"order_id": 42, "email": "sam@example.com", "shipping": "standard"}, actions))`,
    tests:R`actions = {
    "create_invoice": lambda ctx: {"invoice": "INV-" + str(ctx["order_id"])},
    "notify_customer": lambda ctx: {"notified": ctx["email"], "msg": "Invoice " + ctx["invoice"]},
    "book_express": lambda ctx: {"courier": "booked"},
}
wf = {"trigger": {"type": "event", "name": "new_order"},
      "steps": [{"action": "create_invoice"}, {"action": "notify_customer"}, {"action": "book_express", "when": ["shipping", "express"]}]}
ev = {"order_id": 42, "email": "sam@example.com", "shipping": "standard"}
ctx, log = run_workflow(wf, ev, actions)
assert ctx == {"order_id": 42, "email": "sam@example.com", "shipping": "standard", "invoice": "INV-42", "notified": "sam@example.com", "msg": "Invoice INV-42"}, "Later steps should see earlier results. Got " + str(ctx)
assert log == [("create_invoice", "done"), ("notify_customer", "done"), ("book_express", "skipped")], "Got " + str(log)
assert ev == {"order_id": 42, "email": "sam@example.com", "shipping": "standard"}, "Don't modify the original event"
ctx2, log2 = run_workflow(wf, dict(ev, shipping="express"), actions)
assert ctx2["courier"] == "booked" and log2[-1] == ("book_express", "done")`,
    hint:"for step in workflow[\"steps\"]: name = step[\"action\"]; cond = step.get(\"when\"); if cond and context.get(cond[0]) != cond[1]: log and continue; context.update(actions[name](context)).",
    solution:R`def run_workflow(workflow, event, actions):
    context = dict(event)
    log = []
    for step in workflow["steps"]:
        name = step["action"]
        cond = step.get("when")
        if cond and context.get(cond[0]) != cond[1]:
            log.append((name, "skipped"))
            continue
        context.update(actions[name](context))
        log.append((name, "done"))
    return (context, log)

actions = {
    "create_invoice": lambda ctx: {"invoice": "INV-" + str(ctx["order_id"])},
    "notify_customer": lambda ctx: {"notified": ctx["email"]},
    "book_express": lambda ctx: {"courier": "booked"},
}
workflow = {"trigger": {"type": "event", "name": "new_order"},
            "steps": [{"action": "create_invoice"}, {"action": "notify_customer"},
                      {"action": "book_express", "when": ["shipping", "express"]}]}
print(run_workflow(workflow, {"order_id": 42, "email": "sam@example.com", "shipping": "standard"}, actions))`,
    bonus:{
      task:"Bonus: add stop-on-error. Write run_safe(workflow, event, actions): like run_workflow, but if an action raises an exception, log (action, \"failed: \" + str(error)), stop running further steps, and return (context, log, False). Return True as the third value when everything succeeds.",
      tests:R`def boom(ctx): raise RuntimeError("invoicing system down")
acts = {"a": lambda c: {"x": 1}, "b": boom, "c": lambda c: {"y": 2}}
wf = {"steps": [{"action": "a"}, {"action": "b"}, {"action": "c"}]}
ctx, log, ok = run_safe(wf, {}, acts)
assert ok is False and ctx == {"x": 1} and log == [("a", "done"), ("b", "failed: invoicing system down")], "Got " + str((ctx, log, ok))
assert run_safe({"steps": [{"action": "a"}]}, {}, acts)[2] is True`,
      hint:"Wrap the action call in try/except Exception as e.",
      solution:R`def run_safe(workflow, event, actions):
    context, log = dict(event), []
    for step in workflow["steps"]:
        name, cond = step["action"], step.get("when")
        if cond and context.get(cond[0]) != cond[1]:
            log.append((name, "skipped"))
            continue
        try:
            context.update(actions[name](context))
        except Exception as e:
            log.append((name, "failed: " + str(e)))
            return (context, log, False)
        log.append((name, "done"))
    return (context, log, True)`}}
},
{ id:"w02", act:1, title:"Webhooks you can trust", mins:35,
  hook:"Your store's automation listens for \"order paid\" webhooks from the payment provider. One day someone posts a fake event to your public URL and your system ships 40 orders nobody paid for.",
  learn:[
    {h:"How webhooks work", p:[
      "A webhook is an HTTP POST another system sends to your URL when something happens. It's push, not pull: instead of asking every five minutes \"anything new?\", you're told instantly. Respond quickly with a 2xx status (do heavy work in the background), because senders time out and retry."]},
    {h:"Verify every request", p:[
      "Your webhook URL is public, so anyone can call it. Senders like Stripe, GitHub and Slack sign each request: they compute an HMAC (a keyed hash) of the timestamp and body using a secret only you and they know, and send it in a header. You recompute it and compare with a constant-time comparison. Also reject old timestamps (for example older than 5 minutes) to block replayed requests."],
     code:R`import hmac, hashlib
def sign(secret, timestamp, body):
    msg = f"{timestamp}.{body}".encode()
    return hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()
# compare with hmac.compare_digest(expected, received)`},
    {h:"Retries and duplicates", p:[
      "If your endpoint is slow or errors, senders retry, so the same event can arrive twice. Every event has an id: record processed ids and ignore repeats (lesson 11 goes deeper). Store the raw payload before processing so you can replay it after a bug fix."]}
  ],
  mistakes:["Accepting webhooks without verifying the signature.","Doing slow work before responding, so the sender times out and retries.","Comparing signatures with == instead of a constant-time comparison."],
  ai:"Webhooks connect most modern automations, including agent triggers. Verifying them is basic security hygiene that interviewers and security reviewers expect.",
  interview:{q:"How do you secure a webhook endpoint?", a:"Use HTTPS, verify the sender's HMAC signature with a shared secret using a constant-time comparison, reject stale timestamps to stop replays, deduplicate by event id, validate the payload schema, respond quickly and process asynchronously. Rotate the secret periodically."},
  terms:[["Webhook","An HTTP call another system makes to your URL when an event happens."],["HMAC","A hash computed with a secret key, used to prove who sent a message."],["Signature header","The request header carrying the sender's HMAC."],["Replay attack","Re-sending a captured valid request."],["Constant-time comparison","A comparison that doesn't leak timing information."],["Event id","A unique id used to detect duplicate deliveries."]],
  quiz:[
    {t:"mcq", q:"Why check the webhook timestamp?", o:["To reject replayed old requests","To sort events","To save storage","It's required by JSON"], a:0},
    {t:"mcq", q:"Your endpoint takes 40 seconds to process. What happens?", o:["The sender may time out and retry, causing duplicates","Nothing","The event is encrypted","Faster processing"], a:0},
    {t:"mcq", q:"Why use hmac.compare_digest instead of ==?", o:["It takes the same time regardless of where strings differ","It's shorter","It ignores case","It hashes twice"], a:0}
  ],
  lab:{
    task:"1. sign(secret, timestamp, body): HMAC-SHA256 hex digest of the string f\"{timestamp}.{body}\" using the secret.\n2. verify(secret, body, timestamp, signature, now, tolerance=300): return (False, \"stale\") if abs(now − timestamp) > tolerance; (False, \"bad signature\") if the signature doesn't match (use hmac.compare_digest); otherwise (True, \"ok\").",
    starter:R`import hmac, hashlib

def sign(secret, timestamp, body):
    return ""

def verify(secret, body, timestamp, signature, now, tolerance=300):
    return (True, "ok")`,
    tests:R`body = '{"event": "order.paid", "id": "evt_1"}'
sig = sign("s3cret", 1700000000, body)
assert sig == hmac.new(b"s3cret", ("1700000000." + body).encode(), hashlib.sha256).hexdigest(), "Sign timestamp.body with SHA-256"
assert verify("s3cret", body, 1700000000, sig, now=1700000100) == (True, "ok")
assert verify("s3cret", body.replace("order.paid", "order.refunded"), 1700000000, sig, now=1700000100) == (False, "bad signature"), "A tampered body must fail"
assert verify("wrong", body, 1700000000, sig, now=1700000100) == (False, "bad signature")
assert verify("s3cret", body, 1700000000, sig, now=1700000400) == (False, "stale"), "Older than 5 minutes"
assert verify("s3cret", body, 1700000000, sig, now=1699999800) == (True, "ok"), "Small clock skew is fine"`,
    hint:"sign: hmac.new(secret.encode(), f\"{timestamp}.{body}\".encode(), hashlib.sha256).hexdigest(). verify: check staleness first, then hmac.compare_digest(sign(...), signature).",
    solution:R`import hmac, hashlib

def sign(secret, timestamp, body):
    return hmac.new(secret.encode(), f"{timestamp}.{body}".encode(), hashlib.sha256).hexdigest()

def verify(secret, body, timestamp, signature, now, tolerance=300):
    if abs(now - timestamp) > tolerance:
        return (False, "stale")
    if not hmac.compare_digest(sign(secret, timestamp, body), signature):
        return (False, "bad signature")
    return (True, "ok")`,
    bonus:{
      task:"Bonus: write class Receiver(secret) with handle(body, timestamp, signature, now) that verifies, parses the JSON, and returns \"processed\" for a new event id, \"duplicate\" if that id was already processed, or the failure reason from verify. Only record ids of verified events.",
      tests:R`import json
r = Receiver("k")
b = json.dumps({"id": "evt_9", "event": "order.paid"})
s = sign("k", 100, b)
assert r.handle(b, 100, s, 120) == "processed" and r.handle(b, 100, s, 130) == "duplicate"
assert r.handle(b, 100, "forged", 120) == "bad signature"`,
      hint:"Keep self.seen = set(). After ok: event = json.loads(body); check event[\"id\"] in self.seen.",
      solution:R`import json

class Receiver:
    def __init__(self, secret):
        self.secret, self.seen = secret, set()
    def handle(self, body, timestamp, signature, now):
        ok, reason = verify(self.secret, body, timestamp, signature, now)
        if not ok:
            return reason
        eid = json.loads(body)["id"]
        if eid in self.seen:
            return "duplicate"
        self.seen.add(eid)
        return "processed"`}}
},
{ id:"w03", act:1, title:"Scheduling with cron", mins:35,
  hook:"\"Send the sales report at 7:30 every weekday, and invoice reminders on the 1st and 15th.\" Schedules like these have run on servers for 50 years using one compact notation: cron.",
  learn:[
    {h:"The five fields", p:[
      "A cron expression has five fields: minute (0–59), hour (0–23), day of month (1–31), month (1–12) and day of week (0–6, where 0 is Sunday). Each field can be * (any), a number, a list (1,15), a range (1-5) or a step (*/15 means every 15). \"30 7 * * 1-5\" means 7:30 every Monday to Friday."],
     code:R`30 7 * * 1-5      # 7:30 on weekdays
0 9 1,15 * *      # 9:00 on the 1st and 15th
*/15 * * * *      # every 15 minutes
0 18 * * 5        # 6pm every Friday`},
    {h:"Scheduling in practice", p:[
      "Every automation platform has a schedule trigger, often accepting cron. On servers you'll meet cron itself, systemd timers, cloud schedulers and GitHub Actions schedules, all with cron syntax. Be explicit about time zones (a server in UTC runs \"7:30\" at a different local time) and about daylight saving changes. Real cron has a quirk: if both day-of-month and day-of-week are restricted, it runs when either matches."]},
    {h:"Schedules vs events", p:[
      "Polling on a schedule is simple but adds delay and wasted runs. When the source can send webhooks, prefer events. Use schedules for time-based work: reports, reminders, nightly syncs and cleanup."]}
  ],
  mistakes:["Forgetting the server runs in UTC, so reports arrive at the wrong local time.","Polling every minute when a webhook would be instant and cheaper.","Scheduling many heavy jobs at exactly midnight, so they all collide."],
  ai:"Scheduled jobs run nightly AI summaries, re-index RAG content and send digests. Cron literacy is a quietly essential skill.",
  interview:{q:"A scheduled report sometimes runs an hour late. What might cause it?", a:"Time zone and daylight saving handling: the schedule is defined in UTC or a fixed offset while users expect local time. Fix it by scheduling in an explicit named time zone or converting correctly, and document the expected local run time."},
  terms:[["Cron expression","Five fields describing when a job runs."],["Step value","*/n: every n units."],["Range","a-b: every value from a to b."],["Polling","Checking for new data on a schedule."],["UTC","Coordinated Universal Time, the default clock on many servers."],["Job scheduler","A service that runs tasks at set times."]],
  quiz:[
    {t:"mcq", q:"What does \"0 9 * * 1\" mean?", o:["9:00 every Monday","9:01 every day","Every 9 minutes","9:00 on the 1st of each month"], a:0},
    {t:"mcq", q:"\"*/10 * * * *\" runs…", o:["Every 10 minutes","At minute 10 of each hour","10 times a day","Every 10 hours"], a:0},
    {t:"mcq", q:"The source system supports webhooks. For instant reactions you should…", o:["Use the webhook","Poll every minute","Poll daily","Use cron only"], a:0}
  ],
  lab:{
    task:"1. parse_field(field, lo, hi): return the sorted set of allowed values for one cron field. Support *, a number, lists (a,b), ranges (a-b), steps on * (*/n, starting at lo) and steps on ranges (a-b/n).\n2. matches(expr, minute, hour, day, month, weekday): True if all five fields allow those values. (This simplified version requires every field to match.)",
    starter:R`def parse_field(field, lo, hi):
    return set()

def matches(expr, minute, hour, day, month, weekday):
    return False`,
    tests:R`assert parse_field("*", 0, 6) == {0, 1, 2, 3, 4, 5, 6}
assert parse_field("1-5", 0, 6) == {1, 2, 3, 4, 5}
assert parse_field("1,15", 1, 31) == {1, 15}
assert parse_field("*/15", 0, 59) == {0, 15, 30, 45}
assert parse_field("10-20/5", 0, 59) == {10, 15, 20}
assert parse_field("7", 0, 23) == {7}
assert matches("30 7 * * 1-5", 30, 7, 12, 3, 2) is True, "7:30 on a Tuesday"
assert matches("30 7 * * 1-5", 30, 7, 14, 3, 6) is False, "Not on Saturday"
assert matches("0 9 1,15 * *", 0, 9, 15, 6, 3) and not matches("0 9 1,15 * *", 0, 9, 14, 6, 3)
assert matches("*/15 * * * *", 45, 3, 1, 1, 0) and not matches("*/15 * * * *", 44, 3, 1, 1, 0)`,
    hint:"Split on commas and handle each part: if \"/\" in part, split into base and step; base \"*\" means range(lo, hi + 1), else a range. Then take every step-th value.",
    solution:R`def parse_field(field, lo, hi):
    out = set()
    for part in field.split(","):
        step = 1
        if "/" in part:
            part, s = part.split("/")
            step = int(s)
        if part == "*":
            start, end = lo, hi
        elif "-" in part:
            a, b = part.split("-")
            start, end = int(a), int(b)
        else:
            start = end = int(part)
        out.update(range(start, end + 1, step))
    return out

def matches(expr, minute, hour, day, month, weekday):
    f = expr.split()
    limits = [(0, 59), (0, 23), (1, 31), (1, 12), (0, 6)]
    values = [minute, hour, day, month, weekday]
    return all(v in parse_field(fld, lo, hi) for fld, (lo, hi), v in zip(f, limits, values))`,
    bonus:{
      task:"Bonus: write next_run(expr, start) where start is a datetime.datetime. Return the first datetime strictly after start (checking minute by minute, seconds set to 0) that matches. Python's weekday() is Monday=0, so convert: cron weekday = (dt.weekday() + 1) % 7. Give up after 366 days and return None.",
      tests:R`import datetime as dt
s = dt.datetime(2026, 9, 25, 8, 0)
assert next_run("30 7 * * 1-5", s) == dt.datetime(2026, 9, 28, 7, 30), "Friday 8:00 -> Monday 7:30. Got " + str(next_run("30 7 * * 1-5", s))
assert next_run("*/15 * * * *", dt.datetime(2026, 1, 1, 10, 14, 30)) == dt.datetime(2026, 1, 1, 10, 15)`,
      hint:"t = start.replace(second=0, microsecond=0) + dt.timedelta(minutes=1); loop while t < start + 366 days.",
      solution:R`import datetime as dt

def next_run(expr, start):
    t = start.replace(second=0, microsecond=0) + dt.timedelta(minutes=1)
    end = start + dt.timedelta(days=366)
    while t < end:
        if matches(expr, t.minute, t.hour, t.day, t.month, (t.weekday() + 1) % 7):
            return t
        t += dt.timedelta(minutes=1)
    return None`}}
},
{ id:"w04", act:1, title:"n8n fundamentals: nodes, items and expressions", mins:35,
  hook:"A marketing agency picks n8n because it's open source, can be self-hosted, and has strong AI agent nodes. The first thing that confuses everyone: items, and those {{ $json }} expressions.",
  learn:[
    {h:"Nodes and connections", p:[
      "In n8n a workflow is a canvas of nodes connected by lines. Trigger nodes start it (Webhook, Schedule, app triggers). Regular nodes do work: HTTP Request, Set (edit fields), IF and Switch (branch), Merge, Code (JavaScript or Python), and hundreds of app integrations. There are also AI nodes: an AI Agent node that can use other nodes as tools, memory and vector store nodes for RAG, and MCP Client and MCP Server Trigger nodes so agents can use or offer tools over the Model Context Protocol. Tool-level human approval can gate risky agent actions."]},
    {h:"Items", p:[
      "Data flows between nodes as a list of items, and each item is a JSON object. A node usually runs once for each item it receives: if a query returns 30 customers, the next node processes 30 items. Understanding \"one run per item\" explains most n8n surprises."]},
    {h:"Expressions", p:[
      "Inside node settings you reference data with expressions in double curly braces. {{ $json.email }} reads the current item's email field; nested fields use dots ({{ $json.manager.name }}). You can also reference other nodes' output and use small JavaScript expressions. The Set node builds a new item shape from expressions; the IF node filters items by conditions."],
     code:R`Subject:  Welcome, {{ $json.first_name }}!
To:       {{ $json.email }}
Body:     Your account manager {{ $json.manager.name }} will call you on {{ $json.start_date }}.`}
  ],
  mistakes:["Expecting a node to run once when it runs once per item.","Referencing a field with the wrong path and silently getting an empty value.","Putting complex logic in long expressions instead of a Code node."],
  ai:"n8n is popular for AI automations because its AI and agent nodes sit alongside hundreds of integrations, and it can run on your own servers for data control.",
  interview:{q:"How does data flow between nodes in n8n?", a:"As a list of items, each a JSON object. Most nodes execute once per incoming item and output items for the next node. Expressions like {{ $json.field }} read fields from the current item, and nodes can also reference earlier nodes' outputs."},
  terms:[["Node","One step in an n8n workflow."],["Item","One JSON object flowing between nodes."],["Expression","A {{ }} reference that reads data dynamically."],["$json","The current item's data in an n8n expression."],["Set node","A node that reshapes item fields."],["Self-hosting","Running the software on your own servers."]],
  quiz:[
    {t:"mcq", q:"A node receives 12 items. By default it usually runs…", o:["Once per item: 12 times","Once","Never","Twice"], a:0},
    {t:"mcq", q:"{{ $json.manager.name }} reads…", o:["The name field inside the current item's manager object","A variable called manager.name","The workflow name","The first node's name"], a:0},
    {t:"mcq", q:"A key reason companies choose n8n is…", o:["It can be self-hosted","It only works offline","It has no integrations","It can't use AI"], a:0}
  ],
  lab:{
    task:"1. get_path(item, path): follow a dotted path like \"manager.name\" into nested dicts. Return None if any part is missing.\n2. render(template, item): replace every {{ $json.PATH }} (spaces inside the braces optional) with str(get_path(item, PATH)), or an empty string if it's None.\n3. set_node(items, mapping): mapping is {new_field: template}. Return a new list of items where each item has exactly the mapped fields, rendered for that item.\n4. if_node(items, path, value): return (matching, not_matching) lists based on get_path(item, path) == value.",
    starter:R`import re

def get_path(item, path):
    return None

def render(template, item):
    return template

def set_node(items, mapping):
    return items

def if_node(items, path, value):
    return (items, [])`,
    tests:R`item = {"first_name": "Priya", "email": "priya@x.com", "manager": {"name": "Asha"}, "plan": "Pro"}
assert get_path(item, "manager.name") == "Asha" and get_path(item, "manager.phone") is None and get_path(item, "x.y.z") is None
assert render("Hi {{ $json.first_name }}, meet {{$json.manager.name}}!", item) == "Hi Priya, meet Asha!"
assert render("Phone: {{ $json.phone }}", item) == "Phone: ", "Missing values render as empty"
items = [item, {"first_name": "Ben", "email": "ben@x.com", "manager": {"name": "Chen"}, "plan": "Free"}]
out = set_node(items, {"to": "{{ $json.email }}", "subject": "Welcome, {{ $json.first_name }}!"})
assert out == [{"to": "priya@x.com", "subject": "Welcome, Priya!"}, {"to": "ben@x.com", "subject": "Welcome, Ben!"}], "Got " + str(out)
yes, no = if_node(items, "plan", "Pro")
assert [i["first_name"] for i in yes] == ["Priya"] and [i["first_name"] for i in no] == ["Ben"]`,
    hint:"render: re.sub(r\"\\{\\{\\s*\\$json\\.([\\w.]+)\\s*\\}\\}\", replacer, template), where replacer returns \"\" if the value is None else str(value).",
    solution:R`import re

def get_path(item, path):
    cur = item
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur

def render(template, item):
    def rep(m):
        v = get_path(item, m.group(1))
        return "" if v is None else str(v)
    return re.sub(r"\{\{\s*\$json\.([\w.]+)\s*\}\}", rep, template)

def set_node(items, mapping):
    return [{k: render(t, it) for k, t in mapping.items()} for it in items]

def if_node(items, path, value):
    yes = [it for it in items if get_path(it, path) == value]
    no = [it for it in items if get_path(it, path) != value]
    return (yes, no)`,
    bonus:{
      task:"Bonus: write split_out(items, path): for each item, the list at path becomes separate items, each a copy of the original item with that path's last key replaced by one element. (n8n calls this Split Out.)",
      tests:R`items = [{"order": 1, "lines": ["laptop", "badge"]}, {"order": 2, "lines": ["phone"]}]
assert split_out(items, "lines") == [{"order": 1, "lines": "laptop"}, {"order": 1, "lines": "badge"}, {"order": 2, "lines": "phone"}]`,
      hint:"For a top-level path: for it in items: for v in (get_path(it, path) or []): new = dict(it); new[path] = v.",
      solution:R`def split_out(items, path):
    out = []
    for it in items:
        for v in get_path(it, path) or []:
            new = dict(it)
            new[path] = v
            out.append(new)
    return out`}}
},
{ id:"w05", act:1, title:"The 2026 automation landscape: from workflows to AI agents", mins:30,
  hook:"A founder asks: should we use Zapier, n8n, an AI agent builder, or just let an AI assistant do it? The tools changed fast, and \"automation\" now means four different things. Choosing well starts with knowing the categories.",
  learn:[
    {h:"Four kinds of automation tools", p:[
      "Classic workflow builders (iPaaS): Zapier, Make, Microsoft Power Automate and n8n. A trigger plus fixed steps across thousands of app connectors. They follow rules; they don't reason. Still the right tool for stable, repeatable processes.",
      "AI inside workflows: the same fixed flow, with AI steps that classify, extract, summarize or draft (lessons 7 and 8). Predictable and cheap, and where most business value is today.",
      "AI agent builders: the agent decides which tools and steps to use at runtime. Examples include Zapier Agents, n8n's AI Agent node, Make AI Agents and Microsoft Copilot Studio, plus AI-native tools like Gumloop, Lindy, Relevance AI and Relay.app. Powerful for open-ended tasks, but less predictable, so they need guardrails and approvals.",
      "Developer platforms: code-first teams use durable execution engines (Temporal, Inngest, Trigger.dev, Restate, Cloudflare Workflows) that save every step so long workflows and agent runs survive crashes, plus agent frameworks like LangGraph, CrewAI and the Claude Agent SDK."]},
    {h:"New building blocks", p:[
      "MCP (Model Context Protocol) is becoming the universal connector: platforms like Zapier and n8n can expose app actions as MCP tools, so any compatible AI assistant or agent can use them. Computer-use and browser agents operate websites and desktop apps the way a person would, which helps when there's no API, but they're slower and need supervision. Human-in-the-loop gates can now pause an agent before a risky tool call (sending email, writing to a database). And AI assistants themselves increasingly run scheduled and multi-step tasks, blurring the line between chat and automation."]},
    {h:"How they charge", p:[
      "Pricing changes often, so always check current plans. Common models: per task (each successful action step counts), per operation or credit (every module run counts, often including triggers), per execution (one whole run counts once) and self-hosted (you pay for servers and maintenance). AI agent products often use credits that are consumed by each model call and tool call, so an agent that loops ten times costs far more than a fixed three-step flow. A 10-step workflow running 5,000 times a month is 50,000 tasks under one model but 5,000 executions under another."]},
    {h:"Choosing well", p:[
      "Stable, rule-based steps: a classic workflow. Judgment on text or documents: add AI steps. Open-ended, multi-step tasks where the path varies: an agent with limits and approvals. Mission-critical or long-running processes: durable execution in code. No API available: a browser agent as a last resort. Then weigh security and data residency, who will maintain it, connectors, monitoring and total cost at your real volume."]}
  ],
  mistakes:["Using an autonomous agent where a fixed three-step workflow would be cheaper and more reliable.","Choosing a platform by hype instead of by your volume, pricing model and maintainers.","Automating a website with a browser agent when the service offers an API."],
  ai:"The line between automation and AI agents is disappearing. Knowing all four categories lets you pick the simplest thing that works, which is what employers and clients pay for.",
  interview:{q:"When would you use an AI agent instead of a traditional workflow?", a:"When the task is open-ended and the right steps depend on the situation, such as researching a lead or resolving a varied support request. If the steps are known and stable, a fixed workflow with AI steps is cheaper, faster and easier to test. When I do use an agent, I limit its tools, add approvals for risky actions, cap its steps and cost, and log every decision."},
  terms:[["iPaaS","Integration platform as a service, like Zapier or Make."],["AI agent builder","A platform where an AI decides which tools and steps to use."],["Durable execution","Saving each step of a workflow so it can resume after failures."],["MCP connector","A tool exposed over the Model Context Protocol for AI agents to use."],["Computer-use agent","An AI that operates apps and websites through the screen, like a person."],["Credit-based pricing","Billing by credits consumed per model call or action."],["Data residency","Where data is stored and processed geographically."]],
  quiz:[
    {t:"mcq", q:"Every new invoice must be copied to the accounting system the same way. Best fit?", o:["A classic workflow","An autonomous agent","A browser agent","A durable engine cluster"], a:0},
    {t:"mcq", q:"Each inbound sales email needs different research and follow-up steps. Best fit?", o:["An AI agent with limited tools and approvals","A cron job","A spreadsheet formula","No automation"], a:0},
    {t:"mcq", q:"A 20-minute agent run keeps failing at minute 18 and restarting from zero. What helps most?", o:["Durable execution that resumes from the failed step","A bigger model","More triggers","Removing logging"], a:0},
    {t:"mcq", q:"A 10-step workflow runs 5,000 times a month. Under per-execution pricing that's…", o:["5,000 billable units","50,000","500","10"], a:0},
    {t:"mcq", q:"An old supplier portal has no API. The fallback option is…", o:["A supervised browser or computer-use agent","A webhook","Cron alone","Nothing is possible"], a:0}
  ],
  lab:{
    task:"Model monthly usage and pick the cheapest plan.\n\n1. usage(runs, steps, model): monthly billable units for a workflow that runs `runs` times a month with `steps` action steps plus one trigger. \"per_task\": runs × steps. \"per_operation\": runs × (steps + 1). \"per_execution\": runs.\n2. plan_cost(plan, units): a plan is {\"model\", \"base\", \"included\", \"overage\"}. Cost = base + max(0, units − included) × overage, rounded to 2.\n3. cheapest(plans, runs, steps): return the name of the plan with the lowest cost (first on ties). plans maps name to plan.",
    starter:R`def usage(runs, steps, model):
    return 0

def plan_cost(plan, units):
    return 0.0

def cheapest(plans, runs, steps):
    return None`,
    tests:R`assert usage(5000, 10, "per_task") == 50000 and usage(5000, 10, "per_operation") == 55000 and usage(5000, 10, "per_execution") == 5000
p = {"model": "per_task", "base": 50, "included": 2000, "overage": 0.01}
assert plan_cost(p, 1500) == 50 and plan_cost(p, 12000) == 150.0
plans = {
  "A": {"model": "per_task", "base": 30, "included": 1000, "overage": 0.02},
  "B": {"model": "per_operation", "base": 20, "included": 10000, "overage": 0.005},
  "C": {"model": "per_execution", "base": 60, "included": 2500, "overage": 0.02},
}
assert cheapest(plans, 5000, 10) == "C", "Many steps favor per-execution. Got " + str(cheapest(plans, 5000, 10))
assert cheapest(plans, 200, 2) == "B", "Low volume: the cheapest base price wins. Got " + str(cheapest(plans, 200, 2))`,
    hint:"cheapest: costs = {name: plan_cost(p, usage(runs, steps, p[\"model\"])) for name, p in plans.items()}; return min(costs, key=costs.get).",
    solution:R`def usage(runs, steps, model):
    return {"per_task": runs * steps, "per_operation": runs * (steps + 1), "per_execution": runs}[model]

def plan_cost(plan, units):
    return round(plan["base"] + max(0, units - plan["included"]) * plan["overage"], 2)

def cheapest(plans, runs, steps):
    costs = {name: plan_cost(p, usage(runs, steps, p["model"])) for name, p in plans.items()}
    return min(costs, key=costs.get)`,
    bonus:{
      task:"Bonus: write break_even_runs(plan_a, plan_b, steps, max_runs=100000): the smallest number of monthly runs (checking 0, 100, 200 and so on up to max_runs) at which plan_b becomes strictly cheaper than plan_a. Return None if it never does.",
      tests:R`A = {"model": "per_task", "base": 30, "included": 1000, "overage": 0.02}
C = {"model": "per_execution", "base": 60, "included": 2500, "overage": 0.02}
assert break_even_runs(A, C, 10) == 300, "Got " + str(break_even_runs(A, C, 10))
assert break_even_runs(C, A, 10) == 0, "At zero runs, A is already cheaper than C"`,
      hint:"for runs in range(0, max_runs + 1, 100): compare plan_cost(plan_b, usage(...)) < plan_cost(plan_a, usage(...)).",
      solution:R`def break_even_runs(plan_a, plan_b, steps, max_runs=100000):
    for runs in range(0, max_runs + 1, 100):
        a = plan_cost(plan_a, usage(runs, steps, plan_a["model"]))
        b = plan_cost(plan_b, usage(runs, steps, plan_b["model"]))
        if b < a:
            return runs
    return None`}}
},
/* ---------------- ACT 2 ---------------- */
{ id:"w06", act:2, title:"Calling APIs from workflows: pagination and rate limits", mins:35,
  hook:"Your sync pulls contacts from the CRM's API. It works in testing with 40 records. In production it silently stops at 100, because the API returns results one page at a time.",
  learn:[
    {h:"Pagination", p:[
      "APIs rarely return everything at once. Offset pagination: ?offset=0&limit=100, then offset=100 and so on (simple, but can skip or repeat rows if data changes mid-sync). Cursor pagination: each response includes a next_cursor you send back to get the following page, until it's empty (stable and common in modern APIs). Page numbers and Link headers are other variants. Always loop until the API says there's no more."],
     code:R`items, cursor = [], None
while True:
    page = get("/contacts", params={"cursor": cursor, "limit": 100})
    items += page["data"]
    cursor = page.get("next_cursor")
    if not cursor:
        break`},
    {h:"Rate limits", p:[
      "APIs cap how many requests you can make per second or minute. Respect documented limits proactively by spacing requests, read rate-limit headers when provided, and on HTTP 429 wait (use the Retry-After header if present) before retrying. Batch endpoints, which accept many records per request, cut request counts dramatically."]},
    {h:"In workflow tools", p:[
      "Most platforms' HTTP nodes have built-in pagination and batching options, but you still need to understand the API's scheme to configure them. Log how many records you fetched and compare with a count endpoint when one exists; silent truncation is one of the most common integration bugs."]}
  ],
  mistakes:["Reading only the first page and not noticing.","Hammering an API until it blocks your integration for the day.","Using offset pagination on data that changes during the sync, then skipping records."],
  ai:"AI agents calling APIs hit the same limits. Pagination and rate-limit handling belong in tool code so the agent doesn't have to reason about them.",
  interview:{q:"Cursor or offset pagination: which do you prefer and why?", a:"Cursor pagination, when available: the server tracks position, so inserts and deletes during the sync don't cause skipped or duplicated records, and it performs well on large datasets. Offset is simpler but fragile for changing data and slow at high offsets."},
  terms:[["Pagination","Splitting large results into pages."],["Offset pagination","Requesting pages by position and size."],["Cursor pagination","Requesting the next page with a token from the previous page."],["Rate limit","The maximum request rate an API allows."],["Retry-After","A header telling you how long to wait before retrying."],["Batch endpoint","An endpoint that handles many records in one request."]],
  quiz:[
    {t:"mcq", q:"A sync always returns exactly 100 records. Likely bug?", o:["Only the first page is fetched","The API is perfect","Too many workers","A DNS problem"], a:0},
    {t:"mcq", q:"On HTTP 429 with Retry-After: 30, you should…", o:["Wait about 30 seconds before retrying","Retry immediately in a loop","Give up forever","Switch API keys"], a:0},
    {t:"mcq", q:"Records keep getting skipped when data changes mid-sync. Better approach?", o:["Cursor pagination","Bigger offsets","Faster retries","Smaller pages only"], a:0}
  ],
  lab:{
    task:"1. fetch_all(get_page, limit=100): get_page(cursor, limit) returns {\"data\": [...], \"next_cursor\": value or None}. Start with cursor None and keep fetching until next_cursor is falsy. Return (all_items, pages_fetched).\n2. schedule_requests(n, per_second): return the start time in seconds (rounded to 3) for each of n requests so that no more than per_second requests start within any one second: request i starts at (i // per_second) seconds.\n3. retry_wait(headers, attempt, base=1.0): if headers has \"Retry-After\", return float(its value); otherwise return base × 2 ** attempt.",
    starter:R`def fetch_all(get_page, limit=100):
    return ([], 0)

def schedule_requests(n, per_second):
    return []

def retry_wait(headers, attempt, base=1.0):
    return base`,
    tests:R`DB = list(range(250))
calls = []
def get_page(cursor, limit):
    calls.append(cursor)
    start = cursor or 0
    nxt = start + limit if start + limit < len(DB) else None
    return {"data": DB[start:start + limit], "next_cursor": nxt}
items, pages = fetch_all(get_page)
assert items == DB and pages == 3, "Got " + str((len(items), pages))
assert calls == [None, 100, 200], "Start with None, then pass each next_cursor"
assert fetch_all(lambda c, l: {"data": [], "next_cursor": None}) == ([], 1)
assert schedule_requests(5, 2) == [0, 0, 1, 1, 2], "Two requests per second"
assert retry_wait({"Retry-After": "30"}, 0) == 30.0 and retry_wait({}, 3) == 8.0`,
    hint:"fetch_all: loop; page = get_page(cursor, limit); items += page[\"data\"]; pages += 1; cursor = page.get(\"next_cursor\"); break if not cursor.",
    solution:R`def fetch_all(get_page, limit=100):
    items, cursor, pages = [], None, 0
    while True:
        page = get_page(cursor, limit)
        items += page["data"]
        pages += 1
        cursor = page.get("next_cursor")
        if not cursor:
            break
    return (items, pages)

def schedule_requests(n, per_second):
    return [round(i // per_second, 3) for i in range(n)]

def retry_wait(headers, attempt, base=1.0):
    if "Retry-After" in headers:
        return float(headers["Retry-After"])
    return base * 2 ** attempt`,
    bonus:{
      task:"Bonus: write fetch_offset(get_rows, limit=100) for offset pagination: get_rows(offset, limit) returns a list; keep going until a page comes back shorter than limit. Return all rows.",
      tests:R`rows = list(range(230))
assert fetch_offset(lambda o, l: rows[o:o + l]) == rows
assert fetch_offset(lambda o, l: list(range(200))[o:o + l]) == list(range(200)), "Exact multiples need one extra empty page"`,
      hint:"offset = 0; loop: page = get_rows(offset, limit); out += page; if len(page) < limit: break; offset += limit.",
      solution:R`def fetch_offset(get_rows, limit=100):
    out, offset = [], 0
    while True:
        page = get_rows(offset, limit)
        out += page
        if len(page) < limit:
            break
        offset += limit
    return out`}}
},
{ id:"w07", act:2, title:"AI steps: classify, extract and summarize", mins:40,
  hook:"A company's support inbox gets 400 emails a week: billing problems, shipping questions, technical issues, complaints. A person reads and forwards each one. An AI step can read, label and route them in seconds.",
  learn:[
    {h:"Where AI fits in a workflow", p:[
      "Use AI steps where a person would read and judge: classifying requests, extracting fields from messy text, summarizing long threads, drafting replies, detecting sentiment or urgency. Keep deterministic steps (routing rules, API calls, math) as plain logic: they're cheaper, faster and exact."]},
    {h:"Designing a classification step", p:[
      "Give the model a fixed list of labels with short definitions, one or two examples, and ask for only the label. Then don't trust the raw reply: normalize it and check it's one of the allowed labels, falling back to \"other\" (routed to a human) when it isn't. Log the model's choice with the input for later evaluation. A small, fast model is usually enough for classification."],
     code:R`Classify the support email into exactly one label:
billing, shipping, technical, complaint, other
Reply with only the label.

<email>I was charged twice for my last order.</email>`},
    {h:"Confidence and humans", p:[
      "Route uncertain or high-stakes items to people: ask the model for a confidence score, or use rules (complaints and legal threats always go to a human). Measure accuracy on a labeled sample of real emails before switching off manual triage, then keep spot-checking."]}
  ],
  mistakes:["Letting free-form model replies drive routing without validating them.","Using a large, slow model for a simple five-label classification.","Switching off human review before measuring accuracy on real data."],
  ai:"Classification, extraction and summarization steps are the most common and highest-ROI uses of LLMs inside business automation.",
  interview:{q:"How do you make an LLM classification step reliable in production?", a:"Constrain it to a fixed label set with definitions and examples, validate the reply against allowed labels with a safe fallback, use structured output or tool calling where available, route low-confidence and sensitive cases to humans, evaluate on a labeled sample and monitor accuracy over time."},
  terms:[["Classification step","An AI step that assigns a label from a fixed list."],["Extraction","Pulling structured fields out of unstructured text."],["Summarization","Condensing text while keeping key points."],["Label set","The allowed categories for classification."],["Fallback route","Where items go when the AI output is invalid or uncertain."],["Human review","A person checking AI decisions, especially risky ones."]],
  quiz:[
    {t:"mcq", q:"The model replies \"Billing.\" but your labels are lowercase. Best handling?", o:["Normalize and validate against the label list","Crash","Create a new label","Ignore the email"], a:0},
    {t:"mcq", q:"Which step should stay plain code rather than AI?", o:["Adding up an order total","Reading a messy email","Summarizing a thread","Detecting tone"], a:0},
    {t:"mcq", q:"Before turning off manual triage you should…", o:["Measure accuracy on a labeled sample of real emails","Trust the model","Double the temperature","Remove the fallback"], a:0}
  ],
  lab:{
    task:"1. classify_prompt(text, labels): return exactly:\nClassify the text into exactly one label: LABELS\nReply with only the label.\n\n<text>TEXT</text>\n(LABELS joined with \", \".)\n2. parse_label(reply, labels): lowercase the reply and strip spaces and punctuation from both ends. If it equals a label, return it. Otherwise return the first label (in the labels order) that appears as a whole word in the reply. Otherwise \"other\".\n3. route(label, confidence, human_labels, min_conf=0.7): return \"human\" if the label is in human_labels, is \"other\", or confidence is below min_conf; otherwise \"auto:\" + label.",
    starter:R`import re

def classify_prompt(text, labels):
    return ""

def parse_label(reply, labels):
    return "other"

def route(label, confidence, human_labels, min_conf=0.7):
    return "human"`,
    tests:R`L = ["billing", "shipping", "technical_issue", "complaint"]
assert classify_prompt("Charged twice", L) == "Classify the text into exactly one label: billing, shipping, technical_issue, complaint\nReply with only the label.\n\n<text>Charged twice</text>"
assert parse_label("Billing.", L) == "billing"
assert parse_label("  SHIPPING  ", L) == "shipping"
assert parse_label("I think this is a complaint about billing", L) == "billing", "First label in list order that appears as a word"
assert parse_label("technical_issue", L) == "technical_issue"
assert parse_label("banana", L) == "other"
assert parse_label("billings", L) == "other", "Whole words only"
assert route("billing", 0.9, {"complaint"}) == "auto:billing"
assert route("complaint", 0.99, {"complaint"}) == "human" and route("billing", 0.5, set()) == "human" and route("other", 1.0, set()) == "human"`,
    hint:"Clean: r = reply.lower().strip().strip(\".,!?;:'\\\" \"). Whole-word check: re.search(r\"\\b\" + re.escape(label) + r\"\\b\", r).",
    solution:R`import re

def classify_prompt(text, labels):
    return ("Classify the text into exactly one label: " + ", ".join(labels) +
            "\nReply with only the label.\n\n<text>" + text + "</text>")

def parse_label(reply, labels):
    r = reply.lower().strip().strip(".,!?;:'\" ")
    if r in labels:
        return r
    for label in labels:
        if re.search(r"\b" + re.escape(label) + r"\b", r):
            return label
    return "other"

def route(label, confidence, human_labels, min_conf=0.7):
    if label in human_labels or label == "other" or confidence < min_conf:
        return "human"
    return "auto:" + label`,
    bonus:{
      task:"Bonus: evaluate the step. Write accuracy_report(predicted, actual) returning {\"accuracy\": share correct rounded to 3, \"confused\": {\"actual->predicted\": count} for every wrong pair}.",
      tests:R`r = accuracy_report(["billing", "shipping", "billing", "other"], ["billing", "billing", "billing", "complaint"])
assert r == {"accuracy": 0.5, "confused": {"billing->shipping": 1, "complaint->other": 1}}, "Got " + str(r)`,
      hint:"Loop with zip; build the key f\"{a}->{p}\" when they differ.",
      solution:R`def accuracy_report(predicted, actual):
    confused = {}
    correct = 0
    for p, a in zip(predicted, actual):
        if p == a:
            correct += 1
        else:
            k = f"{a}->{p}"
            confused[k] = confused.get(k, 0) + 1
    return {"accuracy": round(correct / len(actual), 3), "confused": confused}`}}
},
{ id:"w08", act:2, title:"Structured data between steps", mins:35,
  hook:"The AI step extracted a sales lead: \"meeting_date\": \"next Monday\", \"budget\": \"85,000\" and \"is_business\": \"yes\". The CRM's API expects a date, a number and a boolean. The whole workflow fails at step 6.",
  learn:[
    {h:"Contracts between steps", p:[
      "Every step expects data in a certain shape. Define that shape explicitly as a schema: field names, types, required or optional, defaults and allowed values. Validate at the boundaries: when data enters the workflow (webhooks, AI outputs, file uploads) and before it's written to another system."]},
    {h:"Coercion and normalization", p:[
      "Real data arrives messy: \"85,000\" as text, \"Yes\" or \"TRUE\" for booleans, dates in many formats, emails with capitals and spaces. Coercion converts safe, unambiguous cases (\"85,000\" to 85000) and flags the rest as errors. Never guess silently on ambiguous values like \"next Monday\"; send them for review or ask the AI step for a standard format like YYYY-MM-DD in the first place."],
     code:R`from pydantic import BaseModel, EmailStr
from datetime import date

class Lead(BaseModel):
    name: str
    email: EmailStr
    meeting_date: date
    budget: float
    is_business: bool = False`},
    {h:"Errors as data", p:[
      "Collect all validation errors at once (\"budget: not a number; meeting_date: not a date\") instead of failing on the first, and return them with the record so a person or an AI retry step can fix everything in one pass."]}
  ],
  mistakes:["Passing unvalidated AI output straight into a system of record.","Silently guessing ambiguous values like relative dates.","Reporting only the first error, so fixes take many round trips."],
  ai:"Structured outputs are what make AI steps safe to chain. Validation at boundaries turns model text into trustworthy data.",
  interview:{q:"Where should validation happen in a multi-step workflow?", a:"At every boundary where data enters or leaves: incoming webhooks and files, AI step outputs, and before writing to external systems. Use explicit schemas, coerce only unambiguous values, collect all errors, and route invalid records to review instead of failing silently or guessing."},
  terms:[["Schema","A definition of fields, types and rules."],["Validation","Checking data against a schema."],["Coercion","Safely converting a value to the expected type."],["Normalization","Making values consistent, like lowercase emails."],["Default value","The value used when an optional field is missing."],["Boundary","Where data enters or leaves a system or step."]],
  quiz:[
    {t:"mcq", q:"\"85,000\" arrives for a numeric budget field. Reasonable handling?", o:["Coerce it to 85000","Reject every record","Store it as text","Guess 85"], a:0},
    {t:"mcq", q:"meeting_date is \"next Monday\". Best handling?", o:["Flag it for review or require YYYY-MM-DD upstream","Guess a date silently","Use today","Drop the field"], a:0},
    {t:"mcq", q:"Why collect all validation errors at once?", o:["So everything can be fixed in one pass","It's faster to crash","Schemas require it","To hide errors"], a:0}
  ],
  lab:{
    task:"Write coerce(data, schema). schema maps field to {\"type\": \"str\" | \"int\" | \"float\" | \"bool\" | \"date\", \"required\": bool, \"default\": value (optional)}.\n\nFor each field in schema order: if missing or None, use the default if given; else if required, add \"FIELD: required\"; else skip it.\nConvert present values:\n  str: strip spaces.\n  int / float: accept numbers; strings may contain commas and spaces (\"85,000\"). Otherwise \"FIELD: not a number\".\n  bool: accept True/False, or strings yes/no/true/false/1/0 (any case). Otherwise \"FIELD: not a boolean\".\n  date: a string in YYYY-MM-DD form that datetime.date.fromisoformat accepts, kept as that string. Otherwise \"FIELD: not a date\".\nIgnore fields not in the schema. Return (clean_dict, errors).",
    starter:R`import datetime

def coerce(data, schema):
    return ({}, [])`,
    tests:R`S = {"name": {"type": "str", "required": True}, "budget": {"type": "float", "required": True},
     "seats": {"type": "int", "required": False}, "is_business": {"type": "bool", "required": False, "default": False},
     "meeting_date": {"type": "date", "required": True}}
clean, errs = coerce({"name": "  Priya ", "budget": "85,000", "is_business": "Yes", "meeting_date": "2026-10-05", "extra": 1}, S)
assert clean == {"name": "Priya", "budget": 85000.0, "is_business": True, "meeting_date": "2026-10-05"} and errs == [], "Got " + str((clean, errs))
clean, errs = coerce({"budget": "lots", "is_business": "maybe", "meeting_date": "next Monday", "seats": "3"}, S)
assert errs == ["name: required", "budget: not a number", "is_business: not a boolean", "meeting_date: not a date"], "Got " + str(errs)
assert clean == {"seats": 3}, "Valid fields still come through. Got " + str(clean)
assert coerce({"name": "A", "budget": 1, "meeting_date": "2026-02-30"}, S)[1] == ["meeting_date: not a date"], "Impossible dates fail"
assert coerce({"name": "A", "budget": 1, "meeting_date": "2026-01-01"}, S)[0]["is_business"] is False, "Defaults apply"`,
    hint:"Write a helper to_number(v, kind) that strips commas and spaces from strings and calls int() or float() inside try/except ValueError. Note that bool is a subclass of int; reject bools for number fields.",
    solution:R`import datetime

TRUE = {"yes", "true", "1"}
FALSE = {"no", "false", "0"}

def coerce(data, schema):
    clean, errors = {}, []
    for field, spec in schema.items():
        v = data.get(field)
        if v is None:
            if "default" in spec:
                clean[field] = spec["default"]
            elif spec.get("required"):
                errors.append(field + ": required")
            continue
        t = spec["type"]
        if t == "str":
            clean[field] = str(v).strip()
        elif t in ("int", "float"):
            try:
                if isinstance(v, bool):
                    raise ValueError
                s = v.replace(",", "").strip() if isinstance(v, str) else v
                clean[field] = int(s) if t == "int" else float(s)
            except (ValueError, TypeError):
                errors.append(field + ": not a number")
        elif t == "bool":
            if isinstance(v, bool):
                clean[field] = v
            elif str(v).strip().lower() in TRUE:
                clean[field] = True
            elif str(v).strip().lower() in FALSE:
                clean[field] = False
            else:
                errors.append(field + ": not a boolean")
        elif t == "date":
            try:
                datetime.date.fromisoformat(str(v))
                clean[field] = str(v)
            except ValueError:
                errors.append(field + ": not a date")
    return (clean, errors)`,
    bonus:{
      task:"Bonus: write normalize_date(text) that accepts \"2026-10-05\", \"10/05/2026\" (US month/day/year) or \"5 Oct 2026\" / \"5 October 2026\" and returns \"YYYY-MM-DD\", or None if it can't parse it safely.",
      tests:R`assert normalize_date("2026-10-05") == "2026-10-05" and normalize_date("10/05/2026") == "2026-10-05"
assert normalize_date("5 Oct 2026") == "2026-10-05" and normalize_date("5 October 2026") == "2026-10-05"
assert normalize_date("next Monday") is None and normalize_date("13/45/2026") is None`,
      hint:"Try datetime.datetime.strptime with each format in turn: \"%Y-%m-%d\", \"%m/%d/%Y\", \"%d %b %Y\", \"%d %B %Y\".",
      solution:R`def normalize_date(text):
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d %b %Y", "%d %B %Y"):
        try:
            return datetime.datetime.strptime(text.strip(), fmt).date().isoformat()
        except ValueError:
            pass
    return None`}}
},
{ id:"w09", act:2, title:"Human approval steps", mins:35,
  hook:"The support workflow can issue refunds. A $20 refund can run automatically; a $12,000 refund should never go out because a form said so. The workflow must pause, ask the right person, and continue only on a real approval.",
  learn:[
    {h:"Pausing a workflow", p:[
      "An approval step sends a request (email, Slack or Teams message with Approve and Reject buttons, or a task in an app), then the workflow waits. Platforms implement this with wait nodes, callback URLs or approval features. The decision resumes the workflow on the right branch."]},
    {h:"Rules that make approvals meaningful", p:[
      "The right approver: based on role, manager or data ownership, never the requester (separation of duties). Clear context: what exactly will happen, for whom, and why. Expiry: requests that sit too long should expire or escalate, not auto-approve. One decision only: a request can't be approved twice or changed after deciding. Everything recorded: who, what, when, and the decision."],
     code:R`[Approval needed] Refund $12,000 to Acme Corp (order 88121)
Requested by: Ben Lee (support)   Reason: service outage credit
Expires: in 48 hours
[Approve]  [Reject]`},
    {h:"Avoiding approval fatigue", p:[
      "If approvers get 50 requests a day, they click Approve without reading. Only require approval for genuinely risky actions, batch similar low-risk ones, and show what changed since the last similar request."]}
  ],
  mistakes:["Letting requesters approve their own requests.","Auto-approving when a request expires.","Sending approvers vague messages without the data they need to decide."],
  ai:"The same approval patterns keep AI agents safe: agents propose, humans approve high-risk actions, and every decision is logged.",
  interview:{q:"What makes an approval workflow trustworthy?", a:"Correct approver selection with separation of duties, clear context about the exact action, single-use decisions, expiry with escalation rather than auto-approval, secure links or authenticated buttons, and a complete audit trail of who decided what and when."},
  terms:[["Approval step","A pause until an authorized person approves or rejects."],["Separation of duties","The same person can't both request and approve."],["Expiry","A deadline after which a request can't be approved."],["Escalation","Moving a stalled request to another approver."],["Approval fatigue","Approving without reading because of too many requests."],["Callback","A URL or event that resumes a waiting workflow."]],
  quiz:[
    {t:"mcq", q:"A request expires with no answer. Safe default?", o:["Treat it as expired or escalate; don't approve","Auto-approve","Approve half","Ask the requester to approve"], a:0},
    {t:"mcq", q:"Ben, a support agent, requests a $12,000 refund. Who may approve?", o:["A finance approver, not Ben","Ben","Anyone","The workflow itself"], a:0},
    {t:"mcq", q:"Approvers are clicking Approve without reading. Likely cause?", o:["Too many low-risk approval requests","Buttons are too small","Emails are encrypted","Nothing"], a:0}
  ],
  lab:{
    task:"Build class Approvals.\n\nrequest(req_id, requester, action, now, ttl=48): record a pending request that expires at now + ttl (hours).\ndecide(req_id, approver, approve, now): return one of:\n  \"unknown\" if req_id doesn't exist,\n  \"already decided\" if it's not pending,\n  \"expired\" if now >= its expiry (mark it expired),\n  \"not allowed\" if approver is the requester,\n  otherwise \"approved\" or \"rejected\" (and record the approver and time).\nhistory(req_id): the list of (status, who, time) events: (\"requested\", requester, time) first, then the final decision if any (expired uses who=None).",
    starter:R`class Approvals:
    def __init__(self):
        self.reqs = {}`,
    tests:R`a = Approvals()
a.request("R1", "ben", "refund $12,000", now=0)
assert a.decide("R1", "ben", True, now=1) == "not allowed", "No self-approval"
assert a.decide("R1", "asha", True, now=2) == "approved"
assert a.decide("R1", "asha", False, now=3) == "already decided"
assert a.history("R1") == [("requested", "ben", 0), ("approved", "asha", 2)]
a.request("R2", "ben", "delete records", now=0, ttl=24)
assert a.decide("R2", "asha", True, now=24) == "expired", "Expired at exactly now + ttl"
assert a.decide("R2", "asha", True, now=25) == "already decided"
assert a.history("R2") == [("requested", "ben", 0), ("expired", None, 24)]
a.request("R3", "ben", "x", now=0)
assert a.decide("R3", "asha", False, now=5) == "rejected" and a.decide("ZZ", "asha", True, 1) == "unknown"`,
    hint:"Store each request as a dict with requester, expires, status (\"pending\" at first) and events. Check the conditions in the order listed.",
    solution:R`class Approvals:
    def __init__(self):
        self.reqs = {}

    def request(self, req_id, requester, action, now, ttl=48):
        self.reqs[req_id] = {"requester": requester, "action": action, "expires": now + ttl,
                             "status": "pending", "events": [("requested", requester, now)]}

    def decide(self, req_id, approver, approve, now):
        r = self.reqs.get(req_id)
        if r is None:
            return "unknown"
        if r["status"] != "pending":
            return "already decided"
        if now >= r["expires"]:
            r["status"] = "expired"
            r["events"].append(("expired", None, now))
            return "expired"
        if approver == r["requester"]:
            return "not allowed"
        r["status"] = "approved" if approve else "rejected"
        r["events"].append((r["status"], approver, now))
        return r["status"]

    def history(self, req_id):
        return list(self.reqs[req_id]["events"])`,
    bonus:{
      task:"Bonus: write escalate(approvals, now, backup) that finds every pending request older than half its time to live and returns a sorted list of (req_id, backup) notifications, without changing their status. Each request only escalates once (track it).",
      tests:R`a = Approvals()
a.request("A", "ben", "x", now=0, ttl=48); a.request("B", "ben", "y", now=20, ttl=48)
assert escalate(a, 30, "cfo") == [("A", "cfo")], "A is 30h old (over 24h); B is only 10h old"
assert escalate(a, 50, "cfo") == [("B", "cfo")], "A already escalated; B is now 30h old"`,
      hint:"A request's age is now − its requested time; half its TTL is (expires − requested) / 2. Keep escalated ids on the approvals object, e.g. approvals.__dict__.setdefault(\"escalated\", set()).",
      solution:R`def escalate(approvals, now, backup):
    done = approvals.__dict__.setdefault("escalated", set())
    out = []
    for rid, r in approvals.reqs.items():
        start = r["events"][0][2]
        if r["status"] == "pending" and rid not in done and now - start > (r["expires"] - start) / 2:
            done.add(rid)
            out.append((rid, backup))
    return sorted(out)`}}
},
{ id:"w10", act:2, title:"Errors, retries and dead-letter queues", mins:40,
  hook:"At 2am the shipping carrier's API goes down for 20 minutes. Your fulfillment workflow fails for 140 orders, and customers wait an extra three days. A resilient design would have retried, parked the failures and alerted someone.",
  learn:[
    {h:"Two kinds of failure", p:[
      "Transient failures fix themselves: timeouts, 429 rate limits, 5xx server errors, brief network drops. Retry them with exponential backoff and a cap. Permanent failures won't fix themselves: invalid data, a missing record, a 400 or 403. Retrying them wastes time and can spam systems; send them straight to review."]},
    {h:"Dead-letter queues", p:[
      "When retries are exhausted or an error is permanent, don't drop the item. Put it in a dead-letter queue (DLQ) with the error, the payload and the attempt count. Someone (or an automated job) reviews and replays it after the fix. Alert when the DLQ grows so failures don't pile up silently."],
     code:R`try:
    book_shipment(order)
except TransientError:
    retry_later(order, attempt + 1)      # backoff: 1, 2, 4, 8 minutes...
except PermanentError as e:
    dead_letter.put({"payload": order, "error": str(e)})
    alert("Shipping failed for order " + order["id"])`},
    {h:"Platform features", p:[
      "n8n has error workflows and retry-on-fail settings; Make has error handlers and incomplete-execution storage; Zapier has autoreplay and error notifications; cloud queues (SQS, Azure Service Bus, Pub/Sub) have built-in dead-letter queues. Use them, but decide deliberately which errors are retryable."]}
  ],
  mistakes:["Retrying permanent errors forever.","Dropping failed items after the last retry with no record.","No alert on failures, so problems surface days later through angry users."],
  ai:"LLM calls add new transient failures (overloaded, rate-limited) and new permanent ones (invalid output). The same retry and DLQ design keeps AI automations dependable.",
  interview:{q:"How do you handle failures in an automation pipeline?", a:"Classify errors as transient or permanent. Retry transient ones with exponential backoff and jitter up to a limit; send permanent ones and exhausted retries to a dead-letter queue with the payload and error. Alert on DLQ growth, provide a replay path, and make steps idempotent so retries are safe."},
  terms:[["Transient error","A temporary failure likely to succeed on retry."],["Permanent error","A failure that won't succeed without a change."],["Dead-letter queue (DLQ)","Where failed items are parked for review and replay."],["Replay","Re-running a failed item after a fix."],["Alerting","Notifying people when failures occur."],["Max attempts","The cap on retries before giving up."]],
  quiz:[
    {t:"mcq", q:"A 400 Bad Request because a required field is missing should be…", o:["Sent to the DLQ or review, not retried","Retried 50 times","Ignored","Retried with jitter"], a:0},
    {t:"mcq", q:"A 503 Service Unavailable is usually…", o:["Transient: retry with backoff","Permanent","A success","A data error"], a:0},
    {t:"mcq", q:"Why keep the payload in the dead-letter queue?", o:["So the item can be replayed after the fix","To save money","It's required by HTTP","To hide the error"], a:0}
  ],
  lab:{
    task:"Two exception classes are provided. Write process(items, handler, max_attempts=3).\n\nFor each item: call handler(item). On success, add (item, result) to done. On TransientError, retry immediately up to max_attempts total calls; if every call fails, add {\"item\": item, \"error\": str(error), \"attempts\": max_attempts} to dlq. On PermanentError, don't retry: add {\"item\": item, \"error\": str(error), \"attempts\": 1} to dlq. Return (done, dlq).",
    starter:R`class TransientError(Exception):
    pass

class PermanentError(Exception):
    pass

def process(items, handler, max_attempts=3):
    return ([], [])`,
    tests:R`calls = {}
def handler(item):
    calls[item] = calls.get(item, 0) + 1
    if item == "flaky" and calls[item] < 3:
        raise TransientError("timeout")
    if item == "down":
        raise TransientError("503")
    if item == "bad":
        raise PermanentError("invalid address")
    return item.upper()
done, dlq = process(["ok", "flaky", "down", "bad"], handler)
assert done == [("ok", "OK"), ("flaky", "FLAKY")], "Got " + str(done)
assert dlq == [{"item": "down", "error": "503", "attempts": 3}, {"item": "bad", "error": "invalid address", "attempts": 1}], "Got " + str(dlq)
assert calls == {"ok": 1, "flaky": 3, "down": 3, "bad": 1}, "Permanent errors must not be retried. Got " + str(calls)`,
    hint:"for item in items: for attempt in range(1, max_attempts + 1): try the handler; on success append and break; except TransientError as e: if attempt == max_attempts: append to dlq; except PermanentError as e: append and break.",
    solution:R`class TransientError(Exception):
    pass

class PermanentError(Exception):
    pass

def process(items, handler, max_attempts=3):
    done, dlq = [], []
    for item in items:
        for attempt in range(1, max_attempts + 1):
            try:
                done.append((item, handler(item)))
                break
            except TransientError as e:
                if attempt == max_attempts:
                    dlq.append({"item": item, "error": str(e), "attempts": max_attempts})
            except PermanentError as e:
                dlq.append({"item": item, "error": str(e), "attempts": 1})
                break
    return (done, dlq)`,
    bonus:{
      task:"Bonus: write replay(dlq, handler) that re-runs every DLQ entry's item through process with max_attempts=1 and returns (recovered_items, still_failing_entries).",
      tests:R`dlq = [{"item": "a", "error": "x", "attempts": 3}, {"item": "b", "error": "y", "attempts": 1}]
def fixed(item):
    if item == "b":
        raise PermanentError("still bad")
    return "ok"
rec, still = replay(dlq, fixed)
assert rec == ["a"] and still == [{"item": "b", "error": "still bad", "attempts": 1}]`,
      hint:"done, again = process([d[\"item\"] for d in dlq], handler, max_attempts=1); return ([i for i, r in done], again).",
      solution:R`def replay(dlq, handler):
    done, again = process([d["item"] for d in dlq], handler, max_attempts=1)
    return ([i for i, r in done], again)`}}
},
/* ---------------- ACT 3 ---------------- */
{ id:"w11", act:3, title:"Idempotency: safe to run twice", mins:35,
  hook:"A retry after a timeout charged a customer's card twice and sent two confirmation emails. The first attempt had actually succeeded; only the response was lost.",
  learn:[
    {h:"The core problem", p:[
      "Networks fail in the worst place: after the other system did the work but before you got the answer. With retries, webhooks and at-least-once queues, every step will sometimes run twice. An idempotent operation has the same effect whether it runs once or many times."]},
    {h:"Techniques", p:[
      "Idempotency keys: send a unique key with each create request (many APIs, like Stripe, accept an Idempotency-Key header); the server returns the original result for repeats. Natural keys and upserts: \"create or update the customer with email sam@example.com\" instead of \"create an account\". Check before acting: look for an existing ticket tagged with the event id. Deduplicate incoming events by id within a time window."],
     code:R`key = f"order:{order_id}:charge"
requests.post(url, json=order, headers={"Idempotency-Key": key})`},
    {h:"Designing for it", p:[
      "Derive keys from business identity (order id plus step name), not random values generated per attempt, or retries get new keys and defeat the purpose. Store keys with results for as long as retries can happen. Make \"send email\" steps check whether that exact email was already sent."]}
  ],
  mistakes:["Generating a new random idempotency key on every retry.","Assuming \"exactly once\" delivery from queues or webhooks.","Using create when an upsert on a natural key would be safe."],
  ai:"Agents retry tool calls too. Idempotent tools stop an agent's retry from double-charging, double-emailing or double-provisioning.",
  interview:{q:"What is idempotency and why does it matter for integrations?", a:"An operation is idempotent if running it multiple times has the same effect as running it once. Integrations retry after timeouts and receive duplicate events, so non-idempotent steps create duplicates. Use idempotency keys derived from business identity, upserts on natural keys, and event deduplication."},
  terms:[["Idempotent","Same effect whether run once or many times."],["Idempotency key","A unique key that lets a server recognize repeated requests."],["Upsert","Update if it exists, insert if it doesn't."],["Natural key","A business identifier like an employee id."],["At-least-once delivery","Messages may arrive more than once, but none are lost."],["Deduplication","Dropping repeated events."]],
  quiz:[
    {t:"mcq", q:"Which operation is naturally idempotent?", o:["Set order status to Shipped","Add 10 loyalty points","Send a receipt email","Create a new ticket"], a:0},
    {t:"mcq", q:"A good idempotency key for \"charge the card for order 1001\" is…", o:["order:1001:charge","A new random UUID per retry","The current timestamp","The word charge"], a:0},
    {t:"mcq", q:"Your queue promises at-least-once delivery. You should…", o:["Make consumers handle duplicates","Assume exactly once","Disable retries","Ignore it"], a:0}
  ],
  lab:{
    task:"1. class Idempotent: run(key, fn) calls fn() only the first time a key is seen and stores the result; repeated keys return the stored result without calling fn. If fn raises, don't store anything (so a retry can try again) and re-raise.\n2. dedupe(events, window): events are dicts with \"id\" and \"t\" (seconds), in time order. Keep an event unless the same id was kept within the last `window` seconds (t − kept_t < window). Return the kept events.",
    starter:R`class Idempotent:
    def __init__(self):
        self.results = {}

def dedupe(events, window):
    return events`,
    tests:R`calls = []
def charge():
    calls.append(1)
    return "CH-" + str(len(calls))
i = Idempotent()
assert i.run("order:1001:charge", charge) == "CH-1" and i.run("order:1001:charge", charge) == "CH-1"
assert len(calls) == 1, "The second run must not call fn again"
assert i.run("order:1002:charge", charge) == "CH-2"
state = {"n": 0}
def flaky():
    state["n"] += 1
    if state["n"] == 1:
        raise TimeoutError("lost response")
    return "ok"
try:
    i.run("k", flaky)
except TimeoutError:
    pass
assert i.run("k", flaky) == "ok", "Failures aren't stored, so a retry can succeed"
ev = [{"id": "a", "t": 0}, {"id": "a", "t": 30}, {"id": "b", "t": 40}, {"id": "a", "t": 70}, {"id": "a", "t": 100}]
assert [(e["id"], e["t"]) for e in dedupe(ev, 60)] == [("a", 0), ("b", 40), ("a", 70)], "Got " + str([(e["id"], e["t"]) for e in dedupe(ev, 60)])`,
    hint:"dedupe: last = {}; for e in events: if e[\"id\"] in last and e[\"t\"] - last[e[\"id\"]] < window: skip; else keep and set last[e[\"id\"]] = e[\"t\"].",
    solution:R`class Idempotent:
    def __init__(self):
        self.results = {}
    def run(self, key, fn):
        if key in self.results:
            return self.results[key]
        result = fn()
        self.results[key] = result
        return result

def dedupe(events, window):
    last, kept = {}, []
    for e in events:
        if e["id"] in last and e["t"] - last[e["id"]] < window:
            continue
        last[e["id"]] = e["t"]
        kept.append(e)
    return kept`,
    bonus:{
      task:"Bonus: write upsert(store, key_field, record) where store is a dict of records by key. Return \"created\" if new, \"updated\" if the existing record differs (replace it), or \"unchanged\" if identical, so re-running a sync is harmless.",
      tests:R`s = {}
assert upsert(s, "sku", {"sku": "A1", "price": 10}) == "created"
assert upsert(s, "sku", {"sku": "A1", "price": 10}) == "unchanged"
assert upsert(s, "sku", {"sku": "A1", "price": 12}) == "updated" and s["A1"]["price"] == 12`,
      hint:"k = record[key_field]; compare store.get(k) with record.",
      solution:R`def upsert(store, key_field, record):
    k = record[key_field]
    if k not in store:
        store[k] = dict(record)
        return "created"
    if store[k] == record:
        return "unchanged"
    store[k] = dict(record)
    return "updated"`}}
},
{ id:"w12", act:3, title:"Queues, background jobs and durable execution", mins:40,
  hook:"On Black Friday, 30,000 orders arrive in an hour. Processing each inside the checkout request makes the site time out. A queue lets you accept instantly and work through the backlog steadily.",
  learn:[
    {h:"Why queues", p:[
      "A queue decouples producers (who create work) from consumers (workers who do it). The web form just adds a job to the queue and returns \"received\". Workers pull jobs at their own pace. Spikes become backlogs instead of outages, workers can be scaled up, and failed jobs can be retried or dead-lettered."]},
    {h:"Queue tools", p:[
      "Cloud queues: Amazon SQS, Azure Service Bus, Google Pub/Sub. Brokers: RabbitMQ, Kafka (for event streams). Python job libraries: Celery, RQ, Dramatiq, often with Redis. Workflow platforms have their own execution queues. Important settings: visibility timeout (how long a job is hidden while a worker handles it), max retries, dead-letter queue and priority."],
     code:R`# Celery example
@app.task(bind=True, max_retries=5, default_retry_delay=60)
def process_order(self, order_id):
    try:
        fulfill(order_id)
    except TransientError as exc:
        raise self.retry(exc=exc)`},
    {h:"Durable execution", p:[
      "Long workflows and AI agent runs fail midway: a rate limit at step 9, a server restart, a crashed container. Durable execution engines (Temporal, Inngest, Trigger.dev, Restate, and cloud offerings like Cloudflare Workflows) record each completed step in a journal. When the run resumes, finished steps return their saved results instantly and only the failed step and those after it run again. That saves money on repeated model calls and prevents side effects from happening twice. It also lets workflows wait for days (for an approval, say) without holding a server."],
     code:R`# Inngest-style durable steps (conceptual)
async def handle(event, step):
    lead = await step.run("enrich", lambda: enrich(event.data))
    draft = await step.run("draft", lambda: llm_draft(lead))      # not re-run on retry
    await step.wait_for_event("approval", timeout="3d")
    await step.run("send", lambda: send_email(draft))`},
    {h:"Throughput and priority", p:[
      "Throughput is roughly workers × jobs per worker per second; if jobs arrive faster, the backlog grows. Monitor queue depth and job age. Priorities let urgent jobs (a fraud hold on a suspicious order) jump ahead of routine ones (a nightly report), but watch that low-priority jobs don't starve forever."]}
  ],
  mistakes:["Doing slow work inside the web request instead of queueing it.","Not monitoring queue depth, so a backlog builds for days unnoticed.","A visibility timeout shorter than job duration, so two workers process the same job."],
  ai:"LLM calls are slow and rate-limited, so production AI features almost always run through queues with controlled concurrency.",
  interview:{q:"Why put a queue between a web app and slow processing?", a:"It lets the app respond immediately and absorbs traffic spikes as a backlog instead of timeouts. Workers process at a controlled rate, can scale independently, and failed jobs can be retried or dead-lettered without losing them."},
  terms:[["Durable execution","Journaling each completed step so a run resumes where it failed."],["Queue","A buffer of jobs waiting to be processed."],["Producer / consumer","Code that adds jobs, and workers that process them."],["Worker","A process that pulls and runs jobs."],["Queue depth","How many jobs are waiting."],["Visibility timeout","How long a claimed job is hidden from other workers."],["Priority queue","A queue where urgent jobs are served first."]],
  quiz:[
    {t:"mcq", q:"Jobs arrive at 50 per minute; 2 workers each finish 20 per minute. The backlog…", o:["Grows","Shrinks","Stays at zero","Disappears"], a:0},
    {t:"mcq", q:"A job takes 5 minutes but the visibility timeout is 1 minute. Risk?", o:["Another worker picks up the same job","Faster processing","Nothing","Jobs are deleted"], a:0},
    {t:"mcq", q:"A suspicious order must be held before it ships. Queue feature?", o:["Priority","Lower concurrency","A longer delay","Batching"], a:0}
  ],
  lab:{
    task:"Simulate a job queue. jobs are (job_id, arrival_time, duration, priority), where a lower priority number is more urgent.\n\nsimulate(jobs, workers): time starts at 0. Whenever a worker is free, it takes the waiting job (already arrived) with the lowest priority number, breaking ties by earlier arrival, then by job_id. If no job is waiting, the worker waits for the next arrival. Return {job_id: finish_time}.\n\nTip: process events in time order; a heap (heapq) is handy for free workers and waiting jobs.",
    starter:R`import heapq

def simulate(jobs, workers):
    return {}`,
    tests:R`jobs = [("report", 0, 5, 5), ("order1", 0, 2, 3), ("order2", 1, 2, 3), ("fraud_hold", 2, 1, 1)]
r = simulate(jobs, 1)
assert r == {"order1": 2, "fraud_hold": 3, "order2": 5, "report": 10}, "One worker, priority order. Got " + str(r)
r2 = simulate(jobs, 2)
assert r2 == {"order1": 2, "report": 5, "fraud_hold": 3, "order2": 5}, "Two workers: fraud_hold takes the worker freed at 2, order2 the one freed at 3. Got " + str(r2)
assert simulate([("a", 10, 1, 1)], 3) == {"a": 11}, "Idle workers wait for the first arrival"`,
    hint:"Sort jobs by arrival. Keep free_at = [0] * workers (a heap). Loop: t = heappop(free_at); push all jobs with arrival <= t into a waiting heap as (priority, arrival, id, duration); if waiting is empty, move t to the next arrival and add those; pop the best job, finish = t + duration, heappush(free_at, finish).",
    solution:R`import heapq

def simulate(jobs, workers):
    pending = sorted(jobs, key=lambda j: j[1])
    free_at = [0] * workers
    heapq.heapify(free_at)
    waiting, done, i = [], {}, 0
    while i < len(pending) or waiting:
        t = heapq.heappop(free_at)
        while i < len(pending) and pending[i][1] <= t:
            jid, arr, dur, pri = pending[i]
            heapq.heappush(waiting, (pri, arr, jid, dur))
            i += 1
        if not waiting:
            t = pending[i][1]
            while i < len(pending) and pending[i][1] <= t:
                jid, arr, dur, pri = pending[i]
                heapq.heappush(waiting, (pri, arr, jid, dur))
                i += 1
        pri, arr, jid, dur = heapq.heappop(waiting)
        done[jid] = t + dur
        heapq.heappush(free_at, t + dur)
    return done`,
    bonus:{
      task:"Bonus: durable execution in miniature. Write class Durable with run(run_id, steps), where steps is a list of (name, fn). Keep a journal {run_id: {step_name: result}}. For each step, if its result is already journaled, reuse it without calling fn; otherwise call fn() and journal the result. If a step raises, re-raise (earlier results stay journaled). Return the list of results.",
      tests:R`calls = []
state = {"fail": True}
def enrich(): calls.append("enrich"); return "lead+"
def draft():
    calls.append("draft")
    if state["fail"]:
        raise RuntimeError("rate limited")
    return "draft v1"
def send(): calls.append("send"); return "sent"
d = Durable()
try:
    d.run("run1", [("enrich", enrich), ("draft", draft), ("send", send)])
except RuntimeError:
    pass
state["fail"] = False
assert d.run("run1", [("enrich", enrich), ("draft", draft), ("send", send)]) == ["lead+", "draft v1", "sent"]
assert calls == ["enrich", "draft", "draft", "send"], "On resume, the finished enrich step must not run again. Got " + str(calls)`,
      hint:"journal = self.journal.setdefault(run_id, {}); for name, fn in steps: if name not in journal: journal[name] = fn(); results.append(journal[name]).",
      solution:R`class Durable:
    def __init__(self):
        self.journal = {}
    def run(self, run_id, steps):
        j = self.journal.setdefault(run_id, {})
        out = []
        for name, fn in steps:
            if name not in j:
                j[name] = fn()
            out.append(j[name])
        return out`}}
},
{ id:"w13", act:3, title:"Automation in code with FastAPI", mins:40,
  hook:"No-code tools hit their limits: complex logic, strict security, high volume, proper tests. Your team decides the core order-processing integration will be a small Python service. FastAPI is the modern default.",
  learn:[
    {h:"Why a small service", p:[
      "Code gives you version control, code review, automated tests, any library you need and precise error handling. A typical automation service exposes webhook endpoints, validates input with Pydantic, queues work and calls other APIs. It can run as a container or serverless function."]},
    {h:"FastAPI basics", p:[
      "Routes map an HTTP method and path to a function. Path parameters come from the URL (/orders/{order_id}), query parameters from ?key=value, and the JSON body is validated automatically against a Pydantic model, returning a 422 error with details if it's wrong. It generates interactive API docs at /docs. BackgroundTasks or a queue handle slow work after responding."],
     code:R`from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

app = FastAPI()

class OrderPaid(BaseModel):
    order_id: str
    email: str
    total: float

@app.post("/webhooks/order-paid", status_code=202)
def order_paid(order: OrderPaid, tasks: BackgroundTasks):
    tasks.add_task(fulfill, order)
    return {"status": "accepted"}

@app.get("/orders/{order_id}")
def get_order(order_id: str):
    return lookup(order_id)`},
    {h:"Status codes that communicate", p:[
      "202 Accepted for \"received, processing later\", 200 for results, 404 for unknown paths or records, 405 when the path exists but not for that method, 422 for invalid bodies. Clear status codes make your service easy for other automations to call correctly."]}
  ],
  mistakes:["Doing slow processing inside the request handler instead of in the background.","Skipping input validation because \"only our systems call this\".","Returning 200 for every outcome, so callers can't tell success from failure."],
  ai:"FastAPI is the most common way to put AI features, RAG systems and agents behind an API. The same routing ideas power MCP servers over HTTP.",
  interview:{q:"When would you build an automation in code instead of a no-code platform?", a:"When logic is complex, volume is high, security or compliance needs strict control, the integration is business-critical and needs tests and code review, or the platform lacks a connector. No-code is great for speed and simple flows; code wins for core, high-stakes integrations."},
  terms:[["FastAPI","A modern Python framework for building APIs."],["Route","A method and path mapped to a handler function."],["Path parameter","A value taken from the URL path, like {emp_id}."],["Pydantic model","A class that validates request data."],["202 Accepted","Received; processing will happen later."],["405 Method Not Allowed","The path exists, but not for that HTTP method."]],
  quiz:[
    {t:"mcq", q:"A webhook endpoint queues work and returns immediately. Best status?", o:["202 Accepted","500","404","301"], a:0},
    {t:"mcq", q:"GET on a path that only supports POST should return…", o:["405","404","200","422"], a:0},
    {t:"mcq", q:"FastAPI returns 422 when…", o:["The request body fails validation","The server crashes","The path is unknown","Everything is fine"], a:0}
  ],
  lab:{
    task:"Build a tiny router like the heart of FastAPI.\n\nclass Router:\n  route(method, path): a decorator that registers the function for that method and path. Paths may contain {name} parameters.\n  dispatch(method, path, body=None): find a registered path that matches (same number of segments; literal segments equal; {name} segments capture the value). If no path matches: (404, {\"error\": \"not found\"}). If the path matches but not the method: (405, {\"error\": \"method not allowed\"}). Otherwise call the function with the captured parameters as keyword arguments, plus body=body if the function accepts a body parameter, and return (200, result). If the handler returns a (status, data) tuple, return it as-is.",
    starter:R`import inspect

class Router:
    def __init__(self):
        self.routes = []`,
    tests:R`app = Router()
@app.route("GET", "/orders/{order_id}")
def get_order(order_id):
    return {"id": order_id}
@app.route("POST", "/webhooks/order-paid")
def order_paid(body):
    return (202, {"accepted": body["order_id"]})
@app.route("GET", "/stores/{store}/orders/{order_id}")
def store_order(store, order_id):
    return {"store": store, "order": order_id}
assert app.dispatch("GET", "/orders/A7") == (200, {"id": "A7"})
assert app.dispatch("POST", "/webhooks/order-paid", {"order_id": "A9"}) == (202, {"accepted": "A9"})
assert app.dispatch("GET", "/stores/nyc/orders/A1") == (200, {"store": "nyc", "order": "A1"})
assert app.dispatch("GET", "/nope") == (404, {"error": "not found"})
assert app.dispatch("DELETE", "/orders/A7") == (405, {"error": "method not allowed"})
assert app.dispatch("GET", "/orders/A7/extra") == (404, {"error": "not found"}), "Segment counts must match"`,
    hint:"route returns a decorator: def deco(fn): self.routes.append((method, path, fn)); return fn. Matching: split both paths on \"/\"; compare segment by segment. Use \"body\" in inspect.signature(fn).parameters to decide whether to pass body.",
    solution:R`import inspect

class Router:
    def __init__(self):
        self.routes = []

    def route(self, method, path):
        def deco(fn):
            self.routes.append((method, path, fn))
            return fn
        return deco

    @staticmethod
    def _match(pattern, path):
        a, b = pattern.strip("/").split("/"), path.strip("/").split("/")
        if len(a) != len(b):
            return None
        params = {}
        for p, v in zip(a, b):
            if p.startswith("{") and p.endswith("}"):
                params[p[1:-1]] = v
            elif p != v:
                return None
        return params

    def dispatch(self, method, path, body=None):
        path_found = False
        for m, pattern, fn in self.routes:
            params = self._match(pattern, path)
            if params is None:
                continue
            path_found = True
            if m != method:
                continue
            if "body" in inspect.signature(fn).parameters:
                params["body"] = body
            result = fn(**params)
            if isinstance(result, tuple) and len(result) == 2 and isinstance(result[0], int):
                return result
            return (200, result)
        if path_found:
            return (405, {"error": "method not allowed"})
        return (404, {"error": "not found"})`,
    bonus:{
      task:"Bonus: support query strings. Update dispatch (or write dispatch_url(router, method, url, body=None)) so \"/orders?status=paid&page=2\" passes status=\"paid\" and page=\"2\" to the handler as keyword arguments, but only for parameters the handler declares.",
      tests:R`app = Router()
@app.route("GET", "/orders")
def list_orders(status=None):
    return {"status": status}
assert dispatch_url(app, "GET", "/orders?status=paid&page=2") == (200, {"status": "paid"}), "Ignore undeclared query params"
assert dispatch_url(app, "GET", "/orders") == (200, {"status": None})`,
      hint:"Split on \"?\", parse pairs with urllib.parse.parse_qsl, find the matching route and filter pairs to inspect.signature(fn).parameters.",
      solution:R`from urllib.parse import parse_qsl

def dispatch_url(router, method, url, body=None):
    path, _, qs = url.partition("?")
    query = dict(parse_qsl(qs))
    for m, pattern, fn in router.routes:
        params = router._match(pattern, path)
        if params is not None and m == method:
            allowed = inspect.signature(fn).parameters
            params.update({k: v for k, v in query.items() if k in allowed})
            if "body" in allowed:
                params["body"] = body
            result = fn(**params)
            return result if isinstance(result, tuple) else (200, result)
    return router.dispatch(method, path, body)`}}
},
{ id:"w14", act:3, title:"Messages: email, Slack and Teams", mins:35,
  hook:"Your workflow posts \"New order: {{customer}} bought {{item}}\" to Slack. The first morning, the channel shows exactly that, with the curly braces, because one field was missing.",
  learn:[
    {h:"Templates with guardrails", p:[
      "Notifications are templates filled with data. Before sending, check every placeholder has a value; missing values should block the send or fall back gracefully, never produce broken text. Keep templates in one place so wording changes don't need workflow edits."]},
    {h:"Channel formats", p:[
      "Email: subject plus HTML and plain-text body, sent through a provider like Microsoft Graph, Gmail, SendGrid or SES; respect unsubscribe rules for bulk mail. Slack: messages are built with Block Kit, a JSON structure of blocks (header, section with fields, actions with buttons). Microsoft Teams: Adaptive Cards, a similar JSON card format. Both chat platforms support buttons that call back into your workflow, which is how approvals work."],
     code:R`{"blocks": [
  {"type": "header", "text": {"type": "plain_text", "text": "New enterprise deal: Acme Corp"}},
  {"type": "section", "fields": [
    {"type": "mrkdwn", "text": "*Value:*\n$48,000"},
    {"type": "mrkdwn", "text": "*Owner:*\nPriya"}]},
  {"type": "actions", "elements": [
    {"type": "button", "text": {"type": "plain_text", "text": "Open deal"}, "url": "https://crm.example.com/deals/2201"}]}
]}`},
    {h:"Respect attention", p:[
      "Too many notifications get muted. Send digests (one summary instead of 40 pings), route messages to the people who can act, include the action link, and use mentions sparingly. Chat APIs are rate limited too, another reason to batch."]}
  ],
  mistakes:["Sending messages with unfilled placeholders.","Posting every event individually until the channel is muted.","Putting personal data in broad channels that don't need it."],
  ai:"AI drafts messages well, but templates and validation keep the facts exact. Many teams let the model write the friendly text around fields the workflow fills in.",
  interview:{q:"How do you design notifications people actually read?", a:"Send them only to people who can act, make them specific with the key facts and a direct action link, batch low-urgency events into digests, use consistent templates with validated fields, respect channel norms and privacy, and measure whether they lead to action."},
  terms:[["Template","Text with placeholders filled from data."],["Block Kit","Slack's JSON format for rich messages."],["Adaptive Card","Microsoft Teams' JSON card format."],["Digest","One summary message instead of many small ones."],["mrkdwn","Slack's lightweight text formatting."],["Interactive button","A message button that triggers an action or callback."]],
  quiz:[
    {t:"mcq", q:"40 events a day go to one channel as individual posts. Better?", o:["A daily or hourly digest","More emojis","Posting to more channels","Removing all notifications"], a:0},
    {t:"mcq", q:"A template field is missing. Safest behavior?", o:["Block the send or use a clear fallback","Send the raw {{placeholder}}","Guess a value","Send twice"], a:0},
    {t:"mcq", q:"Teams' equivalent of Slack Block Kit is…", o:["Adaptive Cards","Webhooks","Markdown files","CSV"], a:0}
  ],
  lab:{
    task:"1. fill(template, data): replace each {{field}} (spaces inside allowed) with str(data[field]). Return (text, missing), where missing is a list of placeholder names without a value (None counts as missing), in order of first appearance; leave those placeholders unchanged.\n2. slack_card(title, fields, url=None): build Slack Block Kit JSON: a header block with plain_text title; a section whose fields are mrkdwn texts \"*KEY:*\\nVALUE\" (in dict order); and, if url is given, an actions block with one button labeled \"Open\" linking to url. Return {\"blocks\": [...]}.\n3. digest(events, max_items=5): one text line per event (\"• \" + event), at most max_items, then \"…and N more\" if some were left out. Start with a title line \"N updates\" and join lines with \"\\n\".",
    starter:R`import re

def fill(template, data):
    return (template, [])

def slack_card(title, fields, url=None):
    return {"blocks": []}

def digest(events, max_items=5):
    return ""`,
    tests:R`t, m = fill("New order: {{ customer }} bought {{item}} for {{city}}", {"customer": "Priya", "item": "a bike", "city": None})
assert t == "New order: Priya bought a bike for {{city}}" and m == ["city"], "Got " + str((t, m))
card = slack_card("New deal: Acme", {"Value": "$48,000", "Owner": "Priya"}, "https://crm.example.com/d/1")
assert card == {"blocks": [
  {"type": "header", "text": {"type": "plain_text", "text": "New deal: Acme"}},
  {"type": "section", "fields": [{"type": "mrkdwn", "text": "*Value:*\n$48,000"}, {"type": "mrkdwn", "text": "*Owner:*\nPriya"}]},
  {"type": "actions", "elements": [{"type": "button", "text": {"type": "plain_text", "text": "Open"}, "url": "https://crm.example.com/d/1"}]}]}, "Got " + str(card)
assert len(slack_card("x", {"a": 1})["blocks"]) == 2, "No url means no actions block"
assert digest(["a", "b"]) == "2 updates\n• a\n• b"
assert digest([str(i) for i in range(8)], 3) == "8 updates\n• 0\n• 1\n• 2\n…and 5 more"`,
    hint:"fill: use re.sub with a function; if data.get(name) is None, record it once and return m.group(0) unchanged.",
    solution:R`import re

def fill(template, data):
    missing = []
    def rep(m):
        k = m.group(1)
        if data.get(k) is None:
            if k not in missing:
                missing.append(k)
            return m.group(0)
        return str(data[k])
    return (re.sub(r"\{\{\s*(\w+)\s*\}\}", rep, template), missing)

def slack_card(title, fields, url=None):
    blocks = [{"type": "header", "text": {"type": "plain_text", "text": title}},
              {"type": "section", "fields": [{"type": "mrkdwn", "text": f"*{k}:*\n{v}"} for k, v in fields.items()]}]
    if url:
        blocks.append({"type": "actions", "elements": [
            {"type": "button", "text": {"type": "plain_text", "text": "Open"}, "url": url}]})
    return {"blocks": blocks}

def digest(events, max_items=5):
    lines = [f"{len(events)} updates"] + ["• " + e for e in events[:max_items]]
    if len(events) > max_items:
        lines.append(f"…and {len(events) - max_items} more")
    return "\n".join(lines)`,
    bonus:{
      task:"Bonus: write teams_card(title, fields) that returns a minimal Microsoft Teams Adaptive Card: {\"type\": \"AdaptiveCard\", \"version\": \"1.4\", \"body\": [a TextBlock with the title (\"weight\": \"Bolder\", \"size\": \"Medium\"), then a FactSet whose \"facts\" are {\"title\": key, \"value\": str(value)}]}.",
      tests:R`c = teams_card("New deal", {"Value": "$48,000"})
assert c == {"type": "AdaptiveCard", "version": "1.4", "body": [
  {"type": "TextBlock", "text": "New deal", "weight": "Bolder", "size": "Medium"},
  {"type": "FactSet", "facts": [{"title": "Value", "value": "$48,000"}]}]}, "Got " + str(c)`,
      hint:"Build the dict literally; facts come from fields.items().",
      solution:R`def teams_card(title, fields):
    return {"type": "AdaptiveCard", "version": "1.4", "body": [
        {"type": "TextBlock", "text": title, "weight": "Bolder", "size": "Medium"},
        {"type": "FactSet", "facts": [{"title": k, "value": str(v)} for k, v in fields.items()]}]}`}}
},
{ id:"w15", act:3, title:"Documents: extraction and generation", mins:40,
  hook:"A small accounting firm receives 600 vendor invoices a month as PDFs. Someone types each invoice number, date and total into the finance system. Document automation turns that into a review queue.",
  learn:[
    {h:"Getting text out", p:[
      "Digital PDFs contain text you can extract (pypdf, pdfplumber). Scans are images and need OCR. Layout matters: tables and key-value pairs are easier with layout-aware tools or document AI services. Vision-capable LLMs can now read PDFs and images directly and return structured fields, which handles varied layouts well."]},
    {h:"Extraction strategy", p:[
      "Combine approaches: deterministic patterns (regex) for fields with a fixed format (invoice numbers, dates, totals), an LLM with a strict schema for varied or messy documents, and validation after both (does the total equal the sum of line items? is the date plausible?). Anything uncertain goes to a human review queue with the source highlighted."],
     code:R`import re
m = re.search(r"Invoice\s*(?:No\.?|#)\s*[:\-]?\s*([A-Z0-9-]+)", text, re.I)
invoice_no = m.group(1) if m else None`},
    {h:"Generating documents", p:[
      "The reverse direction: proposals, contracts, reports, certificates and quotes from templates plus data. Use a real template engine (Jinja2) and document libraries (python-docx, reportlab, or HTML to PDF). Validate that every required field is filled and keep generated documents with a record of the data version used."]}
  ],
  mistakes:["Trusting extracted totals without cross-checking against line items.","Using an LLM for fields a simple pattern extracts perfectly.","Generating documents with blank or placeholder fields."],
  ai:"Document AI is one of the most valuable business automations. Multimodal models plus validation rules now handle layouts that broke older template-based tools.",
  interview:{q:"How would you automate invoice data entry?", a:"Extract text (OCR for scans), pull fixed-format fields with patterns and varied ones with an LLM using a strict schema, validate with business rules (totals match line items, vendor exists, no duplicate invoice number), auto-post only high-confidence results, and send the rest to a review queue showing the source document."},
  terms:[["OCR","Turning images of text into machine-readable text."],["Document AI","Services and models that extract structure from documents."],["Key-value extraction","Finding labeled fields like Invoice No: 123."],["Template engine","A tool that fills document templates with data (for example Jinja2)."],["Cross-check","Validating one extracted value against others."],["Review queue","Where uncertain items wait for a person."]],
  quiz:[
    {t:"mcq", q:"A scanned invoice has no selectable text. First step?", o:["OCR or a vision-capable model","Regex directly","A template engine","Nothing: it's impossible"], a:0},
    {t:"mcq", q:"Line items add up to 1,240 but the extracted total is 1,420. Best action?", o:["Flag for human review","Post it anyway","Delete the invoice","Average the two"], a:0},
    {t:"mcq", q:"Invoice numbers always look like INV-2026-0042. Best extraction method?", o:["A regular expression","A large LLM call","OCR only","Guessing"], a:0}
  ],
  lab:{
    task:"1. parse_invoice(text): return {\"number\", \"date\", \"total\", \"vendor\"}.\n   number: after \"Invoice No:\", \"Invoice #\" or \"Invoice Number:\" (any case), a code of letters, digits and dashes.\n   date: the first YYYY-MM-DD in the text.\n   total: the number after \"Total:\" (allow $, commas and decimals) as a float.\n   vendor: the text after \"From:\" up to the end of that line, stripped.\n   Use None for anything not found.\n2. line_items(text): lines like \"Laptop x2 @ 1,200.00\" become (name, qty, unit_price) tuples.\n3. check_invoice(text): return a list of problems: \"missing FIELD\" for each None field (in the order number, date, total, vendor), and \"total mismatch\" if there are line items and their sum (qty × price) differs from the total by more than 0.01.",
    starter:R`import re

def parse_invoice(text):
    return {"number": None, "date": None, "total": None, "vendor": None}

def line_items(text):
    return []

def check_invoice(text):
    return []

INV = """From: Northwind Supplies
Invoice No: INV-2026-0042
Date: 2026-09-01
Laptop x2 @ 1,200.00
Docking station x2 @ 150.50
Total: $2,701.00"""`,
    tests:R`INV = """From: Northwind Supplies
Invoice No: INV-2026-0042
Date: 2026-09-01
Laptop x2 @ 1,200.00
Docking station x2 @ 150.50
Total: $2,701.00"""
assert parse_invoice(INV) == {"number": "INV-2026-0042", "date": "2026-09-01", "total": 2701.0, "vendor": "Northwind Supplies"}, "Got " + str(parse_invoice(INV))
assert parse_invoice("invoice # A-77 total: 10")["number"] == "A-77"
assert line_items(INV) == [("Laptop", 2, 1200.0), ("Docking station", 2, 150.5)], "Got " + str(line_items(INV))
assert check_invoice(INV) == []
assert check_invoice(INV.replace("2,701.00", "2,710.00")) == ["total mismatch"]
assert check_invoice("Total: 5") == ["missing number", "missing date", "missing vendor"], "Got " + str(check_invoice("Total: 5"))`,
    hint:"Number: re.search(r\"invoice\\s*(?:no\\.?|number|#)\\s*:?\\s*([A-Z0-9-]+)\", text, re.I). Items: re.findall(r\"^(.+?)\\s+x(\\d+)\\s+@\\s+([\\d,]+(?:\\.\\d+)?)\\s*$\", text, re.M).",
    solution:R`import re

def parse_invoice(text):
    num = re.search(r"invoice\s*(?:no\.?|number|#)\s*:?\s*([A-Z0-9-]+)", text, re.I)
    date = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", text)
    total = re.search(r"total\s*:\s*\$?\s*([\d,]+(?:\.\d+)?)", text, re.I)
    vendor = re.search(r"^from\s*:\s*(.+)$", text, re.I | re.M)
    return {"number": num.group(1) if num else None,
            "date": date.group(1) if date else None,
            "total": float(total.group(1).replace(",", "")) if total else None,
            "vendor": vendor.group(1).strip() if vendor else None}

def line_items(text):
    rows = re.findall(r"^(.+?)\s+x(\d+)\s+@\s+([\d,]+(?:\.\d+)?)\s*$", text, re.M)
    return [(n.strip(), int(q), float(p.replace(",", ""))) for n, q, p in rows]

def check_invoice(text):
    inv = parse_invoice(text)
    problems = ["missing " + k for k in ("number", "date", "total", "vendor") if inv[k] is None]
    items = line_items(text)
    if items and inv["total"] is not None:
        if abs(sum(q * p for n, q, p in items) - inv["total"]) > 0.01:
            problems.append("total mismatch")
    return problems`,
    bonus:{
      task:"Bonus: write proposal_letter(template, data, required) that fills {{field}} placeholders (like lesson 14) and returns (text, None) if all required fields are present and non-empty, or (None, sorted list of missing required fields) otherwise.",
      tests:R`tpl = "Dear {{name}}, thank you for choosing us for {{project}}. Work starts {{start}}."
ok, err = proposal_letter(tpl, {"name": "Priya", "project": "your website redesign", "start": "2026-10-05"}, ["name", "project", "start"])
assert ok == "Dear Priya, thank you for choosing us for your website redesign. Work starts 2026-10-05." and err is None
assert proposal_letter(tpl, {"name": "Priya", "project": ""}, ["name", "project", "start"]) == (None, ["project", "start"])`,
      hint:"missing = sorted(f for f in required if not data.get(f)). Replace with re.sub(r\"\\{\\{\\s*(\\w+)\\s*\\}\\}\", lambda m: str(data.get(m.group(1), \"\")), template).",
      solution:R`def proposal_letter(template, data, required):
    missing = sorted(f for f in required if not data.get(f))
    if missing:
        return (None, missing)
    return (re.sub(r"\{\{\s*(\w+)\s*\}\}", lambda m: str(data.get(m.group(1), "")), template), None)`}}
},
/* ---------------- ACT 4 ---------------- */
{ id:"w16", act:4, title:"Enterprise integrations: CRM, ERP and more", mins:45,
  hook:"When a deal closes in the CRM, the customer must appear in billing, the support desk, the project tool and the accounting system, each with different field names and formats. Enterprise integration is mostly careful mapping and change detection.",
  learn:[
    {h:"Systems of record", p:[
      "Each piece of data should have one system of record, the authoritative source: the CRM (like Salesforce or HubSpot) for customers, the ERP (like SAP, Oracle or NetSuite) for finance and inventory, the HCM (like Workday) for workers, the e-commerce platform (like Shopify) for orders. Downstream systems receive copies. Integrations flow from the source; never let two systems both \"own\" the same field, or they'll overwrite each other."]},
    {h:"Mapping and transformation", p:[
      "A field mapping says which source field feeds which target field, plus transformations: renaming (legal_name to company_name), formatting dates, translating codes (source region code 1100 to target \"EMEA\"), combining or splitting fields, and applying defaults. Keep mappings as configuration, reviewed with the business owners, not buried in code."],
     code:R`mapping = {
  "company":   "account.legal_name",
  "email":     ("account.billing_email", "lower"),
  "region":    ("account.region_code", "region_lookup"),
  "since":     "account.created_date",
}`},
    {h:"Delta syncs and events", p:[
      "Full-file syncs send everyone every time: simple but slow and risky at scale. Delta syncs send only changes since the last run: new records, updates and deletions. Event-driven integrations react to business events (deal closed, customer churned, employee left) as they happen. Most enterprise platforms offer all three styles, plus APIs, report-based extracts and integration tools. Removals deserve special care: when a customer cancels or an employee leaves, revoking access quickly is a security requirement."]}
  ],
  mistakes:["Letting two systems update the same field in both directions without a clear owner.","Hard-coding code translations that change every reorganization.","Treating cancellations and departures like ordinary updates instead of urgent access removals."],
  ai:"AI assistants are most useful when grounded in the systems of record, so clean integrations and mappings come first. Agents calling HR or CRM APIs need the same mapping discipline.",
  interview:{q:"How do you design an integration between a system of record and downstream apps?", a:"Confirm the system of record for each field, agree the field mappings and code translations with data owners, choose event-driven or delta syncs over full files where possible, validate records before sending, handle creates, changes and removals explicitly (removals with priority), make writes idempotent, and log and reconcile counts between systems."},
  terms:[["System of record","The authoritative source for a type of data."],["HCM","Human capital management system, such as Workday or SuccessFactors."],["CRM / ERP","Customer relationship and enterprise resource planning systems."],["Field mapping","Which source field feeds which target field, with transformations."],["Delta sync","Sending only records that changed."],["Reconciliation","Comparing counts or values between systems to find mismatches."]],
  quiz:[
    {t:"mcq", q:"Who should own a customer's billing address?", o:["The one system designated as its system of record","Every downstream app equally","The last system to edit it","Email"], a:0},
    {t:"mcq", q:"A nightly sync sends 80,000 unchanged records to update 40. Better approach?", o:["Delta sync or change events","Send twice as often","Bigger servers only","Manual entry"], a:0},
    {t:"mcq", q:"Why prioritize cancellations and departures?", o:["Access must be revoked quickly for security","They're rare","They're cheaper","Laws require emails"], a:0}
  ],
  lab:{
    task:"1. get_path(record, path): follow a dotted path into nested dicts; None if missing.\n2. map_record(src, mapping, transforms): mapping maps target field to either a source path or a (path, transform_name) tuple. transforms maps names to functions. Return the new target record. If a source value is None, the target value is None (don't call the transform).\n3. delta(previous, current, key): both are lists of target records. Return {\"added\": sorted keys only in current, \"removed\": sorted keys only in previous, \"changed\": sorted keys present in both whose records differ}.",
    starter:R`def get_path(record, path):
    return None

def map_record(src, mapping, transforms):
    return {}

def delta(previous, current, key):
    return {"added": [], "removed": [], "changed": []}`,
    tests:R`REGION = {"1100": "EMEA", "2200": "Americas"}
T = {"lower": str.lower, "region_lookup": lambda c: REGION.get(c, "Unknown")}
M = {"id": "account.id", "company": "account.legal_name", "email": ("account.billing_email", "lower"),
     "region": ("account.region_code", "region_lookup"), "phone": ("account.phone", "lower")}
src = {"account": {"id": "A1", "legal_name": "Acme Corp", "billing_email": "Billing@Acme.com", "region_code": "2200"}}
assert map_record(src, M, T) == {"id": "A1", "company": "Acme Corp", "email": "billing@acme.com", "region": "Americas", "phone": None}, "Got " + str(map_record(src, M, T))
assert get_path(src, "account.region_code") == "2200" and get_path(src, "account.x.y") is None
prev = [{"id": "A1", "plan": "Pro"}, {"id": "A2", "plan": "Free"}, {"id": "A3", "plan": "Free"}]
curr = [{"id": "A1", "plan": "Pro"}, {"id": "A3", "plan": "Pro"}, {"id": "A4", "plan": "Free"}]
assert delta(prev, curr, "id") == {"added": ["A4"], "removed": ["A2"], "changed": ["A3"]}`,
    hint:"map_record: for target, spec in mapping.items(): path, t = (spec, None) if isinstance(spec, str) else spec. delta: build dicts by key for both lists and compare key sets.",
    solution:R`def get_path(record, path):
    cur = record
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur

def map_record(src, mapping, transforms):
    out = {}
    for target, spec in mapping.items():
        path, t = (spec, None) if isinstance(spec, str) else spec
        v = get_path(src, path)
        out[target] = None if v is None else (transforms[t](v) if t else v)
    return out

def delta(previous, current, key):
    p = {r[key]: r for r in previous}
    c = {r[key]: r for r in current}
    return {"added": sorted(set(c) - set(p)), "removed": sorted(set(p) - set(c)),
            "changed": sorted(k for k in set(p) & set(c) if p[k] != c[k])}`,
    bonus:{
      task:"Bonus: write reconcile(source_ids, target_ids) returning {\"missing_in_target\": sorted, \"extra_in_target\": sorted, \"match_rate\": share of source ids found in target rounded to 3}. Reconciliation reports catch sync drift early.",
      tests:R`r = reconcile(["E1", "E2", "E3", "E4"], ["E1", "E2", "E9"])
assert r == {"missing_in_target": ["E3", "E4"], "extra_in_target": ["E9"], "match_rate": 0.5}`,
      hint:"Use sets: s, t = set(source_ids), set(target_ids).",
      solution:R`def reconcile(source_ids, target_ids):
    s, t = set(source_ids), set(target_ids)
    return {"missing_in_target": sorted(s - t), "extra_in_target": sorted(t - s),
            "match_rate": round(len(s & t) / len(s), 3) if s else 1.0}`}}
},
{ id:"w17", act:4, title:"Logging, auditing and tamper-evident trails", mins:40,
  hook:"An auditor asks: who approved the $12,000 refund to Acme, when, and was the record changed afterward? If your automation can't answer in minutes, it isn't ready for money or sensitive data.",
  learn:[
    {h:"Logs for engineers", p:[
      "Structured logs (JSON lines with fields like time, level, workflow, step, record id and duration) can be searched and aggregated, unlike free-text print statements. A correlation id, one id attached to every log line of a single run across all systems, lets you follow one order end to end. Never log secrets, and minimize personal data."],
     code:R`{"ts": "2026-09-22T08:01:12Z", "level": "info", "run_id": "run_8f2",
 "workflow": "refunds", "step": "issue_refund", "order_id": "88121",
 "status": "done", "ms": 412}`},
    {h:"Audit trails for accountability", p:[
      "Audit logs answer who did what, to which record, when and why, including approvals and automated actions. They must be append-only and protected from edits. A simple tamper-evident technique is a hash chain: each entry stores the hash of the previous entry plus its own content, so changing any past entry breaks every hash after it."]},
    {h:"Retention and access", p:[
      "Decide how long logs and audit records are kept (regulations and policy often dictate this), who can read them, and how they're exported for audits. Monitoring dashboards come from the same data: runs per day, failure rate, average duration and DLQ size."]}
  ],
  mistakes:["Free-text logs that can't be searched or aggregated.","Logging passwords, tokens or full personal records.","Storing audit records where admins can silently edit them."],
  ai:"AI automations need the same trails: which model decided what, on which input, and who approved it. Tamper-evident audit logs are increasingly expected for AI governance.",
  interview:{q:"What's the difference between application logs and audit logs?", a:"Application logs help engineers debug and monitor: detailed, high-volume and short-lived. Audit logs record accountable actions (who did what, when, to which record, with which approval) for compliance; they're append-only, tamper-evident, access-controlled and retained according to policy."},
  terms:[["Structured logging","Logs written as machine-readable fields, often JSON."],["Correlation id","One id tying together every log line of a single run."],["Audit trail","A record of who did what and when, for accountability."],["Append-only","Records can be added but never changed or deleted."],["Hash chain","Entries that each include the previous entry's hash, making edits detectable."],["Retention policy","How long records are kept."]],
  quiz:[
    {t:"mcq", q:"How do you follow one order across five systems' logs?", o:["A shared correlation id","Timestamps only","Guessing","Separate log files"], a:0},
    {t:"mcq", q:"In a hash chain, editing an old entry…", o:["Breaks the hashes of every later entry, revealing the change","Goes unnoticed","Deletes the log","Speeds it up"], a:0},
    {t:"mcq", q:"Which should never appear in logs?", o:["API tokens and passwords","Step names","Durations","Run ids"], a:0}
  ],
  lab:{
    task:"Build a tamper-evident audit log.\n\nclass AuditLog:\n  append(actor, action, target, ts): create an entry {\"i\": index from 0, \"actor\", \"action\", \"target\", \"ts\", \"prev\": the previous entry's hash (\"0\" * 64 for the first), \"hash\": entry_hash(entry)} and store it. Return the hash.\n  verify(): return the index of the first entry whose prev or hash is wrong, or -1 if the chain is intact.\n  who(target): list of (actor, action) for that target, in order.\n\nentry_hash(entry) is provided: SHA-256 of the JSON of every field except \"hash\", with sorted keys.",
    starter:R`import hashlib, json

def entry_hash(entry):
    data = {k: v for k, v in entry.items() if k != "hash"}
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()

class AuditLog:
    def __init__(self):
        self.entries = []`,
    tests:R`log = AuditLog()
h0 = log.append("ben", "request refund $12,000", "ORD-88121", 100)
h1 = log.append("asha", "approve refund", "ORD-88121", 160)
log.append("system", "issue refund", "ORD-88121", 161)
log.append("system", "send receipt", "ORD-90000", 170)
assert log.entries[0]["prev"] == "0" * 64 and log.entries[1]["prev"] == h0 and log.entries[2]["prev"] == h1
assert log.entries[1]["hash"] == entry_hash(log.entries[1])
assert log.verify() == -1, "An untouched chain is valid"
assert log.who("ORD-88121") == [("ben", "request refund $12,000"), ("asha", "approve refund"), ("system", "issue refund")]
log.entries[1]["actor"] = "ben"
assert log.verify() == 1, "Editing entry 1 must be detected"
log.entries[1]["hash"] = entry_hash(log.entries[1])
assert log.verify() == 2, "Re-hashing entry 1 breaks entry 2's prev link"`,
    hint:"verify: prev = \"0\" * 64; for e in self.entries: if e[\"prev\"] != prev or e[\"hash\"] != entry_hash(e): return e[\"i\"]; prev = e[\"hash\"].",
    solution:R`import hashlib, json

def entry_hash(entry):
    data = {k: v for k, v in entry.items() if k != "hash"}
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()

class AuditLog:
    def __init__(self):
        self.entries = []
    def append(self, actor, action, target, ts):
        prev = self.entries[-1]["hash"] if self.entries else "0" * 64
        e = {"i": len(self.entries), "actor": actor, "action": action, "target": target, "ts": ts, "prev": prev}
        e["hash"] = entry_hash(e)
        self.entries.append(e)
        return e["hash"]
    def verify(self):
        prev = "0" * 64
        for e in self.entries:
            if e["prev"] != prev or e["hash"] != entry_hash(e):
                return e["i"]
            prev = e["hash"]
        return -1
    def who(self, target):
        return [(e["actor"], e["action"]) for e in self.entries if e["target"] == target]`,
    bonus:{
      task:"Bonus: write run_summary(lines) where lines are JSON log strings with \"run_id\", \"status\" and \"ms\". Return {run_id: {\"steps\": count, \"failed\": count of status \"failed\", \"ms\": total}} in first-seen order.",
      tests:R`L = ['{"run_id": "r1", "status": "done", "ms": 100}', '{"run_id": "r2", "status": "done", "ms": 50}', '{"run_id": "r1", "status": "failed", "ms": 30}']
assert run_summary(L) == {"r1": {"steps": 2, "failed": 1, "ms": 130}, "r2": {"steps": 1, "failed": 0, "ms": 50}}`,
      hint:"d = json.loads(line); s = out.setdefault(d[\"run_id\"], {\"steps\": 0, \"failed\": 0, \"ms\": 0}).",
      solution:R`def run_summary(lines):
    out = {}
    for line in lines:
        d = json.loads(line)
        s = out.setdefault(d["run_id"], {"steps": 0, "failed": 0, "ms": 0})
        s["steps"] += 1
        s["failed"] += d["status"] == "failed"
        s["ms"] += d["ms"]
    return out`}}
},
{ id:"w18", act:4, title:"Security: secrets, scopes and least privilege", mins:40,
  hook:"A workflow export shared on a forum included a live API key for the company's CRM. Within hours, someone was downloading customer records. Automation connects everything, which makes its credentials very valuable targets.",
  learn:[
    {h:"Secrets", p:[
      "API keys, OAuth tokens, passwords and signing secrets belong in a credential store: the platform's encrypted credentials feature, environment variables, or a secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault). Never in workflow definitions, code, spreadsheets, tickets or chat. Rotate them on a schedule and immediately if exposed, and redact them from logs."]},
    {h:"Least privilege and scopes", p:[
      "Each integration gets its own service account with only the permissions it needs. OAuth scopes limit what a token can do (read calendars but not send email). An invoicing workflow that only creates invoices shouldn't be able to read every customer's payment details. If one credential leaks, least privilege limits the damage."],
     code:R`required = {"users.read", "users.create", "groups.write"}
granted  = {"users.read", "users.create", "groups.write", "mail.send", "directory.admin"}
excess = granted - required      # {"mail.send", "directory.admin"}: remove these`},
    {h:"Other essentials", p:[
      "Encrypt data in transit (HTTPS) and at rest. Verify inbound webhooks (lesson 2). Validate everything entering the workflow. Restrict who can edit production workflows and require review for changes. Treat AI steps' inputs as untrusted: emails and documents can carry prompt injection. Keep an inventory of integrations and their owners, and offboard credentials when people or systems leave."]}
  ],
  mistakes:["Pasting an API key directly into a workflow node or script.","One shared admin account used by every integration.","Never rotating secrets, so an old leak stays exploitable."],
  ai:"AI agents with tool access raise the stakes: least-privilege credentials and scoped tools are the main defense if an agent is manipulated.",
  interview:{q:"How do you secure credentials in an automation platform?", a:"Store them in an encrypted credential store or secrets manager, never in definitions or code; give each integration its own least-privilege service account with minimal OAuth scopes; rotate regularly and on exposure; redact secrets from logs; restrict who can edit production workflows; and audit credential use."},
  terms:[["Secret","A credential like an API key, token or password."],["Secrets manager","A secure service for storing and rotating secrets."],["Service account","A non-human account used by an integration."],["OAuth scope","A permission limiting what a token can do."],["Least privilege","Granting only the access that's needed."],["Rotation","Replacing secrets periodically or after exposure."]],
  quiz:[
    {t:"mcq", q:"An invoicing workflow's token can also send mail as any user. You should…", o:["Remove the unneeded scope","Keep it just in case","Share it with other workflows","Ignore it"], a:0},
    {t:"mcq", q:"An API key appears in a public screenshot. First action?", o:["Revoke and rotate it immediately","Delete the screenshot only","Wait and see","Change the username"], a:0},
    {t:"mcq", q:"Where should a workflow's CRM API key live?", o:["The platform's encrypted credential store or a secrets manager","In the workflow's JSON","In a shared spreadsheet","In a Slack message"], a:0}
  ],
  lab:{
    task:"1. redact(line): replace secrets in a log line with [REDACTED]: \"Bearer \" followed by a token (keep the word Bearer: \"Bearer [REDACTED]\"); keys starting with sk- followed by 8 or more letters, digits, dashes or underscores; and values after password=, token= or api_key= (up to the next space or &), keeping the name (\"password=[REDACTED]\").\n2. scope_report(required, granted): return {\"missing\": sorted required not granted, \"excess\": sorted granted not required, \"ok\": True if nothing is missing}.\n3. needs_rotation(secrets, today, max_age=90): secrets is a list of {\"name\", \"created\"} with created as a day number. Return sorted names whose age (today − created) is at least max_age.",
    starter:R`import re

def redact(line):
    return line

def scope_report(required, granted):
    return {"missing": [], "excess": [], "ok": True}

def needs_rotation(secrets, today, max_age=90):
    return []`,
    tests:R`assert redact("GET /x Authorization: Bearer eyJhbGci.abc123") == "GET /x Authorization: Bearer [REDACTED]"
assert redact("key sk-live_ab12cd34ef used") == "key [REDACTED] used"
assert redact("login?user=ben&password=hunter2&next=/home") == "login?user=ben&password=[REDACTED]&next=/home"
assert redact("api_key=XYZ token=abc ok") == "api_key=[REDACTED] token=[REDACTED] ok"
assert redact("sk-short is fine") == "sk-short is fine", "sk- needs 8 or more characters after it"
r = scope_report({"users.read", "users.create"}, {"users.read", "mail.send", "directory.admin"})
assert r == {"missing": ["users.create"], "excess": ["directory.admin", "mail.send"], "ok": False}
S = [{"name": "crm_api", "created": 10}, {"name": "slack", "created": 80}, {"name": "old", "created": 0}]
assert needs_rotation(S, 100) == ["crm_api", "old"]`,
    hint:"Three substitutions: re.sub(r\"Bearer\\s+\\S+\", \"Bearer [REDACTED]\", line); re.sub(r\"sk-[A-Za-z0-9_-]{8,}\", \"[REDACTED]\", line); re.sub(r\"(password|token|api_key)=[^\\s&]+\", r\"\\1=[REDACTED]\", line).",
    solution:R`import re

def redact(line):
    line = re.sub(r"Bearer\s+\S+", "Bearer [REDACTED]", line)
    line = re.sub(r"sk-[A-Za-z0-9_-]{8,}", "[REDACTED]", line)
    line = re.sub(r"(password|token|api_key)=[^\s&]+", r"\1=[REDACTED]", line)
    return line

def scope_report(required, granted):
    missing = sorted(set(required) - set(granted))
    return {"missing": missing, "excess": sorted(set(granted) - set(required)), "ok": not missing}

def needs_rotation(secrets, today, max_age=90):
    return sorted(s["name"] for s in secrets if today - s["created"] >= max_age)`,
    bonus:{
      task:"Bonus: write find_hardcoded(workflow_json) that scans a workflow definition string for likely secrets (sk- keys as above, \"Bearer \" plus a token, and \"password\": \"...\" with a non-empty value) and returns how many it found. Use it to block exports that contain secrets.",
      tests:R`wf = '{"nodes": [{"headers": {"Authorization": "Bearer abc.def"}}, {"password": "p@ss"}, {"key": "sk-abcdefgh12"}, {"password": ""}]}'
assert find_hardcoded(wf) == 3
assert find_hardcoded('{"credentials": {"id": "cred_42"}}') == 0, "Credential references are fine"`,
      hint:"Sum len(re.findall(...)) for three patterns: r\"sk-[A-Za-z0-9_-]{8,}\", r\"Bearer\\s+[^\\s\\\"]+\", r'\"password\"\\s*:\\s*\"[^\"]+\"'.",
      solution:R`def find_hardcoded(workflow_json):
    patterns = [r"sk-[A-Za-z0-9_-]{8,}", r"Bearer\s+[^\s\"]+", r'"password"\s*:\s*"[^"]+"']
    return sum(len(re.findall(p, workflow_json)) for p in patterns)`}}
},
{ id:"w19", act:4, title:"Measuring ROI and choosing what to build", mins:35,
  hook:"You have twelve automation ideas and time for three this quarter. Leadership asks which three and what they'll return. \"They'll save time\" won't win the budget; numbers will.",
  learn:[
    {h:"The ROI basics", p:[
      "Monthly value = runs per month × minutes saved per run ÷ 60 × loaded hourly cost, plus error costs avoided. Monthly cost = platform and API fees + maintenance time. Build cost is the one-time effort. Payback period = build cost ÷ (monthly value − monthly cost). First-year ROI = (12 × net monthly benefit − build cost) ÷ build cost."],
     code:R`value = 400 * 6 / 60 * 45          # 400 runs x 6 min x $45/h = $1,800/month
net = value - 150                   # minus $150/month running cost
payback = 6000 / net                # $6,000 build -> about 3.6 months`},
    {h:"Beyond hours saved", p:[
      "Some of the biggest wins don't show up as hours: fewer errors (a missed account cancellation is a security incident), faster cycle times (customers onboarded the same day), compliance and better experience for employees and customers. Estimate them honestly, or at least list them. Also count adoption: an automation nobody uses saves nothing."]},
    {h:"Prioritizing", p:[
      "Score candidates by value against effort and risk, and start with high-value, low-effort, low-risk ones to build momentum and trust. Measure before and after (baseline time, error rates) so results are credible. Retire automations whose value has disappeared; maintenance never stops."]}
  ],
  mistakes:["Claiming savings without measuring the baseline first.","Ignoring maintenance and platform costs in the ROI.","Picking the most technically interesting project instead of the most valuable."],
  ai:"AI automations add token costs and review time to the equation. Being able to model ROI is what turns an AI engineer into a trusted advisor.",
  interview:{q:"How would you prove an automation was worth it?", a:"Measure a baseline before launch (time per task, volume, error rate, cycle time), then track the same metrics after, plus adoption. Convert time saved to cost using loaded rates, subtract build, platform, API and maintenance costs, and report payback period and first-year ROI alongside qualitative benefits like fewer errors and faster turnaround."},
  terms:[["ROI","Return on investment: net benefit relative to cost."],["Payback period","How long until savings cover the build cost."],["Loaded hourly cost","Salary plus benefits and overhead per hour."],["Baseline","Measurements before the change, for comparison."],["Cycle time","How long a process takes from start to finish."],["Value vs effort","A simple way to prioritize projects."]],
  quiz:[
    {t:"mcq", q:"400 runs a month save 6 minutes each at $45 an hour. Monthly value?", o:["$1,800","$18,000","$180","$2,700"], a:0},
    {t:"mcq", q:"Build cost $6,000; net monthly benefit $1,500. Payback period?", o:["4 months","6 months","1.5 months","12 months"], a:0},
    {t:"mcq", q:"Why measure a baseline first?", o:["To make savings claims credible","It's required by cron","To slow the project","It isn't needed"], a:0}
  ],
  lab:{
    task:"1. roi(runs, minutes_saved, hourly_cost, build_cost, monthly_cost): return {\"monthly_value\", \"monthly_net\", \"payback_months\", \"first_year_roi\"}, all rounded to 2. payback_months is None if monthly_net ≤ 0. first_year_roi = (12 × monthly_net − build_cost) ÷ build_cost.\n2. prioritize(ideas): ideas are dicts with \"name\", \"value\" (monthly net $), \"effort\" (days) and \"risk\" (\"low\", \"medium\" or \"high\"). Score = value ÷ effort × multiplier (low 1.0, medium 0.7, high 0.4). Return names sorted by score, highest first (ties keep input order).",
    starter:R`def roi(runs, minutes_saved, hourly_cost, build_cost, monthly_cost):
    return {}

def prioritize(ideas):
    return []`,
    tests:R`r = roi(400, 6, 45, 6000, 150)
assert r == {"monthly_value": 1800.0, "monthly_net": 1650.0, "payback_months": 3.64, "first_year_roi": 2.3}, "Got " + str(r)
assert roi(10, 1, 30, 5000, 50)["payback_months"] is None, "Costs exceed value: no payback"
ideas = [{"name": "invoice entry", "value": 3000, "effort": 20, "risk": "medium"},
         {"name": "order confirmations", "value": 600, "effort": 2, "risk": "low"},
         {"name": "refund approvals", "value": 5000, "effort": 15, "risk": "high"}]
assert prioritize(ideas) == ["order confirmations", "refund approvals", "invoice entry"], "Got " + str(prioritize(ideas))`,
    hint:"monthly_value = runs * minutes_saved / 60 * hourly_cost. Score dict: {\"low\": 1.0, \"medium\": 0.7, \"high\": 0.4}[risk].",
    solution:R`def roi(runs, minutes_saved, hourly_cost, build_cost, monthly_cost):
    value = runs * minutes_saved / 60 * hourly_cost
    net = value - monthly_cost
    return {"monthly_value": round(value, 2), "monthly_net": round(net, 2),
            "payback_months": round(build_cost / net, 2) if net > 0 else None,
            "first_year_roi": round((12 * net - build_cost) / build_cost, 2)}

def prioritize(ideas):
    mult = {"low": 1.0, "medium": 0.7, "high": 0.4}
    score = lambda i: i["value"] / i["effort"] * mult[i["risk"]]
    return [i["name"] for i in sorted(ideas, key=lambda i: -score(i))]`,
    bonus:{
      task:"Bonus: write sensitivity(runs, minutes_saved, hourly_cost, build_cost, monthly_cost) that returns the payback months when adoption is 50%, 100% and 150% of the estimated runs, as {0.5: ..., 1.0: ..., 1.5: ...}. Leaders trust ranges more than single numbers.",
      tests:R`s = sensitivity(400, 6, 45, 6000, 150)
assert s == {0.5: 8.0, 1.0: 3.64, 1.5: 2.35}, "Got " + str(s)`,
      hint:"Call roi with int(runs * factor) for each factor.",
      solution:R`def sensitivity(runs, minutes_saved, hourly_cost, build_cost, monthly_cost):
    return {f: roi(int(runs * f), minutes_saved, hourly_cost, build_cost, monthly_cost)["payback_months"] for f in (0.5, 1.0, 1.5)}`}}
},
{ id:"w20", act:4, title:"Capstone: an end-to-end customer onboarding automation", mins:60,
  hook:"Build the real thing: when a customer signs up, a signed \"account created\" webhook arrives. Your automation verifies it, ignores duplicates, maps the record, creates the customer in each system with retries and dead-lettering, requires sales approval for enterprise plans, notifies the account owner, and writes a tamper-evident audit trail.",
  learn:[
    {h:"The flow", p:[
      "1) Verify the webhook signature and freshness. 2) Deduplicate by event id. 3) Map the signup record into the target shape and validate it. 4) Create the customer in each system (retrying transient errors, dead-lettering failures). 5) If the plan needs special terms (like enterprise pricing), request approval instead of activating it. 6) Notify the account owner with a Slack card. 7) Audit every step with a hash-chained log. 8) Return a clear summary."]},
    {h:"Taking it live", p:[
      "Put this behind a FastAPI endpoint or an n8n workflow calling your code, queue the work so the webhook returns 202 quickly, store idempotency keys and the audit log in a database, keep credentials in a secrets manager with least-privilege scopes, add dashboards for runs, failures and DLQ size, and measure the ROI against the manual baseline. That's a portfolio project that directly mirrors real enterprise work."]},
    {h:"What you now know", p:[
      "Triggers and workflow engines, webhook security, cron, n8n items and expressions, platform economics, pagination and rate limits, AI classification steps, structured data validation, approvals, retries and dead-letter queues, idempotency, queues, FastAPI services, messaging formats, document extraction, enterprise mappings and delta syncs, audit trails, secrets and scopes, and ROI. That's the full automation engineering toolkit."]}
  ],
  mistakes:["Activating special pricing or privileged access automatically because the request came from a trusted system.","Returning success when some steps quietly failed.","Skipping the audit trail on the steps that matter most."],
  ai:"Add an AI step (for example, drafting a personalized welcome note or classifying the customer's industry) and this capstone becomes an AI automation with every production safeguard in place.",
  interview:{q:"Walk me through a production onboarding automation you'd build.", a:"A signed webhook from the source system triggers it; I verify and deduplicate, map and validate the record, then create it in each downstream system with idempotent, retried calls and a dead-letter queue for failures. Anything needing special terms or privileged access goes through an approval step with separation of duties. The owner gets a Slack card, every action is written to a hash-chained audit log, and dashboards track runs, failures and ROI."},
  terms:[["End-to-end automation","A workflow covering the whole process from trigger to outcome."],["Privileged access","Permissions that could cause serious harm if misused."],["Run summary","A clear report of what a workflow run did and didn't do."],["Orchestrator","The code that coordinates all the steps."],["Graceful degradation","Continuing safely when one part fails."]],
  quiz:[
    {t:"mcq", q:"The customer chose an enterprise plan with custom pricing. The automation should…", o:["Request approval, not activate it directly","Activate it immediately","Skip onboarding","Email the contract to everyone"], a:0},
    {t:"mcq", q:"The same signed webhook arrives twice. The automation should…", o:["Detect the duplicate and do nothing the second time","Onboard twice","Crash","Alert security"], a:0},
    {t:"mcq", q:"One account creation fails permanently. Best overall outcome?", o:["Continue other steps, dead-letter the failure and report it in the summary","Hide it","Stop and delete everything","Retry forever"], a:0}
  ],
  lab:{
    task:"Finish Onboarding.handle(body, timestamp, signature, now). Everything you need is provided: sign/verify, TransientError/PermanentError, AuditLog, and the clients passed in.\n\n1. verify(...); if not ok, return {\"status\": \"rejected\", \"reason\": reason}.\n2. event = json.loads(body). If event[\"id\"] was already handled, return {\"status\": \"duplicate\"}. Remember the id.\n3. cust = {\"id\": a[\"id\"], \"email\": a[\"email\"].lower(), \"plan\": a[\"plan\"], \"owner\": a[\"owner\"]} where a = event[\"account\"].\n4. For each system in self.systems (in order): call self.create(system, cust), retrying TransientError up to 3 calls in total. Success: add system to created and audit (\"automation\", \"create \" + system, cust id). If it fails after retries or with PermanentError: add {\"system\": system, \"error\": str(e)} to self.dlq and audit (\"automation\", \"failed \" + system, cust id).\n5. If the plan is in self.approval_plans: audit (\"automation\", \"request approval\", cust id) and set approval to \"pending\"; otherwise approval is \"not needed\".\n6. Call self.notify(owner, text) with text f\"{cust id} onboarded: {len(created)} of {len(systems)} systems\" and audit (\"automation\", \"notify \" + owner, cust id).\n7. Return {\"status\": \"done\" if nothing failed else \"partial\", \"created\": created, \"approval\": approval}.\n\nUse now as the audit timestamp.",
    starter:R`import hmac, hashlib, json

def sign(secret, timestamp, body):
    return hmac.new(secret.encode(), f"{timestamp}.{body}".encode(), hashlib.sha256).hexdigest()

def verify(secret, body, timestamp, signature, now, tolerance=300):
    if abs(now - timestamp) > tolerance:
        return (False, "stale")
    if not hmac.compare_digest(sign(secret, timestamp, body), signature):
        return (False, "bad signature")
    return (True, "ok")

class TransientError(Exception): pass
class PermanentError(Exception): pass

def entry_hash(entry):
    data = {k: v for k, v in entry.items() if k != "hash"}
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()

class AuditLog:
    def __init__(self):
        self.entries = []
    def append(self, actor, action, target, ts):
        prev = self.entries[-1]["hash"] if self.entries else "0" * 64
        e = {"i": len(self.entries), "actor": actor, "action": action, "target": target, "ts": ts, "prev": prev}
        e["hash"] = entry_hash(e)
        self.entries.append(e)
        return e["hash"]

class Onboarding:
    def __init__(self, secret, systems, create, notify, approval_plans):
        self.secret, self.systems = secret, systems
        self.create, self.notify = create, notify
        self.approval_plans = approval_plans
        self.seen, self.dlq, self.audit = set(), [], AuditLog()

    def handle(self, body, timestamp, signature, now):
        return {"status": "rejected", "reason": "not implemented"}`,
    tests:R`calls, notes = [], []
def create(system, cust):
    calls.append(system)
    if system == "billing" and calls.count("billing") < 2:
        raise TransientError("timeout")
    if system == "support":
        raise PermanentError("support desk rejected: missing phone")
    return "ok"
ob = Onboarding("k", ["crm", "billing", "support"], create, lambda who, text: notes.append((who, text)), {"enterprise"})
body = json.dumps({"id": "evt_1", "account": {"id": "C2201", "email": "Ops@Acme.com", "plan": "enterprise", "owner": "asha"}})
sig = sign("k", 1000, body)
assert ob.handle(body, 1000, "forged", 1010) == {"status": "rejected", "reason": "bad signature"}
r = ob.handle(body, 1000, sig, 1010)
assert r == {"status": "partial", "created": ["crm", "billing"], "approval": "pending"}, "Got " + str(r)
assert calls == ["crm", "billing", "billing", "support"], "Retry transient errors; don't retry permanent ones. Got " + str(calls)
assert ob.dlq == [{"system": "support", "error": "support desk rejected: missing phone"}]
assert notes == [("asha", "C2201 onboarded: 2 of 3 systems")]
assert [e["action"] for e in ob.audit.entries] == ["create crm", "create billing", "failed support", "request approval", "notify asha"], "Got " + str([e["action"] for e in ob.audit.entries])
assert all(e["target"] == "C2201" and e["ts"] == 1010 for e in ob.audit.entries)
assert ob.handle(body, 1000, sig, 1020) == {"status": "duplicate"} and len(calls) == 4, "Duplicates do nothing"
ob2 = Onboarding("k", ["crm"], lambda s, h: "ok", lambda w, t: None, {"enterprise"})
b2 = json.dumps({"id": "evt_2", "account": {"id": "C9", "email": "A@B.com", "plan": "starter", "owner": "chen"}})
assert ob2.handle(b2, 5, sign("k", 5, b2), 6) == {"status": "done", "created": ["crm"], "approval": "not needed"}
assert ob2.handle(b2, 5, sign("k", 5, b2), 400)["reason"] == "stale"`,
    hint:"Retry loop: for attempt in range(3): try: self.create(system, cust); created.append(system); break; except TransientError as e: if attempt == 2: record the failure; except PermanentError as e: record the failure and break. A small helper def fail(system, e) keeps it tidy.",
    solution:R`import hmac, hashlib, json

def sign(secret, timestamp, body):
    return hmac.new(secret.encode(), f"{timestamp}.{body}".encode(), hashlib.sha256).hexdigest()

def verify(secret, body, timestamp, signature, now, tolerance=300):
    if abs(now - timestamp) > tolerance:
        return (False, "stale")
    if not hmac.compare_digest(sign(secret, timestamp, body), signature):
        return (False, "bad signature")
    return (True, "ok")

class TransientError(Exception): pass
class PermanentError(Exception): pass

def entry_hash(entry):
    data = {k: v for k, v in entry.items() if k != "hash"}
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()

class AuditLog:
    def __init__(self):
        self.entries = []
    def append(self, actor, action, target, ts):
        prev = self.entries[-1]["hash"] if self.entries else "0" * 64
        e = {"i": len(self.entries), "actor": actor, "action": action, "target": target, "ts": ts, "prev": prev}
        e["hash"] = entry_hash(e)
        self.entries.append(e)
        return e["hash"]

class Onboarding:
    def __init__(self, secret, systems, create, notify, approval_plans):
        self.secret, self.systems = secret, systems
        self.create, self.notify = create, notify
        self.approval_plans = approval_plans
        self.seen, self.dlq, self.audit = set(), [], AuditLog()

    def handle(self, body, timestamp, signature, now):
        ok, reason = verify(self.secret, body, timestamp, signature, now)
        if not ok:
            return {"status": "rejected", "reason": reason}
        event = json.loads(body)
        if event["id"] in self.seen:
            return {"status": "duplicate"}
        self.seen.add(event["id"])
        a = event["account"]
        cust = {"id": a["id"], "email": a["email"].lower(), "plan": a["plan"], "owner": a["owner"]}
        created, failed = [], False

        def fail(system, e):
            self.dlq.append({"system": system, "error": str(e)})
            self.audit.append("automation", "failed " + system, cust["id"], now)

        for system in self.systems:
            for attempt in range(3):
                try:
                    self.create(system, cust)
                    created.append(system)
                    self.audit.append("automation", "create " + system, cust["id"], now)
                    break
                except TransientError as e:
                    if attempt == 2:
                        fail(system, e)
                        failed = True
                except PermanentError as e:
                    fail(system, e)
                    failed = True
                    break

        if cust["plan"] in self.approval_plans:
            self.audit.append("automation", "request approval", cust["id"], now)
            approval = "pending"
        else:
            approval = "not needed"

        self.notify(cust["owner"], f"{cust['id']} onboarded: {len(created)} of {len(self.systems)} systems")
        self.audit.append("automation", "notify " + cust["owner"], cust["id"], now)
        return {"status": "partial" if failed else "done", "created": created, "approval": approval}`}
}
];
