# i18n-translate-cli 🌍

A simple command-line tool to automatically translate JSON localization files into multiple languages using DeepL and Google Translate.

## Features 🚀
- 🌎 Translate JSON localization files into multiple languages.
- 🧢 Supports both **DeepL API** (recommended) and **Google Translate Free Mode**.
- ⚡ CLI with easy-to-use options for flexibility.
- 📁 Saves translated files in the desired output directory.

## Installation 🔧
You can install the package globally using npm:

```sh
npm install -g i18n-translate-cli
```

Or run it directly using npx:
```sh
npx i18n-translate-cli --help
```

## Usage 📝
### Basic Translation
#### Translate an English JSON file (`en.json`) into French (`fr.json`):
```sh
i18n-translate-cli -f en.json -l fr -o ./locales
```

#### Translate into Multiple Languages
Translate into French and Chinese:
```sh
i18n-translate-cli -f en.json -l fr,zh -o ./locales
```

#### Use Free Google Translate Mode
```sh
i18n-translate-cli -f en.json -l fr -o ./locales --free
```

#### Use DeepL API (Recommended)
Requires a DeepL API key. Set it using an environment variable:
```sh
export DEEPL_API_KEY=your-api-key
```
```sh
i18n-translate-cli -f en.json -l fr -o ./locales
```

## Options ⚙️
| Option          | Description |
|---------------|-------------|
| `-f, --file`  | Path to the source JSON file (e.g., `en.json`) |
| `-l, --languages` | Comma-separated list of target languages (e.g., `fr,zh`) |
| `-o, --output` | Output directory for translated files |
| `--free` | Use free Google Translate API instead of DeepL |
| `--verbose` | Show detailed logs while translating |

## License 📝
This project is licensed under the MIT License.

## Contributing 🤝
Contributions are welcome! Feel free to open an issue or submit a pull request.

