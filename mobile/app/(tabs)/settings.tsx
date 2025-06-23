import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Picker } from "@react-native-picker/picker";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.button, { backgroundColor: theme.primary }]}
        accessibilityLabel={t("change_theme")}
        accessibilityRole="button"
      >
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
          >
            <Picker
              selectedValue={selectedLanguage}
              onValueChange={handleLanguageChange}
              style={{ width: 200 }}
              accessibilityLabel={t("select_language")}
            >
              <Picker.Item label={t("fr")} value="fr" />
              <Picker.Item label={t("es")} value="es" />
              <Picker.Item label={t("en")} value="en" />
            </Picker>
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
        <Text
          style={[styles.buttonText, { color: theme.buttonText }]}
          allowFontScaling={true}
        >
          {"Calendrier des évènements"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(20),
  },
  button: {
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(15),
    minWidth: wp("45%"),
    alignItems: "center",
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});

export default Settings;
