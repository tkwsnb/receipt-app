import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { db, receipts, Receipt } from '../services/database';
import { desc, inArray } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
    const [data, setData] = useState<Receipt[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const insets = useSafeAreaInsets();

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
            const onBackPress = () => {
                if (isSelectionMode) {
                    setIsSelectionMode(false);
                    setSelectedIds([]);
                    return true;
                }
                return false;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, [isSelectionMode])
    );

    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            const newIds = selectedIds.filter(item => item !== id);
            setSelectedIds(newIds);
            if (newIds.length === 0) {
                setIsSelectionMode(false);
            }
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleLongPress = (id: number) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedIds([id]);
        }
    };

    const handlePress = (id: number) => {
        if (isSelectionMode) {
            toggleSelection(id);
        } else {
            // Future: Navigate to detail view
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "削除の確認",
            `${selectedIds.length}件のレシートを削除しますか？`,
            [
                { text: "キャンセル", style: "cancel" },
                {
                    text: "削除",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await db.delete(receipts).where(inArray(receipts.id, selectedIds));
                            await loadData();
                            setIsSelectionMode(false);
                            setSelectedIds([]);
                        } catch (error) {
                            console.error("Failed to delete receipts", error);
                            Alert.alert("エラー", "削除に失敗しました");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>履歴一覧</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <TouchableOpacity
                            style={[styles.item, isSelected && styles.selectedItem]}
                            onLongPress={() => handleLongPress(item.id)}
                            onPress={() => handlePress(item.id)}
                            delayLongPress={300}
                        >
                            <Text style={styles.store}>{item.storeName || 'Unknown Store'}</Text>
                            <Text style={styles.date}>{item.date || 'No Date'}</Text>
                            <Text style={styles.amount}>¥{item.totalAmount?.toLocaleString() || '0'}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
            {isSelectionMode && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>🗑️ 削除 ({selectedIds.length})</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        marginTop: 20,
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedItem: {
        backgroundColor: '#e3f2fd',
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'flex-end', // Right aligned
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
