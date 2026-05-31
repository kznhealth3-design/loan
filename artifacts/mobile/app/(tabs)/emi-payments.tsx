import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useListMyLoans, usePayEmi, getListMyLoansQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type TabId = "due" | "paid" | "all";

const DUE_EMIS = [
  {
    id: "due1",
    loanType: "Home Loan",
    loanId: "HL12345678",
    emiNumber: 21,
    totalEmis: 30,
    dueDate: "May 25, 2024",
    amount: 200.0,
    principal: 150.0,
    interest: 50.0,
    icon: "home" as const,
    iconColor: "#4F46E5",
    iconBg: "#EEF2FF",
    isNext: true,
  },
];

const UPCOMING_EMIS = [
  {
    id: "up1",
    loanType: "Home Loan",
    loanId: "HL12345678",
    emiNumber: 22,
    totalEmis: 30,
    dueDate: "Jun 25, 2024",
    amount: 200.0,
    icon: "home" as const,
    iconColor: "#4F46E5",
    iconBg: "#EEF2FF",
  },
  {
    id: "up2",
    loanType: "Personal Loan",
    loanId: "PL87654321",
    emiNumber: 15,
    totalEmis: 20,
    dueDate: "Jun 10, 2024",
    amount: 50.0,
    icon: "user" as const,
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
  },
  {
    id: "up3",
    loanType: "Home Loan",
    loanId: "HL12345678",
    emiNumber: 23,
    totalEmis: 30,
    dueDate: "Jul 25, 2024",
    amount: 200.0,
    icon: "home" as const,
    iconColor: "#4F46E5",
    iconBg: "#EEF2FF",
  },
  {
    id: "up4",
    loanType: "Personal Loan",
    loanId: "PL87654321",
    emiNumber: 16,
    totalEmis: 20,
    dueDate: "Jul 10, 2024",
    amount: 50.0,
    icon: "user" as const,
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
  },
];

const PAID_EMIS = [
  { id: "p1", loanType: "Home Loan", loanId: "HL12345678", emiNumber: 20, totalEmis: 30, date: "Apr 25, 2024", amount: 200.0, icon: "home" as const, iconColor: "#4F46E5", iconBg: "#EEF2FF" },
  { id: "p2", loanType: "Personal Loan", loanId: "PL87654321", emiNumber: 14, totalEmis: 20, date: "May 10, 2024", amount: 50.0, icon: "user" as const, iconColor: "#10B981", iconBg: "#D1FAE5" },
  { id: "p3", loanType: "Home Loan", loanId: "HL12345678", emiNumber: 19, totalEmis: 30, date: "Mar 25, 2024", amount: 200.0, icon: "home" as const, iconColor: "#4F46E5", iconBg: "#EEF2FF" },
  { id: "p4", loanType: "Personal Loan", loanId: "PL87654321", emiNumber: 13, totalEmis: 20, date: "Apr 10, 2024", amount: 50.0, icon: "user" as const, iconColor: "#10B981", iconBg: "#D1FAE5" },
  { id: "p5", loanType: "Home Loan", loanId: "HL12345678", emiNumber: 18, totalEmis: 30, date: "Feb 25, 2024", amount: 200.0, icon: "home" as const, iconColor: "#4F46E5", iconBg: "#EEF2FF" },
  { id: "p6", loanType: "Personal Loan", loanId: "PL87654321", emiNumber: 12, totalEmis: 20, date: "Mar 10, 2024", amount: 50.0, icon: "user" as const, iconColor: "#10B981", iconBg: "#D1FAE5" },
];

type DueEmi = Omit<typeof DUE_EMIS[0], "icon"> & { icon: "home" | "user" | "credit-card" | "briefcase" | "book" | "truck"; loanId?: string };

