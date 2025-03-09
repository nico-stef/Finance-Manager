import React from 'react';
import { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from '@react-navigation/native';
import { addBudget } from '../APIs/moneyManagement';
import { getUserData } from '../APIs/profile';
import { Dropdown } from 'react-native-element-dropdown';

export default function ManageBudgets() {
    const [nameBudget, setNameBudget] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [frequency, setFrequency] = useState(null);
    const frequencyOptions = [
        { label: 'daily', value: '1' },
        { label: 'weekly', value: '2' },
        { label: 'monthly', value: '3' },
        { label: 'yearly', value: '4' },
    ];
    const [datePicker, setDatePicker] = useState(false);
    const [token, setAccessToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const navigation = useNavigation();

    const getAccessToken = async () => {
        try {
            //get access token from async storage
            const accessToken = await AsyncStorage.getItem('accessToken');
            setAccessToken(accessToken);

            //get info that comes with the access token, in my case the object user who has name
            const user = jwtDecode(accessToken);
            setUsername(user.name);

            if (!accessToken) {
                console.log('Nu există access token!');
                setIsLoggedIn(false);
                navigation.navigate('LogIn');
                return;
            }

            const currentTime = Date.now() / 1000; //timpul curent în secunde
            if (user.exp < currentTime) {
                console.log('Token-ul a expirat!');
                setIsLoggedIn(false);
                navigation.navigate('LogIn');
                return;
            }

        } catch (error) {
            console.error("Eroare la recuperarea token-ului:", error);
        }
    };

    //useEffect rerandeaza si daca exista in interiorul functiei useState => se rerandeaza de 3 ori functia getAccessToken
    useEffect(() => {
        const getAccessTokenAsync = async () => {
            await getAccessToken();
        };

        getAccessTokenAsync();

    }, [])

    useEffect(() => {
        //daca access token e expirat nu se mai executa acest useEffect
        if (!isLoggedIn) return;

        const fetchDataAsync = async () => {

            if (username && token) {
                const user = await getUserData(username, token);
                setUser(user);
            }
        };

        fetchDataAsync();

    }, [token, isLoggedIn])

    const handleDateChange = (event, selectedDate, setter) => {
        if (event.type === "set") {
            const currentDate = selectedDate;
            setter(currentDate);
        }
        setDatePicker(false);
    }

    const handleCreateBudget = async () => {
        if (!amount || !nameBudget || !startDate || !endDate)
            Alert.alert("Warning", "You need to complete the necessary fields!");
        else {
            await addBudget(user.id, nameBudget, amount, startDate, endDate, frequency, note);
            Alert.alert("Success", "Budget added successfully!");
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>

                        {/* ----------------pick the name------------------- */}
                        <Text style={styles.label}>Name of your budget: </Text>
                        <TextInput style={styles.input} onChangeText={setNameBudget} value={nameBudget} placeholder="type the name" />

                        {/* ----------------pick the amount------------------- */}
                        <Text style={styles.label}>Amount: </Text>
                        <TextInput style={styles.input} onChangeText={setAmount} value={amount} placeholder="type your amount" keyboardType="numeric" />

                        {/* -------------picking the start date----------------- */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Start date: </Text>
                            <TextInput style={[styles.input, { borderWidth: 0, fontSize: 16 }]} value={startDate ? startDate.toLocaleDateString() : ""} editable={false} />
                        </View>
                        <Pressable
                            style={[styles.button, styles.buttonOpen]}
                            onPress={() => setDatePicker(true)}
                        >
                            <Text style={styles.textStyle}>set start date</Text>
                        </Pressable>
                        {
                            datePicker && (
                                <DateTimePicker
                                    mode={'date'}
                                    is24Hour={true}
                                    value={startDate || new Date()}
                                    onChange={(event, selectedDate) => handleDateChange(event, selectedDate, setStartDate)}
                                >
                                </DateTimePicker>
                            )
                        }

                        {/* -------------picking the end date----------------- */}
                        <View style={styles.row}>
                            <Text style={styles.label}>End date: </Text>
                            <TextInput style={[styles.input, { borderWidth: 0, fontSize: 16 }]} value={endDate ? endDate.toLocaleDateString() : ""} editable={false} />
                        </View>
                        <Pressable
                            style={[styles.button, styles.buttonOpen]}
                            onPress={() => setDatePicker(true)}
                        >
                            <Text style={styles.textStyle}>set end date</Text>
                        </Pressable>
                        {
                            datePicker && (
                                <DateTimePicker
                                    mode={'date'}
                                    is24Hour={true}
                                    value={startDate || new Date()}
                                    onChange={(event, selectedDate) => handleDateChange(event, selectedDate, setEndDate)}
                                >
                                </DateTimePicker>
                            )
                        }

                        {/* ---------------pick the note------------- */}
                        <Text style={[styles.label, {paddingTop: 10}]}>Frequency: </Text>
                        <Dropdown
                            data={frequencyOptions}
                            containerStyle={styles.dropdownContainer}
                            selectedTextStyle={[styles.input, { borderWidth: 0, fontSize: 16, marginStart: 20 }]}
                            placeholderStyle={{marginStart: 20, paddingVertical: 10}}
                            placeholder='select frquency...'
                            maxHeight={200}
                            labelField="label"
                            valueField="value"
                            value={frequency}
                            onChange={item => {
                                setFrequency(item.value);
                            }}
                        />

                        {/* ---------------pick the note------------- */}
                        <Text style={styles.label}>Note: </Text>
                        <TextInput style={styles.input} onChangeText={setNote} value={note} placeholder="write a note" />


                        <Pressable
                            style={[styles.button, styles.buttonClose, { marginTop: 40 }]}
                            onPress={() => handleCreateBudget()}
                            android_ripple={{ color: 'white' }}
                        >
                            <Text style={styles.textStyle}>create budget</Text>
                        </Pressable>

                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#CCE3DE',
        flex: 1,
        paddingTop: '2%',
        alignContent: 'center',
        justifyContent: 'center'
    },
    dropdownContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'black',
        width: '70%',
        elevation: 5,
        alignSelf: 'center',
        paddingTop: 20
    },
    selectedValueText: {
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '70%'
    },
    label: {
        fontFamily: 'serif',
        marginStart: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    centeredView: {
        fontFamily: 'serif',
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: 500,
    },
    modalTitle: {
        fontFamily: 'serif',
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    input: {
        height: 40,
        margin: 5,
        borderWidth: 1,
        padding: 10,
        fontFamily: 'serif',
        borderRadius: 10,
        width: '90%',
        alignSelf: 'center',
    },
    incomeButtonsView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    buttonIncome: {
        width: '40%',
        marginHorizontal: 20,
        paddingVertical: 2,
        borderRadius: 10,
        alignContent: 'center',
        justifyContent: 'center',

    },
    button: {
        width: '70%',
        alignSelf: 'center',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        elevation: 5,
    },
    buttonOpen: {
        backgroundColor: '#25a18e',
    },
    buttonClose: {
        backgroundColor: '#16619a',
        paddingBottom: 10
    },
    textStyle: {
        fontFamily: 'serif',
        fontSize: 16,
        textAlign: "center",
        color: "white"
    },
    selectedCategory: {
        backgroundColor: '#dbf0e3',
        borderColor: '#fff',
        borderWidth: 2,
    },
    categoryItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
});
