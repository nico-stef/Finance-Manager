import axios from 'axios';
import { API_URL } from '../variables.js';

export const addObjective = async (name, amount, date, accountId, budgetId, note, userId) => {
    try {
        const dateFormated = date? date.toISOString().split('T')[0] : null;
        const response = await axios.post(`${API_URL}/planner/addObjective`,
            {
                name,
                amount,
                due_date: dateFormated,
                accountId,
                budgetId,
                note,
                userId
            });
        return response.status;
    } catch (error) {
        console.log('Eroare la cererea ADD objective:', error);
    }
};