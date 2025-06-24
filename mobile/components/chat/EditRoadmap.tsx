import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function EditRoadmap() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Bonjour ! Quelle roadmap veux-tu éditer, suprrimer ou changer selon ton cas personnel ? Commence par donner juste le chiffre entre parenthèses à côté du titre de ta démarche avant de pouvoir converser normalement avec moi pour éditer ta démarche !",
      sender: "bot",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [processId, setProcessId] = useState<number | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg: Message = { text: message, sender: "user" };
    const newMessages: Message[] = [...messages, userMsg];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);

    console.log("Message envoyé par l'utilisateur : ", message);

    try {
      if (!processId) {
        const parsedId = parseInt(message.trim(), 10);

        console.log("Tentative de parsing de l'ID : ", parsedId);

        if (isNaN(parsedId)) {
          setMessages([
            ...newMessages,
            {
              text: "❌ Ce n'est pas un ID valide. Réessaie avec un chiffre.",
              sender: "bot",
            },
          ]);
          console.log("ID invalide.");
        } else {
          const testRes = await request.editRoadMap("ping", parsedId);
          console.log("Réponse de l'API pour tester l'ID : ", testRes);

          if (testRes.error || !testRes.data) {
            setMessages([
              ...newMessages,
              {
                text: "❌ Aucune roadmap trouvée avec cet ID. Réessaie.",
                sender: "bot",
              },
            ]);
            console.log("Aucune roadmap trouvée.");
          } else {
            setProcessId(parsedId);
            setMessages([
              ...newMessages,
              {
                text: "✅ Roadmap trouvée. Donne une instruction pour la modifier.",
                sender: "bot",
              },
            ]);
            console.log("Roadmap trouvée, ID : ", parsedId);
          }
        }
      } else {
        const res = await request.editRoadMap(message, processId);
        console.log("Réponse de l'API pour modifier la roadmap : ", res);

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
              { text: "Voici la roadmap mise à jour 👇", sender: "bot" },
              { text: JSON.stringify(roadmap, null, 2), sender: "bot" },
            ]);
            console.log("Roadmap mise à jour : ", roadmap);
          }
        }
      }
    } catch (error) {
      console.error("Erreur survenue : ", error);
      setMessages([...newMessages, { text: t("server_error"), sender: "bot" }]);
    } finally {
      setLoading(false);
      console.log("Chargement terminé.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modifier la roadmap</Text>
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
          placeholder={t("Écris ton message")}
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>{t("Envoyer")}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
});
