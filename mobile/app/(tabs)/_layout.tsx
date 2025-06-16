import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="register"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen
        name="connexion"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen
        name="emailConfirmation"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen
        name="forgottenPassword"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="decisionTree"
        options={{
          title: "Tree",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "key" : "key-outline"} color={color} />
          ),
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
    </Tabs>
  );
}
