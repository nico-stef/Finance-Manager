import axios from 'axios';
import { API_URL } from '../variables.js';

export const addObjective = async (name, amount, date, accountId, budgetId, note, userId, categoryId) => {
    try {
        const dateFormated = date ? date.toISOString().split('T')[0] : null;
        const response = await axios.post(`${API_URL}/planner/addObjective`,
            {
                name,
                amount,
                due_date: dateFormated,
                accountId,
                budgetId,
                note,
                userId,
                categoryId
            });
        return response.status;
    } catch (error) {
        console.log('Eroare la cererea ADD objective:', error);
    }
};

export const getObjectives = async (accessToken) => {
    try {
        const response = await axios.get(`${API_URL}/planner/getObjectives`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET objectives:', error);
    }
};

export const getOptions = async (objectiveId) => {
    try {
        const response = await axios.get(`${API_URL}/planner/getOptions`, {
            params: {
                objectiveId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET options:', error);
    }
};

export const getOption = async (optionId) => {
    try {
        const response = await axios.get(`${API_URL}/planner/getOption`, {
            params: {
                optionId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET option:', error);
    }
};

export const getObjective = async (objectiveId) => {
    try {
        const response = await axios.get(`${API_URL}/planner/getObjective`, {
            params: {
                objectiveId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET option:', error);
    }
};

export const deleteObjective = async (objectiveId) => {
    try {
        const response = await axios.delete(`${API_URL}/planner/deleteObjective/${objectiveId}`);
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea DELETE objective:', error);
    }
};

export const deleteOption = async (optionId) => {
    try {
        const response = await axios.delete(`${API_URL}/planner/deleteOption/${optionId}`);
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea DELETE option:', error);
    }
};

export const updateOption = async (optionId, chosen) => {
    try {
        const response = await axios.patch(`${API_URL}/planner/updateOption/${optionId}`,
            {
                chosen
            }
        );
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea DELETE option:', error);
    }
};