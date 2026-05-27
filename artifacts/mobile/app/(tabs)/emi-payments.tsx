import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const PAYMENTS = [
  { id: "1", title: "EMI Payment", subtitle: "Home Loan •••• 5678", amount: -200.0, date: "Apr 25, 2024", type: "emi", status: "Success" },
  { id: "2", title: "EMI Payment", subtitle: "Personal Loan •••• 4321", amount: -50.0, date: "Apr 10, 2024", type: "emi", status: "Success" },
  { id: "3", title: "Loan Disbursed", subtitle: "Personal Loan •••• 4321", amount: 2200.0, date: "Apr 01, 2024", type: "disbursed", status: "Credited" },
  { id: "4", title: "EMI Payment", subtitle: "Home Loan •••• 5678", amount: -200.0, date: "Mar 25, 2024", type: "emi", status: "Success" },
  { id: "5", title: "EMI Payment", subtitle: "Personal Loan •••• 4321", amount: -50.0, date: "Mar 10, 2024", type: "emi", status: "Success" },
  { id: "6", title: "EMI Payment", subtitle: "Home Loan •••• 5678", amount: -200.0, date: "Feb 25, 2024", type: "emi", status: "Success" },
];

export default function EmiPaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>EMI Payments</Text>
      </View>

      {/* Summary strip */}
      <View style={[styles.summaryStrip, { backgroundColor: "#EEF2FF" }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: "#6B7280" }]}>Next EMI</Text>
          <Text style={[styles.summaryValue, { color: "#4F46E5" }]}>$250.00</Text>
          <Text style={[styles.summaryDate, { color: "#6B7280" }]}>May 25, 2024</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: "#C7D2FE" }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: "#6B7280" }]}>Total Paid</Text>
          <Text style={[styles.summaryValue, { color: "#10B981" }]}>$4,600.00</Text>
          <Text style={[styles.summaryDate, { color: "#6B7280" }]}>All loans</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: "#C7D2FE" }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: "#6B7280" }]}>Upcoming</Text>
          <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>$250.00</Text>
          <Text style={[styles.summaryDate, { color: "#6B7280" }]}>This month</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.payNowBtn, { backgroundColor: "#4F46E5" }]}>
        <Feather name="credit-card" size={16} color="#fff" />
        <Text style={styles.payNowText}>Pay All EMIs Now</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isWeb ? 34 + 84 : 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.listTitle, { color: colors.foreground }]}>Transaction History</Text>

        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PAYMENTS.map((payment, i) => (
            <View key={payment.id}>
              <TouchableOpacity style={styles.paymentItem}>
                <View style={[
                  styles.paymentIcon,
                  { backgroundColor: payment.type === "disbursed" ? "#DBEAFE" : "#D1FAE5" },
                ]}>
                  {payment.type === "emi" ? (
                    <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                  ) : (
                    <MaterialCommunityIcons name="bank-transfer" size={20} color="#3B82F6" />
                  )}
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentTitle, { color: colors.foreground }]}>{payment.title}</Text>
                  <Text style={[styles.paymentSub, { color: colors.mutedForeground }]}>{payment.subtitle}</Text>
                </View>
                <View style={styles.paymentMeta}>
                  <Text style={[
                    styles.paymentAmount,
                    { color: payment.amount > 0 ? "#10B981" : colors.foreground },
                  ]}>
                    {payment.amount > 0 ? "+" : "-"}${Math.abs(payment.amount).toFixed(2)}
                  </Text>
                  <Text style={[styles.paymentDate, { color: colors.mutedForeground }]}>{payment.date}</Text>
                </View>
                <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
              {i < PAYMENTS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 3 },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  summaryDate: { fontSize: 10, fontFamily: "Inter_400Regular" },
  summaryDivider: { width: 1, marginHorizontal: 4 },
  payNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  payNowText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  listTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  listCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  paymentItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  paymentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  paymentSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  paymentMeta: { alignItems: "flex-end", marginRight: 6 },
  paymentAmount: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  paymentDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginLeft: 64 },
});
