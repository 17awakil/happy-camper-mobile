import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useIsFocused } from "@react-navigation/native";
import SplashScreen from './SplashScreen';

// Pre-step, call this before any NFC operations
NfcManager.start();

export default function CamperDetailsPage({ route }) {
    const { camper } = route.params;
    const [camperDetails, setCamperDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [nfcTag, setNfcTag] = useState("");
    const [id, setId] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const isFocused = useIsFocused();
    const [errMsg, setErrMsg] = useState("");


    async function readNdef() {
        try {
            // register for the NFC tag with NDEF in it
            setId("")
            setErrMsg('');
            await NfcManager.requestTechnology(NfcTech.NfcA);
            // the resolved tag object will contain `ndefMessage` property
            const tag = await NfcManager.getTag();
            setNfcTag(tag);
            setId(tag.id);
            console.log('Tag found', tag);
            console.log(`/api/camps/campers/${camper._id}/nfc/${tag.id}`);
            axiosPrivate.put(`/api/camps/campers/${camper._id}/nfc/${tag.id}`)
                .then((response) => { setIsLoading(true); getCamperDetails(); setIsLoading(false); })
                .catch((err) => {
                    setErrMsg(err.response.data);
                });
        } catch (err) {
            console.warn('Oops!', err);
            if (err.response) {
                console.log(err.response.data);
                console.log(err.response.status);
                console.log(err.response.headers);
            }
        } finally {
            // stop the nfc scanning
            NfcManager.cancelTechnologyRequest();
            setIsLoading(false);
        }
    }

    const getCamperDetails = async () => {
        try {
            const url = `/api/camps/campers/${camper._id}`;
            const response = await axiosPrivate.get(url);
            console.log(response.data);
            setCamperDetails(response.data);
        } catch (err) {
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    }


    const updateNFCId = async () => {
        try {
            console.log(`/api/camps/campers/${camper._id}/nfc/${id}`);
            const response = await axiosPrivate.put(`/api/camps/campers/${camper._id}/nfc/${id}`);
            console.log(response.data);
        }
        catch (err) {
            console.log(err);
            if (err.response) {
                console.log(err.response.data);
                console.log(err.response.status);
                console.log(err.response.headers);
            }
        }
    }
    useEffect(() => { getCamperDetails(); }, [isFocused]);

    if (isLoading) {
        return <SplashScreen></SplashScreen>
    }
    return (
        <View style={styles.container}>
            <Text style={styles.errMsg}> {errMsg}</Text>
            <Image source={{ uri: camper.photo }} style={styles.photo} />
            <Text style={styles.header}>
                {camperDetails?.first_name} {camperDetails?.last_name}
            </Text>
            <Text style={styles.text}>DOB: {camperDetails?.date_of_birth.split("T")[0]}</Text>
            <Text style={styles.text}>Gender: {camperDetails?.gender}</Text>
            {/* <Text style={styles.text}>Address: {camper.address}</Text> */}
            <Text style={styles.text}>NFC ID: {camperDetails?.nfc_id}</Text>
            <TouchableOpacity style={styles.button} onPress={readNdef}>
                <Text style={styles.buttonText}>Update NFC ID</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
    },
    photo: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    errMsg: {
        color: 'red'
    },
});
