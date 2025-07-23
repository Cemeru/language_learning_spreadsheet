function deleteRowsIfEquals() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Change these to the columns you want to compare
  const col1 = "C";
  const col2 = "D";

  // Convert column letters to numbers (e.g. C=3, D=4)
  const col1Num = columnLetterToNumber(col1);
  const col2Num = columnLetterToNumber(col2);

  // Get the values for both columns from row 1 to lastRow
  const valuesCol1 = sheet.getRange(1, col1Num, lastRow).getValues();
  const valuesCol2 = sheet.getRange(1, col2Num, lastRow).getValues();

  // Iterate from bottom to top to safely delete rows
  for (let i = lastRow - 1; i >= 0; i--) {
    if (valuesCol1[i][0] === valuesCol2[i][0]) {
      sheet.deleteRow(i + 1);
    }
  }
}

// Helper to convert column letter (e.g. "C") to column number (e.g. 3)
function columnLetterToNumber(letter) {
  let column = 0;
  const length = letter.length;
  for (let i = 0; i < length; i++) {
    column *= 26;
    column += letter.charCodeAt(i) - 64; // 'A' is 65 in ASCII
  }
  return column;
}
