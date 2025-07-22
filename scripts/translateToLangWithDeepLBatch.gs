function translateToLangWithDeepLBatch() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const deepLApiKey = "DeepL_API_KEY"; // Substitute with your actual API key
  const deepLUrl = "https://api-free.deepl.com/v2/translate"; // Free-tier endpoint

  // Configuration
  const sourceLang = "ID";
  const targetLang = "EN";
  const sourceCol = "C";
  const targetCol = "D";
  const startRow = 1;
  const endRow = 1000; // Beware of Apps Script execution time limits
  const batchSize = 50; // DeepL free tier max texts per request

  // Convert column letters to numbers for getRange
  const sourceColNum = columnLetterToNumber(sourceCol);
  const targetColNum = columnLetterToNumber(targetCol);

  // Get source texts
  const sourceRange = sheet.getRange(startRow, sourceColNum, endRow - startRow + 1);
  const sourceValues = sourceRange.getValues();

  // Prepare arrays to hold texts to translate and their indices
  const textsToTranslate = [];
  const rowIndices = [];

  sourceValues.forEach((row, index) => {
    const text = row[0];
    if (text && text.toString().trim() !== "") {
      textsToTranslate.push(text);
      rowIndices.push(index);
    }
  });

  // Prepare output array, initialize with empty strings
  const translatedValues = sourceValues.map(() => [""]);

  // Helper function to perform the API request for a batch
  function translateBatch(texts) {
    const payload = {
      text: texts,
      source_lang: sourceLang,
      target_lang: targetLang,
    };
    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "DeepL-Auth-Key " + deepLApiKey,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    try {
      const response = UrlFetchApp.fetch(deepLUrl, options);
      if (response.getResponseCode() === 200) {
        const json = JSON.parse(response.getContentText());
        if (json.translations && json.translations.length === texts.length) {
          return json.translations.map(t => t.text.toLowerCase());
        } else {
          Logger.log("Unexpected response structure or length mismatch");
          return null;
        }
      } else {
        Logger.log("DeepL API error. Status: " + response.getResponseCode());
        return null;
      }
    } catch (error) {
      Logger.log("Error during DeepL request: " + error.message);
      return null;
    }
  }

  // Process batches sequentially
  for (let start = 0; start < textsToTranslate.length; start += batchSize) {
    const batchTexts = textsToTranslate.slice(start, start + batchSize);
    Logger.log(`Translating batch ${start} to ${start + batchTexts.length}`);

    const translations = translateBatch(batchTexts);

    if (translations) {
      translations.forEach((translatedText, i) => {
        const originalIndex = rowIndices[start + i];
        translatedValues[originalIndex] = [translatedText];
      });
    }

    // Pause to respect API limits and avoid throttling
    Utilities.sleep(700);
  }

  // Write translated values back to target column
  const targetRange = sheet.getRange(startRow, targetColNum, endRow - startRow + 1);
  targetRange.setValues(translatedValues);
}

// Helper function to convert column letter to number (A=1, B=2...)
function columnLetterToNumber(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column *= 26;
    column += letter.charCodeAt(i) - 64; // 'A' is 65 in ASCII
  }
  return column;
}
