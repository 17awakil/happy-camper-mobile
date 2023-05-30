import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerItem, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../components/LoginPage';
import DashboardPage from '../components/DashboardPage';
import CampersListPage from '../components/CampersListPage';
import CamperDetailsPage from '../components/CamperDetailsPage';
import NFCPage from '../components/NFCPage';
import CheckInPage from '../components/CheckInPage';
import CheckOutPage from '../components/CheckOutPage';
import MealPlanPage from '../components/MealPlanPage';
import BusPlanPage from '../components/BusPlanPage';
import { AuthContext } from '../context/AuthProvider';
import useLogout from '../hooks/useLogout';
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SplashScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>Loading...</Text>
        </View>
    );
}

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const CamperDetailsStack = createNativeStackNavigator();

function CamperDetailsStackScreen() {
    return (
        <CamperDetailsStack.Navigator>
            <CamperDetailsStack.Screen name="Campers" component={CampersListPage} />
            <CamperDetailsStack.Screen name="CamperDetails" component={CamperDetailsPage} />
        </CamperDetailsStack.Navigator>
    );
}
function AppNav({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth, setAuth } = useAuth();
    const logout = useLogout();

    const signOut = async () => {
        await logout();
    }

    function CustomDrawerContent(props) {
        return (
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
                <DrawerItem label="Log Out" onPress={signOut} />
            </DrawerContentScrollView>
        );
    }

    useEffect(() => {

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setIsLoading(false);
            }
        }

        // persist added here AFTER tutorial video
        // Avoids unwanted call to verifyRefreshToken


        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

    }, [])

    useEffect(() => {
        console.log(`isLoading: ${isLoading}`)
        console.log(`aT: ${JSON.stringify(auth?.accessToken)}`)
        console.log(`AsyncStorage aT: ${JSON.stringify(AsyncStorage.getItem('accessToken'))}`)
        console.log(`AsyncStorage sessionID: ${JSON.stringify(AsyncStorage.getItem('sessionId'))}`)
    }, [isLoading])

    if (isLoading === true) {
        // console.log("isLoading " + isLoading)
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            {(auth?.accessToken !== null && auth?.accessToken !== undefined) || !AsyncStorage.getItem("accessToken") ? (
                <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props}> </CustomDrawerContent>}>
                    <Drawer.Screen name="Dashboard" component={DashboardPage} />
                    <Drawer.Screen name="Campers" component={CamperDetailsStackScreen} options={{ headerShown: false }} />
                    <Drawer.Screen name="Check In" component={CheckInPage} />
                    <Drawer.Screen name="Check Out" component={CheckOutPage} />
                    <Drawer.Screen name="Meal Plan" component={MealPlanPage} />
                    <Drawer.Screen name="Bus Plan" component={BusPlanPage} />
                </Drawer.Navigator>
            ) : (
                <Stack.Navigator>
                    <Stack.Screen name="Login" component={LoginPage}
                    />
                </Stack.Navigator>
            )}
        </NavigationContainer>
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

export default AppNav;
