function deleteRowIfCNotInE() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // Start from the last row to avoid issues when deleting rows
  for (let i = values.length - 1; i >= 0; i--) {
    const word = (values[i][2] || "").toString().trim().toLowerCase(); // Column C (index 2)
    const phrase = (values[i][4] || "").toString().trim().toLowerCase(); // Column E (index 4)

    if (word && !phrase.includes(word)) {
      sheet.deleteRow(i + 1);
    }
  }

  SpreadsheetApp.getUi().alert("✅ Rows successfully removed.");
}
