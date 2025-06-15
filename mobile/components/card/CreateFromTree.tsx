import { Alert } from "react-native";
import request from "@/constants/Request";
import rawTree from "@/locales/decision-tree/decisionTree.json";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";


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

const decisionTree = rawTree as unknown as DecisionTree;
const [stepsId, setStepsId] = useState<number | null>(null);

export const CreateFromTree = async ({
  name,
  userAnswers,
  userId = 4,
}: {
  name: string;
  userAnswers: Record<string, string>;
  userId: number;
}) => {
  const lowerName = name.toLowerCase();
  const answerKey = processNameToAnswerKey[lowerName];
  const { t } = useTranslation();

  if (!answerKey || !decisionTree[answerKey]) {
    Alert.alert("Erreur", `Aucune démarche trouvée pour "${name}".`);
    return;
  }

  const stepGroup = decisionTree[answerKey];

  const processData = {
    name,
    description: `Créée automatiquement depuis ${answerKey}`,
    userId,
    stepsId: stepsId!,
    endedAt: "",
    status: "PENDING",
  };

  try {
    const processResponse = await request.create(processData);
    const processId = processResponse?.data?.id;

    if (!processId) {
      throw new Error(t("fetch_steps_error"));
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

    Alert.alert(t("step_created_success"));
  } catch (err) {
    console.error(err);
    Alert.alert(t("create_step_error"));
  }
};
