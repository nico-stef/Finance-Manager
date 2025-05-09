import React from 'react';
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, StatusBar, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Menu from '../components.js/Menu'
import SideMenuAnimated from '../components.js/SideMenuAnimated';
import Header from '../components.js/Header';
import { getAccounts } from '../APIs/moneyManagement';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { MyModal } from '../components.js/myModal';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../variables.js';

function UploadTransactions() {
    const [isOpen, setIsOpen] = useState(true);
    const [account, setAccount] = useState('');
    const [accounts, setAccounts] = useState('');
    const [modalAccount, setModalAccount] = useState(false); //account
    const [userId, setUserId] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState('');

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const uploadDocument = async () => {
        const fileToUpload = new FormData();

        if(!account){
            Alert.alert("", "Select an account!");
            return;
        }

        if(!selectedDocument){
            Alert.alert("", "Select a document!");
            return;
        }

        fileToUpload.append('file', {
            uri: selectedDocument.uri,
            name: selectedDocument.name,
            type: selectedDocument.mimeType || 'application/octet-stream',
        });
        fileToUpload.append('account_id', account.idaccounts);

        try {
            const response = await fetch(`${API_URL}/tranzactiiExtras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: fileToUpload
            });

            if (response.ok) {
                console.log("Upload successful",);
                Alert.alert("Success", "Data uploaded successfully from bank statement!");
              } else {
                const errorData = await response.json();
                console.log("Upload failed:", errorData);
                Alert.alert("Failed", "File could not be processed. Try another one!");
              }
        } catch (error) {
            console.log("Upload failed:", error);
        }
    };


    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: false, // Allows the user to select any file 
            });

            if (!result.canceled) {
                const successResult = result.assets[0];
                console.log("fisier nume : ", successResult, successResult.name)

                setSelectedDocument(successResult);
                // await uploadDocument(successResult);

            } else {
                console.log("Document selection cancelled.");
            }
        } catch (error) {
            console.log("Error picking documents:", error);
        }
    };

    const getUserId = async () => {
        try {
            //get access token from async storage
            const accessToken = await AsyncStorage.getItem('accessToken');

            //get info that comes with the access token, in my case the object user who has name
            const user = jwtDecode(accessToken);
            setUserId(user.userid);

        } catch (error) {
            console.error("Eroare la recuperarea token-ului:", error);
        }
    };

    useEffect(() => {
        getUserId();
    }, []);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts(userId);
                if (data === 'error') {
                    navigation.navigate('LogIn');
                    return;
                }
                setAccounts(data);
            } catch (err) {
                setError("There was an error fetching categories.");
                console.error(err);
            }
        };

        if (modalAccount && userId) {
            fetchAccounts();
        }
    }, [modalAccount]);

    useEffect(() => {
        console.log("conturi: ", accounts)
    }, [accounts]);

    const closeModal = (setModalVisibile) => {
        return () => { //functia fara return ar fi fost apelata imediat
            setModalVisibile(false);
        };
    };

    const handleAccount = (account) => {
        setAccount(account);
        setModalAccount(false);
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <View style={{ flex: 1 }}>
                <Header title="Import Transactions" icon="university" toggleMenu={toggleMenu}></Header>

                <View style={{ flex: 1, paddingTop: 50, backgroundColor: '#E8F5F2', }}>

                    {/* ---------------pick the account------------- */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Account: </Text>
                        <TextInput style={[styles.input, { borderWidth: 0, fontSize: 16 }]} value={account.name} editable={false} />
                    </View>
                    <Pressable
                        style={[styles.button, styles.buttonOpen]}
                        onPress={() => setModalAccount(true)}>
                        <Text style={styles.textStyle}>choose account</Text>
                    </Pressable>

                    {/* --------modal pentru accounts------------- */}
                    <MyModal
                        visible={modalAccount} onClose={closeModal(setModalAccount)} title="Select the account"
                        data={accounts} keyExtractor={(item) => item.idaccounts} onItemPress={handleAccount} nrCol={2}
                    />

                    <TouchableOpacity title="Pick Document">
                        <Text style={[styles.label, { marginTop: 20 }]}>Upload a file</Text>
                    </TouchableOpacity>



                    <TouchableOpacity style={styles.documentUpload} onPress={pickDocument}>
                        <View style={{ alignItems: 'center' }}>
                            <Icon name="file-alt" size={30}></Icon>
                            {selectedDocument ? (
                                <Text style={[styles.input, { borderWidth: 0, fontSize: 16 }]}>Selected: {selectedDocument.name}</Text>
                            ) : (<Text style={{ fontSize: 16 }}>Select an xlsx file...</Text>)}

                        </View>
                    </TouchableOpacity>

                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={uploadDocument}>
                        <Text style={styles.textStyle}>upload transactions from file</Text>
                    </Pressable>


                </View>

            </View>

            <Menu></Menu>

            <SideMenuAnimated isOpen={isOpen}></SideMenuAnimated>
        </SafeAreaView>
    )
}

export default UploadTransactions

const styles = StyleSheet.create({
    documentUpload: {
        backgroundColor: '#f0f0f0',
        height: '30%',
        width: '80%',
        alignSelf: 'center',
        borderRadius: 15,
        borderStyle: 'dashed',
        borderColor: 'black',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
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
    buttonOpen: {
        backgroundColor: '#25a18e',
    },
    buttonClose: {
        backgroundColor: '#16619a',
        marginTop: 50
    },
    textStyle: {
        fontFamily: 'serif',
        fontSize: 16,
        textAlign: "center",
        color: "white"
    },
});