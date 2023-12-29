export function firstLetterToUpperCase(text: string) {
    return text
        .replace(/^./, function(str) {
            return str.toUpperCase(); // Convert the first character to uppercase
        });
}