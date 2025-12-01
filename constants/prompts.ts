export const RECEIPT_ANALYSIS_PROMPT = `
Analyze this receipt image and extract the following information in JSON format:
- storeName: The name of the store.
- date: The date of the transaction (formatted as YYYY/MM/DD).
- totalAmount: The total amount paid (number only, remove currency symbols).

If any field is missing or illegible, set it to null.
Return ONLY the JSON object, no markdown formatting.
`;
