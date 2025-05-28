import React from 'react';
import { API_URL } from '../variables.js';
import { useState, useEffect } from "react";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Menu from '../components.js/Menu';
import SideMenuAnimated from '../components.js/SideMenuAnimated';
import Header from '../components.js/Header';

export default function AdvicesPage() {
    const [paragraphs, setParagraphs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                const response = await fetch(`${API_URL}/getAdvices`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                const text = await response.text();
                await AsyncStorage.setItem('advices', text);

                // const text = await AsyncStorage.getItem('advices');
                // Decodăm backslash-urile dublu-escapate și ghilimelele escape
                const decodedText = text.replace(/\\\\/g, '\\').replace(/\\"/g, '"');

                const tempText = decodedText.replace(/\\n\\n/g, '||PARA||');
                const cleanedText = tempText.replace(/\\n/g, ' ').trim();
                const paragraphs = cleanedText.split('||PARA||').map(p => p.trim());
                const paragraphsWithList = paragraphs.map(p => p.replace(/\s*\*/g, '\n*').trim());
                setParagraphs(paragraphsWithList);






            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    useEffect(() => {
        console.log("data primita ", paragraphs)
    }, [paragraphs]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4e9bde" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <View style={{ flex: 1, marginBottom: 30 }}>
                <Header title="Personalised Advices" toggleMenu={toggleMenu}></Header>

                <ScrollView contentContainerStyle={styles.container}>
                    {paragraphs.map((para, index) => (
                        <Text key={index} style={styles.paragraph}>
                            {para}
                        </Text>
                    ))}
                </ScrollView>

            </View>

            <Menu></Menu>

            <SideMenuAnimated isOpen={isOpen}></SideMenuAnimated>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f9f9f9',
        flexGrow: 1,
    },
    paragraph: {
        marginBottom: 20,
        fontSize: 18,
        lineHeight: 28,
        color: '#333',
        fontWeight: '400',
        fontFamily: 'System',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
});
