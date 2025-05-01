import axios from 'axios';
import { API_URL } from '../variables.js';

export const getExpensesPerCateogory = async (period, date, account_id, week_start, week_end, monthChart, yearChart, id_user) => {
    try {
        // console.log(period, account_id, date, week_end, week_start, monthChart, yearChart)
        const [month, day, year] = date.split('/');
        const formatedDate = year+"-"+month+"-"+day; //formatam data pt a fi acceptata de MySql yyy-mm-dd
        const response = await axios.get(`${API_URL}/chart/getExpensesPerCateogory`, {
            params: {
                date: formatedDate,
                account_id,
                period,
                week_start,
                week_end,
                month: monthChart,
                year: yearChart,
                id_user
            }
        });
        return response.data
    } catch (error) {
        console.error('Eroare la cererea GET expenses chart:', error);
    }
};

export const getExpenseTendencies = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/chart/getExpenseTendencies/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET option:', error);
    }
};

export const getBudgetComparissonData= async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/chart/budgetComparisson/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Eroare la cererea GET option:', error);
    }
};