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
import DecisionTreeInterface from "@/components/chat/DecisionTreeInterface";
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
    router.push("/settings");
  };

  const handleGenerateRoadmap = async () => {
    console.log("Generate new roadmap pressed");
    setModalVisible(true);
    setLoadingAdministrative(true);
    setErrorAdministrative(null);

    const response = await request.listProcessAdministrative();
    console.log("API Response:", response);

    if (response.data) {
      setAdministrativeList(response.data);
    } else {
      setErrorAdministrative(response.error || t("home.error_message"));
    }

    setLoadingAdministrative(false);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Text
            style={[styles.menuButtonText, { color: theme.buttonText }]}
            allowFontScaling={true}
            accessibilityLabel={t("home.menu_button")}
            accessibilityRole="button"
          >
            ☰
          </Text>
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: theme.buttonText }]}
          allowFontScaling={true}
        >
          DocRoadmap
        </Text>

        <View style={styles.rightActions}>
          <View style={styles.iconWrapper}>
            <DecisionTreeInterface />
          </View>

          <View style={styles.iconWrapper}>
            <ChatInterface />
          </View>

          <TouchableOpacity
            onPress={handleSettingsClick}
            style={styles.iconWrapper}
          >
            <MaterialIcons name="settings" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.buttonsArea}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleGenerateRoadmap}
            accessibilityLabel={t("home.generate_roadmap")}
            accessibilityRole="button"
          >
            <Text
              style={[styles.buttonText, { color: theme.buttonText }]}
              allowFontScaling={true}
            >
              {t("home.generate_roadmap")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleReminders}
            accessibilityLabel={t("home.my_reminders")}
            accessibilityRole="button"
          >
            <Text
              style={[styles.buttonText, { color: theme.buttonText }]}
              allowFontScaling={true}
            >
              {t("home.my_reminders")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal={true}>
          {cards.map((card, index) => (
            <View key={card.id} style={{ marginRight: 16 }}>
              <CardDemarche
                name={card.name}
                description={card.description}
                progress={Math.floor(Math.random() * 100)} // Placeholder progress
                id={card.id}
              />
            </View>
          ))}
        </ScrollView>
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text
              style={{
                fontSize: moderateScale(18),
                color: theme.primary,
                textAlign: "right",
              }}
              accessibilityLabel={t("close")}
              accessibilityRole="button"
            >
              {t("close")}
            </Text>
          </TouchableOpacity>

          {loadingAdministrative ? (
            <Text style={{ marginTop: 20, color: theme.text }}>
              {t("Chargement...")}
            </Text>
          ) : errorAdministrative ? (
            <Text style={{ marginTop: 20, color: "red" }}>
              {errorAdministrative}
            </Text>
          ) : (
            <ScrollView style={{ marginTop: 20 }}>
              {Array.isArray(administrativeList) &&
              administrativeList.length > 0 ? (
                administrativeList.map((item: any) => (
                  <View key={item.id} style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: moderateScale(16),
                        fontWeight: "bold",
                        color: theme.text,
                      }}
                    >
                      {item.name}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: theme.text }}>
                  {t("home.no_data")}
                </Text>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: "#3498db",
    height: moderateScale(60),
  },
  menuButton: {
    marginRight: moderateScale(16),
  },
  menuButtonText: {
    fontSize: moderateScale(24),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: moderateScale(16),
  },
  buttonsArea: {
    marginVertical: moderateScale(40),
  },
  button: {
    padding: moderateScale(16),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(16),
    alignItems: "center",
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: moderateScale(100),
    paddingBottom: moderateScale(10),
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: moderateScale(10),
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: moderateScale(40),
    width: moderateScale(40),
    padding: moderateScale(30),
  },
});
