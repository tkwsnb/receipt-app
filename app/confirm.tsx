import { View, Text, TextInput, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { db, receipts } from '../services/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFab } from '../contexts/FabContext';

export default function ConfirmScreen() {
    const { setFabConfig } = useFab();
    const params = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            setFabConfig({ isVisible: false, showCamera: false, showSecondary: false });
        }, [setFabConfig])
    );

    const imageUri = params.imageUri as string;
    const [storeName, setStoreName] = useState(params.storeName as string || '');
    const [date, setDate] = useState(params.date as string || '');
    const [totalAmount, setTotalAmount] = useState(params.totalAmount as string || '');

    const rawText = params.rawText as string || '';
    const id = params.id ? Number(params.id) : null;

    const handleSave = async () => {
        try {
            const amount = parseInt(totalAmount.replace(/[^0-9]/g, ''), 10);

            if (id) {
                await db.update(receipts).set({
                    storeName,
                    date,
                    totalAmount: isNaN(amount) ? 0 : amount,
                }).where(eq(receipts.id, id));

                Alert.alert("更新完了", "レシートを更新しました", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                await db.insert(receipts).values({
                    storeName,
                    date,
                    totalAmount: isNaN(amount) ? 0 : amount,
                    rawText,
                    imageUri,
                });

                Alert.alert("保存完了", "レシートを保存しました", [
                    { text: "OK", onPress: () => router.dismissTo('/') }
                ]);
            }
        } catch (error) {
            console.error("Failed to save receipt", error);
            Alert.alert("エラー", "保存に失敗しました");
        }
    };

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateObject, setDateObject] = useState(() => {
        const d = new Date(params.date as string || Date.now());
        return isNaN(d.getTime()) ? new Date() : d;
    });

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateObject(selectedDate);
            const formatted = selectedDate.toISOString().split('T')[0].replace(/-/g, '/');
            setDate(formatted);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{id ? "レシート編集" : "内容確認"}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>店名</Text>
                        <TextInput
                            style={styles.input}
                            value={storeName}
                            onChangeText={setStoreName}
                            placeholder="店名を入力"
                            placeholderTextColor={COLORS.textLight}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>日付</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <View pointerEvents="none">
                                <TextInput
                                    style={styles.input}
                                    value={date}
                                    editable={false}
                                    placeholder="YYYY/MM/DD"
                                    placeholderTextColor={COLORS.textLight}
                                />
                            </View>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={dateObject}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>合計金額</Text>
                        <View style={styles.amountInputContainer}>
                            <Text style={styles.currencySymbol}>¥</Text>
                            <TextInput
                                style={[styles.input, styles.amountInput]}
                                value={totalAmount}
                                onChangeText={setTotalAmount}
                                placeholder="0"
                                placeholderTextColor={COLORS.textLight}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{id ? "更新する" : "保存する"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        backgroundColor: COLORS.background,
    },
    backButton: {
        padding: SPACING.s,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageContainer: {
        backgroundColor: COLORS.surface,
        margin: SPACING.m,
        borderRadius: RADIUS.l,
        overflow: 'hidden',
        ...SHADOWS.card,
        height: 200, // Reduced height
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    form: {
        padding: SPACING.m,
    },
    inputGroup: {
        marginBottom: SPACING.m, // Reduced margin
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: SPACING.xs, // Reduced margin
        marginLeft: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        fontSize: 16,
        color: COLORS.text,
        ...SHADOWS.card,
    },
    amountInputContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    currencySymbol: {
        position: 'absolute',
        left: SPACING.m,
        zIndex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    amountInput: {
        paddingLeft: SPACING.xl + SPACING.s,
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    footer: {
        padding: SPACING.l,
        backgroundColor: COLORS.background,
    },
    button: {
        padding: SPACING.m,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.floating,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
