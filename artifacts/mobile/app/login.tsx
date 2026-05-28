import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const BLUE = "#1E56E5";
const BLUE_MID = "#3B6FEF";
const INK = "#0F172A";
const MUTED = "#64748B";
const isWeb = Platform.OS === "web";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = () => {
    const e: typeof errors = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    if (Object.keys(e).length === 0) router.replace("/(tabs)");
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setTimeout(() => {
      setForgotSent(false);
      setForgotEmail("");
    }, 250);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <View style={s.logoRow}>
          <LinearGradient colors={[BLUE, BLUE_MID]} style={s.logoMark}>
            <Feather name="dollar-sign" size={14} color="#fff" />
          </LinearGradient>
          <Text style={s.logoText}>
            Loan<Text style={{ color: BLUE }}>Go</Text>
          </Text>
        </View>
        <View style={s.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero illustration */}
        <View style={s.hero}>
          <LinearGradient colors={[BLUE, BLUE_MID]} style={s.heroOrb}>
            <Feather name="lock" size={36} color="#fff" />
          </LinearGradient>
          <View style={[s.heroDot, { top: 6, left: 30, backgroundColor: "#DCFCE7" }]}>
            <Feather name="check" size={12} color="#16A34A" />
          </View>
          <View style={[s.heroDot, { top: 30, right: 30, backgroundColor: "#FEF3C7" }]}>
            <Feather name="star" size={12} color="#D97706" />
          </View>
          <View style={[s.heroDot, { bottom: 4, left: 50, backgroundColor: "#EEF4FF" }]}>
            <Feather name="shield" size={12} color={BLUE} />
          </View>
        </View>

        {/* Title */}
        <Text style={s.title}>Welcome Back!</Text>
        <Text style={s.subtitle}>Sign in to continue managing your loans and offers.</Text>

        {/* Email field */}
        <View style={{ marginTop: 26 }}>
          <Text style={s.label}>Email Address</Text>
          <View style={[s.inputWrap, !!errors.email && s.inputError]}>
            <Feather name="mail" size={16} color="#94A3B8" />
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: undefined }); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {!!errors.email && <Text style={s.errorText}>{errors.email}</Text>}
        </View>

        {/* Password field */}
        <View style={{ marginTop: 14 }}>
          <Text style={s.label}>Password</Text>
          <View style={[s.inputWrap, !!errors.password && s.inputError]}>
            <Feather name="lock" size={16} color="#94A3B8" />
            <TextInput
              style={s.input}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: undefined }); }}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name={showPwd ? "eye" : "eye-off"} size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          {!!errors.password && <Text style={s.errorText}>{errors.password}</Text>}
        </View>

        {/* Remember + Forgot */}
        <View style={s.optionsRow}>
          <TouchableOpacity onPress={() => setRemember(!remember)} activeOpacity={0.7} style={s.rememberRow}>
            <View style={[s.checkbox, remember && { backgroundColor: BLUE, borderColor: BLUE }]}>
              {remember && <Feather name="check" size={11} color="#fff" />}
            </View>
            <Text style={s.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setForgotOpen(true)} activeOpacity={0.7}>
            <Text style={s.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In button */}
        <TouchableOpacity onPress={handleLogin} activeOpacity={0.88} style={{ marginTop: 22 }}>
          <LinearGradient colors={[BLUE, BLUE_MID]} style={s.primaryBtn}>
            <Text style={s.primaryText}>Sign In</Text>
            <Feather name="arrow-right" size={17} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or continue with</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={s.socialRow}>
          <SocialBtn icon="chrome" label="Google" color="#DB4437" />
          <SocialBtn icon="github" label="Apple" color={INK} />
          <SocialBtn icon="facebook" label="Facebook" color="#1877F2" />
        </View>

        {/* Sign up link */}
        <View style={s.signupRow}>
          <Text style={s.signupLabel}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/register")} activeOpacity={0.7}>
            <Text style={s.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Trust note */}
        <View style={s.trustNote}>
          <View style={s.trustIcon}>
            <Feather name="shield" size={16} color={BLUE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.trustTitle}>Secure sign-in</Text>
            <Text style={s.trustSub}>Your data is protected with bank-level 256-bit encryption.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Forgot password modal */}
      <Modal transparent animationType="fade" visible={forgotOpen} onRequestClose={closeForgot}>
        <Pressable style={s.overlay} onPress={closeForgot} />
        <View style={s.modalWrap} pointerEvents="box-none">
          <View style={s.modalCard}>
            <View style={s.modalIconCircle}>
              <Feather name={forgotSent ? "check" : "mail"} size={24} color={forgotSent ? "#16A34A" : BLUE} />
            </View>
            <Text style={s.modalTitle}>{forgotSent ? "Check Your Email" : "Reset Password"}</Text>
            <Text style={s.modalSub}>
              {forgotSent
                ? `We've sent a reset link to ${forgotEmail}. Follow the instructions to reset your password.`
                : "Enter your email address and we'll send you a link to reset your password."}
            </Text>

            {!forgotSent && (
              <View style={[s.inputWrap, { marginTop: 16, width: "100%" }]}>
                <Feather name="mail" size={16} color="#94A3B8" />
                <TextInput
                  style={s.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#94A3B8"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 18, width: "100%" }}>
              <TouchableOpacity style={s.modalGhost} onPress={closeForgot} activeOpacity={0.75}>
                <Text style={s.modalGhostText}>{forgotSent ? "Close" : "Cancel"}</Text>
              </TouchableOpacity>
              {!forgotSent && (
                <TouchableOpacity
                  style={s.modalPrimary}
                  onPress={() => {
                    if (/\S+@\S+\.\S+/.test(forgotEmail)) setForgotSent(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={s.modalPrimaryText}>Send Link</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SocialBtn({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <TouchableOpacity style={s.socialBtn} activeOpacity={0.75}>
      <Feather name={icon as any} size={18} color={color} />
      <Text style={s.socialText}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoMark: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 16, fontFamily: "Inter_700Bold", color: INK, letterSpacing: -0.3 },

  hero: { height: 130, alignItems: "center", justifyContent: "center", marginTop: 12, position: "relative" },
  heroOrb: {
    width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center",
    shadowColor: BLUE, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  heroDot: {
    position: "absolute", width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center",
    shadowColor: "#0F172A", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },

  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: INK, letterSpacing: -0.5, marginTop: 18, textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: MUTED, marginTop: 6, lineHeight: 20, textAlign: "center" },

  label: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#374151", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0",
    paddingHorizontal: 14, paddingVertical: 13,
    overflow: "hidden",
  },
  inputError: { borderColor: "#FCA5A5", backgroundColor: "#FFF5F5" },
  input: {
    flex: 1, minWidth: 0, fontSize: 14, fontFamily: "Inter_400Regular", color: INK,
    paddingVertical: 0,
    ...(isWeb ? { outlineStyle: "none" } as any : {}),
  },
  errorText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#EF4444", marginTop: 4 },

  optionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "#CBD5E1",
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  rememberText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#374151" },
  forgotLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: BLUE },

  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 15, borderRadius: 14,
    shadowColor: BLUE, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  primaryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: { fontSize: 12, fontFamily: "Inter_500Medium", color: MUTED },

  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "#fff",
  },
  socialText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: INK },

  signupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 22 },
  signupLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED },
  signupLink: { fontSize: 13, fontFamily: "Inter_700Bold", color: BLUE },

  trustNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#F0F5FF", borderRadius: 12, padding: 14, marginTop: 22,
  },
  trustIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#EEF4FF", alignItems: "center", justifyContent: "center" },
  trustTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: INK, marginBottom: 2 },
  trustSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED, lineHeight: 17 },

  // Forgot password modal
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.5)" },
  modalWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: {
    width: "100%", maxWidth: 380, backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center",
    shadowColor: "#0F172A", shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 16,
  },
  modalIconCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#EEF4FF",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: INK, textAlign: "center" },
  modalSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center", lineHeight: 19, marginTop: 6 },
  modalGhost: {
    flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center",
  },
  modalGhostText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#374151" },
  modalPrimary: {
    flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: BLUE, alignItems: "center",
  },
  modalPrimaryText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
