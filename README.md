# Izere

**Mobile Money history → lender-ready credit decision.**

Rwandan micro and small businesses generate real revenue through MoMo but lack the
documentation banks require — part of a ~$1.8B SME financing gap. Izere turns a MoMo
statement into structured books and a transparent, explainable credit assessment that a
bank, MFI, or SACCO can act on.

## What it does

1. **Ingests** a MoMo statement CSV (drag-and-drop, or use the built-in samples).
2. **Verifies integrity before anything else** — balance-chain arithmetic, duplicate
   transaction IDs, date order. A doctored statement is caught to the exact row and no
   score is issued (try the "Tampered statement" sample).
3. **Builds the books** — monthly income, expenses, net, selling days, top customers.
   Owner cash top-ups are never counted as revenue.
4. **Scores** — five explainable factors (inflow, regularity, balance floor, volatility,
   expense ratio) blended into a 0–100 score with plain-language reasons. Businesses with
   under 3 months of history are "not scoreable yet", never falsely declined.
5. **Sizes the loan** — safe monthly repayment capped at 30% of net inflow, recommended
   limit of 2.5 months of profit, a loan-request checker with counter-offers, and a
   stress test showing whether the decision survives a revenue drop.
6. **Exports** a clean two-page report (print to PDF).

Fully bilingual: **Kinyarwanda and English**, with contextual help on every concept so
non-technical users can navigate it.

## Run it

```bash
npm install
npm run dev     # open http://localhost:5173
npm test        # 13 unit tests: integrity, revenue rules, verdict bands, loan matching
npm run build   # production build
```

## Sample data

| File | What it shows |
| --- | --- |
| `public/samples/sample_healthy.csv` | Kigali retail shop, 6 months → score 94, Approve |
| `public/samples/sample_seasonal.csv` | Seasonal trader → Review (irregular income) |
| `public/samples/sample_tampered.csv` | Edited statement → blocked with forensic row audit |

## Stack

Vite + React + TypeScript + Tailwind CSS. Papaparse for CSV, Vitest for tests.
Everything runs client-side; no data leaves the browser.

## Honest notes for reviewers

- Score weights are illustrative; a production model would train on repayment outcomes.
- Input is CSV statement export; parsing raw MoMo SMS is on the roadmap.
