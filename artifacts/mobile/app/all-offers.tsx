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

const ALL_OFFERS = [
  {
    id: "1",
    bank: "Finstar Bank",
    initial: "F",
    initialBg: "#10B981",
    initialColor: "#fff",
    type: "Personal Loan",
    featured: true,
    tag: "Best Interest",
    tagColor: "#10B981",
    tagBg: "#D1FAE5",
    maxAmount: "$50,000",
    loanRange: "$1,000 - $50,000",
    rate: "8.49% p.a. onwards",
    processingFee: "1.00% onwards",
    tenure: "6 - 60 months",
    features: ["Low Interest", "Quick Approval", "Trusted Lender"],
    featureIcons: ["percent", "zap", "shield"] as const,
    featureColors: ["#4F46E5", "#10B981", "#F59E0B"],
    category: "personal",
    minAmount: 1000,
    maxAmountNum: 50000,
    tenureOptions: [12, 24, 36, 48, 60],
    rateNum: 8.49,
  },
  {
    id: "2",
    bank: "Ace Finance",
    initial: "A",
    initialBg: "#EF4444",
    initialColor: "#fff",
    type: "Personal Loan",
    featured: true,
    tag: "Quick Approval",
    tagColor: "#3B82F6",
    tagBg: "#DBEAFE",
    maxAmount: "$40,000",
    loanRange: "$1,000 - $40,000",
    rate: "9.25% p.a. onwards",
    processingFee: "1.25% onwards",
    tenure: "6 - 48 months",
    features: ["Quick Approval", "Trusted Lender", "Flexible Tenure"],
    featureIcons: ["zap", "shield", "calendar"] as const,
    featureColors: ["#10B981", "#F59E0B", "#3B82F6"],
    category: "personal",
    minAmount: 1000,
    maxAmountNum: 40000,
    tenureOptions: [12, 24, 36, 48],
    rateNum: 9.25,
  },
  {
    id: "3",
    bank: "PrimeLend",
    initial: "P",
    initialBg: "#4F46E5",
    initialColor: "#fff",
    type: "Personal Loan",
    featured: false,
    tag: "Low Processing Fee",
    tagColor: "#D97706",
    tagBg: "#FEF3C7",
    maxAmount: "$30,000",
    loanRange: "$1,000 - $30,000",
    rate: "10.49% p.a. onwards",
    processingFee: "1.50% onwards",
    tenure: "6 - 36 months",
    features: ["Low Processing Fee", "Trusted Lender", "Fast Disbursal"],
    featureIcons: ["percent", "shield", "clock"] as const,
    featureColors: ["#4F46E5", "#F59E0B", "#3B82F6"],
    category: "personal",
    minAmount: 1000,
    maxAmountNum: 30000,
    tenureOptions: [12, 24, 36],
    rateNum: 10.49,
  },
  {
    id: "4",
    bank: "Star Cred",
    initial: "S",
    initialBg: "#1a1a2e",
    initialColor: "#fff",
    type: "Personal Loan",
    featured: false,
    tag: "Competitive Rates",
    tagColor: "#7C3AED",
    tagBg: "#EDE9FE",
    maxAmount: "$25,000",
    loanRange: "$1,000 - $25,000",
    rate: "11.25% p.a. onwards",
    processingFee: "1.75% onwards",
    tenure: "6 - 36 months",
    features: ["Competitive Rates", "Quick Disbursal", "Trusted Lender"],
    featureIcons: ["trending-up", "zap", "shield"] as const,
    featureColors: ["#7C3AED", "#10B981", "#F59E0B"],
    category: "personal",
    minAmount: 1000,
    maxAmountNum: 25000,
    tenureOptions: [12, 24, 36],
    rateNum: 11.25,
  },
  {
    id: "5",
    bank: "MoneyPlus",
    initial: "M",
    initialBg: "#0EA5E9",
    initialColor: "#fff",
    type: "Personal Loan",
    featured: false,
    tag: "Low Interest",
    tagColor: "#10B981",
    tagBg: "#D1FAE5",
    maxAmount: "$20,000",
    loanRange: "$1,000 - $20,000",
    rate: "11.99% p.a. onwards",
    processingFee: "1.99% onwards",
    tenure: "6 - 24 months",
    features: ["Quick Approval", "Low Interest", "Trusted Lender"],
    featureIcons: ["zap", "percent", "shield"] as const,
    featureColors: ["#10B981", "#4F46E5", "#F59E0B"],
    category: "personal",
    minAmount: 1000,
    maxAmountNum: 20000,
    tenureOptions: [6, 12, 24],
    rateNum: 11.99,
  },
  {
    id: "6",
    bank: "HomeFirst",
    initial: "H",
    initialBg: "#4F46E5",
    initialColor: "#fff",
    type: "Home Loan",
    featured: true,
    tag: "Best Rate",
    tagColor: "#10B981",
    tagBg: "#D1FAE5",
    maxAmount: "$500,000",
    loanRange: "$50,000 - $500,000",
    rate: "7.99% p.a. onwards",
    processingFee: "0.50% onwards",
    tenure: "60 - 360 months",
    features: ["Low Interest", "Trusted Lender", "Fast Disbursal"],
    featureIcons: ["percent", "shield", "clock"] as const,
    featureColors: ["#4F46E5", "#F59E0B", "#3B82F6"],
    category: "home",
    minAmount: 50000,
    maxAmountNum: 500000,
    tenureOptions: [60, 120, 180, 240, 360],
    rateNum: 7.99,
  },
  {
    id: "7",
    bank: "BizGrow",
    initial: "B",
    initialBg: "#8B5CF6",
    initialColor: "#fff",
    type: "Business Loan",
    featured: false,
    tag: "Quick Funds",
    tagColor: "#3B82F6",
    tagBg: "#DBEAFE",
    maxAmount: "$100,000",
    loanRange: "$5,000 - $100,000",
    rate: "13.50% p.a. onwards",
    processingFee: "2.00% onwards",
    tenure: "12 - 60 months",
    features: ["Quick Approval", "Flexible Tenure", "Trusted Lender"],
    featureIcons: ["zap", "calendar", "shield"] as const,
    featureColors: ["#10B981", "#3B82F6", "#F59E0B"],
    category: "business",
    minAmount: 5000,
    maxAmountNum: 100000,
    tenureOptions: [12, 24, 36, 48, 60],
    rateNum: 13.5,
  },
];

