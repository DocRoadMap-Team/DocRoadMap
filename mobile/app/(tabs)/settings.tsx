import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import DropDownPicker from "react-native-dropdown-picker";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

const languageFlags = {
  fr: "🇫🇷",
  es: "🇪🇸",
  en: "🇬🇧",
};

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (lang: string | null) => {
    if (lang) {
      i18n.changeLanguage(lang);
      setSelectedLanguage(lang);
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.button, { backgroundColor: theme.primary }]}
          accessibilityLabel={t("change_theme")}
          accessibilityRole="button"
        >
          <Ionicons
            name="color-palette-outline"
            size={24}
            color={theme.buttonText}
          />
          <Text
            style={[styles.buttonText, { color: theme.buttonText }]}
            allowFontScaling={true}
          >
            {t("change_theme")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.button, { backgroundColor: theme.primary }]}
          accessibilityLabel={t("switch_language")}
          accessibilityRole="button"
        >
          <MaterialIcons name="language" size={24} color={theme.buttonText} />
          <Text
            style={[styles.buttonText, { color: theme.buttonText }]}
            allowFontScaling={true}
          >
            {t("switch_language")}
          </Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalBackground,
              { backgroundColor: theme.background },
            ]}
          >
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t("select_language")}
              </Text>
              <DropDownPicker
                open={modalVisible}
                value={selectedLanguage}
                items={[
                  { label: `${languageFlags.fr} ${t("fr")}`, value: "fr" },
                  { label: `${languageFlags.es} ${t("es")}`, value: "es" },
                  { label: `${languageFlags.en} ${t("en")}`, value: "en" },
                ]}
                setOpen={setModalVisible}
                setValue={setSelectedLanguage}
                onChangeValue={handleLanguageChange}
                placeholder={t("select_language")}
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.primary,
                  borderRadius: moderateScale(10),
                }}
                labelStyle={{
                  color: theme.text,
                  fontSize: moderateScale(16),
                }}
                containerStyle={{
                  width: wp("80%"),
                  marginVertical: moderateScale(10),
                }}
                accessibilityLabel={t("select_language")}
                showArrow={false}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.button,
                  { backgroundColor: theme.primary, marginTop: 10 },
                ]}
                accessibilityLabel={t("close")}
                accessibilityRole="button"
              >
                <Text
                  style={[styles.buttonText, { color: theme.buttonText }]}
                  allowFontScaling={true}
                >
                  {t("close")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          onPress={() => router.replace("/profile")}
          style={[styles.button, { backgroundColor: theme.primary }]}
          accessibilityLabel={t("back_to_profile")}
          accessibilityRole="button"
        >
          <Ionicons name="person-outline" size={24} color={theme.buttonText} />
          <Text
            style={[styles.buttonText, { color: theme.buttonText }]}
            allowFontScaling={true}
          >
            {t("back_to_profile")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/calendar")}
          style={[styles.button, { backgroundColor: theme.primary }]}
          accessibilityLabel={t("calendar_events")}
          accessibilityRole="button"
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={theme.buttonText}
          />
          <Text
            style={[styles.buttonText, { color: theme.buttonText }]}
            allowFontScaling={true}
          >
            {t("calendar_events")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(20),
  },
  buttonContainer: {
    width: "80%",
    paddingVertical: moderateScale(15),
  },
  button: {
    flexDirection: "row",
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(10),
    marginTop: moderateScale(15),
    minWidth: wp("80%"),
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    transition: "all 0.3s ease",
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginLeft: moderateScale(10),
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    padding: moderateScale(20),
    borderRadius: moderateScale(12),
    minWidth: wp("80%"),
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    marginBottom: moderateScale(10),
    color: "#555",
  },
});

export default Settings;
