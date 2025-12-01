import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { analyzeReceipt, ReceiptData } from '../services/gemini';
import { initDatabase } from '../services/database';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ReceiptCamera() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        initDatabase();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.floor(Math.random() * 10) + 1;
                });
            }, 500);
        } else {
            setProgress(100);
        }
        return () => clearInterval(interval);
    }, [loading]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>カメラの使用許可が必要です</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>許可する</Text>
                </TouchableOpacity>
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

            <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + SPACING.l }]}>
                <View style={styles.spacer} />

                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <View style={styles.captureInner} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/history')}>
                    <Ionicons name="documents-outline" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>AI解析中... {progress}%</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    permissionButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        alignSelf: 'center',
    },
    permissionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    camera: {
        flex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingTop: SPACING.l,
    },
    historyButton: {
        width: 50,
        height: 50,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: RADIUS.full,
        backgroundColor: 'white',
    },
    spacer: {
        width: 50,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: SPACING.m,
    }
});
