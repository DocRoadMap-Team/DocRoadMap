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

export default function DecisionTreeInterface() {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <SafeAreaView>
      <TouchableOpacity style={styles.floatingButton} onPress={openModal}>
        <Image
          source={require("../../assets/images/chatbot.png")}
          style={{ width: 45, height: 45 }}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Donna Chatbot</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={24} style={{ paddingRight: 10 }} />
          </TouchableOpacity>
        </View>
        <DecisionTree />
      </Modal>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: hp(2),
    right: wp(4),
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
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
