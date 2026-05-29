import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { useListMyNotifications } from "@workspace/api-client-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ACTIVE_LOANS = [
  {
    id: "1", type: "Home Loan",     loanId: "HL12345678",
    outstanding: 10250.0, nextEmi: 200.0, dueDate: "May 25, 2024",
    progress: 0.6, paidEmis: 20, totalEmis: 30,
    icon: "home" as const, iconColor: "#4F46E5", iconBg: "#EEF2FF",
  },
  {
    id: "2", type: "Personal Loan", loanId: "PL87654321",
    outstanding: 2200.0, nextEmi: 50.0, dueDate: "Jun 10, 2024",
    progress: 0.8, paidEmis: 16, totalEmis: 20,
    icon: "credit-card" as const, iconColor: "#10B981", iconBg: "#D1FAE5",
  },
];

const PENDING_LOANS = [
  {
    id: "p1", type: "Car Loan", loanId: "CL20240501",
    appliedAmount: 35000, appliedOn: "May 01, 2024",
    bank: "AutoFin Bank", status: "Under Review",
    icon: "truck" as const, iconColor: "#F59E0B", iconBg: "#FEF3C7",
  },
];

const APPROVED_LOANS = [
  {
    id: "a1", type: "Home Loan", loanId: "HL12345678",
    approvedAmount: 10000000, approvedOn: "May 20, 2024",
    bank: "HomeFirst Bank", disbursalStatus: "Ready to Disburse",
    icon: "home" as const, iconColor: "#4F46E5", iconBg: "#D1FAE5",
  },
];

const PAYMENTS = [
  { id: "1", title: "EMI Payment",   subtitle: "Home Loan •••• 5678",    amount: -200.0,  date: "Apr 25, 2024", type: "emi" },
  { id: "2", title: "EMI Payment",   subtitle: "Personal Loan •••• 4321", amount: -50.0,   date: "Apr 10, 2024", type: "emi" },
  { id: "3", title: "Loan Disbursed",subtitle: "Personal Loan •••• 4321", amount: 2200.0,  date: "Apr 01, 2024", type: "disbursed" },
];

type LoanTab = "active" | "pending" | "approved" | "closed";

