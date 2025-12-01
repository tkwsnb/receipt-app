import { View, Text, TextInput, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { db, receipts } from '../services/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eq } from 'drizzle-orm';

export default function ConfirmScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const imageUri = params.imageUri as string;
    const [storeName, setStoreName] = useState(params.storeName as string || '');
    const [date, setDate] = useState(params.date as string || '');
    const [totalAmount, setTotalAmount] = useState(params.totalAmount as string || '');

    // rawText might be useful for debugging or advanced editing later
    const rawText = params.rawText as string || '';
    const id = params.id ? Number(params.id) : null;

    const handleSave = async () => {
        try {
            // Validate amount
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

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

                <View style={styles.form}>
                    <Text style={styles.label}>店名</Text>
                    <TextInput
                        style={styles.input}
                        value={storeName}
                        onChangeText={setStoreName}
                        placeholder="店名を入力"
                    />

                    <Text style={styles.label}>日付</Text>
                    <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY/MM/DD"
                    />

                    <Text style={styles.label}>合計金額</Text>
                    <TextInput
                        style={styles.input}
                        value={totalAmount}
                        onChangeText={setTotalAmount}
                        placeholder="0"
                        keyboardType="numeric"
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                    <Text style={[styles.buttonText, styles.saveButtonText]}>{id ? "更新" : "登録"}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    retryButton: {
        backgroundColor: '#eee',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    saveButtonText: {
        color: '#fff',
    },
});
