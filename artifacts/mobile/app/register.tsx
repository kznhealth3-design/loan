import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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

const BLUE = "#1E56E5";
const isWeb = Platform.OS === "web";

// ─── Data ──────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India",
  "Germany", "France", "Spain", "Italy", "Netherlands", "Brazil", "Mexico",
  "Japan", "South Korea", "Singapore", "UAE", "Saudi Arabia", "South Africa",
  "Nigeria", "Kenya", "New Zealand", "Ireland", "Sweden", "Norway", "Denmark",
];

const PHONE_CODES = [
  { code: "+1",   flag: "🇺🇸", label: "US" },
  { code: "+44",  flag: "🇬🇧", label: "UK" },
  { code: "+1",   flag: "🇨🇦", label: "CA" },
  { code: "+61",  flag: "🇦🇺", label: "AU" },
  { code: "+91",  flag: "🇮🇳", label: "IN" },
  { code: "+49",  flag: "🇩🇪", label: "DE" },
  { code: "+33",  flag: "🇫🇷", label: "FR" },
  { code: "+34",  flag: "🇪🇸", label: "ES" },
  { code: "+39",  flag: "🇮🇹", label: "IT" },
  { code: "+31",  flag: "🇳🇱", label: "NL" },
  { code: "+55",  flag: "🇧🇷", label: "BR" },
  { code: "+52",  flag: "🇲🇽", label: "MX" },
  { code: "+81",  flag: "🇯🇵", label: "JP" },
  { code: "+82",  flag: "🇰🇷", label: "KR" },
  { code: "+65",  flag: "🇸🇬", label: "SG" },
  { code: "+971", flag: "🇦🇪", label: "AE" },
  { code: "+966", flag: "🇸🇦", label: "SA" },
  { code: "+27",  flag: "🇿🇦", label: "ZA" },
  { code: "+234", flag: "🇳🇬", label: "NG" },
  { code: "+254", flag: "🇰🇪", label: "KE" },
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const EMPLOYMENT_STATUSES = [
  "Employed (Full-time)", "Employed (Part-time)", "Self-Employed",
  "Business Owner", "Freelancer / Contractor", "Student", "Unemployed", "Retired",
];

const REFERRAL_SOURCES = [
  { key: "facebook",   icon: "facebook",        color: "#1877F2", label: "Facebook" },
  { key: "instagram",  icon: "instagram",       color: "#E4405F", label: "Instagram" },
  { key: "google",     icon: "search",          color: "#4285F4", label: "Google Search" },
  { key: "youtube",    icon: "youtube",         color: "#FF0000", label: "YouTube" },
  { key: "friends",    icon: "users",           color: "#7C3AED", label: "Friends / Family" },
  { key: "online_ad",  icon: "monitor",         color: "#0EA5E9", label: "Online Advertisement" },
  { key: "other",      icon: "more-horizontal", color: "#6B7280", label: "Other" },
];

const LOAN_TYPES = [
  { key: "home",      emoji: "🏠", label: "Home Loan" },
  { key: "personal",  emoji: "💼", label: "Personal Loan" },
  { key: "car",       emoji: "🚗", label: "Car Loan" },
  { key: "business",  emoji: "🏪", label: "Business Loan" },
  { key: "education", emoji: "🎓", label: "Education Loan" },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function PickerModal({
  visible, title, items, onSelect, onClose,
}: {
  visible: boolean; title: string; items: string[];
  onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item} style={styles.sheetItem}
              onPress={() => { onSelect(item); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.sheetItemText}>{item}</Text>
              <Feather name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function PhoneCodeModal({
  visible, selected, onSelect, onClose,
}: {
  visible: boolean; selected: string;
  onSelect: (code: string, flag: string) => void; onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Select Country Code</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {PHONE_CODES.map((item, i) => (
            <TouchableOpacity
              key={i} style={[styles.sheetItem, selected === item.code && { backgroundColor: "#EEF4FF" }]}
              onPress={() => { onSelect(item.code, item.flag); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>{item.flag}</Text>
              <Text style={[styles.sheetItemText, { flex: 1 }]}>{item.label} ({item.code})</Text>
              {selected === item.code && <Feather name="check" size={16} color={BLUE} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function DobModal({
  visible, day, month, year,
  onDayChange, onMonthChange, onYearChange,
  onClose,
}: {
  visible: boolean; day: string; month: string; year: string;
  onDayChange: (v: string) => void; onMonthChange: (v: string) => void; onYearChange: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Date of Birth</Text>
        <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dobLabel}>Day</Text>
            <TextInput
              style={styles.dobInput} value={day} onChangeText={onDayChange}
              keyboardType="number-pad" maxLength={2} placeholder="DD" placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={{ flex: 2 }}>
            <Text style={styles.dobLabel}>Month</Text>
            <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthItem, month === String(i + 1).padStart(2, "0") && { backgroundColor: "#EEF4FF" }]}
                  onPress={() => onMonthChange(String(i + 1).padStart(2, "0"))}
                >
                  <Text style={[styles.monthItemText, month === String(i + 1).padStart(2, "0") && { color: BLUE, fontFamily: "Inter_600SemiBold" }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ flex: 1.4 }}>
            <Text style={styles.dobLabel}>Year</Text>
            <TextInput
              style={styles.dobInput} value={year} onChangeText={onYearChange}
              keyboardType="number-pad" maxLength={4} placeholder="YYYY" placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.dobConfirm} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.dobConfirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>
        {label}{optional && <Text style={styles.optional}> (Optional)</Text>}
      </Text>
      {children}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <View style={styles.stepRow}>
      <View style={{ alignItems: "center" }}>
        {step > 1 ? (
          <View style={[styles.stepCircle, { backgroundColor: BLUE }]}>
            <Feather name="check" size={13} color="#fff" />
          </View>
        ) : (
          <LinearGradient colors={[BLUE, "#3B6FEF"]} style={styles.stepCircle}>
            <Text style={styles.stepNum}>1</Text>
          </LinearGradient>
        )}
        <Text style={[styles.stepLabel, step === 1 && { color: BLUE }]}>Personal Details</Text>
      </View>

      <View style={[styles.stepLine, { backgroundColor: step > 1 ? BLUE : "#E2E8F0" }]} />

      <View style={{ alignItems: "center" }}>
        {step === 2 ? (
          <LinearGradient colors={[BLUE, "#3B6FEF"]} style={styles.stepCircle}>
            <Text style={styles.stepNum}>2</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.stepCircle, { backgroundColor: "#F1F5F9", borderWidth: 2, borderColor: "#E2E8F0" }]}>
            <Text style={[styles.stepNum, { color: "#94A3B8" }]}>2</Text>
          </View>
        )}
        <Text style={[styles.stepLabel, step === 2 && { color: BLUE }]}>More About You</Text>
      </View>
    </View>
  );
}

// ─── Checkbox row ──────────────────────────────────────────────────────────────

function CheckRow({
  checked, onPress, label,
  icon, iconColor, emoji,
}: {
  checked: boolean; onPress: () => void; label: string;
  icon?: string; iconColor?: string; emoji?: string;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.checkIconWrap, icon && { backgroundColor: iconColor + "18" }]}>
        {emoji ? (
          <Text style={{ fontSize: 18 }}>{emoji}</Text>
        ) : (
          <Feather name={icon as any} size={16} color={iconColor} />
        )}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
      <View style={[styles.checkbox, checked && { backgroundColor: BLUE, borderColor: BLUE }]}>
        {checked && <Feather name="check" size={11} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function Register() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 form state
  const [firstName, setFirstName]     = useState("");
  const [middleName, setMiddleName]   = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [country, setCountry]         = useState("");
  const [phoneCode, setPhoneCode]     = useState("+1");
  const [phoneFlag, setPhoneFlag]     = useState("🇺🇸");
  const [phone, setPhone]             = useState("");
  const [dobDay, setDobDay]           = useState("");
  const [dobMonth, setDobMonth]       = useState("");
  const [dobYear, setDobYear]         = useState("");
  const [gender, setGender]           = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [showConf, setShowConf]       = useState(false);

  // Step 2 form state
  const [referrals, setReferrals]             = useState<string[]>([]);
  const [loanPrefs, setLoanPrefs]             = useState<string[]>([]);
  const [employment, setEmployment]           = useState("");
  const [marketing, setMarketing]             = useState(true);

  // Modal visibility
  const [countryOpen,  setCountryOpen]  = useState(false);
  const [genderOpen,   setGenderOpen]   = useState(false);
  const [dobOpen,      setDobOpen]      = useState(false);
  const [phoneOpen,    setPhoneOpen]    = useState(false);
  const [employOpen,   setEmployOpen]   = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const dobDisplay = dobDay && dobMonth && dobYear
    ? `${dobDay} / ${MONTHS[parseInt(dobMonth) - 1]} / ${dobYear}`
    : "";

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim())  e.lastName  = "Last name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email address is required";
    if (!country)          e.country   = "Please select a country";
    if (!phone.trim())     e.phone     = "Phone number is required";
    if (!gender)           e.gender    = "Please select your gender";
    if (password.length < 8) e.password = "At least 8 characters with letters, numbers & symbols";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleCreate = () => {
    Alert.alert(
      "Account Created! 🎉",
      "Welcome to LoanGo! Your account has been created successfully.",
      [{ text: "Get Started", onPress: () => router.replace("/(tabs)") }]
    );
  };

  const goSignIn = () => router.replace("/(tabs)");

  const topPad = insets.top + (isWeb ? 8 : 4);
  const botPad = insets.bottom + 16;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Fixed header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={styles.headerSub}>Already have an account?</Text>
          <TouchableOpacity onPress={goSignIn} activeOpacity={0.7}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: botPad + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={styles.title}>{step === 1 ? "Create Your Account" : "Almost There!"}</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Let's get started! Please fill in your details below."
              : "Help us personalize your experience."}
          </Text>
        </View>

        {/* Step indicator */}
        <StepIndicator step={step} />

        {step === 1 ? (
          <>
            {/* ── Personal Information ── */}
            <Text style={styles.sectionHeader}>Personal Information</Text>

            <Field label="First Name" error={errors.firstName}>
              <View style={[styles.inputWrap, !!errors.firstName && styles.inputError]}>
                <Feather name="user" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Enter first name" placeholderTextColor="#94A3B8" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
            </Field>

            <Field label="Middle Name" optional>
              <View style={styles.inputWrap}>
                <Feather name="user" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Enter middle name" placeholderTextColor="#94A3B8" value={middleName} onChangeText={setMiddleName} autoCapitalize="words" />
              </View>
            </Field>

            <Field label="Last Name" error={errors.lastName}>
              <View style={[styles.inputWrap, !!errors.lastName && styles.inputError]}>
                <Feather name="user" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Enter last name" placeholderTextColor="#94A3B8" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </Field>

            <Field label="Email" error={errors.email}>
              <View style={[styles.inputWrap, !!errors.email && styles.inputError]}>
                <Feather name="mail" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Enter email address" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </Field>

            <Field label="Country" error={errors.country}>
              <TouchableOpacity style={[styles.inputWrap, !!errors.country && styles.inputError]} onPress={() => setCountryOpen(true)} activeOpacity={0.8}>
                <Feather name="globe" size={16} color="#94A3B8" style={styles.inputIcon} />
                <Text style={[styles.input, !country && { color: "#94A3B8" }]} numberOfLines={1}>{country || "Select country"}</Text>
                <Feather name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </Field>

            <Field label="Phone Number" error={errors.phone}>
              <View style={[styles.inputWrap, !!errors.phone && styles.inputError, { gap: 0 }]}>
                <TouchableOpacity style={styles.phonePicker} onPress={() => setPhoneOpen(true)} activeOpacity={0.8}>
                  <Text style={{ fontSize: 18 }}>{phoneFlag}</Text>
                  <Text style={styles.phoneCode}>{phoneCode}</Text>
                  <Feather name="chevron-down" size={13} color="#64748B" />
                </TouchableOpacity>
                <View style={styles.phoneDivider} />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 10 }]}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </Field>

            <Field label="Date of Birth">
              <TouchableOpacity style={styles.inputWrap} onPress={() => setDobOpen(true)} activeOpacity={0.8}>
                <Feather name="calendar" size={16} color="#94A3B8" style={styles.inputIcon} />
                <Text style={[styles.input, !dobDisplay && { color: "#94A3B8" }]}>
                  {dobDisplay || "DD / MM / YYYY"}
                </Text>
                <Feather name="calendar" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </Field>

            <Field label="Gender" error={errors.gender}>
              <TouchableOpacity style={[styles.inputWrap, !!errors.gender && styles.inputError]} onPress={() => setGenderOpen(true)} activeOpacity={0.8}>
                <Feather name="lock" size={16} color="#94A3B8" style={styles.inputIcon} />
                <Text style={[styles.input, !gender && { color: "#94A3B8" }]}>{gender || "Select gender"}</Text>
                <Feather name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </Field>

            {/* ── Security ── */}
            <Text style={[styles.sectionHeader, { marginTop: 6 }]}>Security</Text>

            <Field label="Password" error={errors.password}>
              <View style={[styles.inputWrap, !!errors.password && styles.inputError]}>
                <Feather name="lock" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input} placeholder="Enter password" placeholderTextColor="#94A3B8"
                  value={password} onChangeText={setPassword}
                  secureTextEntry={!showPwd} autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name={showPwd ? "eye" : "eye-off"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {!errors.password && (
                <Text style={styles.hintText}>At least 8 characters with a mix of letters, numbers & symbols</Text>
              )}
            </Field>

            <Field label="Confirm Password" error={errors.confirm}>
              <View style={[styles.inputWrap, !!errors.confirm && styles.inputError]}>
                <Feather name="lock" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input} placeholder="Confirm password" placeholderTextColor="#94A3B8"
                  value={confirm} onChangeText={setConfirm}
                  secureTextEntry={!showConf} autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConf(!showConf)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name={showConf ? "eye" : "eye-off"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </Field>

            {/* Security note */}
            <View style={styles.securityNote}>
              <View style={[styles.secNoteIcon, { backgroundColor: BLUE + "15" }]}>
                <Feather name="shield" size={18} color={BLUE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.secNoteTitle}>Your security is important to us</Text>
                <Text style={styles.secNoteSub}>We use bank-level encryption to keep your information safe and secure.</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* ── Where did you hear about us ── */}
            <Text style={styles.sectionHeader}>Where did you hear about us?</Text>
            <Text style={styles.selectAll}>Select all that apply</Text>
            <View style={styles.checkCard}>
              {REFERRAL_SOURCES.map((src, i) => (
                <View key={src.key}>
                  <CheckRow
                    checked={referrals.includes(src.key)}
                    onPress={() => toggleArr(referrals, src.key, setReferrals)}
                    label={src.label}
                    icon={src.icon}
                    iconColor={src.color}
                  />
                  {i < REFERRAL_SOURCES.length - 1 && <View style={styles.checkDivider} />}
                </View>
              ))}
            </View>

            {/* ── What are you looking for ── */}
            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>What are you mainly looking for?</Text>
            <Text style={styles.selectAll}>Select all that apply</Text>
            <View style={styles.checkCard}>
              {LOAN_TYPES.map((lt, i) => (
                <View key={lt.key}>
                  <CheckRow
                    checked={loanPrefs.includes(lt.key)}
                    onPress={() => toggleArr(loanPrefs, lt.key, setLoanPrefs)}
                    label={lt.label}
                    emoji={lt.emoji}
                  />
                  {i < LOAN_TYPES.length - 1 && <View style={styles.checkDivider} />}
                </View>
              ))}
            </View>

            {/* ── Employment Status ── */}
            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Your Current Employment Status</Text>
            <TouchableOpacity style={styles.inputWrap} onPress={() => setEmployOpen(true)} activeOpacity={0.8}>
              <Text style={[styles.input, !employment && { color: "#94A3B8" }, { flex: 1 }]}>{employment || "Select employment status"}</Text>
              <Feather name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* ── Marketing toggle ── */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Stay updated with offers & tips</Text>
                <Text style={styles.toggleSub}>Receive updates on loans, offers and helpful tips via email and SMS.</Text>
              </View>
              <Switch
                value={marketing}
                onValueChange={setMarketing}
                trackColor={{ true: BLUE, false: "#E2E8F0" }}
                thumbColor="#fff"
              />
            </View>

            {/* Privacy note */}
            <View style={styles.privacyNote}>
              <Feather name="lock" size={16} color={BLUE} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyTitle}>We respect your privacy</Text>
                <Text style={styles.privacySub}>We never share your information with third parties.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottom, { paddingBottom: botPad }]}>
        {step === 1 ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.88}>
            <LinearGradient colors={[BLUE, "#3B6FEF"]} style={styles.primaryGrad}>
              <Text style={styles.primaryText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate} activeOpacity={0.88}>
              <LinearGradient colors={[BLUE, "#3B6FEF"]} style={styles.primaryGrad}>
                <Text style={styles.primaryText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep(1); scrollRef.current?.scrollTo({ y: 0, animated: false }); }} style={{ marginTop: 10, alignSelf: "center" }} activeOpacity={0.7}>
              <Text style={styles.backLink}>Back</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Page dots */}
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => {
            const active = (step === 1 && i === 0) || (step === 2 && i === 1);
            return <View key={i} style={[styles.dot, active && styles.dotActive]} />;
          })}
        </View>
      </View>

      {/* Modals */}
      <PickerModal visible={countryOpen} title="Select Country" items={COUNTRIES}
        onSelect={setCountry} onClose={() => setCountryOpen(false)} />
      <PickerModal visible={genderOpen} title="Select Gender" items={GENDERS}
        onSelect={setGender} onClose={() => setGenderOpen(false)} />
      <PickerModal visible={employOpen} title="Employment Status" items={EMPLOYMENT_STATUSES}
        onSelect={setEmployment} onClose={() => setEmployOpen(false)} />
      <PhoneCodeModal visible={phoneOpen} selected={phoneCode}
        onSelect={(code, flag) => { setPhoneCode(code); setPhoneFlag(flag); }}
        onClose={() => setPhoneOpen(false)} />
      <DobModal
        visible={dobOpen} day={dobDay} month={dobMonth} year={dobYear}
        onDayChange={setDobDay} onMonthChange={setDobMonth} onYearChange={setDobYear}
        onClose={() => setDobOpen(false)}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: 4 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
  signInLink: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: BLUE },

  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#0F172A", lineHeight: 34, marginBottom: 6 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 19 },

  // Step indicator
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepNum: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 8, marginBottom: 18 },
  stepLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8", marginTop: 5, textAlign: "center" },

  sectionHeader: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B", marginBottom: 12 },
  selectAll: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: -8, marginBottom: 10 },

  label: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#374151", marginBottom: 6 },
  optional: { fontFamily: "Inter_400Regular", color: "#94A3B8" },
  errorText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#EF4444", marginTop: 4 },
  hintText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", marginTop: 4 },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0",
    paddingHorizontal: 14, paddingVertical: isWeb ? 13 : 13, gap: 10,
  },
  inputError: { borderColor: "#FCA5A5", backgroundColor: "#FFF5F5" },
  inputIcon: {},
  input: {
    flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1E293B",
    paddingVertical: 0,
    ...(isWeb ? { outlineStyle: "none" } as any : {}),
  },

  phonePicker: { flexDirection: "row", alignItems: "center", gap: 5 },
  phoneCode: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1E293B" },
  phoneDivider: { width: 1, height: 22, backgroundColor: "#E2E8F0", marginHorizontal: 4 },

  // Security note
  securityNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#F0F5FF", borderRadius: 12, padding: 14, marginTop: 6,
  },
  secNoteIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  secNoteTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1E293B", marginBottom: 3 },
  secNoteSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 17 },

  // Check rows
  checkCard: { borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "#fff", overflow: "hidden" },
  checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
  checkIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  checkLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1E293B" },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#CBD5E1",
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  checkDivider: { height: 1, backgroundColor: "#F1F5F9", marginLeft: 62 },

  // Toggle
  toggleRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    padding: 14, marginTop: 14,
  },
  toggleTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1E293B", marginBottom: 3 },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 17 },

  // Privacy note
  privacyNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#F0F5FF", borderRadius: 12, padding: 14, marginTop: 12,
  },
  privacyTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1E293B", marginBottom: 3 },
  privacySub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 17 },

  // Bottom bar
  bottom: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryGrad: { paddingVertical: 15, alignItems: "center" },
  primaryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },
  backLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLUE, textAlign: "center" },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#CBD5E1" },
  dotActive: { width: 22, backgroundColor: BLUE },

  // Modals
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40, maxHeight: "75%",
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1E293B", textAlign: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  sheetItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  sheetItemText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1E293B" },

  // DOB modal
  dobLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B", marginBottom: 6 },
  dobInput: {
    borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 10, padding: 10,
    fontSize: 16, fontFamily: "Inter_500Medium", color: "#1E293B", textAlign: "center",
    backgroundColor: "#F8FAFC",
    ...(isWeb ? { outlineStyle: "none" } as any : {}),
  },
  monthItem: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6 },
  monthItemText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#1E293B" },
  dobConfirm: {
    marginHorizontal: 16, marginTop: 20, borderRadius: 14, backgroundColor: BLUE, paddingVertical: 14, alignItems: "center",
  },
  dobConfirmText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
