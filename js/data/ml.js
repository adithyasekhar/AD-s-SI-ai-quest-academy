/* =====================================================================
   TRACK 4: ALGORITHMS AND MACHINE LEARNING
   Everything is built from scratch in plain Python so learners see
   exactly what scikit-learn and PyTorch do underneath.
   ===================================================================== */
const ML_ACTS = [
  {n:1, title:"Data and classic models", badge:"Model Maker"},
  {n:2, title:"Evaluation and algorithms", badge:"Algorithm Analyst"},
  {n:3, title:"Neural networks from scratch", badge:"Deep Learner"},
  {n:4, title:"Modern AI and MLOps", badge:"ML Engineer"}
];

const ML_LESSONS = [
/* ---------------- ACT 1 ---------------- */
{ id:"m01", act:1, title:"Thinking in data: features, labels and leakage", mins:35,
  hook:"HR wants to predict which employees will leave. Someone builds a model with 99% accuracy. It used a column called exit_interview_date. The model learned nothing useful; it read the answer.",
  learn:[
    {h:"Features and labels", p:[
      "Machine learning learns a mapping from inputs to an output. The inputs are features (tenure, salary band, commute distance, last rating). The output you want to predict is the label or target (left the company: yes or no). Each row is one example. A model is only as good as the examples and features you give it."]},
    {h:"Kinds of problems", p:[
      "Regression predicts a number (next month's overtime hours). Classification predicts a category (will leave or stay; ticket type). Clustering finds groups with no labels (employee segments). Ranking orders items (which candidates to review first). Picking the right problem type decides the model, the metrics and what \"good\" means."]},
    {h:"Data leakage", p:[
      "Leakage is when a feature contains information that wouldn't be available at prediction time, often the label itself in disguise: an exit interview date, a \"termination code\", an ID that happens to encode the outcome. It produces amazing test scores and useless real-world models. Ask of every feature: would I know this value at the moment I need the prediction?"],
     code:R`# Suspicious: this feature perfectly determines the label
rows = [{"exit_code": "T1", "left": 1}, {"exit_code": None, "left": 0}]
# Would we know exit_code BEFORE the person leaves? No -> leakage.`}
  ],
  mistakes:["Celebrating a near-perfect score without checking for leakage.","Choosing classification or regression by habit instead of by what the business needs.","Including IDs or timestamps that secretly encode the outcome."],
  ai:"Every model, from logistic regression to an LLM fine-tune, starts with the same question: what are the inputs, what is the target, and is the data honest?",
  interview:{q:"A model scores 99% on test data. What do you check first?", a:"Leakage and evaluation setup: features that encode the label or come from the future, duplicate rows shared between train and test, and whether the test split mirrors real use (for example, a time-based split). Then check the class balance: 99% accuracy is trivial if 99% of examples are one class."},
  terms:[["Feature","An input variable the model uses."],["Label / target","The output the model learns to predict."],["Example","One row of data: features plus label."],["Regression","Predicting a number."],["Classification","Predicting a category."],["Data leakage","Information in training that won't exist at prediction time."]],
  quiz:[
    {t:"mcq", q:"Predicting the number of sick days next quarter is…", o:["Regression","Classification","Clustering","Ranking"], a:0},
    {t:"mcq", q:"Which feature most likely leaks the \"left the company\" label?", o:["Tenure in months","Final paycheck date","Department","Commute distance"], a:1},
    {t:"mcq", q:"Grouping employees into segments with no labels is…", o:["Classification","Clustering","Regression","Leakage"], a:1}
  ],
  lab:{
    task:"1. problem_type(labels): return \"classification\" if every label is a string or bool, or there are at most 10 distinct values; otherwise \"regression\".\n2. leaky_features(rows, label): return the sorted names of features that perfectly predict the label, meaning each distinct feature value (including None) always appears with the same label value, AND the feature has at least 2 distinct values. Skip the label column itself.",
    starter:R`def problem_type(labels):
    return "regression"

def leaky_features(rows, label):
    return []`,
    tests:R`assert problem_type(["stay", "leave", "stay"]) == "classification"
assert problem_type([0, 1, 1, 0]) == "classification", "Few distinct values means classification"
assert problem_type([1.5, 2.25, 3.0, 4.75, 5.5, 6.0, 7.25, 8.0, 9.5, 10.0, 11.25]) == "regression"
assert problem_type([True, False]) == "classification"
rows = [
  {"tenure": 12, "dept": "IT", "exit_code": "T1", "badge": 101, "left": 1},
  {"tenure": 30, "dept": "HR", "exit_code": None, "badge": 102, "left": 0},
  {"tenure": 12, "dept": "IT", "exit_code": None, "badge": 103, "left": 0},
  {"tenure": 5, "dept": "IT", "exit_code": "T2", "badge": 104, "left": 1},
]
r = leaky_features(rows, "left")
assert r == ["badge", "exit_code"], "exit_code and the unique badge id both map perfectly to the label. Got " + str(r)
assert "tenure" not in r and "dept" not in r, "tenure 12 appears with both labels, so it isn't leaky"`,
    hint:"For each feature, build a dict value -> set of labels seen. It's leaky if every set has size 1 and the dict has at least 2 keys.",
    solution:R`def problem_type(labels):
    if all(isinstance(x, (str, bool)) for x in labels) or len(set(labels)) <= 10:
        return "classification"
    return "regression"

def leaky_features(rows, label):
    names = [k for k in rows[0] if k != label]
    out = []
    for f in names:
        seen = {}
        for r in rows:
            seen.setdefault(r.get(f), set()).add(r[label])
        if len(seen) >= 2 and all(len(v) == 1 for v in seen.values()):
            out.append(f)
    return sorted(out)`,
    bonus:{
      task:"Bonus: unique IDs are a special trap: they \"perfectly predict\" any label because every value is different. Write id_like(rows, label) returning sorted feature names whose values are all distinct across rows (excluding the label).",
      tests:R`rows = [{"badge": 1, "dept": "IT", "left": 1}, {"badge": 2, "dept": "IT", "left": 0}, {"badge": 3, "dept": "HR", "left": 0}]
assert id_like(rows, "left") == ["badge"], "Got " + str(id_like(rows, "left"))`,
      hint:"A feature is id-like if len(set(values)) == len(rows).",
      solution:R`def id_like(rows, label):
    return sorted(f for f in rows[0] if f != label and len({r[f] for r in rows}) == len(rows))`}}
},
{ id:"m02", act:1, title:"Exploring data (EDA)", mins:35,
  hook:"Before training anything, a senior data scientist spends a day just looking at the data. Juniors skip it and spend a week debugging a model trained on typos and outliers.",
  learn:[
    {h:"Summaries first", p:[
      "For every column: how many values, how many missing, the type, and for numbers the mean, median, minimum and maximum. The mean and median disagreeing is a clue: a few huge values (like a CEO's salary) pull the mean up but not the median."]},
    {h:"Outliers and the IQR rule", p:[
      "The interquartile range (IQR) is Q3 minus Q1, the spread of the middle half of the data. A common rule flags values below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR as outliers. Outliers can be errors (an age of 430) or real but rare cases (a genuine $2M salary). Investigate before deleting."],
     code:R`import pandas as pd
df = pd.read_csv("employees.csv")
df.describe()                 # count, mean, std, min, quartiles, max
df.isna().sum()               # missing values per column
df["salary"].plot.hist()      # look at the distribution`},
    {h:"Look at relationships", p:[
      "Class balance: are 3% or 50% of employees leavers? Correlations between features and the label. Values that only appear in one group. Charts (histograms, box plots, scatter plots) often reveal in seconds what summaries hide."]}
  ],
  mistakes:["Training on data you've never looked at.","Deleting every outlier automatically, including the rare cases that matter most.","Ignoring class imbalance until the metrics make no sense."],
  ai:"EDA is where most real insights and most bug discoveries happen. It's also a favorite interview topic because it shows how you think.",
  interview:{q:"How do you handle missing values?", a:"First understand why they're missing: random gaps, a system change, or missing because of the outcome. Then choose: drop rows if few and random, impute with median or mode, use a model-based imputer, or add a \"was missing\" indicator feature, since missingness itself can be predictive. Always fit imputation on training data only."},
  terms:[["EDA","Exploratory data analysis: summarizing and visualizing data before modeling."],["Median","The middle value when sorted; robust to outliers."],["Quartile","Values splitting sorted data into four equal parts (Q1, Q2, Q3)."],["IQR","Interquartile range: Q3 minus Q1."],["Outlier","A value far from the rest of the data."],["Class imbalance","When one label is much rarer than another."]],
  quiz:[
    {t:"mcq", q:"Mean salary is far above the median. Most likely?", o:["A few very high salaries","Missing values","Every salary is the same","A data type error"], a:0},
    {t:"mcq", q:"Q1 = 40, Q3 = 60. The upper outlier fence (1.5 × IQR rule) is…", o:["60","80","90","100"], a:2, x:"IQR = 20; 60 + 1.5 × 20 = 90."},
    {t:"mcq", q:"An age of 430 in HR data is most likely…", o:["A data entry error to investigate","A real employee","Fine to keep","A label"], a:0}
  ],
  lab:{
    task:"1. median(values): the middle of the sorted values, or the average of the two middle values for an even count.\n2. describe(values): values may contain None. Return {\"count\": non-missing count, \"missing\": number of None, \"mean\": mean rounded to 2, \"median\": median, \"min\": ..., \"max\": ...} using only non-missing values.\n3. iqr_outliers(values): Q1 is the median of the lower half and Q3 the median of the upper half of the sorted values (for an odd count, leave out the middle value). Return the values outside Q1 − 1.5×IQR and Q3 + 1.5×IQR, in their original order.",
    starter:R`def median(values):
    return 0

def describe(values):
    return {}

def iqr_outliers(values):
    return []`,
    tests:R`assert median([3, 1, 2]) == 2 and median([4, 1, 3, 2]) == 2.5
d = describe([50, None, 60, 70, None, 1000])
assert d == {"count": 4, "missing": 2, "mean": 295.0, "median": 65.0, "min": 50, "max": 1000}, "Got " + str(d)
assert iqr_outliers([10, 12, 11, 13, 12, 95, 11, 10, 12]) == [95], "Got " + str(iqr_outliers([10, 12, 11, 13, 12, 95, 11, 10, 12]))
assert iqr_outliers([1, 2, 3, 4]) == [], "No outliers"
assert iqr_outliers([-50, 10, 11, 12, 13, 12, 11, 10]) == [-50], "Low outliers count too"`,
    hint:"s = sorted(values); n = len(s); lower = s[:n // 2]; upper = s[(n + 1) // 2:]. Then q1 = median(lower), q3 = median(upper).",
    solution:R`def median(values):
    s = sorted(values)
    n = len(s)
    mid = n // 2
    return s[mid] if n % 2 else (s[mid - 1] + s[mid]) / 2

def describe(values):
    v = [x for x in values if x is not None]
    return {"count": len(v), "missing": len(values) - len(v), "mean": round(sum(v) / len(v), 2),
            "median": median(v), "min": min(v), "max": max(v)}

def iqr_outliers(values):
    s = sorted(values)
    n = len(s)
    q1, q3 = median(s[:n // 2]), median(s[(n + 1) // 2:])
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return [x for x in values if x < lo or x > hi]`,
    bonus:{
      task:"Bonus: write class_balance(labels) returning {label: share rounded to 3}, sorted from most to least common (ties keep first-seen order), and is_imbalanced(labels, threshold=0.2) that's True when the rarest class share is below threshold.",
      tests:R`assert class_balance(["stay"] * 9 + ["leave"]) == {"stay": 0.9, "leave": 0.1}
assert list(class_balance(["a", "b", "b"])) == ["b", "a"]
assert is_imbalanced(["stay"] * 9 + ["leave"]) and not is_imbalanced(["a", "b"] * 5)`,
      hint:"Count with a dict in first-seen order, then sorted(counts, key=lambda k: -counts[k]).",
      solution:R`def class_balance(labels):
    counts = {}
    for x in labels:
        counts[x] = counts.get(x, 0) + 1
    return {k: round(counts[k] / len(labels), 3) for k in sorted(counts, key=lambda k: -counts[k])}

def is_imbalanced(labels, threshold=0.2):
    return min(class_balance(labels).values()) < threshold`}}
},
{ id:"m03", act:1, title:"Linear regression by hand", mins:40,
  hook:"Finance asks: if we add one more support agent, how many more tickets can we close per week? A straight line through last year's data gives a surprisingly good answer.",
  learn:[
    {h:"The model", p:[
      "Linear regression predicts y = w × x + b: a weight (slope) times the feature, plus a bias (intercept). With many features it's w1×x1 + w2×x2 + … + b. Training means choosing w and b so predictions are as close as possible to the real values."]},
    {h:"Least squares", p:[
      "\"Close\" usually means minimizing mean squared error (MSE): the average of (prediction − actual)². For one feature there's an exact formula: w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², and b = ȳ − w × x̄, where x̄ and ȳ are the means. Squaring punishes big misses heavily, which is why outliers pull the line toward them."],
     code:R`from sklearn.linear_model import LinearRegression
model = LinearRegression().fit(X_train, y_train)
print(model.coef_, model.intercept_)`},
    {h:"Gradient descent", p:[
      "The exact formula doesn't scale to huge models, so most of ML uses gradient descent: start with guesses, compute how the error changes if you nudge each parameter (the gradient), step in the direction that reduces error, and repeat. The step size is the learning rate. The same idea trains neural networks and LLMs."]}
  ],
  mistakes:["Assuming a linear relationship without plotting the data.","Reading the weight as cause and effect when it only shows correlation.","Picking a learning rate so large that gradient descent diverges."],
  ai:"Linear regression is the \"hello world\" of ML, and gradient descent on MSE is the same engine that trains every neural network.",
  interview:{q:"What's the difference between the closed-form solution and gradient descent?", a:"The closed form computes the exact least-squares answer in one step, which is great for small problems but expensive for many features or huge data. Gradient descent iteratively improves parameters using the gradient of the loss; it scales to large data and complex models like neural networks, at the cost of tuning a learning rate and iterations."},
  terms:[["Weight / coefficient","How much a feature changes the prediction."],["Bias / intercept","The prediction when all features are zero."],["MSE","Mean squared error: average of squared prediction errors."],["Least squares","Choosing parameters that minimize squared error."],["Gradient descent","Repeatedly stepping parameters in the direction that lowers the loss."],["Learning rate","The size of each gradient descent step."]],
  quiz:[
    {t:"mcq", q:"Predictions [2, 4], actual [3, 6]. MSE is…", o:["1.5","2.5","3","5"], a:1, x:"Errors are -1 and -2; squares 1 and 4; mean 2.5."},
    {t:"mcq", q:"The learning rate is too high. Typical symptom?", o:["Loss jumps around or explodes","Training is slow but steady","Perfect accuracy","Nothing"], a:0},
    {t:"mcq", q:"A positive weight on \"training hours\" means…", o:["Training causes higher output","Higher training hours go with higher predictions in this data","The feature is useless","A bug"], a:1}
  ],
  lab:{
    task:"1. fit_line(xs, ys): return (w, b) using the least-squares formula, each rounded to 4.\n2. predict(w, b, xs): list of predictions.\n3. mse(preds, ys): mean squared error rounded to 4.",
    starter:R`def fit_line(xs, ys):
    return (0.0, 0.0)

def predict(w, b, xs):
    return []

def mse(preds, ys):
    return 0.0

agents = [2, 3, 4, 5, 6]
closed = [40, 55, 62, 78, 90]
print(fit_line(agents, closed))`,
    tests:R`w, b = fit_line([2, 3, 4, 5, 6], [40, 55, 62, 78, 90])
assert (w, b) == (12.3, 15.8), "Got " + str((w, b))
assert fit_line([0, 1, 2], [1, 3, 5]) == (2.0, 1.0), "A perfect line y = 2x + 1"
assert predict(2, 1, [0, 10]) == [1, 21]
assert mse([2, 4], [3, 6]) == 2.5
assert mse(predict(2.0, 1.0, [0, 1, 2]), [1, 3, 5]) == 0.0`,
    hint:"mx, my = means. w = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs); b = my - w * mx.",
    solution:R`def fit_line(xs, ys):
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    w = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
    b = my - w * mx
    return (round(w, 4), round(b, 4))

def predict(w, b, xs):
    return [w * x + b for x in xs]

def mse(preds, ys):
    return round(sum((p - y) ** 2 for p, y in zip(preds, ys)) / len(ys), 4)

agents = [2, 3, 4, 5, 6]
closed = [40, 55, 62, 78, 90]
print(fit_line(agents, closed))`,
    bonus:{
      task:"Bonus: write gd_fit(xs, ys, lr=0.01, steps=5000) that learns w and b by gradient descent from w = b = 0. Each step: compute predictions, then dw = (2/n) × Σ(pred − y) × x and db = (2/n) × Σ(pred − y); update w -= lr × dw and b -= lr × db. Return (w, b) rounded to 2. It should land on the same line as fit_line.",
      tests:R`w, b = gd_fit([2, 3, 4, 5, 6], [40, 55, 62, 78, 90])
assert (w, b) == (12.3, 15.8), "Gradient descent should converge to the least-squares line. Got " + str((w, b))`,
      hint:"Loop steps times; compute errors = [w * x + b - y for x, y in zip(xs, ys)] each time.",
      solution:R`def gd_fit(xs, ys, lr=0.01, steps=5000):
    w = b = 0.0
    n = len(xs)
    for _ in range(steps):
        err = [w * x + b - y for x, y in zip(xs, ys)]
        dw = 2 / n * sum(e * x for e, x in zip(err, xs))
        db = 2 / n * sum(err)
        w -= lr * dw
        b -= lr * db
    return (round(w, 2), round(b, 2))`}}
},
{ id:"m04", act:1, title:"Logistic regression and classification", mins:40,
  hook:"You want a probability, not just a guess: \"this employee has a 72% chance of leaving in 6 months\" is something HR can act on and prioritize.",
  learn:[
    {h:"From a line to a probability", p:[
      "Logistic regression computes a linear score z = w × x + b, then squashes it with the sigmoid function σ(z) = 1 / (1 + e^−z) into a probability between 0 and 1. A threshold (often 0.5) turns the probability into a yes or no."]},
    {h:"Log loss", p:[
      "Training minimizes log loss (cross-entropy): −[y × log(p) + (1 − y) × log(1 − p)], averaged over examples. Confident wrong answers are punished heavily: predicting 0.99 for someone who stayed costs far more than predicting 0.6. The same loss, extended to many classes, trains LLMs to predict the next token."],
     code:R`from sklearn.linear_model import LogisticRegression
clf = LogisticRegression().fit(X_train, y_train)
probs = clf.predict_proba(X_test)[:, 1]      # probability of class 1`},
    {h:"Thresholds are business decisions", p:[
      "0.5 isn't sacred. If missing a likely leaver is costly, lower the threshold to catch more of them (at the cost of more false alarms). Lesson 6 shows how to measure that trade-off."]}
  ],
  mistakes:["Treating predicted probabilities as calibrated without checking.","Always using a 0.5 threshold regardless of the costs of each kind of mistake.","Forgetting to scale features, which slows or destabilizes gradient descent."],
  ai:"Logistic regression is still a strong, explainable baseline in HR, finance and healthcare, and its log loss is the loss behind modern language models.",
  interview:{q:"Why use log loss instead of accuracy to train a classifier?", a:"Accuracy is flat and non-differentiable, so gradient descent can't use it. Log loss is smooth, rewards well-calibrated probabilities and penalizes confident mistakes heavily, which gives useful gradients at every step."},
  terms:[["Sigmoid","The function 1 / (1 + e^−z), mapping any number to 0–1."],["Logistic regression","A linear model plus sigmoid, used for classification."],["Log loss / cross-entropy","The loss that punishes confident wrong probabilities."],["Decision threshold","The probability above which you predict the positive class."],["Calibration","How well predicted probabilities match real frequencies."]],
  quiz:[
    {t:"mcq", q:"σ(0) equals…", o:["0","0.5","1","e"], a:1},
    {t:"mcq", q:"Which prediction is punished most by log loss when the true label is 0?", o:["p = 0.1","p = 0.5","p = 0.6","p = 0.99"], a:3},
    {t:"mcq", q:"Missing a leaver costs far more than a false alarm. You should…", o:["Raise the threshold","Lower the threshold","Remove the model","Use MSE"], a:1}
  ],
  lab:{
    task:"1. sigmoid(z).\n2. log_loss(probs, labels): average log loss. Clip each probability into [1e-15, 1 − 1e-15] first so log never sees 0. Round to 4.\n3. train_logistic(xs, ys, lr=0.1, steps=2000): one feature, start with w = b = 0. Each step: p = sigmoid(w×x + b) for all x; dw = mean((p − y) × x); db = mean(p − y); w -= lr × dw; b -= lr × db. Return (w, b).\n4. predict(w, b, xs, threshold=0.5): list of 0/1.",
    starter:R`import math

def sigmoid(z):
    return 0.5

def log_loss(probs, labels):
    return 0.0

def train_logistic(xs, ys, lr=0.1, steps=2000):
    return (0.0, 0.0)

def predict(w, b, xs, threshold=0.5):
    return []

# overtime hours per week -> left the company (1) or not (0)
hours = [2, 4, 5, 6, 9, 11, 12, 14]
left = [0, 0, 0, 0, 1, 1, 1, 1]`,
    tests:R`assert sigmoid(0) == 0.5 and abs(sigmoid(10) - 0.9999546) < 1e-6 and sigmoid(-10) < 1e-4
assert log_loss([0.9, 0.2], [1, 0]) == round(-(math.log(0.9) + math.log(0.8)) / 2, 4)
assert log_loss([1.0, 0.0], [0, 1]) > 30, "Clipping keeps confident mistakes finite but huge"
hours = [2, 4, 5, 6, 9, 11, 12, 14]
left = [0, 0, 0, 0, 1, 1, 1, 1]
w, b = train_logistic(hours, left)
assert w > 0, "More overtime should raise the probability of leaving"
assert predict(w, b, hours) == left, "Should classify the training data correctly. Got " + str(predict(w, b, hours))
before = log_loss([sigmoid(0) for _ in hours], left)
after = log_loss([sigmoid(w * x + b) for x in hours], left)
assert after < before / 2, "Training should cut the loss a lot"
assert predict(w, b, [7.5], threshold=0.99) == [0], "A high threshold predicts 1 less often"`,
    hint:"sigmoid: 1 / (1 + math.exp(-z)). In train_logistic, compute p = [sigmoid(w * x + b) for x in xs] inside the loop, then the two means.",
    solution:R`import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def log_loss(probs, labels):
    eps = 1e-15
    total = 0.0
    for p, y in zip(probs, labels):
        p = min(max(p, eps), 1 - eps)
        total += -(y * math.log(p) + (1 - y) * math.log(1 - p))
    return round(total / len(labels), 4)

def train_logistic(xs, ys, lr=0.1, steps=2000):
    w = b = 0.0
    n = len(xs)
    for _ in range(steps):
        p = [sigmoid(w * x + b) for x in xs]
        dw = sum((pi - y) * x for pi, y, x in zip(p, ys, xs)) / n
        db = sum(pi - y for pi, y in zip(p, ys)) / n
        w -= lr * dw
        b -= lr * db
    return (w, b)

def predict(w, b, xs, threshold=0.5):
    return [1 if sigmoid(w * x + b) >= threshold else 0 for x in xs]

hours = [2, 4, 5, 6, 9, 11, 12, 14]
left = [0, 0, 0, 0, 1, 1, 1, 1]`,
    bonus:{
      task:"Bonus: write decision_boundary(w, b, p=0.5) returning the x value where the predicted probability equals p (rounded to 2). Hint: solve sigmoid(w×x + b) = p using the logit log(p / (1 − p)).",
      tests:R`assert decision_boundary(1.0, -5.0) == 5.0
assert decision_boundary(2.0, -4.0, 0.88) == round((math.log(0.88 / 0.12) + 4) / 2, 2)`,
      hint:"x = (log(p / (1 - p)) - b) / w.",
      solution:R`def decision_boundary(w, b, p=0.5):
    return round((math.log(p / (1 - p)) - b) / w, 2)`}}
},
{ id:"m05", act:1, title:"Splitting data and cross-validation", mins:35,
  hook:"A model trained and tested on the same employees looks brilliant. Then it meets new hires and falls apart. Honest evaluation starts with how you split the data.",
  learn:[
    {h:"Train, validation, test", p:[
      "Training set: the model learns from it. Validation set: you compare models and tune settings on it. Test set: touched once at the very end for an honest final score. If you tune on the test set, it stops being a fair exam. A common split is 70/15/15, shuffled with a fixed random seed so results are reproducible."]},
    {h:"Cross-validation", p:[
      "With limited data, k-fold cross-validation gives a more reliable estimate: split into k folds, train on k − 1 and validate on the remaining one, rotate k times, and average. Stratified splits keep the class balance the same in every fold, which matters for rare labels like attrition."],
     code:R`from sklearn.model_selection import train_test_split, cross_val_score
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
scores = cross_val_score(model, X_tr, y_tr, cv=5)`},
    {h:"Splits that match reality", p:[
      "If you'll predict the future, split by time: train on the past, test on later data. If the same person appears many times, keep all their rows in one split (group split), or the model memorizes people instead of learning patterns."]}
  ],
  mistakes:["Tuning on the test set, then reporting that score as final.","Random splits on time-based data, which leaks the future into training.","Letting the same employee appear in both train and test."],
  ai:"Every trustworthy ML result, including LLM evals, rests on clean separation between what the system learned from and what it's judged on.",
  interview:{q:"Why do we need both a validation set and a test set?", a:"The validation set is used repeatedly to choose models and hyperparameters, so scores on it become optimistically biased. The test set is kept untouched until the end to give an unbiased estimate of real-world performance."},
  terms:[["Training set","Data the model learns from."],["Validation set","Data used to compare models and tune settings."],["Test set","Held-out data for the final, honest score."],["Random seed","A fixed starting value that makes random shuffles repeatable."],["K-fold cross-validation","Rotating k train/validation splits and averaging the results."],["Stratified split","A split that preserves class proportions."]],
  quiz:[
    {t:"mcq", q:"You tuned 50 settings using the test set. The reported test score is…", o:["Trustworthy","Optimistically biased","Pessimistic","Unaffected"], a:1},
    {t:"mcq", q:"Predicting next quarter's attrition calls for…", o:["A time-based split","A random split","No split","Testing on training data"], a:0},
    {t:"fill", q:"In 5-fold cross-validation, how many times is a model trained?", a:["5"]}
  ],
  lab:{
    task:"1. split(rows, test_frac, seed): copy the rows, shuffle them with random.Random(seed).shuffle, and put the first round(len × test_frac) rows in test and the rest in train. Return (train, test). Don't change the original list.\n2. kfold_indices(n, k): return k (train_idx, val_idx) pairs over indices 0..n−1 without shuffling. Fold sizes differ by at most 1, with larger folds first; fold i's validation indices are a consecutive block.",
    starter:R`import random

def split(rows, test_frac, seed):
    return (rows, [])

def kfold_indices(n, k):
    return []`,
    tests:R`rows = list(range(10))
tr, te = split(rows, 0.3, seed=42)
assert rows == list(range(10)), "Don't modify the original list"
assert len(te) == 3 and len(tr) == 7 and sorted(tr + te) == rows, "Sizes and coverage"
tr2, te2 = split(rows, 0.3, seed=42)
assert (tr, te) == (tr2, te2), "Same seed, same split"
c = rows[:]; random.Random(42).shuffle(c)
assert te == c[:3], "Use random.Random(seed).shuffle on a copy, then take the first rows as test"
f = kfold_indices(7, 3)
assert [v for t, v in f] == [[0, 1, 2], [3, 4], [5, 6]], "Got " + str([v for t, v in f])
assert f[1][0] == [0, 1, 2, 5, 6], "Train is everything else"
assert len(kfold_indices(10, 5)) == 5`,
    hint:"kfold: sizes = [n // k + (1 if i < n % k else 0) for i in range(k)]; walk a start pointer; val = list(range(start, start + size)).",
    solution:R`import random

def split(rows, test_frac, seed):
    c = list(rows)
    random.Random(seed).shuffle(c)
    n_test = round(len(c) * test_frac)
    return (c[n_test:], c[:n_test])

def kfold_indices(n, k):
    folds, start = [], 0
    for i in range(k):
        size = n // k + (1 if i < n % k else 0)
        val = list(range(start, start + size))
        train = [j for j in range(n) if j < start or j >= start + size]
        folds.append((train, val))
        start += size
    return folds`,
    bonus:{
      task:"Bonus: write stratified_split(rows, label, test_frac, seed) that splits each class separately (using split on that class's rows with the same seed) and combines them, so the test set keeps the class balance. Return (train, test).",
      tests:R`rows = [{"id": i, "left": 1 if i < 4 else 0} for i in range(20)]
tr, te = stratified_split(rows, "left", 0.25, seed=1)
assert len(te) == 5 and sum(r["left"] for r in te) == 1, "4 leavers x 0.25 = 1 leaver in test"
assert len(tr) + len(te) == 20`,
      hint:"Group rows by r[label], call split on each group, and extend train and test.",
      solution:R`def stratified_split(rows, label, test_frac, seed):
    groups = {}
    for r in rows:
        groups.setdefault(r[label], []).append(r)
    train, test = [], []
    for g in groups.values():
        a, b = split(g, test_frac, seed)
        train += a
        test += b
    return (train, test)`}}
},
/* ---------------- ACT 2 ---------------- */
{ id:"m06", act:2, title:"Metrics: precision, recall and friends", mins:40,
  hook:"Your attrition model has 95% accuracy. It also never flags a single leaver, because only 5% of employees leave. Accuracy lied. Better metrics would have told the truth.",
  learn:[
    {h:"The confusion matrix", p:[
      "Every binary prediction is one of four outcomes. True positive (TP): predicted leave, did leave. False positive (FP): predicted leave, stayed (a false alarm). False negative (FN): predicted stay, left (a miss). True negative (TN): predicted stay, stayed. All the key metrics come from these four counts."]},
    {h:"Precision, recall, F1", p:[
      "Precision = TP / (TP + FP): when the model says \"will leave\", how often is it right? Recall = TP / (TP + FN): of the people who actually left, how many did it catch? F1 is their harmonic mean, 2 × P × R / (P + R), which is high only when both are. There's a trade-off: lowering the threshold raises recall and usually lowers precision."],
     code:R`from sklearn.metrics import classification_report, confusion_matrix
print(confusion_matrix(y_true, y_pred))
print(classification_report(y_true, y_pred))`},
    {h:"Choosing the metric", p:[
      "Match the metric to the cost of errors. Screening for a rare disease or fraud: prioritize recall. Auto-rejecting job applications: prioritize precision, and keep a human in the loop. ROC-AUC summarizes ranking quality across all thresholds: the probability a random positive is scored above a random negative. With heavy imbalance, precision-recall curves are often more informative."]}
  ],
  mistakes:["Reporting accuracy on imbalanced data.","Optimizing a metric that doesn't reflect the real cost of mistakes.","Mixing up precision and recall in a stakeholder presentation."],
  ai:"The same metrics evaluate classifiers, retrieval systems and LLM guardrails. Precision and recall show up everywhere in AI engineering.",
  interview:{q:"Explain precision and recall to a non-technical manager.", a:"Precision: when the system raises a flag, how often it's right. Recall: of all the real cases out there, how many the system catches. A cautious system has high precision but misses cases; an eager one catches almost everything but raises more false alarms. We choose the balance based on which mistake costs more."},
  terms:[["Confusion matrix","A table of TP, FP, FN and TN counts."],["Precision","TP / (TP + FP): how often positive predictions are right."],["Recall","TP / (TP + FN): how many real positives are caught."],["F1 score","The harmonic mean of precision and recall."],["ROC-AUC","Probability a random positive is ranked above a random negative."],["False negative","A real positive the model missed."]],
  quiz:[
    {t:"mcq", q:"TP = 8, FP = 2, FN = 8. Precision is…", o:["0.8","0.5","0.2","0.4"], a:0},
    {t:"mcq", q:"Same counts. Recall is…", o:["0.8","0.5","0.2","1.0"], a:1},
    {t:"mcq", q:"Missing a fraud case is very costly. Prioritize…", o:["Recall","Precision","Accuracy","Training speed"], a:0}
  ],
  lab:{
    task:"1. confusion(y_true, y_pred): return {\"tp\", \"fp\", \"fn\", \"tn\"} counts for labels 0 and 1.\n2. scores(y_true, y_pred): return {\"accuracy\", \"precision\", \"recall\", \"f1\"}, each rounded to 3. Use 0.0 when a denominator is 0.",
    starter:R`def confusion(y_true, y_pred):
    return {"tp": 0, "fp": 0, "fn": 0, "tn": 0}

def scores(y_true, y_pred):
    return {}`,
    tests:R`yt = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
yp = [1, 1, 0, 0, 1, 0, 0, 0, 0, 0]
assert confusion(yt, yp) == {"tp": 2, "fp": 1, "fn": 2, "tn": 5}, "Got " + str(confusion(yt, yp))
assert scores(yt, yp) == {"accuracy": 0.7, "precision": 0.667, "recall": 0.5, "f1": 0.571}, "Got " + str(scores(yt, yp))
lazy = [0] * 10
s = scores([1] + [0] * 9, lazy)
assert s == {"accuracy": 0.9, "precision": 0.0, "recall": 0.0, "f1": 0.0}, "A model that never predicts 1 has 90% accuracy and zero recall. Got " + str(s)`,
    hint:"tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1), and similarly for the others. f1 = 2 * p * r / (p + r) if p + r else 0.0.",
    solution:R`def confusion(y_true, y_pred):
    c = {"tp": 0, "fp": 0, "fn": 0, "tn": 0}
    for t, p in zip(y_true, y_pred):
        if t == 1 and p == 1: c["tp"] += 1
        elif t == 0 and p == 1: c["fp"] += 1
        elif t == 1 and p == 0: c["fn"] += 1
        else: c["tn"] += 1
    return c

def scores(y_true, y_pred):
    c = confusion(y_true, y_pred)
    tp, fp, fn, tn = c["tp"], c["fp"], c["fn"], c["tn"]
    acc = (tp + tn) / len(y_true)
    prec = tp / (tp + fp) if tp + fp else 0.0
    rec = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
    return {"accuracy": round(acc, 3), "precision": round(prec, 3), "recall": round(rec, 3), "f1": round(f1, 3)}`,
    bonus:{
      task:"Bonus: write auc(y_true, scores): the probability a random positive gets a higher score than a random negative. Compare every positive-negative pair: count 1 when the positive scores higher and 0.5 for ties, then divide by the number of pairs. Round to 3.",
      tests:R`assert auc([1, 1, 0, 0], [0.9, 0.8, 0.3, 0.1]) == 1.0
assert auc([1, 0, 1, 0], [0.9, 0.8, 0.3, 0.1]) == 0.75
assert auc([1, 0], [0.5, 0.5]) == 0.5`,
      hint:"pos = [s for y, s in zip(y_true, scores) if y == 1]; neg likewise; loop over both.",
      solution:R`def auc(y_true, scores):
    pos = [s for y, s in zip(y_true, scores) if y == 1]
    neg = [s for y, s in zip(y_true, scores) if y == 0]
    total = 0.0
    for p in pos:
        for n in neg:
            total += 1 if p > n else 0.5 if p == n else 0
    return round(total / (len(pos) * len(neg)), 3)`}}
},
{ id:"m07", act:2, title:"Decision trees", mins:40,
  hook:"HR leadership won't trust a black box. A decision tree can say: \"If overtime > 10 hours and no promotion in 2 years, 78% of people left.\" That's a model you can explain in a meeting.",
  learn:[
    {h:"How a tree decides", p:[
      "A decision tree asks yes/no questions about features (\"tenure < 18 months?\") and follows branches until it reaches a leaf, which predicts the majority label (classification) or the average (regression) of the training examples that ended up there."]},
    {h:"Choosing splits with Gini impurity", p:[
      "Gini impurity measures how mixed a group is: 1 − Σ p², where p is each class's share. A pure group (all stay) has Gini 0; a 50/50 group has 0.5. The tree tries every feature and threshold, and picks the split with the lowest weighted average Gini of the two sides. Then it repeats on each side."],
     code:R`from sklearn.tree import DecisionTreeClassifier, export_text
tree = DecisionTreeClassifier(max_depth=3).fit(X_train, y_train)
print(export_text(tree, feature_names=list(X_train.columns)))`},
    {h:"Overfitting and control", p:[
      "A deep enough tree can memorize every training example and fail on new data. Limit it with max_depth, a minimum number of samples per leaf, or pruning. Trees need no feature scaling and handle mixed data well, which is why they're the building block of the powerful ensembles in the next lesson."]}
  ],
  mistakes:["Growing trees with no depth limit and trusting training accuracy.","Explaining a single tree's splits as stable truths; small data changes can reshape it.","Forgetting that a tree can only predict values it saw in training (no extrapolation)."],
  ai:"Trees are among the most explainable models, and tree ensembles still win many tabular-data problems in business.",
  interview:{q:"Why do single decision trees overfit, and how do you prevent it?", a:"Unrestricted, a tree keeps splitting until each leaf is pure, which memorizes noise in the training data. Prevent it with max depth, minimum samples per leaf or split, pruning, and validation to choose those settings, or use ensembles like random forests that average many trees."},
  terms:[["Decision tree","A model that predicts by following yes/no questions on features."],["Split","A feature and threshold that divides the data."],["Leaf","An end node that gives the prediction."],["Gini impurity","1 − Σ p²: how mixed the classes in a group are."],["max_depth","A limit on how many questions deep a tree can go."],["Pruning","Removing branches that don't help on validation data."]],
  quiz:[
    {t:"mcq", q:"Gini impurity of a group that's all one class is…", o:["0","0.5","1","Undefined"], a:0},
    {t:"mcq", q:"Gini of a 50/50 two-class group is…", o:["0","0.25","0.5","1"], a:2},
    {t:"mcq", q:"A tree gets 100% training accuracy and 60% test accuracy. Try first…", o:["Limit max_depth","Add more depth","Remove the test set","Scale the features"], a:0}
  ],
  lab:{
    task:"1. gini(labels): 1 − Σ (share of each class)². Empty list gives 0.0.\n2. best_split(xs, ys): xs is one numeric feature, ys the labels. Try every threshold t in the sorted distinct values of xs except the largest; left gets x ≤ t, right gets x > t. Score = weighted Gini (len(left)/n × gini(left) + len(right)/n × gini(right)). Return (t, score rounded to 4) with the lowest score; on ties, the smaller t.",
    starter:R`def gini(labels):
    return 0.0

def best_split(xs, ys):
    return (None, 1.0)

overtime = [1, 2, 3, 8, 9, 12]
left = [0, 0, 0, 1, 1, 1]`,
    tests:R`assert gini([]) == 0.0 and gini([1, 1, 1]) == 0.0 and gini([0, 1]) == 0.5
assert abs(gini([0, 0, 1]) - (1 - (2/3) ** 2 - (1/3) ** 2)) < 1e-9
assert best_split([1, 2, 3, 8, 9, 12], [0, 0, 0, 1, 1, 1]) == (3, 0.0), "A perfect split exists at 3"
t, s = best_split([1, 2, 3, 4, 5, 6], [0, 0, 1, 0, 1, 1])
assert (t, s) == (2, 0.25), "Got " + str((t, s))
assert best_split([5, 5, 5], [0, 1, 0]) == (None, 1.0) or best_split([5, 5, 5], [0, 1, 0])[0] is None, "No valid threshold with a single distinct value"`,
    hint:"For each t: left = [y for x, y in zip(xs, ys) if x <= t]; right = the rest. Track the best (score, t) and compare with < so ties keep the smaller t.",
    solution:R`def gini(labels):
    if not labels:
        return 0.0
    n = len(labels)
    return 1 - sum((labels.count(c) / n) ** 2 for c in set(labels))

def best_split(xs, ys):
    best_t, best_s = None, 1.0
    n = len(xs)
    for t in sorted(set(xs))[:-1]:
        left = [y for x, y in zip(xs, ys) if x <= t]
        right = [y for x, y in zip(xs, ys) if x > t]
        s = round(len(left) / n * gini(left) + len(right) / n * gini(right), 4)
        if best_t is None or s < best_s:
            best_t, best_s = t, s
    return (best_t, best_s)

overtime = [1, 2, 3, 8, 9, 12]
left = [0, 0, 0, 1, 1, 1]`,
    bonus:{
      task:"Bonus: write stump(xs, ys) that returns a predict function: it finds best_split, then the left leaf predicts the majority label of the left side and the right leaf the majority of the right side (ties go to the smaller label).",
      tests:R`f = stump([1, 2, 3, 8, 9, 12], [0, 0, 0, 1, 1, 1])
assert [f(x) for x in [0, 3, 3.5, 20]] == [0, 0, 1, 1]`,
      hint:"majority = lambda ls: max(sorted(set(ls)), key=ls.count) returns the most common label, smaller label first on ties.",
      solution:R`def stump(xs, ys):
    t, _ = best_split(xs, ys)
    majority = lambda ls: max(sorted(set(ls)), key=ls.count)
    left = majority([y for x, y in zip(xs, ys) if x <= t])
    right = majority([y for x, y in zip(xs, ys) if x > t])
    return lambda x: left if x <= t else right`}}
},
{ id:"m08", act:2, title:"Ensembles: random forests and boosting", mins:40,
  hook:"One expert can be wrong. A committee of reasonably good, different experts is usually right. Ensembles apply that idea to models, and they dominate business prediction on tables of data.",
  learn:[
    {h:"Bagging and random forests", p:[
      "Bagging (bootstrap aggregating): train many models, each on a bootstrap sample (random rows drawn with replacement), then average or vote their predictions. Random forests add randomness in which features each tree may consider at each split, making the trees more different, so their errors cancel out. They're robust, hard to badly misconfigure and a strong default."]},
    {h:"Boosting", p:[
      "Boosting builds models one after another, each focusing on the mistakes of the ensemble so far. Gradient boosting fits each new small tree to the residuals (actual minus current prediction) and adds it with a small learning rate. XGBoost, LightGBM and CatBoost are fast, popular implementations and frequent winners on tabular data."],
     code:R`from sklearn.ensemble import RandomForestClassifier
import lightgbm as lgb
rf = RandomForestClassifier(n_estimators=300).fit(X_tr, y_tr)
gbm = lgb.LGBMClassifier(n_estimators=500, learning_rate=0.05).fit(X_tr, y_tr)`},
    {h:"Trade-offs", p:[
      "Forests are forgiving and parallel. Boosting is often more accurate but needs more tuning and can overfit if you add trees without validation (use early stopping). Both lose some of a single tree's explainability; feature importance and SHAP values help explain them."]}
  ],
  mistakes:["Adding boosting rounds without early stopping on a validation set.","Reading feature importance as causation.","Jumping to deep learning for tabular data when gradient boosting is faster and often better."],
  ai:"For tabular business data like HR, finance and operations, gradient boosting is usually the model to beat.",
  interview:{q:"What's the difference between bagging and boosting?", a:"Bagging trains models independently on bootstrap samples and averages them, mainly reducing variance; random forests are the classic example. Boosting trains models sequentially, each correcting the previous ensemble's errors, mainly reducing bias; gradient boosting fits each new tree to the residuals."},
  terms:[["Ensemble","A combination of several models' predictions."],["Bootstrap sample","Rows drawn at random with replacement."],["Bagging","Averaging models trained on bootstrap samples."],["Random forest","Bagged decision trees with random feature choices."],["Boosting","Sequentially adding models that fix earlier errors."],["Residual","Actual value minus the current prediction."]],
  quiz:[
    {t:"mcq", q:"Each new tree in gradient boosting is trained to predict…", o:["The original labels","The residuals of the current ensemble","Random noise","The test set"], a:1},
    {t:"mcq", q:"Why do random forests pick random features at splits?", o:["To make trees more different so errors cancel","To save memory only","To avoid scaling","It's a bug"], a:0},
    {t:"mcq", q:"For a 50,000-row table of employee data, a strong first model is…", o:["Gradient boosting","A transformer from scratch","A CNN","K-means"], a:0}
  ],
  lab:{
    task:"1. bootstrap(rows, seed): draw len(rows) rows with replacement using rng = random.Random(seed) and rng.randrange(len(rows)) each time.\n2. vote(predictions): predictions is a list of lists (one list per model). Return the majority label for each position; ties go to the smaller label.\n3. boost(xs, ys, fit_weak, rounds=3, lr=0.5): gradient boosting for regression. Start every prediction at mean(ys). Each round: residuals = y − current prediction; weak = fit_weak(xs, residuals) returns a function; add lr × weak(x) to each prediction. Return the final list of predictions rounded to 3.",
    starter:R`import random

def bootstrap(rows, seed):
    return rows

def vote(predictions):
    return []

def boost(xs, ys, fit_weak, rounds=3, lr=0.5):
    return []

def fit_stump(xs, residuals):
    """A weak learner: split at the middle x, predict each side's mean residual."""
    t = sorted(xs)[len(xs) // 2 - 1]
    left = [r for x, r in zip(xs, residuals) if x <= t]
    right = [r for x, r in zip(xs, residuals) if x > t]
    lm = sum(left) / len(left) if left else 0
    rm = sum(right) / len(right) if right else 0
    return lambda x: lm if x <= t else rm`,
    tests:R`rows = ["a", "b", "c", "d"]
rng = random.Random(7)
assert bootstrap(rows, 7) == [rows[rng.randrange(4)] for _ in range(4)], "Use random.Random(seed).randrange"
assert len(bootstrap(rows, 1)) == 4 and set(bootstrap(rows, 1)) <= set(rows)
assert vote([[1, 0, 1], [1, 1, 0], [0, 0, 1]]) == [1, 0, 1]
assert vote([[1, 0], [0, 1]]) == [0, 0], "Ties go to the smaller label"
xs = [1, 2, 3, 4]
ys = [10, 12, 30, 32]
p1 = boost(xs, ys, fit_stump, rounds=1, lr=1.0)
assert p1 == [11.0, 11.0, 31.0, 31.0], "One full round fits each side's mean. Got " + str(p1)
p = boost(xs, ys, fit_stump, rounds=3, lr=0.5)
assert p == [12.25, 12.25, 29.75, 29.75], "Each round closes half the remaining gap: 21 to 16, 13.5, then 12.25. Got " + str(p)
err = lambda preds: sum((a - b) ** 2 for a, b in zip(preds, ys))
assert err(boost(xs, ys, fit_stump, rounds=5)) < err(boost(xs, ys, fit_stump, rounds=1)), "More rounds should reduce training error"`,
    hint:"boost: pred = [sum(ys) / len(ys)] * len(ys); in each round res = [y - p for y, p in zip(ys, pred)]; weak = fit_weak(xs, res); pred = [p + lr * weak(x) for p, x in zip(pred, xs)].",
    solution:R`import random

def bootstrap(rows, seed):
    rng = random.Random(seed)
    return [rows[rng.randrange(len(rows))] for _ in range(len(rows))]

def vote(predictions):
    out = []
    for column in zip(*predictions):
        labels = list(column)
        out.append(max(sorted(set(labels)), key=labels.count))
    return out

def boost(xs, ys, fit_weak, rounds=3, lr=0.5):
    pred = [sum(ys) / len(ys)] * len(ys)
    for _ in range(rounds):
        res = [y - p for y, p in zip(ys, pred)]
        weak = fit_weak(xs, res)
        pred = [p + lr * weak(x) for p, x in zip(pred, xs)]
    return [round(p, 3) for p in pred]

def fit_stump(xs, residuals):
    """A weak learner: split at the middle x, predict each side's mean residual."""
    t = sorted(xs)[len(xs) // 2 - 1]
    left = [r for x, r in zip(xs, residuals) if x <= t]
    right = [r for x, r in zip(xs, residuals) if x > t]
    lm = sum(left) / len(left) if left else 0
    rm = sum(right) / len(right) if right else 0
    return lambda x: lm if x <= t else rm`,
    bonus:{
      task:"Bonus: write oob_rows(n, seed) that returns the sorted indices of rows NOT picked by bootstrap(list(range(n)), seed). These out-of-bag rows give a random forest a free validation set.",
      tests:R`picked = set(bootstrap(list(range(10)), 3))
assert oob_rows(10, 3) == sorted(set(range(10)) - picked)
assert len(oob_rows(1000, 5)) > 300, "About 37% of rows are out-of-bag on average"`,
      hint:"sorted(set(range(n)) - set(bootstrap(list(range(n)), seed))).",
      solution:R`def oob_rows(n, seed):
    return sorted(set(range(n)) - set(bootstrap(list(range(n)), seed)))`}}
},
{ id:"m09", act:2, title:"Clustering with k-means", mins:35,
  hook:"There are no labels, just 5,000 employees and their survey answers. Leadership asks: are there natural groups? K-means finds them.",
  learn:[
    {h:"The algorithm", p:[
      "Choose k, the number of clusters. Start with k centroids (cluster centers). Then repeat two steps until nothing changes: assign each point to its nearest centroid, then move each centroid to the mean of its assigned points. It's simple, fast and surprisingly useful."],
     code:R`from sklearn.cluster import KMeans
km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(X_scaled)
labels, centers = km.labels_, km.cluster_centers_`},
    {h:"Choosing k and starting points", p:[
      "Results depend on the starting centroids, so libraries run several starts and keep the best (k-means++ picks smart starts). To choose k, compare inertia (total squared distance to centroids) across k values and look for the \"elbow\", or use silhouette scores, and always check that clusters make business sense."]},
    {h:"Limits", p:[
      "K-means assumes roughly round, similar-sized clusters and uses distance, so scale features first (salary in dollars would swamp a 1-to-5 rating). For odd shapes or noise, try DBSCAN; for soft memberships, Gaussian mixtures. Embedding vectors plus k-means is a common way to group documents or support tickets by topic."]}
  ],
  mistakes:["Clustering unscaled features, so one large-valued feature dominates.","Treating clusters as ground truth instead of a lens to explore.","Picking k without checking whether the groups are meaningful."],
  ai:"Clustering embeddings is how teams discover topics in thousands of support tickets, reviews or survey comments, a very practical AI skill.",
  interview:{q:"How do you choose the number of clusters?", a:"Run k-means for a range of k and look at inertia for an elbow and at silhouette scores, then validate with domain experts: clusters should be stable across runs and interpretable. The best k is often the one the business can act on."},
  terms:[["Clustering","Grouping similar items without labels."],["K-means","Clustering by alternating assign-to-nearest-centroid and move-centroid steps."],["Centroid","The center (mean) of a cluster."],["Inertia","Total squared distance of points to their centroids."],["Elbow method","Choosing k where adding clusters stops helping much."],["Feature scaling","Putting features on comparable ranges."]],
  quiz:[
    {t:"mcq", q:"After assigning points, k-means moves each centroid to…", o:["The mean of its points","A random point","The origin","The farthest point"], a:0},
    {t:"mcq", q:"Salary (tens of thousands) and rating (1–5) are clustered unscaled. Problem?", o:["Salary dominates the distances","Nothing","Rating dominates","K-means crashes"], a:0},
    {t:"mcq", q:"Grouping 10,000 support tickets by topic, a practical approach is…", o:["Embed the text, then cluster the vectors","Linear regression","Sort alphabetically","BM25"], a:0}
  ],
  lab:{
    task:"Points are (x, y) tuples.\n\n1. dist2(a, b): squared distance.\n2. assign(points, centroids): for each point, the index of the nearest centroid (ties go to the lower index).\n3. update(points, labels, k): the new centroid of each cluster as a tuple of the mean x and mean y, rounded to 3. If a cluster is empty, use (0.0, 0.0).\n4. kmeans(points, centroids, max_iter=100): repeat assign and update until the labels stop changing (or max_iter). Return (labels, centroids).",
    starter:R`def dist2(a, b):
    return 0

def assign(points, centroids):
    return []

def update(points, labels, k):
    return []

def kmeans(points, centroids, max_iter=100):
    return ([], centroids)

pts = [(1, 1), (1.5, 2), (1, 0.5), (8, 8), (9, 8.5), (8.5, 9.5)]`,
    tests:R`assert dist2((0, 0), (3, 4)) == 25
pts = [(1, 1), (1.5, 2), (1, 0.5), (8, 8), (9, 8.5), (8.5, 9.5)]
assert assign(pts, [(0, 0), (10, 10)]) == [0, 0, 0, 1, 1, 1]
assert assign([(5, 5)], [(0, 0), (10, 10)]) == [0], "Ties go to the lower index"
assert update(pts, [0, 0, 0, 1, 1, 1], 2) == [(1.167, 1.167), (8.5, 8.667)], "Got " + str(update(pts, [0, 0, 0, 1, 1, 1], 2))
assert update(pts, [0] * 6, 2)[1] == (0.0, 0.0), "Empty clusters become (0.0, 0.0)"
labels, cents = kmeans(pts, [(1, 1), (1.5, 2)])
assert labels == [0, 0, 0, 1, 1, 1] or labels == [1, 1, 1, 0, 0, 0] or sorted(set(labels)) == [0, 1], "Got " + str(labels)
assert labels[0] == labels[1] == labels[2] and labels[3] == labels[4] == labels[5] and labels[0] != labels[3], "Should find the two natural groups even from a poor start. Got " + str(labels)`,
    hint:"assign: min(range(len(centroids)), key=lambda i: dist2(p, centroids[i])) picks the lowest index on ties. kmeans: labels = None; loop: new = assign(...); if new == labels: break; labels = new; centroids = update(...).",
    solution:R`def dist2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

def assign(points, centroids):
    return [min(range(len(centroids)), key=lambda i: dist2(p, centroids[i])) for p in points]

def update(points, labels, k):
    out = []
    for c in range(k):
        members = [p for p, l in zip(points, labels) if l == c]
        if not members:
            out.append((0.0, 0.0))
        else:
            out.append((round(sum(p[0] for p in members) / len(members), 3),
                        round(sum(p[1] for p in members) / len(members), 3)))
    return out

def kmeans(points, centroids, max_iter=100):
    labels = None
    for _ in range(max_iter):
        new = assign(points, centroids)
        if new == labels:
            break
        labels = new
        centroids = update(points, labels, len(centroids))
    return (labels, centroids)

pts = [(1, 1), (1.5, 2), (1, 0.5), (8, 8), (9, 8.5), (8.5, 9.5)]`,
    bonus:{
      task:"Bonus: write inertia(points, labels, centroids) (total squared distance to assigned centroids, rounded to 3) and elbow(points, starts) where starts maps k to its initial centroid list; run kmeans for each k and return {k: inertia}.",
      tests:R`pts = [(1, 1), (1.5, 2), (1, 0.5), (8, 8), (9, 8.5), (8.5, 9.5)]
e = elbow(pts, {1: [(5, 5)], 2: [(0, 0), (10, 10)], 3: [(0, 0), (10, 10), (1, 2)]})
assert e[1] > e[2] > e[3] and e[1] / e[2] > 20, "Inertia drops sharply from k=1 to k=2 (the elbow). Got " + str(e)`,
      hint:"inertia = sum(dist2(p, centroids[l]) for p, l in zip(points, labels)).",
      solution:R`def inertia(points, labels, centroids):
    return round(sum(dist2(p, centroids[l]) for p, l in zip(points, labels)), 3)

def elbow(points, starts):
    out = {}
    for k, init in starts.items():
        labels, cents = kmeans(points, init)
        out[k] = inertia(points, labels, cents)
    return out`}}
},
{ id:"m10", act:2, title:"Feature scaling and PCA", mins:40,
  hook:"Your dataset has 300 survey questions per employee. Many say almost the same thing. Principal component analysis compresses them into a few directions that capture most of the story.",
  learn:[
    {h:"Scaling first", p:[
      "Standardization turns each feature into z-scores: (x − mean) / standard deviation, so every feature has mean 0 and spread 1. Distance-based and gradient-based methods (k-means, PCA, logistic regression, neural networks) behave much better on standardized data. Trees don't need it."]},
    {h:"What PCA does", p:[
      "PCA finds new axes, principal components, that are combinations of the original features. The first component points in the direction of greatest variance, the second is perpendicular to it with the next most variance, and so on. Keep the first few and you compress the data while keeping most of the information. It's used for visualization, noise reduction and speeding up models."],
     code:R`from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
Z = StandardScaler().fit_transform(X)
pca = PCA(n_components=2).fit(Z)
print(pca.explained_variance_ratio_)   # e.g. [0.61, 0.18]`},
    {h:"Under the hood", p:[
      "The components are eigenvectors of the covariance matrix. You can find the top one with power iteration: start with any vector, repeatedly multiply it by the covariance matrix and normalize it; it turns toward the dominant direction. The lab does exactly this for two features."]}
  ],
  mistakes:["Running PCA on unscaled features, so the biggest-unit feature dominates.","Assuming components have a clean business meaning; they're mixtures of features.","Fitting the scaler or PCA on all data instead of training data only."],
  ai:"Dimensionality reduction is how people visualize embeddings (PCA, t-SNE, UMAP) and compress features. Power iteration is also a classic algorithm behind PageRank.",
  interview:{q:"What does the first principal component represent?", a:"The direction in feature space along which the data varies most: the unit vector that maximizes the variance of the projected data. Mathematically it's the eigenvector of the covariance matrix with the largest eigenvalue."},
  terms:[["Standardization","Rescaling to mean 0 and standard deviation 1 (z-scores)."],["PCA","Principal component analysis: finding directions of greatest variance."],["Principal component","A new axis that's a combination of the original features."],["Explained variance","The share of total variance a component captures."],["Covariance matrix","A table of how pairs of features vary together."],["Power iteration","Repeatedly multiplying by a matrix to find its dominant eigenvector."]],
  quiz:[
    {t:"mcq", q:"After standardization, each feature has…", o:["Mean 0, standard deviation 1","Values between 0 and 1","Mean 1","No change"], a:0},
    {t:"mcq", q:"The first principal component is the direction of…", o:["Greatest variance","Smallest variance","The label","Random choice"], a:0},
    {t:"mcq", q:"Which model does NOT need feature scaling?", o:["Decision tree","K-means","Logistic regression with gradient descent","PCA"], a:0}
  ],
  lab:{
    task:"Work with two features given as lists xs and ys.\n\n1. standardize(values): z-scores using the population standard deviation, rounded to 4.\n2. covariance_matrix(xs, ys): [[var(x), cov(x, y)], [cov(x, y), var(y)]] using population formulas (divide by n), rounded to 4.\n3. first_component(cov, steps=100): power iteration starting from [1.0, 1.0]: multiply by the 2×2 matrix, then divide by its length. Return the vector rounded to 3, with its first entry made non-negative (flip both signs if needed).",
    starter:R`import math

def standardize(values):
    return values

def covariance_matrix(xs, ys):
    return [[0, 0], [0, 0]]

def first_component(cov, steps=100):
    return [1.0, 0.0]`,
    tests:R`z = standardize([2, 4, 4, 4, 5, 5, 7, 9])
assert z == [-1.5, -0.5, -0.5, -0.5, 0.0, 0.0, 1.0, 2.0], "Got " + str(z)
C = covariance_matrix([1, 2, 3, 4], [2, 4, 6, 8])
assert C == [[1.25, 2.5], [2.5, 5.0]], "Got " + str(C)
v = first_component(C)
assert v == [0.447, 0.894], "y = 2x, so the main direction is (1, 2) normalized. Got " + str(v)
assert first_component([[4.0, 0.0], [0.0, 1.0]]) == [1.0, 0.0], "Axis-aligned case"
v2 = first_component([[2.0, -1.0], [-1.0, 2.0]], steps=1)
assert v2 == [0.707, 0.707], "One step from [1, 1]: multiply, normalize, round. Got " + str(v2)`,
    hint:"Power step: nv = [c[0][0] * v[0] + c[0][1] * v[1], c[1][0] * v[0] + c[1][1] * v[1]]; length = math.sqrt(nv[0] ** 2 + nv[1] ** 2); v = [nv[0] / length, nv[1] / length].",
    solution:R`import math

def standardize(values):
    n = len(values)
    m = sum(values) / n
    sd = math.sqrt(sum((v - m) ** 2 for v in values) / n)
    return [round((v - m) / sd, 4) for v in values]

def covariance_matrix(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    vx = sum((x - mx) ** 2 for x in xs) / n
    vy = sum((y - my) ** 2 for y in ys) / n
    cxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / n
    return [[round(vx, 4), round(cxy, 4)], [round(cxy, 4), round(vy, 4)]]

def first_component(cov, steps=100):
    v = [1.0, 1.0]
    for _ in range(steps):
        nv = [cov[0][0] * v[0] + cov[0][1] * v[1], cov[1][0] * v[0] + cov[1][1] * v[1]]
        length = math.sqrt(nv[0] ** 2 + nv[1] ** 2)
        v = [nv[0] / length, nv[1] / length]
    if v[0] < 0:
        v = [-v[0], -v[1]]
    return [round(v[0], 3), round(v[1], 3)]`,
    bonus:{
      task:"Bonus: power iteration from [1, 1] can get stuck when [1, 1] is exactly perpendicular to the answer (try [[1, -0.9], [-0.9, 1]] carefully!). Write explained_ratio(cov, v) that returns the share of total variance captured by unit vector v: (vᵀ C v) / (C[0][0] + C[1][1]), rounded to 3.",
      tests:R`C = [[1.25, 2.5], [2.5, 5.0]]
assert explained_ratio(C, [0.4472136, 0.8944272]) == 1.0, "Perfectly correlated data: one component explains everything"
assert explained_ratio([[4.0, 0.0], [0.0, 1.0]], [1.0, 0.0]) == 0.8`,
      hint:"vCv = v[0] * (C[0][0] * v[0] + C[0][1] * v[1]) + v[1] * (C[1][0] * v[0] + C[1][1] * v[1]).",
      solution:R`def explained_ratio(cov, v):
    cv = [cov[0][0] * v[0] + cov[0][1] * v[1], cov[1][0] * v[0] + cov[1][1] * v[1]]
    return round((v[0] * cv[0] + v[1] * cv[1]) / (cov[0][0] + cov[1][1]), 3)`}}
},
/* ---------------- ACT 3 ---------------- */
{ id:"m11", act:3, title:"Feature engineering and pipelines", mins:35,
  hook:"Two teams use the same model on the same data. One team turns \"hire date\" into \"tenure in months\" and \"department\" into proper categories. Their model wins by a mile.",
  learn:[
    {h:"Turning raw data into features", p:[
      "Models need numbers. Categories become one-hot columns (dept_HR, dept_IT…). Dates become useful quantities (tenure, days since last promotion, month). Text becomes counts, TF-IDF or embeddings. Ratios and differences often matter more than raw values (overtime ÷ scheduled hours). Domain knowledge is the secret ingredient."]},
    {h:"Fit on train, transform everything", p:[
      "Scalers, encoders and imputers learn something from data (a mean, a list of categories). Learn it from the training set only, then apply the same transformation to validation, test and live data. Fitting on all data leaks test information. Unknown categories at prediction time need a plan (often an all-zeros one-hot row)."],
     code:R`from sklearn.pipeline import make_pipeline
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
prep = make_column_transformer(
    (OneHotEncoder(handle_unknown="ignore"), ["dept"]),
    (StandardScaler(), ["tenure_months", "overtime"]))
model = make_pipeline(prep, LogisticRegression()).fit(X_train, y_train)`},
    {h:"Pipelines", p:[
      "A pipeline bundles preprocessing and the model so the exact same steps run in training and in production, in the right order. It prevents a whole class of bugs where training and serving quietly differ (training-serving skew)."]}
  ],
  mistakes:["Fitting a scaler on the full dataset before splitting.","Crashing in production on a category never seen in training.","Doing preprocessing by hand in a notebook and differently in the production code."],
  ai:"Good features beat fancy models on business data, and pipelines are how ML code becomes production code.",
  interview:{q:"What is training-serving skew and how do you avoid it?", a:"When features are computed differently in training than in production, so the live model sees data unlike what it learned from. Avoid it by packaging preprocessing and the model into one pipeline, sharing feature code, validating live inputs, and monitoring feature distributions."},
  terms:[["Feature engineering","Creating informative model inputs from raw data."],["One-hot encoding","One 0/1 column per category."],["fit / transform","Learn parameters from training data, then apply them."],["Pipeline","Preprocessing plus model packaged as one object."],["Training-serving skew","Features differing between training and production."],["Imputation","Filling in missing values."]],
  quiz:[
    {t:"mcq", q:"Where should a StandardScaler learn its mean and standard deviation?", o:["Training data only","All data","Test data","Production data"], a:0},
    {t:"mcq", q:"\"hire_date\" is usually most useful converted to…", o:["Tenure (for example, months since hire)","A random number","Its string length","Nothing: drop it always"], a:0},
    {t:"mcq", q:"A new department appears in production. A robust one-hot encoder should…", o:["Encode it as all zeros instead of crashing","Crash","Retrain automatically","Guess a department"], a:0}
  ],
  lab:{
    task:"1. class OneHot: fit(values) stores the sorted distinct categories; transform(values) returns a list of 0/1 lists in that category order (unknown values become all zeros); fit_transform(values) does both.\n2. class MinMax: fit(values) stores min and max; transform(values) returns (v − min) / (max − min) rounded to 4, clipped to 0–1 (live data can exceed the training range). If max equals min, return 0.0 for everything.\n3. tenure_months(hire, today): both are (year, month) tuples; return the whole number of months between them.",
    starter:R`class OneHot:
    pass

class MinMax:
    pass

def tenure_months(hire, today):
    return 0`,
    tests:R`oh = OneHot()
assert oh.fit_transform(["IT", "HR", "IT"]) == [[0, 1], [1, 0], [0, 1]], "Categories are sorted: HR, IT"
assert oh.transform(["Sales", "HR"]) == [[0, 0], [1, 0]], "Unknown categories become all zeros"
mm = MinMax(); mm.fit([10, 20, 30])
assert mm.transform([10, 25, 30]) == [0.0, 0.75, 1.0]
assert mm.transform([5, 40]) == [0.0, 1.0], "Clip values outside the training range"
flat = MinMax(); flat.fit([7, 7])
assert flat.transform([7, 8]) == [0.0, 0.0]
assert tenure_months((2023, 11), (2026, 2)) == 27 and tenure_months((2026, 2), (2026, 2)) == 0`,
    hint:"OneHot.transform: [[1 if v == c else 0 for c in self.categories] for v in values]. Remember fit should return self so fit_transform can chain.",
    solution:R`class OneHot:
    def fit(self, values):
        self.categories = sorted(set(values))
        return self
    def transform(self, values):
        return [[1 if v == c else 0 for c in self.categories] for v in values]
    def fit_transform(self, values):
        return self.fit(values).transform(values)

class MinMax:
    def fit(self, values):
        self.lo, self.hi = min(values), max(values)
        return self
    def transform(self, values):
        if self.hi == self.lo:
            return [0.0 for _ in values]
        return [round(min(1.0, max(0.0, (v - self.lo) / (self.hi - self.lo))), 4) for v in values]

def tenure_months(hire, today):
    return (today[0] - hire[0]) * 12 + (today[1] - hire[1])`,
    bonus:{
      task:"Bonus: write class Pipeline(steps) where steps is a list of objects with fit and transform. fit(values) fits each step on the output of the previous one; transform(values) runs them all in order.",
      tests:R`class Double:
    def fit(self, v): return self
    def transform(self, v): return [x * 2 for x in v]
p = Pipeline([Double(), MinMax()]).fit([1, 2, 3])
assert p.transform([2, 4]) == [0.5, 1.0], "MinMax was fitted on doubled values (2 to 6)"`,
      hint:"In fit: for s in self.steps: s.fit(values); values = s.transform(values). Return self.",
      solution:R`class Pipeline:
    def __init__(self, steps):
        self.steps = steps
    def fit(self, values):
        for s in self.steps:
            s.fit(values)
            values = s.transform(values)
        return self
    def transform(self, values):
        for s in self.steps:
            values = s.transform(values)
        return values`}}
},
{ id:"m12", act:3, title:"Neural networks: the forward pass", mins:40,
  hook:"\"Neural network\" sounds like magic. It's layers of weighted sums and simple functions. Once you compute one by hand, deep learning stops being mysterious.",
  learn:[
    {h:"A neuron", p:[
      "A neuron computes a weighted sum of its inputs plus a bias, then applies an activation function: output = activation(w1×x1 + w2×x2 + … + b). Without the activation, stacking layers would just make one big linear model; the nonlinearity is what lets networks learn curves and complex patterns."]},
    {h:"Layers and activations", p:[
      "A dense (fully connected) layer is many neurons that all read the same inputs. Stack layers: inputs → hidden layers → output layer. ReLU (max(0, z)) is the standard hidden activation: simple and trains well. The output layer depends on the task: none for regression, sigmoid for yes/no, softmax for choosing among many classes."],
     code:R`import torch.nn as nn
model = nn.Sequential(
    nn.Linear(4, 8), nn.ReLU(),     # hidden layer: 4 inputs -> 8 neurons
    nn.Linear(8, 3))                # output: scores for 3 classes (softmax in the loss)`},
    {h:"Scale", p:[
      "A layer with 1,000 inputs and 1,000 neurons has 1,000,000 weights plus 1,000 biases. LLMs have billions of parameters, but every one is a number in exactly these kinds of weighted sums. GPUs are fast at the matrix multiplications this requires."]}
  ],
  mistakes:["Forgetting the activation between layers, which collapses the network into a linear model.","Using softmax outputs for a yes/no task when a single sigmoid output is simpler.","Confusing parameters (learned weights) with hyperparameters (choices like layer size)."],
  ai:"Every modern AI model, including the transformers behind Claude, is built from this forward pass repeated at enormous scale.",
  interview:{q:"Why do neural networks need nonlinear activation functions?", a:"A composition of linear layers is itself linear, so without nonlinearities a deep network could only represent linear functions. Activations like ReLU let the network approximate complex, nonlinear relationships."},
  terms:[["Neuron","Computes a weighted sum plus bias, then an activation."],["Activation function","A nonlinear function applied to a neuron's output, like ReLU."],["ReLU","max(0, z), the standard hidden-layer activation."],["Dense layer","A layer where every neuron reads every input."],["Softmax","Turns a list of scores into probabilities that sum to 1."],["Parameter","A learned number: a weight or bias."]],
  quiz:[
    {t:"mcq", q:"relu(−3) equals…", o:["−3","0","3","1"], a:1},
    {t:"fill", q:"A dense layer with 10 inputs and 5 neurons has how many parameters (weights + biases)?", a:["55"]},
    {t:"mcq", q:"Choosing among 10 ticket categories, the output layer usually uses…", o:["Softmax","ReLU","No output","Sigmoid per class only"], a:0}
  ],
  lab:{
    task:"1. relu(v): apply max(0, x) to every element of a list.\n2. dense(x, W, b): W is a list of rows, one per neuron, each with one weight per input. Return [sum(w × x) + b for each neuron].\n3. softmax(z): subtract max(z) first for numerical stability; return probabilities rounded to 4.\n4. forward(x, layers): layers is a list of (W, b). Apply dense then relu for every layer except the last; the last layer gets dense then softmax.\n5. count_params(sizes): sizes like [4, 8, 3] means 4 inputs, a hidden layer of 8 and 3 outputs. Return the total number of weights and biases.",
    starter:R`import math

def relu(v):
    return v

def dense(x, W, b):
    return []

def softmax(z):
    return []

def forward(x, layers):
    return []

def count_params(sizes):
    return 0`,
    tests:R`assert relu([-2, 0, 3.5]) == [0, 0, 3.5]
assert dense([1, 2], [[1, 1], [0.5, -1]], [0, 1]) == [3, -0.5]
assert softmax([2.0, 1.0, 0.1]) == [0.659, 0.2424, 0.0986], "Got " + str(softmax([2.0, 1.0, 0.1]))
assert softmax([1000, 1000]) == [0.5, 0.5], "Subtract the max so big scores don't overflow"
L = [([[1, -1], [0.5, 0.5]], [0, 0]), ([[1, 0], [0, 1]], [0, 0])]
out = forward([2, 1], L)
assert out == softmax([1, 1.5]), "Hidden: relu(dense) = [1, 1.5]; output: softmax. Got " + str(out)
L2 = [([[1, -1], [-1, 1]], [0, 0]), ([[1, 1]], [0])]
assert forward([1, 3], L2) == [1.0], "One output neuron gives probability 1.0 under softmax"
assert count_params([4, 8, 3]) == (4 * 8 + 8) + (8 * 3 + 3) == 67`,
    hint:"dense: [sum(w * xi for w, xi in zip(row, x)) + bi for row, bi in zip(W, b)]. forward: loop with enumerate and check if i == len(layers) - 1.",
    solution:R`import math

def relu(v):
    return [max(0, x) for x in v]

def dense(x, W, b):
    return [sum(w * xi for w, xi in zip(row, x)) + bi for row, bi in zip(W, b)]

def softmax(z):
    m = max(z)
    e = [math.exp(v - m) for v in z]
    s = sum(e)
    return [round(v / s, 4) for v in e]

def forward(x, layers):
    for i, (W, b) in enumerate(layers):
        x = dense(x, W, b)
        x = softmax(x) if i == len(layers) - 1 else relu(x)
    return x

def count_params(sizes):
    return sum(a * b + b for a, b in zip(sizes, sizes[1:]))`,
    bonus:{
      task:"Bonus: write argmax(v) (index of the largest value, first on ties) and predict_class(x, layers, labels) that runs forward and returns the label at the argmax.",
      tests:R`L = [([[1, -1], [0.5, 0.5]], [0, 0]), ([[1, 0], [0, 1]], [0, 0])]
assert argmax([0.1, 0.7, 0.2]) == 1 and argmax([1, 1]) == 0
assert predict_class([2, 1], L, ["stay", "leave"]) == "leave"`,
      hint:"max(range(len(v)), key=lambda i: v[i]) returns the first index on ties.",
      solution:R`def argmax(v):
    return max(range(len(v)), key=lambda i: v[i])

def predict_class(x, layers, labels):
    return labels[argmax(forward(x, layers))]`}}
},
{ id:"m13", act:3, title:"Backpropagation: how networks learn", mins:45,
  hook:"A network with a billion weights gets better with every batch. How does it know which way to nudge each weight? Backpropagation and the chain rule.",
  learn:[
    {h:"The chain rule", p:[
      "If the loss depends on a prediction, which depends on a weight, then how the loss changes with the weight = (how loss changes with prediction) × (how prediction changes with weight). Backpropagation applies this rule from the output back through every layer, computing a gradient for every parameter in one backward sweep."]},
    {h:"One neuron, worked out", p:[
      "For a sigmoid neuron p = σ(w·x + b) with log loss, the math simplifies beautifully: the gradient for each weight is (p − y) × x, and for the bias it's (p − y). Update: w ← w − learning_rate × gradient. Repeat over the data for several epochs."],
     code:R`# One training step, by hand
z = w1 * x1 + w2 * x2 + b
p = 1 / (1 + math.exp(-z))
err = p - y                 # dLoss/dz for sigmoid + log loss
w1 -= lr * err * x1
w2 -= lr * err * x2
b  -= lr * err`},
    {h:"Gradient checking", p:[
      "To verify gradients, compare them with a numerical estimate: (f(w + h) − f(w − h)) / 2h for a tiny h. If they match, the backprop code is right. Frameworks compute gradients automatically (next lesson), but understanding them lets you debug training that doesn't learn."]}
  ],
  mistakes:["Updating weights in the direction of the gradient instead of against it.","A learning rate so small nothing learns, or so big the loss explodes.","Assuming a bug is in the data when the gradient code is wrong; gradient-check it."],
  ai:"Backpropagation plus gradient descent is the learning algorithm behind every deep learning model, from image classifiers to LLMs.",
  interview:{q:"Explain backpropagation in two sentences.", a:"Backpropagation applies the chain rule from the loss backward through the network to compute the gradient of the loss with respect to every parameter efficiently in one pass. Gradient descent then nudges each parameter against its gradient to reduce the loss."},
  terms:[["Backpropagation","Computing all gradients by applying the chain rule backward."],["Chain rule","The derivative of a composition is the product of derivatives."],["Gradient","How much the loss changes when a parameter changes."],["Epoch","One full pass over the training data."],["Gradient check","Comparing backprop gradients with numerical estimates."],["Learning rate","The step size for parameter updates."]],
  quiz:[
    {t:"mcq", q:"To reduce the loss, parameters move…", o:["Against the gradient","Along the gradient","Randomly","Not at all"], a:0},
    {t:"mcq", q:"For a sigmoid neuron with log loss, the bias gradient is…", o:["p − y","y","x","p × x"], a:0},
    {t:"mcq", q:"What is a gradient check for?", o:["Verifying that computed gradients are correct","Speeding up training","Choosing the learning rate","Splitting data"], a:0}
  ],
  lab:{
    task:"Train a single sigmoid neuron on the OR function from scratch.\n\n1. numerical_grad(f, x, h=1e-5): return (f(x + h) − f(x − h)) / (2h), rounded to 4.\n2. train_neuron(data, lr=0.5, epochs=1000): data is a list of ((x1, x2), y). Start w1 = w2 = b = 0. For each epoch, for each example in order: p = sigmoid(w1×x1 + w2×x2 + b); err = p − y; update w1, w2 and b as in the lesson. Return (w1, w2, b).\n3. predict(params, x): 1 if the probability is at least 0.5, else 0.",
    starter:R`import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def numerical_grad(f, x, h=1e-5):
    return 0.0

def train_neuron(data, lr=0.5, epochs=1000):
    return (0.0, 0.0, 0.0)

def predict(params, x):
    return 0

OR = [((0, 0), 0), ((0, 1), 1), ((1, 0), 1), ((1, 1), 1)]`,
    tests:R`assert numerical_grad(lambda x: x ** 2, 3.0) == 6.0
assert numerical_grad(math.sin, 0.0) == 1.0
OR = [((0, 0), 0), ((0, 1), 1), ((1, 0), 1), ((1, 1), 1)]
params = train_neuron(OR)
assert [predict(params, x) for x, y in OR] == [0, 1, 1, 1], "The neuron should learn OR. Got " + str([predict(params, x) for x, y in OR])
assert params[0] > 0 and params[1] > 0 and params[2] < 0, "Positive weights and a negative bias. Got " + str(params)
AND = [((0, 0), 0), ((0, 1), 0), ((1, 0), 0), ((1, 1), 1)]
pa = train_neuron(AND)
assert [predict(pa, x) for x, y in AND] == [0, 0, 0, 1], "And AND too"
w1, w2, b = train_neuron(OR, epochs=1)
p = sigmoid(0); w1c = w2c = bc = 0.0
for (x1, x2), y in OR:
    p = sigmoid(w1c * x1 + w2c * x2 + bc); e = p - y
    w1c -= 0.5 * e * x1; w2c -= 0.5 * e * x2; bc -= 0.5 * e
assert abs(w1 - w1c) < 1e-12 and abs(b - bc) < 1e-12, "Update after every example, in order"`,
    hint:"Inside two loops (epochs, then examples): z = w1 * x1 + w2 * x2 + b; err = sigmoid(z) - y; then the three updates.",
    solution:R`import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def numerical_grad(f, x, h=1e-5):
    return round((f(x + h) - f(x - h)) / (2 * h), 4)

def train_neuron(data, lr=0.5, epochs=1000):
    w1 = w2 = b = 0.0
    for _ in range(epochs):
        for (x1, x2), y in data:
            err = sigmoid(w1 * x1 + w2 * x2 + b) - y
            w1 -= lr * err * x1
            w2 -= lr * err * x2
            b -= lr * err
    return (w1, w2, b)

def predict(params, x):
    w1, w2, b = params
    return 1 if sigmoid(w1 * x[0] + w2 * x[1] + b) >= 0.5 else 0

OR = [((0, 0), 0), ((0, 1), 1), ((1, 0), 1), ((1, 1), 1)]`,
    bonus:{
      task:"Bonus: a single neuron can't learn XOR (outputs 1 when exactly one input is 1). Prove it: write xor_accuracy(epochs=2000) that trains a neuron on XOR with train_neuron and returns the share of the 4 examples it gets right. It will stay at or below 0.75, which is why we need hidden layers.",
      tests:R`acc = xor_accuracy()
assert acc <= 0.75, "A single linear neuron can't solve XOR. Got " + str(acc)`,
      hint:"XOR = [((0, 0), 0), ((0, 1), 1), ((1, 0), 1), ((1, 1), 0)].",
      solution:R`def xor_accuracy(epochs=2000):
    XOR = [((0, 0), 0), ((0, 1), 1), ((1, 0), 1), ((1, 1), 0)]
    p = train_neuron(XOR, epochs=epochs)
    return sum(predict(p, x) == y for x, y in XOR) / 4`}}
},
{ id:"m14", act:3, title:"Autograd: build a tiny PyTorch", mins:50,
  hook:"PyTorch computes gradients for billions of parameters with one call: loss.backward(). You're going to build the core of that idea yourself, in about 40 lines.",
  learn:[
    {h:"Tensors and autograd", p:[
      "In PyTorch, a tensor is an array of numbers that can remember how it was computed. Every operation records its inputs, forming a computation graph. Calling backward() walks that graph in reverse, applying the chain rule at each step and filling in .grad for every parameter. That's automatic differentiation (autograd)."],
     code:R`import torch
w = torch.tensor(2.0, requires_grad=True)
x = torch.tensor(3.0)
loss = (w * x - 5) ** 2
loss.backward()
print(w.grad)     # d(loss)/dw = 2 * (w*x - 5) * x = 6.0`},
    {h:"The training loop", p:[
      "Every PyTorch training loop has the same five lines: forward pass (predictions), compute loss, zero old gradients, backward (compute gradients), optimizer step (update weights). Models are classes that inherit from nn.Module; optimizers like SGD and Adam implement the update rule. Move tensors to a GPU with .to(\"cuda\") for speed."],
     code:R`for xb, yb in loader:
    pred = model(xb)
    loss = loss_fn(pred, yb)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()`},
    {h:"How backward works", p:[
      "Each value stores its inputs and a small function that pushes its own gradient to them. For c = a + b, c's gradient flows unchanged to both a and b. For c = a × b, a gets c.grad × b and b gets c.grad × a. For ReLU, gradient passes through only where the input was positive. Visit the values in reverse topological order (outputs before inputs) and accumulate with +=, because one value can feed several others."]}
  ],
  mistakes:["Forgetting optimizer.zero_grad(), so gradients accumulate across steps.","Overwriting gradients with = instead of accumulating with +=.","Calling backward on a non-scalar without understanding what it means."],
  ai:"Autograd is the engine of modern deep learning. Building it once removes the mystery from every PyTorch or JAX model you'll ever read.",
  interview:{q:"Why must gradients be zeroed before each backward pass in PyTorch?", a:"PyTorch accumulates gradients into .grad by default, which is useful for things like gradient accumulation across mini-batches. If you don't zero them each step, gradients from previous batches add up and the updates are wrong."},
  terms:[["Tensor","A multi-dimensional array that can track gradients."],["Autograd","Automatic computation of gradients from a recorded computation graph."],["Computation graph","The record of operations that produced a value."],["backward()","Runs backpropagation from a scalar loss."],["Optimizer","The rule that updates parameters from gradients (SGD, Adam)."],["nn.Module","PyTorch's base class for models."]],
  quiz:[
    {t:"mcq", q:"For c = a × b, the gradient reaching a is…", o:["c.grad × b","c.grad","b","c.grad × a"], a:0},
    {t:"mcq", q:"Why accumulate gradients with += in autograd?", o:["A value can feed into several operations","It's faster","Python requires it","To reset them"], a:0},
    {t:"mcq", q:"The standard order in a PyTorch training step is…", o:["forward, loss, zero_grad, backward, step","backward, forward, step","step, loss, forward","loss, step, backward"], a:0}
  ],
  lab:{
    task:"Finish the Value class, a scalar autograd engine.\n\n__add__ and __mul__ are started for you; make them also work when the other side is a plain number (wrap it in Value). Implement:\n1. relu(): output max(0, data); backward passes the gradient only if the output is positive.\n2. backward(): build a topological order of all values feeding into this one (depth-first, visiting inputs before the value itself), set self.grad = 1.0, then call each value's _backward in reverse order.",
    starter:R`class Value:
    def __init__(self, data, _inputs=()):
        self.data = data
        self.grad = 0.0
        self._inputs = _inputs
        self._backward = lambda: None

    def __add__(self, other):
        out = Value(self.data + other.data, (self, other))
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other))
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    __radd__ = __add__
    __rmul__ = __mul__

    def relu(self):
        return self

    def backward(self):
        pass`,
    tests:R`a, b = Value(2.0), Value(-3.0)
c = a * b + a
c.backward()
assert c.data == -4.0 and a.grad == -2.0 and b.grad == 2.0, "a is used twice, so its gradients add: b + 1 = -2. Got " + str((a.grad, b.grad))
w, x = Value(2.0), Value(3.0)
loss = (w * x + (-5)) * (w * x + (-5))
loss.backward()
assert loss.data == 1.0 and w.grad == 6.0, "Matches PyTorch: d/dw (wx - 5)^2 = 2(wx - 5)x = 6. Got " + str(w.grad)
p, q = Value(-1.0), Value(4.0)
r = (p * q).relu() + (p + q).relu()
r.backward()
assert r.data == 3.0 and p.grad == 1.0 and q.grad == 1.0, "relu blocks the gradient of the negative branch. Got " + str((p.grad, q.grad))
k = 3 * Value(2.0) + 1
assert k.data == 7.0, "Plain numbers should work on either side"`,
    hint:"Wrap numbers: other = other if isinstance(other, Value) else Value(other). Topological order: topo, seen = [], set(); def build(v): if v not in seen: seen.add(v); for i in v._inputs: build(i); topo.append(v).",
    solution:R`class Value:
    def __init__(self, data, _inputs=()):
        self.data = data
        self.grad = 0.0
        self._inputs = _inputs
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    __radd__ = __add__
    __rmul__ = __mul__

    def relu(self):
        out = Value(max(0, self.data), (self,))
        def _backward():
            self.grad += (out.data > 0) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        topo, seen = [], set()
        def build(v):
            if v not in seen:
                seen.add(v)
                for i in v._inputs:
                    build(i)
                topo.append(v)
        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()`,
    bonus:{
      task:"Bonus: use your engine to learn. Write fit(xs, ys, lr=0.01, steps=500) that trains w and b (Values starting at 0) to fit y = w×x + b by minimizing the sum of squared errors: each step build the loss from Values, reset w.grad and b.grad to 0, call backward, then update w.data and b.data. Return (w.data, b.data) rounded to 2.",
      tests:R`assert fit([1, 2, 3, 4], [3, 5, 7, 9]) == (2.0, 1.0), "Should learn y = 2x + 1. Got " + str(fit([1, 2, 3, 4], [3, 5, 7, 9]))`,
      hint:"loss = Value(0.0); for x, y in zip(xs, ys): e = w * x + b + (-y); loss = loss + e * e. Zero grads before backward.",
      solution:R`def fit(xs, ys, lr=0.01, steps=500):
    w, b = Value(0.0), Value(0.0)
    for _ in range(steps):
        loss = Value(0.0)
        for x, y in zip(xs, ys):
            e = w * x + b + (-y)
            loss = loss + e * e
        w.grad = b.grad = 0.0
        loss.backward()
        w.data -= lr * w.grad
        b.data -= lr * b.grad
    return (round(w.data, 2), round(b.data, 2))`}}
},
{ id:"m15", act:3, title:"Training well: overfitting and regularization", mins:40,
  hook:"Training loss keeps falling. Validation loss started rising three epochs ago. Every extra minute of training is now making the model worse on real data.",
  learn:[
    {h:"Reading loss curves", p:[
      "Plot training and validation loss per epoch. Both falling: keep going. Training falling while validation rises: overfitting, as the model memorizes training data. Both high and flat: underfitting, as the model is too simple or the learning rate is off. Learning curves are the first thing to check when a model disappoints."]},
    {h:"Fighting overfitting", p:[
      "More or better data (often the best fix). Early stopping: keep the weights from the epoch with the best validation loss and stop after it fails to improve for a set number of epochs (patience). Regularization: L2 (weight decay) adds λ × Σw² to the loss so weights stay small; dropout randomly switches off neurons during training so the network can't rely on any single one. Simpler models and data augmentation help too."],
     code:R`optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)`},
    {h:"Learning rate schedules", p:[
      "A big learning rate early makes fast progress; a smaller one later settles into a good minimum. Common schedules: step decay (halve every N epochs), cosine decay and warmup (start tiny, ramp up), which is standard for transformers. Adam and AdamW adapt the step size per parameter and are the default optimizers for deep learning."]}
  ],
  mistakes:["Reporting the final epoch instead of the best validation epoch.","Adding regularization to fix underfitting, which makes it worse.","Tuning early stopping on the test set."],
  ai:"The same curves, early stopping, weight decay and warmup schedules are used when training and fine-tuning large language models.",
  interview:{q:"How do you tell overfitting from underfitting?", a:"Compare training and validation performance. Overfitting: training loss is low but validation loss is much higher and often rising. Underfitting: both are poor. Fix overfitting with more data, regularization, early stopping or a simpler model; fix underfitting with a more expressive model, better features or longer training."},
  terms:[["Overfitting","Fitting training data so closely that new data suffers."],["Underfitting","A model too simple to capture the pattern."],["Early stopping","Stopping when validation loss stops improving."],["Patience","How many epochs without improvement before stopping."],["L2 regularization / weight decay","Penalizing large weights."],["Dropout","Randomly disabling neurons during training."],["Learning rate schedule","A plan for changing the learning rate over training."]],
  quiz:[
    {t:"mcq", q:"Training loss falls, validation loss rises. This is…", o:["Overfitting","Underfitting","Perfect training","A data leak"], a:0},
    {t:"mcq", q:"Both training and validation loss are high and flat. Try…", o:["A more expressive model or better features","Stronger regularization","Stopping earlier","Removing data"], a:0},
    {t:"mcq", q:"What does dropout do?", o:["Randomly turns off neurons during training","Deletes data rows","Lowers the learning rate","Removes layers permanently"], a:0}
  ],
  lab:{
    task:"1. best_epoch(val_losses, patience): walk the losses in order (epochs start at 0). Track the best loss so far; if there's no improvement for patience epochs in a row, stop. Return (best_epoch, stopped_at), where stopped_at is the epoch where training stopped, or the last epoch if it never stopped early.\n2. l2_loss(base_loss, weights, lam): base_loss + lam × sum of squared weights, rounded to 4.\n3. step_decay(lr0, epoch, drop=0.5, every=10): lr0 × drop ^ (epoch // every).\n4. warmup_lr(lr_max, step, warmup): lr_max × (step + 1) / warmup while step < warmup, then lr_max.",
    starter:R`def best_epoch(val_losses, patience):
    return (0, 0)

def l2_loss(base_loss, weights, lam):
    return base_loss

def step_decay(lr0, epoch, drop=0.5, every=10):
    return lr0

def warmup_lr(lr_max, step, warmup):
    return lr_max`,
    tests:R`v = [1.0, 0.8, 0.7, 0.72, 0.71, 0.75, 0.9, 0.5]
assert best_epoch(v, 3) == (2, 5), "Best at epoch 2; epochs 3, 4, 5 don't improve, so stop at 5. Got " + str(best_epoch(v, 3))
assert best_epoch(v, 10) == (7, 7), "Without stopping early, the later improvement wins"
assert best_epoch([0.5], 2) == (0, 0)
assert l2_loss(0.3, [1, -2, 0.5], 0.01) == 0.3525
assert step_decay(0.1, 0) == 0.1 and step_decay(0.1, 25) == 0.025
assert [warmup_lr(1e-3, s, 4) for s in (0, 1, 3, 10)] == [0.00025, 0.0005, 0.001, 0.001]`,
    hint:"best_epoch: best, best_i, bad = inf, 0, 0; for i, l in enumerate(val_losses): if l < best: update and reset bad; else bad += 1 and if bad >= patience: return (best_i, i). At the end return (best_i, len(val_losses) - 1).",
    solution:R`def best_epoch(val_losses, patience):
    best, best_i, bad = float("inf"), 0, 0
    for i, l in enumerate(val_losses):
        if l < best:
            best, best_i, bad = l, i, 0
        else:
            bad += 1
            if bad >= patience:
                return (best_i, i)
    return (best_i, len(val_losses) - 1)

def l2_loss(base_loss, weights, lam):
    return round(base_loss + lam * sum(w * w for w in weights), 4)

def step_decay(lr0, epoch, drop=0.5, every=10):
    return lr0 * drop ** (epoch // every)

def warmup_lr(lr_max, step, warmup):
    return lr_max * (step + 1) / warmup if step < warmup else lr_max`,
    bonus:{
      task:"Bonus: write diagnose(train_losses, val_losses) that returns \"overfitting\" if the last validation loss is more than 1.5 times the last training loss, \"underfitting\" if the last training loss is above 0.5, and \"good\" otherwise (check overfitting first).",
      tests:R`assert diagnose([0.9, 0.3, 0.1], [0.9, 0.5, 0.6]) == "overfitting"
assert diagnose([0.9, 0.8, 0.7], [0.9, 0.85, 0.8]) == "underfitting"
assert diagnose([0.9, 0.4, 0.2], [0.9, 0.4, 0.25]) == "good"`,
      hint:"t, v = train_losses[-1], val_losses[-1].",
      solution:R`def diagnose(train_losses, val_losses):
    t, v = train_losses[-1], val_losses[-1]
    if v > 1.5 * t:
        return "overfitting"
    if t > 0.5:
        return "underfitting"
    return "good"`}}
},
/* ---------------- ACT 4 ---------------- */
{ id:"m16", act:4, title:"Convolutional networks for images", mins:40,
  hook:"A factory wants to spot scratches on parts from camera photos, and HR wants to read scanned forms. Images need a different kind of layer: one that looks for local patterns anywhere in the picture.",
  learn:[
    {h:"Images are grids of numbers", p:[
      "A grayscale image is a grid of brightness values; a color image has three grids (red, green, blue). A 224 × 224 color image has about 150,000 numbers. Connecting every pixel to every neuron in a dense layer would be huge and would ignore that nearby pixels belong together."]},
    {h:"Convolution and pooling", p:[
      "A convolution slides a small filter (for example 3 × 3 weights) across the image and computes a weighted sum at each position, producing a feature map. The same filter is reused everywhere, so a \"vertical edge detector\" works in any part of the image, and there are far fewer weights. Early layers learn edges, later layers combine them into textures, shapes and objects. Pooling (like 2 × 2 max pooling) shrinks feature maps by keeping the strongest response in each block."],
     code:R`import torch.nn as nn
cnn = nn.Sequential(
    nn.Conv2d(3, 16, kernel_size=3), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(16, 32, kernel_size=3), nn.ReLU(), nn.MaxPool2d(2),
    nn.Flatten(), nn.LazyLinear(2))     # scratch / no scratch`},
    {h:"In practice", p:[
      "Rarely train from scratch: start from a pretrained model (ResNet, EfficientNet or a vision transformer) and fine-tune it on your images (transfer learning). Augment data with flips, crops and brightness changes. For many business tasks today, multimodal models like Claude can read images and documents directly without training anything."]}
  ],
  mistakes:["Training an image model from scratch on a few hundred images instead of fine-tuning a pretrained one.","Letting near-identical photos appear in both train and test sets.","Ignoring that a multimodal LLM might solve the document-reading task with no training at all."],
  ai:"Convolutions powered the deep learning revolution in vision, and the idea of learned, shared filters carries over into audio and some text models.",
  interview:{q:"Why are convolutional layers better than dense layers for images?", a:"They exploit local structure and reuse the same small filter across the whole image (weight sharing), so they need far fewer parameters and detect a pattern wherever it appears. Stacking them builds up from edges to complex shapes."},
  terms:[["Convolution","Sliding a small filter over data and computing weighted sums."],["Filter / kernel","The small grid of learned weights in a convolution."],["Feature map","The output grid of a convolution."],["Max pooling","Downsampling by keeping the maximum in each block."],["Transfer learning","Starting from a pretrained model and adapting it."],["Data augmentation","Creating varied training examples with flips, crops and similar changes."]],
  quiz:[
    {t:"fill", q:"A 3×3 filter slides over a 5×5 image with no padding and stride 1. What is the output width?", a:["3"]},
    {t:"mcq", q:"2×2 max pooling on a 4×4 feature map gives…", o:["A 2×2 map","A 4×4 map","An 8×8 map","A single number"], a:0},
    {t:"mcq", q:"You have 400 labeled photos of defects. Best start?", o:["Fine-tune a pretrained vision model","Train a CNN from scratch","Use linear regression","Use k-means"], a:0}
  ],
  lab:{
    task:"Images are lists of rows.\n\n1. conv2d(img, kernel): \"valid\" convolution with stride 1 (no padding). The output is (H − kh + 1) × (W − kw + 1); each cell is the sum of kernel × the image patch under it.\n2. relu2d(grid): max(0, v) for every cell.\n3. max_pool(grid, size=2): non-overlapping size × size blocks; each output cell is the block's maximum. Ignore leftover rows or columns that don't fill a block.",
    starter:R`def conv2d(img, kernel):
    return []

def relu2d(grid):
    return grid

def max_pool(grid, size=2):
    return []

# a vertical edge: dark on the left, bright on the right
img = [[0, 0, 9, 9],
       [0, 0, 9, 9],
       [0, 0, 9, 9],
       [0, 0, 9, 9]]
edge = [[-1, 1],
        [-1, 1]]`,
    tests:R`img = [[0, 0, 9, 9], [0, 0, 9, 9], [0, 0, 9, 9], [0, 0, 9, 9]]
edge = [[-1, 1], [-1, 1]]
out = conv2d(img, edge)
assert out == [[0, 18, 0], [0, 18, 0], [0, 18, 0]], "The filter fires only on the edge. Got " + str(out)
assert conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1]]) == [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
assert relu2d([[-1, 2], [3, -4]]) == [[0, 2], [3, 0]]
assert max_pool([[1, 3, 2, 0], [4, 2, 1, 5], [0, 1, 7, 2], [3, 2, 1, 1]]) == [[4, 5], [3, 7]]
assert max_pool([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == [[5]], "Leftover rows and columns are ignored"`,
    hint:"conv2d: for i in range(H - kh + 1): for j in range(W - kw + 1): sum(kernel[a][b] * img[i + a][j + b] for a in range(kh) for b in range(kw)).",
    solution:R`def conv2d(img, kernel):
    H, W, kh, kw = len(img), len(img[0]), len(kernel), len(kernel[0])
    return [[sum(kernel[a][b] * img[i + a][j + b] for a in range(kh) for b in range(kw))
             for j in range(W - kw + 1)] for i in range(H - kh + 1)]

def relu2d(grid):
    return [[max(0, v) for v in row] for row in grid]

def max_pool(grid, size=2):
    H, W = len(grid) // size, len(grid[0]) // size
    return [[max(grid[i * size + a][j * size + b] for a in range(size) for b in range(size))
             for j in range(W)] for i in range(H)]

# a vertical edge: dark on the left, bright on the right
img = [[0, 0, 9, 9],
       [0, 0, 9, 9],
       [0, 0, 9, 9],
       [0, 0, 9, 9]]
edge = [[-1, 1],
        [-1, 1]]`,
    bonus:{
      task:"Bonus: add padding and stride. Write conv2d_ps(img, kernel, pad=0, stride=1): surround the image with pad rings of zeros, then convolve, moving stride cells at a time.",
      tests:R`img = [[1, 2], [3, 4]]
assert conv2d_ps(img, [[1]], pad=1) == [[0, 0, 0, 0], [0, 1, 2, 0], [0, 3, 4, 0], [0, 0, 0, 0]]
assert conv2d_ps([[1, 2, 3, 4]] * 4, [[1, 1], [1, 1]], stride=2) == [[6, 14], [6, 14]]`,
      hint:"Padded image: width W + 2 × pad; build rows of zeros and pad each row. Output positions are range(0, H - kh + 1, stride).",
      solution:R`def conv2d_ps(img, kernel, pad=0, stride=1):
    W = len(img[0]) + 2 * pad
    padded = [[0] * W for _ in range(pad)] + [[0] * pad + row + [0] * pad for row in img] + [[0] * W for _ in range(pad)]
    H, kh, kw = len(padded), len(kernel), len(kernel[0])
    return [[sum(kernel[a][b] * padded[i + a][j + b] for a in range(kh) for b in range(kw))
             for j in range(0, W - kw + 1, stride)] for i in range(0, H - kh + 1, stride)]`}}
},
{ id:"m17", act:4, title:"Transformers and attention", mins:50,
  hook:"In \"The manager told Ravi he was promoted\", who is \"he\"? To decide, a model must let each word look at the others. That mechanism, attention, is the heart of every modern LLM.",
  learn:[
    {h:"From tokens to vectors", p:[
      "Text is split into tokens (often pieces of words, from a tokenizer like BPE). Each token becomes an embedding vector, and positional information is added because attention itself doesn't know word order. A transformer is a stack of layers, each with attention followed by a small feed-forward network, with residual connections and normalization in between."]},
    {h:"Scaled dot-product attention", p:[
      "Each token produces a query (what am I looking for?), a key (what do I contain?) and a value (what do I pass along?). Scores are the dot product of one token's query with every key, divided by √d (the vector size) to keep numbers stable. Softmax turns scores into weights, and the output is the weighted sum of values: Attention(Q, K, V) = softmax(QKᵀ / √d) V. Multi-head attention runs several of these in parallel so different heads can track different relationships."],
     code:R`scores = Q @ K.T / math.sqrt(d)         # how much each token attends to each other token
scores = scores.masked_fill(future, -inf) # causal mask for text generation
weights = softmax(scores, dim=-1)
out = weights @ V`},
    {h:"How LLMs generate", p:[
      "Decoder-only models like Claude use a causal mask: each token can only attend to earlier tokens, so the model learns to predict the next token. Generation repeats: predict a probability for every possible next token, sample one (temperature controls randomness), append it, and continue. Pretraining on huge text teaches language and knowledge; instruction tuning and reinforcement learning from feedback make the model helpful and safe."]}
  ],
  mistakes:["Thinking attention understands order by itself; it needs positional information.","Forgetting the causal mask when building a text generator, which lets it peek at the future.","Confusing tokens with words when estimating cost or context length."],
  ai:"This is the architecture behind Claude and every other frontier language model. Understanding attention lets you reason about context windows, cost and behavior.",
  interview:{q:"Why divide by √d in scaled dot-product attention?", a:"Dot products of long vectors grow large in magnitude, which pushes softmax into regions where one weight is nearly 1 and gradients vanish. Dividing by the square root of the dimension keeps scores in a reasonable range so attention stays trainable."},
  terms:[["Transformer","A neural architecture built on attention layers."],["Token","A piece of text (often part of a word) the model processes."],["Attention","Weighting other tokens' information by relevance."],["Query, key, value","Vectors used to compute attention scores and outputs."],["Causal mask","Blocks attention to future tokens during generation."],["Multi-head attention","Several attention computations in parallel."],["Positional encoding","Information about each token's position in the sequence."]],
  quiz:[
    {t:"mcq", q:"Attention weights for one token come from…", o:["Softmax of its query dotted with every key, scaled by √d","Random numbers","Word frequency","The value vectors only"], a:0},
    {t:"mcq", q:"What does the causal mask prevent?", o:["Attending to future tokens","Attending to the first token","Using values","Softmax overflow"], a:0},
    {t:"mcq", q:"Why add positional information?", o:["Attention alone ignores word order","To save memory","To speed up softmax","It isn't needed"], a:0}
  ],
  lab:{
    task:"Implement attention with plain lists. Q, K and V are lists of vectors (one per token).\n\n1. softmax(z): numerically stable softmax. Treat float(\"-inf\") scores as weight 0.\n2. attention(Q, K, V, causal=False): for each query i, scores_j = dot(Q[i], K[j]) / √d, where d = len(Q[0]). If causal, set scores for j > i to −inf. Weights = softmax(scores). Output row i = Σ weights_j × V[j]. Return (outputs, weights), both rounded to 4.",
    starter:R`import math

def softmax(z):
    return []

def attention(Q, K, V, causal=False):
    return ([], [])`,
    tests:R`assert softmax([0.0, 0.0]) == [0.5, 0.5]
assert softmax([1.0, float("-inf")]) == [1.0, 0.0], "-inf gets zero weight"
Q = [[1.0, 0.0], [0.0, 1.0]]
K = [[1.0, 0.0], [0.0, 1.0]]
V = [[10.0, 0.0], [0.0, 10.0]]
out, W = attention(Q, K, V)
e = round(math.exp(1 / math.sqrt(2)), 10)
w0 = round(e / (e + 1), 4)
assert W[0] == [w0, round(1 - e / (e + 1), 4)], "Token 0 attends most to itself. Got " + str(W[0])
assert out[0] == [round(10 * e / (e + 1), 4), round(10 / (e + 1), 4)], "Got " + str(out[0])
out_c, W_c = attention(Q, K, V, causal=True)
assert W_c[0] == [1.0, 0.0] and out_c[0] == [10.0, 0.0], "With a causal mask, token 0 can only see itself"
assert W_c[1] == W[1], "The last token sees everything either way"
assert all(abs(sum(r) - 1) < 1e-3 for r in W), "Each row of weights sums to 1"`,
    hint:"softmax: m = max(z); e = [0.0 if v == float(\"-inf\") else math.exp(v - m) for v in z]. Output row: [sum(w * V[j][c] for j, w in enumerate(weights)) for c in range(len(V[0]))].",
    solution:R`import math

def softmax(z):
    m = max(z)
    e = [0.0 if v == float("-inf") else math.exp(v - m) for v in z]
    s = sum(e)
    return [v / s for v in e]

def attention(Q, K, V, causal=False):
    d = len(Q[0])
    outs, weights = [], []
    for i, q in enumerate(Q):
        scores = []
        for j, k in enumerate(K):
            if causal and j > i:
                scores.append(float("-inf"))
            else:
                scores.append(sum(a * b for a, b in zip(q, k)) / math.sqrt(d))
        w = softmax(scores)
        outs.append([round(sum(w[j] * V[j][c] for j in range(len(V))), 4) for c in range(len(V[0]))])
        weights.append([round(x, 4) for x in w])
    return (outs, weights)`,
    bonus:{
      task:"Bonus: write sample_next(logits, temperature, r) for generation. Divide logits by temperature, softmax, then walk the cumulative probabilities and return the first index where the running total exceeds r (a random number in 0–1 passed in so tests are repeatable). A temperature of 0 means greedy: return the argmax.",
      tests:R`assert sample_next([2.0, 1.0, 0.1], 0, 0.99) == 0, "Temperature 0 is greedy"
assert sample_next([2.0, 1.0, 0.1], 1.0, 0.1) == 0 and sample_next([2.0, 1.0, 0.1], 1.0, 0.8) == 1 and sample_next([2.0, 1.0, 0.1], 1.0, 0.95) == 2`,
      hint:"probs = softmax([l / temperature for l in logits]); total = 0; for i, p in enumerate(probs): total += p; if total > r: return i.",
      solution:R`def sample_next(logits, temperature, r):
    if temperature == 0:
        return max(range(len(logits)), key=lambda i: logits[i])
    probs = softmax([l / temperature for l in logits])
    total = 0.0
    for i, p in enumerate(probs):
        total += p
        if total > r:
            return i
    return len(probs) - 1`}}
},
{ id:"m18", act:4, title:"Fine-tuning, LoRA and model hubs", mins:45,
  hook:"Your team needs a model that writes job descriptions in your company's exact style and structure. Prompting gets close. Is fine-tuning worth it, and can you afford to train a model with billions of weights?",
  learn:[
    {h:"When to fine-tune", p:[
      "Try prompting, examples and RAG first: they're cheaper, faster to change and easier to evaluate. Fine-tune when you need a consistent style or format across thousands of outputs, a narrow skill a smaller model can learn (so it's cheaper and faster than a big general model), or behavior that prompts can't reliably produce. Don't fine-tune to add facts that change; that's RAG's job."]},
    {h:"LoRA and parameter-efficient fine-tuning", p:[
      "Full fine-tuning updates every weight, which needs lots of GPU memory. LoRA (low-rank adaptation) freezes the original weights and learns two small matrices, A (r × d_in) and B (d_out × r), whose product is added to the frozen weight: W' = W + (α / r) × B A. With rank r of 8 or 16, that's often under 1% of the parameters. B starts at zero, so training begins exactly at the original model. QLoRA also quantizes the frozen model to save even more memory."],
     code:R`from peft import LoraConfig, get_peft_model
cfg = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "v_proj"], lora_dropout=0.05)
model = get_peft_model(base_model, cfg)
model.print_trainable_parameters()   # e.g. 0.2% of all parameters`},
    {h:"Data and hubs", p:[
      "Supervised fine-tuning data is usually JSONL chat examples: a list of messages with roles and the ideal assistant reply. Quality beats quantity: a few hundred excellent, diverse examples often beat thousands of noisy ones. Hold out an eval set. Hugging Face hosts open models, datasets and the transformers, datasets and peft libraries; check each model's license before business use. For proprietary models, providers offer their own fine-tuning options where available."]}
  ],
  mistakes:["Fine-tuning to teach facts that change, which RAG handles better.","Training on hundreds of low-quality examples and expecting quality output.","Skipping a held-out eval, so nobody can tell whether the fine-tune beat prompting."],
  ai:"Knowing when fine-tuning is worth it, and how LoRA makes it affordable, is a common architecture and interview topic.",
  interview:{q:"How does LoRA make fine-tuning cheaper?", a:"It freezes the pretrained weights and learns a low-rank update, the product of two small matrices, added to selected weight matrices. That trains a tiny fraction of parameters, cutting memory and compute, and the small adapter files can be swapped or merged back into the base weights."},
  terms:[["Fine-tuning","Further training a pretrained model on your examples."],["SFT","Supervised fine-tuning on input and ideal-output pairs."],["LoRA","Low-rank adaptation: learning small matrices added to frozen weights."],["Rank (r)","The inner size of LoRA's matrices; smaller means fewer parameters."],["PEFT","Parameter-efficient fine-tuning methods like LoRA."],["Quantization","Storing weights with fewer bits to save memory."],["Model hub","A repository of shared models, such as Hugging Face."]],
  quiz:[
    {t:"fill", q:"LoRA with rank 8 on a 4096 × 4096 weight matrix trains how many parameters? (r × (d_in + d_out))", a:["65536","65,536"]},
    {t:"mcq", q:"Why is LoRA's B matrix initialized to zero?", o:["So training starts exactly at the original model","To save memory","It isn't","To speed up inference"], a:0},
    {t:"mcq", q:"Policies change monthly and answers must cite sources. Better choice?", o:["RAG","Fine-tuning","Training from scratch","Larger temperature"], a:0}
  ],
  lab:{
    task:"1. lora_params(d_in, d_out, r): trainable parameters, r × (d_in + d_out).\n2. savings(d_in, d_out, r): the share of full fine-tuning parameters (d_in × d_out) that LoRA trains, rounded to 4.\n3. lora_weight(W, A, B, alpha, r): return W + (alpha / r) × (B @ A) as a new matrix rounded to 4. W is d_out × d_in, A is r × d_in, B is d_out × r (all lists of rows).\n4. validate_example(line): line is a JSONL string. Return a list of problems: \"invalid json\" (stop there), \"no messages\" (stop there) if there isn't a non-empty messages list, \"bad role\" if any role isn't user or assistant, \"must start with user\", and \"must end with assistant\". An empty list means it's valid.",
    starter:R`import json

def lora_params(d_in, d_out, r):
    return 0

def savings(d_in, d_out, r):
    return 0.0

def lora_weight(W, A, B, alpha, r):
    return W

def validate_example(line):
    return []`,
    tests:R`assert lora_params(4096, 4096, 8) == 65536
assert savings(4096, 4096, 8) == 0.0039, "Under half a percent of the full matrix"
W = [[1.0, 0.0], [0.0, 1.0]]
A = [[1.0, 2.0]]
B = [[0.0], [0.0]]
assert lora_weight(W, A, B, 16, 1) == W, "B starts at zero, so the model starts unchanged"
B2 = [[0.5], [1.0]]
assert lora_weight(W, A, B2, 2, 1) == [[2.0, 2.0], [2.0, 5.0]], "Got " + str(lora_weight(W, A, B2, 2, 1))
good = json.dumps({"messages": [{"role": "user", "content": "Write a JD"}, {"role": "assistant", "content": "..."}]})
assert validate_example(good) == []
assert validate_example("{oops") == ["invalid json"]
assert validate_example('{"messages": []}') == ["no messages"]
bad = json.dumps({"messages": [{"role": "assistant", "content": "x"}, {"role": "bot", "content": "y"}]})
assert validate_example(bad) == ["bad role", "must start with user", "must end with assistant"], "Got " + str(validate_example(bad))`,
    hint:"B @ A: [[sum(B[i][k] * A[k][j] for k in range(r)) for j in range(len(A[0]))] for i in range(len(B))]. Then add (alpha / r) times it to W elementwise.",
    solution:R`import json

def lora_params(d_in, d_out, r):
    return r * (d_in + d_out)

def savings(d_in, d_out, r):
    return round(lora_params(d_in, d_out, r) / (d_in * d_out), 4)

def lora_weight(W, A, B, alpha, r):
    scale = alpha / r
    BA = [[sum(B[i][k] * A[k][j] for k in range(len(A))) for j in range(len(A[0]))] for i in range(len(B))]
    return [[round(W[i][j] + scale * BA[i][j], 4) for j in range(len(W[0]))] for i in range(len(W))]

def validate_example(line):
    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        return ["invalid json"]
    msgs = data.get("messages") if isinstance(data, dict) else None
    if not isinstance(msgs, list) or not msgs:
        return ["no messages"]
    problems = []
    if any(m.get("role") not in ("user", "assistant") for m in msgs):
        problems.append("bad role")
    if msgs[0].get("role") != "user":
        problems.append("must start with user")
    if msgs[-1].get("role") != "assistant":
        problems.append("must end with assistant")
    return problems`,
    bonus:{
      task:"Bonus: write split_dataset(lines, eval_every=10): return (train, eval) where every 10th valid example (the 10th, 20th and so on among valid lines) goes to eval, and invalid lines are dropped.",
      tests:R`ok = json.dumps({"messages": [{"role": "user", "content": "q"}, {"role": "assistant", "content": "a"}]})
lines = [ok] * 25 + ["{bad"]
tr, ev = split_dataset(lines)
assert len(tr) == 23 and len(ev) == 2`,
      hint:"valid = [l for l in lines if not validate_example(l)]; eval is the ones where (i + 1) % eval_every == 0.",
      solution:R`def split_dataset(lines, eval_every=10):
    valid = [l for l in lines if not validate_example(l)]
    ev = [l for i, l in enumerate(valid) if (i + 1) % eval_every == 0]
    tr = [l for i, l in enumerate(valid) if (i + 1) % eval_every != 0]
    return (tr, ev)`}}
},
{ id:"m19", act:4, title:"MLOps: tracking, deployment and drift", mins:40,
  hook:"The attrition model worked beautifully at launch. Eighteen months later, after a reorganization and a new remote-work policy, it quietly gives worse and worse predictions. Nobody noticed.",
  learn:[
    {h:"Experiment tracking and versioning", p:[
      "Record every training run: code version, data version, parameters, metrics and the resulting model file. Tools like MLflow and Weights & Biases do this. When someone asks \"which model is in production and how was it trained?\", you can answer exactly and reproduce it."]},
    {h:"Deployment patterns", p:[
      "Batch scoring: run predictions on a schedule (nightly attrition risk scores). Online serving: an API (for example FastAPI) returns predictions in milliseconds. Ship carefully: shadow mode (run the new model silently alongside the old), canary releases (send a small share of traffic first) and easy rollback. Package preprocessing with the model to avoid training-serving skew."],
     code:R`import mlflow
with mlflow.start_run():
    mlflow.log_params({"model": "lightgbm", "max_depth": 6})
    mlflow.log_metric("val_auc", 0.87)
    mlflow.sklearn.log_model(pipeline, "model")`},
    {h:"Monitoring and drift", p:[
      "Data drift: the inputs change (new departments, different tenure mix). Concept drift: the relationship between inputs and outcome changes (a new policy changes why people leave). Monitor input distributions, prediction distributions and, when labels arrive, real performance. The population stability index (PSI) compares distributions: roughly, below 0.1 is stable, 0.1 to 0.25 is worth watching, above 0.25 is a significant shift that should trigger investigation and possibly retraining. Also watch fairness across groups, especially for decisions about people."]}
  ],
  mistakes:["Deploying a model with no record of the data and code that produced it.","Monitoring uptime but not prediction quality or input drift.","Retraining automatically on drifted data without a human checking what changed."],
  ai:"MLOps practices (tracking, safe deployment, monitoring) apply equally to LLM applications, which is why evals and observability appeared in the Agentic AI track too.",
  interview:{q:"What's the difference between data drift and concept drift?", a:"Data drift is a change in the input distribution, like a new mix of departments or tenure. Concept drift is a change in the relationship between inputs and the target, like a policy change altering why people leave. Data drift can be detected from inputs alone; concept drift usually needs fresh labels to see performance drop."},
  terms:[["MLOps","Practices for reliably training, deploying and maintaining ML models."],["Experiment tracking","Recording parameters, metrics and artifacts for every run."],["Model registry","A catalog of model versions and their deployment stage."],["Canary release","Sending a small share of traffic to a new model first."],["Data drift","A change in input data distribution over time."],["Concept drift","A change in the relationship between inputs and the target."],["PSI","Population stability index, a measure of distribution shift."]],
  quiz:[
    {t:"mcq", q:"A new policy changes why people leave, while inputs look the same. This is…", o:["Concept drift","Data drift","Overfitting","Leakage"], a:0},
    {t:"mcq", q:"A PSI of 0.4 on a key feature suggests…", o:["A significant shift worth investigating","No change","A perfect model","A training bug"], a:0},
    {t:"mcq", q:"Running a new model silently next to the old one to compare is called…", o:["Shadow mode","Early stopping","Bagging","Pruning"], a:0}
  ],
  lab:{
    task:"1. psi(expected, actual): both are lists of bin shares (each list sums to 1). Replace any share below 0.0001 with 0.0001, then PSI = Σ (actual − expected) × ln(actual / expected). Round to 4.\n2. drift_level(value): \"stable\" below 0.1, \"watch\" from 0.1 up to 0.25, \"significant\" at 0.25 or above.\n3. class Tracker: log(run_id, params, metrics) stores a run; best(metric, higher_is_better=True) returns the run_id with the best value of that metric (first logged wins ties); compare(a, b, metric) returns metric of b minus metric of a, rounded to 4.",
    starter:R`import math

def psi(expected, actual):
    return 0.0

def drift_level(value):
    return "stable"

class Tracker:
    def __init__(self):
        self.runs = {}`,
    tests:R`assert psi([0.25, 0.25, 0.25, 0.25], [0.25, 0.25, 0.25, 0.25]) == 0.0
e, a = [0.5, 0.3, 0.2], [0.2, 0.3, 0.5]
assert psi(e, a) == round((0.2 - 0.5) * math.log(0.2 / 0.5) + (0.5 - 0.2) * math.log(0.5 / 0.2), 4)
assert psi([0.5, 0.5], [1.0, 0.0]) > 1, "An empty bin is clipped, not a crash"
assert [drift_level(x) for x in (0.05, 0.1, 0.2, 0.25, 0.6)] == ["stable", "watch", "watch", "significant", "significant"]
t = Tracker()
t.log("r1", {"depth": 3}, {"auc": 0.81, "latency_ms": 12})
t.log("r2", {"depth": 6}, {"auc": 0.86, "latency_ms": 30})
t.log("r3", {"depth": 9}, {"auc": 0.86, "latency_ms": 55})
assert t.best("auc") == "r2", "Ties go to the first run logged"
assert t.best("latency_ms", higher_is_better=False) == "r1"
assert t.compare("r1", "r2", "auc") == 0.05`,
    hint:"psi: loop with zip, clip e and a with max(x, 0.0001). Tracker.best: ids = list(self.runs); pick with max or min using key=lambda r: self.runs[r][\"metrics\"][metric] (both keep the first on ties).",
    solution:R`import math

def psi(expected, actual):
    total = 0.0
    for e, a in zip(expected, actual):
        e, a = max(e, 0.0001), max(a, 0.0001)
        total += (a - e) * math.log(a / e)
    return round(total, 4)

def drift_level(value):
    if value < 0.1:
        return "stable"
    if value < 0.25:
        return "watch"
    return "significant"

class Tracker:
    def __init__(self):
        self.runs = {}
    def log(self, run_id, params, metrics):
        self.runs[run_id] = {"params": params, "metrics": metrics}
    def best(self, metric, higher_is_better=True):
        key = lambda r: self.runs[r]["metrics"][metric]
        return max(self.runs, key=key) if higher_is_better else min(self.runs, key=key)
    def compare(self, a, b, metric):
        return round(self.runs[b]["metrics"][metric] - self.runs[a]["metrics"][metric], 4)`,
    bonus:{
      task:"Bonus: write bin_shares(values, edges): edges like [0, 12, 36, 1000] define bins [0, 12), [12, 36), [36, 1000). Return each bin's share of the values, rounded to 4. Then psi between training tenure and live tenure becomes one line.",
      tests:R`train = [3, 5, 14, 20, 30, 40, 50, 60]
live = [2, 3, 4, 6, 8, 10, 40, 50]
edges = [0, 12, 36, 1000]
assert bin_shares(train, edges) == [0.25, 0.375, 0.375] and bin_shares(live, edges) == [0.75, 0.0, 0.25]
assert drift_level(psi(bin_shares(train, edges), bin_shares(live, edges))) == "significant", "Many more new hires: significant drift"`,
      hint:"For each bin i: count values with edges[i] <= v < edges[i + 1].",
      solution:R`def bin_shares(values, edges):
    n = len(values)
    return [round(sum(1 for v in values if edges[i] <= v < edges[i + 1]) / n, 4) for i in range(len(edges) - 1)]`}}
},
{ id:"m20", act:4, title:"Capstone: an end-to-end attrition model", mins:60,
  hook:"Bring the whole track together on a realistic HR problem: engineer features, split honestly, scale on training data only, train logistic regression from scratch with several features, choose a threshold for the business, and report the right metrics.",
  learn:[
    {h:"The workflow", p:[
      "Frame the problem (who is likely to leave in the next 6 months?), check for leakage, engineer features, split data (stratified), fit scaling on the training set, train a model, pick a decision threshold that matches the business cost of misses versus false alarms, evaluate on the test set once, and write down what the model should and shouldn't be used for."]},
    {h:"Responsible use", p:[
      "Predictions about people carry real risk. Use models like this to offer support (a stay interview, a career conversation), never as the sole basis for decisions about someone. Check performance across groups for fairness, avoid protected attributes and their proxies, keep humans accountable, and explain to stakeholders what the scores mean and don't mean."]},
    {h:"What you now know", p:[
      "Problem framing and leakage, EDA, linear and logistic regression, splitting and cross-validation, metrics, trees and ensembles, clustering, scaling and PCA, feature engineering and pipelines, neural networks, backpropagation, autograd, regularization, CNNs, attention and transformers, fine-tuning with LoRA and MLOps. That's the core of machine learning, built with your own hands."]}
  ],
  mistakes:["Evaluating on the test set many times while tuning.","Using a default 0.5 threshold without asking what each mistake costs.","Treating a risk score as a verdict about a person."],
  ai:"This capstone plus a clear write-up of your threshold choice and fairness checks is exactly what interviewers for data science and ML roles want to see.",
  interview:{q:"How would you choose the decision threshold for an attrition model?", a:"Work with the business to estimate the cost of a missed leaver versus an unnecessary intervention, then evaluate precision and recall across thresholds on validation data and pick the one that minimizes expected cost or meets a recall target at acceptable precision. Confirm it once on the test set and monitor it after launch."},
  terms:[["End-to-end ML","The full path from problem framing to a deployed, monitored model."],["Multivariate model","A model using several features at once."],["Threshold tuning","Choosing the probability cutoff that best fits business costs."],["Fairness check","Comparing model performance across groups of people."],["Proxy variable","A feature that indirectly encodes a sensitive attribute."],["Model card","A short document describing a model's use, data and limits."]],
  quiz:[
    {t:"mcq", q:"How many times should you evaluate on the test set?", o:["Once, at the end","After every tuning step","Never","Daily"], a:0},
    {t:"mcq", q:"A risk score says an employee is 80% likely to leave. Appropriate use?", o:["Offer a career conversation or support","Automatically deny their promotion","Share it with coworkers","Ignore all scores"], a:0},
    {t:"mcq", q:"Zip code is highly predictive but correlates with a protected group. It may be…", o:["A proxy variable to review carefully","Always safe","A label","A hyperparameter"], a:0}
  ],
  lab:{
    task:"Finish the pipeline. Helpers are provided: sigmoid, a Standardizer class and scores (precision, recall, F1).\n\n1. features(row): return [tenure_months / 12, overtime_hours, 1 if promoted_last_2y else 0, rating] as floats.\n2. train(X, y, lr=0.1, epochs=500): batch gradient descent for multi-feature logistic regression. Start with w = [0] × number of features and b = 0. Each epoch: p_i = sigmoid(w·x_i + b); gradient for w_j = mean((p_i − y_i) × x_ij); for b = mean(p_i − y_i). Return (w, b).\n3. predict_proba(model, X): list of probabilities.\n4. pick_threshold(probs, y, candidates): for each threshold, predict 1 when prob ≥ threshold and compute F1 with scores. Return the threshold with the highest F1 (the first one on ties).",
    starter:R`import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

class Standardizer:
    def fit(self, X):
        cols = list(zip(*X))
        self.mean = [sum(c) / len(c) for c in cols]
        self.sd = [math.sqrt(sum((v - m) ** 2 for v in c) / len(c)) or 1.0 for c, m in zip(cols, self.mean)]
        return self
    def transform(self, X):
        return [[(v - m) / s for v, m, s in zip(row, self.mean, self.sd)] for row in X]

def scores(y, pred):
    tp = sum(1 for a, b in zip(y, pred) if a == 1 and b == 1)
    fp = sum(1 for a, b in zip(y, pred) if a == 0 and b == 1)
    fn = sum(1 for a, b in zip(y, pred) if a == 1 and b == 0)
    p = tp / (tp + fp) if tp + fp else 0.0
    r = tp / (tp + fn) if tp + fn else 0.0
    return {"precision": p, "recall": r, "f1": 2 * p * r / (p + r) if p + r else 0.0}

def features(row):
    return []

def train(X, y, lr=0.1, epochs=500):
    return ([0.0] * len(X[0]), 0.0)

def predict_proba(model, X):
    return []

def pick_threshold(probs, y, candidates):
    return 0.5`,
    tests:R`import random
rng = random.Random(0)
rows = []
for i in range(300):
    tenure = rng.randint(1, 120); ot = rng.uniform(0, 15); promo = rng.random() < 0.3; rating = rng.randint(1, 5)
    risk = -1.5 - 0.02 * tenure + 0.35 * ot - 1.2 * promo - 0.4 * (rating - 3)
    left = 1 if rng.random() < 1 / (1 + math.exp(-risk)) else 0
    rows.append({"tenure_months": tenure, "overtime_hours": ot, "promoted_last_2y": promo, "rating": rating, "left": left})
assert features(rows[0]) == [rows[0]["tenure_months"] / 12, float(rows[0]["overtime_hours"]), float(int(rows[0]["promoted_last_2y"])), float(rows[0]["rating"])], "Got " + str(features(rows[0]))
train_rows, test_rows = rows[:220], rows[220:]
Xtr = [features(r) for r in train_rows]; ytr = [r["left"] for r in train_rows]
Xte = [features(r) for r in test_rows]; yte = [r["left"] for r in test_rows]
sc = Standardizer().fit(Xtr)
model = train(sc.transform(Xtr), ytr)
w, b = model
assert w[1] > 0 and w[2] < 0 and w[0] < 0, "Overtime should raise risk; promotion and tenure should lower it. Got " + str([round(v, 2) for v in w])
probs = predict_proba(model, sc.transform(Xte))
assert len(probs) == len(Xte) and all(0 < p < 1 for p in probs)
t = pick_threshold(predict_proba(model, sc.transform(Xtr)), ytr, [0.2, 0.3, 0.4, 0.5, 0.6])
assert t in (0.2, 0.3, 0.4, 0.5, 0.6)
test_f1 = scores(yte, [1 if p >= t else 0 for p in probs])["f1"]
base = sum(yte) / len(yte)
assert test_f1 > 0.5, "The model should beat chance clearly on held-out data. F1 = " + str(round(test_f1, 3))
assert pick_threshold([0.9, 0.2, 0.6], [1, 0, 1], [0.5, 0.95]) == 0.5`,
    hint:"train: for each epoch, p = [sigmoid(sum(wj * xj for wj, xj in zip(w, x)) + b) for x in X]; err = [pi - yi for pi, yi in zip(p, y)]; grad_j = sum(e * x[j] for e, x in zip(err, X)) / n.",
    solution:R`import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

class Standardizer:
    def fit(self, X):
        cols = list(zip(*X))
        self.mean = [sum(c) / len(c) for c in cols]
        self.sd = [math.sqrt(sum((v - m) ** 2 for v in c) / len(c)) or 1.0 for c, m in zip(cols, self.mean)]
        return self
    def transform(self, X):
        return [[(v - m) / s for v, m, s in zip(row, self.mean, self.sd)] for row in X]

def scores(y, pred):
    tp = sum(1 for a, b in zip(y, pred) if a == 1 and b == 1)
    fp = sum(1 for a, b in zip(y, pred) if a == 0 and b == 1)
    fn = sum(1 for a, b in zip(y, pred) if a == 1 and b == 0)
    p = tp / (tp + fp) if tp + fp else 0.0
    r = tp / (tp + fn) if tp + fn else 0.0
    return {"precision": p, "recall": r, "f1": 2 * p * r / (p + r) if p + r else 0.0}

def features(row):
    return [row["tenure_months"] / 12, float(row["overtime_hours"]),
            float(1 if row["promoted_last_2y"] else 0), float(row["rating"])]

def train(X, y, lr=0.1, epochs=500):
    n, d = len(X), len(X[0])
    w, b = [0.0] * d, 0.0
    for _ in range(epochs):
        p = [sigmoid(sum(wj * xj for wj, xj in zip(w, x)) + b) for x in X]
        err = [pi - yi for pi, yi in zip(p, y)]
        w = [wj - lr * sum(e * x[j] for e, x in zip(err, X)) / n for j, wj in enumerate(w)]
        b -= lr * sum(err) / n
    return (w, b)

def predict_proba(model, X):
    w, b = model
    return [sigmoid(sum(wj * xj for wj, xj in zip(w, x)) + b) for x in X]

def pick_threshold(probs, y, candidates):
    best_t, best_f1 = candidates[0], -1
    for t in candidates:
        f1 = scores(y, [1 if p >= t else 0 for p in probs])["f1"]
        if f1 > best_f1:
            best_t, best_f1 = t, f1
    return best_t`,
    bonus:{
      task:"Bonus: fairness check. Write group_recall(y, pred, groups) that returns {group: recall rounded to 3} for each group (a group with no positives gets 0.0), and recall_gap(y, pred, groups) that returns the largest minus the smallest group recall, rounded to 3.",
      tests:R`y = [1, 1, 0, 1, 1, 0]
pred = [1, 0, 0, 1, 1, 1]
g = ["A", "A", "A", "B", "B", "B"]
assert group_recall(y, pred, g) == {"A": 0.5, "B": 1.0} and recall_gap(y, pred, g) == 0.5`,
      hint:"For each group, filter the (y, pred) pairs and reuse scores(...)[\"recall\"].",
      solution:R`def group_recall(y, pred, groups):
    out = {}
    for grp in dict.fromkeys(groups):
        ys = [a for a, gg in zip(y, groups) if gg == grp]
        ps = [b for b, gg in zip(pred, groups) if gg == grp]
        out[grp] = round(scores(ys, ps)["recall"], 3)
    return out

def recall_gap(y, pred, groups):
    r = group_recall(y, pred, groups).values()
    return round(max(r) - min(r), 3)`}}
}
];
