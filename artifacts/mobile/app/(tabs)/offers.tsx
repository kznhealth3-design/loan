import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
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

const OFFERS = [
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
    minAmount: 1000,
    maxAmountNum: 50000,
    tenureOptions: [12, 24, 36, 48, 60],
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
    minAmount: 1000,
    maxAmountNum: 40000,
    tenureOptions: [12, 24, 36, 48],
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
    minAmount: 1000,
    maxAmountNum: 30000,
    tenureOptions: [12, 24, 36],
  },
  {
    id: "4",
    bank: "SwiftCredit",
    initial: "S",
    initialBg: "#8B5CF6",
    initialColor: "#fff",
    type: "Personal Loan",
    featured: false,
    tag: "Instant Approval",
    tagColor: "#7C3AED",
    tagBg: "#EDE9FE",
    maxAmount: "$25,000",
    loanRange: "$500 - $25,000",
    rate: "11.99% p.a. onwards",
    processingFee: "0.75% onwards",
    minAmount: 500,
    maxAmountNum: 25000,
    tenureOptions: [6, 12, 24],
  },
];

type Offer = typeof OFFERS[0];

function EligibilityModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [step, setStep] = useState<"form" | "checking" | "result">("form");
  const [income, setIncome] = useState("");
  const [score, setScore] = useState("");

  const check = () => {
    if (!income || !score) { Alert.alert("Required", "Please fill in all fields."); return; }
    setStep("checking");
    setTimeout(() => setStep("result"), 2000);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Check Eligibility</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {step === "form" && (
            <>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
                This will not affect your credit score.
              </Text>
              <View style={{ gap: 14, marginTop: 8 }}>
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>Monthly Income</Text>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                    <Text style={[styles.inputPrefix, { color: colors.mutedForeground }]}>$</Text>
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      placeholder="e.g. 5000"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                      value={income}
                      onChangeText={setIncome}
                    />
                  </View>
                </View>
                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>Credit Score (approx.)</Text>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      placeholder="e.g. 750"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                      value={score}
                      onChangeText={setScore}
                    />
                  </View>
                </View>
              </View>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]} onPress={check}>
                <Text style={styles.actionBtnText}>Check Now</Text>
              </TouchableOpacity>
              <View style={[styles.disclaimerRow, { marginTop: 12 }]}>
                <Feather name="shield" size={13} color={colors.mutedForeground} />
                <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                  Checking your eligibility will not affect your credit score.
                </Text>
              </View>
            </>
          )}

          {step === "checking" && (
            <View style={styles.centeredState}>
              <View style={[styles.checkingIcon, { backgroundColor: "#EEF2FF" }]}>
                <Feather name="search" size={32} color="#4F46E5" />
              </View>
              <Text style={[styles.checkingTitle, { color: colors.foreground }]}>Checking Eligibility...</Text>
              <Text style={[styles.checkingSub, { color: colors.mutedForeground }]}>
                Scanning offers from 50+ lenders
              </Text>
            </View>
          )}

          {step === "result" && (
            <View style={styles.centeredState}>
              <View style={[styles.checkingIcon, { backgroundColor: "#D1FAE5" }]}>
                <Feather name="check-circle" size={36} color="#10B981" />
              </View>
              <Text style={[styles.checkingTitle, { color: colors.foreground }]}>You're Pre-Approved!</Text>
              <Text style={[styles.checkingSub, { color: colors.mutedForeground }]}>
                Based on your profile, you qualify for:
              </Text>
              <View style={[styles.resultCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={[styles.resultAmount, { color: "#4F46E5" }]}>Up to $50,000</Text>
                <Text style={[styles.resultRate, { color: "#6B7280" }]}>Starting at 8.49% p.a.</Text>
              </View>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#4F46E5", width: "100%" }]} onPress={onClose}>
                <Text style={styles.actionBtnText}>View Offers</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ApplyModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const colors = useColors();
  const [step, setStep] = useState<"form" | "review" | "processing" | "success">("form");
  const [amount, setAmount] = useState("10000");
  const [tenure, setTenure] = useState(offer.tenureOptions[1] ?? 24);

  const emi = (() => {
    const p = parseFloat(amount) || 0;
    const r = parseFloat(offer.rate) / 12 / 100;
    const n = tenure;
    if (!p || !r || !n) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  })();

  const submit = () => {
    if (!amount || parseFloat(amount) < offer.minAmount) {
      Alert.alert("Invalid Amount", `Minimum loan amount is $${offer.minAmount.toLocaleString()}.`);
      return;
    }
    if (parseFloat(amount) > offer.maxAmountNum) {
      Alert.alert("Invalid Amount", `Maximum loan amount is ${offer.maxAmount}.`);
      return;
    }
    setStep("review");
  };

  const confirmApply = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2200);
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
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>Loan Amount</Text>
                  <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                    <Text style={[styles.inputPrefix, { color: colors.mutedForeground }]}>$</Text>
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      placeholder={`${offer.minAmount} - ${offer.maxAmountNum}`}
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                  <Text style={[styles.inputHint, { color: colors.mutedForeground }]}>
                    Range: {offer.loanRange}
                  </Text>
                </View>

                <View>
                  <Text style={[styles.inputLabel, { color: colors.foreground }]}>Tenure</Text>
                  <View style={styles.tenureRow}>
                    {offer.tenureOptions.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.tenureChip,
                          { borderColor: tenure === t ? "#4F46E5" : colors.border, backgroundColor: tenure === t ? "#EEF2FF" : colors.card },
                        ]}
                        onPress={() => setTenure(t)}
                      >
                        <Text style={[styles.tenureChipText, { color: tenure === t ? "#4F46E5" : colors.mutedForeground }]}>
                          {t}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.emiPreview, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                  <Text style={[styles.emiPreviewLabel, { color: "#6B7280" }]}>Estimated Monthly EMI</Text>
                  <Text style={[styles.emiPreviewValue, { color: "#4F46E5" }]}>
                    ${isNaN(emi) ? "—" : emi.toFixed(2)}
                  </Text>
                  <Text style={[styles.emiPreviewNote, { color: "#6B7280" }]}>
                    at {offer.rate}
                  </Text>
                </View>

                <View style={[styles.infoRow, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                  {[
                    { label: "Interest Rate", value: offer.rate },
                    { label: "Processing Fee", value: offer.processingFee },
                  ].map((r, i) => (
                    <View key={i} style={[styles.infoCell, i === 1 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                      <Text style={[styles.infoCellLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                      <Text style={[styles.infoCellValue, { color: colors.foreground }]}>{r.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#4F46E5", marginTop: 20 }]} onPress={submit}>
                <Text style={styles.actionBtnText}>Continue</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          )}

          {step === "review" && (
            <>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground, marginBottom: 14 }]}>
                Review your application details
              </Text>
              {[
                { label: "Lender", value: offer.bank },
                { label: "Loan Type", value: offer.type },
                { label: "Loan Amount", value: `$${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Tenure", value: `${tenure} months` },
                { label: "Interest Rate", value: offer.rate },
                { label: "Processing Fee", value: offer.processingFee },
                { label: "Est. Monthly EMI", value: `$${emi.toFixed(2)}` },
              ].map((row, i) => (
                <View key={i} style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground }]}>{row.value}</Text>
                </View>
              ))}
              <View style={styles.reviewBtns}>
                <TouchableOpacity
                  style={[styles.reviewBack, { borderColor: colors.border }]}
                  onPress={() => setStep("form")}
                >
                  <Text style={[styles.reviewBackText, { color: colors.foreground }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: "#4F46E5" }]} onPress={confirmApply}>
                  <Text style={styles.actionBtnText}>Confirm & Apply</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === "processing" && (
            <View style={styles.centeredState}>
              <View style={[styles.checkingIcon, { backgroundColor: "#EEF2FF" }]}>
                <Feather name="loader" size={32} color="#4F46E5" />
              </View>
              <Text style={[styles.checkingTitle, { color: colors.foreground }]}>Submitting Application...</Text>
              <Text style={[styles.checkingSub, { color: colors.mutedForeground }]}>
                Please wait while we process your request.
              </Text>
            </View>
          )}

          {step === "success" && (
            <View style={styles.centeredState}>
              <View style={[styles.checkingIcon, { backgroundColor: "#D1FAE5" }]}>
                <Feather name="check-circle" size={36} color="#10B981" />
              </View>
              <Text style={[styles.checkingTitle, { color: colors.foreground }]}>Application Submitted!</Text>
              <Text style={[styles.checkingSub, { color: colors.mutedForeground }]}>
                Your loan application to{" "}
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{offer.bank}</Text> has been submitted successfully.
              </Text>
              <View style={[styles.resultCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={[styles.emiPreviewLabel, { color: "#6B7280" }]}>Application Reference</Text>
                <Text style={[styles.resultAmount, { color: "#4F46E5" }]}>
                  APP{Date.now().toString().slice(-8)}
                </Text>
                <Text style={[styles.resultRate, { color: "#6B7280" }]}>
                  You'll hear back within 24-48 hours.
                </Text>
              </View>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#4F46E5", width: "100%" }]} onPress={onClose}>
                <Text style={styles.actionBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function OffersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;

  const [showAll, setShowAll] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [applyOffer, setApplyOffer] = useState<Offer | null>(null);

  const visibleOffers = showAll ? OFFERS : OFFERS.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Offers</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Exclusive loan offers curated for you</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isWeb ? 100 : 90 }}>
        {/* Hero banner */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View style={[styles.heroBanner, { backgroundColor: "#F0EFFE" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: "#1a1a2e" }]}>Better offers.</Text>
              <Text style={[styles.heroTitleAccent, { color: "#4F46E5" }]}>More savings.</Text>
              <Text style={[styles.heroSub, { color: "#6B7280" }]}>
                Check offers from top lenders{"\n"}and get funded quickly.
              </Text>
              <TouchableOpacity
                style={[styles.heroBtn, { backgroundColor: "#1a1a2e" }]}
                onPress={() => setShowEligibility(true)}
              >
                <Text style={styles.heroBtnText}>Check Your Eligibility</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroImagePlaceholder}>
              <View style={[styles.giftBox, { backgroundColor: "#7C3AED" }]}>
                <Text style={{ fontSize: 32 }}>🎁</Text>
              </View>
              <View style={[styles.percentTag, { backgroundColor: "#F59E0B" }]}>
                <Text style={styles.percentText}>%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Feature pills */}
        <View style={[styles.featurePills, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "percent", label: "Low Interest", sub: "Best interest rates", color: "#4F46E5", bg: "#EEF2FF" },
            { icon: "zap", label: "Quick Approval", sub: "Get approval fast", color: "#10B981", bg: "#D1FAE5" },
            { icon: "shield", label: "Trusted Lenders", sub: "100% secure", color: "#F59E0B", bg: "#FEF3C7" },
            { icon: "award", label: "Exclusive Offers", sub: "Only for you", color: "#3B82F6", bg: "#DBEAFE" },
          ].map((f, i) => (
            <View key={i} style={styles.featurePill}>
              <View style={[styles.featurePillIcon, { backgroundColor: f.bg }]}>
                <Feather name={f.icon as any} size={16} color={f.color} />
              </View>
              <Text style={[styles.featurePillLabel, { color: colors.foreground }]}>{f.label}</Text>
              <Text style={[styles.featurePillSub, { color: colors.mutedForeground }]}>{f.sub}</Text>
            </View>
          ))}
        </View>

        {/* Recommended section */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recommended for You</Text>
            <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.viewAllRow}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                {showAll ? "Show Less" : "View All Offers"}
              </Text>
              <Feather name="arrow-right" size={13} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12, paddingTop: 8 }}>
          {visibleOffers.map((offer) => (
            <View key={offer.id} style={[styles.offerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.offerTop}>
                <View style={[styles.offerInitial, { backgroundColor: offer.initialBg }]}>
                  <Text style={[styles.offerInitialText, { color: offer.initialColor }]}>{offer.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.offerBank, { color: colors.foreground }]}>{offer.bank}</Text>
                    {offer.featured && (
                      <View style={[styles.featuredBadge, { backgroundColor: "#EEF2FF" }]}>
                        <Text style={[styles.featuredText, { color: "#4F46E5" }]}>Featured</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.offerType, { color: colors.mutedForeground }]}>{offer.type}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <View style={[styles.tagBadge, { backgroundColor: offer.tagBg }]}>
                    <Text style={[styles.tagText, { color: offer.tagColor }]}>{offer.tag}</Text>
                  </View>
                  <Text style={[styles.offerMax, { color: offer.initialBg }]}>
                    Get up to {offer.maxAmount}
                  </Text>
                  <TouchableOpacity
                    style={[styles.applyBtn, { borderColor: colors.border }]}
                    onPress={() => setApplyOffer(offer)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.applyBtnText, { color: colors.foreground }]}>Apply Now</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.offerDivider, { backgroundColor: colors.border }]} />

              <View style={styles.offerStats}>
                {[
                  { label: "Loan Amount", value: offer.loanRange },
                  { label: "Interest Rate", value: offer.rate },
                  { label: "Processing Fee", value: offer.processingFee },
                ].map((s, i) => (
                  <View key={i} style={styles.offerStat}>
                    <Text style={[styles.offerStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                    <Text style={[styles.offerStatValue, { color: colors.foreground }]}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Why explore offers */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          <View style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Why explore offers?</Text>
            <View style={styles.whyGrid}>
              {[
                { icon: "bar-chart-2", label: "Compare & Save", sub: "Compare rates and save more", color: "#4F46E5", bg: "#EEF2FF" },
                { icon: "file-text", label: "Better Terms", sub: "Get better interest rates and terms", color: "#10B981", bg: "#D1FAE5" },
                { icon: "clock", label: "Faster Disbursal", sub: "Quick disbursal with minimal paperwork", color: "#F59E0B", bg: "#FEF3C7" },
                { icon: "shield", label: "100% Secure", sub: "Your data is safe and secure", color: "#3B82F6", bg: "#DBEAFE" },
              ].map((w, i) => (
                <View key={i} style={styles.whyItem}>
                  <View style={[styles.whyIcon, { backgroundColor: w.bg }]}>
                    <Feather name={w.icon as any} size={18} color={w.color} />
                  </View>
                  <Text style={[styles.whyLabel, { color: colors.foreground }]}>{w.label}</Text>
                  <Text style={[styles.whySub, { color: colors.mutedForeground }]}>{w.sub}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimerBanner, { backgroundColor: colors.card, borderColor: colors.border, margin: 16 }]}>
          <Feather name="shield" size={16} color="#4F46E5" />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            Checking your eligibility will not affect your credit score.
          </Text>
        </View>
      </ScrollView>

      {showEligibility && <EligibilityModal onClose={() => setShowEligibility(false)} />}
      {applyOffer && <ApplyModal offer={applyOffer} onClose={() => setApplyOffer(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },

  heroBanner: { borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", marginBottom: 0, overflow: "hidden" },
  heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 28 },
  heroTitleAccent: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 30, marginBottom: 8 },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 16 },
  heroBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignSelf: "flex-start" },
  heroBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  heroImagePlaceholder: { width: 100, alignItems: "center", justifyContent: "center", position: "relative" },
  giftBox: { width: 72, height: 72, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  percentTag: { position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  percentText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },

  featurePills: { flexDirection: "row", padding: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1 },
  featurePill: { flex: 1, alignItems: "center", gap: 4 },
  featurePillIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  featurePillLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  featurePillSub: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  viewAllRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  offerCard: { borderRadius: 14, borderWidth: 1, padding: 14, overflow: "hidden" },
  offerTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  offerInitial: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  offerInitialText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  offerBank: { fontSize: 14, fontFamily: "Inter_700Bold" },
  offerType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  featuredBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  featuredText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  tagBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  tagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  offerMax: { fontSize: 13, fontFamily: "Inter_700Bold" },
  applyBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  applyBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  offerDivider: { height: 1, marginVertical: 12 },
  offerStats: { flexDirection: "row" },
  offerStat: { flex: 1 },
  offerStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 3 },
  offerStatValue: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  whyCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 0 },
  whyGrid: { flexDirection: "row", flexWrap: "wrap" },
  whyItem: { width: "50%", paddingBottom: 16, paddingRight: 8, alignItems: "flex-start" },
  whyIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  whyLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  whySub: { fontSize: 10, fontFamily: "Inter_400Regular", lineHeight: 14 },

  disclaimerBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, padding: 14 },
  disclaimerText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "88%" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  inputLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 46 },
  inputPrefix: { fontSize: 15, fontFamily: "Inter_500Medium", marginRight: 4 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  inputHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },

  tenureRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tenureChip: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  tenureChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  emiPreview: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  emiPreviewLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emiPreviewValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  emiPreviewNote: { fontSize: 11, fontFamily: "Inter_400Regular" },

  infoRow: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  infoCell: { flex: 1, padding: 12 },
  infoCellLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 4 },
  infoCellValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  actionBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  actionBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },

  reviewRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1 },
  reviewLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reviewBtns: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 12 },
  reviewBack: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: "center" },
  reviewBackText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  centeredState: { alignItems: "center", paddingVertical: 20, paddingHorizontal: 8 },
  checkingIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  checkingTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  checkingSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  resultCard: { borderRadius: 12, borderWidth: 1, padding: 16, width: "100%", alignItems: "center", gap: 4, marginBottom: 20 },
  resultAmount: { fontSize: 24, fontFamily: "Inter_700Bold" },
  resultRate: { fontSize: 13, fontFamily: "Inter_400Regular" },

  disclaimerRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
});
