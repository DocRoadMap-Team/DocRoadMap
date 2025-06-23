import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Vibration,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/ThemeContext";
import request from "@/constants/Request";
import { useTranslation } from "react-i18next";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function Register() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [firstname, setFirstname] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.replace("/connexion");
  };

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleSignUp = useCallback(async () => {
    setError(null);
    const requestBody = {
      firstName: firstname,
      lastName: lastname,
      email: email,
      password: password,
    };

    try {
      const registrationResponse = await request.register(requestBody);

      if (registrationResponse.error) {
        setError(registrationResponse.error);
        return;
      }

      setEmail("");
      setPassword("");
      setFirstname("");
      setLastname("");
    } catch (error) {
      setError(t("register.error"));
    }
  }, [firstname, lastname, email, password, t]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -220 : 20}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person"
            size={24}
            color={theme.text}
            style={{ paddingRight: 10 }}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.text,
                color: theme.text,
              },
            ]}
            placeholder={t("register.firstname")}
            placeholderTextColor={theme.text}
            value={firstname}
            onChangeText={setFirstname}
            accessibilityLabel="Champ de texte pour son prénom"
            allowFontScaling={true}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person"
            size={24}
            color={theme.text}
            style={{ paddingRight: 10 }}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.text,
                color: theme.text,
              },
            ]}
            placeholder={t("register.lastname")}
            placeholderTextColor={theme.text}
            value={lastname}
            onChangeText={setLastname}
            accessibilityLabel="Champ de texte pour son nom de famille"
            allowFontScaling={true}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail"
            size={24}
            color={theme.text}
            style={{ paddingRight: 10 }}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.text,
                color: theme.text,
              },
            ]}
            placeholder={t("register.email")}
            placeholderTextColor={theme.text}
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Champ de texte pour son adresse email"
            allowFontScaling={true}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={24}
            color={theme.text}
            style={{ paddingRight: 10 }}
          />
          <TextInput
            style={[
              styles.input,
              {
                paddingRight: 40,
                backgroundColor: theme.background,
                borderColor: theme.text,
                color: theme.text,
              },
            ]}
            placeholder={t("register.password")}
            placeholderTextColor={theme.text}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            accessibilityLabel="Champ de texte pour son mot de passe"
            allowFontScaling={true}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: 25,
            }}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={[styles.customButton, { backgroundColor: theme.primary }]}
            onPress={async () => {
              Vibration.vibrate(100);
              handleSignUp();
            }}
            accessibilityLabel="Bouton pour créer un nouveau compte"
            accessibilityRole="button"
            accessible={true}
          >
            <Text
              style={[styles.buttonText, { color: theme.buttonText }]}
              allowFontScaling={true}
            >
              {t("register.create_account")}
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={handleBackClick}
            style={[styles.customButton, { backgroundColor: theme.primary }]}
            accessibilityLabel="Retour à la page de connexion"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              {t("register.back_to_home")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: wp("85%"),
    padding: moderateScale(10),
    marginVertical: moderateScale(10),
    borderRadius: moderateScale(5),
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: wp("95%"),
    position: "relative",
  },
  customButton: {
    borderRadius: moderateScale(5),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(40),
    marginVertical: moderateScale(30),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: moderateScale(18),
  },
});
