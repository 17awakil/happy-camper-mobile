import React, { useState, useEffect, useContext } from 'react';
import { AuthProvider } from './context/AuthProvider';
import { AuthContext } from './context/AuthProvider';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import AppNav from './components/AppNav';
import { SessionProvider } from './context/SessionContext';


function App({ navigation }) {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppNav />
      </SessionProvider>
    </AuthProvider>
  );
}


export default App;
