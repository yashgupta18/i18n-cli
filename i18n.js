const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const axios = require("axios");
const { translate } = require("@vitalets/google-translate-api");
require("dotenv").config();

// Set up CLI options
program
  .requiredOption("-f, --file <path>", "Path to the JSON file")
  .requiredOption(
    "-l, --lang <code>",
    "Target language code (e.g., fr, es, de)"
  )
  .option("--free", "Use free Google Translate instead of DeepL")
  .parse(process.argv);

const options = program.opts();
const filePath = path.resolve(options.file);
const targetLang = options.lang.toLowerCase(); // Ensure lowercase language code
const useFreeTranslation = options.free;

// Read JSON file
if (!fs.existsSync(filePath)) {
  console.error("Error: File not found!");
  process.exit(1);
}

const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
console.log("Loaded JSON:", jsonData);
console.log("Target Language:", targetLang);

// Function to translate text using DeepL API
async function translateWithDeepL(text, targetLang) {
  try {
    const response = await axios.post(
      `https://api-free.deepl.com/v2/translate`,
      new URLSearchParams({
        auth_key: process.env.DEEPL_API_KEY,
        text,
        target_lang: targetLang,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return response.data.translations[0].text;
  } catch (error) {
    console.error(
      "DeepL translation error:",
      error.response ? error.response.data : error.message
    );
    return text; // Return original text on failure
  }
}

// Function to translate text using Google Translate (free)
async function translateWithGoogle(text, targetLang) {
  try {
    const response = await translate(text, { to: targetLang });
    return response.text;
  } catch (error) {
    console.error("Google Translate error:", error.message);
    return text; // Return original text on failure
  }
}

// Function to translate JSON content
async function translateJson(jsonData, targetLang, useFreeTranslation) {
  const translatedData = {};
  for (const key in jsonData) {
    translatedData[key] = useFreeTranslation
      ? await translateWithGoogle(jsonData[key], targetLang)
      : await translateWithDeepL(jsonData[key], targetLang);
  }
  return translatedData;
}

// Run translation and save file
(async () => {
  const translatedJson = await translateJson(
    jsonData,
    targetLang,
    useFreeTranslation
  );
  const outputFilePath = path.join(
    path.dirname(filePath),
    `${targetLang}.json`
  );
  fs.writeFileSync(outputFilePath, JSON.stringify(translatedJson, null, 2));
  console.log(`Translation complete! Saved to ${outputFilePath}`);
})();

// ✅ Support batch translations (multiple files at once)
// ✅ Allow manual overrides (custom dictionary file)
// ✅ Preserve placeholders ({name}, {count})
