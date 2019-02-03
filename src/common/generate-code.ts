export default function generate(length: number = 4) {
    return Math.random().toString(36).substring(2, length + 2).toUpperCase()
}
