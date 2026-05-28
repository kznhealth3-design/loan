import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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

type Category = "all" | "personal" | "home" | "car" | "school" | "business" | "emergency";
type SortOption = "recommended" | "rate_low" | "amount_high" | "fee_low";

const ALL_OFFERS = [
  // Personal Loan
  {
    id: "1", bank: "Finstar Bank", initial: "F", initialBg: "#10B981",
    type: "Personal Loan", category: "personal" as Category,
    featured: true, tag: "Best Interest", tagColor: "#10B981", tagBg: "#D1FAE5",
    maxAmount: "$50,000", loanRange: "$1,000 - $50,000",
    rate: "8.49% p.a. onwards", processingFee: "1.00% onwards", tenure: "6 - 60 months",
    features: ["Low Interest", "Quick Approval", "Trusted Lender"],
    featureIcons: ["percent", "zap", "shield"] as const,
    featureColors: ["#4F46E5", "#10B981", "#F59E0B"],
    minAmount: 1000, maxAmountNum: 50000, tenureOptions: [12, 24, 36, 48, 60], rateNum: 8.49,
  },
  {
    id: "2", bank: "Ace Finance", initial: "A", initialBg: "#EF4444",
    type: "Personal Loan", category: "personal" as Category,
    featured: true, tag: "Quick Approval", tagColor: "#3B82F6", tagBg: "#DBEAFE",
    maxAmount: "$40,000", loanRange: "$1,000 - $40,000",
    rate: "9.25% p.a. onwards", processingFee: "1.25% onwards", tenure: "6 - 48 months",
    features: ["Quick Approval", "Trusted Lender", "Flexible Tenure"],
    featureIcons: ["zap", "shield", "calendar"] as const,
    featureColors: ["#10B981", "#F59E0B", "#3B82F6"],
    minAmount: 1000, maxAmountNum: 40000, tenureOptions: [12, 24, 36, 48], rateNum: 9.25,
  },
  {
    id: "3", bank: "PrimeLend", initial: "P", initialBg: "#4F46E5",
    type: "Personal Loan", category: "personal" as Category,
    featured: false, tag: "Low Processing Fee", tagColor: "#D97706", tagBg: "#FEF3C7",
    maxAmount: "$30,000", loanRange: "$1,000 - $30,000",
    rate: "10.49% p.a. onwards", processingFee: "1.50% onwards", tenure: "6 - 36 months",
    features: ["Low Processing Fee", "Trusted Lender", "Fast Disbursal"],
    featureIcons: ["percent", "shield", "clock"] as const,
    featureColors: ["#4F46E5", "#F59E0B", "#3B82F6"],
    minAmount: 1000, maxAmountNum: 30000, tenureOptions: [12, 24, 36], rateNum: 10.49,
  },
  {
    id: "4", bank: "MoneyPlus", initial: "M", initialBg: "#0EA5E9",
    type: "Personal Loan", category: "personal" as Category,
    featured: false, tag: "Low Interest", tagColor: "#10B981", tagBg: "#D1FAE5",
    maxAmount: "$20,000", loanRange: "$1,000 - $20,000",
    rate: "11.99% p.a. onwards", processingFee: "1.99% onwards", tenure: "6 - 24 months",
    features: ["Quick Approval", "Low Interest", "Trusted Lender"],
    featureIcons: ["zap", "percent", "shield"] as const,
    featureColors: ["#10B981", "#4F46E5", "#F59E0B"],
    minAmount: 1000, maxAmountNum: 20000, tenureOptions: [6, 12, 24], rateNum: 11.99,
  },
  // Home Loan
  {
    id: "5", bank: "HomeFirst", initial: "H", initialBg: "#4F46E5",
    type: "Home Loan", category: "home" as Category,
    featured: true, tag: "Best Rate", tagColor: "#10B981", tagBg: "#D1FAE5",
    maxAmount: "$500,000", loanRange: "$50,000 - $500,000",
    rate: "7.99% p.a. onwards", processingFee: "0.50% onwards", tenure: "60 - 360 months",
    features: ["Low Interest", "Trusted Lender", "Fast Disbursal"],
    featureIcons: ["percent", "shield", "clock"] as const,
    featureColors: ["#4F46E5", "#F59E0B", "#3B82F6"],
    minAmount: 50000, maxAmountNum: 500000, tenureOptions: [60, 120, 180, 240, 360], rateNum: 7.99,
  },
  {
    id: "6", bank: "NestLoans", initial: "N", initialBg: "#8B5CF6",
    type: "Home Loan", category: "home" as Category,
    featured: false, tag: "Quick Approval", tagColor: "#3B82F6", tagBg: "#DBEAFE",
    maxAmount: "$350,000", loanRange: "$30,000 - $350,000",
    rate: "8.25% p.a. onwards", processingFee: "0.75% onwards", tenure: "36 - 300 months",
    features: ["Quick Approval", "Trusted Lender", "Flexible Tenure"],
    featureIcons: ["zap", "shield", "calendar"] as const,
    featureColors: ["#10B981", "#F59E0B", "#3B82F6"],
    minAmount: 30000, maxAmountNum: 350000, tenureOptions: [60, 120, 180, 240, 300], rateNum: 8.25,
  },
  {
    id: "7", bank: "DreamHomes", initial: "D", initialBg: "#F59E0B",
    type: "Home Loan", category: "home" as Category,
    featured: false, tag: "Low Processing", tagColor: "#D97706", tagBg: "#FEF3C7",
    maxAmount: "$400,000", loanRange: "$25,000 - $400,000",
    rate: "8.75% p.a. onwards", processingFee: "0.25% onwards", tenure: "24 - 360 months",
    features: ["Low Processing Fee", "Trusted Lender", "Doorstep Service"],
    featureIcons: ["percent", "shield", "home"] as const,
    featureColors: ["#4F46E5", "#F59E0B", "#EF4444"],
    minAmount: 25000, maxAmountNum: 400000, tenureOptions: [60, 120, 180, 240, 360], rateNum: 8.75,
  },
  // Car Loan
  {
    id: "8", bank: "AutoFin", initial: "A", initialBg: "#3B82F6",
    type: "Car Loan", category: "car" as Category,
    featured: true, tag: "0% Down Payment", tagColor: "#10B981", tagBg: "#D1FAE5",
    maxAmount: "$80,000", loanRange: "$5,000 - $80,000",
    rate: "7.50% p.a. onwards", processingFee: "0.75% onwards", tenure: "12 - 84 months",
    features: ["0% Down Payment", "Quick Approval", "Trusted Lender"],
    featureIcons: ["credit-card", "zap", "shield"] as const,
    featureColors: ["#4F46E5", "#10B981", "#F59E0B"],
    minAmount: 5000, maxAmountNum: 80000, tenureOptions: [12, 24, 36, 48, 60, 84], rateNum: 7.50,
  },
  {
    id: "9", bank: "DriveNow", initial: "D", initialBg: "#EF4444",
    type: "Car Loan", category: "car" as Category,
    featured: false, tag: "Quick Disbursal", tagColor: "#3B82F6", tagBg: "#DBEAFE",
    maxAmount: "$60,000", loanRange: "$3,000 - $60,000",
    rate: "8.99% p.a. onwards", processingFee: "1.00% onwards", tenure: "12 - 72 months",
    features: ["Quick Disbursal", "Low Processing Fee", "Flexible Tenure"],
    featureIcons: ["clock", "percent", "calendar"] as const,
    featureColors: ["#3B82F6", "#4F46E5", "#F59E0B"],
    minAmount: 3000, maxAmountNum: 60000, tenureOptions: [12, 24, 36, 48, 60, 72], rateNum: 8.99,
  },
  {
    id: "10", bank: "WheelCredit", initial: "W", initialBg: "#10B981",
    type: "Car Loan", category: "car" as Category,
    featured: false, tag: "Best Rate", tagColor: "#10B981", tagBg: "#D1FAE5",
    maxAmount: "$100,000", loanRange: "$10,000 - $100,000",
    rate: "7.25% p.a. onwards", processingFee: "0.50% onwards", tenure: "24 - 84 months",
    features: ["Best Rate", "Trusted Lender", "Fast Approval"],
    featureIcons: ["trending-down", "shield", "zap"] as const,
    featureColors: ["#10B981", "#F59E0B", "#4F46E5"],
    minAmount: 10000, maxAmountNum: 100000, tenureOptions: [24, 36, 48, 60, 84], rateNum: 7.25,
  },
  // School / Education Loan
  {
    id: "11", bank: "EduFund", initial: "E", initialBg: "#8B5CF6",
    type: "School Loan", category: "school" as Category,
    featured: true, tag: "0% During Study", tagColor: "#8B5CF6", tagBg: "#EDE9FE",
    maxAmount: "$100,000", loanRange: "$1,000 - $100,000",
    rate: "6.99% p.a. onwards", processingFee: "0.50% onwards", tenure: "12 - 120 months",
    features: ["0% During Study", "Trusted Lender", "Quick Approval"],
    featureIcons: ["book", "shield", "zap"] as const,
    featureColors: ["#8B5CF6", "#F59E0B", "#10B981"],
    minAmount: 1000, maxAmountNum: 100000, tenureOptions: [12, 24, 36, 60, 84, 120], rateNum: 6.99,
  },
  {
    id: "12", bank: "LearnFirst", initial: "L", initialBg: "#F59E0B",
    type: "School Loan", category: "school" as Category,
    featured: false, tag: "Low Interest", tagColor: "#10B981", tagBg: "#D1FAE5",
    maxAmount: "$75,000", loanRange: "$500 - $75,000",
    rate: "7.50% p.a. onwards", processingFee: "Nil", tenure: "6 - 84 months",
    features: ["Low Interest", "Zero Processing Fee", "Flexible Repayment"],
    featureIcons: ["percent", "gift", "calendar"] as const,
    featureColors: ["#4F46E5", "#10B981", "#3B82F6"],
    minAmount: 500, maxAmountNum: 75000, tenureOptions: [12, 24, 36, 48, 60, 84], rateNum: 7.50,
  },
  {
    id: "13", bank: "ScholarsEdge", initial: "S", initialBg: "#4F46E5",
    type: "School Loan", category: "school" as Category,
    featured: false, tag: "Instant Approval", tagColor: "#3B82F6", tagBg: "#DBEAFE",
    maxAmount: "$50,000", loanRange: "$500 - $50,000",
    rate: "8.25% p.a. onwards", processingFee: "0.25% onwards", tenure: "12 - 60 months",
    features: ["Instant Approval", "Trusted Lender", "Doorstep Service"],
    featureIcons: ["zap", "shield", "home"] as const,
    featureColors: ["#10B981", "#F59E0B", "#EF4444"],
    minAmount: 500, maxAmountNum: 50000, tenureOptions: [12, 24, 36, 48, 60], rateNum: 8.25,
  },
  // Business Loan
  {
    id: "14", bank: "BizGrow", initial: "B", initialBg: "#8B5CF6",
    type: "Business Loan", category: "business" as Category,
    featured: true, tag: "Quick Funds", tagColor: "#3B82F6", tagBg: "#DBEAFE",
    maxAmount: "$200,000", loanRange: "$5,000 - $200,000",
    rate: "11.50% p.a. onwards", processingFee: "1.50% onwards", tenure: "12 - 84 months",
    features: ["Quick Approval", "Flexible Tenure", "Trusted Lender"],
    featureIcons: ["zap", "calendar", "shield"] as const,
    featureColors: ["#10B981", "#3B82F6", "#F59E0B"],
    minAmount: 5000, maxAmountNum: 200000, tenureOptions: [12, 24, 36, 48, 60, 84], rateNum: 11.50,
  },
  {
    id: "15", bank: "VentureX", initial: "V", initialBg: "#EF4444",
    type: "Business Loan", category: "business" as Category,
    featured: false, tag: "Low Processing", tagColor: "#D97706", tagBg: "#FEF3C7",
    maxAmount: "$150,000", loanRange: "$10,000 - $150,000",
    rate: "12.99% p.a. onwards", processingFee: "0.99% onwards", tenure: "12 - 60 months",
    features: ["Low Processing Fee", "Quick Disbursal", "Trusted Lender"],
    featureIcons: ["percent", "clock", "shield"] as const,
    featureColors: ["#4F46E5", "#3B82F6", "#F59E0B"],
    minAmount: 10000, maxAmountNum: 150000, tenureOptions: [12, 24, 36, 48, 60], rateNum: 12.99,
  },
  {
    id: "16", bank: "EnterpriseBank", initial: "E", initialBg: "#10B981",
    type: "Business Loan", category: "business" as Category,
    featured: false, tag: "Competitive Rates", tagColor: "#7C3AED", tagBg: "#EDE9FE",
    maxAmount: "$500,000", loanRange: "$25,000 - $500,000",
    rate: "10.99% p.a. onwards", processingFee: "1.25% onwards", tenure: "24 - 120 months",
    features: ["Competitive Rates", "High Limit", "Trusted Lender"],
    featureIcons: ["trending-up", "dollar-sign", "shield"] as const,
    featureColors: ["#7C3AED", "#10B981", "#F59E0B"],
    minAmount: 25000, maxAmountNum: 500000, tenureOptions: [24, 36, 48, 60, 84, 120], rateNum: 10.99,
  },
  // Emergency Loan
  {
    id: "17", bank: "QuickCash", initial: "Q", initialBg: "#EF4444",
    type: "Emergency Loan", category: "emergency" as Category,
    featured: true, tag: "Instant Funds", tagColor: "#EF4444", tagBg: "#FEE2E2",
    maxAmount: "$10,000", loanRange: "$500 - $10,000",
    rate: "14.99% p.a. onwards", processingFee: "2.00% onwards", tenure: "3 - 24 months",
    features: ["Instant Disbursal", "Minimal Docs", "24/7 Available"],
    featureIcons: ["zap", "file-text", "clock"] as const,
    featureColors: ["#EF4444", "#10B981", "#3B82F6"],
    minAmount: 500, maxAmountNum: 10000, tenureOptions: [3, 6, 12, 18, 24], rateNum: 14.99,
  },
  {
    id: "18", bank: "RapidFunds", initial: "R", initialBg: "#F59E0B",
    type: "Emergency Loan", category: "emergency" as Category,
    featured: false, tag: "Same Day Transfer", tagColor: "#3B82F6", tagBg: "#DBEAFE",
    maxAmount: "$15,000", loanRange: "$1,000 - $15,000",
    rate: "16.50% p.a. onwards", processingFee: "1.75% onwards", tenure: "3 - 18 months",
    features: ["Same Day Transfer", "No Collateral", "Trusted Lender"],
    featureIcons: ["clock", "unlock", "shield"] as const,
    featureColors: ["#3B82F6", "#EF4444", "#F59E0B"],
    minAmount: 1000, maxAmountNum: 15000, tenureOptions: [3, 6, 12, 18], rateNum: 16.50,
  },
  {
    id: "19", bank: "SwiftRelief", initial: "S", initialBg: "#10B981",
    type: "Emergency Loan", category: "emergency" as Category,
    featured: false, tag: "Low Interest", tagColor: "#10B981", tagBg: "#D1FAE5",
    maxAmount: "$20,000", loanRange: "$500 - $20,000",
    rate: "13.99% p.a. onwards", processingFee: "1.50% onwards", tenure: "6 - 36 months",
    features: ["Low Interest", "Quick Approval", "Flexible Repayment"],
    featureIcons: ["percent", "zap", "calendar"] as const,
    featureColors: ["#10B981", "#4F46E5", "#3B82F6"],
    minAmount: 500, maxAmountNum: 20000, tenureOptions: [6, 12, 18, 24, 36], rateNum: 13.99,
  },
];

