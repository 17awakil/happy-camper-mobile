import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageComponent = ({ message, isError }) => {
    const [displayMessage, setDisplayMessage] = useState(null);

    useEffect(() => {
        if (message) {
            setDisplayMessage(message);
        } else {
            setDisplayMessage(null);
        }
    }, [message]);

    const clearMessage = () => {
        setDisplayMessage(null);
    };

    return (
        <View style={[styles.container, { zIndex: displayMessage ? 1 : -1 }]}>
            {displayMessage && (
                <View style={[styles.messageBox, isError ? styles.errorMessage : styles.successMessage]}>
                    <Text style={styles.messageText}>{displayMessage}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBox: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
    },
    errorMessage: {
        backgroundColor: '#ff0000',
    },
    successMessage: {
        backgroundColor: '#00ff00',
    },
    messageText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dismissText: {
        color: '#ffffff',
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginTop: 5,
    },
});

export default MessageComponent;
