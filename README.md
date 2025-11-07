# UNESCO Data Governance Framework - Data Quality Validation Tool

Official UNESCO tool for validating CSV datasets against the UNESCO Data Governance Framework standards and data quality requirements.

## Live Demo

**🚀 [Try it now](https://kevngzc.github.io/data_format_unesco_check/)**

The application is live and ready to use. No installation required - just open the link and start validating your CSV datasets against UNESCO Data Governance standards!

## About UNESCO Data Governance Framework

This tool is designed to support UNESCO's Data Governance Framework by ensuring data quality, consistency, and compliance with international standards. It validates datasets against UNESCO's internal data governance policies and metadata requirements.

## Features

- **Intuitive Drag-and-Drop Interface**: Easy file upload with visual feedback
- **Comprehensive Data Governance Validation**: Checks against all UNESCO data quality rules including:
  - Metadata standards (DCAT, Dublin Core) as per UNESCO guidelines
  - Data types and formatting standards (arrays, dates, country codes, phone numbers)
  - ISO compliance (ISO 8601, ISO 3166-1, ISO 639-1)
  - UUID and ID management per UNESCO requirements
  - Multilingual metadata support (6 UNESCO official languages)
  - Schema.org standards for structured data
- **Detailed Compliance Reporting**: Clear error messages with precise row and column location
- **Intelligent Fix Suggestions**: Smart recommendations for common data quality issues
- **Export Capabilities**:
  - Download detailed validation report as JSON
  - Download corrected CSV with automatic fixes applied
- **Visual Compliance Dashboard**: Summary cards showing compliant vs non-compliant rows
- **Flexible Filtering**: View all issues, errors only, or warnings only

## Data Governance Compliance

This tool ensures your datasets comply with:
- **UNESCO Data Quality Standards**: Format, structure, and content requirements
- **Metadata Completeness**: Required fields and recommended metadata elements
- **International Standards**: ISO 8601, ISO 3166-1, ISO 639-1, E.164, RFC 8259
- **Interoperability**: DCAT and Dublin Core metadata vocabularies
- **Accessibility**: Multilingual support and structured data principles

## Quick Start

1. Open the application at [https://kevngzc.github.io/data_format_unesco_check/](https://kevngzc.github.io/data_format_unesco_check/)
2. Drag and drop your CSV dataset or click "Browse Files"
3. Review the validation results and compliance report
4. Download the corrected CSV with automatic fixes or export a detailed report

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

## Data Governance Requirements

### Required Fields

The following fields are required per UNESCO Data Governance Framework and will generate errors if empty:
- `id`: Standard ID using UNESCO naming convention (e.g., DCE001)
- `uuid`: UUID v4 identifier for global uniqueness
- `title`: Dataset or item title
- `description`: Comprehensive content description

### Recommended Fields

For full Data Governance compliance, datasets should include:
- Contact information (email, phone, website)
- Geographic information (country codes, coordinates)
- Temporal information (dates in ISO 8601 format)
- Classification metadata (terms, themes, categories)
- Multilingual metadata for international accessibility

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

## UNESCO Data Governance Framework

This tool is part of UNESCO's comprehensive Data Governance Framework, which includes:

### Core Principles
- **Data Quality**: Ensuring accuracy, completeness, and consistency
- **Metadata Standards**: Compliance with DCAT and Dublin Core
- **Interoperability**: Integration with external systems and data catalogs
- **Accessibility**: Multilingual support and standardized formats
- **Transparency**: Clear documentation and validation reports
- **Compliance**: Adherence to international standards (ISO, W3C, Schema.org)

### Key Standards
- **ISO 8601**: Date and time representation
- **ISO 3166-1**: Country codes (alpha-2)
- **ISO 639-1**: Language codes
- **E.164**: International telephone numbering
- **RFC 8259**: JSON data interchange format
- **DCAT**: Data Catalog Vocabulary (W3C Recommendation)
- **Dublin Core**: Metadata element set
- **Schema.org**: Structured data markup

### Reference Datasets (SSOT)
UNESCO maintains Single Source of Truth (SSOT) datasets:
- **PAX001**: Member States, regional and electoral groups
- **LA0001**: Legal instruments and their descriptions
- **UNESCO Thesaurus**: Controlled vocabularies (vocabularies.unesco.org)

## Contributing

Contributions are welcome! Please ensure any new validation rules are:
1. Aligned with UNESCO Data Governance Framework policies
2. Based on official UNESCO standards documentation
3. Include automatic fix suggestions where possible
4. Provide clear, actionable error messages
5. Include comprehensive test cases
6. Support multilingual metadata validation

## Support

For questions about UNESCO Data Governance Framework or this validation tool:
- Review the UNESCO data quality standards documentation
- Contact UNESCO Data Governance team
- Visit [unesco.org](https://www.unesco.org) for more information

## Disclaimer

This tool is designed to support UNESCO's Data Governance Framework. While it validates against established standards, users are responsible for ensuring their data meets all applicable UNESCO policies and requirements.