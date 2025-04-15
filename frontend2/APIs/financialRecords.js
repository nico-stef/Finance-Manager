import axios from 'axios';
import { API_URL } from '../variables.js';

export const getExpensesRecords = async (account_id, userid) => {
    try {
        const response = await axios.get(`${API_URL}/records/expenses`, {
            params: {
                account_id,
                userid
            }
        });
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET expense records:', error);
    }
};

export const getIncomesRecords = async (account_id, userid) => {
    try {
        const response = await axios.get(`${API_URL}/records/incomes`, {
            params: {
                account_id,
                userid
            }
        });
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET incomes records:', error);
    }
};

export const updateExpense = async (record) => {
    try {
        const idexpense = record.idexpenses;
        const response = await axios.patch(`${API_URL}/records/expenses/update/${idexpense}`, {
            category: record.category,
            amount: record.amount,
            date: record.date,
            note: record.note
        });
        return response.data.message;
    } catch (error) {
        console.error('Eroare la cererea PATCH update expense:', error);
    }
};

export const deleteExpense = async (record) => {
    try {
        const idexpense = record.idexpenses;
        const response = await axios.delete(`${API_URL}/records/expenses/delete/${idexpense}`);
        return response.data.message;
    } catch (error) {
        console.error('Eroare la cererea PATCH update expense:', error);
    }
};

export const updateIncome = async (record) => {
    try {
        const idincome = record.idincomes;
        console.log("Data trimisa", record.date)

        const localDate = new Date(record.date);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const finalDate =  `${year}-${month}-${day}`;

        const response = await axios.patch(`${API_URL}/records/incomes/update/${idincome}`, {
            amount: record.amount,
            date: finalDate,
            note: record.note
        });
        return response.data.message;
    } catch (error) {
        console.error('Eroare la cererea PATCH update income:', error);
    }
};

export const deleteIncome = async (record) => {
    try {
        const idincome = record.idincomes;
        const response = await axios.delete(`${API_URL}/records/incomes/delete/${idincome}`);
        return response.data.message;
    } catch (error) {
        console.error('Eroare la cererea DELETE income:', error);
    }
};