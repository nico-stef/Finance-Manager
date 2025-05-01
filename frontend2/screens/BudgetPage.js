import React from 'react'
import { useState, useEffect, useRef } from "react";
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Modal, Pressable, TextInput, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Menu from '../components.js/Menu';
import SideMenuAnimated from '../components.js/SideMenuAnimated';
import Header from '../components.js/Header';
import * as Progress from 'react-native-progress';
import { getBudgetsAll } from '../APIs/moneyManagement';
import { MyModal } from '../components.js/myModal';
import { months } from "../variables"

export default function BudgetPage() {
    const [isOpen, setIsOpen] = useState(true);
    const [token, setAccessToken] = useState(null);
    const [userid, setUserid] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const navigation = useNavigation();
    const date = new Date(); //data curenta
    const [progress, setProgress] = useState(0);
    const [budgetThisMonth, setBudgetThisMonth] = useState(0);
    const [budgetSpent, setBudgetSpent] = useState(0);
    const [modalMonthCalendar, setModalMonthCalendar] = useState(false); //moddal calendar month
    const [month, setMonth] = useState(''); //selected month

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const getAccessToken = async () => {
        try {
            //get access token from async storage
            const accessToken = await AsyncStorage.getItem('accessToken');
            setAccessToken(accessToken);

            //get info that comes with the access token, in my case the object user who has name
            const user = jwtDecode(accessToken);
            setUserid(user.userid);

            const currentTime = Date.now() / 1000; //timpul curent în secunde
            if (user.exp < currentTime || !accessToken) {
                !accessToken ? console.log('Nu există access token!') : console.log('Token-ul a expirat!');
                await AsyncStorage.removeItem('accessToken');
                navigation.navigate('LogIn');
                return;
            }

        } catch (error) {
            console.error("Eroare la recuperarea token-ului:", error);
        }
    };

    //get accessToken/userid
    useEffect(() => {
        const getAccessTokenAsync = async () => {
            await getAccessToken();
        };
        getAccessTokenAsync();
    }, []);

    //get budgets data
    useEffect(() => {
        const currentMonth = month ? month.month : date.getMonth() + 1; // 0=ianuarie => adaugam 1
        const currentYear = month ? month.year : date.getFullYear();
        console.log(currentMonth, currentYear)

        getBudgetsAll(userid, currentMonth, currentYear)
            .then((data) => { setBudgets(data) })
            .catch((err) => console.error(err));
    }, [userid, month]);

    useEffect(() => {
        const totalBuget = budgets.reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);
        const totalCheltuit = budgets.reduce((acc, b) => acc + parseFloat(b.total || 0), 0);

        const progres = totalCheltuit > 0 ? totalCheltuit / totalBuget : 0;
        setBudgetThisMonth(totalBuget);
        setBudgetSpent(totalCheltuit);
        setProgress(progres);
    }, [budgets]);

    // useEffect(() => {
    //     console.log("progres: ", budgets)
    // }, [budgets]);

    const closeModal = (setModalVisibile) => {
        return () => { //functie care fara return ar fi fost apelata imediat
            setModalVisibile(false);
        };
    };

    const handleMonth = (item) => {
        setMonth(item);
        setModalMonthCalendar(false);
    }

    const Record = ({ item }) => {
        return (
            <View style={styles.cardRecordBig}>
                <View style={styles.cardRecord}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '50%' }}>
                        <Text style={[styles.buttonTextRecord, { fontWeight: 'bold', marginLeft: 20 }]}>{item.name}</Text>
                    </View>
                    <Text style={[styles.buttonTextRecord]}>{item.total ? (item.total.endsWith('.00') ? parseFloat(item.total).toFixed(0) : item.total) : `0`}/{item.amount.endsWith('.00') ? parseFloat(item.amount).toFixed(0) : item.amount}</Text>

                </View>
                <Progress.Bar progress={parseFloat(item.total)/parseFloat(item.amount)} width={null} style={{ width: '90%', alignSelf: 'center' }} color='#69C0FF' />
            </View>

        )
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <View style={{ flex: 1, backgroundColor: '#E8F5F2' }}>
                <Header title="Budget" icon="piggy-bank" toggleMenu={toggleMenu}></Header>

                <View style={{ flex: 1, alignItems: 'center' }}>

                    {/* ------------modal pentru calendar MONTH------------- */}
                    <MyModal
                        visible={modalMonthCalendar} onClose={closeModal(setModalMonthCalendar)} title="Select the month"
                        data={months} keyExtractor={(item) => item.id} onItemPress={handleMonth} nrCol={3} desc={true}
                    />

                    <View style={styles.budgetCard}>
                        <Text style={[styles.buttonText, { fontSize: 18, marginLeft: 6, marginTop: 10 }]}>Available budget for {month ? month.name : date.toLocaleString('en-US', { month: 'long' })} {/*{date.toLocaleString('en-US', { month: 'long' })}*/}: </Text>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.buttonText, { fontSize: 20 }]}>${budgetThisMonth - budgetSpent} out of ${budgetThisMonth} </Text>
                        </View>

                        <Progress.Bar progress={progress} width={null} />

                        <TouchableOpacity style={styles.viewPreviousBudgets} onPress={() => setModalMonthCalendar(true)}>
                            <Text style={[styles.buttonText, { fontSize: 14, fontWeight: 'normal' }]}>{month.name ? month.name : `month`}</Text>
                            <Icon name="chevron-down" size={10} color="black" marginStart={4} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.addBudget} onPress={() => navigation.navigate('Create budget')}>
                        <Text style={[styles.buttonText, { fontSize: 16, fontWeight: 'bold' }]}>+ new budget</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={budgets}
                        renderItem={({ item }) => <Record item={item} />}
                        keyExtractor={item => item.idbudgets}
                        initialNumToRender={10}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />

                </View>


            </View>

            <Menu></Menu>

            <SideMenuAnimated isOpen={isOpen}></SideMenuAnimated>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    budgetCard: {
        height: '20%',
        width: '95%',
        // backgroundColor: '#f4faff',
        marginTop: 25,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'column',   // Pune elementele pe verticală
        justifyContent: 'space-between',
        borderRadius: 10,
        padding: 10,
        elevation: 5,
        backgroundColor: 'white', 
    },
    viewPreviousBudgets: {
        flexDirection: 'row',
        borderColor: '#21907F',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 4
    },
    addBudget: {
        height: '7%',
        width: '95%',
        backgroundColor: '#d1dff7',//"25a18e",//'#d1dff7',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom: 20
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
    //record
    cardRecord: {
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        width: '98%',
        alignSelf: 'center',
        minHeight: 60,
        backgroundColor: "#fff",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        // backgroundColor: 'pink'
    },
    cardRecordBig: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: 'grey',
        marginTop: 10,
        padding: 10,
    },
    icon: {
        color: 'black',
        fontWeight: 'normal'
    },
    buttonTextRecord: {
        color: 'black',
        fontFamily: 'serif',
        fontSize: 16
    },
})