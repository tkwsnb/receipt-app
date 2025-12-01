import TextRecognition from 'react-native-mlkit-ocr';

export interface ReceiptData {
    date?: string;
    storeName?: string;
    totalAmount?: number;
    rawText: string;
}

export const processReceiptImage = async (imageUri: string): Promise<ReceiptData> => {
    try {
        // Use detectFromUri as per the library's API
        const result = await TextRecognition.detectFromUri(imageUri);
        const text = result.map((block) => block.text).join('\n');

        const date = extractDate(text);
        const totalAmount = extractTotal(text);
        const storeName = extractStoreName(text);

        return {
            date,
            storeName,
            totalAmount,
            rawText: text,
        };
    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    }
};

const extractDate = (text: string): string | undefined => {
    const dateRegex = /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
    const match = text.match(dateRegex);
    return match ? match[0] : undefined;
};

const extractTotal = (text: string): number | undefined => {
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.includes('合計') || line.toLowerCase().includes('total')) {
            const amountRegex = /(\d{1,3}(,\d{3})*)/;
            const match = line.match(amountRegex);
            if (match) {
                return parseInt(match[0].replace(/,/g, ''), 10);
            }
        }
    }
    return undefined;
};

const extractStoreName = (text: string): string | undefined => {
    const lines = text.split('\n');
    if (lines.length > 0) {
        return lines[0].trim();
    }
    return undefined;
};
