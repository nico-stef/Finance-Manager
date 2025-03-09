import React from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text>MIAU</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Text> Go to Profile </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CCE3DE'
    }
});