// ─── Notification Modal ───────────────────────────────────────────────────────
function NotifModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const notifs = [
    { icon: "check-circle", color: "#10B981", bg: "#D1FAE5", title: "Loan Approved", sub: "Your Home Loan has been approved!", time: "2h ago" },
    { icon: "calendar",     color: "#4F46E5", bg: "#EEF2FF", title: "EMI Reminder",  sub: "₹200 EMI due on May 25, 2024",      time: "1d ago" },
    { icon: "gift",         color: "#F59E0B", bg: "#FEF3C7", title: "New Offer",     sub: "Pre-approved personal loan offer",   time: "3d ago" },
    { icon: "alert-circle", color: "#EF4444", bg: "#FEE2E2", title: "Payment Due",   sub: "Your Car Loan EMI is due in 3 days", time: "3d ago" },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={nm.overlay} onPress={onClose}>
        <Pressable style={[nm.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={nm.handle} />
          <View style={nm.header}>
            <Text style={[nm.title, { color: colors.foreground }]}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={[nm.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          {notifs.map((n, i) => (
            <TouchableOpacity key={i} style={[nm.row, { borderBottomColor: colors.border }]} onPress={onClose}>
              <View style={[nm.icon, { backgroundColor: n.bg }]}>
                <Feather name={n.icon as any} size={18} color={n.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[nm.nTitle, { color: colors.foreground }]}>{n.title}</Text>
                <Text style={[nm.nSub, { color: colors.mutedForeground }]}>{n.sub}</Text>
              </View>
              <Text style={[nm.time, { color: colors.mutedForeground }]}>{n.time}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const nm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  nTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  nSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  time: { fontSize: 10, fontFamily: "Inter_400Regular" },
});

// ─── Payment Detail Modal ─────────────────────────────────────────────────────
function PaymentDetailModal({ payment, onClose }: { payment: typeof PAYMENTS[0]; onClose: () => void }) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={nm.overlay} onPress={onClose}>
        <Pressable style={[nm.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={nm.handle} />
          <View style={nm.header}>
            <Text style={[nm.title, { color: colors.foreground }]}>Payment Details</Text>
            <TouchableOpacity onPress={onClose} style={[nm.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={[pdm.amtBox, { backgroundColor: payment.amount > 0 ? "#D1FAE5" : "#EEF2FF" }]}>
            <Text style={[pdm.amtLabel, { color: "#6B7280" }]}>{payment.amount > 0 ? "Amount Credited" : "Amount Debited"}</Text>
            <Text style={[pdm.amt, { color: payment.amount > 0 ? "#10B981" : "#4F46E5" }]}>
              {payment.amount > 0 ? "+ " : "- "}${Math.abs(payment.amount).toFixed(2)}
            </Text>
          </View>
          {[
            { label: "Transaction Type", value: payment.title },
            { label: "Account",          value: payment.subtitle },
            { label: "Date",             value: payment.date },
            { label: "Status",           value: "Successful" },
            { label: "Reference No.",    value: "TXN" + Math.abs(payment.amount * 100).toFixed(0).padStart(10, "0") },
          ].map((r, i) => (
            <View key={i} style={[pdm.row, { borderBottomColor: colors.border }]}>
              <Text style={[pdm.label, { color: colors.mutedForeground }]}>{r.label}</Text>
              <Text style={[pdm.value, { color: colors.foreground }]}>{r.value}</Text>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const pdm = StyleSheet.create({
  amtBox: { borderRadius: 14, padding: 20, alignItems: "center", marginBottom: 16 },
  amtLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 },
  amt: { fontSize: 32, fontFamily: "Inter_700Bold" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  label: { fontSize: 13, fontFamily: "Inter_400Regular" },
  value: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "right" },
});

// ─── Withdraw Funds Modal ─────────────────────────────────────────────────────
function WithdrawModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [step, setStep] = useState<"review" | "confirm" | "success">("review");
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={nm.overlay} onPress={onClose}>
        <Pressable style={[nm.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={nm.handle} />
          <View style={nm.header}>
            <Text style={[nm.title, { color: colors.foreground }]}>Withdraw Funds</Text>
            <TouchableOpacity onPress={onClose} style={[nm.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {step === "review" && (
            <>
              <View style={[wm.approvedBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={wm.approvedLabel}>Approved Loan Amount</Text>
                <Text style={wm.approvedAmt}>$10,000,000.00</Text>
                <Text style={wm.approvedSub}>Home Loan • HL12345678</Text>
              </View>
              {[
                { label: "Disbursal Account",  value: "Bank of America •••• 7890" },
                { label: "Account Holder",      value: "John Doe" },
                { label: "IFSC / Routing",      value: "BOFA0001234" },
                { label: "Processing Time",     value: "1–2 business days" },
              ].map((r, i) => (
                <View key={i} style={[pdm.row, { borderBottomColor: colors.border }]}>
                  <Text style={[pdm.label, { color: colors.mutedForeground }]}>{r.label}</Text>
                  <Text style={[pdm.value, { color: colors.foreground }]}>{r.value}</Text>
                </View>
              ))}
              <TouchableOpacity style={[wm.btn, { backgroundColor: "#4F46E5", marginTop: 16 }]} onPress={() => setStep("confirm")}>
                <Text style={wm.btnText}>Confirm Withdrawal</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
            </>
          )}
          {step === "confirm" && (
            <View style={wm.center}>
              <View style={[wm.centerIcon, { backgroundColor: "#FEF3C7" }]}>
                <Feather name="alert-circle" size={36} color="#D97706" />
              </View>
              <Text style={[wm.centerTitle, { color: colors.foreground }]}>Confirm Withdrawal</Text>
              <Text style={[wm.centerSub, { color: colors.mutedForeground }]}>
                $10,000,000.00 will be transferred to your bank account ending in 7890. This action cannot be undone.
              </Text>
              <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
                <TouchableOpacity style={[wm.ghostBtn, { borderColor: colors.border, flex: 1 }]} onPress={() => setStep("review")}>
                  <Text style={[wm.ghostTxt, { color: colors.foreground }]}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[wm.btn, { backgroundColor: "#4F46E5", flex: 1 }]} onPress={() => setStep("success")}>
                  <Text style={wm.btnText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {step === "success" && (
            <View style={wm.center}>
              <View style={[wm.centerIcon, { backgroundColor: "#D1FAE5" }]}>
                <Feather name="check-circle" size={36} color="#10B981" />
              </View>
              <Text style={[wm.centerTitle, { color: colors.foreground }]}>Withdrawal Initiated!</Text>
              <Text style={[wm.centerSub, { color: colors.mutedForeground }]}>
                Your funds will be credited to your bank account within 1–2 business days.
              </Text>
              <View style={[wm.refBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular" }}>Reference Number</Text>
                <Text style={{ fontSize: 18, color: "#4F46E5", fontFamily: "Inter_700Bold" }}>WD{Date.now().toString().slice(-8)}</Text>
              </View>
              <TouchableOpacity style={[wm.btn, { backgroundColor: "#4F46E5" }]} onPress={onClose}>
                <Text style={wm.btnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 10 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const wm = StyleSheet.create({
  approvedBox: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", marginBottom: 8 },
  approvedLabel: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular" },
  approvedAmt: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#4F46E5", marginVertical: 4 },
  approvedSub: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  ghostBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderRadius: 12, paddingVertical: 14 },
  ghostTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  center: { alignItems: "center", paddingVertical: 10 },
  centerIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  centerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8 },
  centerSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 16 },
  refBox: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 4, width: "100%", marginBottom: 16 },
});

// ─── Loan Statement Modal ─────────────────────────────────────────────────────
function LoanStatementModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [selected, setSelected] = useState("Home Loan •••• 5678");
  const [period, setPeriod] = useState("2024");
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={nm.overlay} onPress={onClose}>
        <Pressable style={[nm.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={nm.handle} />
          <View style={nm.header}>
            <Text style={[nm.title, { color: colors.foreground }]}>Loan Statement</Text>
            <TouchableOpacity onPress={onClose} style={[nm.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 14 }}>
            Download your loan statement for tax and record purposes.
          </Text>
          {/* Loan selector */}
          <Text style={[lsm.fieldLabel, { color: colors.foreground }]}>Select Loan</Text>
          <TouchableOpacity style={[lsm.picker, { borderColor: open1 ? "#4F46E5" : colors.border, backgroundColor: colors.accent }]} onPress={() => { setOpen1(!open1); setOpen2(false); }}>
            <Text style={[{ flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground }]}>{selected}</Text>
            <Feather name={open1 ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {open1 && ["Home Loan •••• 5678", "Personal Loan •••• 4321"].map((o) => (
            <TouchableOpacity key={o} style={[lsm.option, { borderColor: colors.border }]} onPress={() => { setSelected(o); setOpen1(false); }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: o === selected ? "#4F46E5" : colors.foreground }}>{o}</Text>
              {o === selected && <Feather name="check" size={13} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
          <Text style={[lsm.fieldLabel, { color: colors.foreground, marginTop: 12 }]}>Financial Year</Text>
          <TouchableOpacity style={[lsm.picker, { borderColor: open2 ? "#4F46E5" : colors.border, backgroundColor: colors.accent }]} onPress={() => { setOpen2(!open2); setOpen1(false); }}>
            <Text style={[{ flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground }]}>FY {period}</Text>
            <Feather name={open2 ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {open2 && ["2024", "2023", "2022"].map((y) => (
            <TouchableOpacity key={y} style={[lsm.option, { borderColor: colors.border }]} onPress={() => { setPeriod(y); setOpen2(false); }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: y === period ? "#4F46E5" : colors.foreground }}>FY {y}</Text>
              {y === period && <Feather name="check" size={13} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[wm.btn, { backgroundColor: "#4F46E5", marginTop: 20 }]}
            onPress={() => Alert.alert("Download Started", `Downloading ${selected} statement for FY ${period}`, [{ text: "OK", onPress: onClose }])}>
            <Feather name="download" size={16} color="#fff" />
            <Text style={wm.btnText}>Download Statement</Text>
          </TouchableOpacity>
          <View style={{ height: 16 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const lsm = StyleSheet.create({
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  picker: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48, marginBottom: 4 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1 },
});

// ─── EMI Calc Modal ───────────────────────────────────────────────────────────
function EMICalcModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [amount, setAmount] = useState("25000");
  const [rate,   setRate]   = useState("10.5");
  const [tenure, setTenure] = useState("24");
  const [show,   setShow]   = useState(false);
  const p = parseFloat(amount) || 0;
  const r = (parseFloat(rate) || 0) / 12 / 100;
  const n = parseInt(tenure) || 1;
  const emi = r > 0 ? (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1) : p/n;
  const total = emi * n;
  const interest = total - p;
  const [amt, setAmt] = useState("");
  const [rat, setRat] = useState("");
  const [ten, setTen] = useState("");
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={nm.overlay} onPress={onClose}>
        <Pressable style={[nm.sheet, { backgroundColor: colors.card, maxHeight: "92%" }]} onPress={() => {}}>
          <View style={nm.handle} />
          <View style={nm.header}>
            <Text style={[nm.title, { color: colors.foreground }]}>EMI Calculator</Text>
            <TouchableOpacity onPress={onClose} style={[nm.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {[
              { label: "Loan Amount ($)", val: amount, set: setAmount, ph: "e.g. 25000" },
              { label: "Interest Rate (% p.a.)", val: rate, set: setRate, ph: "e.g. 10.5" },
              { label: "Tenure (months)", val: tenure, set: setTenure, ph: "e.g. 24" },
            ].map((f) => (
              <View key={f.label} style={{ marginBottom: 12 }}>
                <Text style={[lsm.fieldLabel, { color: colors.foreground }]}>{f.label}</Text>
                <View style={[lsm.picker, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                  <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: "Inter_400Regular" }} onPress={() => {}}>{f.val || f.ph}</Text>
                </View>
                {/* Simple number input using TextInput-like view */}
                <View style={[lsm.picker, { borderColor: "#4F46E5", backgroundColor: colors.card, position: "absolute", opacity: 0, width: "100%", top: 22 }]} />
              </View>
            ))}
            <TouchableOpacity style={[wm.btn, { backgroundColor: "#4F46E5" }]} onPress={() => setShow(true)}>
              <Text style={wm.btnText}>Calculate EMI</Text>
            </TouchableOpacity>
            {show && (
              <View style={[ec.card, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={ec.emiLabel}>Monthly EMI</Text>
                <Text style={ec.emiValue}>${isNaN(emi) ? "—" : emi.toFixed(2)}</Text>
                <View style={[ec.div, { backgroundColor: "#C7D2FE" }]} />
                <View style={ec.grid}>
                  {[
                    { l: "Principal",     v: `$${p.toLocaleString("en-US",{minimumFractionDigits:2})}` },
                    { l: "Total Interest",v: `$${isNaN(interest) ? "—" : interest.toFixed(2)}` },
                    { l: "Total Payment", v: `$${isNaN(total) ? "—" : total.toFixed(2)}` },
                    { l: "Loan Tenure",   v: `${n} months` },
                  ].map((r, i) => (
                    <View key={i} style={ec.gridItem}>
                      <Text style={ec.gridLabel}>{r.l}</Text>
                      <Text style={ec.gridValue}>{r.v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const ec = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 18, alignItems: "center", marginTop: 14 },
  emiLabel: { fontSize: 13, color: "#6B7280", fontFamily: "Inter_400Regular" },
  emiValue: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#4F46E5", marginVertical: 6 },
  div: { height: 1, width: "100%", marginVertical: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", width: "100%" },
  gridItem: { width: "50%", paddingVertical: 5, paddingHorizontal: 4 },
  gridLabel: { fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular" },
  gridValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1F2937", marginTop: 2 },
});

// ─── Loan Detail Modal ────────────────────────────────────────────────────────
function LoanDetailModal({ loan, onClose }: { loan: typeof APPROVED_LOANS[0]; onClose: () => void }) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={nm.overlay} onPress={onClose}>
        <Pressable style={[nm.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={nm.handle} />
          <View style={nm.header}>
            <Text style={[nm.title, { color: colors.foreground }]}>Loan Details</Text>
            <TouchableOpacity onPress={onClose} style={[nm.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={[ldm.statusBanner, { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7" }]}>
            <Feather name="check-circle" size={20} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={ldm.statusTitle}>Loan Approved</Text>
              <Text style={ldm.statusSub}>Ready to disburse to your bank account</Text>
            </View>
          </View>
          {[
            { label: "Loan Type",        value: loan.type },
            { label: "Loan ID",          value: loan.loanId },
            { label: "Lender",           value: loan.bank },
            { label: "Approved Amount",  value: `$${loan.approvedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
            { label: "Approved On",      value: loan.approvedOn },
            { label: "Disbursal Status", value: loan.disbursalStatus },
          ].map((r, i) => (
            <View key={i} style={[pdm.row, { borderBottomColor: colors.border }]}>
              <Text style={[pdm.label, { color: colors.mutedForeground }]}>{r.label}</Text>
              <Text style={[pdm.value, { color: r.label === "Disbursal Status" ? "#10B981" : colors.foreground }]}>{r.value}</Text>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const ldm = StyleSheet.create({
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  statusTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#065F46" },
  statusSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#047857", marginTop: 2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const { data: notifs } = useListMyNotifications();
  const unreadCount = notifs?.filter((n) => !n.read).length ?? 0;

  const [loanTab,       setLoanTab]       = useState<LoanTab>("active");
  const [showNotif,     setShowNotif]     = useState(false);
  const [showWithdraw,  setShowWithdraw]  = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [showCalc,      setShowCalc]      = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof PAYMENTS[0] | null>(null);
  const [selectedLoan,    setSelectedLoan]    = useState<typeof APPROVED_LOANS[0] | null>(null);

  const LOAN_TABS: { key: LoanTab; label: string; count: number }[] = [
    { key: "active",   label: "Active Loans",  count: 2 },
    { key: "pending",  label: "Pending",        count: 1 },
    { key: "approved", label: "Approved",       count: 1 },
    { key: "closed",   label: "Closed",         count: 0 },
  ];

  const totalOutstanding = ACTIVE_LOANS.reduce((s, l) => s + l.outstanding, 0);
  const totalNextEmi = ACTIVE_LOANS.reduce((s, l) => s + l.nextEmi, 0);
  const nextEmiLoan = ACTIVE_LOANS.reduce((earliest, l) => {
    const d1 = new Date(earliest.dueDate); const d2 = new Date(l.dueDate);
    return d2 < d1 ? l : earliest;
  }, ACTIVE_LOANS[0]);

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: isWeb ? 110 : 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}>
            <Text style={s.logoLetter}>L</Text>
          </View>
          <Text style={s.logoText}>
            <Text style={{ color: "#4F46E5" }}>Loan</Text>
            <Text style={{ color: "#1a1a2e" }}>Go</Text>
          </Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={[s.bellBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/notifications" as any)}>
            <Feather name="bell" size={18} color={colors.foreground} />
            {unreadCount > 0 && <View style={s.notifDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/more")}>
            <View style={[s.avatar, { backgroundColor: "#4F46E5" }]}>
              <Text style={s.avatarText}>R</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Welcome ───────────────────────────────────────────────────── */}
      <View style={s.welcomeWrap}>
        <Text style={[s.welcomeTitle, { color: colors.foreground }]}>Welcome back, Rahul! 👋</Text>
        <Text style={[s.welcomeSub, { color: colors.mutedForeground }]}>Here's what's happening with your loans</Text>
      </View>

      {/* ── Summary Card ─────────────────────────────────────────────── */}
      <LinearGradient colors={["#6366F1", "#4338CA"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.summaryCard}>
        <View style={s.summaryRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={s.sumLabel}>Total Outstanding</Text>
              <Feather name="info" size={12} color="rgba(255,255,255,0.65)" />
            </View>
            <Text style={s.sumAmt}>$ {totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Text>
            <Text style={s.sumSub}>Across {ACTIVE_LOANS.length} active loans</Text>
            <TouchableOpacity style={s.sumBtnFilled} onPress={() => router.push("/(tabs)/emi-payments")}>
              <Text style={s.sumBtnFilledText}>Make a Payment</Text>
              <Feather name="chevron-right" size={14} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View style={s.sumDivider} />

          <View style={{ flex: 1, paddingLeft: 16 }}>
            <Text style={s.sumLabel}>Next EMI Due</Text>
            <Text style={s.sumAmt}>$ {totalNextEmi.toFixed(2)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 }}>
              <Feather name="calendar" size={11} color="rgba(255,255,255,0.65)" />
              <Text style={s.sumSub}>Due on {nextEmiLoan.dueDate}</Text>
            </View>
            <TouchableOpacity style={s.sumBtnOutline} onPress={() => router.push("/(tabs)/my-loans")}>
              <Text style={s.sumBtnOutlineText}>View My Loans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={[s.qaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Pay EMI",         icon: "refresh-cw",  color: "#4F46E5", bg: "#EEF2FF", onPress: () => router.push("/(tabs)/emi-payments") },
            { label: "Loan Statement",  icon: "file-text",   color: "#4F46E5", bg: "#EEF2FF", onPress: () => setShowStatement(true) },
            { label: "EMI Calculator",  icon: "sliders",     color: "#4F46E5", bg: "#EEF2FF", onPress: () => setShowCalc(true) },
            { label: "Check Offers",    icon: "percent",     color: "#F59E0B", bg: "#FEF3C7", onPress: () => router.push("/(tabs)/offers") },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={s.qa} onPress={a.onPress} activeOpacity={0.7}>
              <View style={[s.qaIcon, { backgroundColor: a.bg }]}>
                <Feather name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={[s.qaLabel, { color: colors.foreground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Loan Overview ─────────────────────────────────────────────── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Your Loan Overview</Text>
          <TouchableOpacity style={s.viewAllRow} onPress={() => router.push("/(tabs)/my-loans")}>
            <Text style={[s.viewAllText, { color: "#4F46E5" }]}>View All Loans</Text>
            <Feather name="arrow-right" size={13} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Tab Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 2 }}>
          {LOAN_TABS.map((tab) => (
            <TouchableOpacity key={tab.key} style={[s.tab, loanTab === tab.key && s.tabActive]}
              onPress={() => setLoanTab(tab.key)}>
              <Text style={[s.tabText, { color: loanTab === tab.key ? "#4F46E5" : colors.mutedForeground }]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Tab */}
        {loanTab === "active" && (
          <View style={{ marginTop: 12, gap: 10 }}>
            {ACTIVE_LOANS.map((loan) => (
              <TouchableOpacity key={loan.id} style={[s.loanCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/(tabs)/my-loans")} activeOpacity={0.8}>
                <View style={s.loanCardTop}>
                  <View style={[s.loanIcon, { backgroundColor: loan.iconBg }]}>
                    <Feather name={loan.icon} size={20} color={loan.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[s.loanType, { color: colors.foreground }]}>{loan.type}</Text>
                      <View style={[s.badge, { backgroundColor: "#D1FAE5" }]}>
                        <Text style={[s.badgeText, { color: "#059669" }]}>Active</Text>
                      </View>
                    </View>
                    <Text style={[s.loanId, { color: colors.mutedForeground }]}>Loan ID: {loan.loanId}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.loanMeta, { color: colors.mutedForeground }]}>Outstanding</Text>
                    <Text style={[s.loanVal, { color: colors.foreground }]}>${loan.outstanding.toLocaleString()}</Text>
                    <Text style={[s.loanMeta, { color: colors.mutedForeground, marginTop: 4 }]}>Next EMI</Text>
                    <Text style={[s.loanVal, { color: colors.foreground }]}>${loan.nextEmi.toFixed(2)}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ alignSelf: "center", marginLeft: 4 }} />
                </View>
                <View style={s.progRow}>
                  <Text style={[s.progLabel, { color: colors.mutedForeground }]}>{Math.round(loan.progress * 100)}% Paid</Text>
                  <View style={[s.progTrack, { backgroundColor: colors.muted }]}>
                    <View style={[s.progBar, { width: `${loan.progress * 100}%` as any, backgroundColor: loan.iconColor }]} />
                  </View>
                  <Text style={[s.progLabel, { color: colors.mutedForeground }]}>{loan.paidEmis}/{loan.totalEmis} EMIs</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pending Tab */}
        {loanTab === "pending" && (
          <View style={{ marginTop: 12 }}>
            {PENDING_LOANS.map((loan) => (
              <View key={loan.id} style={[s.loanCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={s.loanCardTop}>
                  <View style={[s.loanIcon, { backgroundColor: loan.iconBg }]}>
                    <Feather name={loan.icon} size={20} color={loan.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[s.loanType, { color: colors.foreground }]}>{loan.type}</Text>
                      <View style={[s.badge, { backgroundColor: "#FEF3C7" }]}>
                        <Text style={[s.badgeText, { color: "#D97706" }]}>Pending</Text>
                      </View>
                    </View>
                    <Text style={[s.loanId, { color: colors.mutedForeground }]}>Loan ID: {loan.loanId}</Text>
                    <Text style={[s.loanId, { color: colors.mutedForeground }]}>Applied on {loan.appliedOn}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.loanMeta, { color: colors.mutedForeground }]}>Applied Amount</Text>
                    <Text style={[s.loanVal, { color: colors.foreground }]}>${loan.appliedAmount.toLocaleString()}</Text>
                    <Text style={[s.loanMeta, { color: colors.mutedForeground, marginTop: 4 }]}>Status</Text>
                    <Text style={[s.loanVal, { color: "#D97706", fontSize: 11 }]}>{loan.status}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ alignSelf: "center", marginLeft: 4 }} />
                </View>
                <View style={[s.pendingInfo, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
                  <Feather name="clock" size={13} color="#D97706" />
                  <Text style={s.pendingInfoText}>Your application is under review. We'll notify you once it's processed.</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Approved Tab */}
        {loanTab === "approved" && (
          <View style={{ marginTop: 12 }}>
            {APPROVED_LOANS.map((loan) => (
              <View key={loan.id} style={[s.loanCard, { backgroundColor: colors.card, borderColor: "#86EFAC", borderLeftWidth: 4, borderLeftColor: "#10B981" }]}>
                <View style={s.loanCardTop}>
                  <View style={[s.loanIcon, { backgroundColor: "#D1FAE5" }]}>
                    <Feather name="check-circle" size={20} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[s.loanType, { color: colors.foreground }]}>{loan.type}</Text>
                      <View style={[s.badge, { backgroundColor: "#DBEAFE" }]}>
                        <Text style={[s.badgeText, { color: "#2563EB" }]}>Approved</Text>
                      </View>
                    </View>
                    <Text style={[s.loanId, { color: colors.mutedForeground }]}>Loan ID: {loan.loanId}</Text>
                    <Text style={[s.loanId, { color: colors.mutedForeground }]}>Approved on {loan.approvedOn}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[s.loanMeta, { color: colors.mutedForeground }]}>Approved Amount</Text>
                    <Text style={[s.loanVal, { color: colors.foreground }]}>$ {loan.approvedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Text>
                    <Text style={[s.loanMeta, { color: colors.mutedForeground, marginTop: 4 }]}>Disbursal Status</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Text style={[s.loanVal, { color: "#10B981", fontSize: 11 }]}>{loan.disbursalStatus}</Text>
                      <Feather name="info" size={11} color="#10B981" />
                    </View>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ alignSelf: "center", marginLeft: 4 }} />
                </View>

                {/* Congrats Banner */}
                <View style={[s.congrRow, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
                  <Feather name="check-circle" size={15} color="#10B981" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.congrTitle}>Congratulations! <Text style={{ color: "#10B981" }}>Your loan has been approved.</Text></Text>
                    <Text style={s.congrSub}>The approved amount will be disbursed to your bank account.</Text>
                  </View>
                  <TouchableOpacity style={[s.viewDetailsBtn, { backgroundColor: "#4F46E5" }]}
                    onPress={() => router.push("/loan-detail")}>
                    <Text style={s.viewDetailsBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Need Funds Banner */}
            <View style={[s.fundsBanner, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.fundsTitle, { color: "#1a1a2e" }]}>Need funds from your loan?</Text>
                <Text style={[s.fundsSub, { color: "#6B7280" }]}>Withdraw the approved amount directly to your bank account.</Text>
                <TouchableOpacity style={[s.withdrawBtn, { backgroundColor: "#4F46E5" }]} onPress={() => setShowWithdraw(true)}>
                  <Text style={s.withdrawBtnText}>Withdraw Funds</Text>
                  <Feather name="arrow-right" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={s.fundsIllustration}>
                <View style={[s.bankIcon, { backgroundColor: "#4F46E5" }]}>
                  <Feather name="home" size={22} color="#fff" />
                </View>
                <View style={[s.coinStack]}>
                  {[0,1,2].map((i) => (
                    <View key={i} style={[s.coin, { backgroundColor: i === 0 ? "#F59E0B" : "#FCD34D", bottom: i * 6 }]} />
                  ))}
                </View>
                <View style={[s.checkCircle, { backgroundColor: "#10B981" }]}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Closed Tab */}
        {loanTab === "closed" && (
          <View style={[s.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={40} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
            <Text style={[s.emptyTitle, { color: colors.foreground }]}>No Closed Loans</Text>
            <Text style={[s.emptySub, { color: colors.mutedForeground }]}>You don't have any closed loans yet.</Text>
          </View>
        )}
      </View>

      {/* ── My Payments ──────────────────────────────────────────────── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>My Payments</Text>
          <TouchableOpacity style={s.viewAllRow} onPress={() => router.push("/(tabs)/emi-payments")}>
            <Text style={[s.viewAllText, { color: "#4F46E5" }]}>View All</Text>
            <Feather name="arrow-right" size={13} color="#4F46E5" />
          </TouchableOpacity>
        </View>
        <View style={[s.paymentsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PAYMENTS.map((payment, i) => (
            <View key={payment.id}>
              <TouchableOpacity style={s.paymentRow} onPress={() => setSelectedPayment(payment)} activeOpacity={0.7}>
                <View style={[s.paymentIcon, { backgroundColor: payment.type === "disbursed" ? "#DBEAFE" : "#D1FAE5" }]}>
                  <Feather
                    name={payment.type === "emi" ? "check-circle" : "arrow-down-circle"}
                    size={20}
                    color={payment.type === "disbursed" ? "#3B82F6" : "#10B981"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.payTitle, { color: colors.foreground }]}>{payment.title}</Text>
                  <Text style={[s.paySub, { color: colors.mutedForeground }]}>{payment.subtitle}</Text>
                </View>
                <View style={{ alignItems: "flex-end", marginRight: 6 }}>
                  <Text style={[s.payAmt, { color: payment.amount > 0 ? "#10B981" : colors.foreground }]}>
                    {payment.amount > 0 ? "+ " : "-"}${Math.abs(payment.amount).toFixed(2)}
                  </Text>
                  <Text style={[s.payDate, { color: colors.mutedForeground }]}>{payment.date}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
              {i < PAYMENTS.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>
      </View>

      {/* Modals */}
      {showNotif     && <NotifModal         onClose={() => setShowNotif(false)} />}
      {showWithdraw  && <WithdrawModal      onClose={() => setShowWithdraw(false)} />}
      {showStatement && <LoanStatementModal onClose={() => setShowStatement(false)} />}
      {showCalc      && <EMICalcModal       onClose={() => setShowCalc(false)} />}
      {selectedPayment && <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />}
      {selectedLoan    && <LoanDetailModal   loan={selectedLoan}    onClose={() => setSelectedLoan(null)} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 14 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center" },
  logoLetter: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 },
  logoText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#fff" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },

  /* Welcome */
  welcomeWrap: { paddingHorizontal: 20, marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
  welcomeSub: { fontSize: 13, fontFamily: "Inter_400Regular" },

  /* Summary Card */
  summaryCard: { marginHorizontal: 16, borderRadius: 18, padding: 20, marginBottom: 22 },
  summaryRow: { flexDirection: "row", alignItems: "flex-start" },
  sumLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 4 },
  sumAmt: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sumSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 12 },
  sumDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "stretch", marginHorizontal: 6 },
  sumBtnFilled: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12, alignSelf: "flex-start" },
  sumBtnFilledText: { color: "#4F46E5", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sumBtnOutline: { borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12, alignSelf: "flex-start" },
  sumBtnOutlineText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },

  /* Sections */
  section: { paddingHorizontal: 16, marginBottom: 22 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  viewAllRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  viewAllText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  /* Quick Actions */
  qaCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 8 },
  qa: { flex: 1, alignItems: "center", gap: 8 },
  qaIcon: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },

  /* Loan Overview Tabs */
  tab: { paddingHorizontal: 12, paddingVertical: 10, marginRight: 4, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#4F46E5" },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  /* Loan Cards */
  loanCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  loanCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  loanIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  loanType: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  loanId: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  loanMeta: { fontSize: 10, fontFamily: "Inter_400Regular" },
  loanVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  progRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  progLabel: { fontSize: 10, fontFamily: "Inter_400Regular", minWidth: 52 },
  progTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progBar: { height: 6, borderRadius: 3 },

  /* Pending info */
  pendingInfo: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 8, borderWidth: 1, padding: 10, marginTop: 10 },
  pendingInfoText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: "#92400E", lineHeight: 16 },

  /* Approved / Congrats */
  congrRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 12 },
  congrTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1F2937", marginBottom: 2 },
  congrSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" },
  viewDetailsBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, alignSelf: "flex-start" },
  viewDetailsBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },

  /* Need Funds Banner */
  fundsBanner: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 12 },
  fundsTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  fundsSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 12 },
  withdrawBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignSelf: "flex-start" },
  withdrawBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  fundsIllustration: { width: 80, alignItems: "center", justifyContent: "center", position: "relative", height: 80 },
  bankIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", position: "absolute", top: 0, right: 0 },
  coinStack: { position: "absolute", bottom: 0, left: 0, width: 36, height: 30 },
  coin: { position: "absolute", width: 36, height: 12, borderRadius: 6, left: 0 },
  checkCircle: { position: "absolute", top: 30, left: 30, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },

  /* Empty state */
  emptyState: { borderRadius: 14, borderWidth: 1, padding: 40, alignItems: "center", marginTop: 12 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  /* Payments */
  paymentsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  paymentRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  paymentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  payTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  paySub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  payAmt: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  payDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginLeft: 64 },
});
