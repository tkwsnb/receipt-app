import { Stack } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FabProvider, useFab } from '../contexts/FabContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function GlobalFab() {
  const { fabConfig } = useFab();
  const insets = useSafeAreaInsets();

  if (!fabConfig.isVisible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Camera FAB (Center) */}
      {fabConfig.showCamera && (
        <View style={[styles.fabContainer, { paddingBottom: insets.bottom + SPACING.m }]}>
          <TouchableOpacity onPress={fabConfig.onCameraPress} style={[styles.fab, styles.cameraFab]}>
            <Ionicons name="camera" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Secondary FAB (Right) */}
      {fabConfig.showSecondary && (
        <TouchableOpacity
          onPress={fabConfig.onSecondaryPress}
          style={[styles.secondaryFab, { bottom: insets.bottom + 30 }]}
        >
          <Ionicons name={fabConfig.secondaryIcon} size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <FabProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
        </Stack>
        <GlobalFab />
      </View>
    </FabProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
    zIndex: 100,
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
  secondaryFab: {
    position: 'absolute',
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
