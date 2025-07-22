function exportToAnkiTSV() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Deck"); // <- Important

  // === CONFIG ===
  const colCondition = "A";
  const colFront = "E";
  const colBack = "F";
  const startRow = 1;
  const endRow = sheet.getLastRow();

  const colCondNum = columnLetterToNumber(colCondition);
  const colFrontNum = columnLetterToNumber(colFront);
  const colBackNum = columnLetterToNumber(colBack);
  const numRows = endRow - startRow + 1;

  const cond = sheet.getRange(startRow, colCondNum, numRows).getValues();
  const fronts = sheet.getRange(startRow, colFrontNum, numRows).getValues();
  const backs = sheet.getRange(startRow, colBackNum, numRows).getValues();

  let lines = [];

  for (let i = 0; i < numRows; i++) {
    const conditionEmpty = (cond[i][0] || "").toString().trim() === "";
    const front = (fronts[i][0] || "").toString().trim();
    const back = (backs[i][0] || "").toString().trim();

    if (conditionEmpty && front && back) {
      lines.push(`${front}\t${back}`);
    }
  }

  const content = lines.join("\n");

  // Save as TSV in Google Drive
  const fileName = "anki_export.tsv";
  const folder = DriveApp.getRootFolder(); // or DriveApp.getFolderById("your-folder-id")
  const file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);

  Logger.log("✅ Exported file: " + file.getUrl());
  //SpreadsheetApp.getUi().alert("✅ TSV file created!\nClick OK to open it.", SpreadsheetApp.getUi().ButtonSet.OK);
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(`<a href="${file.getUrl()}" target="_blank">👉 Click here to download TSV file</a>`),
    "Anki Export"
  );
}

// Helper
function columnLetterToNumber(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column = column * 26 + (letter.charCodeAt(i) - 64);
  }
  return column;
}
