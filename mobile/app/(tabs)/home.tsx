import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import CardDemarche from "../../components/card/CardDemarche";
import ChatInterface from "../../components/chat/ChatInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SwaggerProcessPerIdList } from "@/constants/Swagger";
import request from "@/constants/Request";
import { useTheme } from "@/components/ThemeContext";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [cards, setCards] = useState<SwaggerProcessPerIdList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingAdministrative, setLoadingAdministrative] = useState(false);
  const [administrativeList, setAdministrativeList] = useState<any[]>([]);
  const [errorAdministrative, setErrorAdministrative] = useState<string | null>(
    null,
  );

  const fetchCards = useCallback(async () => {
    const response = await request.processperID();
    if ("data" in response && response.data) {
      setCards(response.data);
    } else {
      Alert.alert(t("home.error"), response.error || t("home.error_message"));
    }
  }, [t]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const createCard = useCallback(async () => {
    const requestBody = {
      name: "Test",
      description: "Test description",
      status: "Test status",
      userId: 7,
      stepsId: 2,
      endedAt: "2022-12-31",
    };

    try {
      const registrationResponse = await request.create(requestBody);
      console.log("Registration Response:", registrationResponse);

      if (registrationResponse.error) {
        setError(registrationResponse.error);
        return;
      }
    } catch (error) {
      setError(t("home.error_message"));
    }
  }, [t]);

  const handleMenuPress = () => {
    console.log("Menu/profile button pressed");
  };

  const handleSettingsClick = () => {
    router.push("/profile");
  };

  const handleGenerateRoadmap = async () => {
    router.push("/decisionTreeInterface");
  };

  const handleReminders = () => {
    router.push("/calendar");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCards();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <LinearGradient
        colors={["#204CCF", "#6006A4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text
              style={[styles.headerTitle, { color: theme.buttonText }]}
              allowFontScaling={true}
            >
              DocRoadmap
            </Text>
            <View style={styles.titleUnderline} />
          </View>

          <View style={styles.rightActions}>
            <View style={styles.iconWrapper}>
              <View>
                <ChatInterface />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSettingsClick}
              style={styles.iconWrapper}
            >
              <View style={styles.iconGlow}>
                <MaterialIcons
                  name="settings"
                  size={20}
                  color={theme.buttonText}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonsArea}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleGenerateRoadmap}
            accessibilityLabel={t("home.generate_roadmap")}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={["#204CCF", "#6006A4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modernButton}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons
                  name="add-road"
                  size={24}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text
                  style={[styles.buttonText, { color: theme.buttonText }]}
                  allowFontScaling={true}
                >
                  {t("home.generate_roadmap")}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleReminders}
            accessibilityLabel={t("home.my_reminders")}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={["#204CCF", "#6006A4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modernButton}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons
                  name="notifications"
                  size={24}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text
                  style={[styles.buttonText, { color: theme.buttonText }]}
                  allowFontScaling={true}
                >
                  {t("home.my_reminders")}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsSection}>
          <View style={styles.cardsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mes Démarches
            </Text>
            <LinearGradient
              colors={["#204CCF", "#6006A4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionTitleLine}
            />
          </View>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {cards.map((card, index) => (
              <View key={card.id} style={styles.cardWrapper}>
                <View style={styles.cardShadow}>
                  <CardDemarche
                    name={card.name}
                    description={card.description}
                    progress={Math.floor(Math.random() * 100)} // Placeholder progress
                    id={card.id}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalBackground}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Processus Administratifs</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#204CCF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {loadingAdministrative ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: theme.text }]}>
                    {t("Chargement...")}
                  </Text>
                </View>
              ) : errorAdministrative ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error" size={48} color="#e74c3c" />
                  <Text style={styles.errorText}>{errorAdministrative}</Text>
                </View>
              ) : (
                <ScrollView style={styles.administrativeList}>
                  {Array.isArray(administrativeList) &&
                  administrativeList.length > 0 ? (
                    administrativeList.map((item: any) => (
                      <View key={item.id} style={styles.administrativeItem}>
                        <View style={styles.administrativeItemContent}>
                          <MaterialIcons
                            name="description"
                            size={24}
                            color="#204CCF"
                          />
                          <Text
                            style={[
                              styles.administrativeItemText,
                              { color: theme.text },
                            ]}
                          >
                            {item.name}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noDataContainer}>
                      <MaterialIcons name="inbox" size={64} color="#bdc3c7" />
                      <Text style={[styles.noDataText, { color: theme.text }]}>
                        {t("home.no_data")}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    height: moderateScale(70),
  },
  menuButton: {
    borderRadius: moderateScale(12),
    overflow: "hidden",
  },
  menuIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: moderateScale(8),
    borderRadius: moderateScale(12),
    backdropFilter: "blur(10px)",
  },
  menuButtonText: {
    fontSize: moderateScale(24),
    fontWeight: "600",
  },
  titleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    marginRight: moderateScale(4),
  },
  titleUnderline: {
    width: moderateScale(60),
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginTop: moderateScale(4),
    borderRadius: moderateScale(2),
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(50),
  },
  iconWrapper: {
    borderRadius: moderateScale(20),
  },
  iconGlow: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: moderateScale(10),
    borderRadius: moderateScale(20),
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  buttonsArea: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(30),
    paddingBottom: moderateScale(20),
  },
  buttonContainer: {
    marginBottom: moderateScale(16),
    borderRadius: moderateScale(16),
    overflow: "hidden",
    shadowColor: "#204CCF",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modernButton: {
    borderRadius: moderateScale(16),
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(24),
  },
  gradientButton: {
    borderRadius: moderateScale(16),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: moderateScale(12),
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardsSection: {
    paddingTop: moderateScale(20),
  },
  cardsSectionHeader: {
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginBottom: moderateScale(8),
  },
  sectionTitleLine: {
    width: moderateScale(40),
    height: 3,
    borderRadius: moderateScale(2),
  },
  cardsContainer: {
    paddingLeft: moderateScale(20),
    paddingRight: moderateScale(20),
  },
  cardWrapper: {
    marginRight: moderateScale(16),
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: moderateScale(12),
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalContainer: {
    flex: 1,
    padding: moderateScale(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(32, 76, 207, 0.2)",
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#2c3e50",
  },
  closeButton: {
    backgroundColor: "rgba(32, 76, 207, 0.1)",
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
  },
  modalContent: {
    flex: 1,
    marginTop: moderateScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: moderateScale(16),
    color: "#e74c3c",
    textAlign: "center",
    marginTop: moderateScale(16),
    fontWeight: "500",
  },
  administrativeList: {
    flex: 1,
  },
  administrativeItem: {
    backgroundColor: "white",
    marginBottom: moderateScale(12),
    borderRadius: moderateScale(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  administrativeItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(16),
  },
  administrativeItemText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginLeft: moderateScale(12),
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: moderateScale(16),
    textAlign: "center",
    marginTop: moderateScale(16),
    fontWeight: "500",
    opacity: 0.7,
  },
});
