import React, { useState, useEffect, useCallback } from "react";
import {
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
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

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
    router.push("/connexion");
  };

  useEffect(() => {
    if (error) Alert.alert(t("register.error_title"), error);
  }, [error]);

  const handleSignUp = useCallback(async () => {
    setError(null);
    try {
      const response = await request.register({
        firstName: firstname,
        lastName: lastname,
        email,
        password,
      });
      if (response.error) {
        setError(response.error);
        return;
      }
      setEmail("");
      setPassword("");
      setFirstname("");
      setLastname("");
    } catch (e) {
      setError(t("register.error"));
    }
  }, [firstname, lastname, email, password, t]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -220 : 20}
    >
      <View style={styles.form}>
        {[
          {
            icon: "person",
            value: firstname,
            set: setFirstname,
            placeholder: t("register.firstname"),
            label: t("register.firstname"),
          },
          {
            icon: "person",
            value: lastname,
            set: setLastname,
            placeholder: t("register.lastname"),
            label: t("register.lastname"),
          },
          {
            icon: "mail",
            value: email,
            set: setEmail,
            placeholder: t("register.email"),
            label: t("register.email"),
          },
        ].map((field, i) => (
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.background, borderColor: theme.primary },
            ]}
            key={i}
          >
            <Ionicons
              name={field.icon as any}
              size={24}
              color={theme.primary}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={field.placeholder}
              placeholderTextColor={theme.text}
              value={field.value}
              onChangeText={field.set}
              accessibilityLabel={`Champ de texte pour ${field.label}`}
              allowFontScaling
            />
          </View>
        ))}

        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: theme.background, borderColor: theme.primary },
          ]}
        >
          <Ionicons
            name="lock-closed"
            size={24}
            color={theme.primary}
            style={styles.icon}
          />
          <TextInput
            style={[styles.input, { color: theme.text, paddingRight: 40 }]}
            placeholder={t("register.password")}
            placeholderTextColor={theme.text}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            accessibilityLabel={t("register.password")}
            allowFontScaling
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            accessibilityLabel={
              showPassword
                ? t("connexion.hidePassword")
                : t("connexion.showPassword")
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => {
            Vibration.vibrate(100);
            handleSignUp();
            Alert.alert(t("register.check_mail"));
          }}
          accessibilityLabel={t("register.create_account")}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            {t("register.create_account")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.buttonText },
          ]}
          onPress={handleBackClick}
          accessibilityLabel={t("register.back_to_home")}
          accessibilityRole="button"
        >
          <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
            {t("register.back_to_home")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  form: {
    alignItems: "center",
    paddingHorizontal: wp("5%"),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: "12@ms",
    marginVertical: "8@ms",
    paddingHorizontal: "10@ms",
    borderWidth: 1,
    width: wp("90%"),
    position: "relative",
  },
  input: {
    flex: 1,
    fontSize: "16@ms",
    paddingVertical: "12@ms",
  },
  icon: {
    marginRight: "8@ms",
  },
  eyeIcon: {
    position: "absolute",
    right: "10@ms",
  },
  button: {
    marginTop: "20@ms",
    paddingVertical: "14@ms",
    borderRadius: "12@ms",
    width: wp("90%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: "18@ms",
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: "10@ms",
    borderRadius: "12@ms",
    paddingVertical: "14@ms",
    width: wp("90%"),
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: "16@ms",
    fontWeight: "600",
  },
});
