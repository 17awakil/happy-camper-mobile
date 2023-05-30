import React, { useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useIsFocused } from "@react-navigation/native";
import SessionContext from '../context/SessionContext';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import MessageComponent from './MessageComponents';
import SplashScreen from './SplashScreen';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
// Pre-step, call this before any NFC operations
NfcManager.start();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f0f0f0',
    },
    header: {
        fontSize: 16,
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
    checkOutButton: {
        backgroundColor: '#4da6ff',
        padding: 12,
        borderRadius: 8,
    },
    checkOutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
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

export default function CheckOutPage() {
    const isFocused = useIsFocused();
    const { sessionId } = useContext(SessionContext);
    const axiosPrivate = useAxiosPrivate();
    const [isLoading, setIsLoading] = useState(true);

    const [totalCampers, setTotalCampers] = useState(0);
    const [checkedOutCampers, setCheckedOutCampers] = useState(0);
    const [checkedInCampers, setCheckedInCampers] = useState(0);
    const [campersToCheckOut, setCampersToCheckOut] = useState([]);
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
            const response = await axiosPrivate.get(`/api/camps/campers/session/registered-campers/${sessionId}`);
            // console.log("Registered campers:\n")
            // console.log(response.data);
            setRegisteredCampers(response.data);
            setTotalCampers(response.data.length);
        }
        catch (err) {
            console.error(err);
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
            const checked_out = attendance[todaysDateString]["checked_out"];
            console.log("checked_in");
            console.log(checked_in);
            setCheckedInCampers(checked_in.length);
            setCheckedOutCampers(checked_out?.length);
            console.log("registeredCampers", registeredCampers);
            let campers = registeredCampers.filter(x => checked_in.includes(x._id)); // gets campers that are checked in
            campers = campers.filter(x => !checked_out.includes(x._id)); // but are not checked out
            console.log("campers to be checked out");
            console.log(campers);
            setCampersToCheckOut(campers);
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
            // console.warn('Tag found', tag);
            setNfcTag(tag);
            setId(tag.id);
            console.log(`/api/camps/sessions/${sessionId}/log-attendance/${tag.id}`)
            axiosPrivate.post(`/api/camps/sessions/${sessionId}/log-attendance/${tag.id}`, JSON.stringify(
                {
                    attendanceType: 'check-out',
                }
            )).then((response) => {
                console.log(response.data);
                showMessage("Successfully checked out camper!");
                getSession();
            }).catch((err) => {
                if (err.response) {
                    console.log(err.response.data);
                    showMessage(err.response.data[0].message, true);
                    // console.log(err.response.status);
                    // console.log(err.response.headers);
                }
            })
            // console.log(response);
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
            getSession();
            setIsLoading(false);
        }
    }, [isFocused])

    if (isLoading === true) {
        return <SplashScreen />;
    }

    if (!sessionId || Object.keys(sessionId).length === 0) {
        return <View style={styles.container}>
            <Text> Select Camp Session in Dashboard before checking out campers.</Text>
        </View>
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Total Campers: {totalCampers}, Checked In: {checkedInCampers}, Checked Out:  {checkedOutCampers}
            </Text>
            <TouchableOpacity style={styles.button} onPress={readNdef}>
                <Text style={styles.buttonText}>Scan Wristband</Text>
            </TouchableOpacity>
            <FlatList
                data={campersToCheckOut}
                keyExtractor={item => item._id}
                renderItem={({ item, index }) => (
                    <View style={styles.item}>
                        <Text style={styles.number}>{index + 1}</Text>
                        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    </View>
                )}
            />
            <MessageComponent message={message} isError={isError}></MessageComponent>
        </View>
    );


}