import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import botAvatar from '../../assets/robo.png';

const RAGChatbot = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const welcomeMessage = "Hello! I'm your disaster response assistant. Ask me about any disaster-related guidance.";
    setMessages([
      {
        _id: 1,
        text: welcomeMessage,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Disaster Bot',
          avatar: botAvatar,
        },
      },
    ]);
  }, []);

  const fetchResponse = async (query) => {
    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:8000/chat', {  // Use HTTP
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setLoading(false);
      return data.response || "I couldn't find relevant information in my knowledge base.";
    } catch (error) {
      setLoading(false);
      return "Sorry, something went wrong. Please try again.";
    }
  };

  const onSend = useCallback(async (userMessages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, userMessages));

    const userMessage = userMessages[0]?.text || '';
    const botResponse = await fetchResponse(userMessage);

    const botMessage = {
      _id: Math.random().toString(),
      text: botResponse,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'Disaster Bot',
        avatar: botAvatar,
      },
    };

    setMessages((previousMessages) => GiftedChat.append(previousMessages, botMessage));
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainPage')}>
            <Ionicons name="arrow-back" size={24} color="black" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#1eaad1" style={styles.loader} />}

        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{ _id: 1 }}
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                left: { backgroundColor: '#ffffff', borderWidth: 0.2, borderColor: '#000' },
                right: { backgroundColor: '#1eaad1' },
              }}
              textStyle={{
                left: { color: '#000', fontSize: 16 },
                right: { color: '#fff', fontSize: 16 },
              }}
            />
          )}
        />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default RAGChatbot;
