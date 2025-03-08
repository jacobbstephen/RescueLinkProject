import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import axios from 'axios';

const SignUpScreen = ({ navigation }) => {
  const [Fullname, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationFetched, setLocationFetched] = useState(false);

  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for signup.');
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
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Unable to get location. Please check GPS settings.');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleSignUp = async () => {
    console.log('Signup hit');
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    console.log('Collected Data:', { Fullname, email, password, phoneNo, latitude, longitude });
    if(!locationFetched){
      fetchLocation();
    }

    try {
      const response = await axios.post('http://10.0.2.2:3000/user/register', {
        name: Fullname,
        email,
        password,
        phoneNo,
        latitude,
        longitude,
      });

      console.log('Response =', response.data);

      if (response.status === 201) {
        console.log('Sign up successful');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Sorry', 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      Alert.alert('Error', 'Unable to connect to the server');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f0f8ff', '#f0f8ff']} style={styles.backgroundGradient}>
        <Text style={styles.title}>Create Account</Text>
        <View style={styles.formContainer}>
          <TextInput style={styles.input} placeholder="Full Name" onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Phone Number" onChangeText={setPhoneNo} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry onChangeText={setConfirmPassword} />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <LinearGradient colors={['#1eaad1', '#1eaad1']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: '#1eaad1',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    marginBottom: 15,
    color: '#111111',
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Poppins_700Bold',
  },
});

export default SignUpScreen;
