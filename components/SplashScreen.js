import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

function SplashScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
    },
});

export default SplashScreen;
