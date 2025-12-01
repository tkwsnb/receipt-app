import { StyleSheet, View } from 'react-native';
import ReceiptCamera from '../components/ReceiptCamera';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <ReceiptCamera />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
