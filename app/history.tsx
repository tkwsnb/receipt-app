import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useState, useCallback } from 'react';
import { db, receipts, Receipt } from '../services/database';
import { desc, inArray } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons'; // Assuming expo vector icons is available
import { ReceiptListItem } from '../components/ReceiptListItem';

export default function HistoryScreen() {
    const [data, setData] = useState<Receipt[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const insets = useSafeAreaInsets();
    const router = useRouter();

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

    const handlePress = (item: Receipt) => {
        if (isSelectionMode) {
            toggleSelection(item.id);
        } else {
            router.push({
                pathname: '/confirm',
                params: {
                    id: item.id,
                    imageUri: item.imageUri,
                    storeName: item.storeName,
                    date: item.date,
                    totalAmount: item.totalAmount?.toString(),
                    rawText: item.rawText
                }
            });
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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.headerTitle}>履歴一覧</Text>
                    <Text style={styles.headerSubtitle}>{data.length} 件のレシート</Text>
                </View>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <ReceiptListItem
                        item={item}
                        isSelected={selectedIds.includes(item.id)}
                        onLongPress={handleLongPress}
                        onPress={handlePress}
                    />
                )}
            />

            {/* Floating Action Buttons */}
            <View style={[styles.fabContainer, { paddingBottom: insets.bottom + SPACING.m }]}>
                {isSelectionMode ? (
                    <TouchableOpacity style={[styles.fab, styles.deleteFab]} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={24} color="white" />
                        <Text style={styles.fabText}>削除 ({selectedIds.length})</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.fab, styles.cameraFab]} onPress={() => router.dismissTo('/')}>
                        <Ionicons name="camera" size={28} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {!isSelectionMode && (
                <TouchableOpacity onPress={() => router.push('/summary')} style={[styles.summaryFab, { bottom: insets.bottom + 30 }]}>
                    <Ionicons name="stats-chart" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
    },
    listContent: {
        paddingHorizontal: SPACING.m,
        paddingBottom: 100,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        pointerEvents: 'box-none',
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.full,
        ...SHADOWS.floating,
    },
    cameraFab: {
        backgroundColor: COLORS.primary,
        width: 64,
        height: 64,
    },
    deleteFab: {
        backgroundColor: COLORS.danger,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
    },
    fabText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: SPACING.s,
    },
    summaryFab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary, // Using primary for consistency, or maybe a different shade
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.floating,
    },
});
