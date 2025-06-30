import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import tree from "../../locales/decision-tree/decisionTree.json";
import { CreateFromTree } from "../../components/card/CreateFromTree";
import { router } from "expo-router";

const decisionTree = tree as Record<string, any>;
type HistoryEntry =
  | { type: "question"; key: string }
  | { type: "answer"; label: string };

export default function DecisionTree() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: "question", key: "start" },
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<{ step_title: string; answer: string }[]>(
    [],
  );
  const [showSteps, setShowSteps] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isValid, setIsValid] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [history, showSteps]);

  const getDemarcheTypeFromAnswers = (
    answers: Record<string, string>,
  ): string => {
    const answerValues = Object.values(answers).map((v) => v.toLowerCase());

    if (
      answerValues.some(
        (answer) =>
          answer.includes("logement") ||
          answer.includes("appartement") ||
          answer.includes("maison") ||
          answer.includes("loyer"),
      )
    ) {
      return "logement";
    }

    if (
      answerValues.some(
        (answer) =>
          answer.includes("déménagement") ||
          answer.includes("déménager") ||
          answer.includes("changer d'adresse"),
      )
    ) {
      return "déménagement";
    }

    if (
      answerValues.some(
        (answer) =>
          answer.includes("emploi") ||
          answer.includes("travail") ||
          answer.includes("job") ||
          answer.includes("recherche d'emploi"),
      )
    ) {
      return "emploi";
    }

    if (
      answerValues.some(
        (answer) =>
          answer.includes("indépendance") ||
          answer.includes("indépendant") ||
          answer.includes("freelance") ||
          answer.includes("auto-entrepreneur"),
      )
    ) {
      return "indépendance";
    }

    return "generale";
  };

  const getProcessAnswersKey = (key: string): string | null => {
    if (key === "dem_answers") return "dem_answers";
    if (key === "aide_logement_answers") return "aide_logement_answers";
    if (key === "independance_answers") return "independance_answers";
    if (key === "emploi_answers") return "emploi_answers";
    return null;
  };

  const getStepsForProcess = (
    processAnswers: Record<string, any>,
    userAnswers: Record<string, string>,
  ): { step_title: string; answer: string }[] => {
    const steps: { step_title: string; answer: string }[] = [];
    for (const step of Object.values(processAnswers)) {
      if (step.step_question) {
        const userValue = userAnswers[step.step_question];
        const option = step.options.find((opt: any) => opt.label === userValue);
        if (
          (step.status === "mandatory" || step.status === "optional") &&
          option?.answer
        ) {
          steps.push({ step_title: step.step_title, answer: option.answer });
        }
      } else {
        const option = step.options[0];
        if (option?.answer) {
          steps.push({ step_title: step.step_title, answer: option.answer });
        }
      }
    }
    return steps;
  };

  const handleOptionPress = (nextKey: string, label: string) => {
    const lastQuestionEntry = [...history]
      .reverse()
      .find((e) => e.type === "question") as
      | { type: "question"; key: string }
      | undefined;
    const newAnswers = { ...userAnswers };
    if (lastQuestionEntry) {
      newAnswers[lastQuestionEntry.key] = label;
    }

    const processAnswersKey = getProcessAnswersKey(nextKey);
    if (processAnswersKey && decisionTree[processAnswersKey]) {
      const processAnswers = decisionTree[processAnswersKey] as Record<
        string,
        any
      >;
      const filteredSteps = getStepsForProcess(processAnswers, newAnswers);
      setSteps(filteredSteps);
      setUserAnswers(newAnswers);
      setShowSteps(true);
      setHistory([...history, { type: "answer", label }]);
      return;
    }

    setHistory((prev) => [
      ...prev,
      { type: "answer", label },
      { type: "question", key: nextKey },
    ]);
    setUserAnswers(newAnswers);
  };

  const handleInputChange = (text: string) => {
    setUserInput(text);
    const normalizedText = text.trim().toLowerCase();
    const validPhrases = [
      "crée la démarche",
      "créer la démarche",
      "créé la démarche",
      "créer démarche",
      "crée démarche",
      "créé démarche",
      "Créer la démarche",
      "Crée la démarche",
    ];
    setIsValid(validPhrases.includes(normalizedText));
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      const demarcheType = getDemarcheTypeFromAnswers(userAnswers);

      CreateFromTree({
        name: demarcheType,
        userAnswers,
      });

      Alert.alert(
        "✅ Démarche créée",
        `La démarche "${demarcheType}" a bien été créée en fonction de vos réponses.`,
      );
      setHistory((prev) => [
        ...prev,
        { type: "answer", label: userInput.trim() },
        { type: "question", key: "start" },
      ]);
      setUserAnswers((prev) => ({ ...prev, start: demarcheType }));
      setUserInput("");
    }
    restartChat();
  };

  const restartChat = () => {
    setHistory([{ type: "question", key: "start" }]);
    setUserAnswers({});
    setShowSteps(false);
    setSteps([]);
  };

  const lastEntry = history[history.length - 1];
  let currentOptions: { label: string; next: string }[] = [];
  if (lastEntry?.type === "question") {
    const node = decisionTree[lastEntry.key];
    if (node && "options" in node) {
      currentOptions = node.options;
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} ref={scrollRef}>
          {history.map((entry, index) => {
            if (entry.type === "question") {
              const node = decisionTree[entry.key];
              if ("question" in node) {
                return (
                  <View key={index} style={styles.botBubble}>
                    <Text style={styles.botText}>{node.question}</Text>
                  </View>
                );
              }
            } else if (entry.type === "answer") {
              return (
                <View key={index} style={styles.userBubble}>
                  <Text style={styles.userText}>{entry.label}</Text>
                </View>
              );
            }
            return null;
          })}

          {showSteps && (
            <View style={styles.botBubble}>
              <Text style={[styles.botText, { fontWeight: "bold" }]}>
                Étapes à suivre :
              </Text>
              {steps.map((step, idx) => (
                <View key={idx} style={{ marginTop: 8 }}>
                  <Text style={[styles.botText, { fontWeight: "bold" }]}>
                    {step.step_title}
                  </Text>
                  <Text style={styles.botText}>
                    {step.answer.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                      part.match(/^https?:\/\//) ? (
                        <Text
                          key={i}
                          style={styles.link}
                          onPress={() => Linking.openURL(part)}
                        >
                          {part}
                        </Text>
                      ) : (
                        <Text key={i}>{part}</Text>
                      ),
                    )}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.restartButton}
                onPress={restartChat}
              >
                <Text style={styles.restartText}>🔁 Recommencer</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          {currentOptions.length > 0 && (
            <ScrollView
              horizontal
              contentContainerStyle={styles.optionsBar}
              keyboardShouldPersistTaps="handled"
            >
              {currentOptions.map(({ label, next }, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionBubbleHorizontal}
                  onPress={() => handleOptionPress(next, label)}
                >
                  <Text style={styles.optionText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={handleInputChange}
              placeholder="Tapez 'Créer la démarche' pour créer votre démarche"
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: isValid && userInput ? 1 : 0.5 },
              ]}
              onPress={handleSendMessage}
              disabled={!isValid || !userInput.trim()}
            >
              <Text style={styles.sendButtonText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    padding: wp(4),
    gap: 10,
    paddingBottom: hp(2),
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(30),
    alignSelf: "flex-start",
    maxWidth: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  botText: {
    fontSize: moderateScale(16),
  },
  userBubble: {
    backgroundColor: "#3498db",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(30),
    alignSelf: "flex-end",
    maxWidth: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userText: {
    fontSize: moderateScale(16),
    color: "#000",
  },
  link: {
    color: "#007AFF",
    textDecorationLine: "underline",
    fontSize: moderateScale(15),
  },
  restartButton: {
    marginTop: hp(2),
    alignSelf: "center",
  },
  restartText: {
    color: "#007AFF",
    fontSize: moderateScale(15),
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    paddingVertical: hp(1),
  },
  optionsBar: {
    paddingHorizontal: wp(2),
    paddingBottom: hp(1),
    flexDirection: "row",
  },
  optionBubbleHorizontal: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(30),
    marginHorizontal: wp(1.5),
    justifyContent: "center",
    alignItems: "center",
    boxshadowColor: "#000",
    boxshadowOffset: { width: 0, height: 2 },
    boxshadowOpacity: 0.1,
    boxhadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: moderateScale(15),
    textAlign: "center",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: moderateScale(30),
    paddingHorizontal: wp(3),
    fontSize: moderateScale(16),
    height: hp(30),
    marginRight: wp(2),
  },
  sendButton: {
    backgroundColor: "#3498db",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(5),
    borderRadius: moderateScale(30),
  },
  sendButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
  },
});
