import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused } from "@react-navigation/native";
import CamperDetailsPage from './CamperDetailsPage';
import SessionContext from '../context/SessionContext';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import SplashScreen from './SplashScreen';


const Stack = createNativeStackNavigator();

export default function CampersListPage() {
    const navigation = useNavigation();
    const { sessionId } = useContext(SessionContext);
    const isFocused = useIsFocused();
    const axiosPrivate = useAxiosPrivate();

    const [registeredCampers, setRegisteredCampers] = useState([]);
    const [totalCampers, setTotalCampers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const getSessionRegisteredCampers = async () => {
            try {
                setIsLoading(true);
                const response = await axiosPrivate.get(`/api/camps/campers/session/registered-campers/${sessionId}`);
                console.log("Registered campers:\n")
                // console.log(response.data);
                setRegisteredCampers(response.data);
                setTotalCampers(response.data.length);
                setIsLoading(false);
            }
            catch (err) {
                console.error(err);
            }
        }

        if (sessionId) {
            console.log("sessionId ");
            console.log(sessionId);
            getSessionRegisteredCampers();
        }
    }, [isFocused])

    function handleClick(camper) {
        navigation.navigate('CamperDetails', { camper });
    }

    if (isLoading) {
        return <SplashScreen></SplashScreen>
    }
    if (!sessionId || Object.keys(sessionId).length === 0) {
        return <View style={styles.container}>
            <Text> Select Camp Session before viewing camper list for session</Text>
        </View>
    }
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Total Campers in session: {totalCampers}</Text>
            <FlatList
                data={registeredCampers}
                keyExtractor={item => item._id}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={styles.item} onPress={() => handleClick(item)}>
                        <Text style={styles.number}>{index + 1}.</Text>
                        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
    },
    number: {
        fontWeight: 'bold',
        marginRight: 10,
        color: 'white',
    },
    name: {
        flex: 1,
        fontSize: 20,
        color: 'white',
    },
});
