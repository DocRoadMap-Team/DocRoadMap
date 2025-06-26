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
import { useRouter } from "expo-router";

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
  const router = useRouter();
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

  const handleCalendarNavigation = useCallback(
    (step: Step) => {
      setModalVisible(false);
      router.push({
        pathname: "/calendar",
        params: {
          prefillEventName: step.name,
          prefillEventDescription: step.description,
          openModal: "true",
        },
      });
    },
    [router],
  );

  const StepItem = ({ item, index }: { item: Step; index: number }) => {
    const isSelected = selectedStep?.id === item.id;

    return (
      <View style={styles.stepWrapper}>
        <View style={styles.circleColumn}>
          <TouchableOpacity
            onPress={() => handleStepClick(item)}
            style={styles.circleContainer}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.circle,
                item.completed
                  ? styles.completedCircle
                  : styles.incompleteCircle,
              ]}
            >
              {item.completed ? (
                <Icon name="check" size={18} color="#FFFFFF" />
              ) : (
                <Text style={styles.circleText}>{index + 1}</Text>
              )}
            </View>
          </TouchableOpacity>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.connectorLine,
                item.completed ? styles.completedLine : styles.incompleteLine,
              ]}
            />
          )}
        </View>

        <View style={styles.stepContent}>
          <TouchableOpacity
            onPress={() => handleStepClick(item)}
            style={[
              styles.stepCard,
              isSelected && styles.stepCardSelected,
              { backgroundColor: theme.background },
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.stepHeader}>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepName, { color: theme.text }]}>
                  {item.name}
                </Text>
                {item.completed && (
                  <View style={styles.completedBadge}>
                    <Icon name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.completedText}>Terminé</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => handleCalendarNavigation(item)}
                activeOpacity={0.8}
              >
                <Icon name="calendar-plus" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {isSelected && (
              <View style={styles.stepDescriptionContainer}>
                <Text style={[styles.stepDescription, { color: theme.text }]}>
                  {item.description}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Icon name="file-document-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.headerTitle} numberOfLines={2}>
                  {name}
                </Text>
                <Text style={styles.headerSubtitle}>Dossier #{id}</Text>
              </View>
            </View>
            <View style={styles.progressIndicator}>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardBody, { backgroundColor: theme.background }]}>
          <ScrollView
            style={styles.descriptionContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.description, { color: theme.text }]}>
              {description}
            </Text>
          </ScrollView>

          <View style={styles.progressSection}>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: theme.text }]}>
                Progression
              </Text>
              <Text style={[styles.progressValue, { color: theme.text }]}>
                {progress}% {t("completed")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>
              {progress < 100 ? t("continue") : t("complete")}
            </Text>
            <Icon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background }]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {t("details")}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.text }]}>
                  {name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.timelineContainer}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner}>
                      <Icon name="loading" size={32} color="#2563EB" />
                    </View>
                    <Text style={[styles.loadingText, { color: theme.text }]}>
                      {t("loading", "Chargement...")}
                    </Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <View style={styles.errorIcon}>
                      <Icon name="alert-circle" size={48} color="#EF4444" />
                    </View>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={fetchSteps}
                      activeOpacity={0.8}
                    >
                      <Icon name="refresh" size={16} color="#FFFFFF" />
                      <Text style={styles.retryButtonText}>
                        {t("retry", "Réessayer")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : steps.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                      <Icon name="file-outline" size={48} color="#9CA3AF" />
                    </View>
                    <Text style={[styles.emptyText, { color: theme.text }]}>
                      {t("noStepsAvailable", "Aucune étape disponible")}
                    </Text>
                  </View>
                ) : (
                  steps.map((item, index) => (
                    <StepItem key={item.id} item={item} index={index} />
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.9}
              >
                <Text style={styles.closeButtonText}>{t("close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CardDemarche;

const styles = StyleSheet.create({
  cardContainer: {
    margin: hp("1%"),
  },
  card: {
    borderRadius: moderateScale(20),
    backgroundColor: "#FFFFFF",
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#2563EB",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("3%"),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: hp("0.5%"),
  },
  headerSubtitle: {
    fontSize: moderateScale(13),
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  progressIndicator: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressPercentage: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cardBody: {
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("3%"),
  },
  descriptionContainer: {
    maxHeight: hp("8%"),
    marginBottom: hp("2%"),
  },
  description: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    fontWeight: "400",
  },
  progressSection: {
    marginTop: hp("1%"),
  },
  progressBarBackground: {
    height: moderateScale(8),
    backgroundColor: "#E5E7EB",
    borderRadius: moderateScale(4),
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: moderateScale(4),
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("1%"),
  },
  progressLabel: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    opacity: 0.7,
  },
  progressValue: {
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  cardFooter: {
    paddingHorizontal: wp("5%"),
    paddingBottom: hp("3%"),
  },
  continueButton: {
    backgroundColor: "#2563EB",
    paddingVertical: hp("2%"),
    borderRadius: moderateScale(12),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "700",
    marginRight: wp("2%"),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    height: hp("90%"),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("3%"),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    marginBottom: hp("0.5%"),
  },
  modalSubtitle: {
    fontSize: moderateScale(14),
    opacity: 0.7,
    fontWeight: "500",
  },
  modalCloseButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    flex: 1,
  },
  timelineContainer: {
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
  },
  stepWrapper: {
    flexDirection: "row",
    marginBottom: hp("2%"),
  },
  circleColumn: {
    alignItems: "center",
    marginRight: wp("4%"),
  },
  circleContainer: {
    marginBottom: hp("1%"),
  },
  circle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCircle: {
    backgroundColor: "#10B981",
  },
  incompleteCircle: {
    backgroundColor: "#9CA3AF",
  },
  circleText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  connectorLine: {
    width: moderateScale(3),
    height: hp("4%"),
    borderRadius: moderateScale(1.5),
  },
  completedLine: {
    backgroundColor: "#10B981",
  },
  incompleteLine: {
    backgroundColor: "#E5E7EB",
  },
  stepContent: {
    flex: 1,
  },
  stepCard: {
    borderRadius: moderateScale(12),
    padding: wp("4%"),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepCardSelected: {
    borderColor: "#2563EB",
    borderWidth: 2,
    shadowColor: "#2563EB",
    shadowOpacity: 0.1,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stepInfo: {
    flex: 1,
    marginRight: wp("3%"),
  },
  stepName: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    lineHeight: moderateScale(22),
    marginBottom: hp("0.5%"),
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.3%"),
    borderRadius: moderateScale(6),
    alignSelf: "flex-start",
  },
  completedText: {
    fontSize: moderateScale(12),
    color: "#10B981",
    fontWeight: "600",
    marginLeft: wp("1%"),
  },
  calendarButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    borderRadius: moderateScale(8),
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stepDescriptionContainer: {
    marginTop: hp("1.5%"),
    paddingTop: hp("1.5%"),
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  stepDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    opacity: 0.8,
  },
  modalFooter: {
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("3%"),
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  closeButton: {
    backgroundColor: "#2563EB",
    paddingVertical: hp("2%"),
    borderRadius: moderateScale(12),
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("10%"),
  },
  loadingSpinner: {
    marginBottom: hp("2%"),
  },
  loadingText: {
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("10%"),
  },
  errorIcon: {
    marginBottom: hp("2%"),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: "#EF4444",
    textAlign: "center",
    marginBottom: hp("3%"),
    lineHeight: moderateScale(22),
  },
  retryButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("1.5%"),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: wp("2%"),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("10%"),
  },
  emptyIcon: {
    marginBottom: hp("2%"),
  },
  emptyText: {
    fontSize: moderateScale(16),
    textAlign: "center",
    fontWeight: "500",
    opacity: 0.7,
  },
});
