import axios from 'axios';
import { API_URL } from '../variables.js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/getCategories`);
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET categories:', error);
    }
};

export const getAccounts = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/getAccounts/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET accounts:', error);
    }
};

export const getTags = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/getTags/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET tags:', error);
    }
};

export const addTag = async (userId, tag) => {
    try {
        const response = await axios.post(`${API_URL}/addTag`,
            {
                id_user: userId,
                tag: tag
            });
        return response.data;
    } catch (error) {
        console.log('Eroare la cererea ADD tag:', error);
    }
};

export const deleteTags = async (userId, tags) => {
    try {
        const response = await axios.delete(`${API_URL}/deleteTags`, {
            data: { user_id: userId, idTags: tags }
        });
        return response.data;
    } catch (error) {
        console.log('Eroare la cererea DELETE tag:', error);
    }
};

import { Alert } from 'react-native';
export const addExpense = async (userId, tags, amount, date, categoryId, AccountId, note, budget_id) => {
    try {
        const response = await axios.post(`${API_URL}/addExpense`,
            {
                id_user: userId,
                amount,
                date,
                note,
                category_id: categoryId,
                account_id: AccountId,
                tags,
                budget_id
            });
        return response;
    } catch (error) {
        if (error.response?.status === 400) {
            Alert.alert('Warning', error.response.data || 'Not enough funds.');
            console.log('Eroare la cererea add expense:', error);
        }
    }
};

export const addIncome = async (userId, amount, date, accountId, note) => {
    try {
        const response = await axios.post(`${API_URL}/addIncome`,
            {
                id_user: userId,
                amount,
                date,
                note,
                account_id: accountId,
            });
        return response.data;
    } catch (error) {
        console.log('Eroare la cererea ADD income:', error);
    }
};

export const addBudget = async (id_user, name, amount, date, freq, note) => {
    try {
        const response = await axios.post(`${API_URL}/addBudget`,
            {
                id_user, name, amount, date, freq, note
            });
        return response.data;
    } catch (error) {
        console.log('Eroare la cererea ADD budget:', error);
    }
};

export const getBudgets = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/getBudgetsOptions/${userId}`);
        // const budgetNames = response.data.map(item => item.name)
        const options = response.data.map(item => ({
            label: item.name,    // Valoarea va fi folosită atât pentru 'label' cât și pentru 'value'
            value: item.name,    // Poți schimba acest lucru dacă vrei un alt tip de 'value'
            name: item.name,
            idBudget: item.idbudgets
        }));
        return options; //un array cu obiecte bugete
    } catch (error) {
        console.error('Eroare la cererea GET tags:', error);
    }
};

export const getBudgetsAll = async (userId, currentMonth, currentYear) => {
    try {
        const response = await axios.get(`${API_URL}/getBudgets/${userId}?month=${currentMonth}&year=${currentYear}`);

        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET tags:', error);
    }
};

import { api } from './api.js';

export const getDetailsBalance = async () => {
    try {
      const response = await api.get('/getDetailsBalance');
      return response.data;
    } catch (error) {
      console.log('Eroare la getDetailsBalance:', error);
      return 'error';
    }
  };

// export const getDetailsBalance = async (accessToken) => {
//     try {
//         const response = await axios.get(`${API_URL}/getDetailsBalance`, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         if (error.response && error.response.status === 403) {
           
//             try {
//                 const refreshToken = await SecureStore.getItemAsync('refreshToken');
//                 const res = await axios.post(`${API_URL}/refreshToken`, {
//                     token: refreshToken
//                 });

//                 const newAccessToken = res.data.accessToken;
//                 await AsyncStorage.setItem('accessToken', newAccessToken);

//                 // Refacem requestul cu token nou
//                 const retryResponse = await axios.get(`${API_URL}/getDetailsBalance`, {
//                     headers: {
//                         'Authorization': `Bearer ${newAccessToken}`
//                     }
//                 });

//                 return retryResponse.data;
//             } catch (refreshError) {
//                 console.log('Eroare la refresh:', refreshError);
//                 await AsyncStorage.removeItem('accessToken');
//                 await SecureStore.deleteItemAsync('refreshToken');
//                 return 'error';
//             }
//         }
//     }
// };