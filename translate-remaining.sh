#!/bin/bash

# Script to help identify files with Chinese comments that need translation
# This script creates a report of all files with Chinese comments

OUTPUT_FILE="chinese-comments-report.txt"

echo "Files with Chinese comments in src/components/flow:" > "$OUTPUT_FILE"
echo "=====================================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Find all TypeScript/TSX files with Chinese comments
grep -r "//.*[\u4e00-\u9fff]" src/components/flow --include="*.tsx" --include="*.ts" -l | sort | while read -r file; do
    echo "File: $file" >> "$OUTPUT_FILE"
    echo "Chinese comment lines:" >> "$OUTPUT_FILE"
    grep -n "//.*[\u4e00-\u9fff]" "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo "Report generated: $OUTPUT_FILE"
echo "Total files with Chinese comments:"
grep -r "//.*[\u4e00-\u9fff]" src/components/flow --include="*.tsx" --include="*.ts" -l | wc -l
echo "Total lines with Chinese comments:"
grep -r "//.*[\u4e00-\u9fff]" src/components/flow --include="*.tsx" --include="*.ts" | wc -l
