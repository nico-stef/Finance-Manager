import React from 'react';
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import FloatingActionButton from '../components.js/FloatingActionButton';
import Menu from '../components.js/Menu';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { PieChart } from "react-native-gifted-charts";
import { getCategories, getAccounts } from '../APIs/moneyManagement';
import { MyModal } from '../components.js/myModal';

export default function Charts() {

    const data = [{ value: 50, tooltipText: 'Apple Sales' }, { value: 80 }, { value: 90 }, { value: 70 }]
    const [account, setAccount] = useState(''); //selected account
    const [accounts, setAccounts] = useState(''); //list of the accounts
    const [modalAccountVisible, setModalAccountVisible] = useState(false); //moddal account

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts(23);
                setAccounts(data);
            } catch (err) {
                console.error(err);
            }
        };


        if (modalAccountVisible) {
            fetchAccounts();
        }
    }, [modalAccountVisible]);

    const closeModal = () => setModalAccountVisible(false);

    const handleAccount = (item) => {
        setAccount(account);
        setModalAccountVisible(false);
    }

    return (
        <View style={styles.container}>

            <MyModal
                visible={modalAccountVisible}
                onClose={closeModal}
                title="Select Account"
                data={accounts}
                keyExtractor={(item) => item.idaccounts}
            />

            <View style={styles.box}>
                <View style={styles.optionsChart}>
                    <TouchableOpacity style={styles.optionsButton} onPress={() => setModalAccountVisible(true)}>
                        <Icon name="credit-card" size={20} color="white" style={styles.icon} />
                        <Text style={styles.buttonText}>Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionsButton} >
                        <Icon name="tags" size={20} color="white" style={styles.icon} />
                        <Text style={styles.buttonText}>Tags</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionsButton} >
                        <Icon name="clock" size={20} color="white" style={styles.icon} />
                        <Text style={styles.buttonText}>Period</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionsButton} >
                        <Icon name="calendar-alt" size={20} color="white" style={styles.icon} />
                        <Text style={styles.buttonText}>Date</Text>
                    </TouchableOpacity>
                </View>

                <View styles={{ marginTop: 50 }}>
                    <PieChart

                        data={data}
                        strokeColor='black'
                        strokeWidth={1}
                        focusOnPress={true}
                        showTooltip={true}
                    />
                </View>
            </View>


            {/* ----------------modal account-------------- */}
            {/* <Modal
                animationType="slide"
                transparent={true}
                visible={modalAccountVisible}
                onRequestClose={() => setModalAccountVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Select account</Text>

                        <FlatList
                            data={accounts}
                            keyExtractor={(item) => item.idaccounts}
                            renderItem={({ item }) => (
                                <Pressable style={[
                                    styles.categoryItem,
                                    account && account.idaccounts === item.idaccounts
                                        ? styles.selectedCategory
                                        : null,
                                    ]}
                                    onPress={() => handleAccount(item)}
                                     >
                                    <Text style={styles.categoryText}>{item.name}</Text>
                                </Pressable>
                            )}
                        />

                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalAccountVisible(false)}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal> */}




            <FloatingActionButton ></FloatingActionButton>
            <Menu></Menu>
        </View>
    )
}

const styles = StyleSheet.create({
    dropdownContainer: {
        marginTop: 20,
        width: '90%',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#CCE3DE',
    },
    optionsChart: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#21907F",
        paddingVertical: 10,
        borderRadius: 10,
    },
    optionsButton: {
        flex: 1,
        alignItems: "center",
    },
    box: {
        height: 300,
        width: '90%',
        marginTop: 30,
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontFamily: 'serif',
        marginStart: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },

    // ------------modal---------------
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
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    categoryText: {
        fontFamily: 'serif',
    },
    button: {
        width: '60%',
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
})