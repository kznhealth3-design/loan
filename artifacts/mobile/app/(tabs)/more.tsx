import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

// ─── Shared Bottom Sheet Shell ────────────────────────────────────────────────
function Sheet({
  visible, onClose, title, children,
}: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={sh.overlay} onPress={onClose}>
        <Pressable style={[sh.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={sh.handle} />
          <View style={sh.header}>
            <Text style={[sh.title, { color: colors.foreground }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={[sh.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const sh = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "92%" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, keyboardType = "default" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any;
}) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground, marginBottom: 6 }}>{label}</Text>
      <View style={[fd.box, { borderColor: focused ? "#4F46E5" : colors.border, backgroundColor: colors.accent }]}>
        <TextInput
          style={[fd.input, { color: colors.foreground }]}
          value={value} onChangeText={onChange} placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}
const fd = StyleSheet.create({
  box: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
});

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ label, sub, value, onChange, icon }: {
  label: string; sub: string; value: boolean; onChange: (v: boolean) => void; icon: any;
}) {
  const colors = useColors();
  return (
    <View style={[tr.row, { borderBottomColor: colors.border }]}>
      <View style={[tr.icon, { backgroundColor: "#EEF2FF" }]}>
        <Feather name={icon} size={16} color="#4F46E5" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[tr.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[tr.sub, { color: colors.mutedForeground }]}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: "#E5E7EB", true: "#818CF8" }} thumbColor={value ? "#4F46E5" : "#f4f3f4"} />
    </View>
  );
}
const tr = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14, fontFamily: "Inter_500Medium" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});

// ─── Review Row ───────────────────────────────────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[rr.row, { borderBottomColor: colors.border }]}>
      <Text style={[rr.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[rr.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}
const rr = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  label: { fontSize: 13, fontFamily: "Inter_400Regular" },
  value: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "right", flex: 1, marginLeft: 16 },
});

// ─── Primary Button ───────────────────────────────────────────────────────────
function PrimaryBtn({ label, onPress, icon }: { label: string; onPress: () => void; icon?: any }) {
  return (
    <TouchableOpacity style={[pb.btn, { backgroundColor: "#4F46E5" }]} onPress={onPress}>
      {icon && <Feather name={icon} size={16} color="#fff" />}
      <Text style={pb.text}>{label}</Text>
    </TouchableOpacity>
  );
}
const pb = StyleSheet.create({
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 15, marginTop: 10 },
  text: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={[faq.wrap, { borderColor: colors.border }]}>
      <TouchableOpacity style={faq.row} onPress={() => setOpen(!open)}>
        <Text style={[faq.q, { color: colors.foreground }]}>{q}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
      {open && <Text style={[faq.a, { color: colors.mutedForeground }]}>{a}</Text>}
    </View>
  );
}
const faq = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 10, marginBottom: 8, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  q: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", paddingRight: 8 },
  a: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, paddingHorizontal: 14, paddingBottom: 14 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Personal Information ──────────────────────────────────────────────────────
function PersonalInfoModal({ onClose }: { onClose: () => void }) {
  const [name, setName]   = useState("John Doe");
  const [email, setEmail] = useState("john.doe@email.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [dob,   setDob]   = useState("15 Jan 1990");
  const [addr,  setAddr]  = useState("123 Main Street, New York, NY 10001");
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(onClose, 800); };
  return (
    <Sheet visible onClose={onClose} title="Personal Information">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View style={[av.circle, { backgroundColor: "#4F46E5" }]}>
            <Text style={av.letter}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={av.changeBtn}>
            <Text style={av.changeTxt}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        <Field label="Full Name"        value={name}  onChange={setName}  placeholder="Your full name" />
        <Field label="Email Address"    value={email} onChange={setEmail} placeholder="Email" keyboardType="email-address" />
        <Field label="Mobile Number"    value={phone} onChange={setPhone} placeholder="Phone" keyboardType="phone-pad" />
        <Field label="Date of Birth"    value={dob}   onChange={setDob}   placeholder="DD Mon YYYY" />
        <Field label="Current Address"  value={addr}  onChange={setAddr}  placeholder="Address" />
        {saved
          ? <View style={[save_s.success]}><Feather name="check-circle" size={16} color="#10B981" /><Text style={save_s.text}>Saved successfully!</Text></View>
          : <PrimaryBtn label="Save Changes" onPress={save} icon="check" />}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const av = StyleSheet.create({
  circle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  letter: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  changeBtn: { marginTop: 8 },
  changeTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },
});
const save_s = StyleSheet.create({
  success: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, backgroundColor: "#D1FAE5", borderRadius: 12, marginTop: 10 },
  text: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#10B981" },
});

