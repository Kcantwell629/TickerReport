# Ticker Report

[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native 0.86](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![Platform: iOS | Android | Web](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-informational)](#running-it)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A mobile app that turns any stock ticker into an equity-research brief, structured
around **The Investing Playbook** (quality, valuation, moat, red flags) and styled
after the sample `SM_Report.pdf` brief.

Enter a ticker → the app pulls live fundamentals and lays them out as:

1. **Cover** — price, market cap, 52-week range, your BUY/HOLD/SELL rating
2. **Company Snapshot** — sector, industry, HQ, employees, dividend yield, beta
3. **Business Profile** — what the company does
4. **Business Life Cycle** — Playbook §7's six-stage stepper (you place the pin)
5. **Moat Assessment** — source / width / direction, editable per the Playbook §6 framework
6. **The Scorecard** — 8 ratios graded against Playbook §2-3 targets (gross margin, net
   margin, ROE, ROIC, current ratio, debt/equity, P/E, dividend yield)
7. **Quality-of-Earnings Flags** — valuation, leverage, liquidity, cash-return checks (§5)
8. **Intrinsic Value & Margin of Safety** — Graham formula `V = EPS × (8.5 + 2g) × 4.4 ÷ Y`
   with a conservative/base/optimistic scenario range, plus the `S = V × 0.65` buy line (§4)
9. **Bull Case / Bear Case** — auto-seeded from the numbers, editable
10. **Verdict** — quality / moat / price synthesis badges + your one-line takeaway

Your ratings, moat notes, lifecycle stage, and thesis edits are saved locally per
ticker, so re-running a report later remembers your last assessment.

## Data source

Live data comes from [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs/),
which has a free tier (250 requests/day, no credit card). Get a key, then paste it
into the app's **Settings** screen — nothing is hardcoded, and the key stays on-device
(`AsyncStorage`).

Also in Settings: the **AAA corporate bond yield (Y)** used in the Graham formula.
Update it occasionally from a source like FRED's Moody's Seasoned Aaa series.

## Running it

```bash
cd TickerReport
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) for the real mobile experience, or
press `w` in the terminal to preview in a browser tab.

## Project structure

```
src/
  theme/            colors, type scale, grade→color mapping (dark teal/orange, per the moodboard)
  services/
    fmp.ts          Financial Modeling Prep API client
    playbook.ts      Playbook thresholds, grading, Graham formula, red-flag rules
    reportStorage.ts per-ticker saved assessment (moat/lifecycle/rating/notes)
  hooks/
    useTickerReport.ts  fetch + assemble one ticker's report data
  components/       gauges, donut ring, moat row editor, stage stepper, badges, cards
  screens/          Home, Report, Settings, Playbook (reference checklist)
  data/
    playbookContent.ts  condensed text from Investing_Playbook.docx (§1 and §8)
```

## Disclaimer

Informational and educational only — not investment, financial, tax, or legal
advice. Data is third-party and may be delayed, estimated, or wrong. Playbook
targets are guidelines, not rules, and vary by industry. Verify against primary
filings and consult a licensed professional before making decisions.
