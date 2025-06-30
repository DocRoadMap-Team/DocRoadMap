import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
} from "react-native";
import DecisionTree from "@/app/(tabs)/decisionTree";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/components/ThemeContext";
import { TabView, SceneMap } from "react-native-tab-view";
import EditRoadmap from "./EditRoadmap";

export default function DecisionTreeInterface() {
  const [showModal, setShowModal] = useState(false);
  const [index, setIndex] = useState(0);
  const { theme } = useTheme();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const [routes] = useState([
    { key: "first", title: "Decision Tree" },
    { key: "second", title: "Modifier la Roadmap" },
  ]);

  const FirstRoute = () => <DecisionTree />;
  const SecondRoute = () => (
    <View>
      <EditRoadmap />
    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={openModal}
        accessibilityLabel="Ouvrir le chatbot"
        accessibilityRole="button"
      >
        <Image
          source={require("../../assets/images/chatbot.png")}
          style={{ width: 45, height: 45 }}
          accessibilityLabel="Icône du chatbot"
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text
            style={[styles.headerText, { color: theme.text }]}
            allowFontScaling={true}
          >
            Donna Chatbot
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeModal}
            accessibilityLabel="Fermer le chatbot"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} style={{ paddingRight: 10 }} />
          </TouchableOpacity>
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={SceneMap({
            first: FirstRoute,
            second: SecondRoute,
          })}
          onIndexChange={setIndex}
          initialLayout={{ width: wp(100), height: hp(80) }}
        />
      </Modal>
    </View>
  );
}

const styles = ScaledSheet.create({
  floatingButton: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(30),
    backgroundColor: "#4C9EEB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(4),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  headerText: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  closeButton: {
    zIndex: 100,
  },
});
