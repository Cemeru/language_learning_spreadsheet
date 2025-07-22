function generateSentenceAndTranslation() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const openaiKey = "YOUR_OPENAI_KEY"; // Your OpenAI API Key

  const langFrom = "id";
  const langTo = "en";
  const colWord = "C";
  const colSentence = "E";
  const colTranslation = "F";
  const startRow = 1;
  const endRow = 5803;

  const colWordNum = columnLetterToNumber(colWord);
  const colSentenceNum = columnLetterToNumber(colSentence);
  const colTranslationNum = columnLetterToNumber(colTranslation);

  const numRows = endRow - startRow + 1;

  const words = sheet.getRange(startRow, colWordNum, numRows).getValues();
  const existingSentences = sheet.getRange(startRow, colSentenceNum, numRows).getValues();
  const existingTranslations = sheet.getRange(startRow, colTranslationNum, numRows).getValues();

  const langNames = {
    id: "Indonesian",
    es: "Spanish",
    fr: "French",
    de: "German",
    pt: "Portuguese",
  };
  const langFromName = langNames[langFrom] || langFrom;
  const langToName = langNames[langTo] || langTo;

  const outputSentences = [];
  const outputTranslations = [];
  const rowsToUpdate = [];

  for (let i = 0; i < numRows; i++) {
    const word = (words[i][0] || "").toString().trim();
    const sentenceCell = (existingSentences[i][0] || "").toString().trim();
    const translationCell = (existingTranslations[i][0] || "").toString().trim();

    if (word && !sentenceCell && !translationCell) {
      try {
        const prompt = buildPrompt(word, langFrom, langFromName);

        const sentence = callOpenAI(prompt, openaiKey);

        const translationPrompt = `Translate this ${langFromName} sentence to ${langToName}: "${sentence}". Return only the ${langToName} sentence without a period in the end.`;
        const translation = callOpenAI(translationPrompt, openaiKey);

        outputSentences[i] = [sentence];
        outputTranslations[i] = [translation];
        rowsToUpdate.push(i);

        Logger.log(`✅ Row ${startRow + i}: '${word}' → ${sentence} → ${translation}`);
        Utilities.sleep(800);

        if (rowsToUpdate.length >= 50) {
          commitBatch(sheet, startRow, rowsToUpdate, outputSentences, outputTranslations, colSentenceNum, colTranslationNum);
          rowsToUpdate.length = 0;
        }
      } catch (e) {
        Logger.log(`❌ Error at row ${startRow + i}: ${e.message}`);
        outputSentences[i] = [""];
        outputTranslations[i] = [""];
      }
    } else {
      outputSentences[i] = [sentenceCell];
      outputTranslations[i] = [translationCell];
    }
  }

  if (rowsToUpdate.length > 0) {
    commitBatch(sheet, startRow, rowsToUpdate, outputSentences, outputTranslations, colSentenceNum, colTranslationNum);
  }
}

// === Helpers ===

function callOpenAI(prompt, apiKey) {
  const payload = {
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You are a helpful language assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 60
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + apiKey },
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
  const result = JSON.parse(response.getContentText());
  return result.choices[0].message.content.trim();
}

function columnLetterToNumber(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column = column * 26 + (letter.charCodeAt(i) - 64);
  }
  return column;
}

function buildPrompt(word, langCode, langName) {
  let prompt = `Write a natural ${langName} sentence using the word '${word}' in context. The sentence must be at most 5 words.`;
  if (langCode === "id") {
    prompt += ` Do not use 'sangat' or 'sekali'.`;
  }
  prompt += ` Return only the sentence without a period at the end.`;
  return prompt;
}

function commitBatch(sheet, startRow, rowIndexes, sentenceData, translationData, colSentenceNum, colTranslationNum) {
  rowIndexes.forEach(i => {
    const row = startRow + i;
    sheet.getRange(row, colSentenceNum).setValue(sentenceData[i][0]);
    sheet.getRange(row, colTranslationNum).setValue(translationData[i][0]);
  });
  Logger.log(`💾 Committed ${rowIndexes.length} rows`);
}
