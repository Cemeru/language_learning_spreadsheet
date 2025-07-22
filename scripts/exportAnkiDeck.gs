function exportAnkiDeck() {
  // === CONFIG ===
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const frontColLetter = "E"; // Sentence (front)
  const backColLetter = "F";  // Translation (back)
  const conditionColLetter = "A"; // Only export rows where this column is empty
  const startRow = 1; // No header

  // === Convert letters to column numbers ===
  const frontCol = columnLetterToNumber(frontColLetter);
  const backCol = columnLetterToNumber(backColLetter);
  const conditionCol = columnLetterToNumber(conditionColLetter);
  const lastRow = sheet.getLastRow();
  const numRows = lastRow - startRow + 1;

  const values = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();

  let tsvContent = "";

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const conditionValue = (row[conditionCol - 1] || "").toString().trim();
    const front = (row[frontCol - 1] || "").toString().trim();
    const back = (row[backCol - 1] || "").toString().trim();

    if (!conditionValue && front && back) {
      tsvContent += `${front}\t${back}\n`;
    }
  }

  const file = DriveApp.createFile("anki_export.tsv", tsvContent, MimeType.PLAIN_TEXT);
  Logger.log("✅ Export complete. File ID: " + file.getId());
}

// Helper to convert column letters (e.g. "A") to numbers (e.g. 1)
function columnLetterToNumber(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column = column * 26 + (letter.charCodeAt(i) - 64);
  }
  return column;
}
