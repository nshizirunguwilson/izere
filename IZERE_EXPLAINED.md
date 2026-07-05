# Every section of Izere, explained simply

What each number means, where it comes from, and a worked example with round figures.
Written for anyone — no banking or tech background needed.

---

## The big picture

**A MoMo statement goes in; a loan decision a bank can defend comes out.**

Izere reads a business's Mobile Money statement and does four things, in order:

1. Checks the statement is genuine (integrity check)
2. Builds the books — income and spending per month
3. Scores the business from 0 to 100
4. Says how big a loan the evidence supports

There is no black box. Every number on the screen is simple arithmetic on the
transactions, and every section below shows exactly what that arithmetic is.

---

## Integrity check

**Before scoring anything, prove the statement was not edited.**

Every MoMo row records the balance after that transaction. So each row must equal:
**previous balance + money in − fee**. If someone opens the file and changes an amount
to look richer, the chain stops adding up at that exact row — and Izere refuses to
issue a score, showing the broken rows instead.

It also checks that no transaction ID appears twice and that dates run in order.

> **Example**
>
> | | |
> |---|---:|
> | Balance after row 10 | 500,000 |
> | Row 11: customer pays 40,000 (fee 200) | + 39,800 |
> | **Balance row 11 must say** | **539,800** |
>
> If row 11 says 600,000 instead — the file was edited. No score.

---

## Credit score & verdict

**One number from 0 to 100 that answers: can we trust this business with a loan?**

Five factors (next section) are each scored 0–100, then blended using weights.
The total falls into a band:

- **70 or more — Approve**
- **45–69 — Review**
- **Below 45 — Decline**

**Review is not a no.** It means "the numbers are mixed — a loan officer should ask a
few questions before deciding." The three sentences under *Why this decision* are the
biggest reasons behind the score, written so the officer can repeat them to the client.

---

## Score breakdown — the five factors

Each bar answers one question a careful lender would ask.

### Average monthly inflow (25%)
*How big is the business?* A shop receiving RWF 5,000,000 a month scores higher than
one receiving RWF 200,000. Biggest weight, because the size of the cashflow is the
strongest evidence.

### Inflow regularity (20%)
*Does money come in steadily?* Paid on 25 of 26 working days = high score. Paid on
only 5 days a month = low score, even if the total is the same — irregular income
misses loan payments.

### Balance floor (20%)
*Does the account ever hit empty?* If the wallet never drops below RWF 10,000, full
marks. An account that sits near zero one day in five belongs to a business living
hand-to-mouth.

### Volatility (20%)
*Is every month similar, or a rollercoaster?* Months of 3,000,000 / 3,100,000 /
2,900,000 = steady, high score. Months of 6,000,000 / 500,000 / 5,000,000 = wild
swings, low score.

### Expense-to-income (15%)
*Of every 1,000 francs in, how much survives?* Earning 1,000,000 and spending 550,000
keeps 45% — healthy. Spending 950,000 of every 1,000,000 leaves almost nothing to
repay a loan with.

---

## Repayment capacity

**The biggest monthly loan payment the business can carry without suffering.**

Take the monthly profit (money in minus money out), then take **30% of it**. Why only
30%? The business still needs the other 70% to restock, pay rent, survive a slow week,
and eat. A lender who takes more is setting the borrower up to default.

> **Example**
>
> | | |
> |---|---:|
> | Money in per month | 10,000,000 |
> | Money out per month | − 7,000,000 |
> | **Profit per month** | **3,000,000** |
> | Capacity = 30% of profit | **900,000 / month** |

---

## Recommended limit

**The biggest total loan we suggest: two and a half months of profit.**

Don't read "2.5× average monthly net inflow" as a formula — read it as **2.5 months of
profit**. Why is that the right size? Connect it to the capacity above: paying 30% of
profit per month, a loan of 2.5 months' profit is fully repaid in about **9 months**.
Short enough that a few months of statement history is honest evidence for it.

> **Example**
>
> | | |
> |---|---:|
> | Profit per month | 3,000,000 |
> | Limit = 2.5 × profit | **7,500,000 total** |
> | Paid at capacity (900,000/month) | ≈ 9 months to finish |
>
> Lending 12 months of profit instead (36,000,000) would take over 3 years to
> repay — far beyond what 6 months of history can promise.

---

## Monthly cash flow, summary & top customers

**The bookkeeping an informal business never had — built automatically.**

- **Monthly cash flow** — one bar per month showing money received. Hover any bar to
  see that month's inflow, expenses, net, and selling days. Quiet months and growth
  are visible at a glance.
- **Monthly summary** — the same data as a table: inflow, expenses, net, and selling
  days (days with at least one customer payment) for every month.
- **Top customers** — who paid the business the most. A lender looks at this for one
  risk: if 80% of income comes from a single buyer, losing that buyer kills the
  repayment. Many small customers = safer income.

One rule worth knowing: when the owner deposits their own cash (`CASH_IN`), Izere
never counts it as revenue — otherwise anyone could fake a healthy business by
cycling their own money.

---

## Stress test

**What if sales drop but costs stay the same — does the loan still fit?**

Drag the slider to −20% and Izere recalculates everything as if the business earned
20% less. Costs don't shrink — rent is still due, stock was already bought. That's the
trap it reveals: **a small drop in sales can wipe out the entire profit.**

> **Example — a 20% sales drop erases 100% of profit**
>
> | | |
> |---|---:|
> | Normal: in 5,000,000, out 4,000,000 | profit 1,000,000 |
> | At −20%: in 4,000,000, out 4,000,000 | profit 0 |
> | **Capacity (30% of profit)** | **0 — no loan fits** |

If the verdict survives the shock, the loan is safe even in a bad season. If Approve
collapses at −10%, the officer knows the approval is fragile — lend less, or shorter.

---

## Loan request

**Does the loan they're asking for fit the capacity the data proves?**

Enter an amount and a term. Izere first shows **what they will pay** — monthly
payment, total interest (2% per month, simple), and total to repay — then compares the
monthly payment to the repayment capacity:

- **Fits** — payment ≤ 100% of capacity
- **Stretch** — up to 125%
- **Does not fit** — above 125%

> **Example — RWF 6,000,000 over 12 months, capacity 900,000**
>
> | | |
> |---|---:|
> | Interest = 6,000,000 × 2% × 12 | 1,440,000 |
> | Total to repay | 7,440,000 |
> | Monthly payment = total ÷ 12 | 620,000 |
> | **620,000 ÷ 900,000 capacity** | **69% — Fits** |

When it doesn't fit, Izere never just says no — it computes the **counter-offer**
both ways: the biggest amount that works at that term, or the shortest term that
makes their amount work.

**Why 24 months maximum?** The evidence is a few months of MoMo history. That
honestly supports a short working-capital loan — stock, equipment, a season — but it
cannot promise a business will exist in year three. And at 2% per month, 24 months
already means +48% interest, about where this loan type stops making sense.

---

## Not scoreable yet

**Too little history is not the same as a bad business.**

With fewer than **3 months** of history or **40 transactions**, the averages would be
guesses. Instead of a false decline, Izere says "not scoreable yet" and tells the
owner exactly how to become scoreable: keep receiving customer payments through MoMo
and come back once 3 full months are on record. A brand-new shop is never punished
for being new.

---

*Izere — Mobile Money history → lender-ready credit decision. Score weights are
illustrative for the demo; a production model would be trained on real repayment
outcomes.*
