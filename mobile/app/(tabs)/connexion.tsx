import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import CustomCheckbox from "../../components/reusable/CustomCheckbox";
import request from "@/constants/Request";
import { useRouter } from "expo-router";
import { Vibration } from "react-native";
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
  const [stayConnected, setStayConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    setError(null);
    const requestBody = {
      email: email,
      password: password,
    };
    const regexpassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
    const regexemail =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // adresse email valide genre email@test.com

    /*if (!regexemail.test(email)) {
        alert("The username must be a valid email address.");
        return;
    }*/

    /* Uncomment and use this if you want password validation
    if (!regexPassword.test(password)) {
        alert("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
    }
    */

    try {
      const registrationResponse = await request.login(requestBody);

      if (registrationResponse.error) {
        setError(registrationResponse.error);
        return;
      }

      setEmail("");
      setPassword("");
      router.replace("/home");
    } catch (error) {
      setError(
        "Erreur de requête: Erreur de connexion internet. Veuillez réessayer plus tard.",
      );
    }
  }, [email, password]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={require("@/assets/images/docroadmap_logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.primary }]}>
        {t("connexion.welcome")}
      </Text>
      <Text
        style={[styles.welcometxt, { color: theme.text }]}
        allowFontScaling={true}
      >
        {t("connexion.pleaseLogin")}
      </Text>
      <View style={styles.inputContainer}>
        <Icon
          name="user"
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
          placeholder={t("connexion.emailPlaceholder")}
          placeholderTextColor={theme.text}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          accessibilityLabel="Champ de texte pour saisir son email"
          allowFontScaling={true}
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon
          name="lock"
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
          placeholder={t("connexion.passwordPlaceholder")}
          placeholderTextColor={theme.text}
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Champ de texte pour saisir son mot de passe"
          allowFontScaling={true}
          secureTextEntry
        />
      </View>
      <View style={styles.loginButtonContainer}>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            Vibration.vibrate(100);
            handleLogin();
          }}
          accessibilityLabel="Boutton pour se connecter à l'application"
          accessibilityRole="button"
          accessible={true}
        >
          <Text style={[styles.loginButtonText, { color: theme.buttonText }]}>
            {t("connexion.loginButton")}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => router.push("/forgottenPassword")}>
        <Text style={{ color: theme.text }} allowFontScaling={true}>
          {t("connexion.forgotPassword")}
        </Text>
      </TouchableOpacity>
      <View>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={{ color: theme.text }} allowFontScaling={true}>
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
    padding: wp("8%"),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  welcometxt: {
    fontSize: moderateScale(14),
    marginBottom: hp("6%"),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: hp("2%"),
    paddingHorizontal: wp("4%"),
    borderWidth: 1,
  },
  icon: {
    marginRight: wp("2%"),
  },
  input: {
    flex: 1,
    height: hp("6%"),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: hp("2%"),
  },
  checkboxLabel: {
    marginLeft: wp("2%"),
    fontSize: moderateScale(14),
  },
  loginButtonContainer: {
    paddingTop: hp("2.5%"),
    paddingBottom: hp("1.5%"),
    alignItems: "center",
    marginLeft: wp("2%"),
    fontSize: moderateScale(14),
  },
  loginButton: {
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("15%"),
    borderRadius: 5,
    marginTop: hp("2%"),
  },
  loginButtonText: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  link: {
    fontSize: moderateScale(14),
    marginTop: hp("1%"),
  },
  logo: {
    width: wp("50%"),
    height: hp("30%"),
    marginBottom: hp("3%"),
  },
});
