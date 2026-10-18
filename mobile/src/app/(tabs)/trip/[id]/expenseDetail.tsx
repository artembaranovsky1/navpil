import {StyleSheet, Text, View} from 'react-native';

export default function ExpenseDetailScreen() {


    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>ExpenseDetail</Text>
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