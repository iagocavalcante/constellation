import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useModalControls } from "@/state/modals";
import { useAgent } from "@/state/session";
import { reportPost } from "@/services/bsky.service";

interface ReportPostModalProps {
  uri: string;
  cid: string;
  authorDid: string;
}

interface ReportReason {
  id: string;
  title: string;
  description: string;
}

const REPORT_REASONS: ReportReason[] = [
  {
    id: "com.atproto.moderation.defs#reasonSpam",
    title: "Spam",
    description: "Unwanted or repetitive content",
  },
  {
    id: "com.atproto.moderation.defs#reasonViolation",
    title: "Content Warning",
    description: "Contains sensitive content without proper labeling",
  },
  {
    id: "com.atproto.moderation.defs#reasonMisleading",
    title: "Misleading",
    description: "Misleading or false information",
  },
  {
    id: "com.atproto.moderation.defs#reasonSexual",
    title: "Sexual Content",
    description: "Explicit sexual content",
  },
  {
    id: "com.atproto.moderation.defs#reasonRude",
    title: "Harassment",
    description: "Harassment or bullying behavior",
  },
  {
    id: "com.atproto.moderation.defs#reasonOther",
    title: "Other",
    description: "Other policy violation",
  },
];

export function ReportPostModal({ uri, cid, authorDid }: ReportPostModalProps) {
  const { closeModal } = useModalControls();
  const agent = useAgent();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for reporting this post.");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await reportPost(agent, {
        reasonType: selectedReason,
        subject: {
          $type: "com.atproto.repo.strongRef",
          uri,
          cid,
        },
      });

      if (success) {
        Alert.alert(
          "Report Submitted",
          "Thank you for your report. We'll review this content according to our community guidelines.",
          [
            {
              text: "OK",
              onPress: () => closeModal(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to submit report. Please try again later."
        );
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Report Post</Text>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Why are you reporting this post?
        </Text>

        <ScrollView style={styles.reasonsList}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonItem,
                selectedReason === reason.id && styles.reasonItemSelected,
              ]}
              onPress={() => setSelectedReason(reason.id)}
            >
              <View style={styles.reasonContent}>
                <Text style={styles.reasonTitle}>{reason.title}</Text>
                <Text style={styles.reasonDescription}>
                  {reason.description}
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedReason === reason.id && styles.radioButtonSelected,
                ]}
              >
                {selectedReason === reason.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={closeModal}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedReason && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            <Text
              style={[
                styles.submitButtonText,
                !selectedReason && styles.submitButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: "#666",
  },
  subtitle: {
    padding: 20,
    paddingBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  reasonsList: {
    maxHeight: 300,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "transparent",
  },
  reasonItemSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 14,
    color: "#666",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#2196f3",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2196f3",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#dc3545",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#f8f9fa",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  submitButtonTextDisabled: {
    color: "#ccc",
  },
});