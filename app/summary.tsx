import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { getMonthlyTotals, MonthlyTotal } from '../services/database';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SummaryScreen() {
    const [data, setData] = useState<MonthlyTotal[]>([]);
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
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.month}>{item.month ? item.month.replace('/', '年 ') + '月' : '日付不明'}</Text>
                            <Text style={styles.count}>{item.count}件</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.cardBody}>
                            <Text style={styles.totalLabel}>合計</Text>
                            <Text style={styles.amount}>¥{item.total?.toLocaleString() || '0'}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>データがありません</Text>
                    </View>
                }
            />

            <TouchableOpacity onPress={() => router.back()} style={[styles.fab, { bottom: insets.bottom + 30 }]}>
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
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        padding: SPACING.l,
        ...SHADOWS.card,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
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
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.floating,
    },
});
