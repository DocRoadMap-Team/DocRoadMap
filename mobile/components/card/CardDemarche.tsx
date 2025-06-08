import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import request from "@/constants/Request";
import { useTheme } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface CardDemarcheProps {
  name: string;
  description: string;
  progress: number;
  id: number;
}

type Step = {
  id: string;
  name: string;
  description: string;
  completed?: boolean;
};

const CardDemarche: React.FC<CardDemarcheProps> = ({
  name,
  description,
  progress,
  id,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  const fetchSteps = useCallback(async () => {
    if (typeof id !== "number") return;
    setIsLoading(true);
    try {
      const response = await request.stepperID(id);
      if (response.error) {
        setError(response.error);
      } else {
        setSteps(response.data);
      }
    } catch (error) {
      setError(t("errorFetchingSteps"));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const handleStepClick = (step: Step) => {
    setSelectedStep(selectedStep?.id === step.id ? null : step);
  };

  const StepItem = ({ item, index }: { item: Step; index: number }) => {
    const circleStyle = item.completed
      ? styles.completedCircle
      : styles.incompleteCircle;

    return (
      <View style={styles.stepWrapper}>
        <View style={styles.circleColumn}>
          <TouchableOpacity onPress={() => handleStepClick(item)}>
            <View
              style={[
                styles.circle,
                circleStyle,
                { borderColor: theme.text, shadowColor: theme.text },
              ]}
            >
              <Text style={styles.circleText}>{index + 1}</Text>
            </View>
          </TouchableOpacity>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.connectorLine,
                {
                  backgroundColor: item.completed ? theme.primary : "#D3D3D3",
                },
              ]}
            />
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleStepClick(item)}
          style={styles.stepContent}
        >
          <Text style={[styles.stepName, { color: theme.text }]}>
            {item.name}
          </Text>
          {selectedStep?.id === item.id && (
            <Text style={[styles.stepDescription, { color: theme.text }]}>
              {item.description}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.text },
      ]}
    >
      <View
        style={[
          styles.cardHeader,
          { backgroundColor: theme.primary, borderColor: theme.text },
        ]}
      >
        <Icon name="credit-card" size={24} color="white" />
        <Text
          style={[styles.headerTitle, { color: "white", maxWidth: wp("50%") }]}
        >
          {name}
        </Text>
        {id && (
          <Text style={[styles.headerTitle, { color: "white" }]}> ({id})</Text>
        )}
      </View>
      <View style={styles.cardContent}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <Text
            style={[
              styles.contentTitle,
              { color: theme.text, maxWidth: wp("50%") },
            ]}
          >
            {description}
          </Text>
        </ScrollView>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.text }]}>
          {`${progress}% ${t("completed")}`}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.continueButtonText}>
            {progress < 100 ? t("continue") : t("complete")}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t("moreDetails")}
            </Text>

            <View style={styles.timelineContainer}>
              <ScrollView>
                {steps.map((item, index) => (
                  <StepItem key={item.id} item={item} index={index} />
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CardDemarche;

const styles = StyleSheet.create({
  card: {
    borderRadius: moderateScale(20),
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 30,
    margin: hp("0.75%"),
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: hp("2%"),
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    marginLeft: wp("2%"),
  },
  cardContent: {
    padding: hp("2%"),
    height: hp("15%"),
    overflow: "hidden",
    flex: 1,
  },
  contentTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    marginBottom: hp("1%"),
  },
  progressBarContainer: {
    height: hp("1%"),
    backgroundColor: "#E0E0E0",
    borderRadius: moderateScale(4),
    marginBottom: hp("1%"),
  },
  progressBar: {
    height: hp("1%"),
    borderRadius: moderateScale(4),
  },
  progressText: {
    fontSize: moderateScale(14),
  },
  cardFooter: {
    padding: hp("2%"),
  },
  continueButton: {
    padding: hp("1.5%"),
    borderRadius: moderateScale(4),
    alignItems: "center",
  },
  continueButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: moderateScale(12),
    padding: hp("2.5%"),
    width: wp("100%"),
    height: hp("90%"),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(4),
    elevation: 10,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  timelineContainer: {
    flex: 1,
    flexDirection: "column",
    paddingBottom: hp("2%"),
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp("2%"),
  },
  circleColumn: {
    alignItems: "center",
    marginRight: wp("4%"),
  },
  stepContent: {
    flex: 1,
  },
  stepName: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  stepDescription: {
    fontSize: moderateScale(14),
    marginTop: hp("0.5%"),
  },
  circle: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  completedCircle: {
    backgroundColor: "#4CAF50",
  },
  incompleteCircle: {
    backgroundColor: "#D3D3D3",
  },
  circleText: {
    color: "white",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  connectorLine: {
    width: wp("0.8%"),
    height: hp("5%"),
  },
  closeButton: {
    padding: hp("1.2%"),
    borderRadius: moderateScale(4),
    alignItems: "center",
    marginTop: hp("2%"),
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: "space-evenly",
    padding: hp("2%"),
  },
});
