import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { processReceiptImage, ReceiptData } from '../services/ocr';
import { initDatabase, receipts, db } from '../services/database';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReceiptCamera() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const [ocrResult, setOcrResult] = useState<ReceiptData | null>(null);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        initDatabase();
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photoData = await cameraRef.current.takePictureAsync();
                if (photoData?.uri) {
                    setPhoto(photoData.uri);
                    setLoading(true);
                    const data = await processReceiptImage(photoData.uri);
                    setOcrResult(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to take picture or process OCR", error);
                setLoading(false);
                Alert.alert("Error", "Failed to process image.");
            }
        }
    };

    const retake = () => {
        setPhoto(null);
        setOcrResult(null);
    };

    const saveReceipt = async () => {
        if (ocrResult && photo) {
            try {
                await db.insert(receipts).values({
                    storeName: ocrResult.storeName,
                    date: ocrResult.date,
                    totalAmount: ocrResult.totalAmount,
                    rawText: ocrResult.rawText,
                    imageUri: photo,
                });
                Alert.alert("Success", "Receipt saved!");
                retake();
                // Optionally navigate to history
                // router.push('/history');
            } catch (error) {
                console.error("Failed to save receipt", error);
                Alert.alert("Error", "Failed to save receipt.");
            }
        }
    };

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.preview} />
                {loading && <View style={styles.overlay}><Text style={styles.text}>Processing...</Text></View>}
                {!loading && ocrResult && (
                    <View style={[styles.resultContainer, { paddingBottom: insets.bottom + 20 }]}>
                        <Text style={styles.resultText}>Store: {ocrResult.storeName}</Text>
                        <Text style={styles.resultText}>Date: {ocrResult.date}</Text>
                        <Text style={styles.resultText}>Total: {ocrResult.totalAmount}</Text>
                        <View style={styles.buttonRow}>
                            <Button title="Retake" onPress={retake} />
                            <Button title="Save" onPress={saveReceipt} />
                        </View>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <Text style={styles.text}>Take</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/history')}>
                        <Text style={styles.text}>History</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    preview: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    resultContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
    },
    resultText: {
        fontSize: 18,
        marginBottom: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
});
