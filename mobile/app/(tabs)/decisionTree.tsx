import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
  const scrollRef = useRef<ScrollView>(null);

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

  const generateRoadmap = (answers: Record<string, string>) => {
    const demarcheType = getDemarcheTypeFromAnswers(answers);

    CreateFromTree({
      name:
        demarcheType.charAt(0).toUpperCase() +
        demarcheType.slice(1).toLowerCase(),
      userAnswers: answers,
    });

    Alert.alert(
      "✅ Roadmap générée",
      `La roadmap "${demarcheType}" a été générée automatiquement en fonction de vos choix.`,
    );
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
      generateRoadmap(newAnswers);
      return;
    }

    const nextNode = decisionTree[nextKey];
    if (!nextNode || !nextNode.options || nextNode.options.length === 0) {
      setHistory((prev) => [...prev, { type: "answer", label }]);
      setUserAnswers(newAnswers);
      generateRoadmap(newAnswers);
      return;
    }

    setHistory((prev) => [
      ...prev,
      { type: "answer", label },
      { type: "question", key: nextKey },
    ]);
    setUserAnswers(newAnswers);
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          ref={scrollRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
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
                Votre roadmap personnalisée :
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

        {currentOptions.length > 0 && (
          <View style={styles.optionsContainer}>
            <ScrollView
              style={styles.optionsScrollView}
              contentContainerStyle={styles.optionsContent}
              keyboardShouldPersistTaps="handled"
            >
              {currentOptions.map(({ label, next }, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionBubble}
                  onPress={() => handleOptionPress(next, label)}
                >
                  <Text style={styles.optionText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: wp(4),
    gap: 10,
    paddingBottom: hp(2),
    flexGrow: 1,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(20),
    alignSelf: "flex-start",
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginVertical: hp(0.5),
  },
  botText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
  },
  userBubble: {
    backgroundColor: "#3498db",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(20),
    alignSelf: "flex-end",
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginVertical: hp(0.5),
  },
  userText: {
    fontSize: moderateScale(16),
    color: "#fff",
    lineHeight: moderateScale(22),
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
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
    maxHeight: hp(25),
    paddingTop: hp(1),
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    gap: hp(1),
  },
  optionBubble: {
    backgroundColor: "#f8f9fa",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(15),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: hp(6),
    width: "100%",
  },
  optionText: {
    fontSize: moderateScale(14),
    textAlign: "center",
    color: "#333",
    lineHeight: moderateScale(20),
  },
});