// ── KYC Information ───────────────────────────────────────────────────────────
function KYCModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const docs = [
    { label: "Identity Proof",  type: "Passport",          status: "Verified",  date: "12 Jan 2024" },
    { label: "Address Proof",   type: "Utility Bill",      status: "Verified",  date: "12 Jan 2024" },
    { label: "Income Proof",    type: "Pay Stub",          status: "Verified",  date: "15 Jan 2024" },
    { label: "Bank Statement",  type: "Last 3 months",     status: "Verified",  date: "15 Jan 2024" },
    { label: "PAN / Tax ID",    type: "Government ID",     status: "Pending",   date: "—" },
  ];
  return (
    <Sheet visible onClose={onClose} title="KYC Information">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[kyc.statusCard, { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7" }]}>
          <Feather name="shield" size={22} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={kyc.statusTitle}>KYC Verified</Text>
            <Text style={kyc.statusSub}>Your KYC is complete. Verified on 15 Jan 2024</Text>
          </View>
        </View>
        <Text style={[kyc.sectionLabel, { color: colors.foreground }]}>Submitted Documents</Text>
        {docs.map((d, i) => (
          <View key={i} style={[kyc.docRow, { backgroundColor: colors.accent, borderColor: colors.border }]}>
            <View style={[kyc.docIcon, { backgroundColor: d.status === "Verified" ? "#D1FAE5" : "#FEF3C7" }]}>
              <Feather name={d.status === "Verified" ? "check-circle" : "clock"} size={16} color={d.status === "Verified" ? "#10B981" : "#D97706"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[kyc.docLabel, { color: colors.foreground }]}>{d.label}</Text>
              <Text style={[kyc.docType, { color: colors.mutedForeground }]}>{d.type}</Text>
            </View>
            <View>
              <View style={[kyc.badge, { backgroundColor: d.status === "Verified" ? "#D1FAE5" : "#FEF3C7" }]}>
                <Text style={[kyc.badgeText, { color: d.status === "Verified" ? "#10B981" : "#D97706" }]}>{d.status}</Text>
              </View>
              <Text style={[kyc.docDate, { color: colors.mutedForeground }]}>{d.date}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const kyc = StyleSheet.create({
  statusCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  statusTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#065F46" },
  statusSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#047857", marginTop: 2 },
  sectionLabel: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 12 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  docIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  docLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  docType: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-end" },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  docDate: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "right" },
});

// ── Alerts & Preferences ──────────────────────────────────────────────────────
function AlertsModal({ onClose }: { onClose: () => void }) {
  const [emi,      setEmi]      = useState(true);
  const [offers,   setOffers]   = useState(true);
  const [payment,  setPayment]  = useState(true);
  const [promo,    setPromo]    = useState(false);
  const [sms,      setSms]      = useState(true);
  const [email,    setEmail]    = useState(true);
  const [push,     setPush]     = useState(true);
  const colors = useColors();
  return (
    <Sheet visible onClose={onClose} title="Alerts & Preferences">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[alts.section, { color: colors.foreground }]}>Notification Types</Text>
        <ToggleRow label="EMI Reminders"       sub="Get reminded before EMI due dates"   value={emi}     onChange={setEmi}     icon="calendar" />
        <ToggleRow label="Payment Alerts"      sub="Instant alerts on payment success"   value={payment} onChange={setPayment} icon="check-circle" />
        <ToggleRow label="Loan Offers"         sub="New loan offers tailored for you"    value={offers}  onChange={setOffers}  icon="gift" />
        <ToggleRow label="Promotions"          sub="Special deals and promotions"        value={promo}   onChange={setPromo}   icon="tag" />
        <Text style={[alts.section, { color: colors.foreground, marginTop: 18 }]}>Communication Channels</Text>
        <ToggleRow label="Push Notifications"  sub="In-app & device notifications"      value={push}    onChange={setPush}    icon="bell" />
        <ToggleRow label="SMS Alerts"          sub="Text messages to your mobile"        value={sms}     onChange={setSms}     icon="message-square" />
        <ToggleRow label="Email Notifications" sub="Updates sent to your email"          value={email}   onChange={setEmail}   icon="mail" />
        <PrimaryBtn label="Save Preferences" onPress={onClose} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const alts = StyleSheet.create({
  section: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
});

// ── Security ──────────────────────────────────────────────────────────────────
function SecurityModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [tab, setTab] = useState<"pin" | "pass" | "bio">("pin");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confPin, setConfPin] = useState("");
  const [biometrics, setBiometrics] = useState(true);
  const [faceId,     setFaceId]     = useState(false);
  const changePin = () => {
    if (!oldPin || !newPin || !confPin) { Alert.alert("Error", "Please fill all fields"); return; }
    if (newPin !== confPin) { Alert.alert("Error", "New PINs do not match"); return; }
    if (newPin.length < 4) { Alert.alert("Error", "PIN must be at least 4 digits"); return; }
    Alert.alert("Success", "PIN changed successfully!", [{ text: "OK", onPress: onClose }]);
  };
  return (
    <Sheet visible onClose={onClose} title="Security">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tab switcher */}
        <View style={[sec.tabs, { backgroundColor: colors.muted }]}>
          {([["pin","Change PIN"],["pass","Password"],["bio","Biometrics"]] as const).map(([id,label]) => (
            <TouchableOpacity key={id} style={[sec.tab, tab === id && { backgroundColor: colors.card }]} onPress={() => setTab(id)}>
              <Text style={[sec.tabText, { color: tab === id ? "#4F46E5" : colors.mutedForeground }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "pin" && (
          <>
            <View style={[sec.infoBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
              <Feather name="lock" size={14} color="#4F46E5" />
              <Text style={sec.infoText}>Your PIN is used to authorize payments and access sensitive features.</Text>
            </View>
            <Field label="Current PIN"  value={oldPin}  onChange={setOldPin}  placeholder="Enter current PIN"  keyboardType="numeric" />
            <Field label="New PIN"      value={newPin}  onChange={setNewPin}  placeholder="Enter new PIN (min 4 digits)" keyboardType="numeric" />
            <Field label="Confirm PIN"  value={confPin} onChange={setConfPin} placeholder="Re-enter new PIN"   keyboardType="numeric" />
            <PrimaryBtn label="Change PIN" onPress={changePin} icon="lock" />
          </>
        )}
        {tab === "pass" && (
          <>
            <View style={[sec.infoBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
              <Feather name="key" size={14} color="#4F46E5" />
              <Text style={sec.infoText}>Use a strong password with letters, numbers and symbols.</Text>
            </View>
            <Field label="Current Password" value=""    onChange={() => {}} placeholder="Enter current password" />
            <Field label="New Password"     value=""    onChange={() => {}} placeholder="Enter new password" />
            <Field label="Confirm Password" value=""    onChange={() => {}} placeholder="Re-enter new password" />
            <PrimaryBtn label="Change Password" onPress={() => Alert.alert("Success", "Password changed successfully!", [{ text: "OK", onPress: onClose }])} icon="key" />
          </>
        )}
        {tab === "bio" && (
          <>
            <View style={[sec.infoBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
              <Feather name="shield" size={14} color="#4F46E5" />
              <Text style={sec.infoText}>Biometric authentication adds an extra layer of security to your account.</Text>
            </View>
            <ToggleRow label="Fingerprint Unlock"  sub="Use fingerprint to log in and authorize" value={biometrics} onChange={setBiometrics} icon="zap" />
            <ToggleRow label="Face ID"             sub="Use Face ID to unlock the app"           value={faceId}     onChange={setFaceId}     icon="eye" />
            <PrimaryBtn label="Save Settings" onPress={() => Alert.alert("Saved", "Biometric settings updated.", [{ text: "OK", onPress: onClose }])} />
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const sec = StyleSheet.create({
  tabs: { flexDirection: "row", borderRadius: 10, padding: 3, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14 },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "#4F46E5", lineHeight: 17 },
});

// ── Help & Support ────────────────────────────────────────────────────────────
function HelpModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const faqs = [
    { q: "How do I make an EMI payment?", a: "Go to EMI Payments tab, select your loan, and tap 'Pay Now'. Choose UPI, Card, or Net Banking to complete payment." },
    { q: "Can I prepay my loan early?", a: "Yes! Use the Foreclosure Calculator in Loan Tools to see your outstanding amount and charges, then raise a foreclosure request." },
    { q: "How do I update my personal details?", a: "Go to More → Personal Information. Edit the fields and tap 'Save Changes'. Some changes may require KYC re-verification." },
    { q: "Why was my loan application rejected?", a: "Common reasons include low credit score, insufficient income, or incomplete documentation. Contact our support team for details." },
    { q: "How long does disbursement take?", a: "Once approved and all documents verified, funds are typically disbursed within 24–48 business hours." },
  ];
  return (
    <Sheet visible onClose={onClose} title="Help & Support">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact options */}
        <View style={[hp.contactRow]}>
          {[
            { icon: "phone",          label: "Call Us",      sub: "1-800-555-0199",    color: "#10B981", bg: "#D1FAE5" },
            { icon: "message-circle", label: "Live Chat",    sub: "Avg. 2 min reply",  color: "#4F46E5", bg: "#EEF2FF" },
            { icon: "mail",           label: "Email Us",     sub: "support@loango.com",color: "#F59E0B", bg: "#FEF3C7" },
          ].map((c, i) => (
            <TouchableOpacity key={i} style={[hp.contactCard, { backgroundColor: colors.accent, borderColor: colors.border }]}
              onPress={() => Alert.alert(c.label, `We'll connect you via ${c.label.toLowerCase()}`)}>
              <View style={[hp.contactIcon, { backgroundColor: c.bg }]}>
                <Feather name={c.icon as any} size={18} color={c.color} />
              </View>
              <Text style={[hp.contactLabel, { color: colors.foreground }]}>{c.label}</Text>
              <Text style={[hp.contactSub, { color: colors.mutedForeground }]}>{c.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[alts.section, { color: colors.foreground, marginBottom: 12 }]}>Frequently Asked Questions</Text>
        {faqs.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
        <View style={[hp.ticket, { backgroundColor: colors.accent, borderColor: colors.border }]}>
          <Text style={[hp.ticketTitle, { color: colors.foreground }]}>Raise a Support Ticket</Text>
          <Text style={[hp.ticketSub, { color: colors.mutedForeground }]}>Can't find what you're looking for? Submit a request and our team will get back to you within 24 hours.</Text>
          <PrimaryBtn label="Submit Request" onPress={() => Alert.alert("Ticket Raised", "Your ticket #TKT-" + Math.floor(Math.random()*90000+10000) + " has been raised. Expect a reply within 24 hours.")} icon="send" />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const hp = StyleSheet.create({
  contactRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  contactCard: { flex: 1, alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  contactIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  contactSub: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  ticket: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 12 },
  ticketTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  ticketSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, color: "#6B7280" },
});

// ── EMI Calculator ────────────────────────────────────────────────────────────
function EMICalcModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [amount,  setAmount]  = useState("25000");
  const [rate,    setRate]    = useState("10.5");
  const [tenure,  setTenure]  = useState("24");
  const [showRes, setShowRes] = useState(false);

  const p = parseFloat(amount) || 0;
  const r = (parseFloat(rate) || 0) / 12 / 100;
  const n = parseInt(tenure) || 1;
  const emi = r > 0 ? (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1) : p/n;
  const totalAmt = emi * n;
  const totalInt = totalAmt - p;

  return (
    <Sheet visible onClose={onClose} title="Loan EMI Calculator">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Field label="Loan Amount ($)"       value={amount}  onChange={setAmount}  keyboardType="numeric" placeholder="e.g. 25000" />
        <Field label="Interest Rate (% p.a.)" value={rate}   onChange={setRate}    keyboardType="decimal-pad" placeholder="e.g. 10.5" />
        <Field label="Tenure (months)"        value={tenure} onChange={setTenure}  keyboardType="numeric" placeholder="e.g. 24" />
        <PrimaryBtn label="Calculate EMI" onPress={() => setShowRes(true)} icon="calculator" />
        {showRes && (
          <View style={[emi_s.resultCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
            <Text style={emi_s.emiLabel}>Monthly EMI</Text>
            <Text style={emi_s.emiValue}>${isNaN(emi) ? "—" : emi.toFixed(2)}</Text>
            <View style={[emi_s.divLine, { backgroundColor: "#C7D2FE" }]} />
            <View style={emi_s.grid}>
              {[
                { label: "Principal Amount", value: `$${p.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Total Interest",   value: `$${isNaN(totalInt) ? "—" : totalInt.toFixed(2)}` },
                { label: "Total Payment",    value: `$${isNaN(totalAmt) ? "—" : totalAmt.toFixed(2)}` },
                { label: "Loan Tenure",      value: `${n} months` },
              ].map((r, i) => (
                <View key={i} style={emi_s.gridItem}>
                  <Text style={emi_s.gridLabel}>{r.label}</Text>
                  <Text style={emi_s.gridValue}>{r.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const emi_s = StyleSheet.create({
  resultCard: { borderRadius: 14, borderWidth: 1, padding: 18, alignItems: "center", marginTop: 14 },
  emiLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280" },
  emiValue: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#4F46E5", marginVertical: 6 },
  divLine: { height: 1, width: "100%", marginVertical: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", width: "100%" },
  gridItem: { width: "50%", paddingVertical: 6, paddingHorizontal: 4 },
  gridLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" },
  gridValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1F2937", marginTop: 2 },
});

// ── Eligibility Check ─────────────────────────────────────────────────────────
function EligibilityModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const [income,  setIncome]  = useState("");
  const [score,   setScore]   = useState("");
  const [age,     setAge]     = useState("");
  const [exp,     setExp]     = useState("");
  const [phase,   setPhase]   = useState<"form"|"checking"|"result">("form");

  const check = () => {
    if (!income || !score) { Alert.alert("Required", "Please fill income and credit score."); return; }
    setPhase("checking");
    setTimeout(() => setPhase("result"), 2000);
  };
  const inc = parseFloat(income) || 0;
  const sc  = parseInt(score) || 0;
  const eligible = inc >= 2000 && sc >= 600;
  const maxLoan = eligible ? Math.min(inc * 24, 500000) : 0;

  return (
    <Sheet visible onClose={onClose} title="Eligibility Check">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {phase === "form" && (
          <>
            <View style={[sec.infoBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
              <Feather name="info" size={14} color="#4F46E5" />
              <Text style={sec.infoText}>This check will not affect your credit score.</Text>
            </View>
            <Field label="Monthly Income ($)"       value={income} onChange={setIncome} keyboardType="numeric" placeholder="e.g. 5000" />
            <Field label="Credit Score (approx.)"   value={score}  onChange={setScore}  keyboardType="numeric" placeholder="e.g. 750" />
            <Field label="Age (years)"               value={age}    onChange={setAge}    keyboardType="numeric" placeholder="e.g. 30" />
            <Field label="Work Experience (years)"   value={exp}    onChange={setExp}    keyboardType="numeric" placeholder="e.g. 5" />
            <PrimaryBtn label="Check Eligibility" onPress={check} icon="search" />
          </>
        )}
        {phase === "checking" && (
          <View style={elig.center}>
            <View style={[elig.iconWrap, { backgroundColor: "#EEF2FF" }]}>
              <Feather name="loader" size={36} color="#4F46E5" />
            </View>
            <Text style={[elig.bigText, { color: colors.foreground }]}>Checking Eligibility…</Text>
            <Text style={[elig.sub, { color: colors.mutedForeground }]}>Scanning offers from 50+ lenders</Text>
          </View>
        )}
        {phase === "result" && (
          <View style={elig.center}>
            <View style={[elig.iconWrap, { backgroundColor: eligible ? "#D1FAE5" : "#FEE2E2" }]}>
              <Feather name={eligible ? "check-circle" : "x-circle"} size={36} color={eligible ? "#10B981" : "#EF4444"} />
            </View>
            <Text style={[elig.bigText, { color: colors.foreground }]}>{eligible ? "You're Pre-Approved!" : "Not Eligible Yet"}</Text>
            <Text style={[elig.sub, { color: colors.mutedForeground }]}>
              {eligible ? "Based on your profile, you qualify for:" : "Improve your credit score or income to qualify."}
            </Text>
            {eligible && (
              <View style={[elig.resultCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={elig.amount}>${maxLoan.toLocaleString()}</Text>
                <Text style={elig.rateTxt}>Starting at 8.49% p.a.</Text>
                <View style={[elig.divLine, { backgroundColor: "#C7D2FE" }]} />
                {[
                  { label: "Monthly Income",  value: `$${inc.toLocaleString()}` },
                  { label: "Credit Score",    value: score },
                  { label: "Max Loan Amount", value: `$${maxLoan.toLocaleString()}` },
                  { label: "Recommendation",  value: "Personal Loan" },
                ].map((r, i) => <ReviewRow key={i} label={r.label} value={r.value} />)}
              </View>
            )}
            <TouchableOpacity style={[elig.resetBtn]} onPress={() => setPhase("form")}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#4F46E5" }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const elig = StyleSheet.create({
  center: { alignItems: "center", paddingVertical: 12 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  bigText: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 16 },
  resultCard: { borderRadius: 14, borderWidth: 1, padding: 16, width: "100%", alignItems: "center", marginBottom: 16 },
  amount: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#4F46E5" },
  rateTxt: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 4, marginBottom: 12 },
  divLine: { height: 1, width: "100%", marginBottom: 8 },
  resetBtn: { marginTop: 8, padding: 8 },
});

// ── Foreclosure Calculator ────────────────────────────────────────────────────
function ForeclosureModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const LOANS = [
    { id: "1", label: "Personal Loan — Finstar Bank", outstanding: 12450.00, rate: 8.49, months: 18 },
    { id: "2", label: "Car Loan — AutoFin",           outstanding: 24800.00, rate: 7.50, months: 36 },
  ];
  const [selected, setSelected] = useState(LOANS[0]);
  const [open, setOpen] = useState(false);
  const fee = selected.outstanding * 0.02;
  const total = selected.outstanding + fee;

  return (
    <Sheet visible onClose={onClose} title="Foreclosure Calculator">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[sec.infoBox, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
          <Feather name="alert-triangle" size={14} color="#D97706" />
          <Text style={[sec.infoText, { color: "#92400E" }]}>Foreclosure charges (typically 2%) apply when closing a loan before its tenure ends.</Text>
        </View>
        <Text style={[fd.box && { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground, marginBottom: 6 }]}>Select Loan</Text>
        <TouchableOpacity style={[fcl.picker, { borderColor: open ? "#4F46E5" : colors.border, backgroundColor: colors.card }]}
          onPress={() => setOpen(!open)}>
          <Text style={[{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground }]}>{selected.label}</Text>
          <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
        {open && (
          <View style={[fcl.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {LOANS.map((l) => (
              <TouchableOpacity key={l.id} style={[fcl.dropItem, { borderBottomColor: colors.border }]}
                onPress={() => { setSelected(l); setOpen(false); }}>
                <Text style={{ fontSize: 13, fontFamily: l.id === selected.id ? "Inter_600SemiBold" : "Inter_400Regular", color: l.id === selected.id ? "#4F46E5" : colors.foreground }}>{l.label}</Text>
                {l.id === selected.id && <Feather name="check" size={14} color="#4F46E5" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[fcl.resultCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
          <Text style={fcl.totalLabel}>Total Foreclosure Amount</Text>
          <Text style={fcl.totalValue}>${total.toFixed(2)}</Text>
          <View style={[elig.divLine, { backgroundColor: "#C7D2FE", marginBottom: 8 }]} />
          <ReviewRow label="Outstanding Principal" value={`$${selected.outstanding.toFixed(2)}`} />
          <ReviewRow label="Foreclosure Fee (2%)" value={`$${fee.toFixed(2)}`} />
          <ReviewRow label="Interest Rate" value={`${selected.rate}% p.a.`} />
          <ReviewRow label="Remaining Tenure" value={`${selected.months} months`} />
        </View>
        <PrimaryBtn label="Request Foreclosure" onPress={() => Alert.alert("Request Sent", "Your foreclosure request has been submitted. Our team will contact you within 24 hours.", [{ text: "OK", onPress: onClose }])} icon="send" />
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const fcl = StyleSheet.create({
  picker: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48, marginBottom: 6 },
  dropdown: { borderWidth: 1.5, borderRadius: 10, marginBottom: 10, overflow: "hidden" },
  dropItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1 },
  resultCard: { borderRadius: 14, borderWidth: 1, padding: 18, alignItems: "center", marginTop: 14, marginBottom: 4 },
  totalLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280" },
  totalValue: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#4F46E5", marginVertical: 6 },
});

// ── Refer & Earn ──────────────────────────────────────────────────────────────
function ReferModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const code = "LOANGO-JD2024";
  const [copied, setCopied] = useState(false);
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <Sheet visible onClose={onClose} title="Refer & Earn">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={ref_s.hero}>
          <Text style={ref_s.emoji}>🎁</Text>
          <Text style={[ref_s.heroTitle, { color: colors.foreground }]}>Earn $50 for every referral!</Text>
          <Text style={[ref_s.heroSub, { color: colors.mutedForeground }]}>Share your code with friends. When they take their first loan, you both get rewarded.</Text>
        </View>
        <View style={[ref_s.codeBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
          <Text style={ref_s.codeLabel}>Your Referral Code</Text>
          <Text style={ref_s.code}>{code}</Text>
          <TouchableOpacity style={[ref_s.copyBtn, { backgroundColor: copied ? "#10B981" : "#4F46E5" }]} onPress={copy}>
            <Feather name={copied ? "check" : "copy"} size={14} color="#fff" />
            <Text style={ref_s.copyText}>{copied ? "Copied!" : "Copy Code"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[alts.section, { color: colors.foreground, marginBottom: 12, marginTop: 16 }]}>Your Referral Stats</Text>
        <View style={ref_s.statsRow}>
          {[{ label: "Total Referred", value: "3" }, { label: "Pending", value: "1" }, { label: "Earned", value: "$100" }].map((s,i) => (
            <View key={i} style={[ref_s.statCard, { backgroundColor: colors.accent, borderColor: colors.border }]}>
              <Text style={[ref_s.statValue, { color: "#4F46E5" }]}>{s.value}</Text>
              <Text style={[ref_s.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
        <PrimaryBtn label="Share with Friends" onPress={() => Alert.alert("Share", "Sharing referral code: " + code)} icon="share-2" />
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const ref_s = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 20 },
  emoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 6 },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  codeBox: { borderRadius: 14, borderWidth: 1, padding: 18, alignItems: "center", gap: 8 },
  codeLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280" },
  code: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#4F46E5", letterSpacing: 2 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginTop: 4 },
  copyText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  statCard: { flex: 1, alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 14 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});

// ── Privacy Policy ────────────────────────────────────────────────────────────
function PrivacyModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const secs = [
    { title: "1. Information We Collect", body: "We collect personal information such as your name, email address, phone number, date of birth, and financial information necessary to process loan applications. We also collect device information and usage data to improve our services." },
    { title: "2. How We Use Your Information", body: "Your information is used to process loan applications, verify your identity (KYC), communicate with you about your account, provide customer support, improve our services, and comply with legal obligations." },
    { title: "3. Information Sharing", body: "We do not sell your personal information to third parties. We may share your data with lending partners for loan processing, credit bureaus for credit checks, and regulatory authorities as required by law." },
    { title: "4. Data Security", body: "We employ industry-standard encryption (AES-256) and security measures to protect your personal information. All data transmissions are secured using TLS/SSL protocols." },
    { title: "5. Your Rights", body: "You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time. Contact our support team to exercise these rights." },
    { title: "6. Cookies & Tracking", body: "We use cookies and similar tracking technologies to improve your experience. You can control cookie settings through your device or browser settings." },
    { title: "7. Updates to This Policy", body: "We may update this Privacy Policy periodically. We'll notify you of significant changes via email or in-app notification. Continued use of the app constitutes acceptance of updates." },
  ];
  return (
    <Sheet visible onClose={onClose} title="Privacy Policy">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 16 }]}>Last updated: January 15, 2024</Text>
        {secs.map((s, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>{s.title}</Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 20 }}>{s.body}</Text>
          </View>
        ))}
        <PrimaryBtn label="I Understand" onPress={onClose} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}

// ── Terms & Conditions ────────────────────────────────────────────────────────
function TermsModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const secs = [
    { title: "1. Acceptance of Terms", body: "By using LoanGo, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use of the app immediately." },
    { title: "2. Eligibility", body: "You must be at least 18 years old and a legal resident of the United States to use LoanGo. You must provide accurate and complete information during registration." },
    { title: "3. Loan Applications", body: "Submitting a loan application does not guarantee approval. Approval is subject to creditworthiness, income verification, and lender discretion. LoanGo acts as a marketplace and is not the lender." },
    { title: "4. Fees & Charges", body: "LoanGo does not charge users for browsing offers. Loan-related fees (processing fees, interest) are determined by individual lenders and disclosed before you apply." },
    { title: "5. EMI Payments", body: "You are responsible for making timely EMI payments. Late payments may result in penalty charges and negative credit reporting. AutoPay enrollment is recommended to avoid missed payments." },
    { title: "6. Account Termination", body: "LoanGo reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform." },
    { title: "7. Limitation of Liability", body: "LoanGo is not liable for decisions made by lenders, credit score impacts from loan applications, or financial losses resulting from loan products obtained through the platform." },
  ];
  return (
    <Sheet visible onClose={onClose} title="Terms & Conditions">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 16 }}>Last updated: January 15, 2024</Text>
        {secs.map((s, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>{s.title}</Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 20 }}>{s.body}</Text>
          </View>
        ))}
        <PrimaryBtn label="I Accept" onPress={onClose} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}

// ── About App ─────────────────────────────────────────────────────────────────
function AboutModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  return (
    <Sheet visible onClose={onClose} title="About App">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={about.hero}>
          <View style={[about.logo, { backgroundColor: "#4F46E5" }]}>
            <Text style={about.logoText}>LG</Text>
          </View>
          <Text style={[about.appName, { color: colors.foreground }]}>LoanGo</Text>
          <Text style={[about.version, { color: colors.mutedForeground }]}>Version 2.4.1</Text>
        </View>
        <View style={[about.card, { backgroundColor: colors.accent, borderColor: colors.border }]}>
          {[
            { label: "App Version",      value: "2.4.1" },
            { label: "Build Number",     value: "241" },
            { label: "Platform",         value: Platform.OS === "web" ? "Web" : Platform.OS === "ios" ? "iOS" : "Android" },
            { label: "Last Updated",     value: "January 15, 2024" },
            { label: "Developer",        value: "LoanGo Technologies Inc." },
            { label: "Support Email",    value: "support@loango.com" },
          ].map((r, i) => <ReviewRow key={i} label={r.label} value={r.value} />)}
        </View>
        <Text style={[{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", marginTop: 16, lineHeight: 20 }]}>
          LoanGo is your trusted companion for managing loans, tracking EMIs, and finding the best loan offers from top lenders.
          {"\n\n"}© 2024 LoanGo Technologies Inc. All rights reserved.
        </Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Sheet>
  );
}
const about = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 20 },
  logo: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  appName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  version: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  card: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
type ModalKey = "personal" | "kyc" | "alerts" | "security" | "help" | "emi" | "eligibility" | "foreclosure" | "refer" | "privacy" | "terms" | "about" | null;

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [modal, setModal] = useState<ModalKey>(null);
  const open = (m: ModalKey) => setModal(m);
  const close = () => setModal(null);

  const confirmLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of LoanGo?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => Alert.alert("Logged Out", "You have been logged out successfully.") },
      ]
    );
  };

  const SECTIONS = [
    {
      title: "Manage",
      items: [
        { key: "personal" as ModalKey,    icon: "user",         label: "Personal Information",  sub: "View and update your personal details",         badge: null },
        { key: "kyc" as ModalKey,         icon: "file-text",    label: "KYC Information",       sub: "View your KYC status and documents",             badge: "Verified" },
        { key: "alerts" as ModalKey,      icon: "bell",         label: "Alerts & Preferences",  sub: "Manage notifications and communication preferences", badge: null },
        { key: "security" as ModalKey,    icon: "lock",         label: "Security",              sub: "Manage login, PIN and security settings",         badge: null },
        { key: "help" as ModalKey,        icon: "help-circle",  label: "Help & Support",        sub: "Get help, view FAQs or raise a request",         badge: null },
      ],
    },
    {
      title: "Loan Tools",
      items: [
        { key: "emi" as ModalKey,         icon: "grid",         label: "Loan EMI Calculator",   sub: "Calculate EMI for different loan amounts",        badge: null },
        { key: "eligibility" as ModalKey, icon: "pie-chart",    label: "Eligibility Check",     sub: "Check your loan eligibility in seconds",          badge: null },
        { key: "foreclosure" as ModalKey, icon: "tag",          label: "Foreclosure Calculator",sub: "Calculate your foreclosure amount",               badge: null },
      ],
    },
    {
      title: "General",
      items: [
        { key: "refer" as ModalKey,       icon: "share-2",      label: "Refer & Earn",          sub: "Refer your friends and earn rewards",             badge: null },
        { key: "privacy" as ModalKey,     icon: "shield",       label: "Privacy Policy",        sub: "Read our privacy policy",                        badge: null },
        { key: "terms" as ModalKey,       icon: "file-text",    label: "Terms & Conditions",    sub: "Read our terms and conditions",                   badge: null },
        { key: "about" as ModalKey,       icon: "info",         label: "About App",             sub: "App version 2.4.1",                              badge: null },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>More</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Manage your profile, preferences and app settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 100 : 110 }}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <View key={item.label}>
                  <TouchableOpacity style={styles.row} onPress={() => open(item.key)} activeOpacity={0.7}>
                    <View style={[styles.iconWrap, { backgroundColor: "#EEF2FF" }]}>
                      <Feather name={item.icon as any} size={18} color="#4F46E5" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                      <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                    </View>
                    {item.badge && (
                      <View style={[styles.verifiedBadge, { backgroundColor: "#D1FAE5" }]}>
                        <Feather name="check-circle" size={11} color="#10B981" />
                        <Text style={styles.verifiedText}>{item.badge}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                  {i < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: "#4F46E5" }]} onPress={confirmLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color="#4F46E5" />
          <Text style={[styles.logoutText, { color: "#4F46E5" }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      {modal === "personal"    && <PersonalInfoModal onClose={close} />}
      {modal === "kyc"         && <KYCModal          onClose={close} />}
      {modal === "alerts"      && <AlertsModal       onClose={close} />}
      {modal === "security"    && <SecurityModal     onClose={close} />}
      {modal === "help"        && <HelpModal         onClose={close} />}
      {modal === "emi"         && <EMICalcModal      onClose={close} />}
      {modal === "eligibility" && <EligibilityModal  onClose={close} />}
      {modal === "foreclosure" && <ForeclosureModal  onClose={close} />}
      {modal === "refer"       && <ReferModal        onClose={close} />}
      {modal === "privacy"     && <PrivacyModal      onClose={close} />}
      {modal === "terms"       && <TermsModal        onClose={close} />}
      {modal === "about"       && <AboutModal        onClose={close} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 10, paddingHorizontal: 2 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  verifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#10B981" },
  divider: { height: 1, marginLeft: 66 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, borderWidth: 1.5, paddingVertical: 16, marginTop: 4 },
  logoutText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
