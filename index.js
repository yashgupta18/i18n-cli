const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const axios = require("axios");
const { translate } = require("@vitalets/google-translate-api");
const cliProgress = require("cli-progress");
require("dotenv").config();

// Set up CLI options
program
  .requiredOption("-f, --file <path>", "Path to the JSON file")
  .requiredOption(
    "-l, --lang <code>",
    "Target language code (e.g., fr, es, de)"
  )
  .option("--free", "Use free Google Translate instead of DeepL")
  .option(
    "-o, --output <dir>",
    "Output directory for translated files",
    path.dirname(__filename)
  )
  .option("--verbose", "Enable verbose logging")
  .parse(process.argv);

const options = program.opts();
const filePath = path.resolve(options.file);
const targetLang = options.lang.toLowerCase(); // Ensure lowercase language code
const useFreeTranslation = options.free;
const outputDir = path.resolve(options.output);
const verbose = options.verbose;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read JSON file
if (!fs.existsSync(filePath)) {
  console.error("Error: File not found!");
  process.exit(1);
}

const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
if (verbose) console.log("Loaded JSON:", jsonData);
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
      `DeepL translation error for ${targetLang}:`,
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
    console.error(`Google Translate error for ${targetLang}:`, error.message);
    return text; // Return original text on failure
  }
}

// Function to translate JSON content
async function translateJson(jsonData, targetLang, useFreeTranslation) {
  const translatedData = {};
  const keys = Object.keys(jsonData);
  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(keys.length, 0);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    translatedData[key] = useFreeTranslation
      ? await translateWithGoogle(jsonData[key], targetLang)
      : await translateWithDeepL(jsonData[key], targetLang);
    progressBar.update(i + 1);
  }
  progressBar.stop();
  return translatedData;
}

// Run translation and save file
(async () => {
  const translatedJson = await translateJson(
    jsonData,
    targetLang,
    useFreeTranslation
  );
  const outputFilePath = path.join(outputDir, `${targetLang}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(translatedJson, null, 2));
  console.log(`Translation complete! Saved to ${outputFilePath}`);
})();
