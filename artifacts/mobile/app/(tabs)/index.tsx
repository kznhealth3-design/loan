import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
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

const LOANS = [
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
    icon: "home",
    iconLib: "feather" as const,
    iconColor: "#4F46E5",
    iconBg: "#EEF2FF",
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
    icon: "money-bill-wave",
    iconLib: "fa5" as const,
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
  },
];

const PAYMENTS = [
  {
    id: "1",
    title: "EMI Payment",
    subtitle: "Home Loan •••• 5678",
    amount: -200.0,
    date: "Apr 25, 2024",
    type: "emi",
  },
  {
    id: "2",
    title: "EMI Payment",
    subtitle: "Personal Loan •••• 4321",
    amount: -50.0,
    date: "Apr 10, 2024",
    type: "emi",
  },
  {
    id: "3",
    title: "Loan Disbursed",
    subtitle: "Personal Loan •••• 4321",
    amount: 2200.0,
    date: "Apr 01, 2024",
    type: "disbursed",
  },
];

const QUICK_ACTIONS = [
  { label: "Pay EMI", icon: "currency-rupee", lib: "material" as const, color: "#4F46E5" },
  { label: "Loan Statement", icon: "file-text", lib: "feather" as const, color: "#4F46E5" },
  { label: "EMI Calculator", icon: "calculator", lib: "material" as const, color: "#4F46E5" },
  { label: "Check Offers", icon: "percent", lib: "feather" as const, color: "#F59E0B" },
];

