import React from 'react';
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView, StatusBar } from 'react-native';
import { Dimensions, useAnimatedValue } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Menu from '../components.js/Menu';

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export default function HeaderPage() {
    const [selectedTab, setSelectedTab] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const translateX = useAnimatedValue(-screenWidth * 0.7); //initial ascuns

    const toggleMenu = () => {
        Animated.timing(translateX, { // creeaza o animatie de tip timing, adica o tranzitie fluida într-un anumit timp
            // translateX este valoarea animată care se va modifica
            toValue: isOpen ? -screenWidth * 0.7 : 0, //daca e deschis il ascundem
            duration: 400, //timpul miscarii pe axa X
            useNativeDriver: true,
        }).start();
        setIsOpen(!isOpen); // Inversăm starea
    };

    const handleTabPress = (index) => {
        setSelectedTab(index);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <View >
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Icon name="bars" color="white" size={24}></Icon>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.text}>Records </Text>
                        <Icon name="scroll" size={24} color="white" />
                    </View>
                    <Text></Text>
                </View>

                <View style={styles.pieOption}>
                    <TouchableOpacity style={[styles.pieOptionsButton, { backgroundColor: selectedTab === 1 ? "white" : "#166055" }]} onPress={() => handleTabPress(1)}>
                        <Icon name="wallet" size={18} color={selectedTab === 1 ? 'black' : 'white'} style={styles.icon} />
                        <Text style={{ color: selectedTab === 1 ? 'black' : 'white' }}>view expenses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.pieOptionsButton, { backgroundColor: selectedTab === 2 ? "white" : "#166055" }]} onPress={() => handleTabPress(2)}>
                        <Icon name="hand-holding-usd" size={18} color={selectedTab === 2 ? 'black' : 'white'} style={styles.icon} />
                        <Text style={{ color: selectedTab === 2 ? 'black' : 'white' }}>view income</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Menu></Menu>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#166055',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: screenHeight * 0.07,
    },
    text: {
        color: "white",
        fontSize: 24
    },
    pieOption: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#166055",
        paddingVertical: 5,
        marginBottom: 5,
    },
    pieOptionsButton: {
        flex: 1,
        alignItems: "center",
        borderRadius: 20,
        marginHorizontal: 5,
        paddingVertical: 2,

    },
    optionsButton: {
        flex: 1,
        alignItems: "center"
    },
})