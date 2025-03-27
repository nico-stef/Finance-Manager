import React from 'react';
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { getUserData, updateUser } from '../APIs/profile';

function EditProfile() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
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

    //la fiecare useState set..() componenta care le contine se va modifica => ex: daca comp. contine si accessTokens si username se reradeaza de 2 ori
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
                setName(user.name);
                setPhone(user.phone);
            }
        };

        fetchDataAsync();

    }, [token, isLoggedIn])

    const handleUpdate = async (username, name, phone, token) =>{
        try{
            await updateUser(username, name, phone, token);
            Alert.alert('Success', 'User data updated sucessfully!');
        }catch(error){
            console.error("Eroare la user update:", error);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hello, {username}</Text>
            <Text style={styles.label}>Name: </Text>
            <TextInput
                style={styles.input}
                onChangeText={setName}
                value={name}
            />
            <Text style={styles.label}>Phone number: </Text>
            <TextInput
                style={styles.input}
                onChangeText={setPhone}
                value={phone}
                keyboardType="phone-pad"

            />
            <TouchableOpacity style={styles.button} onPress={() => handleUpdate(username, name, phone, token)}>
                <Text style={styles.text}>Save changes</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        marginBottom: 20,
        fontSize: 20,
        fontWeight: 'bold'
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#fff',
        width: '80%',
        height: 50,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#25a18e',
        paddingVertical: 12,
        borderRadius: 12,
        width: '50%',
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
});

export default EditProfile
