import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { analyzeReceipt, ReceiptData } from '../services/gemini';
import { initDatabase } from '../services/database';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReceiptCamera() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
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
                setLoading(true);
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    skipProcessing: true,
                });

                if (photo?.uri) {
                    // Analyze with Gemini
                    const result = await analyzeReceipt(photo.uri);

                    router.push({
                        pathname: '/confirm',
                        params: {
                            imageUri: photo.uri,
                            storeName: result.storeName,
                            date: result.date,
                            totalAmount: result.totalAmount?.toString(),
                            rawText: result.rawText
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to take picture or analyze", error);
                Alert.alert("エラー", "画像の解析に失敗しました");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
            <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}>
                <TouchableOpacity style={styles.button} onPress={takePicture}>
                    <Text style={styles.text}>撮影</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => router.push('/history')}>
                    <Text style={styles.text}>履歴</Text>
                </TouchableOpacity>
            </View>
            {loading && (
                <View style={styles.overlay}>
                    <Text style={styles.loadingText}>AI解析中...</Text>
                </View>
            )}
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginBottom: 20,
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
    loadingText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    }
});
