import React, { useState } from "react";
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
} from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import request from "@/constants/Request";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function ChatInterface() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const openModal = async () => {
    setModalVisible(true);
    setLoading(true);
    try {
      const res = await request.aiHistory();
      const historyText = res.data.history;
      const history = historyText.split("\n").map((line: string) => {
        const [roleLabel, ...rest] = line.split(": ");
        const text = rest.join(": ");
        return {
          text,
          sender: roleLabel.toLowerCase() === "user" ? "user" : "bot",
        };
      });
      if (history.length === 0) {
        setMessages([
          { text: "Bonjour demande moi ce dont tu as besoin !", sender: "bot" },
        ]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error(error);
      setMessages([{ text: t("server_error"), sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setMessages([]);
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
      <TouchableOpacity onPress={openModal} style={styles.floatingButton}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={28}
          color="white"
          accessibilityLabel="Icône de chat"
        />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("chatbot_name")}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} style={{ paddingRight: 10 }} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatContainer}>
            {messages.map((msg, index) => (
              <View
                key={index}
                style={
                  msg.sender === "user" ? styles.userMessage : styles.botMessage
                }
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
            {loading && <ActivityIndicator size="small" color="#999" />}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder={t("Ecris to meassge")}
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>{t("Envoyer")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: hp("2%"),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  closeText: {
    fontSize: moderateScale(20),
  },
  chatContainer: {
    flex: 1,
    padding: hp("2%"),
  },
  userMessage: {
    alignSelf: "flex-end",
    padding: hp("1.5%"),
    borderRadius: moderateScale(20),
    marginBottom: hp("1.5%"),
    backgroundColor: "#DCF8C6",
  },
  botMessage: {
    alignSelf: "flex-start",
    padding: hp("1.5%"),
    borderRadius: moderateScale(20),
    marginBottom: hp("1.5%"),
    backgroundColor: "#EEE",
  },
  messageText: {
    fontSize: moderateScale(16),
  },
  inputContainer: {
    flexDirection: "row",
    padding: hp("1.5%"),
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: moderateScale(20),
    padding: hp("1.5%"),
    fontSize: moderateScale(16),
    backgroundColor: "#F5F5F5",
  },
  sendButton: {
    borderRadius: moderateScale(20),
    padding: hp("1.5%"),
    marginLeft: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4C9EEB",
  },
  sendButtonText: {
    fontSize: moderateScale(20),
    color: "#FFF",
    fontWeight: "bold",
  },
  floatingButton: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(30),
    backgroundColor: "#4C9EEB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: hp("3%"),
  },
  demarcheItem: {
    fontSize: moderateScale(18),
    marginVertical: hp("1%"),
  },
});
