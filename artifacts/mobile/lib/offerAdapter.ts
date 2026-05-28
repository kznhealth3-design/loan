import type { LoanOffer } from "@workspace/api-client-react";

export type ApiOffer = LoanOffer;

export type DisplayCategory =
  | "all"
  | "personal"
  | "home"
  | "car"
  | "school"
  | "business"
  | "emergency";

export type DisplayOffer = {
  id: string;
  bank: string;
  initial: string;
  initialBg: string;
  initialColor: string;
  type: string;
  category: DisplayCategory;
  featured: boolean;
  tag: string;
  tagColor: string;
  tagBg: string;
  maxAmount: string;
  loanRange: string;
  rate: string;
  rateNum: number;
  processingFee: string;
  tenure: string;
  minAmount: number;
  maxAmountNum: number;
  tenureOptions: number[];
  tenureMinMonths: number;
  tenureMaxMonths: number;
  interestMin: number;
  interestMax: number;
  rating: number;
  description: string | null;
  features: string[];
  featureIcons: string[];
  featureColors: string[];
};

const PALETTE = [
  { bg: "#10B981", tagBg: "#D1FAE5", tagColor: "#10B981", tag: "Best Interest" },
  { bg: "#EF4444", tagBg: "#DBEAFE", tagColor: "#3B82F6", tag: "Quick Approval" },
  { bg: "#4F46E5", tagBg: "#FEF3C7", tagColor: "#D97706", tag: "Low Processing Fee" },
  { bg: "#8B5CF6", tagBg: "#EDE9FE", tagColor: "#7C3AED", tag: "Instant Approval" },
  { bg: "#0EA5E9", tagBg: "#E0F2FE", tagColor: "#0284C7", tag: "Top Rated" },
  { bg: "#F59E0B", tagBg: "#FEF3C7", tagColor: "#B45309", tag: "Flexible Tenure" },
  { bg: "#EC4899", tagBg: "#FCE7F3", tagColor: "#BE185D", tag: "Easy Docs" },
  { bg: "#14B8A6", tagBg: "#CCFBF1", tagColor: "#0F766E", tag: "No Hidden Fees" },
];

const LOAN_TYPE_LABEL: Record<string, string> = {
  personal: "Personal Loan",
  home: "Home Loan",
  auto: "Auto Loan",
  education: "Education Loan",
  business: "Business Loan",
  gold: "Gold Loan",
  medical: "Medical Loan",
};

const CATEGORY_MAP: Record<string, DisplayCategory> = {
  personal: "personal",
  home: "home",
  auto: "car",
  education: "school",
  business: "business",
  gold: "personal",
  medical: "emergency",
};

function hashIndex(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function fmtMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n.toLocaleString()}`;
}

function tenureOptionsFrom(minM: number, maxM: number): number[] {
  const candidates = [3, 6, 12, 24, 36, 48, 60, 72, 84, 120, 180, 240, 360];
  const opts = candidates.filter((m) => m >= minM && m <= maxM);
  return opts.length > 0 ? opts : [minM, maxM];
}

export function mapOffer(api: ApiOffer): DisplayOffer {
  const palette = PALETTE[hashIndex(api.lender, PALETTE.length)];
  return {
    id: api.id,
    bank: api.lender,
    initial: api.lender[0]?.toUpperCase() ?? "?",
    initialBg: palette.bg,
    initialColor: "#fff",
    type: LOAN_TYPE_LABEL[api.loanType] ?? api.loanType,
    category: CATEGORY_MAP[api.loanType] ?? "personal",
    featured: api.featured,
    tag: palette.tag,
    tagColor: palette.tagColor,
    tagBg: palette.tagBg,
    maxAmount: fmtMoney(api.maxAmount),
    loanRange: `$${api.minAmount.toLocaleString()} - $${api.maxAmount.toLocaleString()}`,
    rate: `${api.interestMin.toFixed(2)}% p.a. onwards`,
    rateNum: api.interestMin,
    processingFee: `${api.processingFeePct.toFixed(2)}% onwards`,
    tenure: `${api.tenureMinMonths} - ${api.tenureMaxMonths} months`,
    minAmount: api.minAmount,
    maxAmountNum: api.maxAmount,
    tenureOptions: tenureOptionsFrom(api.tenureMinMonths, api.tenureMaxMonths),
    tenureMinMonths: api.tenureMinMonths,
    tenureMaxMonths: api.tenureMaxMonths,
    interestMin: api.interestMin,
    interestMax: api.interestMax,
    rating: api.rating,
    description: api.description ?? null,
    features: [palette.tag, "Quick Approval", "Trusted Lender"],
    featureIcons: ["percent", "zap", "shield"],
    featureColors: [palette.tagColor, "#10B981", "#F59E0B"],
  };
}
