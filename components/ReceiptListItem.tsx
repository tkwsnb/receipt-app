import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Receipt } from '../services/database';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ReceiptListItemProps {
    item: Receipt;
    isSelected: boolean;
    onLongPress: (id: number) => void;
    onPress: (item: Receipt) => void;
}

export const ReceiptListItem = ({ item, isSelected, onLongPress, onPress }: ReceiptListItemProps) => (
    <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onLongPress={() => onLongPress(item.id)}
        onPress={() => onPress(item)}
        delayLongPress={300}
        activeOpacity={0.7}
    >
        <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
                <Text style={styles.date}>{item.date || '----/--/--'}</Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.store} numberOfLines={1}>{item.storeName || '店名不明'}</Text>
                <Text style={styles.amount}>¥{item.totalAmount?.toLocaleString() || '0'}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        padding: SPACING.m,
        ...SHADOWS.card,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: COLORS.primary,
        backgroundColor: '#EEF2FF', // Very light indigo
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    date: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    store: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        marginRight: SPACING.m,
    },
    amount: {
        fontSize: 20,
        fontWeight: '900', // Extra bold
        color: COLORS.primary,
    },
});