function LoanCard({ loan }: { loan: typeof LOANS[0] }) {
  const colors = useColors();

  return (
    <View style={[styles.loanCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.loanCardTop}>
        <View style={styles.loanCardLeft}>
          <View style={[styles.loanIconWrap, { backgroundColor: loan.iconBg }]}>
            {loan.iconLib === "feather" ? (
              <Feather name={loan.icon as any} size={20} color={loan.iconColor} />
            ) : (
              <FontAwesome5 name={loan.icon as any} size={16} color={loan.iconColor} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.loanType, { color: colors.foreground }]}>{loan.type}</Text>
            <Text style={[styles.loanId, { color: colors.mutedForeground }]}>Loan ID: {loan.loanId}</Text>
            <View style={[styles.activeBadge, { backgroundColor: "#D1FAE5" }]}>
              <Text style={[styles.activeBadgeText, { color: "#059669" }]}>Active</Text>
            </View>
          </View>
        </View>
        <View style={styles.loanCardRight}>
          <View>
            <Text style={[styles.loanLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
            <Text style={[styles.loanValue, { color: colors.foreground }]}>
              $ {loan.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.loanLabel, { color: colors.mutedForeground }]}>Next EMI</Text>
            <Text style={[styles.loanValue, { color: colors.foreground }]}>
              $ {loan.nextEmi.toFixed(2)}
            </Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.loanLabel, { color: colors.mutedForeground }]}>Due on</Text>
            <Text style={[styles.dueDateText, { color: colors.foreground }]}>{loan.dueDate}</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} style={{ alignSelf: "center" }} />
      </View>

      <View style={styles.progressRow}>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {Math.round(loan.progress * 100)}% Paid
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${loan.progress * 100}%` as any,
                backgroundColor: loan.iconColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {loan.paidEmis} of {loan.totalEmis} EMIs Paid
        </Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 12,
        paddingBottom: isWeb ? 34 + 84 : 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoLetter}>L</Text>
          </View>
          <Text style={styles.logoText}>
            <Text style={{ color: "#4F46E5" }}>Loan</Text>
            <Text style={{ color: "#1a1a2e" }}>Go</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="bell" size={18} color={colors.foreground} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        </View>
      </View>

      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
          Welcome back, Rahul! 👋
        </Text>
        <Text style={[styles.welcomeSub, { color: colors.mutedForeground }]}>
          Here's what's happening with your loans
        </Text>
      </View>

      {/* Summary Card */}
      <LinearGradient
        colors={["#5B52E8", "#3730A3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Total Outstanding  ⓘ</Text>
            <Text style={styles.summaryAmount}>$ 12,450.00</Text>
            <Text style={styles.summarySubtext}>Across 2 active loans</Text>
            <TouchableOpacity style={styles.summaryBtn}>
              <Text style={styles.summaryBtnText}>Make a Payment</Text>
              <Feather name="chevron-right" size={14} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Next EMI Due</Text>
            <Text style={styles.summaryAmount}>$ 250.00</Text>
            <View style={styles.dueDateRow}>
              <Feather name="calendar" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.summarySubtext}> Due on May 25, 2024</Text>
            </View>
            <TouchableOpacity style={styles.summaryBtnOutline}>
              <Text style={styles.summaryBtnOutlineText}>View My Loans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={[styles.quickActionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity key={i} style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#F0EFFF" }]}>
                {action.lib === "material" ? (
                  <MaterialCommunityIcons name={action.icon as any} size={22} color={action.color} />
                ) : (
                  <Feather name={action.icon as any} size={20} color={action.color} />
                )}
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loan Overview */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Loan Overview</Text>
          <TouchableOpacity style={styles.viewAllRow}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Loans</Text>
            <Feather name="arrow-right" size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {LOANS.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </View>

      {/* Promo Banner */}
      <View style={[styles.promoBanner, { backgroundColor: "#EEF2FF" }]}>
        <View style={styles.promoContent}>
          <Text style={[styles.promoTitle, { color: colors.foreground }]}>
            Get higher loan amounts instantly!
          </Text>
          <Text style={[styles.promoSub, { color: colors.mutedForeground }]}>
            Pre-approved offers just for you.
          </Text>
          <TouchableOpacity style={[styles.promoBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.promoBtnText}>Check Offers</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.promoImageArea}>
          <Text style={{ fontSize: 52 }}>💰</Text>
          <View style={styles.sparkles}>
            <Text style={{ fontSize: 14, position: "absolute", top: -10, right: 10 }}>✦</Text>
            <Text style={{ fontSize: 10, position: "absolute", top: 10, right: -2 }}>✦</Text>
            <Text style={{ fontSize: 12, position: "absolute", bottom: 0, right: 20 }}>✦</Text>
          </View>
        </View>
      </View>

      {/* My Payments */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Payments</Text>
          <TouchableOpacity style={styles.viewAllRow}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            <Feather name="arrow-right" size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.paymentsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PAYMENTS.map((payment, i) => (
            <View key={payment.id}>
              <TouchableOpacity style={styles.paymentItem}>
                <View style={[
                  styles.paymentIcon,
                  {
                    backgroundColor: payment.type === "disbursed" ? "#DBEAFE" : "#D1FAE5",
                  }
                ]}>
                  {payment.type === "emi" ? (
                    <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                  ) : (
                    <MaterialCommunityIcons name="bank-transfer" size={20} color="#3B82F6" />
                  )}
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={[styles.paymentTitle, { color: colors.foreground }]}>{payment.title}</Text>
                  <Text style={[styles.paymentSub, { color: colors.mutedForeground }]}>{payment.subtitle}</Text>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={[
                    styles.paymentAmount,
                    { color: payment.amount > 0 ? "#10B981" : colors.foreground }
                  ]}>
                    {payment.amount > 0 ? "+ " : "-"}${Math.abs(payment.amount).toFixed(2)}
                  </Text>
                  <Text style={[styles.paymentDate, { color: colors.mutedForeground }]}>{payment.date}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
              {i < PAYMENTS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 },
  logoText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: { color: "#4F46E5", fontFamily: "Inter_700Bold", fontSize: 16 },
  welcomeSection: { paddingHorizontal: 20, marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
  welcomeSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  summaryRow: { flexDirection: "row", alignItems: "flex-start" },
  summaryLeft: { flex: 1 },
  summaryRight: { flex: 1, paddingLeft: 14 },
  summaryDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "stretch", marginHorizontal: 4 },
  summaryLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 4 },
  summaryAmount: { color: "#ffffff", fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
  summarySubtext: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 12 },
  dueDateRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  summaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  summaryBtnText: { color: "#4F46E5", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  summaryBtnOutline: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  summaryBtnOutlineText: { color: "#ffffff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sectionContainer: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  viewAllRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewAllText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  quickActionsCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  quickAction: { flex: 1, alignItems: "center", gap: 8 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  loanCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  loanCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  loanCardLeft: { flexDirection: "row", gap: 10, flex: 1 },
  loanIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  loanType: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  loanId: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 6 },
  activeBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  activeBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  loanCardRight: { alignItems: "flex-end" },
  loanLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  loanValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dueDateText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  progressLabel: { fontSize: 10, fontFamily: "Inter_400Regular", minWidth: 48 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: { height: 6, borderRadius: 3 },
  promoBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    marginBottom: 20,
    overflow: "hidden",
  },
  promoContent: { flex: 1 },
  promoTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  promoSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 14 },
  promoBtn: { borderRadius: 8, paddingVertical: 9, paddingHorizontal: 16, alignSelf: "flex-start" },
  promoBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  promoImageArea: { width: 80, alignItems: "center", justifyContent: "center", position: "relative" },
  sparkles: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  paymentsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  paymentItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  paymentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  paymentDetails: { flex: 1 },
  paymentTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  paymentSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  paymentRight: { alignItems: "flex-end", marginRight: 6 },
  paymentAmount: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  paymentDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginLeft: 64 },
});
