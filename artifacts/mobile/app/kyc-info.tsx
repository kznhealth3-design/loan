import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useToast } from "@/lib/toast";
import {
  useCreateKycUploadUrl,
  useRecordKycDocument,
  useListMyKycDocuments,
  getListMyKycDocumentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────
type DocStatus = "completed" | "not_submitted" | "pending";

interface DocItem {
  key: string;
  icon: any;
  label: string;
  sub: string;
  status: DocStatus;
}

// ─── Help Modal ───────────────────────────────────────────────────────────────
function HelpModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={ov.overlay} onPress={onClose}>
        <Pressable style={[ov.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={ov.handle} />
          <View style={ov.header}>
            <Text style={[ov.title, { color: colors.foreground }]}>KYC Help</Text>
            <TouchableOpacity onPress={onClose} style={[ov.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 18, lineHeight: 20 }]}>
            Our team is available 24/7 to help you complete your KYC verification.
          </Text>
          {[
            { icon: "phone",          color: "#10B981", bg: "#D1FAE5", label: "Call Us",      sub: "1-800-555-0199" },
            { icon: "message-circle", color: "#4F46E5", bg: "#EEF2FF", label: "Live Chat",    sub: "Avg. 2 min reply" },
            { icon: "mail",           color: "#F59E0B", bg: "#FEF3C7", label: "Email Support", sub: "support@loango.com" },
          ].map((c, i) => (
            <TouchableOpacity key={i} style={[ov.helpRow, { borderBottomColor: colors.border }]}
              onPress={() => Alert.alert(c.label, `Connecting you via ${c.label.toLowerCase()}…`)}>
              <View style={[ov.helpIcon, { backgroundColor: c.bg }]}>
                <Feather name={c.icon as any} size={20} color={c.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[ov.helpLabel, { color: colors.foreground }]}>{c.label}</Text>
                <Text style={[ov.helpSub, { color: colors.mutedForeground }]}>{c.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Document Upload Modal ────────────────────────────────────────────────────
function DocUploadModal({
  doc,
  onClose,
  onSubmit,
}: {
  doc: DocItem;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const colors = useColors();
  const [selected, setSelected] = useState<string | null>(null);
  const [uploaded, setUploaded]   = useState(false);
  const [step,     setStep]       = useState<"select" | "upload" | "confirm" | "success">("select");

  // Document type options per category
  const ID_OPTIONS = [
    { icon: "credit-card", label: "Driver's License",     sub: "State-issued driver's license" },
    { icon: "user",        label: "US ID Card",           sub: "State-issued photo identification" },
    { icon: "book-open",   label: "Passport",             sub: "Valid US or international passport" },
    { icon: "shield",      label: "Social Security Card", sub: "SSN card (combined with photo ID)" },
    { icon: "award",       label: "Military ID",          sub: "US armed forces ID card" },
  ];
  const ADDR_OPTIONS = [
    { icon: "zap",        label: "Utility Bill",            sub: "Electricity, gas or water bill (last 3 months)" },
    { icon: "home",       label: "Lease / Rental Agreement",sub: "Signed tenancy agreement" },
    { icon: "credit-card",label: "Bank Statement",          sub: "Issued in the last 3 months" },
    { icon: "file-text",  label: "Tax Document",            sub: "Recent IRS or state tax form" },
    { icon: "mail",       label: "Government Mail",         sub: "Official letter with your address" },
  ];
  const SELFIE_OPTIONS = [
    { icon: "camera",  label: "Live Selfie",       sub: "Take a photo right now with your camera" },
    { icon: "image",   label: "Upload from Gallery",sub: "Choose an existing clear photo of your face" },
  ];

  const options =
    doc.key === "identity" ? ID_OPTIONS :
    doc.key === "address"  ? ADDR_OPTIONS :
    SELFIE_OPTIONS;

  const [fileData, setFileData] = useState<{ name: string; type: string; data: ArrayBuffer } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const createUploadUrl = useCreateKycUploadUrl();
  const recordDoc = useRecordKycDocument();

  const triggerFilePicker = () => {
    if (Platform.OS === "web" && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      Alert.alert("Upload", "File upload is available in the web version.");
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setFileData({ name: file.name, type: file.type || "application/octet-stream", data: evt.target?.result as ArrayBuffer });
      setStep("confirm");
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectAndUpload = () => {
    if (!selected) return;
    triggerFilePicker();
    setStep("upload");
  };

  const confirmSubmit = async () => {
    if (!fileData) return;
    setUploading(true);
    try {
      const { uploadUrl, objectKey } = await createUploadUrl.mutateAsync({
        data: { docType: doc.key, contentType: fileData.type },
      });
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileData.type },
        body: fileData.data,
      });
      if (!uploadRes.ok) {
        throw new Error(`Upload failed (${uploadRes.status})`);
      }
      await recordDoc.mutateAsync({
        data: { docType: doc.key, objectKey },
      });
      await queryClient.invalidateQueries({ queryKey: getListMyKycDocumentsQueryKey() });
      setStep("success");
      showToast("Document submitted successfully!", "success");
      setTimeout(() => { onSubmit(); onClose(); }, 1500);
    } catch {
      showToast("Upload failed. Please try again.", "error");
      setStep("select");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={ov.overlay} onPress={onClose}>
        <Pressable style={[ov.sheet, { backgroundColor: colors.card, maxHeight: "94%" }]} onPress={() => {}}>
          <View style={ov.handle} />
          <View style={ov.header}>
            <Text style={[ov.title, { color: colors.foreground }]}>{doc.label}</Text>
            <TouchableOpacity onPress={onClose} style={[ov.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* SELECT STEP */}
          {step === "select" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[du.sectionLabel, { color: colors.foreground }]}>
                {doc.key === "selfie"
                  ? "How would you like to verify?"
                  : `Select ${doc.label} Type`}
              </Text>
              <Text style={[du.sectionSub, { color: colors.mutedForeground }]}>
                {doc.key === "selfie"
                  ? "Your selfie will be compared to your identity document."
                  : "Choose the document type you want to upload. Make sure it is valid and not expired."}
              </Text>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[du.optionRow, { borderColor: selected === opt.label ? "#4F46E5" : colors.border, backgroundColor: selected === opt.label ? "#EEF2FF" : colors.accent }]}
                  onPress={() => setSelected(opt.label)}
                  activeOpacity={0.8}
                >
                  <View style={[du.optIcon, { backgroundColor: selected === opt.label ? "#C7D2FE" : colors.muted }]}>
                    <Feather name={opt.icon as any} size={18} color={selected === opt.label ? "#4F46E5" : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[du.optLabel, { color: colors.foreground }]}>{opt.label}</Text>
                    <Text style={[du.optSub, { color: colors.mutedForeground }]}>{opt.sub}</Text>
                  </View>
                  <View style={[du.radio, { borderColor: selected === opt.label ? "#4F46E5" : colors.border }]}>
                    {selected === opt.label && <View style={du.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Guidelines */}
              <View style={[du.guidelines, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={du.guidelinesTitle}>Document Guidelines</Text>
                {[
                  "Document must be valid and not expired",
                  "All four corners must be visible",
                  "No glare, blur or shadows on the document",
                  "Ensure all text is clearly readable",
                ].map((tip, i) => (
                  <View key={i} style={du.tip}>
                    <Feather name="check" size={12} color="#4F46E5" />
                    <Text style={du.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {Platform.OS === "web" && (
                <input
                  ref={fileInputRef as any}
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: "none" } as any}
                  onChange={handleFileSelected as any}
                />
              )}
              <TouchableOpacity
                style={[du.primaryBtn, { backgroundColor: selected ? "#4F46E5" : "#9CA3AF" }]}
                onPress={selected ? handleSelectAndUpload : undefined}
                disabled={!selected}
              >
                <Feather name={doc.key === "selfie" ? "camera" : "upload"} size={16} color="#fff" />
                <Text style={du.primaryBtnText}>
                  {doc.key === "selfie" ? "Open Camera" : "Continue to Upload"}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          )}

          {/* UPLOADING STEP */}
          {step === "upload" && (
            <View style={du.centered}>
              <View style={[du.uploadingBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <View style={[du.uploadIcon, { backgroundColor: "#4F46E5" }]}>
                  <Feather name={doc.key === "selfie" ? "camera" : "upload-cloud"} size={36} color="#fff" />
                </View>
                <Text style={[du.uploadTitle, { color: colors.foreground }]}>
                  {doc.key === "selfie" ? "Capturing Selfie…" : `Uploading ${selected}…`}
                </Text>
                <Text style={[du.uploadSub, { color: colors.mutedForeground }]}>Please wait while we process your document</Text>
                <View style={[du.progressTrack, { backgroundColor: colors.muted }]}>
                  <View style={[du.progressBar, { backgroundColor: "#4F46E5", width: "75%" }]} />
                </View>
              </View>
            </View>
          )}

          {/* CONFIRM STEP */}
          {step === "confirm" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[du.previewBox, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                <View style={[du.previewThumb, { backgroundColor: "#EEF2FF" }]}>
                  <Feather name={doc.key === "selfie" ? "user" : "file"} size={48} color="#4F46E5" />
                  <View style={[du.checkBadge, { backgroundColor: "#10B981" }]}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                </View>
                <Text style={[du.previewLabel, { color: colors.foreground }]}>{selected}</Text>
                <Text style={[du.previewSub, { color: colors.mutedForeground }]}>Document captured successfully</Text>
              </View>

              <View style={[du.guidelines, { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7" }]}>
                <Text style={[du.guidelinesTitle, { color: "#065F46" }]}>Document looks good! ✓</Text>
                {[
                  "All four corners are visible",
                  "Text is clearly readable",
                  "No glare or blur detected",
                ].map((t, i) => (
                  <View key={i} style={du.tip}>
                    <Feather name="check" size={12} color="#10B981" />
                    <Text style={[du.tipText, { color: "#047857" }]}>{t}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[du.primaryBtn, { backgroundColor: uploading ? "#818CF8" : "#4F46E5" }]}
                onPress={confirmSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="send" size={16} color="#fff" />
                )}
                <Text style={du.primaryBtnText}>{uploading ? "Uploading…" : "Submit Document"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[du.ghostBtn, { borderColor: colors.border }]} onPress={() => setStep("select")}>
                <Text style={[du.ghostBtnText, { color: colors.foreground }]}>Retake / Reupload</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          )}

          {/* SUCCESS STEP */}
          {step === "success" && (
            <View style={du.centered}>
              <View style={[du.successIcon, { backgroundColor: "#D1FAE5" }]}>
                <Feather name="check-circle" size={48} color="#10B981" />
              </View>
              <Text style={[du.uploadTitle, { color: colors.foreground }]}>Document Submitted!</Text>
              <Text style={[du.uploadSub, { color: colors.mutedForeground }]}>Your document is under review. We'll notify you once verified.</Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Personal Details Modal ───────────────────────────────────────────────────
function PersonalDetailsModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const info = [
    { label: "Full Name",    value: "John Doe" },
    { label: "Date of Birth",value: "January 15, 1990" },
    { label: "Address",      value: "123 Main Street, New York, NY 10001" },
    { label: "Mobile Number",value: "+1 (555) 123-4567" },
    { label: "Email",        value: "john.doe@email.com" },
    { label: "PAN / SSN",    value: "•••-••-4321" },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={ov.overlay} onPress={onClose}>
        <Pressable style={[ov.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={ov.handle} />
          <View style={ov.header}>
            <Text style={[ov.title, { color: colors.foreground }]}>Personal Details</Text>
            <TouchableOpacity onPress={onClose} style={[ov.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={[pd.banner, { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7" }]}>
            <Feather name="check-circle" size={16} color="#10B981" />
            <Text style={pd.bannerText}>Personal details have been verified successfully.</Text>
          </View>
          {info.map((r, i) => (
            <View key={i} style={[pd.row, { borderBottomColor: colors.border }]}>
              <Text style={[pd.label, { color: colors.mutedForeground }]}>{r.label}</Text>
              <Text style={[pd.value, { color: colors.foreground }]}>{r.value}</Text>
            </View>
          ))}
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const pd = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14 },
  bannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#047857" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  label: { fontSize: 13, fontFamily: "Inter_400Regular" },
  value: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right", marginLeft: 16 },
});

// ─── Track Status Modal ───────────────────────────────────────────────────────
function TrackModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const steps = [
    { label: "Application Received",  date: "May 15, 2024", done: true,  color: "#10B981", bg: "#D1FAE5" },
    { label: "Documents Under Review", date: "In progress",  done: false, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Verification Complete",  date: "Pending",      done: false, color: "#9CA3AF", bg: "#F3F4F6" },
    { label: "KYC Approved",           date: "Pending",      done: false, color: "#9CA3AF", bg: "#F3F4F6" },
  ];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={ov.overlay} onPress={onClose}>
        <Pressable style={[ov.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={ov.handle} />
          <View style={ov.header}>
            <Text style={[ov.title, { color: colors.foreground }]}>Track KYC Status</Text>
            <TouchableOpacity onPress={onClose} style={[ov.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 16, lineHeight: 20 }]}>
            You'll receive a notification once your KYC is verified. This typically takes 1–2 business days.
          </Text>
          {steps.map((step, i) => (
            <View key={i} style={tk.row}>
              <View style={tk.leftCol}>
                <View style={[tk.dot, { backgroundColor: step.done ? step.color : step.bg, borderColor: step.done ? step.color : colors.border }]}>
                  {step.done && <Feather name="check" size={12} color="#fff" />}
                  {!step.done && i === 1 && <View style={[tk.pulseDot, { backgroundColor: "#F59E0B" }]} />}
                </View>
                {i < steps.length - 1 && <View style={[tk.line, { backgroundColor: step.done ? "#10B981" : colors.border }]} />}
              </View>
              <View style={tk.content}>
                <Text style={[tk.stepLabel, { color: step.done ? colors.foreground : colors.mutedForeground, fontFamily: step.done ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {step.label}
                </Text>
                <Text style={[tk.stepDate, { color: step.done ? "#10B981" : i === 1 ? "#F59E0B" : colors.mutedForeground }]}>{step.date}</Text>
              </View>
            </View>
          ))}
          <View style={[tk.notifBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
            <Feather name="bell" size={14} color="#4F46E5" />
            <Text style={tk.notifText}>Push notifications are enabled. We'll alert you instantly when your KYC is approved.</Text>
          </View>
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const tk = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 4 },
  leftCol: { width: 40, alignItems: "center" },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  pulseDot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, minHeight: 24, marginVertical: 4 },
  content: { flex: 1, paddingTop: 4, paddingBottom: 16 },
  stepLabel: { fontSize: 14 },
  stepDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  notifBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 4 },
  notifText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "#4F46E5", lineHeight: 17 },
});

// ─── Shared overlay styles ────────────────────────────────────────────────────
const ov = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "92%" },
  handle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  header:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  closeBtn:{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  helpRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  helpIcon:{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  helpLabel:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },
  helpSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});

// ─── Doc Upload styles ────────────────────────────────────────────────────────
const du = StyleSheet.create({
  sectionLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sectionSub:   { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 16 },
  optionRow:    { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1.5, padding: 14, marginBottom: 8 },
  optIcon:      { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  optLabel:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  optSub:       { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  radio:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4F46E5" },
  guidelines:   { borderRadius: 12, borderWidth: 1, padding: 14, marginVertical: 14 },
  guidelinesTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#4F46E5", marginBottom: 8 },
  tip:          { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  tipText:      { fontSize: 12, fontFamily: "Inter_400Regular", color: "#4F46E5", flex: 1 },
  primaryBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 15, marginBottom: 10 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  ghostBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1.5, paddingVertical: 14 },
  ghostBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  centered:     { alignItems: "center", paddingVertical: 24 },
  uploadingBox: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: "center", width: "100%" },
  uploadIcon:   { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  uploadTitle:  { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 8 },
  uploadSub:    { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19, marginBottom: 16 },
  progressTrack:{ width: "100%", height: 6, borderRadius: 3, overflow: "hidden" },
  progressBar:  { height: 6, borderRadius: 3 },
  previewBox:   { alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 24, marginBottom: 8 },
  previewThumb: { width: 100, height: 100, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative" },
  checkBadge:   { position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  previewLabel: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  previewSub:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  successIcon:  { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 16 },
});

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DocStatus }) {
  const map = {
    completed:     { bg: "#D1FAE5", color: "#059669", icon: "check-circle" as const, label: "Completed" },
    not_submitted: { bg: "#FEE2E2", color: "#EF4444", icon: "alert-circle" as const, label: "Not Submitted" },
    pending:       { bg: "#FEF3C7", color: "#D97706", icon: "clock" as const,        label: "Pending" },
  };
  const s = map[status];
  return (
    <View style={[sb.badge, { backgroundColor: s.bg }]}>
      <Text style={[sb.text, { color: s.color }]}>{s.label}</Text>
      <Feather name={s.icon} size={12} color={s.color} />
    </View>
  );
}
const sb = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  text:  { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});

// ─── Progress Stepper ─────────────────────────────────────────────────────────
function ProgressStepper({ step }: { step: number }) {
  const colors = useColors();
  const steps = ["Basic Details", "Documents", "Verification", "Completed"];
  const substatus = ["Completed", "Not Submitted", "Pending", "Pending"];

  return (
    <View>
      {/* Circles + lines */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            <View style={[
              ps.circle,
              i < step  ? { backgroundColor: "#4F46E5" } : { backgroundColor: "transparent", borderWidth: 2, borderColor: i === step ? "#4F46E5" : "#D1D5DB" },
            ]}>
              {i < step
                ? <Feather name="check" size={12} color="#fff" />
                : <Text style={[ps.num, { color: i === step ? "#4F46E5" : "#9CA3AF" }]}>{i + 1}</Text>
              }
            </View>
            {i < steps.length - 1 && (
              <View style={[ps.line, { backgroundColor: i < step - 1 ? "#4F46E5" : i === step - 1 ? "#818CF8" : "#E5E7EB" }]} />
            )}
          </React.Fragment>
        ))}
      </View>
      {/* Labels */}
      <View style={{ flexDirection: "row" }}>
        {steps.map((label, i) => (
          <View key={i} style={[ps.labelWrap, { flex: 1 }]}>
            <Text style={[ps.label, { color: i <= step ? colors.foreground : colors.mutedForeground }]}>{label}</Text>
            <Text style={[ps.sub, { color: i === 0 ? "#10B981" : colors.mutedForeground }]}>{substatus[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const ps = StyleSheet.create({
  circle:    { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  num:       { fontSize: 12, fontFamily: "Inter_700Bold" },
  line:      { flex: 1, height: 2 },
  labelWrap: { alignItems: "flex-start" },
  label:     { fontSize: 11, fontFamily: "Inter_600SemiBold", lineHeight: 15 },
  sub:       { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function KYCInfoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb  = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [showHelp,   setShowHelp]   = useState(false);
  const [showTrack,  setShowTrack]  = useState(false);
  const [showPD,     setShowPD]     = useState(false);
  const [activeDoc,  setActiveDoc]  = useState<DocItem | null>(null);

  // Track submission state per doc
  const { data: kycDocs } = useListMyKycDocuments();

  const getDocStatus = (key: string): DocStatus => {
    const doc = kycDocs?.find((d) => d.docType === key);
    if (!doc) return "not_submitted";
    if (doc.status === "approved") return "completed";
    return "pending";
  };

  const KYC_DOCS: DocItem[] = [
    {
      key: "personal", icon: "user",       label: "Personal Details",
      sub: "Name, DOB, Address, etc.",      status: "completed",
    },
    {
      key: "identity", icon: "credit-card", label: "Identity Proof",
      sub: "Driver's License / US ID Card", status: getDocStatus("identity"),
    },
    {
      key: "address",  icon: "map-pin",     label: "Address Proof",
      sub: "Utility Bill / Lease Agreement",status: getDocStatus("address"),
    },
    {
      key: "selfie",   icon: "user",        label: "Selfie Verification",
      sub: "Live selfie or photo",          status: getDocStatus("selfie"),
    },
  ];

  const allSubmitted = ["identity","address","selfie"].every(
    (k) => getDocStatus(k) !== "not_submitted"
  );

  const handleDocTap = (doc: DocItem) => {
    if (doc.key === "personal") { setShowPD(true); return; }
    setActiveDoc(doc);
  };

  const handleSubmit = (_key: string) => {
    // queryClient already invalidated inside DocUploadModal.confirmSubmit
  };

  return (
    <View style={[main.container, { backgroundColor: colors.background }]}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={[main.header, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={main.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[main.headerTitle, { color: colors.foreground }]}>KYC Information</Text>
        <TouchableOpacity style={main.helpBtn} onPress={() => setShowHelp(true)}>
          <Feather name="headphones" size={16} color="#4F46E5" />
          <Text style={main.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 110 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Pending / Complete Banner ─────────────────────────── */}
        {allSubmitted ? (
          <View style={[main.pendingBanner, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
            <View style={[main.pendingIcon, { backgroundColor: "#FEF3C7", borderWidth: 2, borderColor: "#F59E0B" }]}>
              <Feather name="clock" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[main.pendingTitle, { color: "#92400E" }]}>KYC Under Review</Text>
              <Text style={[main.pendingSub, { color: "#B45309" }]}>
                All documents submitted. Verification takes 1–2 business days.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[main.pendingBanner, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
            <View style={[main.pendingIcon, { backgroundColor: "#FEF3C7", borderWidth: 2, borderColor: "#F59E0B" }]}>
              <Feather name="alert-circle" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[main.pendingTitle, { color: "#92400E" }]}>KYC Verification Pending</Text>
              <Text style={[main.pendingSub, { color: "#B45309" }]}>
                Your KYC is pending. Please complete all required details and documents to get verified.
              </Text>
            </View>
            <TouchableOpacity
              style={[main.completeNowBtn, { backgroundColor: "#4F46E5" }]}
              onPress={() => {
                const first = KYC_DOCS.find((d) => d.key !== "personal" && getDocStatus(d.key) === "not_submitted");
                if (first) setActiveDoc(first);
              }}
            >
              <Text style={main.completeNowText}>Complete Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Verification Progress ─────────────────────────────── */}
        <View style={[main.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[main.cardTitle, { color: colors.foreground }]}>Verification Progress</Text>
          <ProgressStepper step={1} />
        </View>

        {/* ── KYC Details ──────────────────────────────────────── */}
        <View style={[main.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[main.cardTitle, { color: colors.foreground }]}>KYC Details</Text>

          {KYC_DOCS.map((doc, i) => {
            const status = doc.key === "personal" ? "completed" : getDocStatus(doc.key);
            const isPending = doc.key !== "personal" && getDocStatus(doc.key) === "pending";
            return (
              <View key={doc.key}>
                <TouchableOpacity style={main.docRow} onPress={() => handleDocTap(doc)} activeOpacity={0.7}>
                  <View style={[main.docIcon, { backgroundColor: "#EEF2FF" }]}>
                    <Feather name={doc.icon} size={20} color="#4F46E5" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[main.docLabel, { color: colors.foreground }]}>{doc.label}</Text>
                    <Text style={[main.docSub, { color: colors.mutedForeground }]}>
                      {isPending ? (doc.key === "selfie" ? "Selfie under review" : "Document under review") : doc.sub}
                    </Text>
                  </View>
                  <StatusBadge status={status} />
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                {i < KYC_DOCS.length - 1 && (
                  <View style={[main.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            );
          })}

          {/* Why KYC important */}
          <View style={[main.infoBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
            <Feather name="info" size={14} color="#4F46E5" />
            <View style={{ flex: 1 }}>
              <Text style={main.infoTitle}>Why is KYC Important?</Text>
              <Text style={main.infoSub}>
                KYC verification is mandatory to comply with regulatory guidelines and ensure the security of your account and transactions.
              </Text>
            </View>
          </View>
        </View>

        {/* ── What You Can Do Next ──────────────────────────────── */}
        <View style={[main.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[main.cardTitle, { color: colors.foreground }]}>What You Can Do Next</Text>

          {/* Complete KYC */}
          <View style={[main.nextRow, { borderBottomColor: colors.border }]}>
            <View style={[main.nextIcon, { backgroundColor: "#EEF2FF" }]}>
              <Feather name="file-text" size={18} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[main.nextLabel, { color: colors.foreground }]}>Complete Your KYC</Text>
              <Text style={[main.nextSub, { color: colors.mutedForeground }]}>Submit the required documents and details to proceed.</Text>
            </View>
            <TouchableOpacity
              style={[main.completeNowBtn, { backgroundColor: "#4F46E5" }]}
              onPress={() => {
                const first = KYC_DOCS.find((d) => d.key !== "personal" && getDocStatus(d.key) === "not_submitted");
                if (first) setActiveDoc(first);
                else Alert.alert("All Done!", "All documents have been submitted for review.");
              }}
            >
              <Text style={main.completeNowText}>Complete Now</Text>
            </TouchableOpacity>
          </View>

          {/* Track Status */}
          <TouchableOpacity style={[main.nextRow, { borderBottomColor: colors.border }]} onPress={() => setShowTrack(true)} activeOpacity={0.7}>
            <View style={[main.nextIcon, { backgroundColor: "#EEF2FF" }]}>
              <Feather name="bell" size={18} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[main.nextLabel, { color: colors.foreground }]}>Track Status</Text>
              <Text style={[main.nextSub, { color: colors.mutedForeground }]}>We will notify you once your KYC is verified</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Need Help */}
          <TouchableOpacity style={[main.nextRow, { borderBottomColor: "transparent" }]} onPress={() => setShowHelp(true)} activeOpacity={0.7}>
            <View style={[main.nextIcon, { backgroundColor: "#EEF2FF" }]}>
              <Feather name="help-circle" size={18} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[main.nextLabel, { color: colors.foreground }]}>Need Help?</Text>
              <Text style={[main.nextSub, { color: colors.mutedForeground }]}>Contact our support team for any assistance.</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {showHelp  && <HelpModal           onClose={() => setShowHelp(false)} />}
      {showTrack && <TrackModal          onClose={() => setShowTrack(false)} />}
      {showPD    && <PersonalDetailsModal onClose={() => setShowPD(false)} />}
      {activeDoc && (
        <DocUploadModal
          doc={{ ...activeDoc, status: getDocStatus(activeDoc.key) }}
          onClose={() => setActiveDoc(null)}
          onSubmit={() => handleSubmit(activeDoc.key)}
        />
      )}
    </View>
  );
}

const main = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn:     { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginRight: 6 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  helpBtn:     { flexDirection: "row", alignItems: "center", gap: 5 },
  helpText:    { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },

  /* Pending Banner */
  pendingBanner: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  pendingIcon:   { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  pendingTitle:  { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 3 },
  pendingSub:    { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  completeNowBtn:{ borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  completeNowText:{ color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },

  /* Cards */
  card:      { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 14 },

  /* Doc rows */
  docRow:  { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 12 },
  docIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  docLabel:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },
  docSub:  { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { height: 1, marginLeft: 54 },

  /* Info box */
  infoBox:  { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 10 },
  infoTitle:{ fontSize: 13, fontFamily: "Inter_700Bold", color: "#4F46E5", marginBottom: 4 },
  infoSub:  { fontSize: 12, fontFamily: "Inter_400Regular", color: "#4F46E5", lineHeight: 17 },

  /* Next steps */
  nextRow:  { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  nextIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nextLabel:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextSub:  { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
