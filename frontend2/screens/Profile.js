import React from 'react';
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { getUserData, deleteUser } from '../APIs/profile';
import { logout } from '../APIs/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { actions } from "../variables"
import FloatingActionButton from '../components.js/FloatingActionButton';
import Menu from '../components.js/Menu'
import SideMenuAnimated from '../components.js/SideMenuAnimated';
import Header from '../components.js/Header';

export default function ProfileScreen() {

    const [token, setAccessToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const navigation = useNavigation();
    const actionsFAB = actions;
    const [isOpen, setIsOpen] = useState(true);

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
                await AsyncStorage.removeItem('accessToken');
                navigation.navigate('LogIn');
                return;
            }

            const currentTime = Date.now() / 1000; //timpul curent în secunde
            if (user.exp < currentTime) {
                console.log('Token-ul a expirat!');
                setIsLoggedIn(false);
                await AsyncStorage.removeItem('accessToken');
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

    const handleLogout = async (username) => {
        try {
            await logout(username);
            await AsyncStorage.removeItem('accessToken');
            navigation.navigate('LogIn');
        } catch (err) {
            console.error("Eroare handleLogout", err.message);
        }
    }

    const deleteAccountAlert = () =>
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account?',
            [
                {
                    text: 'no, go back',
                    style: 'cancel',
                },
                {
                    text: 'yes',
                    onPress: () => handleDeleteAccount(username, token),
                },
            ]
        );

    const handleDeleteAccount = async (username, accessToken) => {
        try {
            await deleteUser(username, accessToken);
            Alert.alert('Succes', 'Your account has been successfully deleted!');
            navigation.navigate('LogIn');
        } catch (err) {
            console.error("Eroare handleDeleteAccount", err.message);
        }
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <Header title="Profile" icon="user" toggleMenu={toggleMenu}></Header>
            <View style={styles.container}>
                
                    <>
                    
                        <View style={styles.formContainer}>
                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("User Data")}>
                                <Icon name="user" size={20} color="white" style={styles.icon} />
                                <Text style={styles.text}>See Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Edit Profile")}>
                                <Icon name="edit" size={20} color="white" style={styles.icon} />
                                <Text style={styles.text}>Edit Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SeeAccounts")}>
                                <Icon name="credit-card" size={20} color="white" style={styles.icon} />
                                <Text style={styles.text}>Your Money Accounts</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={() => handleLogout(username)}>
                                <Icon name="sign-out-alt" size={20} color="white" style={styles.icon} />
                                <Text style={styles.text}>Log Out</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, { backgroundColor: '#B22222' }]} onPress={deleteAccountAlert}>
                                <Icon name="user" size={20} color="white" style={styles.icon} />
                                <Text style={styles.text}>Delete Account</Text>
                            </TouchableOpacity>

                            <FloatingActionButton ></FloatingActionButton>

                            <Menu></Menu>
                        </View>
                    </>
                
            </View>
             <SideMenuAnimated isOpen={isOpen}></SideMenuAnimated>
        </SafeAreaView>


    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#CCE3DE',
        paddingTop: 50,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: -100
    },
    title: {
        fontSize: 30,
        fontFamily: 'serif',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#25a18e',
        paddingVertical: 12,
        borderRadius: 12,
        width: '85%',
        alignItems: 'center',
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    icon: {
        marginEnd: 5
    },
});