import axios from 'axios';
import { API_URL } from '../variables.js';

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`,
            {
                username: username,
                password: password
            });
        return response.data;
    } catch (error) {
        if (error.response) { //cererea a ajuns la server, dar serverul a returnat un cod de eroare
            console.log("Login failed:", error.response.data);
            throw new Error(error.response.data.message);
        } else { //serverul nu a raspuns
            console.log("Error:", error.message);
        }
    }
};

export const signin = async (username, password, name, phone) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`,
            {
                username: username,
                password: password,
                name: name,
                phone: phone
            });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.log("Sign in failed:", error.response.data);
            throw new Error(error.response.data.message);
        } else {
            console.log("Error:", error.message);
            throw new Error("Eroare. Serverul nu a raspuns");
        }
    }
};

export const logout = async (username) => {
    try {
        const response = await axios.delete(`${API_URL}/auth/logout`, {
            data: { username: username }
        });

        return response.data;
    } catch (error) {
        console.error('Eroare la logout:', error.message);
    }
};