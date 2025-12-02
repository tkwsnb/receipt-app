import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { getMonthlyTotals, MonthlyTotal, getReceiptsByMonth, Receipt } from '../services/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ReceiptListItem } from '../components/ReceiptListItem';

export default function SummaryScreen() {
    const [data, setData] = useState<MonthlyTotal[]>([]);
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [monthData, setMonthData] = useState<Record<string, Receipt[]>>({});
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const loadData = () => {
        try {
            const result = getMonthlyTotals();
            setData(result);
        } catch (error) {
            console.error("Failed to load summary", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const toggleMonth = async (month: string) => {
        if (expandedMonth === month) {
            setExpandedMonth(null);
        } else {
            setExpandedMonth(month);
            if (!monthData[month]) {
                try {
                    const receipts = await getReceiptsByMonth(month);
                    setMonthData(prev => ({ ...prev, [month]: receipts }));
                } catch (error) {
                    console.error("Failed to load month receipts", error);
                }
            }
        }
    };

    const handlePressReceipt = (item: Receipt) => {
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
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>月別集計</Text>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.month || 'unknown'}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const monthKey = item.month || 'unknown';
                    const isExpanded = expandedMonth === monthKey;

                    return (
                        <View style={styles.cardContainer}>
                            <TouchableOpacity
                                style={[styles.card, isExpanded && styles.cardExpanded]}
                                onPress={() => toggleMonth(monthKey)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.month}>{item.month ? item.month.replace('/', '年 ') + '月' : '日付不明'}</Text>
                                    <View style={styles.headerRight}>
                                        <Text style={styles.count}>{item.count}件</Text>
                                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textLight} style={{ marginLeft: 8 }} />
                                    </View>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.cardBody}>
                                    <Text style={styles.totalLabel}>合計</Text>
                                    <Text style={styles.amount}>¥{item.total?.toLocaleString() || '0'}</Text>
                                </View>
                            </TouchableOpacity>

                            {isExpanded && monthData[monthKey] && (
                                <View style={styles.expandedContent}>
                                    {monthData[monthKey].map(receipt => (
                                        <ReceiptListItem
                                            key={receipt.id}
                                            item={receipt}
                                            isSelected={false}
                                            onLongPress={() => { }}
                                            onPress={handlePressReceipt}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>データがありません</Text>
                    </View>
                }
            />

            {/* FABs */}
            <View style={[styles.fabContainer, { paddingBottom: insets.bottom + SPACING.m }]}>
                <TouchableOpacity onPress={() => router.dismissTo('/')} style={[styles.fab, styles.cameraFab]}>
                    <Ionicons name="camera" size={28} color="white" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.back()} style={[styles.listFab, { bottom: insets.bottom + 30 }]}>
                <Ionicons name="list" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.background,
    },
    backButton: {
        marginRight: SPACING.m,
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    listContent: {
        padding: SPACING.m,
        paddingBottom: 120, // Extra padding for FABs
    },
    cardContainer: {
        marginBottom: SPACING.m,
        ...SHADOWS.card,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        overflow: 'hidden', // For rounded corners with expanded content
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.l,
    },
    cardExpanded: {
        backgroundColor: '#F8F9FA', // Slightly different bg when expanded
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    month: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    count: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: SPACING.s,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    amount: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.primary,
    },
    expandedContent: {
        backgroundColor: COLORS.background, // Or a light gray
        padding: SPACING.m,
        paddingTop: 0,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 16,
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
    listFab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.floating,
    },
});
