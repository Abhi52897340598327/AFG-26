import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatInterface from './src/components/ChatInterface';

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatInterface />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
