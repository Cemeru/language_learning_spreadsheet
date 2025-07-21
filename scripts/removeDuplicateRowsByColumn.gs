function removeDuplicateRowsByColumn() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange("C1:C" + lastRow);
  const values = range.getValues();

  const seen = new Set();
  const rowsToDelete = [];

  // Iterate from bottom to top to avoid row shifting issues when deleting
  for (let i = values.length - 1; i >= 0; i--) {
    const val = values[i][0].toString().trim();
    if (val !== "") {
      if (seen.has(val)) {
        rowsToDelete.push(i + 1); // Sheet rows are 1-based, arrays 0-based
      } else {
        seen.add(val);
      }
    }
  }

  // Delete duplicate rows, starting from the bottom
  rowsToDelete.forEach(row => {
    sheet.deleteRow(row);
  });

  Logger.log("Deleted " + rowsToDelete.length + " duplicate rows.");
}
