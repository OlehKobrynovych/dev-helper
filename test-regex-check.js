
const content = "fetch(`https://api.example.com/data`)";
const regex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/gi;
const match = regex.exec(content);
console.log("Match with backticks:", match);

const content2 = "fetch('https://api.example.com/data')";
const match2 = regex.exec(content2);
console.log("Match with single quotes:", match2);

const content3 = 'fetch("https://api.example.com/data")';
const match3 = regex.exec(content3);
console.log("Match with double quotes:", match3);
