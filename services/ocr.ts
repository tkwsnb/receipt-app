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
    // Matches: 2023/01/01, 2023-01-01, 2023年01月01日, 2023.01.01
    const dateRegex = /(\d{4})[\/\-\.年]\s*(\d{1,2})[\/\-\.月]\s*(\d{1,2})[日]?/;
    const match = text.match(dateRegex);
    if (match) {
        // Normalize to YYYY/MM/DD
        return `${match[1]}/${match[2].padStart(2, '0')}/${match[3].padStart(2, '0')}`;
    }
    return undefined;
};

const extractTotal = (text: string): number | undefined => {
    const lines = text.split('\n');
    const totalKeywords = ['合計', '合　計', '合 計', '小計', 'お買上', 'Total', 'TOTAL', 'Payment'];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if line contains any total keyword
        if (totalKeywords.some(keyword => line.includes(keyword))) {
            // Strategy 1: Look for amount in the same line
            let amount = findAmountInString(line);
            if (amount !== undefined) return amount;

            // Strategy 2: Look for amount in the next line (often the amount is below the label)
            if (i + 1 < lines.length) {
                amount = findAmountInString(lines[i + 1]);
                if (amount !== undefined) return amount;
            }
        }
    }

    // Fallback: Look for the largest number prefixed with ¥
    const yenRegex = /[¥￥]\s*([\d,]+)/g;
    let maxAmount = 0;
    let match;
    while ((match = yenRegex.exec(text)) !== null) {
        const val = parseInt(match[1].replace(/,/g, ''), 10);
        if (val > maxAmount) maxAmount = val;
    }

    return maxAmount > 0 ? maxAmount : undefined;
};

const findAmountInString = (str: string): number | undefined => {
    // Matches numbers like 1,000 or 1000, optionally prefixed by ¥ or suffixed by 円
    // We strictly look for digits that might be the price.
    // Exclude phone numbers (usually start with 0 and have -)
    const amountRegex = /([¥￥])?\s*([\d,]+)\s*(円)?/g;
    let match;
    const candidates: number[] = [];

    while ((match = amountRegex.exec(str)) !== null) {
        const rawNum = match[2];
        // Skip if it looks like a phone number (e.g. 03-1234-5678) or date
        if (rawNum.includes('-') || rawNum.startsWith('0')) continue;

        const val = parseInt(rawNum.replace(/,/g, ''), 10);
        if (!isNaN(val)) candidates.push(val);
    }

    // Usually the last number in the line is the total (e.g. "Total ... 1,000")
    if (candidates.length > 0) {
        return candidates[candidates.length - 1];
    }
    return undefined;
};

const extractStoreName = (text: string): string | undefined => {
    const lines = text.split('\n');
    const skipKeywords = ['領収書', 'レシート', 'クレジット', '控え', 'Copy', 'TEL', 'FAX', 'No.', '店No'];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length === 0) continue;

        // Skip lines containing generic keywords or looking like phone/date
        if (skipKeywords.some(kw => trimmed.toUpperCase().includes(kw))) continue;
        if (/^\d/.test(trimmed)) continue; // Starts with number (date, phone, etc)

        // Return the first line that looks like a name
        return trimmed;
    }
    return undefined;
};
