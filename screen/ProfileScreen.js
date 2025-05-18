import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const screenWidth=Dimensions.get('window').width;
export default function ProfileScreen({ navigation }) {
    return (
    <View style={styles.container}>
        
        <View style={styles.myaccountcontainer}>
        <View style={styles.rowcontainer}>
            <Text style={styles.title}>My Account</Text>
            <Image source={require('../assets/littleplane.png')} style={styles.littleplane} />
        </View>
        //це потрібно зробити так щоб вивести інформацію про користувача або щось типу того
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#94D2FF" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#94D2FF" />

        
        </View>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
    </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center' },
    myaccountcontainer:{ flex: 1, backgroundColor: '#0077B6', alignItems: 'center', paddingTop: 60 , borderRadius:40, width:screenWidth},
    welcome: { fontSize: 20, fontFamily:'Poppins-Bold', color: '#0077B6', marginBottom: 20, marginTop: 5},
    logo: { width: 250, height: 200, marginBottom: 10 },
    rowcontainer:{flexDirection:'row'},
    title: { fontFamily:'Poppins-Bold',fontSize: 30,fontWeight: 'bold',color: '#FFFFFF',marginBottom: 20,fontFamily: 'Poppins-Bold',alignSelf: 'flex-start',marginRight: 10, marginLeft:10,            
    },
    littleplane:{width:80,height:80,paddingBottom:30, alignSelf: 'flex-end',marginLeft:50},
    input: { width: '80%', backgroundColor: '#E0F7FF', padding: 10, marginVertical: 10, borderRadius: 10 },
    button: {  padding: 10, width: '40%', borderRadius: 20, marginTop: 20, borderColor:'#FFFFFF' , borderWidth: 2},
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    footerText: { marginTop: 20, color: '#FFFFFF' }
});
