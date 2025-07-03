import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DecisionTree from "@/app/(tabs)/decisionTree";
import { useTheme } from "@/components/ThemeContext";
import { ScaledSheet, moderateScale } from "react-native-size-matters";

import { router } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function DecisionTreeInterface() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
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
    </View>
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
  },
  headerText: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  closeIcon: {
    fontSize: moderateScale(20),
    color: "#333",
    paddingHorizontal: wp("1%"),
  },
});
