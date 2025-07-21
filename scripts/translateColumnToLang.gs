function translateColumnToLang() {
  // Get the active sheet from the currently open spreadsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Define the range from C1 to C1000 (source texts to translate)
  const sourceRange = sheet.getRange("C1:C1000");
  // Get the values from the source range as a 2D array
  const sourceValues = sourceRange.getValues();

  // Prepare an empty array to store the translated results
  const translatedValues = [];

  // Loop through each row of sourceValues
  for (let i = 0; i < sourceValues.length; i++) {
    // Get the text in column C at the current row
    const originalText = sourceValues[i][0];
    // If the cell is not empty, translate it
    if (originalText !== "") {
      try {
        // Translate the text automatically detected to the desired language (en for English)
        const translatedText = LanguageApp.translate(originalText, "", "en");
        // Convert the translated text to lowercase and add to the array
        translatedValues.push([translatedText.toLowerCase()]);
        // Pause 200 milliseconds to avoid hitting Google Translate API limits
        Utilities.sleep(200);
      } catch (e) {
        // If an error occurs during translation, log it and add empty string
        Logger.log("Translation failed at row " + (i + 1) + ": " + e.message);
        translatedValues.push([""]);
      }
    } else {
      // If the cell is empty, just add an empty string in the output array
      translatedValues.push([""]);
    }
  }

  // Define the target range in column D from D1 to D1000 for output
  const targetRange = sheet.getRange("D1:D1000");
  // Write all translated values back into the sheet in one operation
  targetRange.setValues(translatedValues);
}
