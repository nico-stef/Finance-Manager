import React from 'react';
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from '@react-navigation/native';
import { getCategories, getAccounts, getTags, addTag, deleteTags, addExpense, getBudgets } from '../APIs/moneyManagement';
import { getUserData } from '../APIs/profile';
import { Dropdown } from 'react-native-element-dropdown';
import Menu from '../components.js/Menu';
import SideMenuAnimated from '../components.js/SideMenuAnimated';
import Header from '../components.js/Header';

export default function AddExpense() {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [account, setAccount] = useState('');
    const [addedTag, setAddedTag] = useState(''); //tag to add
    const [selectedTags, setSelectedTags] = useState([]); //tags that are selected
    const [budget, setBudget] = useState('');
    const [note, setNote] = useState('');
    const [budgetOptions, setBudgetOptions] = useState([]);
    const [date, setDate] = useState(new Date());
    const [datePicker, setDatePicker] = useState(false);
    const [modalVisible1, setModalVisible1] = useState(false); //category
    const [modalVisible2, setModalVisible2] = useState(false); //account
    const [modalVisible3, setModalVisible3] = useState(false); //tags
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(true);
    const [token, setAccessToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const navigation = useNavigation();
    const [isOpen, setIsOpen] = useState(true);

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

    useEffect(() => {
        const getBudgetsAsync = async () => {
            const response = await getBudgets(user.id);
            setBudgetOptions(response);
        };

        if (user?.id) {
            getBudgetsAsync();
        }
    }, [user?.id]);


    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts(user.id);
                setAccounts(data);
            } catch (err) {
                setError("There was an error fetching categories.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const fetchTags = async () => {
            try {
                const data = await getTags(user.id);
                setTags(data);
            } catch (err) {
                setError("There was an error fetching tags.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (modalVisible2) {
            fetchAccounts();
        }
        if (modalVisible3) {
            fetchTags();
        }
    }, [modalVisible2, user, modalVisible3, tags]);

    const handleCategory = (category) => {
        setCategory(category);
    }

    const handleAccount = (account) => {
        setAccount(account);
    }

    const handleDateChange = (event, selectedDate) => {
        if (event.type === "set") {
            const currentDate = selectedDate;
            setDate(currentDate);
        }
        setDatePicker(false);
    }

    const handleSelectedTags = (tag) => {
        setSelectedTags(prevTags => {
            if (prevTags.find(t => t.idtags === tag.idtags)) { //daca tag era deja selectat il deselectam
                return prevTags.filter(t => t.idtags !== tag.idtags);
            }
            return [...prevTags, tag]; //daca nu era selectat il adaugam in array
        });
    };

    const handleAddTag = async (userId, tag) => {
        try {
            if (!tag)
                Alert.alert('Warning', "You haven't typed any tag");
            await addTag(userId, tag);
            setAddedTag('');
            await getTags(userId);
        } catch (err) {
            console.log(err);
        }
    }

    const handleDeleteTags = async () => {
        const ids = selectedTags.map(item => item.idtags);

        await deleteTags(user.id, ids);
        await getTags(user.id);

        const taguri = selectedTags.filter(item => !ids.includes(item.idtags)); //daca stergem tagurile din baza de dare, sa nu mai apara nici la selected tags
        setSelectedTags(taguri)
    }

    const handleAddExpense = async () => {
        const tagIds = selectedTags.map(item => item.idtags);
        if (!amount || !category || !account)
            Alert.alert("Warning", "You need to complete the necessary fields!");
        else {
            const response = await addExpense(user.id, tagIds, amount, date, category.idcategories, account.idaccounts, note, budget.idBudget);   
            if (response.status === 200) {
                
                Alert.alert("Success", "Expense added successfully!");
                setAmount('');
                setAccount('');
                setCategory('');
                setBudget('');
                setNote('');
            }
        }
    }

    const frequencyOptions = [
        { label: 'daily', value: '1' },
        { label: 'weekly', value: '2' },
        { label: 'monthly', value: '3' },
        { label: 'yearly', value: '4' },
    ];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Header title="New Expense" icon="money-bill-wave" toggleMenu={toggleMenu}></Header>
                        <View style={styles.container}>
                            {/* ----------------pick the amount------------------- */}
                            <Text style={styles.label}>Amount: </Text>
                            <TextInput style={[styles.input, { backgroundColor: 'white' }]} onChangeText={setAmount} value={amount} placeholder="type your amount" keyboardType="numeric" />

                            {/* -------------picking the date----------------- */}
                            <View style={styles.row}>
                                <Text style={styles.label}>Date: </Text>
                                <TextInput style={[styles.input, { borderWidth: 0, fontSize: 16 }]} value={date ? date.toLocaleDateString() : ""} editable={false} />
                            </View>
                            <Pressable
                                style={[styles.button, styles.buttonOpen]}
                                onPress={() => setDatePicker(true)}
                            >
                                <Text style={styles.textStyle}>change date</Text>
                            </Pressable>
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


                            {/* ---------------pick the category------------- */}
                            <View style={styles.row}>
                                <Text style={styles.label}>Category: </Text>
                                <TextInput style={[styles.input, { borderWidth: 0, fontSize: 16 }]} value={category.category} editable={false} />
                            </View>
                            <Pressable
                                style={[styles.button, styles.buttonOpen]}
                                onPress={() => setModalVisible1(true)}>
                                <Text style={styles.textStyle}>choose category</Text>
                            </Pressable>

                            {/* ---------------pick the account------------- */}
                            <View style={styles.row}>
                                <Text style={styles.label}>Account: </Text>
                                <TextInput style={[styles.input, { borderWidth: 0, fontSize: 16 }]} value={account.name} editable={false} />
                            </View>
                            <Pressable
                                style={[styles.button, styles.buttonOpen]}
                                onPress={() => setModalVisible2(true)}>
                                <Text style={styles.textStyle}>choose account</Text>
                            </Pressable>

                            {/* ---------------pick the budget------------- */}
                            <Text style={[styles.label, { paddingTop: 10 }]}>Budget: </Text>
                            <Dropdown
                                data={budgetOptions}
                                containerStyle={styles.dropdownContainer}
                                selectedTextStyle={[styles.input, { borderWidth: 0, fontSize: 16, marginStart: 20 }]}
                                placeholderStyle={{ marginStart: 20, paddingVertical: 10 }}
                                placeholder='select budget...'
                                maxHeight={200}
                                labelField="label"
                                valueField="value"
                                value={budget.label}
                                onChange={item => {
                                    setBudget(item);
                                }}
                            />

                            {/* ---------------pick the tags------------- */}
                            {/* <View style={styles.row}>
                            <Text style={styles.label}>Tags: </Text>
                            <TextInput style={[{ borderWidth: 0, fontSize: 14, fontFamily: 'serif' }]} multiline={true} numberOfLines={5}
                                value={selectedTags.map(tag => tag.name).join(', ')} editable={false} />
                        </View>
                        <Pressable
                            style={[styles.button, styles.buttonOpen]}
                            onPress={() => setModalVisible3(true)}>
                            <Text style={styles.textStyle}>select tags</Text>
                        </Pressable> */}

                            {/* ---------------pick the note------------- */}
                            <Text style={styles.label}>Note: </Text>
                            <TextInput style={[styles.input, { backgroundColor: 'white' }]} onChangeText={setNote} value={note} placeholder="write a note" />

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

                                        {loading ? (
                                            <Text>Loading...</Text>
                                        ) : (
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
                                        )}

                                        <Pressable
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={() => setModalVisible1(false)}
                                        >
                                            <Text style={styles.textStyle}>Close</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Modal>


                            {/* ----------------modal account-------------- */}
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalVisible2}
                                onRequestClose={() => setModalVisible2(false)}
                            >
                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <Text style={styles.modalTitle}>Select account</Text>

                                        {loading ? (
                                            <Text>Loading...</Text>
                                        ) : (
                                            <FlatList
                                                data={accounts}
                                                keyExtractor={(item) => item.idaccounts}
                                                numColumns={2}
                                                renderItem={({ item }) => (
                                                    <Pressable style={[
                                                        styles.categoryItem,
                                                        account && account.idaccounts === item.idaccounts
                                                            ? styles.selectedCategory
                                                            : null,
                                                    ]}
                                                        onPress={() => handleAccount(item)} >
                                                        <Text style={styles.categoryText}>{item.name}</Text>
                                                    </Pressable>
                                                )}
                                            />
                                        )}

                                        <Pressable
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={() => setModalVisible2(false)}
                                        >
                                            <Text style={styles.textStyle}>Close</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Modal>

                            {/* ---------------modal tags-------------------- */}
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalVisible3}
                                onRequestClose={() => setModalVisible3(false)}
                            >
                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <Text style={styles.modalTitle}>Select tags</Text>
                                        <Text style={{ textAlign: "center", fontSize: 16 }}>Select or unselect tags by tapping on them! </Text>

                                        {loading ? (
                                            <Text>Loading...</Text>
                                        ) : (
                                            <FlatList
                                                data={[...tags, { idtags: 'add', name: '' }]}
                                                keyExtractor={(item) => item.idtags}
                                                numColumns={2}
                                                renderItem={({ item }) => (
                                                    item.idtags !== 'add' ? (
                                                        <Pressable style={[
                                                            styles.categoryItem,
                                                            selectedTags.some(t => t.idtags === item.idtags)
                                                                ? styles.selectedCategory
                                                                : null,
                                                        ]}
                                                            onPress={() => handleSelectedTags(item)} >
                                                            <Text style={styles.categoryText}>{item.name}</Text>
                                                        </Pressable>
                                                    ) : (
                                                        <Pressable style={styles.categoryItem} >
                                                            <TextInput onChangeText={setAddedTag} value={addedTag} placeholder='add a tag..'></TextInput>
                                                        </Pressable>
                                                    )
                                                )}
                                            />
                                        )}

                                        <View style={styles.incomeButtonsView}>
                                            <Pressable
                                                style={[styles.buttonIncome, { backgroundColor: '#4CAF50' }]}
                                                onPress={() => handleAddTag(user.id, addedTag)}>
                                                <Text style={styles.textStyle}>create new tag</Text>
                                            </Pressable>
                                            <Pressable
                                                style={[styles.buttonIncome, { backgroundColor: '#E74C3C' }]}
                                                onPress={() => handleDeleteTags()}>
                                                <Text style={styles.textStyle}>delete selected tags</Text>
                                            </Pressable>
                                        </View>

                                        <Pressable
                                            style={[styles.button, styles.buttonClose]}
                                            onPress={() => setModalVisible3(false)}
                                        >
                                            <Text style={styles.textStyle}>Close</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Modal>

                            <Pressable
                                style={[styles.button, styles.buttonClose, { marginTop: 20 }]}
                                onPress={() => handleAddExpense()}
                                android_ripple={{ color: 'white' }}
                            >
                                <Text style={styles.textStyle}>add expense</Text>
                            </Pressable>

                        </View>
                        <Menu></Menu>

                        <SideMenuAnimated isOpen={isOpen}></SideMenuAnimated>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#CCE3DE',
        flex: 1,
        paddingTop: 20
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
    dropdownContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'black',
        width: '70%',
        maxHeight: 200,
        elevation: 5,
        alignSelf: 'center',
        paddingTop: 20
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
        width: '80%',
        alignSelf: 'center',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonClose: {
        backgroundColor: '#16619a',
        paddingBottom: 10
    },
    buttonOpen: {
        backgroundColor: '#25a18e',
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
});
