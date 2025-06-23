import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import UserContext from "@/constants/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import request from "@/constants/Request";
import { Vibration } from "react-native";
import { useTheme } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const ProfileCard = () => {
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

  const handleSettingsClick = () => {
    router.push("/settings");
  };

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
      console.log("Registration Response:", registrationResponse);

      if (registrationResponse.error) {
        setError(registrationResponse.error);
        return;
      }
      const userProfile = registrationResponse.data;
      setEmail(userProfile.email);
      setFirstname(userProfile.firstName);
      setLastname(userProfile.lastName);
    } catch (error) {
      setError("Erreur, veuillez vérifier vos informations");
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
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{ uri: "https://www.w3schools.com/howto/img_avatar.png" }}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={t("profile.avatar")}
        />
      </View>
      <Card.Content
        style={[styles.cardContent, { backgroundColor: theme.background }]}
      >
        <Text
          style={[styles.nameText, { color: theme.text }]}
          allowFontScaling={true}
          accessibilityLabel={`${firstname} ${lastname}`}
        >
          {firstname} {lastname}
        </Text>
        <Text
          style={[styles.infoText, { color: theme.text }]}
          allowFontScaling={true}
          accessibilityLabel={email}
        >
          <FontAwesome name="envelope" size={16} /> {email}
        </Text>
      </Card.Content>
      <Card.Content
        style={[styles.cardContent, { backgroundColor: theme.background }]}
      >
        {isEditMode ? (
          <View style={styles.editDescriptionContainer}>
            <TextInput
              style={[
                styles.editDescriptionInput,
                { color: theme.text, borderColor: theme.text },
              ]}
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              maxLength={MAX_DESCRIPTION_LENGTH}
              mode="outlined"
              allowFontScaling={true}
              accessibilityLabel={t("profile.descriptionInput")}
            />
            <Button
              onPress={() => {
                handleSaveClick();
                Vibration.vibrate(100);
              }}
              mode="contained"
              buttonColor={theme.primary}
              style={styles.saveButton}
              accessibilityLabel={t("profile.saveDescription")}
              accessibilityRole="button"
            >
              {t("profile.saveDescription")}
            </Button>
          </View>
        ) : (
          <View style={styles.descriptionContainer}>
            <Text
              style={[styles.descriptionText, { color: theme.text }]}
              allowFontScaling={true}
              accessibilityLabel={description}
            >
              {description}
            </Text>
            <TouchableOpacity
              onPress={() => {
                handleEditClick();
                Vibration.vibrate(100);
              }}
              accessibilityLabel={t("profile.editDescription")}
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        )}
      </Card.Content>
      <View style={styles.iconRow}>
        <TouchableOpacity
          onPress={handleSettingsClick}
          accessibilityRole="button"
        >
          <MaterialIcons
            name="settings"
            size={28}
            color={theme.text}
            accessibilityLabel={t("profile.settings")}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} accessibilityRole="button">
          <Ionicons
            name="exit-outline"
            size={28}
            color={theme.text}
            accessibilityLabel={t("profile.logout")}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = ScaledSheet.create({
  container: {
    padding: moderateScale(20),
    paddingTop: hp(10),
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: moderateScale(20),
  },
  cardContent: {
    alignItems: "center",
    marginBottom: moderateScale(15),
  },
  image: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
    overflow: "hidden",
    borderWidth: moderateScale(3),
    borderColor: "black",
  },
  nameText: {
    fontSize: moderateScale(20),
    marginBottom: moderateScale(5),
  },
  infoText: {
    fontSize: moderateScale(16),
  },
  editDescriptionContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: moderateScale(15),
  },
  editDescriptionInput: {
    fontSize: moderateScale(16),
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    marginTop: moderateScale(10),
    maxHeight: hp(10),
    width: "100%",
  },
  saveButton: {
    marginTop: moderateScale(10),
  },
  descriptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  descriptionText: {
    fontSize: moderateScale(16),
    flex: 1,
    marginRight: moderateScale(10),
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: moderateScale(20),
  },
});

export default ProfileCard;
