import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';

const API_URL = "http://10.0.2.2:3000/emergency/contacts";

const MainPage = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [location, setLocation] = useState(null);

  const loadContacts = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.error("No authentication token found!");
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc.coords);
    } catch (error) {
      console.error("❌ Error fetching location:", error);
      Alert.alert("Error", "Unable to fetch location.");
    }
  };

  const sendEmergencySMS = async () => { 
    console.log("🚨 Attempting to send Emergency SMS...");
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "SMS service is not available.");
      return;
    }
    try {
      if (!location) {
        await getCurrentLocation();
        if (!location) {
          Alert.alert("Error", "Unable to fetch location.");
          return;
        }
      }
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch emergency contacts");

      const contacts = await response.json();
      if (contacts.length === 0) {
        Alert.alert("No Contacts", "No emergency contacts found.");
        return;
      }

      const recipientNumbers = contacts.map((contact) => contact.phone);
      const finalMessage = `Emergency! I need help. My location: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

      console.log("🚨 Sending SMS to:", recipientNumbers, "Message:", finalMessage);

      const { result } = await SMS.sendSMSAsync(recipientNumbers, finalMessage);
      if (result === "sent") {
        Alert.alert("Success", "Emergency SMS sent!");
      } else {
        Alert.alert("Failed", "Message was not sent.");
      }
    } catch (error) {
      console.error("❌ Error sending emergency SMS:", error);
      Alert.alert("Error", "Failed to send emergency SMS.");
    }
  };

  useEffect(() => {
    getCurrentLocation();
    loadContacts();
  }, []);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Homepage</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => Alert.alert('Notification icon pressed')}>
            <MaterialIcons name="notifications" size={28} color="#1eaad1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Signed out')}>
            <MaterialIcons name="exit-to-app" size={28} color="#1eaad1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={sendEmergencySMS}>
        <MaterialIcons name="warning" size={40} color="#fff" />
        <Text style={styles.emergencyText}>Emergency</Text>
      </TouchableOpacity>

      {/* Emergency Contacts Button */}
      <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Contacts')}>
        <MaterialIcons name="phone" size={24} color="#fff" />
        <Text style={styles.buttonText}>Emergency Contacts</Text>
      </TouchableOpacity>

      {/* Features Grid (Now in Card Style) */}
      <View style={styles.gridContainer}>
        {[
          { name: "report", label: "Report Incident", route: "Incident" },
          { name: "people", label: "Volunteer", route: "Volunteer" },
          { name: "support-agent", label: "Quick Assist", route: "QuickAssistant" },
          { name: "article", label: "News", route: "NewsScreen" },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.gridCard} onPress={() => navigation.navigate(item.route)}>
            <MaterialIcons name={item.name} size={32} color="#1eaad1" />
            <Text style={styles.gridText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chatbot Floating Button */}
      <TouchableOpacity style={styles.chatbotButton} onPress={() => navigation.navigate('Chatbot')}>
        <MaterialIcons name="chat" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8", // Lighter background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    marginBottom: 20, // Space after header
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1eaad1",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 20,
  },
  emergencyButton: {
    backgroundColor: "#D90000",
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: "center",
    marginVertical: 30, // More space after emergency button
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  emergencyText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  contactButton: {
    backgroundColor: "#1eaad1",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    justifyContent: "center",
    marginBottom: 30, // More space after contact button
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10, // Space before grid section
  },
  gridCard: {
    backgroundColor: "#fff",
    width: "48%",
    paddingVertical: 30,
    alignItems: "center",
    borderRadius: 14,
    marginBottom: 20, // More space between grid items
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  gridText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  chatbotButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#1eaad1",
    padding: 18,
    borderRadius: 50,
    width: 60,
    height: 60,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});



export default MainPage;