type Offer = typeof ALL_OFFERS[0];

const CATEGORIES: { id: Category; label: string; icon: string; color: string; bg: string }[] = [
  { id: "all",       label: "All Offers",    icon: "grid",       color: "#4F46E5", bg: "#EEF2FF" },
  { id: "personal",  label: "Personal Loan", icon: "user",       color: "#10B981", bg: "#D1FAE5" },
  { id: "home",      label: "Home Loan",     icon: "home",       color: "#3B82F6", bg: "#DBEAFE" },
  { id: "car",       label: "Car Loan",      icon: "truck",      color: "#EF4444", bg: "#FEE2E2" },
  { id: "school",    label: "School Loan",   icon: "book",       color: "#8B5CF6", bg: "#EDE9FE" },
  { id: "business",  label: "Business Loan", icon: "briefcase",  color: "#F59E0B", bg: "#FEF3C7" },
  { id: "emergency", label: "Emergency Loan",icon: "alert-circle",color: "#EF4444", bg: "#FEE2E2" },
];

// ─── Apply Modal ─────────────────────────────────────────────────────────────
function ApplyModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const colors = useColors();
  const [step, setStep] = useState<"form" | "review" | "processing" | "success">("form");
  const [amount, setAmount] = useState(String(Math.min(10000, offer.maxAmountNum)));
  const [tenure, setTenure] = useState(offer.tenureOptions[Math.floor(offer.tenureOptions.length / 2)]);

  const emi = useMemo(() => {
    const p = parseFloat(amount) || 0;
    const r = offer.rateNum / 12 / 100;
    const n = tenure;
    if (!p || !r || !n) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [amount, tenure, offer.rateNum]);

  const submit = () => {
    const val = parseFloat(amount);
    if (!val || val < offer.minAmount) { Alert.alert("Invalid Amount", `Minimum is $${offer.minAmount.toLocaleString()}`); return; }
    if (val > offer.maxAmountNum) { Alert.alert("Invalid Amount", `Maximum is ${offer.maxAmount}`); return; }
    setStep("review");
  };

  const confirm = () => { setStep("processing"); setTimeout(() => setStep("success"), 2000); };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={s.handle} />
          <View style={s.modalHeader}>
            <View>
              <Text style={[s.modalTitle, { color: colors.foreground }]}>{offer.bank}</Text>
              <Text style={[s.modalSub, { color: colors.mutedForeground }]}>{offer.type}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {step === "form" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[s.fieldLabel, { color: colors.foreground }]}>Loan Amount</Text>
              <View style={[s.inputRow, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                <Text style={[s.prefix, { color: colors.mutedForeground }]}>$</Text>
                <TextInput style={[s.input, { color: colors.foreground }]} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor={colors.mutedForeground} />
              </View>
              <Text style={[s.hint, { color: colors.mutedForeground }]}>Range: {offer.loanRange}</Text>

              <Text style={[s.fieldLabel, { color: colors.foreground, marginTop: 14 }]}>Tenure (months)</Text>
              <View style={s.chipRow}>
                {offer.tenureOptions.map((t) => (
                  <TouchableOpacity key={t} style={[s.tenureChip, { borderColor: tenure === t ? "#4F46E5" : colors.border, backgroundColor: tenure === t ? "#EEF2FF" : colors.card }]} onPress={() => setTenure(t)}>
                    <Text style={[s.tenureChipText, { color: tenure === t ? "#4F46E5" : colors.mutedForeground }]}>{t}m</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[s.emiBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={[s.hint, { color: "#6B7280" }]}>Estimated Monthly EMI</Text>
                <Text style={[s.emiValue, { color: "#4F46E5" }]}>${isNaN(emi) ? "—" : emi.toFixed(2)}</Text>
                <Text style={[s.hint, { color: "#6B7280" }]}>at {offer.rate}</Text>
              </View>

              <View style={[s.twoCell, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                {[{ label: "Interest Rate", value: offer.rate }, { label: "Processing Fee", value: offer.processingFee }].map((r, i) => (
                  <View key={i} style={[s.cell, i === 1 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                    <Text style={[s.cellLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                    <Text style={[s.cellValue, { color: colors.foreground }]}>{r.value}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[s.primaryBtn, { backgroundColor: "#4F46E5", marginTop: 18 }]} onPress={submit}>
                <Text style={s.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          )}

          {step === "review" && (
            <>
              <Text style={[s.hint, { color: colors.mutedForeground, marginBottom: 12 }]}>Review your application</Text>
              {[
                { label: "Lender", value: offer.bank },
                { label: "Loan Type", value: offer.type },
                { label: "Loan Amount", value: `$${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Tenure", value: `${tenure} months` },
                { label: "Interest Rate", value: offer.rate },
                { label: "Processing Fee", value: offer.processingFee },
                { label: "Est. Monthly EMI", value: `$${emi.toFixed(2)}` },
              ].map((r, i) => (
                <View key={i} style={[s.reviewRow, { borderBottomColor: colors.border }]}>
                  <Text style={[s.reviewLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                  <Text style={[s.reviewValue, { color: colors.foreground }]}>{r.value}</Text>
                </View>
              ))}
              <View style={s.rowBtns}>
                <TouchableOpacity style={[s.ghostBtn, { borderColor: colors.border }]} onPress={() => setStep("form")}>
                  <Text style={[s.ghostBtnText, { color: colors.foreground }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.primaryBtn, { flex: 1, backgroundColor: "#4F46E5" }]} onPress={confirm}>
                  <Text style={s.primaryBtnText}>Confirm & Apply</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {(step === "processing" || step === "success") && (
            <View style={s.centerState}>
              <View style={[s.stateIcon, { backgroundColor: step === "success" ? "#D1FAE5" : "#EEF2FF" }]}>
                <Feather name={step === "success" ? "check-circle" : "loader"} size={36} color={step === "success" ? "#10B981" : "#4F46E5"} />
              </View>
              <Text style={[s.stateTitle, { color: colors.foreground }]}>{step === "success" ? "Application Submitted!" : "Submitting..."}</Text>
              {step === "success" ? (
                <>
                  <Text style={[s.stateSub, { color: colors.mutedForeground }]}>
                    Your application to <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{offer.bank}</Text> has been submitted successfully.
                  </Text>
                  <View style={[s.refCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                    <Text style={[s.hint, { color: "#6B7280" }]}>Application Reference</Text>
                    <Text style={[s.refNo, { color: "#4F46E5" }]}>APP{Date.now().toString().slice(-8)}</Text>
                    <Text style={[s.hint, { color: "#6B7280" }]}>You'll hear back within 24–48 hours.</Text>
                  </View>
                  <TouchableOpacity style={[s.primaryBtn, { backgroundColor: "#4F46E5", width: "100%" }]} onPress={onClose}>
                    <Text style={s.primaryBtnText}>Done</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={[s.stateSub, { color: colors.mutedForeground }]}>Processing your application…</Text>
              )}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────────
function DetailsModal({ offer, onApply, onClose }: { offer: Offer; onApply: () => void; onClose: () => void }) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={s.handle} />
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { color: colors.foreground }]}>Offer Details</Text>
            <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {[
              { label: "Lender", value: offer.bank },
              { label: "Loan Type", value: offer.type },
              { label: "Loan Amount", value: offer.loanRange },
              { label: "Interest Rate", value: offer.rate },
              { label: "Processing Fee", value: offer.processingFee },
              { label: "Repayment Tenure", value: offer.tenure },
              { label: "Tag", value: offer.tag },
            ].map((r, i) => (
              <View key={i} style={[s.reviewRow, { borderBottomColor: colors.border }]}>
                <Text style={[s.reviewLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[s.reviewValue, { color: colors.foreground }]}>{r.value}</Text>
              </View>
            ))}
            <Text style={[s.fieldLabel, { color: colors.foreground, marginTop: 14, marginBottom: 8 }]}>Key Features</Text>
            {offer.features.map((f, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 }}>
                <Feather name="check-circle" size={15} color="#10B981" />
                <Text style={[s.reviewLabel, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]} onPress={() => { onClose(); setTimeout(onApply, 300); }}>
              <Text style={s.primaryBtnText}>Apply Now</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Sort Modal ───────────────────────────────────────────────────────────────
function SortModal({ current, onSelect, onClose }: { current: SortOption; onSelect: (v: SortOption) => void; onClose: () => void }) {
  const colors = useColors();
  const options: { id: SortOption; label: string }[] = [
    { id: "recommended", label: "Recommended" },
    { id: "rate_low",    label: "Interest Rate: Low to High" },
    { id: "amount_high", label: "Loan Amount: High to Low" },
    { id: "fee_low",     label: "Processing Fee: Low to High" },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={[s.sortSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={s.handle} />
          <Text style={[s.modalTitle, { color: colors.foreground, marginBottom: 14 }]}>Sort By</Text>
          {options.map((o) => (
            <TouchableOpacity key={o.id} style={[s.reviewRow, { borderBottomColor: colors.border }]} onPress={() => { onSelect(o.id); onClose(); }}>
              <Text style={[s.reviewValue, { color: current === o.id ? "#4F46E5" : colors.foreground }]}>{o.label}</Text>
              {current === o.id && <Feather name="check" size={16} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AllOffersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;

  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [sort,     setSort]     = useState<SortOption>("recommended");
  const [showSort, setShowSort] = useState(false);
  const [detailOffer, setDetailOffer] = useState<Offer | null>(null);

  const navigateApply = (offer: Offer) => {
    router.push(
      `/apply-loan?bank=${encodeURIComponent(offer.bank)}&loanType=${encodeURIComponent(offer.type)}&category=${offer.category}&rate=${encodeURIComponent(offer.rate)}&maxAmount=${encodeURIComponent(offer.maxAmount)}&processingFee=${encodeURIComponent(offer.processingFee)}`
    );
  };

  const filtered = useMemo(() => {
    let list = ALL_OFFERS;
    if (category !== "all") list = list.filter((o) => o.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.bank.toLowerCase().includes(q) || o.type.toLowerCase().includes(q));
    }
    if (sort === "rate_low")    list = [...list].sort((a, b) => a.rateNum - b.rateNum);
    if (sort === "amount_high") list = [...list].sort((a, b) => b.maxAmountNum - a.maxAmountNum);
    if (sort === "fee_low")     list = [...list].sort((a, b) => parseFloat(a.processingFee) - parseFloat(b.processingFee));
    return list;
  }, [search, category, sort]);

  const activeCat = CATEGORIES.find((c) => c.id === category)!;

  const sortLabel: Record<SortOption, string> = {
    recommended: "Sort by", rate_low: "Rate ↑", amount_high: "Amount ↓", fee_low: "Fee ↑",
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>All Offers</Text>
          <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
            Explore and compare loan offers from trusted lenders
          </Text>
        </View>
      </View>

      {/* Search row */}
      <View style={[s.searchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[s.searchBox, { backgroundColor: colors.accent, borderColor: colors.border }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            style={[s.searchInput, { color: colors.foreground }]}
            placeholder="Search lenders or loan types"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x-circle" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[s.sortBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => setShowSort(true)}
        >
          <Feather name="sliders" size={14} color={colors.foreground} />
          <Text style={[s.sortBtnText, { color: colors.foreground }]}>{sortLabel[sort]}</Text>
        </TouchableOpacity>
      </View>

      {/* Category chips — horizontal scroll */}
      <View style={[s.chipScrollWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: "center" }}
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.catChip, { borderColor: active ? cat.color : colors.border, backgroundColor: active ? cat.color : colors.card }]}
                onPress={() => setCategory(cat.id)}
              >
                <Feather name={cat.icon as any} size={12} color={active ? "#fff" : cat.color} />
                <Text style={[s.catChipText, { color: active ? "#fff" : colors.foreground }]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active category badge */}
      {category !== "all" && (
        <View style={[s.activeBadgeRow, { backgroundColor: activeCat.bg }]}>
          <Feather name={activeCat.icon as any} size={14} color={activeCat.color} />
          <Text style={[s.activeBadgeText, { color: activeCat.color }]}>
            {activeCat.label} — {filtered.length} offer{filtered.length !== 1 ? "s" : ""} found
          </Text>
          <TouchableOpacity onPress={() => setCategory("all")}>
            <Feather name="x" size={14} color={activeCat.color} />
          </TouchableOpacity>
        </View>
      )}

      {/* Offer list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: isWeb ? 100 : 90 }}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <Feather name="search" size={40} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
            <Text style={[s.stateTitle, { color: colors.foreground }]}>No offers found</Text>
            <Text style={[s.stateSub, { color: colors.mutedForeground }]}>Try a different search or category</Text>
          </View>
        ) : (
          filtered.map((offer) => (
            <View key={offer.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Top row */}
              <View style={s.cardTop}>
                <View style={[s.initial, { backgroundColor: offer.initialBg }]}>
                  <Text style={s.initialText}>{offer.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Text style={[s.bankName, { color: colors.foreground }]}>{offer.bank}</Text>
                    {offer.featured && (
                      <View style={s.featuredBadge}><Text style={s.featuredText}>Featured</Text></View>
                    )}
                  </View>
                  <Text style={[s.loanType, { color: colors.mutedForeground }]}>{offer.type}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 5 }}>
                  <View style={[s.tagPill, { backgroundColor: offer.tagBg }]}>
                    <Text style={[s.tagText, { color: offer.tagColor }]}>{offer.tag}</Text>
                  </View>
                  <Text style={[s.maxAmt, { color: offer.initialBg }]}>Get up to {offer.maxAmount}</Text>
                  <TouchableOpacity style={[s.applyBtn, { borderColor: colors.border }]} onPress={() => navigateApply(offer)}>
                    <Text style={[s.applyBtnText, { color: colors.foreground }]}>Apply Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.viewDetailsRow} onPress={() => setDetailOffer(offer)}>
                    <Text style={[s.viewDetailsText, { color: "#4F46E5" }]}>View Details</Text>
                    <Feather name="arrow-right" size={11} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Feature tags */}
              <View style={s.featureTags}>
                {offer.features.map((f, i) => (
                  <View key={i} style={[s.featureTag, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                    <Feather name={offer.featureIcons[i] as any} size={11} color={offer.featureColors[i]} />
                    <Text style={[s.featureTagText, { color: colors.foreground }]}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={[s.divider, { backgroundColor: colors.border }]} />

              {/* Stats */}
              <View style={s.statsGrid}>
                {[
                  { label: "Loan Amount",      value: offer.loanRange },
                  { label: "Interest Rate",     value: offer.rate },
                  { label: "Processing Fee",    value: offer.processingFee },
                  { label: "Repayment Tenure",  value: offer.tenure },
                ].map((st, i) => (
                  <View key={i} style={s.statItem}>
                    <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{st.label}</Text>
                    <Text style={[s.statValue, { color: colors.foreground }]}>{st.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        {/* Bottom banner */}
        <View style={[s.banner, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
          <View style={[s.bannerIcon, { backgroundColor: "#4F46E5" }]}>
            <Text style={{ fontSize: 18 }}>💰</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.bannerTitle, { color: "#1a1a2e" }]}>Need a higher loan amount?</Text>
            <Text style={[s.bannerSub, { color: "#6B7280" }]}>Check your eligibility and get pre-approved in minutes.</Text>
          </View>
          <TouchableOpacity
            style={[s.bannerBtn, { backgroundColor: "#4F46E5" }]}
            onPress={() => Alert.alert("Eligibility Check", "You're pre-approved for up to $500,000 based on your profile!", [{ text: "Great!" }])}
          >
            <Text style={s.bannerBtnText}>Check{"\n"}Eligibility</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showSort && <SortModal current={sort} onSelect={setSort} onClose={() => setShowSort(false)} />}
      {detailOffer && (
        <DetailsModal
          offer={detailOffer}
          onApply={() => { setDetailOffer(null); navigateApply(detailOffer); }}
          onClose={() => setDetailOffer(null)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },

  searchRow: { flexDirection: "row", padding: 10, gap: 8, alignItems: "center", borderBottomWidth: 1 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, overflow: "hidden", minWidth: 0 },
  searchInput: { flex: 1, minWidth: 0, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 0, ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}) },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 40 },
  sortBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  chipScrollWrap: { borderBottomWidth: 1, height: 54, flexShrink: 0 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  catChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  activeBadgeRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  activeBadgeText: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold" },

  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  initial: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  initialText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  bankName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  loanType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  featuredBadge: { backgroundColor: "#EEF2FF", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  featuredText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },
  tagPill: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  tagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  maxAmt: { fontSize: 13, fontFamily: "Inter_700Bold" },
  applyBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  applyBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  viewDetailsRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewDetailsText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  featureTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  featureTag: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  featureTagText: { fontSize: 10, fontFamily: "Inter_500Medium" },

  divider: { height: 1, marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap" },
  statItem: { width: "50%", paddingBottom: 6 },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 2 },
  statValue: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  banner: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  bannerIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  bannerTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  bannerSub: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  bannerBtn: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: "center" },
  bannerBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", textAlign: "center" },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  stateTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  stateSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "90%" },
  sortSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 4, overflow: "hidden" },
  prefix: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginRight: 2 },
  input: { flex: 1, minWidth: 0, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 0, ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}) },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  tenureChip: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  tenureChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emiBox: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 3, marginBottom: 14 },
  emiValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  twoCell: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  cell: { flex: 1, padding: 12 },
  cellLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 4 },
  cellValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  primaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11, borderBottomWidth: 1 },
  reviewLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rowBtns: { flexDirection: "row", gap: 10, marginTop: 18, marginBottom: 12 },
  ghostBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: "center" },
  ghostBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  centerState: { alignItems: "center", paddingVertical: 20 },
  stateIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  stateSub2: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  refCard: { borderRadius: 12, borderWidth: 1, padding: 16, width: "100%", alignItems: "center", gap: 4, marginBottom: 20 },
  refNo: { fontSize: 20, fontFamily: "Inter_700Bold" },
});