type Offer = typeof ALL_OFFERS[0];
type CategoryFilter = "all" | "personal" | "home" | "business";
type SortOption = "recommended" | "rate_low" | "amount_high" | "fee_low";

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
    if (!val || val < offer.minAmount) {
      Alert.alert("Invalid Amount", `Minimum is $${offer.minAmount.toLocaleString()}`);
      return;
    }
    if (val > offer.maxAmountNum) {
      Alert.alert("Invalid Amount", `Maximum is ${offer.maxAmount}`);
      return;
    }
    setStep("review");
  };

  const confirm = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2000);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{offer.bank}</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>{offer.type}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {step === "form" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Loan Amount</Text>
                  <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                    <Text style={[styles.prefix, { color: colors.mutedForeground }]}>$</Text>
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                  <Text style={[styles.hint, { color: colors.mutedForeground }]}>Range: {offer.loanRange}</Text>
                </View>
                <View>
                  <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Tenure (months)</Text>
                  <View style={styles.chips}>
                    {offer.tenureOptions.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.chip, { borderColor: tenure === t ? "#4F46E5" : colors.border, backgroundColor: tenure === t ? "#EEF2FF" : colors.card }]}
                        onPress={() => setTenure(t)}
                      >
                        <Text style={[styles.chipText, { color: tenure === t ? "#4F46E5" : colors.mutedForeground }]}>{t}m</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.emiBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                  <Text style={[styles.emiBoxLabel, { color: "#6B7280" }]}>Estimated Monthly EMI</Text>
                  <Text style={[styles.emiBoxValue, { color: "#4F46E5" }]}>${isNaN(emi) ? "—" : emi.toFixed(2)}</Text>
                  <Text style={[styles.emiBoxNote, { color: "#6B7280" }]}>at {offer.rate}</Text>
                </View>
                <View style={[styles.statsGrid, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                  {[{ label: "Interest Rate", value: offer.rate }, { label: "Processing Fee", value: offer.processingFee }].map((r, i) => (
                    <View key={i} style={[styles.statsCell, i === 1 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                      <Text style={[styles.statsCellLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                      <Text style={[styles.statsCellValue, { color: colors.foreground }]}>{r.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]} onPress={submit}>
                <Text style={styles.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          )}

          {step === "review" && (
            <>
              <Text style={[styles.hint, { color: colors.mutedForeground, marginBottom: 14 }]}>Review your application</Text>
              {[
                { label: "Lender", value: offer.bank },
                { label: "Loan Type", value: offer.type },
                { label: "Loan Amount", value: `$${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Tenure", value: `${tenure} months` },
                { label: "Interest Rate", value: offer.rate },
                { label: "Processing Fee", value: offer.processingFee },
                { label: "Est. Monthly EMI", value: `$${emi.toFixed(2)}` },
              ].map((r, i) => (
                <View key={i} style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground }]}>{r.value}</Text>
                </View>
              ))}
              <View style={styles.rowBtns}>
                <TouchableOpacity style={[styles.ghostBtn, { borderColor: colors.border }]} onPress={() => setStep("form")}>
                  <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: "#4F46E5" }]} onPress={confirm}>
                  <Text style={styles.primaryBtnText}>Confirm & Apply</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {(step === "processing" || step === "success") && (
            <View style={styles.centeredState}>
              {step === "processing" ? (
                <>
                  <View style={[styles.stateIcon, { backgroundColor: "#EEF2FF" }]}>
                    <Feather name="loader" size={32} color="#4F46E5" />
                  </View>
                  <Text style={[styles.stateTitle, { color: colors.foreground }]}>Submitting...</Text>
                  <Text style={[styles.stateSub, { color: colors.mutedForeground }]}>Processing your application</Text>
                </>
              ) : (
                <>
                  <View style={[styles.stateIcon, { backgroundColor: "#D1FAE5" }]}>
                    <Feather name="check-circle" size={36} color="#10B981" />
                  </View>
                  <Text style={[styles.stateTitle, { color: colors.foreground }]}>Application Submitted!</Text>
                  <Text style={[styles.stateSub, { color: colors.mutedForeground }]}>
                    Your application to <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{offer.bank}</Text> has been submitted.
                  </Text>
                  <View style={[styles.refCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                    <Text style={[styles.hint, { color: "#6B7280" }]}>Application Reference</Text>
                    <Text style={[styles.refNo, { color: "#4F46E5" }]}>APP{Date.now().toString().slice(-8)}</Text>
                    <Text style={[styles.hint, { color: "#6B7280" }]}>You'll hear back within 24-48 hours.</Text>
                  </View>
                  <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#4F46E5", width: "100%" }]} onPress={onClose}>
                    <Text style={styles.primaryBtnText}>Done</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailsModal({ offer, onApply, onClose }: { offer: Offer; onApply: () => void; onClose: () => void }) {
  const colors = useColors();
  const rows = [
    { label: "Lender", value: offer.bank },
    { label: "Loan Type", value: offer.type },
    { label: "Loan Amount", value: offer.loanRange },
    { label: "Interest Rate", value: offer.rate },
    { label: "Processing Fee", value: offer.processingFee },
    { label: "Repayment Tenure", value: offer.tenure },
    { label: "Status", value: offer.featured ? "Featured" : "Available" },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Offer Details</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={[styles.detailHeader, { backgroundColor: offer.initialBg + "22" }]}>
            <View style={[styles.detailInitial, { backgroundColor: offer.initialBg }]}>
              <Text style={[styles.detailInitialText, { color: offer.initialColor }]}>{offer.initial}</Text>
            </View>
            <View>
              <Text style={[styles.detailBankName, { color: colors.foreground }]}>{offer.bank}</Text>
              <View style={[styles.tagPill, { backgroundColor: offer.tagBg }]}>
                <Text style={[styles.tagPillText, { color: offer.tagColor }]}>{offer.tag}</Text>
              </View>
            </View>
            <Text style={[styles.detailMax, { color: offer.initialBg }]}>Get up to {offer.maxAmount}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
            {rows.map((r, i) => (
              <View key={i} style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>{r.value}</Text>
              </View>
            ))}
            <Text style={[styles.fieldLabel, { color: colors.foreground, marginTop: 16, marginBottom: 8 }]}>Features</Text>
            {offer.features.map((f, i) => (
              <View key={i} style={styles.featureCheckRow}>
                <Feather name="check-circle" size={15} color="#10B981" />
                <Text style={[styles.featureCheckText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]} onPress={() => { onClose(); setTimeout(onApply, 300); }}>
              <Text style={styles.primaryBtnText}>Apply Now</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SortModal({ current, onSelect, onClose }: { current: SortOption; onSelect: (s: SortOption) => void; onClose: () => void }) {
  const colors = useColors();
  const options: { id: SortOption; label: string }[] = [
    { id: "recommended", label: "Recommended" },
    { id: "rate_low", label: "Interest Rate: Low to High" },
    { id: "amount_high", label: "Loan Amount: High to Low" },
    { id: "fee_low", label: "Processing Fee: Low to High" },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sortSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={[styles.modalTitle, { color: colors.foreground, marginBottom: 16 }]}>Sort By</Text>
          {options.map((o) => (
            <TouchableOpacity
              key={o.id}
              style={[styles.sortRow, { borderBottomColor: colors.border }]}
              onPress={() => { onSelect(o.id); onClose(); }}
            >
              <Text style={[styles.sortLabel, { color: current === o.id ? "#4F46E5" : colors.foreground }]}>{o.label}</Text>
              {current === o.id && <Feather name="check" size={16} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FiltersModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [minRate, setMinRate] = useState("7");
  const [maxRate, setMaxRate] = useState("15");
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.fieldLabel, { color: colors.foreground, marginBottom: 10 }]}>Interest Rate Range</Text>
          <View style={styles.rateRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hint, { color: colors.mutedForeground, marginBottom: 4 }]}>Min %</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                <TextInput style={[styles.input, { color: colors.foreground }]} value={minRate} onChangeText={setMinRate} keyboardType="numeric" />
              </View>
            </View>
            <Text style={[styles.hint, { color: colors.mutedForeground, marginTop: 22 }]}>–</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hint, { color: colors.mutedForeground, marginBottom: 4 }]}>Max %</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                <TextInput style={[styles.input, { color: colors.foreground }]} value={maxRate} onChangeText={setMaxRate} keyboardType="numeric" />
              </View>
            </View>
          </View>
          <Text style={[styles.fieldLabel, { color: colors.foreground, marginTop: 18, marginBottom: 10 }]}>Lender Type</Text>
          {["All Lenders", "Banks", "NBFCs", "Fintech"].map((l, i) => (
            <TouchableOpacity key={i} style={[styles.sortRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sortLabel, { color: i === 0 ? "#4F46E5" : colors.foreground }]}>{l}</Text>
              {i === 0 && <Feather name="check" size={16} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]} onPress={onClose}>
            <Text style={styles.primaryBtnText}>Apply Filters</Text>
          </TouchableOpacity>
          <View style={{ height: 16 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function AllOffersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [showSort, setShowSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [applyOffer, setApplyOffer] = useState<Offer | null>(null);
  const [detailOffer, setDetailOffer] = useState<Offer | null>(null);

  const categoryFilters: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "All Offers" },
    { id: "personal", label: "Personal Loan" },
    { id: "home", label: "Home Loan" },
    { id: "business", label: "Business Loan" },
  ];

  const filtered = useMemo(() => {
    let list = ALL_OFFERS;
    if (category !== "all") list = list.filter((o) => o.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.bank.toLowerCase().includes(q) || o.type.toLowerCase().includes(q));
    }
    if (sort === "rate_low") list = [...list].sort((a, b) => a.rateNum - b.rateNum);
    else if (sort === "amount_high") list = [...list].sort((a, b) => b.maxAmountNum - a.maxAmountNum);
    else if (sort === "fee_low") list = [...list].sort((a, b) => parseFloat(a.processingFee) - parseFloat(b.processingFee));
    return list;
  }, [search, category, sort]);

  const sortLabels: Record<SortOption, string> = {
    recommended: "Sort by",
    rate_low: "Rate ↑",
    amount_high: "Amount ↓",
    fee_low: "Fee ↑",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>All Offers</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Explore and compare loan offers from trusted lenders</Text>
          </View>
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.searchInput, { backgroundColor: colors.accent, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchText, { color: colors.foreground }]}
            placeholder="Search lenders or loan types"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filtersBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => setShowFilters(true)}
        >
          <Feather name="sliders" size={15} color={colors.foreground} />
          <Text style={[styles.filtersBtnText, { color: colors.foreground }]}>Filters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterScroll, { backgroundColor: colors.card }]}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {categoryFilters.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterChip,
              { borderColor: category === f.id ? "#4F46E5" : colors.border, backgroundColor: category === f.id ? "#4F46E5" : colors.card },
            ]}
            onPress={() => setCategory(f.id)}
          >
            <Text style={[styles.filterChipText, { color: category === f.id ? "#fff" : colors.foreground }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterChip, styles.sortChip, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => setShowSort(true)}
        >
          <Text style={[styles.filterChipText, { color: colors.foreground }]}>{sortLabels[sort]}</Text>
          <Feather name="chevron-down" size={13} color={colors.mutedForeground} />
        </TouchableOpacity>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: isWeb ? 100 : 90 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No offers found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Try a different search or filter</Text>
          </View>
        ) : (
          filtered.map((offer) => (
            <View key={offer.id} style={[styles.offerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.offerTop}>
                <View style={[styles.offerInitial, { backgroundColor: offer.initialBg }]}>
                  <Text style={[styles.offerInitialText, { color: offer.initialColor }]}>{offer.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Text style={[styles.bankName, { color: colors.foreground }]}>{offer.bank}</Text>
                    {offer.featured && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredText}>Featured</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.loanType, { color: colors.mutedForeground }]}>{offer.type}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <View style={[styles.tagPill, { backgroundColor: offer.tagBg }]}>
                    <Text style={[styles.tagPillText, { color: offer.tagColor }]}>{offer.tag}</Text>
                  </View>
                  <Text style={[styles.maxAmount, { color: offer.initialBg }]}>Get up to {offer.maxAmount}</Text>
                  <TouchableOpacity
                    style={[styles.applyNowBtn, { borderColor: colors.border }]}
                    onPress={() => setApplyOffer(offer)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.applyNowText, { color: colors.foreground }]}>Apply Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewDetailsRow} onPress={() => setDetailOffer(offer)}>
                    <Text style={[styles.viewDetailsText, { color: "#4F46E5" }]}>View Details</Text>
                    <Feather name="arrow-right" size={12} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.featureTagsRow]}>
                {offer.features.map((f, i) => (
                  <View key={i} style={[styles.featureTag, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                    <Feather name={offer.featureIcons[i] as any} size={11} color={offer.featureColors[i]} />
                    <Text style={[styles.featureTagText, { color: colors.foreground }]}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.statsRow}>
                {[
                  { label: "Loan Amount", value: offer.loanRange },
                  { label: "Interest Rate", value: offer.rate },
                  { label: "Processing Fee", value: offer.processingFee },
                  { label: "Repayment Tenure", value: offer.tenure },
                ].map((s, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                    <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        <View style={[styles.bottomBanner, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <View style={[styles.bannerIconWrap, { backgroundColor: "#4F46E5" }]}>
              <Text style={{ fontSize: 18 }}>💰</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: "#1a1a2e" }]}>Need a higher loan amount?</Text>
              <Text style={[styles.bannerSub, { color: "#6B7280" }]}>Check your eligibility and get pre-approved in minutes.</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.bannerBtn, { backgroundColor: "#4F46E5" }]}
            onPress={() => Alert.alert("Eligibility Check", "You're pre-approved for up to $500,000 based on your profile!", [{ text: "Great!" }])}
          >
            <Text style={styles.bannerBtnText}>Check{"\n"}Eligibility</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showSort && <SortModal current={sort} onSelect={setSort} onClose={() => setShowSort(false)} />}
      {showFilters && <FiltersModal onClose={() => setShowFilters(false)} />}
      {applyOffer && <ApplyModal offer={applyOffer} onClose={() => setApplyOffer(null)} />}
      {detailOffer && (
        <DetailsModal
          offer={detailOffer}
          onApply={() => setApplyOffer(detailOffer)}
          onClose={() => setDetailOffer(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  backBtn: { paddingTop: 2 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  searchBar: { flexDirection: "row", padding: 12, gap: 10, borderBottomWidth: 1, alignItems: "center" },
  searchInput: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  searchText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  filtersBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  filtersBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  filterScroll: { borderBottomWidth: 1 },
  filterChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 4 },
  sortChip: {},
  filterChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  offerCard: { borderRadius: 14, borderWidth: 1, padding: 14, overflow: "hidden" },
  offerTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  offerInitial: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  offerInitialText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  bankName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  loanType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  featuredBadge: { backgroundColor: "#EEF2FF", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  featuredText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },
  tagPill: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  tagPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  maxAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  applyNowBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  applyNowText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  viewDetailsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewDetailsText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  featureTagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  featureTag: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  featureTagText: { fontSize: 10, fontFamily: "Inter_500Medium" },

  divider: { height: 1, marginBottom: 10 },
  statsRow: { flexDirection: "row", flexWrap: "wrap" },
  statItem: { width: "50%", paddingBottom: 6 },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 2 },
  statValue: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  bottomBanner: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  bannerIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  bannerTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  bannerSub: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  bannerBtn: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignItems: "center" },
  bannerBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", textAlign: "center" },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "90%" },
  sortSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 46 },
  prefix: { fontSize: 15, fontFamily: "Inter_500Medium", marginRight: 4 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emiBox: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 3 },
  emiBoxLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emiBoxValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  emiBoxNote: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statsGrid: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  statsCell: { flex: 1, padding: 12 },
  statsCellLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 4 },
  statsCellValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  primaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1 },
  reviewLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rowBtns: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 12 },
  ghostBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: "center" },
  ghostBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  centeredState: { alignItems: "center", paddingVertical: 20 },
  stateIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  stateTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  stateSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  refCard: { borderRadius: 12, borderWidth: 1, padding: 16, width: "100%", alignItems: "center", gap: 4, marginBottom: 20 },
  refNo: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sortRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1 },
  sortLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  rateRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  detailHeader: { borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  detailInitial: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  detailInitialText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  detailBankName: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  detailMax: { fontSize: 13, fontFamily: "Inter_700Bold", marginLeft: "auto" },
  featureCheckRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  featureCheckText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
