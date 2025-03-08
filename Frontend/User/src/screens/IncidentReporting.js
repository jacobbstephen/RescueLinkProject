import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import * as ImagePicker from "react-native-image-picker";

const IncidentReportingScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [title, setTitle] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationFetched, setLocationFetched] = useState(false);

  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is required for signup."
        );
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      setLocationFetched(true);
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert(
        "Error",
        "Unable to get location. Please check GPS settings."
      );
    }
  };

  useEffect(() => {

    fetchLocation();
    messaging()
      .requestPermission()
      .then((authStatus) => {
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          console.log("Authorization status:", authStatus);
        } else {
          console.log("Permission not granted for push notifications");
        }
      });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("Push Notification", remoteMessage.notification.body, [
        { text: "OK" },
      ]);
    });

    return unsubscribe;
  }, []);

  // 📌 ✅ Update File Picker
  const handleFileUpload = () => {
    const options = {
      mediaType: "photo",
      quality: 1,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled file picker");
      } else if (response.errorMessage) {
        console.log("File picker error: ", response.errorMessage);
      } else {
        const pickedFile = response.assets[0];
        setSelectedFile(pickedFile);
      }
    });
  };

  // 📌 ✅ Update `handleSubmit`
  const handleSubmit = async () => {
    try {
      // Retrieve Auth Token
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("No token found, please login again.");
        return;
      }

      // // Get Coordinates
      // const latitude = 8.4697;
      // const longitude = 76.9818;

      // Create FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", incidentType);
      formData.append("description", description);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      // Append File if Selected
      if (selectedFile) {
        formData.append("file", {
          uri: selectedFile.uri,
          type: selectedFile.type || "image/jpeg", // Default to JPEG
          name: selectedFile.fileName || `image_${Date.now()}.jpg`,
        });
      }

      // API Call
      const response = await axios.post(
        "http://10.0.2.2:3000/incident/report",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("Incident reported successfully:", response.data);
        Alert.alert("Success", "Incident reported successfully.");
      } else {
        console.log("Failed to report incident:", response.data);
      }
    } catch (err) {
      console.log("Error reporting incident:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Report Incident</Text>
      </View>

      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/reporting.png")}
          style={styles.image}
        />
      </View>

      {/* Input Fields */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Incident Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Give a title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Type of Incident</Text>
        <TextInput
          style={styles.input}
          placeholder="(e.g. Fire, Accident)"
          value={incidentType}
          onChangeText={setIncidentType}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Brief description about the incident"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* File Upload Section */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleFileUpload}
        >
          <Text style={styles.uploadButtonText}>
            {selectedFile ? "Change File" : "Upload File"}
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 🔹 Styles (No Changes)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 50,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 3,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
    color: "#333",
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#1eaad1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: "#007bff", // Blue color for the button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  fileName: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },
});

export default IncidentReportingScreen;
