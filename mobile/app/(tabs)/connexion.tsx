import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Vibration,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import request from "@/constants/Request";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function ConnectionPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    setError(null);
    try {
      const res = await request.login({ email, password });
      if (res.error) return setError(res.error);
      setEmail("");
      setPassword("");
      router.replace("/home");
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    }
  }, [email, password]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={require("@/assets/images/docroadmap_logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
        accessible
        accessibilityLabel="Logo de DocRoadMap"
      />

      <View style={[styles.card, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.primary }]} allowFontScaling>
          {t("connexion.welcome")}
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.text }]}
          accessibilityLabel={t("connexion.pleaseLogin")}
          allowFontScaling
        >
          {t("connexion.pleaseLogin")}
        </Text>

        <View style={[styles.inputWrapper, { borderColor: theme.text }]}>
          <Icon name="user" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={t("connexion.emailPlaceholder")}
            placeholderTextColor={theme.primary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel={t("connexion.emailPlaceholder")}
            allowFontScaling
          />
        </View>

        <View style={[styles.inputWrapper, { borderColor: theme.text }]}>
          <Icon name="lock" size={20} color={theme.text} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={t("connexion.passwordPlaceholder")}
            placeholderTextColor={theme.primary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel={t("connexion.passwordPlaceholder")}
            allowFontScaling
          />
        </View>

        {error && (
          <Text style={styles.errorText} accessibilityLabel="Message d'erreur">
            {error}
          </Text>
        )}

        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(80);
            handleLogin();
          }}
          style={[styles.loginButton, { backgroundColor: theme.primary }]}
          accessibilityLabel="Bouton pour se connecter à l'application"
          accessibilityRole="button"
          accessible
        >
          <Text
            style={[styles.loginText, { color: theme.buttonText }]}
            allowFontScaling
          >
            {t("connexion.loginButton")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          accessibilityLabel="Lien pour créer un nouveau compte"
        >
          <Text style={[styles.registerLink, { color: theme.text }]}>
            {t("connexion.createAccount")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp("5%"),
  },
  logo: {
    width: wp("50%"),
    height: hp("20%"),
    marginBottom: hp("2%"),
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: hp("3%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: hp("3%"),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    marginBottom: hp("2%"),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    marginLeft: wp("2%"),
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: hp("2%"),
    fontSize: moderateScale(12),
  },
  loginButton: {
    paddingVertical: hp("1.5%"),
    borderRadius: 12,
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  loginText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  registerLink: {
    textAlign: "center",
    fontSize: moderateScale(13),
    textDecorationLine: "underline",
  },
});
