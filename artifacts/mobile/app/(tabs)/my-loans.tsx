import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
// React.useMemo is referenced below via the default React import.
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useListMyLoans, usePayEmi, getListMyLoansQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { mapLoan, type DisplayLoan } from "@/lib/loanAdapter";

const _LEGACY_ACTIVE_LOANS_REMOVED = [
  {
    id: "1",
    type: "Home Loan",
    loanId: "HL12345678",
    outstanding: 10250.0,
    nextEmi: 200.0,
    dueDate: "May 25, 2024",
    progress: 0.6,
    paidEmis: 20,
    totalEmis: 30,
    disbursed: 18000.0,
    startDate: "Jan 01, 2022",
    interestRate: "8.5% p.a.",
    tenure: "30 months",
    amountPaid: 3750.0,
    iconColor: "#4F46E5",
    iconBg: "#EEF2FF",
    barColor: "#4F46E5",
    icon: "home" as const,
    status: "Active",
    statusColor: "#059669",
    statusBg: "#D1FAE5",
    account: "•••• 5678",
  },
  {
    id: "2",
    type: "Personal Loan",
    loanId: "PL87654321",
    outstanding: 2200.0,
    nextEmi: 50.0,
    dueDate: "Jun 10, 2024",
    progress: 0.8,
    paidEmis: 16,
    totalEmis: 20,
    disbursed: 5000.0,
    startDate: "Apr 01, 2024",
    interestRate: "12.0% p.a.",
    tenure: "20 months",
    amountPaid: 3800.0,
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    barColor: "#10B981",
    icon: "user" as const,
    status: "Active",
    statusColor: "#059669",
    statusBg: "#D1FAE5",
    account: "•••• 4321",
  },
];

const _LEGACY_CLOSED_LOANS_REMOVED = [
  {
    id: "3",
    type: "Car Loan",
    loanId: "CL55512345",
    outstanding: 0.0,
    nextEmi: 0.0,
    dueDate: "—",
    progress: 1.0,
    paidEmis: 36,
    totalEmis: 36,
    disbursed: 8500.0,
    startDate: "Jan 15, 2021",
    interestRate: "9.5% p.a.",
    tenure: "36 months",
    amountPaid: 8500.0,
    iconColor: "#6B7280",
    iconBg: "#F3F4F6",
    barColor: "#10B981",
    icon: "truck" as const,
    status: "Closed",
    statusColor: "#6B7280",
    statusBg: "#F3F4F6",
    account: "•••• 9876",
  },
];

type Loan = DisplayLoan;
void _LEGACY_ACTIVE_LOANS_REMOVED;
void _LEGACY_CLOSED_LOANS_REMOVED;

