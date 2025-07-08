import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import request from "@/constants/Request";
import { router, useLocalSearchParams } from "expo-router";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function EditRoadmap() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const { processId: paramProcessId } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [processId, setProcessId] = useState<number | null>(null);

  useEffect(() => {
    if (paramProcessId) {
      const id = parseInt(paramProcessId as string, 10);
      if (!isNaN(id)) {
        setProcessId(id);
        setMessages([
          {
            text: t("roadmap_found"),
            sender: "bot",
          },
        ]);
      } else {
        setMessages([
          {
            text: t("roadmap_not_found"),
            sender: "bot",
          },
        ]);
      }
    } else {
      setMessages([
        {
          text: t("roadmap_not_found"),
          sender: "bot",
        },
      ]);
    }
  }, [paramProcessId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg: Message = { text: message, sender: "user" };
    const newMessages: Message[] = [...messages, userMsg];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);

    try {
      if (!processId) {
        const parsedId = parseInt(message.trim(), 10);

        if (isNaN(parsedId)) {
          setMessages([
            ...newMessages,
            {
              text: t("id_not_valid"),
              sender: "bot",
            },
          ]);
        } else {
          const testRes = await request.editRoadMap("ping", parsedId);

          if (testRes.error || !testRes.data) {
            setMessages([
              ...newMessages,
              {
                text: t("roadmap_not_found"),
                sender: "bot",
              },
            ]);
          } else {
            setProcessId(parsedId);
            setMessages([
              ...newMessages,
              {
                text: t("roadmap_found"),
                sender: "bot",
              },
            ]);
          }
        }
      } else {
        const res = await request.editRoadMap(message, processId);

        if (res.error) {
          setMessages([
            ...newMessages,
            { text: t("server_error"), sender: "bot" },
          ]);
          console.log("Erreur lors de la modification de la roadmap.");
        } else if (res.data) {
          const { isAsking, question, roadmap } = res.data;

          if (isAsking && question) {
            setMessages([...newMessages, { text: question, sender: "bot" }]);
            console.log(
              "Le bot demande une information supplémentaire : ",
              question,
            );
          } else if (!isAsking && roadmap) {
            setMessages([
              ...newMessages,
              { text: t("roadmap_update"), sender: "bot" },
              {
                text: t("refresh_roadmap"),
                sender: "bot",
              },
            ]);
            console.log("Roadmap mise à jour : ", roadmap);
          }
        }
      }
    } catch (error) {
      setMessages([...newMessages, { text: t("server_error"), sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <LinearGradient
          colors={["#204CCF", "#6006A4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.iconHeader}>
                  <Ionicons name="map-outline" size={24} color="white" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Modifier la roadmap</Text>
                  <Text style={styles.headerSubtitle}>
                    {processId ? `ID: ${processId}` : t("edit_roadmap")}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.replace("/home")}
                style={styles.closeButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t("home.close")}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[
            styles.keyboardAvoidingView,
            { backgroundColor: theme.background },
          ]}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            ref={scrollRef}
            style={[
              styles.chatContainer,
              { backgroundColor: theme.background },
            ]}
            contentContainerStyle={[
              styles.chatContent,
              { backgroundColor: theme.background },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={
                  msg.sender === "user"
                    ? styles.userMessageContainer
                    : styles.botMessageContainer
                }
              >
                {msg.sender === "bot" && (
                  <View style={styles.botAvatar}>
                    <Text style={styles.botAvatarText}>🤖</Text>
                  </View>
                )}

                <View
                  style={
                    msg.sender === "user"
                      ? styles.userMessage
                      : styles.botMessage
                  }
                >
                  <Text
                    style={
                      msg.sender === "user"
                        ? styles.userMessageText
                        : styles.botMessageText
                    }
                  >
                    {msg.text}
                  </Text>
                </View>

                {msg.sender === "user" && (
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>👤</Text>
                  </View>
                )}
              </View>
            ))}

            {loading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#4ECDC4" />
                  <Text style={styles.loadingText}>{t("edit_roadmap")}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.background },
              ]}
            >
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={processId ? t("edit_roadmap") : t("enter_id")}
                placeholderTextColor={
                  theme.background === "#000000" ||
                  theme.background === "#1A1A1A"
                    ? "#E0E0E0"
                    : "#FFFFFFFF"
                }
                style={[styles.input, { color: theme.text }]}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSend}
                style={styles.sendButton}
                activeOpacity={0.8}
                disabled={!message.trim() || loading}
              >
                <LinearGradient
                  colors={
                    message.trim() && !loading
                      ? ["#204CCF", "#204CCF"]
                      : ["#E2E8F0", "#CBD5E0"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons
                    name={processId ? "build-outline" : "search-outline"}
                    size={20}
                    color={message.trim() && !loading ? "white" : "#A0AEC0"}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },

  headerGradient: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconHeader: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: hp(0.2),
  },
  closeButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: wp(4),
    paddingBottom: hp(2),
  },

  botAvatarText: {
    fontSize: moderateScale(18),
  },
  botMessageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: hp(1),
    paddingRight: wp(12),
  },
  botAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    marginBottom: hp(0.5),
    borderWidth: 1,
    borderColor: "#E0F2F1",
  },
  botMessage: {
    backgroundColor: "#F7FAFC",
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(20),
    borderBottomLeftRadius: moderateScale(8),
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0F2F1",
  },
  botMessageText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    color: "#2D3748",
  },

  userMessageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: hp(1),
    paddingLeft: wp(12),
  },
  userMessage: {
    backgroundColor: "#204CCF",
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(8),
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FFCCCB",
  },
  userMessageText: {
    fontSize: moderateScale(16),
    color: "#FFFFFF",
    lineHeight: moderateScale(24),
    fontWeight: "500",
  },
  userAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),

    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(3),
    marginBottom: hp(0.5),
    borderWidth: 1,
  },

  userAvatarText: {
    fontSize: moderateScale(18),
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: hp(1),
    paddingRight: wp(12),
  },
  loadingBubble: {
    backgroundColor: "#F0F8FF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(20),
    borderBottomLeftRadius: moderateScale(8),
    flexDirection: "row",
    alignItems: "center",
    marginLeft: wp(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0F2F1",
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: "#2D3748",
    marginLeft: wp(2),
    fontStyle: "italic",
  },

  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",

    borderRadius: moderateScale(25),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),

    paddingVertical: hp(1),
    paddingRight: wp(2),
    maxHeight: hp(12),
    lineHeight: moderateScale(22),
  },
  sendButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    marginLeft: wp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
});
