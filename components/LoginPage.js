import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from '../api/axios';
import useAuth from "../hooks/useAuth";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const LOGIN_URL = '/api/camps/login';

function LoginPage() {
    const { setAuth } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const navigation = useNavigation();

    const login = async () => {
        try {
            // const response = await axios.post(LOGIN_URL,
            //     { "username": username, "password": password },
            //     // {
            //     //     headers: { 'Content-Type': 'application/json' },
            //     //     // withCredentials: true
            //     // }
            // );
            console.log(username);
            console.log(password);
            var data = JSON.stringify({
                "username": username,
                "password": password,
            });

            console.log(data);

            var config = {
                method: 'post',
                url: '/api/camps/login',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: data
            };

            axios(config).then(function (response) {
                console.log(JSON.stringify(response.data));
                const accessToken = response?.data?.accessToken;
                console.log("token :" + accessToken)
                const roles = response?.data?.roles;
                setAuth({ username, password, roles, accessToken });
                AsyncStorage.setItem('accessToken', accessToken);
            })
                .catch(function (error) {
                    console.log(error.status)
                    console.log(error.response.data);
                    setErrMsg(error.response.data["message"]);
                });
            // console.log(response.json())
            // console.log("response");
            // console.log(JSON.stringify(response?.data));

        } catch (err) {
            console.log("err\t" + err)
            console.log(err)
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
        }
    }
    return (
        <View style={styles.container}>
            <Text style={styles.errMsg}> {errMsg}</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={e => setUsername(e)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={e => setPassword(e)}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={() => login()}>
                <Text>Log In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errMsg: {
        color: 'red'
    },
    input: {
        width: 200,
        height: 44,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 10,
    },
    button: {
        width: 100,
        height: 44,
        padding: 10,
        margin: 10,
        backgroundColor: '#0066cc',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default LoginPage;
