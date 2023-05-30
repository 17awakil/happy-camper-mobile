import React, { useState, useEffect, useContext } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import SessionContext from '../context/SessionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardPage = () => {
    const [dashboard, setDashboard] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const axiosPrivate = useAxiosPrivate();
    const isFocused = useIsFocused();
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessions, setSessions] = useState([]);
    const { sessionId, setSessionId } = useContext(SessionContext);

    const handleSelectSession = (session) => {
        if (selectedSession && selectedSession._id === session._id) {
            // If the same session is selected, deselect it
            setSelectedSession(null);
            setSessionId(null);
            console.log(sessionId);
            AsyncStorage.setItem('sessionId', '');
        } else {
            // Otherwise, set the selected session
            setSelectedSession(session);
            setSessionId(session._id);
            console.log(session._id);
            AsyncStorage.setItem('sessionId', session._id);

        }
    };


    const isWithinDateRange = (startDate, endDate) => {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return today >= start && today <= end;
    };


    useEffect(() => {
        const getDashboard = async () => {
            try {
                const response = await axiosPrivate.get('/api/dashboard');
                setDashboard(response.data);
                // console.log(response.data);
                const sessionResponses = await Promise.all(
                    response.data.sessions.map(async (session) => {
                        return await axiosPrivate.get(`/api/camps/sessions/${session}`);
                    })
                );
                var sessionData = sessionResponses.map((response) => response.data);
                sessionData = sessionData.filter((session) => isWithinDateRange(session.start_date, session.end_date))
                setSessions(sessionData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        setIsLoading(true);
        getDashboard();
        setIsLoading(false);
        // return () => {
        //     setDashboard();
        //     setSessions([]);
        //     setIsLoading(false);
        // };
    }, [isFocused]);

    if (isLoading) {
        return <View style={styles.container}>
            <Text> Loading...</Text>
        </View>
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Select a Camp Session:</Text>
            {sessions.map((session) => (
                <TouchableOpacity
                    key={session._id}
                    style={[
                        styles.sessionButton,
                        selectedSession && selectedSession._id === session?._id ? styles.selectedSessionButton : '',
                    ]}
                    onPress={() => handleSelectSession(session)}
                    disabled={!isWithinDateRange(session?.start_date, session?.end_date)}
                >
                    <View style={styles.sessionInfo}>
                        <Text style={styles.sessionText}>{session.name}</Text>
                        <Text style={styles.sessionText}>{session.start_date.split("T")[0]}</Text>
                        <Text style={styles.sessionText}>{session.end_date.split("T")[0]}</Text>
                        <Text style={styles.sessionText}>{session.location}</Text>
                    </View>
                </TouchableOpacity>
            ))}
            {!selectedSession && (
                <Text style={styles.infoText}>
                    Please select a session that matches today's date to continue.
                </Text>
            )}
            {selectedSession && (
                <Text style={styles.infoText}>
                    You have selected the {selectedSession.name} session.
                </Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
        paddingVertical: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    sessionButton: {
        width: '80%',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#ccc',
        borderRadius: 10,
        marginVertical: 5,
    },
    selectedSessionButton: {
        backgroundColor: '#0099ff',
    },
    sessionInfo: {
        alignItems: 'center',
    },
    sessionText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        infoText: {
            fontSize: 16,
            textAlign: 'center',
            marginTop: 20,
        },
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default DashboardPage;

