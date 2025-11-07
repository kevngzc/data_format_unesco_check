# UNESCO Data Quality Checker

A drag-and-drop web application for validating CSV files against UNESCO data quality standards.

## Features

- **Drag-and-Drop Interface**: Easy file upload with visual feedback
- **Comprehensive Validation**: Checks against all UNESCO data quality rules including:
  - Metadata standards (DCAT, Dublin Core)
  - Data types and formatting (arrays, dates, country codes, phone numbers)
  - ISO standards (ISO 8601, ISO 3166-1, ISO 639-1)
  - UUID and ID management
  - Multilingual support
  - Gender standards (Schema.org GenderType)
- **Detailed Error Reporting**: Clear error messages with row and column location
- **Automatic Fix Suggestions**: Smart suggestions for common data quality issues
- **Export Capabilities**:
  - Download validation report as JSON
  - Download fixed CSV with automatic corrections applied
- **Visual Dashboard**: Summary cards showing compliant vs non-compliant rows
- **Filter Options**: View all issues, errors only, or warnings only

## Quick Start

1. Open `index.html` in a web browser
2. Drag and drop a CSV file or click "Browse Files"
3. Review validation results
4. Download fixed CSV or export detailed report

## Usage

### Running the Application

Simply open `index.html` in any modern web browser. No server or build process required.

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Testing with Sample Data

A sample CSV file is provided (`sample_data.csv`) with intentional data quality issues to demonstrate the validator's capabilities.

### Validation Rules

The validator checks for:

#### 1. Date Format (ISO 8601)
- **Format**: YYYY-MM-DD
- **Example**: 2024-02-20
- **Auto-fix**: Converts common formats (MM/DD/YYYY, DD/MM/YYYY)

#### 2. Arrays/Lists (JSON Format)
- **Format**: ["item1", "item2", "item3"]
- **Example**: ["Education", "Culture", "Science"]
- **Auto-fix**: Converts comma-separated values to proper JSON arrays

#### 3. Country Codes (ISO 3166-1 alpha-2)
- **Format**: Two uppercase letters
- **Example**: FR, US, JP
- **Auto-fix**: Converts to uppercase

#### 4. Language Codes (ISO 639-1)
- **Format**: Two lowercase letters
- **Example**: en, fr, es
- **Auto-fix**: Converts to lowercase

#### 5. Email Addresses
- **Format**: Standard email format
- **Example**: contact@unesco.org

#### 6. Phone Numbers (E.164)
- **Format**: +[country code][number]
- **Example**: +33 1 2345 6789
- **Auto-fix**: Adds + prefix if missing

#### 7. URLs
- **Format**: Must include http:// or https://
- **Example**: https://www.unesco.org
- **Auto-fix**: Adds https:// prefix

#### 8. Boolean Values
- **Format**: true or false (lowercase)
- **Example**: true
- **Auto-fix**: Converts yes/no, 1/0, True/False to proper format

#### 9. Numeric Values
- **Format**: Raw format with dot as decimal separator
- **Example**: 1234567890.12
- **Auto-fix**: Removes commas and spaces

#### 10. Gender (Schema.org GenderType)
- **Format**: male or female (lowercase)
- **Example**: male
- **Auto-fix**: Converts to lowercase and standardizes

#### 11. UUID v4
- **Format**: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
- **Example**: 550e8400-e29b-41d4-a716-446655440000
- **Auto-fix**: Generates new UUID if missing or invalid

#### 12. Standard ID
- **Format**: 2-3 uppercase letters + digits
- **Example**: DCE001
- **Validation**: Ensures proper format

#### 13. HTML Content
- **Allowed tags**: h2, h3, h4, ul, li, a, p
- **Warning**: Flags disallowed HTML tags

#### 14. Coordinates
- **Format**: x,y or GeoJSON
- **Example**: 48.8566,2.3522
- **Validation**: Checks range and format

## File Structure

```
.
├── index.html          # Main HTML interface
├── styles.css          # Application styling
├── validator.js        # UNESCO validation rules engine
├── app.js             # Application logic and CSV parsing
├── sample_data.csv    # Sample CSV with test data
└── README.md          # This file
```

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported

Requires a modern browser with ES6 support.

## CSV Format Requirements

- First row must contain column headers
- Use commas as delimiters
- Quote fields containing commas, quotes, or newlines
- UTF-8 encoding recommended

## Required Fields

The following fields are considered required and will generate errors if empty:
- `id`: Standard ID (e.g., DCE001)
- `uuid`: UUID v4 identifier
- `title`: Dataset/item title
- `description`: Content description

## Multilingual Support

Field names can include language suffixes:
- `_en` for English
- `_fr` for French
- `_es` for Spanish
- `_ru` for Russian
- `_ar` for Arabic
- `_zh` for Chinese

Example: `title_en`, `title_fr`, `description_en`

## Export Options

### Validation Report (JSON)
Contains:
- File metadata
- Timestamp
- Summary statistics
- Detailed list of all issues with locations and suggestions

### Fixed CSV
- Applies all automatic fixes
- Maintains original structure
- Only downloads if fixes are available

## Development

The application is built with vanilla JavaScript and requires no build process or dependencies.

### Code Structure

- **UNESCOValidator** (validator.js): Core validation engine
- **UNESCODataChecker** (app.js): UI and CSV processing
- Pure CSS styling with modern design
- No external dependencies

## Standards Reference

- **ISO 8601**: Date and time format
- **ISO 3166-1 alpha-2**: Country codes
- **ISO 639-1**: Language codes
- **E.164**: International phone number format
- **RFC 8259**: JSON specification
- **Schema.org GenderType**: Gender values
- **DCAT**: Data Catalog Vocabulary
- **Dublin Core**: Metadata element set

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please ensure any new validation rules are:
1. Based on UNESCO standards documentation
2. Include automatic fix suggestions where possible
3. Provide clear error messages
4. Include test cases

## Support

For issues or questions, please refer to the UNESCO data quality standards documentation.