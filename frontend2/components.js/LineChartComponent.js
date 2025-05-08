import React from 'react';
import { useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { View, ActivityIndicator} from 'react-native';
import { Dimensions } from 'react-native';
import { getExpenseTendencies } from '../APIs/chart';

export default function LineChartComponent() {

  const [dataExpenses, setDataExpenses] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [""],
    datasets: [{ data: [0] }]
  });
   const [loading, setLoading] = useState(false);

  //luam datele de afisat in chart
  useEffect(() => {
    const getExpenseTendenciesAsync = async () => {
      const res = await getExpenseTendencies(23);
      console.log(res);
      if(res === 'error'){
        navigation.navigate('LogIn');
        return;
    }
      setDataExpenses(res);
    };
    getExpenseTendenciesAsync();
  }, []);

  // useEffect(() => {
  //   console.log("data primita ", dataExpenses)
  // }, [dataExpenses]);

  //cand avem datele de pe backend, le formatam pt a le putea afisa in chart
  useEffect(() => {
    if (dataExpenses && dataExpenses.length > 0) {
      setLoading(true);
      const newData = {
        labels: dataExpenses.map(item => {
          const date = new Date(item.month + "-01");

          return date.toLocaleDateString("en-US", {
            month: 'short',
          })
        }
        ),
        datasets: [
          {
            data:  dataExpenses.map(item => parseFloat(item.total)),
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            strokeWidth: 3,
          }
        ]
      };
      setChartData(newData);
    }
  }, [dataExpenses]);


  return (
    <View style={{marginTop: 15}}>
       {loading ? <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 20}
        height={250}
        chartConfig={{
          backgroundGradientFrom: "#A2D4C0",
          backgroundGradientTo: "#5BA199",
          decimalPlaces: 2,
          color: () => `rgba(134, 65, 244, 0.2)`,
          labelColor: (opacity = 1) => `black`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "0.5",
            stroke: "black"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      /> : <ActivityIndicator/>}
    </View>
  )
}

