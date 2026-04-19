import fs from 'fs';

const lines = fs.readFileSync('src/CEO.txt', 'utf8').split('\n');
const questions = [];

for (const line of lines) {
    if (line.trim().startsWith('CEO-')) {
        const parts = line.split(']');
        if (parts.length > 1) {
            const idAndType = parts[0] + ']';
            const text = parts[1].trim();
            const wordsCount = text.split(/\s+/).length;
            questions.push({ idAndType, text, wordsCount });
        }
    }
}

const report = {
    lengthViolations: [],
    absoluteWordViolations: [],
    doubleMeaningSuspects: []
};

const absoluteWords = ['luôn ', 'luôn luôn ', 'hoàn toàn ', 'tuyệt đối ', 'chắc chắn ', 'mọi '];
const doubleMeaningWords = [' và ', ' hoặc '];

for (const q of questions) {
    // 1. Length check: < 10 or > 20
    if (q.wordsCount < 10 || q.wordsCount > 20) {
        report.lengthViolations.push(`${q.idAndType} (${q.wordsCount} từ): ${q.text}`);
    }

    // 2. Absolute words check
    const textLower = q.text.toLowerCase();
    const hasAbs = absoluteWords.some(w => textLower.includes(w));
    if (hasAbs) {
        report.absoluteWordViolations.push(`${q.idAndType}: ${q.text}`);
    }

    // 3. Double meaning check (có "và" hoặc "hoặc" thường nối hai mệnh đề)
    const hasDouble = doubleMeaningWords.some(w => textLower.includes(w));
    if (hasDouble) {
        report.doubleMeaningSuspects.push(`${q.idAndType}: ${q.text}`);
    }
}

console.log('--- LỖI ĐỘ DÀI CÂU (< 10 HOẶC > 20 TỪ) ---');
console.log(`Có ${report.lengthViolations.length} câu vi phạm:`);
report.lengthViolations.forEach(x => console.log(x));

console.log('\n--- LỖI TỪ TUYỆT ĐỐI (LUÔN, LUÔN LUÔN, HOÀN TOÀN...) ---');
console.log(`Có ${report.absoluteWordViolations.length} câu vi phạm:`);
report.absoluteWordViolations.forEach(x => console.log(x));

console.log('\n--- LỖI DOUBLE MEANING (CÓ TỪ "VÀ", "HOẶC") ---');
console.log(`Có ${report.doubleMeaningSuspects.length} câu nghi ngờ:`);
report.doubleMeaningSuspects.forEach(x => console.log(x));
