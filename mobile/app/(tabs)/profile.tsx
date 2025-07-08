import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Vibration,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import UserContext from "@/constants/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import request from "@/constants/Request";
import { useTheme } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Settings from "./settings";

export default function ProfileCard() {
  const { t } = useTranslation();
  const MAX_DESCRIPTION_LENGTH = 150;
  const [isEditMode, setIsEditMode] = useState(false);
  const [description, setDescription] = useState(t("profile.description"));
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const userCtx = useContext(UserContext);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleEditClick = () => setIsEditMode(true);
  const handleSaveClick = () => setIsEditMode(false);

  const handleDescriptionChange = (text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(text);
    }
  };

  const handleSettingsClick = () => router.push("/settings");

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem("user", () => {
      userCtx.setUser(null);
      router.replace("/connexion");
    });
  }, [userCtx.user]);

  const updateProfile = useCallback(async () => {
    setError(null);
    try {
      const registrationResponse = await request.infoProfile();
      if (registrationResponse.error) {
        setError(registrationResponse.error);
        return;
      }
      const userProfile = registrationResponse.data;
      setEmail(userProfile.email);
      setFirstname(userProfile.firstName);
      setLastname(userProfile.lastName);
    } catch (error) {
      setError(t("error"));
    }
  }, [firstname, lastname, email]);

  useEffect(() => {
    updateProfile();
  }, [error]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={[styles.card, { backgroundColor: theme.background }]}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: "https://www.w3schools.com/howto/img_avatar.png" }}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={t("profile.avatar")}
          />
        </View>
        <Text
          style={[styles.nameText, { color: theme.text }]}
          allowFontScaling
          accessibilityLabel={`${firstname} ${lastname}`}
        >
          {firstname} {lastname}
        </Text>
        <Text
          style={[styles.infoText, { color: theme.text }]}
          allowFontScaling
          accessibilityLabel={email}
        >
          <FontAwesome name="envelope" size={16} /> {email}
        </Text>

        <View style={styles.iconRow}>
          <TouchableOpacity onPress={handleLogout} accessibilityRole="button">
            <Ionicons
              name="exit-outline"
              size={28}
              color={theme.text}
              accessibilityLabel={t("profile.logout")}
            />
          </TouchableOpacity>
        </View>
        <Settings></Settings>
      </View>
    </ScrollView>
  );
}

const styles = ScaledSheet.create({
  container: {
    padding: moderateScale(20),
    paddingTop: hp(10),
    alignItems: "center",
  },
  card: {
    width: "100%",
    minHeight: hp("50%"),
    backgroundColor: "#fff",
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: moderateScale(20),
    flexDirection: "column",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: moderateScale(15),
  },
  image: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    borderWidth: moderateScale(4),
    borderColor: "#ddd",
    marginBottom: moderateScale(10),
  },
  nameText: {
    fontSize: moderateScale(24),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: moderateScale(5),
  },
  infoText: {
    fontSize: moderateScale(16),
    textAlign: "center",
    marginBottom: moderateScale(20),
    color: "#666",
  },
  editDescriptionContainer: {
    marginTop: moderateScale(15),
    alignItems: "center",
    width: "100%",
  },
  editDescriptionInput: {
    fontSize: moderateScale(16),
    borderWidth: 1.5,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(8),
    width: "100%",
    marginBottom: moderateScale(15),
  },
  saveButton: {
    borderRadius: moderateScale(12),
    width: "100%",
  },
  descriptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: moderateScale(10),
  },
  descriptionText: {
    fontSize: moderateScale(16),
    flex: 1,
    marginRight: moderateScale(10),
    color: "#333",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});