function PaymentModal({ emi, onClose, onSuccess }: { emi: DueEmi; onClose: () => void; onSuccess: () => void }) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">("confirm");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [errorMsg, setErrorMsg] = useState("");

  const payEmiMutation = usePayEmi({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyLoansQueryKey() });
        setStep("success");
      },
      onError: (err: any) => {
        setErrorMsg(err?.payload?.error ?? "Payment failed. Please try again.");
        setStep("error");
      },
    },
  });

  const handlePay = () => {
    if (emi.loanId && !emi.loanId.includes("HL") && !emi.loanId.includes("PL")) {
      setStep("processing");
      payEmiMutation.mutate({ data: { loanId: emi.loanId } });
    } else {
      setStep("processing");
      setTimeout(() => setStep("success"), 1800);
    }
  };

  if (step === "success") {
    return (
      <Modal visible animationType="slide" transparent onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={() => {}}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.handle} />
            <View style={styles.successWrap}>
              <View style={styles.successIconWrap}>
                <Feather name="check-circle" size={58} color="#10B981" />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Successful!</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                EMI #{emi.emiNumber} of{" "}<Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{emi.loanType}</Text>{"\n"}
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>$ {emi.amount.toFixed(2)}</Text>{" "}paid successfully.
              </Text>
              <View style={[styles.txnCard, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                <Text style={[styles.txnLabel, { color: colors.mutedForeground }]}>Transaction ID</Text>
                <Text style={[styles.txnValue, { color: colors.foreground }]}>TXN{Date.now().toString().slice(-8)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                onPress={() => { onClose(); onSuccess(); }}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  }

  if (step === "error") {
    return (
      <Modal visible animationType="slide" transparent onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.handle} />
            <View style={styles.successWrap}>
              <View style={[styles.successIconWrap, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="x-circle" size={40} color="#EF4444" />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Failed</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>{errorMsg}</Text>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                onPress={() => setStep("confirm")}
              >
                <Text style={styles.doneBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  }

  const methods = [
    { id: "upi", label: "UPI", icon: "smartphone" },
    { id: "card", label: "Debit / Credit Card", icon: "credit-card" },
    { id: "netbanking", label: "Net Banking", icon: "globe" },
  ] as const;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Pay EMI</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.paymentSummary, { backgroundColor: colors.accent, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.summaryLoanName, { color: colors.foreground }]}>{emi.loanType}</Text>
              <Text style={[styles.summaryLoanId, { color: colors.mutedForeground }]}>EMI #{emi.emiNumber} of {emi.totalEmis}</Text>
              <Text style={[styles.summaryDueDate, { color: colors.mutedForeground }]}>Due: {emi.dueDate}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.summaryLoanId, { color: colors.mutedForeground }]}>Amount</Text>
              <Text style={[styles.summaryAmount, { color: colors.primary }]}>$ {emi.amount.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={[styles.sectionSmall, { color: colors.foreground }]}>Payment Method</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {methods.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.methodRow,
                  { borderColor: method === m.id ? colors.primary : colors.border, backgroundColor: method === m.id ? colors.accent : colors.card },
                ]}
                onPress={() => setMethod(m.id as any)}
              >
                <View style={[styles.methodIconWrap, { backgroundColor: method === m.id ? colors.secondary : colors.muted }]}>
                  <Feather name={m.icon} size={16} color={method === m.id ? colors.primary : colors.mutedForeground} />
                </View>
                <Text style={[styles.methodLabel, { color: colors.foreground }]}>{m.label}</Text>
                <View style={[styles.radio, { borderColor: method === m.id ? colors.primary : colors.border }]}>
                  {method === m.id && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.payActionBtn, { backgroundColor: colors.primary }, step === "processing" && { opacity: 0.7 }]}
            onPress={handlePay}
            disabled={step === "processing"}
          >
            <Text style={styles.payActionText}>
              {step === "processing" ? "Processing..." : `Pay $ ${emi.amount.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
            Secured payment • 256-bit encryption
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function EmiDetailModal({ emi, onClose }: { emi: typeof PAID_EMIS[0] | typeof UPCOMING_EMIS[0]; onClose: () => void }) {
  const colors = useColors();
  const isPaid = "date" in emi;
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>EMI Details</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={[styles.detailHeaderCard, { backgroundColor: emi.iconBg }]}>
            <View style={[styles.detailIconCircle, { backgroundColor: emi.iconBg }]}>
              <Feather name={emi.icon} size={26} color={emi.iconColor} />
            </View>
            <Text style={[styles.detailLoanName, { color: "#1a1a2e" }]}>{emi.loanType}</Text>
            <Text style={[styles.detailLoanId, { color: "#6B7280" }]}>{emi.loanId}</Text>
          </View>
          <View style={{ marginTop: 16, gap: 0 }}>
            {[
              { label: "EMI Number", value: `${emi.emiNumber} of ${emi.totalEmis}` },
              { label: "Amount", value: `$ ${emi.amount.toFixed(2)}` },
              { label: isPaid ? "Paid On" : "Due Date", value: isPaid ? (emi as any).date : (emi as any).dueDate },
              { label: "Status", value: isPaid ? "Paid" : "Upcoming" },
            ].map((row, i) => (
              <View key={i} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.detailValue, { color: isPaid && row.label === "Status" ? "#10B981" : colors.foreground }]}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AutoPayModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [enabled, setEnabled] = useState(false);
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Set Up AutoPay</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={[styles.autoPayIcon, { backgroundColor: "#EEF2FF" }]}>
            <Feather name="shield" size={32} color="#4F46E5" />
          </View>
          <Text style={[styles.autoPayTitle, { color: colors.foreground }]}>Never Miss a Payment</Text>
          <Text style={[styles.autoPaySub, { color: colors.mutedForeground }]}>
            AutoPay automatically deducts your EMI on the due date from your registered bank account — no manual effort required.
          </Text>
          <View style={[styles.autoPayFeature, { backgroundColor: colors.accent, borderColor: colors.border }]}>
            {["Auto-debit on due date", "Protects your credit score", "Free — no extra charges", "Cancel anytime"].map((f, i) => (
              <View key={i} style={styles.autoPayFeatureRow}>
                <Feather name="check" size={14} color="#10B981" />
                <Text style={[styles.autoPayFeatureText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.payActionBtn, { backgroundColor: enabled ? "#10B981" : colors.primary, marginTop: 8 }]}
            onPress={() => {
              setEnabled(true);
              setTimeout(() => {
                onClose();
                Alert.alert("AutoPay Enabled!", "Your EMIs will be auto-debited on the due date.");
              }, 500);
            }}
          >
            <Text style={styles.payActionText}>{enabled ? "AutoPay Enabled ✓" : "Enable AutoPay"}</Text>
          </TouchableOpacity>
          <View style={{ height: 16 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function EmiPaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;

  const { data: loans, isLoading: loansLoading } = useListMyLoans();

  // Derive EMI data from real loans
  const realDueEmis: DueEmi[] = (loans ?? [])
    .filter((l) => l.status === "active" && l.nextDueDate)
    .map((l, idx) => ({
      id: l.id,
      loanId: l.id,
      loanType: "Loan",
      emiNumber: Math.round(l.amountPaid / l.emiAmount) + 1,
      totalEmis: l.tenureMonths,
      dueDate: new Date(l.nextDueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: l.emiAmount,
      principal: parseFloat((l.emiAmount * 0.75).toFixed(2)),
      interest: parseFloat((l.emiAmount * 0.25).toFixed(2)),
      icon: idx % 2 === 0 ? ("home" as const) : ("user" as const),
      iconColor: idx % 2 === 0 ? "#4F46E5" : "#10B981",
      iconBg: idx % 2 === 0 ? "#EEF2FF" : "#D1FAE5",
      isNext: idx === 0,
    }));

  const realUpcomingEmis: typeof UPCOMING_EMIS = (loans ?? [])
    .filter((l) => l.status === "active")
    .flatMap((l, idx) => {
      const baseEmi = Math.round(l.amountPaid / l.emiAmount) + 2;
      return [1, 2].map((offset) => ({
        id: `${l.id}-${offset}`,
        loanType: "Loan",
        loanId: l.id.slice(0, 12).toUpperCase(),
        emiNumber: baseEmi + offset,
        totalEmis: l.tenureMonths,
        dueDate: (() => {
          const d = l.nextDueDate ? new Date(l.nextDueDate) : new Date();
          d.setMonth(d.getMonth() + offset);
          return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        })(),
        amount: l.emiAmount,
        icon: idx % 2 === 0 ? ("home" as const) : ("user" as const),
        iconColor: idx % 2 === 0 ? "#4F46E5" : "#10B981",
        iconBg: idx % 2 === 0 ? "#EEF2FF" : "#D1FAE5",
      }));
    });

  // Build paid EMIs from real loan data
  const realPaidEmis: typeof PAID_EMIS = (loans ?? [])
    .filter((l) => l.status === "active" || l.status === "closed")
    .flatMap((l, idx) => {
      const paidEmis = Math.round(l.amountPaid / (l.emiAmount || 1));
      if (paidEmis <= 0) return [];
      const disbursed = new Date(l.disbursedAt);
      const icon = idx % 2 === 0 ? ("home" as const) : ("user" as const);
      const iconColor = idx % 2 === 0 ? "#4F46E5" : "#10B981";
      const iconBg = idx % 2 === 0 ? "#EEF2FF" : "#D1FAE5";
      return Array.from({ length: paidEmis }, (_, i) => {
        const d = new Date(disbursed);
        d.setMonth(d.getMonth() + i + 1);
        return {
          id: `${l.id}-paid-${i}`,
          loanType: "Loan",
          loanId: l.id.slice(0, 12).toUpperCase(),
          emiNumber: i + 1,
          totalEmis: l.tenureMonths,
          date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          amount: l.emiAmount,
          icon,
          iconColor,
          iconBg,
        };
      });
    });

  const hasRealData = (loans?.length ?? 0) > 0;
  const displayDueEmis  = hasRealData ? realDueEmis  : DUE_EMIS;
  const displayUpcoming = hasRealData ? realUpcomingEmis : UPCOMING_EMIS;
  const displayPaid     = hasRealData ? realPaidEmis : PAID_EMIS;

  // Overview stats
  const totalEmis      = hasRealData ? (loans ?? []).reduce((s, l) => s + l.tenureMonths, 0) : 50;
  const totalPaidEmis  = hasRealData ? (loans ?? []).reduce((s, l) => s + Math.round(l.amountPaid / (l.emiAmount || 1)), 0) : 20;
  const totalPending   = hasRealData ? realDueEmis.length : 1;
  const totalAmtPaid   = hasRealData ? (loans ?? []).reduce((s, l) => s + l.amountPaid, 0) : 7550;

  const [activeTab, setActiveTab] = useState<TabId>("due");
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPaid, setShowAllPaid] = useState(false);
  const [payingEmi, setPayingEmi] = useState<DueEmi | null>(null);
  const [detailEmi, setDetailEmi] = useState<typeof PAID_EMIS[0] | typeof UPCOMING_EMIS[0] | null>(null);
  const [showAutoPay, setShowAutoPay] = useState(false);

  const upcomingVisible = showAllUpcoming ? displayUpcoming : displayUpcoming.slice(0, 2);
  const paidVisible     = showAllPaid     ? displayPaid     : displayPaid.slice(0, 3);

  const tabs: { id: TabId; label: string }[] = [
    { id: "due", label: "Due EMIs" },
    { id: "paid", label: "Paid EMIs" },
    { id: "all", label: "All EMIs" },
  ];

  const renderDueTab = () => (
    <>
      {/* Next EMI Due */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Next EMI Due</Text>
      {displayDueEmis.map((emi) => (
        <View key={emi.id} style={[styles.nextEmiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.nextEmiTop}>
            <View style={[styles.loanIconCircle, { backgroundColor: emi.iconBg }]}>
              <Feather name={emi.icon} size={18} color={emi.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nextEmiLoanName, { color: colors.foreground }]}>{emi.loanType}</Text>
              <Text style={[styles.nextEmiLoanId, { color: colors.mutedForeground }]}>Loan ID: {emi.loanId}</Text>
            </View>
            <View style={{ alignItems: "flex-end", marginRight: 10 }}>
              <Text style={[styles.dueDateLabel, { color: colors.mutedForeground }]}>Due Date</Text>
              <Text style={[styles.dueDateValue, { color: colors.foreground }]}>{emi.dueDate}</Text>
            </View>
            <TouchableOpacity
              style={[styles.payNowBtn, { borderColor: colors.primary }]}
              onPress={() => setPayingEmi(emi)}
              activeOpacity={0.8}
            >
              <Text style={[styles.payNowText, { color: colors.primary }]}>Pay Now</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.emiStatsRow, { borderTopColor: colors.border }]}>
            {[
              { label: "EMI Amount", value: `$${emi.amount.toFixed(2)}` },
              { label: "EMI Number", value: `${emi.emiNumber} of ${emi.totalEmis}` },
              { label: "Principal", value: `$${emi.principal.toFixed(2)}` },
              { label: "Interest", value: `$${emi.interest.toFixed(2)}` },
            ].map((s, i) => (
              <View key={i} style={[styles.emiStat, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                <Text style={[styles.emiStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                <Text style={[styles.emiStatValue, { color: colors.foreground }]}>{s.value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.infoBanner, { backgroundColor: "#EEF2FF" }]}>
            <Feather name="calendar" size={14} color="#4F46E5" style={{ marginTop: 1 }} />
            <Text style={[styles.infoText, { color: "#4F46E5" }]}>
              Pay before {emi.dueDate} to avoid late fees and maintain your credit score.
            </Text>
          </View>
        </View>
      ))}

      {/* Upcoming EMIs */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming EMIs</Text>
      </View>
      <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {upcomingVisible.map((emi, i) => (
          <View key={emi.id}>
            <TouchableOpacity style={styles.emiRow} onPress={() => setDetailEmi(emi)} activeOpacity={0.7}>
              <View style={[styles.emiRowIcon, { backgroundColor: emi.iconBg }]}>
                <Feather name={emi.icon} size={16} color={emi.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emiRowTitle, { color: colors.foreground }]}>{emi.loanType}</Text>
                <Text style={[styles.emiRowSub, { color: colors.mutedForeground }]}>EMI {emi.emiNumber} of {emi.totalEmis}</Text>
              </View>
              <Text style={[styles.emiRowDate, { color: colors.mutedForeground }]}>{emi.dueDate}</Text>
              <Text style={[styles.emiRowAmt, { color: colors.foreground }]}>${emi.amount.toFixed(2)}</Text>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            {i < upcomingVisible.length - 1 && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.viewAllBtn} onPress={() => setShowAllUpcoming(!showAllUpcoming)}>
        <Text style={[styles.viewAllText, { color: colors.primary }]}>
          {showAllUpcoming ? "Show less upcoming EMIs" : "View all upcoming EMIs"}{" "}
          <Feather name={showAllUpcoming ? "chevron-up" : "arrow-right"} size={13} color={colors.primary} />
        </Text>
      </TouchableOpacity>

      {/* Recent Payments */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Payments</Text>
      </View>
      <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {paidVisible.map((emi, i) => (
          <View key={emi.id}>
            <TouchableOpacity style={styles.emiRow} onPress={() => setDetailEmi(emi)} activeOpacity={0.7}>
              <View style={styles.paidCheckCircle}>
                <Feather name="check-circle" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emiRowTitle, { color: colors.foreground }]}>{emi.loanType}</Text>
                <Text style={[styles.emiRowSub, { color: colors.mutedForeground }]}>EMI {emi.emiNumber} of {emi.totalEmis}</Text>
              </View>
              <Text style={[styles.emiRowDate, { color: colors.mutedForeground }]}>{emi.date}</Text>
              <Text style={[styles.emiRowAmt, { color: "#10B981" }]}>${emi.amount.toFixed(2)}</Text>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            {i < paidVisible.length - 1 && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.viewAllBtn} onPress={() => setShowAllPaid(!showAllPaid)}>
        <Text style={[styles.viewAllText, { color: colors.primary }]}>
          {showAllPaid ? "Show less payment history" : "View all payment history"}{" "}
          <Feather name={showAllPaid ? "chevron-up" : "arrow-right"} size={13} color={colors.primary} />
        </Text>
      </TouchableOpacity>

      {/* AutoPay banner */}
      <View style={[styles.autoPayBanner, { backgroundColor: "#4F46E5" }]}>
        <View style={[styles.autoPayBannerIcon, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="shield" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.autoPayBannerTitle}>Set up AutoPay</Text>
          <Text style={styles.autoPayBannerSub}>Never miss an EMI payment. Set up AutoPay and stay stress-free.</Text>
        </View>
        <TouchableOpacity style={styles.autoPayBannerBtn} onPress={() => setShowAutoPay(true)}>
          <Text style={styles.autoPayBannerBtnText}>Set Up{"\n"}AutoPay</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPaidTab = () => (
    <>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment History</Text>
      <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {displayPaid.map((emi, i) => (
          <View key={emi.id}>
            <TouchableOpacity style={styles.emiRow} onPress={() => setDetailEmi(emi)} activeOpacity={0.7}>
              <View style={styles.paidCheckCircle}>
                <Feather name="check-circle" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emiRowTitle, { color: colors.foreground }]}>{emi.loanType}</Text>
                <Text style={[styles.emiRowSub, { color: colors.mutedForeground }]}>EMI {emi.emiNumber} of {emi.totalEmis}</Text>
              </View>
              <Text style={[styles.emiRowDate, { color: colors.mutedForeground }]}>{emi.date}</Text>
              <Text style={[styles.emiRowAmt, { color: "#10B981" }]}>${emi.amount.toFixed(2)}</Text>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            {i < displayPaid.length - 1 && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
      </View>
    </>
  );

  const renderAllTab = () => {
    const allEmis = [
      ...displayDueEmis.map((e) => ({ ...e, kind: "due" as const, displayDate: e.dueDate })),
      ...displayUpcoming.map((e) => ({ ...e, kind: "upcoming" as const, displayDate: e.dueDate })),
      ...displayPaid.map((e) => ({ ...e, kind: "paid" as const, displayDate: e.date })),
    ];
    return (
      <>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All EMIs</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {allEmis.map((emi, i) => (
            <View key={emi.id}>
              <TouchableOpacity
                style={styles.emiRow}
                onPress={() => emi.kind === "due" ? setPayingEmi(emi as any) : setDetailEmi(emi as any)}
                activeOpacity={0.7}
              >
                {emi.kind === "paid" ? (
                  <View style={styles.paidCheckCircle}>
                    <Feather name="check-circle" size={22} color="#10B981" />
                  </View>
                ) : (
                  <View style={[styles.emiRowIcon, { backgroundColor: emi.iconBg }]}>
                    <Feather name={emi.icon} size={16} color={emi.iconColor} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.emiRowTitle, { color: colors.foreground }]}>{emi.loanType}</Text>
                    {emi.kind === "due" && (
                      <View style={styles.dueBadge}>
                        <Text style={styles.dueBadgeText}>Due</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.emiRowSub, { color: colors.mutedForeground }]}>EMI {emi.emiNumber} of {emi.totalEmis}</Text>
                </View>
                <Text style={[styles.emiRowDate, { color: colors.mutedForeground }]}>{emi.displayDate}</Text>
                <Text style={[styles.emiRowAmt, { color: emi.kind === "paid" ? "#10B981" : colors.foreground }]}>
                  ${emi.amount.toFixed(2)}
                </Text>
                <Feather name="chevron-right" size={15} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              {i < allEmis.length - 1 && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>EMI Payments</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>View and manage your EMI payments</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isWeb ? 100 : 90 }}>
        {/* Overview card */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.overviewTitle, { color: colors.foreground }]}>Payment Overview</Text>
            <View style={styles.overviewGrid}>
              {[
                { label: "Total EMIs",        value: String(totalEmis),               icon: "calendar",     iconColor: "#4F46E5", iconBg: "#EEF2FF", sub: null },
                { label: "EMIs Paid",          value: String(totalPaidEmis),           icon: "check-circle", iconColor: "#10B981", iconBg: "#D1FAE5", sub: null },
                { label: "EMIs Pending",       value: String(totalPending),            icon: "clock",        iconColor: "#F59E0B", iconBg: "#FEF3C7", sub: "Due Soon" },
                { label: "Total Amount Paid",  value: `$${totalAmtPaid.toFixed(2)}`,   icon: "dollar-sign",  iconColor: "#3B82F6", iconBg: "#DBEAFE", sub: null },
              ].map((s, i) => (
                <View key={i} style={styles.overviewItem}>
                  <View style={[styles.ovIconWrap, { backgroundColor: s.iconBg }]}>
                    <Feather name={s.icon as any} size={16} color={s.iconColor} />
                  </View>
                  <Text style={[styles.ovLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                  <Text style={[styles.ovValue, { color: colors.foreground }]}>{s.value}</Text>
                  {s.sub && <Text style={[styles.ovSub, { color: "#F59E0B" }]}>{s.sub}</Text>}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, activeTab === t.id && [styles.tabActive, { borderBottomColor: colors.primary }]]}
              onPress={() => setActiveTab(t.id)}
            >
              <Text style={[styles.tabText, { color: activeTab === t.id ? colors.primary : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {activeTab === "due" && renderDueTab()}
          {activeTab === "paid" && renderPaidTab()}
          {activeTab === "all" && renderAllTab()}
        </View>
      </ScrollView>

      {payingEmi && (
        <PaymentModal
          emi={payingEmi}
          onClose={() => setPayingEmi(null)}
          onSuccess={() => {}}
        />
      )}
      {detailEmi && (
        <EmiDetailModal emi={detailEmi} onClose={() => setDetailEmi(null)} />
      )}
      {showAutoPay && (
        <AutoPayModal onClose={() => setShowAutoPay(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  overviewCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 4 },
  overviewTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 14 },
  overviewGrid: { flexDirection: "row", justifyContent: "space-between" },
  overviewItem: { alignItems: "center", flex: 1 },
  ovIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  ovLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 3 },
  ovValue: { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center" },
  ovSub: { fontSize: 10, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: {},
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 4 },
  nextEmiCard: { borderRadius: 14, borderWidth: 1, marginBottom: 4, overflow: "hidden" },
  nextEmiTop: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  loanIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  nextEmiLoanName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextEmiLoanId: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  dueDateLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 2 },
  dueDateValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  payNowBtn: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 },
  payNowText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emiStatsRow: { flexDirection: "row", borderTopWidth: 1, paddingVertical: 12 },
  emiStat: { flex: 1, alignItems: "center" },
  emiStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 3 },
  emiStatValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  infoBanner: { flexDirection: "row", padding: 12, gap: 8, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  listCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  emiRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  emiRowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  emiRowTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 1 },
  emiRowSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emiRowDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginRight: 6 },
  emiRowAmt: { fontSize: 13, fontFamily: "Inter_700Bold" },
  rowDivider: { height: 1, marginLeft: 60 },
  paidCheckCircle: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  viewAllBtn: { alignItems: "center", paddingVertical: 12 },
  viewAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dueBadge: { backgroundColor: "#FEF3C7", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  dueBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#D97706" },
  autoPayBanner: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  autoPayBannerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  autoPayBannerTitle: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  autoPayBannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  autoPayBannerBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: "center" },
  autoPayBannerBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", textAlign: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  paymentSummary: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  summaryLoanName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  summaryLoanId: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  summaryDueDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  summaryAmount: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionSmall: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  methodRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, padding: 12, gap: 12 },
  methodIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  methodLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  payActionBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  payActionText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  disclaimer: { textAlign: "center", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 10 },
  successWrap: { alignItems: "center", paddingVertical: 10 },
  successIconWrap: { marginBottom: 14 },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24, marginBottom: 20 },
  txnCard: { borderRadius: 12, borderWidth: 1, padding: 14, width: "100%", alignItems: "center", marginBottom: 24, gap: 4 },
  txnLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  txnValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  doneBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  detailHeaderCard: { borderRadius: 14, padding: 20, alignItems: "center", gap: 6 },
  detailIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  detailLoanName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  detailLoanId: { fontSize: 12, fontFamily: "Inter_400Regular" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  autoPayIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 14 },
  autoPayTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  autoPaySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  autoPayFeature: { borderRadius: 12, borderWidth: 1, padding: 16, width: "100%", gap: 10, marginBottom: 20 },
  autoPayFeatureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  autoPayFeatureText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
