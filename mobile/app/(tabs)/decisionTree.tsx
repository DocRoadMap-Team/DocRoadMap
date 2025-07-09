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
import { LinearGradient } from "expo-linear-gradient";
import { CreateFromTree } from "../../components/card/CreateFromTree";
import { router } from "expo-router";
import { useTheme } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";

import treeFr from "../../locales/fr/decisionTree.json";
import treeEs from "../../locales/spanish/decisionTree.json";
import treeEn from "../../locales/eng/decisionTree.json";

const getDecisionTree = (language: string) => {
  switch (language) {
    case "es":
      return treeEs;
    case "en":
      return treeEn;
    default:
      return treeFr;
  }
};

type HistoryEntry =
  | { type: "question"; key: string }
  | { type: "answer"; label: string };

export default function DecisionTree() {
  const { theme } = useTheme();
  const { i18n, t } = useTranslation();
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: "question", key: "start" },
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<{ step_title: string; answer: string }[]>(
    [],
  );
  const [showSteps, setShowSteps] = useState(false);
  const [decisionTree, setDecisionTree] = useState<Record<string, any>>(
    getDecisionTree(i18n.language),
  );
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const newTree = getDecisionTree(i18n.language);
    setDecisionTree(newTree);
    setHistory([{ type: "question", key: "start" }]);
    setUserAnswers({});
    setShowSteps(false);
    setSteps([]);
  }, [i18n.language]);

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
          answer.includes("indépendance") ||
          answer.includes("independance") ||
          answer.includes("independence") ||
          answer.includes("independencia") ||
          answer.includes("apprenti") ||
          answer.includes("apprentice") ||
          answer.includes("aprendiz") ||
          answer.includes("autonomie") ||
          answer.includes("autonomy") ||
          answer.includes("autonomía"),
      )
    ) {
      return "indépendance";
    }

    if (
      answerValues.some(
        (answer) =>
          answer.includes("Yes, I'm a student or have a low income") ||
          answer.includes("No, I don't think I qualify") ||
          answer.includes("logement") ||
          answer.includes("appartement") ||
          answer.includes("maison") ||
          answer.includes("loyer") ||
          answer.includes("housing") ||
          answer.includes("apartment") ||
          answer.includes("house") ||
          answer.includes("rent") ||
          answer.includes("vivienda") ||
          answer.includes("apartamento") ||
          answer.includes("casa") ||
          answer.includes("alquiler"),
      )
    ) {
      return "logement";
    }

    if (
      answerValues.some(
        (answer) =>
          answer.includes("In another municipality") ||
          answer.includes("déménagement") ||
          answer.includes("déménager") ||
          answer.includes("changer d'adresse") ||
          answer.includes("moving") ||
          answer.includes("relocation") ||
          answer.includes("change address") ||
          answer.includes("mudanza") ||
          answer.includes("mudarse") ||
          answer.includes("cambiar dirección"),
      )
    ) {
      return "déménagement";
    }

    if (
      answerValues.some(
        (answer) =>
          answer.includes("I am looking for my first job") ||
          answer.includes(
            "I have already worked (with an employment contract)",
          ) ||
          answer.includes("emploi") ||
          answer.includes("travail") ||
          answer.includes("job") ||
          answer.includes("recherche d'emploi") ||
          answer.includes("employment") ||
          answer.includes("work") ||
          answer.includes("job search") ||
          answer.includes("empleo") ||
          answer.includes("trabajo") ||
          answer.includes("búsqueda de empleo"),
      )
    ) {
      return "emploi";
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
      language: i18n.language,
    });

    Alert.alert(t("roadmap_created"));
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
    <LinearGradient
      colors={["#FFFFFF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View style={styles.mainContainer}>
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { paddingBottom: currentOptions.length > 0 ? hp(1) : hp(2) },
            ]}
            ref={scrollRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {history.map((entry, index) => {
              if (entry.type === "question") {
                const node = decisionTree[entry.key];
                if ("question" in node) {
                  return (
                    <View key={index} style={styles.botBubbleContainer}>
                      <View style={styles.botAvatar}>
                        <Text style={styles.botAvatarText}>🤖</Text>
                      </View>
                      <View style={styles.botBubble}>
                        <Text style={styles.botText}>{node.question}</Text>
                      </View>
                    </View>
                  );
                }
              } else if (entry.type === "answer") {
                return (
                  <View key={index} style={styles.userBubbleContainer}>
                    <View style={styles.userBubble}>
                      <Text style={styles.userText}>{entry.label}</Text>
                    </View>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>👤</Text>
                    </View>
                  </View>
                );
              }
              return null;
            })}

            {showSteps && (
              <View style={styles.roadmapContainer}>
                <View style={styles.roadmapHeader}>
                  <Text style={styles.roadmapTitle}>{t("your_roadmap")}</Text>
                  <Text style={styles.roadmapSubtitle}>
                    {t("check_roadmap")}
                  </Text>
                </View>

                <View style={styles.roadmapContent}>
                  {steps.map((step, idx) => (
                    <View key={idx} style={styles.stepContainer}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>{step.step_title}</Text>
                        <Text style={styles.stepDescription}>
                          {step.answer
                            .split(/(https?:\/\/[^\s]+)/g)
                            .map((part, i) =>
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
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={restartChat}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#204CCF", "#204CCF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.restartButtonGradient}
                  >
                    <Text style={styles.restartText}>{t("restart")}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {currentOptions.length > 0 && (
            <View
              style={[
                styles.optionsContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <View style={styles.optionsHeader}>
                <Text style={[styles.optionsTitle, { color: theme.text }]}>
                  {t("choose_option")}
                </Text>
              </View>
              <ScrollView
                style={styles.optionsScrollView}
                contentContainerStyle={styles.optionsContent}
                showsVerticalScrollIndicator={false}
              >
                {currentOptions.map(({ label, next }, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.optionBubble}
                    onPress={() => handleOptionPress(next, label)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#FFFFFF", "#F8F9FA"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.optionGradient}
                    >
                      <Text style={styles.optionText}>{label}</Text>
                      <Text style={styles.optionArrow}>→</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = ScaledSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: wp(4),
    flexGrow: 1,
  },

  botBubbleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: hp(1),
    paddingRight: wp(10),
  },
  botAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    marginBottom: hp(0.5),
  },
  botAvatarText: {
    fontSize: moderateScale(18),
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(20),
    borderBottomLeftRadius: moderateScale(8),
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  botText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    color: "#2D3748",
  },

  userBubbleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: hp(1),
    paddingLeft: wp(10),
  },
  userBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(8),
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  userText: {
    fontSize: moderateScale(16),
    color: "#4A5568",
    lineHeight: moderateScale(24),
    fontWeight: "500",
  },
  userAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(3),
    marginBottom: hp(0.5),
  },
  userAvatarText: {
    fontSize: moderateScale(18),
  },

  roadmapContainer: {
    marginTop: hp(2),
    marginBottom: hp(2),
  },
  roadmapHeader: {
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: moderateScale(16),
    marginBottom: hp(2),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  roadmapTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: hp(0.5),
  },
  roadmapSubtitle: {
    fontSize: moderateScale(14),
    color: "#718096",
    fontStyle: "italic",
  },
  roadmapContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: moderateScale(16),
    padding: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: hp(2.5),
    alignItems: "flex-start",
  },
  stepNumber: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: "#4299E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    marginTop: hp(0.5),
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: hp(0.5),
  },
  stepDescription: {
    fontSize: moderateScale(14),
    color: "#4A5568",
    lineHeight: moderateScale(20),
  },
  link: {
    color: "#4299E1",
    textDecorationLine: "underline",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  restartButton: {
    marginTop: hp(2),
    alignSelf: "center",
    borderRadius: moderateScale(25),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  restartButtonGradient: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: moderateScale(25),
    alignItems: "center",
  },
  restartText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },

  optionsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: hp(40),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
    marginTop: hp(1),
  },
  optionsHeader: {
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
  },
  optionsTitle: {
    fontSize: moderateScale(17),
    fontWeight: "600",
    color: "#2D3748",
  },
  optionsScrollView: {
    maxHeight: hp(30),
  },
  optionsContent: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    gap: hp(1.5),
  },
  optionBubble: {
    borderRadius: moderateScale(15),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  optionGradient: {
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(4),
    borderRadius: moderateScale(15),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: hp(6),
  },
  optionText: {
    fontSize: moderateScale(15),
    color: "#2D3748",
    lineHeight: moderateScale(22),
    flex: 1,
    fontWeight: "500",
  },
  optionArrow: {
    fontSize: moderateScale(16),
    color: "#4A5568",
    marginLeft: wp(2),
  },
});
