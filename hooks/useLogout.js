import axios from "../api/axios";
import useAuth from "./useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {

        try {
            const response = await axios('/api/camps/logout', {
                withCredentials: true
            });
            setAuth({}); // TODO FIX
            AsyncStorage.removeItem('userToken');
            console.log(response?.status)
        } catch (err) {
            console.error(err);
        }
    }

    return logout;
}

export default useLogout;