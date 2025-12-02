import { StyleSheet, View } from 'react-native';
import ReceiptCamera from '../components/ReceiptCamera';
import { useFab } from '../contexts/FabContext';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function HomeScreen() {
    const { setFabConfig } = useFab();

    useFocusEffect(
        useCallback(() => {
            setFabConfig({ isVisible: false, showCamera: false, showSecondary: false });
        }, [setFabConfig])
    );

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
