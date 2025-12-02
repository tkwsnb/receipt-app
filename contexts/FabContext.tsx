import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

type FabConfig = {
    isVisible: boolean;
    showCamera: boolean;
    onCameraPress?: () => void;
    showSecondary: boolean;
    secondaryIcon?: any; // Ionicons name
    onSecondaryPress?: () => void;
};

type FabContextType = {
    fabConfig: FabConfig;
    setFabConfig: (config: Partial<FabConfig>) => void;
};

const defaultFabConfig: FabConfig = {
    isVisible: true,
    showCamera: false,
    showSecondary: false,
};

const FabContext = createContext<FabContextType>({
    fabConfig: defaultFabConfig,
    setFabConfig: () => { },
});

export const useFab = () => useContext(FabContext);

export const FabProvider = ({ children }: { children: ReactNode }) => {
    const [fabConfig, setFabConfigState] = useState<FabConfig>(defaultFabConfig);

    const setFabConfig = useCallback((config: Partial<FabConfig>) => {
        setFabConfigState((prev) => {
            // Simple check to avoid unnecessary updates if possible, 
            // but for now just returning new object is fine if setFabConfig is stable.
            return { ...prev, ...config };
        });
    }, []);

    const value = useMemo(() => ({ fabConfig, setFabConfig }), [fabConfig, setFabConfig]);

    return (
        <FabContext.Provider value={value}>
            {children}
        </FabContext.Provider>
    );
};
