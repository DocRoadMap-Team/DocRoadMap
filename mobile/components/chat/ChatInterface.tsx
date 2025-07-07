import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
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
import request from "@/constants/Request";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function ChatInterface() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    if (modalVisible || messages.length > 0 || loading) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [modalVisible, messages, loading]);

  const openModal = async () => {
    setModalVisible(true);

    if (historyLoaded) return;

    setLoading(true);
    try {
      const res = await request.aiHistory();
      const historyText = res?.data?.history;

      if (!historyText || typeof historyText !== "string") {
        setMessages([
          {
            text: "Bonjour ! Demande-moi ce dont tu as besoin ! 👋",
            sender: "bot",
          },
        ]);
      } else {
        const history = historyText.split("\n").map((line: string) => {
          const [roleLabel, ...rest] = line.split(": ");
          const text = rest.join(": ");
          return {
            text,
            sender: roleLabel.toLowerCase() === "user" ? "user" : "bot",
          };
        });
        const convertedHistory: Message[] = history.map((msg) => ({
          text: msg.text,
          sender: msg.sender === "user" ? "user" : "bot",
        }));

        setMessages(convertedHistory);
      }
      setHistoryLoaded(true);
    } catch (error) {
      console.error(error);
      setMessages([{ text: t("server_error"), sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);

    setMessage("");
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg: Message = { text: message, sender: "user" };
    const newMessages: Message[] = [...messages, userMsg];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);

    try {
      const res = await request.aiQuery(message, "gpt-4o-mini");
      const botReply = res?.data?.response ?? t("server_error");
      setMessages([...newMessages, { text: botReply, sender: "bot" as const }]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { text: t("server_error"), sender: "bot" as const },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={openModal}
        style={styles.floatingButton}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#204CCF", "#6006A4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.floatingButtonGradient}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color="white"
            accessibilityLabel="Icône de chat"
          />
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          <SafeAreaView style={styles.safeArea}>
            <LinearGradient
              colors={["#204CCF", "#6006A4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <View style={styles.botAvatarHeader}>
                      <Text style={styles.botAvatarHeaderText}>🤖</Text>
                    </View>
                    <View>
                      <Text style={styles.headerTitle}>
                        {t("chatbot_name")}
                      </Text>
                      <Text style={styles.headerSubtitle}>Assistant IA</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.closeButton}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

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
                    <ActivityIndicator size="small" color="#4A5568" />
                    <Text style={styles.loadingText}>
                      En cours de frappe...
                    </Text>
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
                  {
                    backgroundColor: theme.background,
                    borderColor:
                      theme.background === "dark" ? "#A0AEC0" : "#CBD5E0",
                    borderWidth: 1,
                  },
                ]}
              >
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder={t("Ecris to meassge") || "Écris ton message..."}
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
                      name="send"
                      size={20}
                      color={message.trim() && !loading ? "white" : "#A0AEC0"}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = ScaledSheet.create({
  floatingButton: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  floatingButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(30),
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  botAvatarHeader: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  botAvatarHeaderText: {
    fontSize: moderateScale(20),
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
    backgroundColor: "#FFFFFF",
  },
  chatContent: {
    padding: wp(4),
    paddingBottom: hp(2),
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
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    marginBottom: hp(0.5),
  },
  botAvatarText: {
    fontSize: moderateScale(18),
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
    backgroundColor: "#E6F3FF",
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
  },
  userMessageText: {
    fontSize: moderateScale(16),
    color: "#2D3748",
    lineHeight: moderateScale(24),
    fontWeight: "500",
  },
  userAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#E6F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(3),
    marginBottom: hp(0.5),
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
    backgroundColor: "#F7FAFC",
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
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: "#718096",
    marginLeft: wp(2),
    fontStyle: "italic",
  },

  inputContainer: {
    backgroundColor: "#F7FAFC",
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
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#2D3748",
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
