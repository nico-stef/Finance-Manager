import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { LogInScreen, SignInScreen, ProfileScreen, HomeScreen, SeeProfile, EditProfile } from './screens';
import { AddExpense, AddIncome, ManageBudgets, Charts, FinancialRecords } from './screens';
import HeaderPage from './components.js/HeaderPage'

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="FinancialRecords" component={FinancialRecords} options={{ headerShown: false }}/>
      <Stack.Screen name="HeaderPage" component={HeaderPage} options={{ headerShown: false }}/>
      
      <Stack.Screen name="Charts" component={Charts} options={{ headerShown: false }}/>
      
      <Stack.Screen name="Profile" component={ProfileScreen}/>
      <Stack.Screen name="LogIn" component={LogInScreen}/>
      <Stack.Screen name="SignIn" component={SignInScreen}/>
      <Stack.Screen name="User Data" component={SeeProfile}/>
      <Stack.Screen name="Edit Profile" component={EditProfile}/>
      <Stack.Screen name="Home" component={HomeScreen}/>
      <Stack.Screen name="Add expense" component={AddExpense}/>
      <Stack.Screen name="Add income" component={AddIncome}/>
      <Stack.Screen name="Manage budgets" component={ManageBudgets}/>
      
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App