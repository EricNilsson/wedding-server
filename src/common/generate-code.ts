export default function generate(length: number = 4): string {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    return code.replace('0', Math.floor(1 + Math.random() * 9).toString());
    // return Math.random().toString(36).substring(2, length + 2).toUpperCase()
}
