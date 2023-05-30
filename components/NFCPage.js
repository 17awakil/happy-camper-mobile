import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

// Pre-step, call this before any NFC operations
NfcManager.start();

function NFCPage() {
    const [nfcTag, setNfcTag] = useState("");
    const [id, setId] = useState("");
    async function readNdef() {
        try {
            // register for the NFC tag with NDEF in it
            setId("")
            await NfcManager.requestTechnology(NfcTech.NfcA);
            // the resolved tag object will contain `ndefMessage` property
            const tag = await NfcManager.getTag();
            setNfcTag(tag);
            setId(nfcTag.id);
            console.warn('Tag found', tag);
        } catch (ex) {
            console.warn('Oops!', ex);
        } finally {
            // stop the nfc scanning
            NfcManager.cancelTechnologyRequest();
        }
    }

    return (
        <View style={styles.wrapper}>
            {id !== "" &&
                <Text>{id}</Text>
            }
            <TouchableOpacity onPress={readNdef}>
                <Text>Scan a Tag</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default NFCPage;