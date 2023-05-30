import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import SessionContext from '../context/SessionContext';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import MessageComponent from './MessageComponents';
import SplashScreen from './SplashScreen';

// Pre-step, call this before any NFC operations
NfcManager.start();


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f0f0f0',
    },
    message: {
        fontSize: 18,
        marginBottom: 18,
    },
    item: {
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    number: {
        fontWeight: 'bold',
        marginRight: 16,
    },
    name: {
        flex: 1,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default function CheckInPage() {
    const isFocused = useIsFocused();
    const { sessionId } = useContext(SessionContext);
    const axiosPrivate = useAxiosPrivate();
    const [isLoading, setIsLoading] = useState(true);

    const [totalCampers, setTotalCampers] = useState(0);
    const [checkedInCampers, setCheckedInCampers] = useState(0);
    const [campersToCheckIn, setCampersToCheckIn] = useState([]);
    const [campersToCheckInDetails, setCampersToCheckInDetails] = useState(new Set());
    const [registeredCampers, setRegisteredCampers] = useState([]);

    const [nfcTag, setNfcTag] = useState("");
    const [id, setId] = useState("");
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);


    const showMessage = (msg, error = false) => {
        setMessage(String(msg)); // Convert the message to a string
        setIsError(error);
        setTimeout(() => { clearMessage() }, 2000);
    };

    const clearMessage = () => {
        setMessage(null);
        setIsError(false);
    };
    const getSessionRegisteredCampers = async () => {
        try {
            // setIsLoading(true);
            const response = await axiosPrivate.get(`/api/camps/campers/session/registered-campers/${sessionId}`);
            // console.log("Registered campers:\n")
            // console.log(response.data);
            setRegisteredCampers(response.data);
            let registeredCampers = response.data;
            setTotalCampers(response.data.length);
            const response2 = await axiosPrivate.get(`/api/camps/sessions/${sessionId}`);
            console.log("Camp session :\n")
            console.log(response2.data.events[0]);
            const attendance = response2.data.events[0];
            const today = new Date();
            const todaysDateString = today.toISOString().split('T')[0];
            const checked_in = attendance[todaysDateString]["checked_in"];
            console.log("checked_in");
            console.log(checked_in);
            setCheckedInCampers(checked_in.length);
            let campers = registeredCampers.filter(x => !checked_in.includes(x._id));
            console.log("campers to be checked in");
            console.log(campers);
            setCampersToCheckIn(campers);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    }

    const getSession = async () => {
        try {
            const response = await axiosPrivate.get(`/api/camps/sessions/${sessionId}`);
            console.log("Camp session :\n")
            console.log(response.data.events[0]);
            const attendance = response.data.events[0];
            const today = new Date();
            const todaysDateString = today.toISOString().split('T')[0];
            const checked_in = attendance[todaysDateString]["checked_in"];
            console.log("checked_in");
            console.log(checked_in);
            setCheckedInCampers(checked_in.length);
            let campers = registeredCampers.filter(x => !checked_in.includes(x._id));
            console.log("campers to be checked in");
            console.log(campers);
            setCampersToCheckIn(campers);
        }
        catch (err) {
            console.error(err);
        }
    }

    async function readNdef() {
        try {
            // register for the NFC tag with NDEF in it
            setId("")
            await NfcManager.requestTechnology(NfcTech.NfcA);
            // the resolved tag object will contain `ndefMessage` property
            const tag = await NfcManager.getTag();
            setNfcTag(tag);
            setId(nfcTag.id);
            console.log(`/api/camps/sessions/${sessionId}/log-attendance/${tag.id}`)
            axiosPrivate.post(`/api/camps/sessions/${sessionId}/log-attendance/${tag.id}`, JSON.stringify(
                {
                    attendanceType: 'check-in',
                }
            )).then((response) => {
                // setIsLoading(true);
                console.log(response.data);
                getSessionRegisteredCampers();
                // setIsLoading(false);
                showMessage("Sucessfully checked in camper!");
            })
                .catch((err) => {
                    if (err.response) {
                        console.log(err.response.data[0].message);
                        getSessionRegisteredCampers();
                        showMessage(err.response.data[0].message, true);
                        console.log(err.response.status);
                        console.log(err.response.headers);
                    }
                })
            // console.warn('Tag found', tag);
        } catch (ex) {
            console.warn('Oops!', ex);
        } finally {
            // stop the nfc scanning
            NfcManager.cancelTechnologyRequest();
        }
    }

    useEffect(() => {
        if (sessionId) {
            setIsLoading(true);
            console.log("sessionId ");
            console.log(sessionId);
            getSessionRegisteredCampers();
            // getSession();
            setIsLoading(false);
        }

    }, [isFocused])



    if (isLoading) {
        return <SplashScreen />;
    }

    if (!sessionId || Object.keys(sessionId).length === 0) {
        return <View style={styles.container}>
            <Text> Select Camp Session in Dashboard before checking in campers.</Text>
        </View>
    }

    return (
        <View style={styles.container}>
            <Text style={styles.message}>
                Tap the NFC wristbands to check in the campers:
            </Text>
            <TouchableOpacity style={styles.button} onPress={readNdef}>
                <Text style={styles.buttonText}>Scan Wristband</Text>
            </TouchableOpacity>
            <FlatList
                data={campersToCheckIn}
                keyExtractor={item => item._id}
                renderItem={({ item, index }) => (
                    <View style={styles.item}>
                        <Text style={styles.number}>{index + 1}</Text>
                        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    </View>
                )}
            />
            <MessageComponent message={message} isError={isError}> </MessageComponent>
            <Text>
                Total Campers: {totalCampers}, Checked In: {checkedInCampers}
            </Text>
        </View>
    );
}

