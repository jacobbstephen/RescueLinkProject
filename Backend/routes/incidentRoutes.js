const express = require("express");
const router = express.Router();

const incidentModel = require("../models/incidentReportingModel");
const authMiddleware = require("../middleware/auth");
const userModel = require("../models/userModel");
const axios = require('axios')
const upload = require('../config/multerConfig')
const firebaseAdmin = require('../config/firebaseConfig')





const sendPushNotification = (nearbyUsers) => {
  // Get all valid device tokens from nearby users
  const tokens = nearbyUsers.map(user => user.fcmToken).filter(token => token);

  // Message to send
  const message = {
    notification: {
      title: 'Test Notification',
      body: 'This is a test message sent to your device.',
    },
  };

  // Sending notifications to each token individually using send() method
  const promises = tokens.map((token) =>
    firebaseAdmin.messaging().send({
      ...message,
      token: token, // Send to each device individually
    })
  );

  // Wait for all notifications to be sent
  Promise.all(promises)
    .then((responses) => {
      console.log('Successfully sent messages:', responses);
    })
    .catch((error) => {
      console.error('Error sending messages:', error);
    });
};




async function reverseGeocode(latitude, longitude) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    if (response.data.status !== "OK") {
      console.log("Reverse Geocoding failed:", response.data.status);
      return {};
    }

    const results = response.data.results;
    const addressComponents =
      results.length > 0 ? results[0].address_components : [];


    const getAddressComponent = (types) => {
      const component = addressComponents.find((comp) =>
        types.some((type) => comp.types.includes(type))
      );
      return component ? component.long_name : "NA";
    };

    return {
      country: getAddressComponent(["country"]),
      state: getAddressComponent(["administrative_area_level_1"]),
      district: getAddressComponent([
        "administrative_area_level_2",
        "administrative_area_level_3",
      ]), // Use level_3 as fallback
      place: getAddressComponent(["locality", "sublocality", "neighborhood"]),
    };
  } catch (err) {
    console.error("Reverse Geocoding failed:", err);
    return {};
  }
}


router.post("/report", authMiddleware, upload.single('file'), async (req, res) => {
  console.log('report')
  try {
    const { longitude, latitude, type, title, description } = req.body;
    const user = req.user;

    if (!user.userId || !longitude || !latitude || !title || !description || !type) {
      return res.status(400).json({ message: "Missing Data" });
    }

    // Perform Reverse Geocoding
    const locationData = await reverseGeocode(latitude, longitude);
    const country = locationData.country || "NA";
    const state = locationData.state || "NA";
    const district = locationData.district || "NA";
    const place = locationData.place || "NA";

    // File URL from Firebase Storage
    let fileUrl = "";
    if (req.file) {
      fileUrl = `https://firebasestorage.googleapis.com/v0/b/${req.file.bucket}/o/${encodeURIComponent(req.file.path)}?alt=media`;

    }

    // Save Incident Report
    const incidentReport = await incidentModel.create({
      userId: user.userId,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      title,
      description,
      type,
      country,
      state,
      district,
      locality: place,
      reporterName: user.name,
      phoneNumber: user.phoneNo,
      fileUrl, // Store file URL in DB
    });

    // Find nearby users within 5km radius
    const referenceLocation = [longitude, latitude];
    const nearbyUsers = await userModel.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: referenceLocation },
          $maxDistance: 5000, // 5km radius
        },
      },
    });
    console.log(nearbyUsers)
    sendPushNotification(nearbyUsers);

    res.status(200).json({ message: "Incident reported successfully", fileUrl });
  } catch (err) {
    console.error("Error during incident reporting:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