function OverviewCard({ loans }: { loans: DisplayLoan[] }) {
  const colors = useColors();
  const totalOutstanding = loans.reduce((s, l) => s + l.outstanding, 0);
  const totalLoans = loans.filter((l) => l.status !== "Closed").length;
  const totalEmisPending = loans.filter((l) => l.status === "Active").length;
  const totalAmountPaid = loans.reduce((s, l) => s + l.amountPaid, 0);
  const fmt = (n: number) => `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const stats = [
    { label: "Total Outstanding", value: fmt(totalOutstanding), icon: "file-text", iconColor: "#4F46E5", iconBg: "#EEF2FF" },
    { label: "Active Loans", value: String(totalLoans), icon: "credit-card", iconColor: "#10B981", iconBg: "#D1FAE5" },
    { label: "EMIs Pending", value: String(totalEmisPending), icon: "calendar", iconColor: "#F59E0B", iconBg: "#FEF3C7" },
    { label: "Total Amount Paid", value: fmt(totalAmountPaid), icon: "package", iconColor: "#3B82F6", iconBg: "#DBEAFE" },
  ];
  return (
    <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.overviewGrid}>
        {stats.map((s, i) => (
          <View key={i} style={[styles.overviewItem, i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border }, i % 2 === 0 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
            <View style={[styles.overviewIcon, { backgroundColor: s.iconBg }]}>
              <Feather name={s.icon as any} size={16} color={s.iconColor} />
            </View>
            <Text style={[styles.overviewLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            <Text style={[styles.overviewValue, { color: colors.foreground }]}>{s.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LoanDetailsModal({ loan, onClose }: { loan: Loan; onClose: () => void }) {
  const colors = useColors();
  const rows = [
    { label: "Loan ID", value: loan.loanId },
    { label: "Loan Amount", value: `$ ${loan.disbursed.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Outstanding Amount", value: `$ ${loan.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Interest Rate", value: loan.interestRate },
    { label: "Tenure", value: loan.tenure },
    { label: "Start Date", value: loan.startDate },
    { label: "Next EMI Date", value: loan.dueDate },
    { label: "Next EMI Amount", value: `$ ${loan.nextEmi.toFixed(2)}` },
    { label: "EMIs Paid", value: `${loan.paidEmis} of ${loan.totalEmis}` },
    { label: "Total Amount Paid", value: `$ ${loan.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Linked Account", value: loan.account },
    { label: "Status", value: loan.status },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{loan.type} Details</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={[styles.loanDetailsBadge, { backgroundColor: loan.statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: loan.statusColor }]} />
            <Text style={[styles.loanDetailsBadgeText, { color: loan.statusColor }]}>{loan.status}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
            {rows.map((row, i) => (
              <View key={i} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MakePaymentModal({ loan, onClose, onSuccess }: { loan: Loan; onClose: () => void; onSuccess: () => void }) {
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
    setStep("processing");
    payEmiMutation.mutate({ data: { loanId: loan.id } });
  };

  if (step === "success") {
    return (
      <Modal visible animationType="slide" transparent onRequestClose={onClose}>
        <Pressable style={styles.modalOverlay} onPress={() => {}}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Feather name="check-circle" size={56} color="#10B981" />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Successful!</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                Your EMI of{" "}
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                  $ {loan.nextEmi.toFixed(2)}
                </Text>{" "}
                for {loan.type} has been paid.
              </Text>
              <View style={[styles.successCard, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                <Text style={[styles.successCardLabel, { color: colors.mutedForeground }]}>Transaction ID</Text>
                <Text style={[styles.successCardValue, { color: colors.foreground }]}>TXN{Date.now().toString().slice(-8)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.successBtn, { backgroundColor: colors.primary }]}
                onPress={() => { onClose(); onSuccess(); }}
              >
                <Text style={styles.successBtnText}>Done</Text>
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
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: "#FEE2E2", borderRadius: 40, width: 80, height: 80, alignItems: "center", justifyContent: "center" }]}>
                <Feather name="x-circle" size={40} color="#EF4444" />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Failed</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>{errorMsg}</Text>
              <TouchableOpacity
                style={[styles.successBtn, { backgroundColor: colors.primary }]}
                onPress={() => setStep("confirm")}
              >
                <Text style={styles.successBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  }

  const payMethods = [
    { id: "upi", label: "UPI", icon: "smartphone" },
    { id: "card", label: "Debit/Credit Card", icon: "credit-card" },
    { id: "netbanking", label: "Net Banking", icon: "globe" },
  ] as const;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Make Payment</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.paymentSummary, { backgroundColor: colors.accent, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.paymentSummaryLabel, { color: colors.mutedForeground }]}>{loan.type}</Text>
              <Text style={[styles.paymentSummaryId, { color: colors.mutedForeground }]}>Loan ID: {loan.loanId}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.paymentSummaryLabel, { color: colors.mutedForeground }]}>EMI Amount</Text>
              <Text style={[styles.paymentSummaryAmount, { color: colors.primary }]}>
                $ {loan.nextEmi.toFixed(2)}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionSmallTitle, { color: colors.foreground }]}>Payment Method</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {payMethods.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.methodRow,
                  { borderColor: method === m.id ? colors.primary : colors.border, backgroundColor: method === m.id ? colors.accent : colors.card },
                ]}
                onPress={() => setMethod(m.id as any)}
              >
                <View style={[styles.methodIcon, { backgroundColor: method === m.id ? colors.secondary : colors.muted }]}>
                  <Feather name={m.icon} size={16} color={method === m.id ? colors.primary : colors.mutedForeground} />
                </View>
                <Text style={[styles.methodLabel, { color: colors.foreground }]}>{m.label}</Text>
                <View style={[styles.radioOuter, { borderColor: method === m.id ? colors.primary : colors.border }]}>
                  {method === m.id && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: colors.primary }, step === "processing" && { opacity: 0.7 }]}
            onPress={handlePay}
            disabled={step === "processing"}
          >
            {step === "processing" ? (
              <Text style={styles.payBtnText}>Processing...</Text>
            ) : (
              <Text style={styles.payBtnText}>Pay $ {loan.nextEmi.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.payDisclaimer, { color: colors.mutedForeground }]}>
            Secured payment • 256-bit encryption
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function LoanCard({ loan, onDetails, onPay }: { loan: Loan; onDetails: () => void; onPay: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.loanCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.loanIconCircle, { backgroundColor: loan.iconBg }]}>
          <Feather name={loan.icon} size={20} color={loan.iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.loanType, { color: colors.foreground }]}>{loan.type}</Text>
            <View style={[styles.badge, { backgroundColor: loan.statusBg }]}>
              <Text style={[styles.badgeText, { color: loan.statusColor }]}>{loan.status}</Text>
            </View>
          </View>
          <Text style={[styles.loanId, { color: colors.mutedForeground }]}>Loan ID: {loan.loanId}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Outstanding Amount</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            $ {loan.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Next EMI</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>$ {loan.nextEmi.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Next EMI Date</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{loan.dueDate}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>EMI Progress</Text>
          <Text style={[styles.progressCount, { color: colors.mutedForeground }]}>
            {loan.paidEmis} of {loan.totalEmis} EMIs Paid
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { width: `${loan.progress * 100}%` as any, backgroundColor: loan.barColor }]} />
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.detailsBtn, { borderColor: loan.iconColor }]}
          onPress={onDetails}
          activeOpacity={0.7}
        >
          <Text style={[styles.detailsBtnText, { color: loan.iconColor }]}>Loan Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.payBtn2, { backgroundColor: loan.barColor }]}
          onPress={onPay}
          activeOpacity={0.7}
          disabled={loan.status === "Closed"}
        >
          <Text style={styles.payBtn2Text}>Make Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MyLoansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;

  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [detailsLoan, setDetailsLoan] = useState<Loan | null>(null);
  const [payLoan, setPayLoan] = useState<Loan | null>(null);

  const { data: loansData, isLoading: loansLoading, isError: loansIsError, error: loansError, refetch: loansRefetch } = useListMyLoans();
  const all = React.useMemo(
    () => (loansData ?? []).map(mapLoan),
    [loansData],
  );
  const activeAll = React.useMemo(() => all.filter((l) => l.status !== "Closed"), [all]);
  const closedAll = React.useMemo(() => all.filter((l) => l.status === "Closed"), [all]);
  const loans = activeTab === "active" ? activeAll : closedAll;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Loans</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isWeb ? 100 : 90 }}
      >
        <View style={{ padding: 16, gap: 0 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 10 }]}>Overview</Text>
          <OverviewCard loans={all} />
        </View>

        <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && [styles.tabActive, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab("active")}
          >
            <Text style={[styles.tabText, { color: activeTab === "active" ? colors.primary : colors.mutedForeground }]}>
              Active Loans ({activeAll.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "closed" && [styles.tabActive, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab("closed")}
          >
            <Text style={[styles.tabText, { color: activeTab === "closed" ? colors.primary : colors.mutedForeground }]}>
              Closed Loans ({closedAll.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {loansLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 14 }}>Loading your loans…</Text>
            </View>
          ) : loansIsError ? (
            <View style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
                <Feather name="alert-circle" size={26} color="#EF4444" />
              </View>
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 15 }}>
                {(loansError as any)?.status === 401 ? "Please log in" : "Could not load loans"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: "center" }}>
                {(loansError as any)?.status === 401
                  ? "Sign in to view your loans and applications."
                  : "Check your connection and try again."}
              </Text>
              <TouchableOpacity
                style={{ marginTop: 4, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 9 }}
                onPress={() => loansRefetch()}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                  {(loansError as any)?.status === 401 ? "Log in" : "Retry"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : loans.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" }}>
                <Feather name="inbox" size={26} color="#4F46E5" />
              </View>
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 15 }}>
                {activeTab === "active" ? "No active loans" : "No closed loans"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: "center" }}>
                {activeTab === "active" ? "Apply for a loan below to get started." : "Your paid-off loans will appear here."}
              </Text>
            </View>
          ) : (
            loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onDetails={() => setDetailsLoan(loan)}
                onPay={() => loan.status !== "Closed" && setPayLoan(loan)}
              />
            ))
          )}
        </View>

        <View style={[styles.newLoanBanner, { backgroundColor: "#EEF2FF", marginHorizontal: 16, borderColor: "#C7D2FE" }]}>
          <View style={[styles.newLoanIconWrap, { backgroundColor: "#E0E7FF" }]}>
            <Feather name="plus-circle" size={22} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.newLoanTitle, { color: "#1a1a2e" }]}>Need a new loan?</Text>
            <Text style={[styles.newLoanSub, { color: "#6B7280" }]}>Check your eligibility in just a few minutes.</Text>
          </View>
          <TouchableOpacity
            style={[styles.eligibilityBtn, { backgroundColor: "#4F46E5" }]}
            onPress={() => Alert.alert("Check Eligibility", "You are pre-approved for a Personal Loan up to $50,000 at 10.5% p.a. Tap Apply to proceed.", [{ text: "Apply Now", style: "default" }, { text: "Cancel", style: "cancel" }])}
          >
            <Text style={styles.eligibilityBtnText}>Check{"\n"}Eligibility</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {detailsLoan && (
        <LoanDetailsModal loan={detailsLoan} onClose={() => setDetailsLoan(null)} />
      )}
      {payLoan && (
        <MakePaymentModal
          loan={payLoan}
          onClose={() => setPayLoan(null)}
          onSuccess={() => Alert.alert("Thank you!", "Your payment has been recorded.")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  overviewCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 4 },
  overviewGrid: { flexDirection: "row", flexWrap: "wrap" },
  overviewItem: { width: "50%", padding: 14, gap: 6 },
  overviewIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  overviewLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  overviewValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 13, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: {},
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  loanCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  loanIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  loanType: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  loanId: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginBottom: 12 },
  statsRow: { flexDirection: "row", marginBottom: 14, gap: 4 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 3 },
  statValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  progressSection: { marginBottom: 14 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  progressCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 7, borderRadius: 4 },
  actionRow: { flexDirection: "row", gap: 10 },
  detailsBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  detailsBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  payBtn2: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  payBtn2Text: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  newLoanBanner: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  newLoanIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  newLoanTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  newLoanSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  eligibilityBtn: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: "center" },
  eligibilityBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%", minHeight: 300 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  loanDetailsBadge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  loanDetailsBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  paymentSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 18 },
  paymentSummaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  paymentSummaryId: { fontSize: 11, fontFamily: "Inter_400Regular" },
  paymentSummaryAmount: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sectionSmallTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  methodRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, padding: 12, gap: 12 },
  methodIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  methodLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  payBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  payBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  payDisclaimer: { textAlign: "center", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 10 },
  successContainer: { alignItems: "center", paddingVertical: 16, paddingHorizontal: 8 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  successCard: { borderRadius: 12, borderWidth: 1, padding: 14, width: "100%", alignItems: "center", marginBottom: 24, gap: 4 },
  successCardLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  successCardValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  successBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48, alignItems: "center" },
  successBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
