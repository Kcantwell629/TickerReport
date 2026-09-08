// Condensed from "The Investing Playbook" (Kenneth, Aug 2026)

export const GUIDING_PRINCIPLES: { title: string; points: string[] }[] = [
  { title: '1. Invest in businesses, not stocks', points: ['Understand how the business actually makes money.', 'Look for durable moats: brand, patents, network effects, switching costs, cost advantages, barriers to entry.'] },
  { title: '2. Focus on quality', points: ['Strong and consistent return on equity.', 'Low debt relative to equity.', 'Healthy profit margins and free cash flow.', 'Consistent retained-earnings growth.'] },
  { title: '3. Buy with a margin of safety', points: ['Price and value are different things.', 'Purchase only when market price is meaningfully below intrinsic value.'] },
  { title: '4. Think long term', points: ['Stay within your circle of competence.', 'Ignore short-term market noise and let compounding work over many years.'] },
  { title: '5. Prioritize financial strength', points: ['Strong balance sheet — cash exceeding debt when possible.', 'Ability to survive economic downturns.'] },
  { title: '6. Use disciplined valuation', points: ['Analyze P/E, P/FCF, DCF, and peer comparisons; avoid overpaying for growth.', 'Look for attractive risk/reward opportunities.'] },
  { title: '7. Control emotions', points: ['Be fearful when others are greedy, and greedy when others are fearful.', 'Avoid herd behavior and confirmation bias.'] },
  { title: '8. Manage risk first', points: ['Protect against permanent loss of capital; avoid excessive leverage and margin.', 'Keep cash reserves for opportunities and emergencies.'] },
  { title: '9. Watch for red flags', points: ['Questionable accounting, rising debt, deteriorating management, weak competitive position, excessive dilution.'] },
  { title: '10. Build a repeatable system', points: ['A consistent process beats sporadic brilliance.', 'Focus on patience, discipline, and continuous learning.'] },
];

export const CHECKLIST: { group: string; items: string[] }[] = [
  {
    group: 'Quality & Advantage',
    items: [
      'Gross margin > 40%, net margin > 20%',
      'Rising EPS over 10 years',
      'ROE > 20% and ROIC > 15%',
      'Identifiable moat that is wide and/or widening',
    ],
  },
  {
    group: 'Financial Strength',
    items: [
      'Debt to equity < 1.0; long-term debt repayable in 3-4 years',
      'Current ratio > 1.5; cash exceeds debt',
      'Operating cash flow > net income; FCF ≈ net income',
      'Capex ≤ 25% of earnings',
    ],
  },
  {
    group: 'Valuation & Discipline',
    items: [
      'P/E and P/FCF < 20',
      'Price below two-thirds of intrinsic value (margin of safety)',
      'No major red flags (dilution, rising debt, low-quality earnings)',
      'Within your circle of competence — you understand the business',
    ],
  },
];

export const DISCLAIMER =
  "This app is for informational and educational purposes only and does not constitute financial, investment, tax, or legal advice. All targets and thresholds are general guidelines, not rules; they vary by industry and over time, and data sources frequently disagree. Consult a licensed professional before making investment decisions.";
