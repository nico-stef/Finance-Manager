import React from 'react';
import { useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { View, Text, ActivityIndicator } from 'react-native';
import { Dimensions } from 'react-native';
import { getBudgetComparissonData } from '../APIs/chart';

function BarChartComponent() {

    const [expenses, setExpenses] = useState([]);
    const [amountBudgets, setAmountBudgets] = useState([]);
    const [months, setMonths] = useState([]);
    const [dataChart1, setDataChart1] = useState([]);
    const [dataChart2, setDataChart2] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dataChart1 && dataChart1.length > 0 && dataChart2 && dataChart2)
            setLoading(true)
    }, [dataChart1, dataChart2]);

    useEffect(() => {
        const allMonthsSet = new Set([
            ...expenses.map(e => e.month), //desfacem array-urile cu ...
            ...amountBudgets.map(b => b.month)
        ]);

        const allMonths = Array.from(allMonthsSet).sort();
        
        const monthsResult = allMonths.map(item => {
            const date = new Date(item + "-01");
  
            return date.toLocaleDateString("en-US", {
              month: 'short',
            })
        });
        
        setMonths(monthsResult);

        const spentMap = Object.fromEntries(
            expenses.map(e => [e.month, parseFloat(e.totalSpent)])
        );

        const budgetMap = Object.fromEntries(
            amountBudgets.map(b => [b.month, b.total_budget])
        );

        const spentData = allMonths.map(month => spentMap[month] || 0);
        const budgetData = allMonths.map(month => budgetMap[month] || 0);
        setDataChart1(spentData);
        setDataChart2(budgetData)

    }, [amountBudgets, expenses]);


    useEffect(() => {
        const getBudgetComparissonDataAsync = async () => {
            const res = await getBudgetComparissonData(23);
            setExpenses(res.expensesMonthly);
            setAmountBudgets(res.adjustedBudgets);
        };
        getBudgetComparissonDataAsync();
    }, []);

    return (
        <View style={{marginTop: 15}}>
            {loading ? <LineChart
                data={{
                    labels: months,
                    datasets: [
                        {
                            data: dataChart1,
                            color: () => 'red'
                        },
                        {
                            data: dataChart2,
                            color: () => 'blue'
                        },
                    ],
                    legend: ["actually spent", "budget planned"]
                }}
                width={Dimensions.get('window').width - 20}
                height={220}
                yAxisInterval={1} // optional, defaults to 1
                chartConfig={{
                    backgroundGradientFrom: "#A2D4C0",
                    backgroundGradientTo: "#5BA199",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `black`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#ffa726"
                    }
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            /> : <ActivityIndicator size="large" />}
        </View>
    )
}

export default BarChartComponent
