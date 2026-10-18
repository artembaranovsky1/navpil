import {StyleSheet, Text, View} from 'react-native';

export default function NewExpenseScreen() {


    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>NewExpense</Text>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    baseText: {
        fontFamily: 'Cochin',
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
});