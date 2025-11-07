/**
 * UNESCO Data Quality Validator
 * Validates CSV data against UNESCO data quality standards
 */

class UNESCOValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.fixes = {};
    }

    /**
     * Main validation method
     */
    validate(data, headers) {
        this.errors = [];
        this.warnings = [];
        this.fixes = {};

        data.forEach((row, rowIndex) => {
            const actualRowNumber = rowIndex + 2; // +2 for header and 0-index

            headers.forEach((header, colIndex) => {
                const value = row[colIndex];
                const fieldName = header.trim();

                // Skip empty values unless field is required
                if (this.isEmptyValue(value)) {
                    if (this.isRequiredField(fieldName)) {
                        this.addError(
                            actualRowNumber,
                            fieldName,
                            'Required field is empty',
                            'Please provide a value for this required field',
                            value
                        );
                    }
                    return;
                }

                // Validate based on field type
                this.validateField(actualRowNumber, fieldName, value);
            });

            // Check for UUID and ID fields
            this.validateIdentifiers(row, headers, actualRowNumber);
        });

        return {
            errors: this.errors,
            warnings: this.warnings,
            fixes: this.fixes,
            isValid: this.errors.length === 0
        };
    }

    /**
     * Validate individual field based on its type
     */
    validateField(row, fieldName, value) {
        const lowerFieldName = fieldName.toLowerCase();

        // Date validation
        if (this.isDateField(lowerFieldName)) {
            this.validateDate(row, fieldName, value);
        }

        // Array validation
        if (this.isArrayField(lowerFieldName)) {
            this.validateArray(row, fieldName, value);
        }

        // Email validation
        if (lowerFieldName.includes('email')) {
            this.validateEmail(row, fieldName, value);
        }

        // Phone validation
        if (lowerFieldName.includes('phone')) {
            this.validatePhone(row, fieldName, value);
        }

        // URL validation
        if (lowerFieldName.includes('website') || lowerFieldName.includes('url')) {
            this.validateURL(row, fieldName, value);
        }

        // Country code validation
        if (this.isCountryCodeField(lowerFieldName)) {
            this.validateCountryCode(row, fieldName, value);
        }

        // Language code validation
        if (this.isLanguageCodeField(lowerFieldName)) {
            this.validateLanguageCode(row, fieldName, value);
        }

        // Boolean validation
        if (this.isBooleanField(lowerFieldName)) {
            this.validateBoolean(row, fieldName, value);
        }

        // Numeric validation
        if (this.isNumericField(lowerFieldName)) {
            this.validateNumeric(row, fieldName, value);
        }

        // Gender validation
        if (lowerFieldName.includes('gender')) {
            this.validateGender(row, fieldName, value);
        }

        // HTML content validation
        if (lowerFieldName.includes('description') || lowerFieldName.includes('content')) {
            this.validateHTML(row, fieldName, value);
        }

        // Coordinate validation
        if (lowerFieldName.includes('coordinate') || lowerFieldName === 'location') {
            this.validateCoordinates(row, fieldName, value);
        }
    }

    /**
     * Date validation - ISO 8601 format (YYYY-MM-DD)
     */
    validateDate(row, fieldName, value) {
        const iso8601Pattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!iso8601Pattern.test(value)) {
            const fixedValue = this.attemptDateFix(value);
            this.addError(
                row,
                fieldName,
                `Invalid date format. Expected ISO 8601 (YYYY-MM-DD), got: ${value}`,
                fixedValue ? `Suggested fix: ${fixedValue}` : 'Use format YYYY-MM-DD (e.g., 2024-02-20)',
                value,
                fixedValue
            );
            return;
        }

        // Validate actual date
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            this.addError(
                row,
                fieldName,
                `Invalid date: ${value}`,
                'Ensure the date is valid (e.g., no February 30)',
                value
            );
        }
    }

    /**
     * Attempt to fix common date format issues
     */
    attemptDateFix(value) {
        // Try common formats
        const formats = [
            /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
            /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
            /^(\d{2})-(\d{2})-(\d{4})$/,  // MM-DD-YYYY or DD-MM-YYYY
        ];

        for (let pattern of formats) {
            const match = value.match(pattern);
            if (match) {
                if (match[1].length === 4) {
                    // Assume YYYY-MM-DD or YYYY/MM/DD
                    return `${match[1]}-${match[2]}-${match[3]}`;
                } else if (parseInt(match[1]) > 12) {
                    // Assume DD-MM-YYYY or DD/MM/YYYY
                    return `${match[3]}-${match[2]}-${match[1]}`;
                } else {
                    // Ambiguous, assume MM-DD-YYYY or MM/DD/YYYY
                    return `${match[3]}-${match[1]}-${match[2]}`;
                }
            }
        }
        return null;
    }

    /**
     * Array validation - JSON format
     */
    validateArray(row, fieldName, value) {
        const trimmedValue = value.trim();

        // Check if it looks like an array
        if (!trimmedValue.startsWith('[') || !trimmedValue.endsWith(']')) {
            const fixedValue = this.attemptArrayFix(value);
            this.addError(
                row,
                fieldName,
                'Array must be enclosed in square brackets []',
                fixedValue ? `Suggested fix: ${fixedValue}` : 'Format as ["item1", "item2"]',
                value,
                fixedValue
            );
            return;
        }

        // Try to parse as JSON
        try {
            const parsed = JSON.parse(trimmedValue);
            if (!Array.isArray(parsed)) {
                this.addError(
                    row,
                    fieldName,
                    'Invalid array format',
                    'Ensure the value is a valid JSON array',
                    value
                );
            }
        } catch (e) {
            const fixedValue = this.attemptArrayFix(value);
            this.addError(
                row,
                fieldName,
                `Invalid JSON array: ${e.message}`,
                fixedValue ? `Suggested fix: ${fixedValue}` : 'Use proper JSON array format with double quotes: ["item1", "item2"]',
                value,
                fixedValue
            );
        }
    }

    /**
     * Attempt to fix common array format issues
     */
    attemptArrayFix(value) {
        try {
            // Remove brackets if present
            let cleaned = value.trim();
            if (cleaned.startsWith('[')) cleaned = cleaned.substring(1);
            if (cleaned.endsWith(']')) cleaned = cleaned.substring(0, cleaned.length - 1);

            // Split by comma and clean up
            const items = cleaned.split(',').map(item => {
                item = item.trim();
                // Remove existing quotes
                item = item.replace(/^['"]|['"]$/g, '');
                return `"${item}"`;
            }).filter(item => item !== '""');

            return `[${items.join(', ')}]`;
        } catch {
            return null;
        }
    }

    /**
     * Email validation
     */
    validateEmail(row, fieldName, value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(value)) {
            this.addError(
                row,
                fieldName,
                `Invalid email format: ${value}`,
                'Use format: user@example.com',
                value
            );
        }
    }

    /**
     * Phone validation - E.164 format
     */
    validatePhone(row, fieldName, value) {
        const e164Pattern = /^\+[1-9]\d{1,14}$/;
        const trimmedValue = value.replace(/[\s\-()]/g, '');

        if (!e164Pattern.test(trimmedValue)) {
            const fixedValue = trimmedValue.startsWith('+') ? trimmedValue : `+${trimmedValue}`;
            this.addError(
                row,
                fieldName,
                `Invalid phone format. Expected E.164 format (+country code + number)`,
                `Suggested fix: ${fixedValue} (ensure it starts with + and country code)`,
                value,
                fixedValue
            );
        }
    }

    /**
     * URL validation
     */
    validateURL(row, fieldName, value) {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
            const fixedValue = `https://${value}`;
            this.addError(
                row,
                fieldName,
                'URL must include protocol (http:// or https://)',
                `Suggested fix: ${fixedValue}`,
                value,
                fixedValue
            );
            return;
        }

        try {
            new URL(value);
        } catch {
            this.addError(
                row,
                fieldName,
                `Invalid URL format: ${value}`,
                'Ensure the URL is properly formatted',
                value
            );
        }
    }

    /**
     * Country code validation - ISO 3166-1 alpha-2
     */
    validateCountryCode(row, fieldName, value) {
        const validCodes = [
            'AF', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ',
            'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI',
            'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ',
            'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET',
            'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY',
            'HT', 'HN', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT',
            'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG',
            'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU',
            'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM',
            'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO',
            'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT',
            'QA', 'RO', 'RU', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'SS', 'ES', 'LK', 'SD', 'SR', 'SE', 'CH', 'SY',
            'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ',
            'VU', 'VE', 'VN', 'YE', 'ZM', 'ZW'
        ];

        const upperValue = value.toUpperCase();

        if (value.length !== 2) {
            this.addError(
                row,
                fieldName,
                `Country code must be 2 characters (ISO 3166-1 alpha-2): ${value}`,
                'Use two-letter country codes (e.g., FR, US, JP)',
                value
            );
        } else if (!validCodes.includes(upperValue)) {
            const fixedValue = upperValue;
            this.addWarning(
                row,
                fieldName,
                `Country code "${value}" not recognized. Please verify it is a valid ISO 3166-1 alpha-2 code`,
                `Suggested fix: ${fixedValue} (converted to uppercase)`,
                value,
                fixedValue
            );
        } else if (value !== upperValue) {
            this.addWarning(
                row,
                fieldName,
                'Country code should be uppercase',
                `Suggested fix: ${upperValue}`,
                value,
                upperValue
            );
        }
    }

    /**
     * Language code validation - ISO 639-1
     */
    validateLanguageCode(row, fieldName, value) {
        const validCodes = [
            'en', 'fr', 'es', 'ru', 'ar', 'zh', 'de', 'it', 'pt', 'ja', 'ko', 'hi', 'bn', 'pa', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'my', 'th', 'vi', 'tr', 'pl', 'uk', 'nl', 'ro', 'hu', 'cs', 'sv', 'el', 'he', 'da', 'fi', 'no', 'sk', 'bg', 'hr', 'sr', 'lt', 'lv', 'et', 'sl', 'sq', 'mk', 'is', 'ga', 'mt', 'cy', 'eu', 'ca', 'gl'
        ];

        const lowerValue = value.toLowerCase();

        if (value.length !== 2) {
            this.addError(
                row,
                fieldName,
                `Language code must be 2 characters (ISO 639-1): ${value}`,
                'Use two-letter language codes (e.g., en, fr, es)',
                value
            );
        } else if (!validCodes.includes(lowerValue)) {
            this.addWarning(
                row,
                fieldName,
                `Language code "${value}" not recognized. Please verify it is a valid ISO 639-1 code`,
                lowerValue !== value ? `Suggested fix: ${lowerValue} (converted to lowercase)` : 'Verify the language code',
                value,
                lowerValue !== value ? lowerValue : null
            );
        } else if (value !== lowerValue) {
            this.addWarning(
                row,
                fieldName,
                'Language code should be lowercase',
                `Suggested fix: ${lowerValue}`,
                value,
                lowerValue
            );
        }
    }

    /**
     * Boolean validation
     */
    validateBoolean(row, fieldName, value) {
        const lowerValue = value.toLowerCase();

        if (lowerValue !== 'true' && lowerValue !== 'false') {
            const fixedValue = ['yes', 'y', '1', 'true'].includes(lowerValue) ? 'true' :
                             ['no', 'n', '0', 'false'].includes(lowerValue) ? 'false' : null;

            this.addError(
                row,
                fieldName,
                `Boolean value must be "true" or "false" (lowercase): ${value}`,
                fixedValue ? `Suggested fix: ${fixedValue}` : 'Use "true" or "false"',
                value,
                fixedValue
            );
        } else if (value !== lowerValue) {
            this.addWarning(
                row,
                fieldName,
                'Boolean value should be lowercase',
                `Suggested fix: ${lowerValue}`,
                value,
                lowerValue
            );
        }
    }

    /**
     * Numeric validation - decimal format
     */
    validateNumeric(row, fieldName, value) {
        const numericPattern = /^-?\d+(\.\d+)?$/;
        const cleanedValue = value.replace(/[,\s]/g, '');

        if (!numericPattern.test(cleanedValue)) {
            this.addError(
                row,
                fieldName,
                `Invalid numeric format: ${value}`,
                'Use raw format with dot as decimal separator (e.g., 1234567890.12)',
                value
            );
        } else if (value !== cleanedValue) {
            this.addWarning(
                row,
                fieldName,
                'Numeric value contains formatting characters',
                `Suggested fix: ${cleanedValue} (removed commas and spaces)`,
                value,
                cleanedValue
            );
        }

        // Check decimal places
        if (cleanedValue.includes('.')) {
            const decimalPlaces = cleanedValue.split('.')[1].length;
            if (decimalPlaces > 2) {
                const fixedValue = parseFloat(cleanedValue).toFixed(2);
                this.addWarning(
                    row,
                    fieldName,
                    'UNESCO recommends 2 decimal places for numeric values',
                    `Suggested fix: ${fixedValue}`,
                    value,
                    fixedValue
                );
            }
        }
    }

    /**
     * Gender validation - Schema.org GenderType
     */
    validateGender(row, fieldName, value) {
        const validValues = ['male', 'female'];
        const lowerValue = value.toLowerCase();

        if (!validValues.includes(lowerValue)) {
            const fixedValue = lowerValue.startsWith('m') ? 'male' : lowerValue.startsWith('f') ? 'female' : null;
            this.addError(
                row,
                fieldName,
                `Invalid gender value. Expected "male" or "female" (lowercase): ${value}`,
                fixedValue ? `Suggested fix: ${fixedValue}` : 'Use "male" or "female"',
                value,
                fixedValue
            );
        } else if (value !== lowerValue) {
            this.addWarning(
                row,
                fieldName,
                'Gender value should be lowercase',
                `Suggested fix: ${lowerValue}`,
                value,
                lowerValue
            );
        }
    }

    /**
     * HTML content validation
     */
    validateHTML(row, fieldName, value) {
        const allowedTags = ['h2', 'h3', 'h4', 'ul', 'li', 'a', 'p'];
        const htmlPattern = /<([a-z][a-z0-9]*)\b[^>]*>/gi;
        const matches = value.matchAll(htmlPattern);

        for (let match of matches) {
            const tag = match[1].toLowerCase();
            if (!allowedTags.includes(tag)) {
                this.addWarning(
                    row,
                    fieldName,
                    `HTML tag <${tag}> is not in the allowed list`,
                    `Allowed tags: ${allowedTags.map(t => `<${t}>`).join(', ')}`,
                    value
                );
            }
        }
    }

    /**
     * Coordinates validation
     */
    validateCoordinates(row, fieldName, value) {
        // Check for GeoJSON format
        if (value.trim().startsWith('{')) {
            try {
                const geojson = JSON.parse(value);
                if (!geojson.type || !geojson.coordinates) {
                    this.addError(
                        row,
                        fieldName,
                        'Invalid GeoJSON format',
                        'GeoJSON must have "type" and "coordinates" properties',
                        value
                    );
                }
            } catch (e) {
                this.addError(
                    row,
                    fieldName,
                    `Invalid GeoJSON: ${e.message}`,
                    'Ensure proper JSON format for GeoJSON',
                    value
                );
            }
        } else {
            // Check for x,y format
            const coordPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
            if (!coordPattern.test(value)) {
                this.addError(
                    row,
                    fieldName,
                    'Invalid coordinate format',
                    'Use format: x,y (e.g., 48.8566,2.3522) or GeoJSON',
                    value
                );
            } else {
                const [lat, lon] = value.split(',').map(Number);
                if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                    this.addError(
                        row,
                        fieldName,
                        'Coordinates out of range',
                        'Latitude must be between -90 and 90, longitude between -180 and 180',
                        value
                    );
                }
            }
        }
    }

    /**
     * UUID and ID validation
     */
    validateIdentifiers(row, headers, rowNumber) {
        const hasIdColumn = headers.some(h => h.toLowerCase() === 'id');
        const hasUuidColumn = headers.some(h => h.toLowerCase() === 'uuid');

        if (hasIdColumn) {
            const idIndex = headers.findIndex(h => h.toLowerCase() === 'id');
            const idValue = row[idIndex];

            if (this.isEmptyValue(idValue)) {
                this.addError(
                    rowNumber,
                    'id',
                    'ID field is required',
                    'Provide a standard ID (e.g., DCE001)',
                    idValue
                );
            } else {
                // Validate ID format (2-3 letters + digits)
                const idPattern = /^[A-Z]{2,3}\d+$/;
                if (!idPattern.test(idValue)) {
                    this.addError(
                        rowNumber,
                        'id',
                        `Invalid ID format: ${idValue}`,
                        'ID should be 2-3 uppercase letters followed by digits (e.g., DCE001)',
                        idValue
                    );
                }
            }
        }

        if (hasUuidColumn) {
            const uuidIndex = headers.findIndex(h => h.toLowerCase() === 'uuid');
            const uuidValue = row[uuidIndex];

            if (this.isEmptyValue(uuidValue)) {
                const newUuid = this.generateUUID();
                this.addWarning(
                    rowNumber,
                    'uuid',
                    'UUID field is empty',
                    `Suggested fix: ${newUuid}`,
                    uuidValue,
                    newUuid
                );
            } else {
                // Validate UUID v4 format
                const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidPattern.test(uuidValue)) {
                    const newUuid = this.generateUUID();
                    this.addError(
                        rowNumber,
                        'uuid',
                        `Invalid UUID v4 format: ${uuidValue}`,
                        `Suggested fix: ${newUuid}`,
                        uuidValue,
                        newUuid
                    );
                }
            }
        }

        if (!hasIdColumn) {
            this.addWarning(
                rowNumber,
                'id',
                'Missing "id" column in dataset',
                'Add an "id" column with standard IDs (e.g., DCE001)',
                ''
            );
        }

        if (!hasUuidColumn) {
            this.addWarning(
                rowNumber,
                'uuid',
                'Missing "uuid" column in dataset',
                'Add a "uuid" column with UUID v4 identifiers',
                ''
            );
        }
    }

    /**
     * Helper methods
     */
    isEmptyValue(value) {
        return value === null || value === undefined || value === '' || value.trim() === '';
    }

    isRequiredField(fieldName) {
        const requiredFields = ['id', 'uuid', 'title', 'description'];
        return requiredFields.includes(fieldName.toLowerCase());
    }

    isDateField(fieldName) {
        return fieldName.includes('date') || fieldName.includes('created') || fieldName.includes('updated') || fieldName.includes('published');
    }

    isArrayField(fieldName) {
        return fieldName.includes('terms') || fieldName.includes('themes') || fieldName.includes('categories') || fieldName.includes('tags');
    }

    isCountryCodeField(fieldName) {
        return fieldName.includes('country_code') || fieldName === 'country' || fieldName.endsWith('_country');
    }

    isLanguageCodeField(fieldName) {
        return fieldName.includes('language_code') || fieldName.includes('lang') || fieldName === 'language';
    }

    isBooleanField(fieldName) {
        return fieldName.startsWith('is_') || fieldName.startsWith('has_') || fieldName.includes('_flag') || fieldName.includes('enabled') || fieldName.includes('active');
    }

    isNumericField(fieldName) {
        return fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('value') || fieldName.includes('count') || fieldName.includes('number') || fieldName.includes('quantity');
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    addError(row, field, message, suggestion, originalValue, fixedValue = null) {
        this.errors.push({
            row,
            field,
            message,
            suggestion,
            originalValue,
            type: 'error'
        });

        if (fixedValue) {
            if (!this.fixes[row]) this.fixes[row] = {};
            this.fixes[row][field] = fixedValue;
        }
    }

    addWarning(row, field, message, suggestion, originalValue, fixedValue = null) {
        this.warnings.push({
            row,
            field,
            message,
            suggestion,
            originalValue,
            type: 'warning'
        });

        if (fixedValue) {
            if (!this.fixes[row]) this.fixes[row] = {};
            this.fixes[row][field] = fixedValue;
        }
    }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UNESCOValidator;
}
