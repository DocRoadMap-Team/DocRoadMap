import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DecisionTree from "@/app/(tabs)/decisionTree";
import { useTheme } from "@/components/ThemeContext";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function DecisionTreeInterface() {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={["#204CCF", "#6006A4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text
          style={[styles.headerText, { color: theme.text }]}
          allowFontScaling={true}
        >
          Donna Chatbot
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          onPress={() => {
            router.replace("/home");
          }}
        >
          <Text style={styles.closeIcon}>✖</Text>
        </TouchableOpacity>
      </View>

      <DecisionTree />
    </LinearGradient>
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
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  closeIcon: {
    fontSize: moderateScale(22),
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: moderateScale(20),
    padding: moderateScale(6),
    overflow: "hidden",
  },
});
