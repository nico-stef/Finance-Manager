import React, { useId } from 'react';
import { useState, useEffect, useRef } from "react";
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Modal, Pressable, TextInput, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Menu from '../components.js/Menu';
import TopButtons from '../components.js/TopButtons';
import SideMenuAnimated from '../components.js/SideMenuAnimated';
import Header from '../components.js/Header';
import { MyModal } from '../components.js/myModal';
import { getExpensesRecords, getIncomesRecords, updateExpense, deleteExpense, updateIncome, deleteIncome } from '../APIs/financialRecords';
import { getAccounts, getCategories } from '../APIs/moneyManagement';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function FinancialRecords() {
    const [isOpen, setIsOpen] = useState(true);
    const [expenseRecords, setExpenseRecords] = useState([]);
    const [incomeRecords, setIncomeRecords] = useState([]);
    const [token, setAccessToken] = useState(null);
    const [userid, setUserid] = useState(null);
    const [accounts, setAccounts] = useState([]); //list of the accounts
    const [account, setAccount] = useState({ "idaccounts": "total", "name": "total" }); //selected account
    const [modalAccountVisible, setModalAccountVisible] = useState(false); //moddal account
    const navigation = useNavigation();
    const [expenseOrIncome, setExpenseOrIncome] = useState(1);
    const [flatlistData, setFlatlistData] = useState([]);
    const [modalRecordVisible, setModalRecordVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState({});
    const [datePicker, setDatePicker] = useState(false);
    const [date, setDate] = useState(new Date()); //valoarea initiala a date picker-ului
    const [modalVisible1, setModalVisible1] = useState(false); //category
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(''); //pentru modalul cu categorii sa stim categoria actuala ca sa fie colorata


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

    //get accounts
    useEffect(() => {
        getAccounts(userid)
            .then((data) => {
                data.push({ "idaccounts": "total", "name": "total" });
                setAccounts(data)
            })
            .catch((err) => console.error(err));
    }, [userid]);

    //get records(expenses and incomes) based off the account or useird if we want all acounts
    useEffect(() => {
        getExpensesRecords(account.idaccounts, userid)
            .then((data) => setExpenseRecords(data))
            .catch((err) => console.error(err));

        getIncomesRecords(account.idaccounts, userid)
            .then((data) => setIncomeRecords(data))
            .catch((err) => console.error(err));
    }, [accounts, account]);

    //get categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                setError("There was an error fetching categories.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (modalVisible1) {
            fetchCategories();
        }
    }, [modalVisible1]);

    //choose what data to display - expenses or incomes
    useEffect(() => {
        if (expenseOrIncome === 1)
            setFlatlistData(expenseRecords);
        else if (expenseOrIncome === 2)
            setFlatlistData(incomeRecords);
        
    }, [expenseOrIncome, expenseRecords, incomeRecords, account]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleAccount = (item) => {
        setAccount(item);
        setModalAccountVisible(false);
    }

    const closeModal = (setModalVisibile) => {
        return () => { //functie pe care o putem apela mai tarziu, nu imediat. fara return ar fi fost apelata imediat
            setModalVisibile(false);
        };
    };

    const handleRecordClick = (item) => {
        setSelectedRecord(item);
    }

    const formatDate = (dateToFormat) => {
        const date = new Date(dateToFormat);
        date.setHours(12);
        return date.toLocaleDateString("ro-en", {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleDateChange = (event, selectedDate) => {
        if (event.type === "set") {
            setDatePicker(false);
            console.log("data selectat", selectedDate)

            setSelectedRecord(prev => ({
                ...prev,
                date: selectedDate,
            }));

        } else {
            setDatePicker(false);
        }
    };

    const handleCategory = (item) => {
        const categ = item.category;
        setCategory(item)

        setSelectedRecord(prev => ({
            ...prev,
            category: categ,
        }));
    }

    const handlePressDate = () => {
        setDatePicker(true);
    }


    const Record = ({ item }) => {
        return (
            <TouchableOpacity style={styles.cardRecord} onPress={() => { setModalRecordVisible(true); handleRecordClick(item) }}>

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '80%'}}>
                    {item.icon ? (<Icon name={item.icon} size={20} style={styles.icon} />) : (<Icon name="money-bill-wave" color="green" size={20} style={styles.icon} />)}
                    <View style={{ marginLeft: 20 }}>
                        <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>{formatDate(item.date)}</Text>
                        {item.category && <Text style={styles.buttonText}>{item.category}</Text>}
                        {item.note && <Text style={[styles.buttonText, { fontSize: 14, width: '80%' }]}>{item.note}</Text>}
                    </View>
                </View>

                {expenseOrIncome === 1 ? (<Text style={[styles.buttonText, { fontWeight: 'bold', color: "red"}]}>-${item.amount}</Text>) :
                    (<Text style={[styles.buttonText, { fontWeight: 'bold', color: "green" }]}>+${item.amount}</Text>)}

            </TouchableOpacity>
        )
    };

    //update record
    const handleUpdateRecord = async () => {
        if (expenseOrIncome === 1){
            await updateExpense(selectedRecord);
            setExpenseRecords(prev => prev.map(expense => expense.idexpenses === selectedRecord.idexpenses ? selectedRecord : expense));
        }
        else if (expenseOrIncome === 2){
            await updateIncome(selectedRecord);
            setIncomeRecords(prev => prev.map(income => income.idincomes === selectedRecord.idincomes ? selectedRecord : income));
        }
        setModalRecordVisible(!modalRecordVisible);
        Alert.alert('Success', "Record updated succesfully!");
    }

    //delete record
    const handleDeleteRecord = async () =>{
        if (expenseOrIncome === 1){
            await deleteExpense(selectedRecord);
            setExpenseRecords(prev => prev.filter(expense => expense.idexpenses !== selectedRecord.idexpenses));
        }
        else if (expenseOrIncome === 2){
            await deleteIncome(selectedRecord);
            setIncomeRecords(prev => prev.filter(income => income.idincomes !== selectedRecord.idincomes));
        }
        setModalRecordVisible(!modalRecordVisible);
        Alert.alert('Success', "Record deleted succesfully!");
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <View style={{ flex: 1 }}>
                <Header title="Transactions" icon="scroll" toggleMenu={toggleMenu}></Header>
                <TopButtons setValue={setExpenseOrIncome}></TopButtons>

                {/* --------modal pentru accounts------------- */}
                <MyModal
                    visible={modalAccountVisible} onClose={closeModal(setModalAccountVisible)} title="Select the account"
                    data={accounts} keyExtractor={(item) => item.idaccounts} onItemPress={handleAccount} nrCol={2}
                />

                <View style={{ flex: 1 }}>

                    <TouchableOpacity style={styles.accountButton} onPress={() => setModalAccountVisible(true)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="credit-card" size={20} color="black" />
                            <Icon name="chevron-down" size={12} color="black" marginStart={4} />
                        </View>
                        <Text style={styles.buttonText}>{account.name}</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={flatlistData}
                        extraData={flatlistData}
                        renderItem={({ item }) => <Record item={item} />}
                        keyExtractor={item => item.idexpenses ? item.idexpenses : item.idincomes}
                        initialNumToRender={10}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />

                </View>


                {/* --------modal pentru record------------- */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalRecordVisible}
                    onRequestClose={() => {
                        setModalRecordVisible(!modalRecordVisible);
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>{expenseOrIncome === 1 ? "Expense Record" : "Income Record"}</Text>

                            {selectedRecord.category && <View style={styles.row}>
                                <Text style={styles.label}>Category:</Text>
                                <TouchableOpacity onPress={() => setModalVisible1(true)}>
                                    <TextInput //category
                                        value={selectedRecord?.category}
                                        onChangeText={(text) =>
                                            setSelectedRecord(prev => ({
                                                ...prev,
                                                category: text
                                            }))
                                        }
                                        editable={false}
                                        style={styles.textInput}
                                    />
                                </TouchableOpacity>
                                <Icon name="edit" size={16} color="black" paddingHorizontal={10} />
                            </View>}

                            <View style={styles.row}>
                                <Text style={styles.label}>Date:</Text>
                                <TouchableOpacity onPress={handlePressDate}>
                                    <TextInput //date
                                        editable={false}
                                        value={formatDate(selectedRecord?.date)}
                                        style={styles.textInput}
                                    />
                                </TouchableOpacity>
                                <Icon name="edit" size={16} color="black" paddingHorizontal={10} />
                            </View>
                            {
                                datePicker && (
                                    <DateTimePicker
                                        mode={'date'}
                                        is24Hour={true}
                                        value={date || new Date()}
                                        onChange={handleDateChange}
                                    >
                                    </DateTimePicker>
                                )
                            }

                            <View style={styles.row}>
                                <Text style={styles.label}>Amount:</Text>
                                <TouchableOpacity>
                                    <TextInput //date
                                        editable
                                        keyboardType="decimal-pad"
                                        value={selectedRecord?.amount}
                                        onChangeText={(text) => {

                                            let filtered = text;
                                            const firstDotIndex = filtered.indexOf('.');
                                            if (firstDotIndex !== -1) {
                                                // inainte si dupa primul punct
                                                const beforeDot = filtered.slice(0, firstDotIndex);
                                                const afterDotRaw = filtered.slice(firstDotIndex + 1); // scoate alte puncte
                                                const afterDot = afterDotRaw.slice(0, 2); // doar 2 zecimale

                                                filtered = `${beforeDot}.${afterDot}`;
                                            }

                                            console.log("filtered", filtered);

                                            setSelectedRecord(prev => ({
                                                ...prev,
                                                amount: filtered
                                            }))
                                        }}
                                        style={styles.textInput}
                                    />
                                </TouchableOpacity>
                                <Icon name="edit" size={16} color="black" paddingHorizontal={10} />
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Note:</Text>
                                <TextInput //note
                                    editable
                                    multiline={true}
                                    numberOfLines={5}
                                    scrollEnabled={true}
                                    value={selectedRecord?.note}
                                    onChangeText={(text) =>
                                        setSelectedRecord(prev => ({
                                            ...prev,
                                            note: text
                                        }))
                                    }
                                    style={styles.textInput}
                                />
                                <Icon name="edit" size={16} color="black" />
                            </View>

                            <View style={styles.buttons}>
                                <TouchableOpacity style={[styles.button, styles.update]} onPress={handleUpdateRecord}>
                                    <Text style={styles.buttonText}>Update</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.button, styles.delete]} onPress={handleDeleteRecord}>
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>

                            <Pressable
                                style={[styles.buttonClose]}
                                onPress={() => setModalRecordVisible(!modalRecordVisible)}>
                                <Text style={styles.textStyle}>close</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                {/* ----------modal category------------------- */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible1}
                    onRequestClose={() => setModalVisible1(false)}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Select a Category</Text>


                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.idcategories}
                                numColumns={2}
                                renderItem={({ item }) => (
                                    <Pressable style={[
                                        styles.categoryItem,
                                        category && category.idcategories === item.idcategories
                                            ? styles.selectedCategory
                                            : null,
                                    ]}
                                        onPress={() => handleCategory(item)} >
                                        <Icon name={item.icon} size={20} color="black" style={styles.icon} />
                                        <Text style={styles.categoryText}>{item.category}</Text>
                                    </Pressable>
                                )}
                            />


                            <Pressable
                                style={[styles.button, styles.buttonCloseCategories]}
                                onPress={() => setModalVisible1(false)}
                            >
                                <Text style={{ color: 'white' }}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

            </View>

            <Menu></Menu>

            <SideMenuAnimated isOpen={isOpen}></SideMenuAnimated>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
    },
    textInput: {
        fontSize: 14,
        width: '100%',
        marginHorizontal: 5,
        textAlignVertical: 'top',
        maxHeight: 100,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20
    },
    update: {
        backgroundColor: '#4CAF50',
    },
    delete: {
        backgroundColor: '#f44336',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        alignItems: 'center',

    },
    accountButton: {
        marginTop: 10,
        alignItems: "center"
    },
    buttonText: {
        color: 'black',
        fontFamily: 'serif',
        fontSize: 16
    },
    cardRecord: {
        backgroundColor: "#fff",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        marginTop: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        padding: 10,
        elevation: 1,
    },
    icon: {
        color: "black"
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
    categoryItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    categoryText: {
        fontFamily: 'serif',
        fontSize: 14,
        marginLeft: 10,
        flex: 1,
    },
    selectedCategory: {
        backgroundColor: '#dbf0e3',
        borderColor: '#fff',
        borderWidth: 2,
    },
    buttonCloseCategories: {
        backgroundColor: '#16619a',
        justifyContent: 'center',
        alignItems: 'center',
    }
})