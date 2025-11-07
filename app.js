/**
 * UNESCO Data Quality Checker - Main Application
 */

class UNESCODataChecker {
    constructor() {
        this.validator = new UNESCOValidator();
        this.currentFile = null;
        this.parsedData = null;
        this.headers = null;
        this.validationResults = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const removeBtn = document.getElementById('removeBtn');

        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // Click to browse
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Remove file
        removeBtn.addEventListener('click', () => {
            this.resetUpload();
        });

        // Export buttons
        const exportBtn = document.getElementById('exportBtn');
        const downloadFixedBtn = document.getElementById('downloadFixedBtn');

        exportBtn.addEventListener('click', () => {
            this.exportReport();
        });

        downloadFixedBtn.addEventListener('click', () => {
            this.downloadFixedCSV();
        });

        // Filter tabs
        const filterTabs = document.querySelectorAll('.tab-btn');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filter = tab.dataset.filter;
                this.filterIssues(filter);
            });
        });
    }

    handleFileSelect(file) {
        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file');
            return;
        }

        this.currentFile = file;
        this.showFilePreview(file);
        this.parseCSV(file);
    }

    showFilePreview(file) {
        const dropZone = document.getElementById('dropZone');
        const filePreview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        dropZone.style.display = 'none';
        filePreview.style.display = 'block';

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    parseCSV(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            this.processCSV(text);
        };

        reader.onerror = () => {
            alert('Error reading file');
        };

        reader.readAsText(file);
    }

    processCSV(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');

        if (lines.length === 0) {
            alert('CSV file is empty');
            return;
        }

        // Parse headers
        this.headers = this.parseCSVLine(lines[0]);

        // Parse data rows
        this.parsedData = [];
        for (let i = 1; i < lines.length; i++) {
            const row = this.parseCSVLine(lines[i]);
            if (row.length > 0) {
                this.parsedData.push(row);
            }
        }

        this.startValidation();
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    startValidation() {
        const validationSection = document.getElementById('validationSection');
        const resultsSection = document.getElementById('resultsSection');

        validationSection.style.display = 'block';
        resultsSection.style.display = 'none';

        this.updateProgress(0, 'Starting validation...');

        // Simulate progress for better UX
        setTimeout(() => {
            this.updateProgress(30, 'Parsing CSV data...');
            setTimeout(() => {
                this.updateProgress(60, 'Validating against UNESCO standards...');
                setTimeout(() => {
                    this.performValidation();
                }, 500);
            }, 300);
        }, 200);
    }

    updateProgress(percent, status) {
        const progressBar = document.getElementById('progressBar');
        const validationStatus = document.getElementById('validationStatus');

        progressBar.style.width = percent + '%';
        validationStatus.textContent = status;
    }

    performValidation() {
        this.validationResults = this.validator.validate(this.parsedData, this.headers);

        this.updateProgress(100, 'Validation complete!');

        setTimeout(() => {
            this.displayResults();
        }, 500);
    }

    displayResults() {
        const validationSection = document.getElementById('validationSection');
        const resultsSection = document.getElementById('resultsSection');

        validationSection.style.display = 'none';
        resultsSection.style.display = 'block';

        this.updateSummary();
        this.displayIssues();
    }

    updateSummary() {
        const compliantCount = document.getElementById('compliantCount');
        const errorCount = document.getElementById('errorCount');
        const totalCount = document.getElementById('totalCount');

        const totalRows = this.parsedData.length;
        const rowsWithErrors = new Set([
            ...this.validationResults.errors.map(e => e.row),
            ...this.validationResults.warnings.map(w => w.row)
        ]).size;

        compliantCount.textContent = totalRows - rowsWithErrors;
        errorCount.textContent = rowsWithErrors;
        totalCount.textContent = totalRows;
    }

    displayIssues() {
        const issuesList = document.getElementById('issuesList');

        const allIssues = [
            ...this.validationResults.errors,
            ...this.validationResults.warnings
        ].sort((a, b) => a.row - b.row);

        if (allIssues.length === 0) {
            issuesList.innerHTML = `
                <div class="no-issues">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3>All checks passed!</h3>
                    <p>Your CSV file complies with UNESCO data quality standards.</p>
                </div>
            `;
            return;
        }

        issuesList.innerHTML = allIssues.map(issue => this.createIssueCard(issue)).join('');
    }

    createIssueCard(issue) {
        return `
            <div class="issue-card ${issue.type}" data-type="${issue.type}">
                <div class="issue-header">
                    <div class="issue-title">${issue.message}</div>
                    <span class="issue-badge ${issue.type}">${issue.type}</span>
                </div>
                <div class="issue-location">
                    Row ${issue.row}, Column: ${issue.field}
                </div>
                ${issue.originalValue ? `
                    <div class="issue-details">
                        Current value: <code>${this.escapeHtml(issue.originalValue)}</code>
                    </div>
                ` : ''}
                <div class="issue-suggestion">
                    <strong>Suggested Action:</strong>
                    <span>${this.escapeHtml(issue.suggestion)}</span>
                </div>
            </div>
        `;
    }

    filterIssues(filter) {
        const issueCards = document.querySelectorAll('.issue-card');

        issueCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                card.style.display = card.dataset.type === filter ? 'block' : 'none';
            }
        });
    }

    exportReport() {
        const report = {
            fileName: this.currentFile.name,
            timestamp: new Date().toISOString(),
            summary: {
                totalRows: this.parsedData.length,
                compliantRows: this.parsedData.length - new Set([
                    ...this.validationResults.errors.map(e => e.row),
                    ...this.validationResults.warnings.map(w => w.row)
                ]).size,
                errors: this.validationResults.errors.length,
                warnings: this.validationResults.warnings.length
            },
            issues: [
                ...this.validationResults.errors,
                ...this.validationResults.warnings
            ]
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unesco-validation-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadFixedCSV() {
        if (Object.keys(this.validationResults.fixes).length === 0) {
            alert('No automatic fixes available. Please manually correct the issues.');
            return;
        }

        const fixedData = this.applyFixes();
        const csv = this.convertToCSV(fixedData);

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fixed-${this.currentFile.name}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    applyFixes() {
        const fixedData = this.parsedData.map((row, index) => {
            const actualRowNumber = index + 2;
            const fixes = this.validationResults.fixes[actualRowNumber];

            if (!fixes) return row;

            const newRow = [...row];
            Object.keys(fixes).forEach(fieldName => {
                const colIndex = this.headers.findIndex(h => h === fieldName);
                if (colIndex !== -1) {
                    newRow[colIndex] = fixes[fieldName];
                }
            });

            return newRow;
        });

        return fixedData;
    }

    convertToCSV(data) {
        const escapeCSVValue = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const rows = [
            this.headers.map(escapeCSVValue).join(','),
            ...data.map(row => row.map(escapeCSVValue).join(','))
        ];

        return rows.join('\n');
    }

    resetUpload() {
        const dropZone = document.getElementById('dropZone');
        const filePreview = document.getElementById('filePreview');
        const validationSection = document.getElementById('validationSection');
        const resultsSection = document.getElementById('resultsSection');
        const fileInput = document.getElementById('fileInput');

        dropZone.style.display = 'block';
        filePreview.style.display = 'none';
        validationSection.style.display = 'none';
        resultsSection.style.display = 'none';

        fileInput.value = '';
        this.currentFile = null;
        this.parsedData = null;
        this.headers = null;
        this.validationResults = null;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UNESCODataChecker();
});
