import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { db, receipts, Receipt } from '../services/database';
import { desc } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function HistoryScreen() {
    const [data, setData] = useState<Receipt[]>([]);

    const loadData = async () => {
        try {
            const result = await db.select().from(receipts).orderBy(desc(receipts.createdAt));
            setData(result);
        } catch (error) {
            console.error("Failed to load receipts", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Receipt History</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.store}>{item.storeName || 'Unknown Store'}</Text>
                        <Text style={styles.date}>{item.date || 'No Date'}</Text>
                        <Text style={styles.amount}>¥{item.totalAmount?.toLocaleString() || '0'}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    store: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginRight: 10,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
