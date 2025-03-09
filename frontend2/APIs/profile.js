import axios from 'axios';
import { API_URL } from '../variables.js';

export const getUserData = async (username, accessToken) => {
    try {
        const response = await axios.get(`${API_URL}/user/getUser`, {
            params: {
                username: username
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET:', error);
    }
};

export const updateUser = async (username, name, phone, accessToken) => {
    try {
            const response = await axios.put(`${API_URL}/user/updateUser`,{
                    username,
                    name,
                    phone
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
            
        return response.data;
    } catch (error) {
        if (error.response) { //cererea a ajuns la server, dar serverul a returnat un cod de eroare
            console.log("Login failed:", error.response.data);
            throw new Error(error.response.data.message);
        } else { //serverul nu a raspuns
            console.log("Error:", error.message);
            throw new Error("Eroare. Serverul nu a raspuns");
        }
    }
};

export const deleteUser = async (username, accessToken) => {
    try {
        const response = await axios.delete(`${API_URL}/user/deleteUser`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: { username: username },
          });

        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET:', error);
    }
};