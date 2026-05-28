import type { Loan as ApiLoanModel } from "@workspace/api-client-react";

export type ApiLoan = ApiLoanModel;

export type DisplayLoan = {
  id: string;
  type: string;
  loanId: string;
  outstanding: number;
  nextEmi: number;
  dueDate: string;
  progress: number;
  paidEmis: number;
  totalEmis: number;
  disbursed: number;
  startDate: string;
  interestRate: string;
  tenure: string;
  amountPaid: number;
  iconColor: string;
  iconBg: string;
  barColor: string;
  icon: "home" | "user" | "truck" | "book" | "briefcase" | "alert-circle" | "credit-card";
  status: "Active" | "Closed" | "Defaulted";
  statusColor: string;
  statusBg: string;
  account: string;
};

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function shortId(id: string, prefix: string): string {
  return `${prefix}${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function mapLoan(api: ApiLoan): DisplayLoan {
  const isClosed = api.status === "closed";
  const isActive = api.status === "active";
  const paid = api.amountPaid;
  const progress = api.totalPayable > 0 ? Math.min(paid / api.totalPayable, 1) : 0;
  const paidEmis =
    api.emiAmount > 0 ? Math.min(Math.round(paid / api.emiAmount), api.tenureMonths) : 0;

  return {
    id: api.id,
    type: "Personal Loan",
    loanId: shortId(api.id, "LN"),
    outstanding: Math.max(api.totalPayable - paid, 0),
    nextEmi: api.emiAmount,
    dueDate: api.nextDueDate ? fmtDate(api.nextDueDate) : "—",
    progress,
    paidEmis,
    totalEmis: api.tenureMonths,
    disbursed: api.principal,
    startDate: fmtDate(api.disbursedAt),
    interestRate: `${api.interestRate.toFixed(2)}% p.a.`,
    tenure: `${api.tenureMonths} months`,
    amountPaid: paid,
    iconColor: "#4F46E5",
    iconBg: "#EEF2FF",
    barColor: isClosed ? "#10B981" : "#4F46E5",
    icon: "credit-card",
    status: isClosed ? "Closed" : isActive ? "Active" : "Defaulted",
    statusColor: isClosed ? "#6B7280" : isActive ? "#059669" : "#DC2626",
    statusBg: isClosed ? "#F3F4F6" : isActive ? "#D1FAE5" : "#FEE2E2",
    account: "•••• 4321",
  };
}
