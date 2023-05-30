// import { createContext, useEffect, useState } from "react";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // import axios from '../api/axios'
// import axios from 'axios';
// const LOGIN_URL = '/api/camps/login';
// export const AuthContext = createContext({ userToken: null });
// export const AuthProvider = ({ children }) => {
//     const [auth, setAuth] = useState();
//     const [isLoading, setIsLoading] = useState(false);
//     const [userToken, setUserToken] = useState(null);
//     const [errMsg, setErrMsg] = useState('');

//     const login = async (username, password) => {
//         try {
//             setIsLoading(true);
//             console.log("RUNNING LOGIN")
//             console.log("username:\t" + username)
//             console.log("password:\t" + password)
//             const BASE_URL = 'https://backend-server-uedlfgqjjq-uc.a.run.app';
//             console.log(BASE_URL + LOGIN_URL)
//             const response = await axios.post("https://backend-server-uedlfgqjjq-uc.a.run.app/api/camps/login",
//                 JSON.stringify({ "username": username, "password": password }),
//                 {
//                     headers: { 'Content-Type': 'application/json' },
//                     withCredentials: true
//                 }
//             );
//             console.log("After request")
//             console.log(response);
//             console.log(JSON.stringify(response));
//             const userToken = response?.data?.accessToken;
//             // console.log("token :" + accessToken)
//             // const roles = response?.data?.roles;
//             setUserToken(userToken);
//             // // await SecureStore.setItemAsync('accessToken', accessToken);
//             AsyncStorage.setItem('userToken', userToken);

//         } catch (err) {
//             console.log("err" + err)
//             if (!err?.response) {
//                 setErrMsg('No Server Response');
//             } else if (err.response?.status === 400) {
//                 setErrMsg('Missing Username or Password');
//             } else if (err.response?.status === 401) {
//                 setErrMsg('Unauthorized');
//             } else {
//                 setErrMsg('Login Failed');
//             }
//         }
//         finally {
//             setIsLoading(false);
//             console.log("finally")
//         }
//     }
//     const logout = async () => {
//         setIsLoading(true);
//         setUserToken(null);
//         AsyncStorage.removeItem('userToken');
//         setIsLoading(false);
//     }

//     const isLoggedIn = async () => {
//         try {
//             setIsLoading(true);
//             let userToken = await AsyncStorage.getItem('userToken');
//             console.log("usertoken inside isLoggedIn\t" + userToken);
//             setUserToken(userToken);
//             setIsLoading(false);
//         }
//         catch (e) {
//             console.log(`isLoggedIn error ${e.message}`);
//         }
//     }

//     useEffect(() => {
//         isLoggedIn();
//     }, [])
//     return (
//         <AuthContext.Provider value={{ auth, setAuth, login, logout, isLoggedIn, isLoading, userToken, setUserToken }}>
//             {children}
//         </AuthContext.Provider>
//     )
// }



import { createContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    // const [persist, setPersist] = useState(JSON.parse(localStorage.getItem("persist")) || false);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;