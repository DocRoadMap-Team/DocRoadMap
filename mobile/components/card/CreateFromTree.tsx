import { Alert } from "react-native";
import request from "@/constants/Request";
import rawTree from "@/locales/decision-tree/decisionTree.json";
import React, { useState, useEffect, useCallback, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type StepData = {
  name: string;
  description: string;
  processId: number;
};

const processNameToAnswerKey: Record<string, string> = {
  déménagement: "dem_answers",
  logement: "aide_logement_answers",
  indépendance: "independance_answers",
  emploi: "emploi_answers",
};

interface StepJSON {
  step_title: string;
  step_question: string | null;
  status: "mandatory" | "optional";
  options: {
    label: string | null;
    answer: string | null;
  }[];
}

type DecisionTree = {
  [key: string]: {
    [stepId: string]: StepJSON;
  };
};

const getId = async (): Promise<number | null> => {
  const id = await AsyncStorage.getItem("id");
  return id ? parseInt(id, 10) : null;
};

const decisionTree = rawTree as unknown as DecisionTree;
let StepsId: number | null = null;

export const useStepsId = () => {
  const [stepsId, setStepsId] = useState<number | null>(StepsId);
  const updateStepsId = (id: number | null) => {
    StepsId = id;
    setStepsId(id);
  };
  return { stepsId, setStepsId: updateStepsId };
};

const countTotalSteps = (stepGroup: Record<string, StepJSON>): number => {
  return Object.values(stepGroup).filter(
    (step) => step.step_title && step.options?.length,
  ).length;
};

export const CreateFromTree = async ({
  name,
  userAnswers,
}: {
  name: string;
  userAnswers: Record<string, string>;
}) => {
  const lowerName = name.toLowerCase();
  const answerKey = processNameToAnswerKey[lowerName];
  const userId = await getId();

  if (!answerKey || !decisionTree[answerKey]) {
    Alert.alert("Erreur", `Aucune démarche trouvée pour "${name}".`);
    return;
  }

  const stepGroup = decisionTree[answerKey];
  const totalSteps = countTotalSteps(stepGroup);

  const processData = {
    name,
    description: `${totalSteps} étapes au total`,
    userId,
    stepsId: StepsId!,
    endedAt: "",
    status: "PENDING",
  };

  try {
    const processResponse = await request.create(processData);
    const processId = processResponse?.data?.id;

    if (!processId) {
      throw new Error("Impossible de récupérer l'ID de la démarche créée.");
    }

    const stepList: StepData[] = [];
    Object.values(stepGroup).forEach((step) => {
      if (!step.step_title || !step.options?.length) return;

      let answer = "";
      if (step.step_question) {
        const userLabel = userAnswers[step.step_question];
        const matchedOption = step.options.find(
          (opt) => opt.label === userLabel,
        );
        if (matchedOption?.answer) {
          answer = matchedOption.answer;
        }
      } else {
        answer = step.options[0]?.answer ?? "";
      }

      if (answer) {
        stepList.push({
          name: step.step_title,
          description: answer,
          processId,
        });
      }
    });

    for (const step of stepList) {
      await request.createStep(step);
    }

    Alert.alert(
      "Succès",
      `Démarche "${name}" créée avec ${stepList.length} étape(s).`,
    );
  } catch (err) {
    console.error(err);
    Alert.alert("Erreur", "Impossible de créer la démarche ou les étapes.");
  }
};
