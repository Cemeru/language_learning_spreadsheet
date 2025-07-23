function removeDuplicateRowsByColumn() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  const columnLetter = "C"; // Change this to target another column if needed
  const colNum = columnLetterToNumber(columnLetter);

  const range = sheet.getRange(1, colNum, lastRow);
  const values = range.getValues();

  const seen = new Set();
  const rowsToDelete = [];

  for (let i = values.length - 1; i >= 0; i--) {
    const val = values[i][0].toString().trim();
    if (val !== "") {
      if (seen.has(val)) {
        rowsToDelete.push(i + 1);
      } else {
        seen.add(val);
      }
    }
  }

  rowsToDelete.forEach(row => {
    sheet.deleteRow(row);
  });

  Logger.log("Deleted " + rowsToDelete.length + " duplicate rows.");
}

function columnLetterToNumber(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column = column * 26 + (letter.charCodeAt(i) - 64);
  }
  return column;
}
