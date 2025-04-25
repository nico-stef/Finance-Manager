import axios from 'axios';
import { API_URL } from '../variables.js';

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
        return response.data;
    } catch (error) {
        console.log('Eroare la cererea ADD expense:', error);
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

export const addBudget = async ( id_user, name, amount, date, freq, note) => {
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