# DeepIntel hosting and showcase plan

## Recommendation

Keep URL analysis on the user's device. A local proof has now converted the existing XGBoost classifier to ONNX and run it through ONNX Runtime Web's WebAssembly backend: labels matched the Python model for all 6,556 rows in the current test CSV, with maximum class-probability error of 6.26e-7 in Brave. This proves model-only inference works on-device. It does not prove full DeepIntel parity: the detector also depends on its 20-feature builder, score fusion, threat-intelligence files, trusted-domain data, lookalike logic, explanations, and feedback behavior. Keep the current Python API as the reference until the complete browser pipeline matches it.

Use [ONNX Runtime Web's WASM backend](https://github.com/microsoft/onnxruntime/blob/main/js/web/README.md) as the compatibility baseline. WebGPU has an experimental, narrower operator set and does not list the `ai.onnx.ml` tree-ensemble operator used by typical XGBoost converters ([operator list](https://github.com/microsoft/onnxruntime/blob/main/js/web/docs/webgpu-operators.md)). The [XGBoost converter example](https://onnx.ai/sklearn-onnx/auto_tutorial/plot_gexternal_xgboost.html) is a conversion starting point; it does not verify this model's probabilities or explanations.

The trained artifacts are generated locally and ignored by Git. Current measurements: XGBoost `.pkl` 2,983,542 bytes; ONNX model 2,054,745 bytes (282,933 bytes gzip); ONNX Runtime Web WASM 14.85 MB raw / 3.81 MB gzip, plus 54 KB CPU-only JavaScript / 18 KB gzip. In the local Brave run, session initialization took 232 ms and inference over all 6,556 rows took 230 ms using the local loopback server. These are desktop/loopback measurements, not first-visit public download or mobile results; reproduce them with the prototype artifacts. Native pickle files remain ignored; the ONNX proof includes its exported model and parity fixtures. The committed inference data is small (`dataset_clean.csv` is about 2.5 MB; the two threat lists total about 27 KB), but copying the classifier alone would change the product. Do not call the browser path complete until final verdicts and explanations pass the full parity gate below.

The existing GitHub Pages showcase remains a static page with an illustrative walkthrough. It does not send submitted URLs to an analysis service or run model predictions today. Static hosting can serve a future browser bundle; it does not require a public inference server.

## Launch the landing page

1. Commit and push `website/` and `.github/workflows/landing-page.yml` to `main`.
2. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Run **Deploy landing page** from Actions, or push a landing-page change to `main`.
4. Use the URL returned by the deployment. The expected project URL is `https://vidita14.github.io/deepintel/`; it is not live merely because these files exist.
5. Test the deployed page on a phone and a desktop before adding the URL to applications.

The workflow tests the walkthrough and uploads only the HTML, CSS, JavaScript, and `assets/`. It does not publish datasets, local databases, model artifacts, test files, or design diagnostics. Relative asset links support the `/deepintel/` repository path and a later custom domain.

Local preview from the repository root:

```bash
python3 -m http.server 4173 --directory website
# Open http://localhost:4173
node website/app.test.cjs
```

## Browser parity gate

The model-only comparison has passed on all 6,556 rows in the current test CSV: no label drift between Python, ONNX Runtime, and Brave WASM; maximum probability error was below 6.3e-7. Before switching the dashboard or showcase, compare the *full* browser implementation against the Python reference on `data/test.csv` and the existing malformed, lookalike, threat-list, trusted-domain, and trailing-slash cases.

- Require identical final labels, risk levels, deciding layers, and zero trailing-slash verdict flips. Measure a fresh Python full-system baseline on exactly the same fixtures and require no regression. The older committed 92.75% report covers a different row count and is not the browser-prototype result.
- Compare class probabilities and fused scores within an agreed numeric tolerance, and require exact reason/trace content and equivalent feature drivers. ONNX conversion alone will not carry the current XGBoost TreeSHAP driver output.
- Test the deployed static bundle in current Chrome, Firefox, and Safari with WASM. Confirm URL strings are not sent to a server, model assets load from the same origin, and offline operation works after the assets are cached.
- Record actual ONNX bytes, initial download size, browser memory, and first/subsequent analysis latency from the staged artifact. Current local measurements are a baseline, not a public-release guarantee.

## Optional hosted API fallback

Use this only if a shared API is still needed after the on-device proof. The local API is not a deploy switch: it requires two trusted model files, serves personal feedback routes, and has development CORS settings. The read-only wrapper and Docker image in `deploy/` block feedback endpoints, validate URL size/schemes, limit request bodies, rate-limit analysis, preload the model before readiness, and serve the existing dashboard.

Render Free is a no-cost hosting option that requires a Render account, but its service has 512 MB RAM and 0.1 CPU, sleeps after 15 minutes without traffic, and has an ephemeral filesystem ([free service limits](https://render.com/docs/free), [compute plans](https://render.com/docs/compute-plans)). A cold wake can take about a minute. Model fit under the 512 MB cap is unverified; do not create the service until the smoke test below passes with the staged artifact. Without a payment method, Render suspends free services when included usage is exhausted rather than charging for overage.

Hugging Face Docker Spaces are not a free-account alternative as of this check: Docker/Gradio CPU Spaces require a Pro subscription for personal accounts, even though CPU Basic has no hourly hardware charge ([Spaces overview](https://huggingface.co/docs/hub/en/spaces-overview), [pricing](https://huggingface.co/pricing)).

### Prepare trusted artifacts

From the repository root, initialize the encoder and train once from the committed dataset. Use an isolated clean checkout if the working copy has personal feedback; `retrain.py` can incorporate the local `data/feedback.db` when present.

```bash
python - <<'PY'
import joblib
from sklearn.preprocessing import LabelEncoder
joblib.dump(LabelEncoder().fit(["benign", "malware", "phishing"]), "models/label_encoder.pkl")
PY
python scripts/pipeline/retrain.py
python deploy/prepare.py
```

`prepare.py` copies only `best_model.pkl` and `label_encoder.pkl` into `deploy/artifacts/`. Review the generated files and commit those public model artifacts with the deploy source. The Dockerfile uses an explicit file allowlist: it does not copy `data/feedback.db`, logs, `.git`, training CSV splits, or credentials. It fails at build/startup if trusted artifacts are missing. Never use a pickle downloaded from an untrusted source; loading it can execute code.

### Smoke-test before a public service

Docker is configured for Render's `PORT` and its 512 MB memory cap. Run this after artifact preparation:

```bash
docker build -f deploy/Dockerfile -t deepintel-demo .
docker run --rm --memory=512m -p 7860:7860 -e PORT=7860 deepintel-demo
curl http://localhost:7860/health
curl -X POST http://localhost:7860/analyze -H 'Content-Type: application/json' -d '{"url":"https://example.com"}'
```

Only proceed if startup and multiple analyses stay below the cap without an OOM kill. For Render, create a public Web Service from the repo, select the Free compute plan, set Dockerfile path to `deploy/Dockerfile`, keep the repository root as build context, and set `/health` as the health-check path. Test the hosted cold start, `/docs`, `/dashboard`, oversized input, unsupported schemes, and blocked `/feedback` before sharing the URL. Feedback is intentionally read-only and will not persist.

## Showcase strategy

Lead with the product and give technical readers an immediate path into the code. The page connects each audience to specific evidence:

- **AI startups:** feature engineering, explanation layers, evaluation leakage controls, and feedback-driven retraining.
- **SWE teams:** a shared engine behind an API, dashboard and extension; correction scope rules and model rollback.
- **Data teams:** domain-separated evaluation, per-class errors, dataset bias, and the normalization regression check.

After launch, add the verified live URL to the repository About website field, the first line of the README, the resume project title, and LinkedIn Featured. Link the repository alongside it so technical reviewers can inspect implementation.

Suggested resume wording, grounded in the committed report:

> Built DeepIntel, an explainable URL threat detection system combining XGBoost, heuristic rules, and threat intelligence behind a FastAPI API and Chrome extension; evaluated 6,555 domain-held-out URLs at 92.75% accuracy and implemented feedback-driven retraining with a validation gate.

Do not reuse the older 96.58% score or imply production adoption. For a social post, show the evidence walkthrough and explain one engineering lesson: realistic browsing exposed dataset shortcuts that the first benchmark missed.

## Next improvements after review

The page now includes a rendered product promo and actual dashboard/extension UI captures using fixed, disclosed demo data. All project CTAs point to the repository; no individual authorship is claimed. The canonical and social-preview URLs target the expected GitHub Pages address; update them if the deployment returns another hostname or you add a custom domain. The social card is a screenshot of the landing-page hero. No invented contact details or customer logos are included.
