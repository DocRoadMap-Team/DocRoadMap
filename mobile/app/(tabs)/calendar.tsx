import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import * as Calendar from "expo-calendar";
import * as Notifications from "expo-notifications";
import { Calendar as CalendarView } from "react-native-calendars";
import { ScaledSheet, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";

const CalendarScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [events, setEvents] = useState<Calendar.Event[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [notify, setNotify] = useState(false);
  const [notificationDelay, setNotificationDelay] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTime, setEventTime] = useState({ hour: 0, minute: 0 });
  const [eventEndTime, setEventEndTime] = useState({ hour: 1, minute: 0 });
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isNotificationSelected, setIsNotificationSelected] = useState(false);

  const [isPrefilled, setIsPrefilled] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const setup = async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Accès au calendrier nécessaire.");
        return;
      }

      const { status: notifStatus } =
        await Notifications.requestPermissionsAsync();
      if (notifStatus !== "granted") {
        Alert.alert("Permission refusée", "Notifications désactivées.");
        return;
      }

      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendar = calendars.find((c) => c.allowsModifications);
      setCalendarId(defaultCalendar?.id ?? null);

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    };
    setup();
  }, []);

  const [lastParamsHash, setLastParamsHash] = useState("");
  useEffect(() => {
    const paramsHash = JSON.stringify(params);

    if (paramsHash !== lastParamsHash && paramsHash !== "{}") {
      let isPrefilledMode = false;

      if (params.prefillEventName) {
        setEventName(String(params.prefillEventName));
        isPrefilledMode = true;
      }
      if (params.prefillEventDescription) {
        setEventDescription(String(params.prefillEventDescription));
        isPrefilledMode = true;
      }

      setIsPrefilled(isPrefilledMode);

      if (isPrefilledMode && !selectedDate) {
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
      }

      setLastParamsHash(paramsHash);
    }
  }, [params, lastParamsHash, selectedDate, modalVisible]);

  const handleDayPress = async (day: any) => {
    setSelectedDate(day.dateString);
    if (!calendarId) return;

    const start = new Date(day.dateString);
    const end = new Date(day.dateString);
    end.setHours(23, 59, 59);

    const dayEvents = await Calendar.getEventsAsync([calendarId], start, end);
    setEvents(dayEvents);
  };

  const scheduleNotification = async (eventDate: Date) => {
    const triggerDate = new Date(
      eventDate.getTime() - notificationDelay * 60 * 1000,
    );
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t("reminder"),
        body: t("begin_soon"),
      },
      trigger: {
        type: "date",
        date: triggerDate,
      } as Notifications.NotificationTriggerInput,
    });
  };

  const notifyEventAdded = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t("added_event"),
        body: t("real_calendar"),
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setEventName("");
    setEventDescription("");
    setEventTime({ hour: 0, minute: 0 });
    setEventEndTime({ hour: 1, minute: 0 });
    setNotify(false);
    setIsNotificationSelected(false);
    setNotificationDelay(10);
    setIsPrefilled(false);
    setLastParamsHash("");
  };

  const addEventWithReset = async () => {
    if (!calendarId || !eventName) {
      Alert.alert(t("error_event_name"))
      return;
    }

    if (!selectedDate) {
      Alert.alert(t("error_date"))
      return;
    }

    const startDate = new Date(selectedDate);
    startDate.setHours(eventTime.hour, eventTime.minute, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(
      eventTime.hour + eventEndTime.hour,
      eventTime.minute + eventEndTime.minute,
      0,
    );

    try {
        await Calendar.createEventAsync(calendarId, {
          title: eventName,
          startDate,
          endDate,
          timeZone: "Europe/Paris",
          location: "Chez toi",
          notes: eventDescription,
        });

      if (notify) {
        await scheduleNotification(startDate);
      }
      await notifyEventAdded();

      Alert.alert(t("real_calendar")),
      handleDayPress({ dateString: selectedDate });
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert(t("error_impossible_add"))
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <ScrollView>
      <TouchableOpacity
        onPress={() => router.replace("/home")}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>

      <CalendarView
        onDayPress={handleDayPress}
        markedDates={{ [selectedDate]: { selected: true } }}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={t("add_event")} //y a pas d'event d'afficher sur l'app si la notif est pour minuit
          onPress={openModal}
          disabled={!selectedDate}
        />
      </View>

      {events.length > 0 && (
        <View style={{ padding: 10 }}>
          <Text>{t("today_event")}</Text>
          {events.map((e) => (
            <Text key={e.id}>
              • {e.title} ({new Date(e.startDate).toLocaleTimeString()})
            </Text>
          ))}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>{t("event_name")}</Text>
              <TextInput
                style={styles.input}
                value={eventName}
                onChangeText={setEventName}
                placeholder={t("event_name")}
              />

              <Text style={styles.modalTitle}>
              {t("event_description")}
              </Text>
              <TextInput
                style={styles.input}
                value={eventDescription}
                onChangeText={setEventDescription}
                placeholder={t("event_description")}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.modalTitle}>
              {t("event_date")}
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={eventTime.hour}
                  onValueChange={(itemValue) =>
                    setEventTime({ ...eventTime, hour: itemValue })
                  }
                  style={styles.picker}
                >
                  {[...Array(24).keys()].map((value) => (
                    <Picker.Item
                      key={value}
                      label={`${value}h`}
                      value={value}
                    />
                  ))}
                </Picker>
                <Picker
                  selectedValue={eventTime.minute}
                  onValueChange={(itemValue) =>
                    setEventTime({ ...eventTime, minute: itemValue })
                  }
                  style={styles.picker}
                >
                  {[...Array(60).keys()].map((value) => (
                    <Picker.Item
                      key={value}
                      label={`${value} min`}
                      value={value}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.modalTitle}>
                {t("event_end")}
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={eventEndTime.hour}
                  onValueChange={(itemValue) =>
                    setEventEndTime({ ...eventEndTime, hour: itemValue })
                  }
                  style={styles.picker}
                >
                  {[...Array(24).keys()].map((value) => (
                    <Picker.Item
                      key={value}
                      label={`${value}h`}
                      value={value}
                    />
                  ))}
                </Picker>
                <Picker
                  selectedValue={eventEndTime.minute}
                  onValueChange={(itemValue) =>
                    setEventEndTime({ ...eventEndTime, minute: itemValue })
                  }
                  style={styles.picker}
                >
                  {[...Array(60).keys()].map((value) => (
                    <Picker.Item
                      key={value}
                      label={`${value} min`}
                      value={value}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.modalTitle}>
              {t("notification_choose")}
              </Text>
              <View style={styles.buttonRow}>
                {isNotificationSelected === false && (
                  <>
                    <View style={styles.buttonWrapper}>
                      <Button
                        title={t("yes")}
                        onPress={() => {
                          setNotify(true);
                          setIsNotificationSelected(true);
                        }}
                      />
                    </View>
                    <View style={styles.buttonWrapper}>
                      <Button
                        title={t("no")}
                        onPress={() => {
                          setNotify(false);
                          setIsNotificationSelected(true);
                        }}
                      />
                    </View>
                  </>
                )}
              </View>

              {isNotificationSelected && notify && (
                <>
                  <Text style={styles.modalTitle}>
                  {t("reminder_time")}
                  </Text>
                  <Picker
                    selectedValue={notificationDelay}
                    onValueChange={(itemValue) =>
                      setNotificationDelay(itemValue)
                    }
                    style={styles.fullPicker}
                  >
                    {[5, 10, 15, 30, 60].map((value) => (
                      <Picker.Item
                        key={value}
                        label={`${value} minutes`}
                        value={value}
                      />
                    ))}
                  </Picker>
                </>
              )}

              {isNotificationSelected && (
                <View style={styles.buttonWrapper}>
                  <Button title={t("add_event")}onPress={addEventWithReset} />
                </View>
              )}

              <View style={styles.buttonWrapper}>
                <Button title={t("cancel")} onPress={closeModal} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(20),
  },
  closeButton: {
    alignSelf: "flex-start",
    padding: moderateScale(10),
    marginLeft: moderateScale(10),
    marginTop: moderateScale(10),
  },
  buttonContainer: {
    marginVertical: moderateScale(15),
    paddingHorizontal: moderateScale(20),
  },
  input: {
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
  button: {
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(15),
    minWidth: wp("45%"),
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: wp("85%"),
    maxHeight: hp("80%"),
    backgroundColor: "#FFF",
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    marginTop: moderateScale(15),
    marginBottom: moderateScale(10),
    color: "#333",
  },
  buttonWrapper: {
    marginVertical: moderateScale(8),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: moderateScale(10),
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(10),
  },
  picker: {
    flex: 1,
    height: moderateScale(50),
  },
  fullPicker: {
    width: "100%",
    height: moderateScale(50),
    marginBottom: moderateScale(15),
  },
});

export default CalendarScreen;
