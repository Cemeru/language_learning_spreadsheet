function generateSentenceAndTranslation() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const apiKey = "YOUR_OPENAI_API_KEY"; // Replace with your actual OPENAI key

  // === CONFIG ===
  const langFrom = "id";
  const langTo = "en";
  const colWord = "C";
  const colSentence = "E";
  const colTranslation = "F";

  const colWordNum = columnLetterToNumber(colWord);
  const colSentenceNum = columnLetterToNumber(colSentence);
  const colTranslationNum = columnLetterToNumber(colTranslation);

  const lastRow = sheet.getLastRow();

  const words = sheet.getRange(1, colWordNum, lastRow).getValues();
  const existingSentences = sheet.getRange(1, colSentenceNum, lastRow).getValues();
  const existingTranslations = sheet.getRange(1, colTranslationNum, lastRow).getValues();

  const langNames = {
    id: "Indonesian",
    es: "Spanish",
    fr: "French",
    de: "German",
    pt: "Portuguese",
  };

  const langFromName = langNames[langFrom] || langFrom;

  const outputSentences = [];
  const outputTranslations = [];

  for (let i = 0; i < words.length; i++) {
    const word = (words[i][0] || "").toString().trim();
    const sentenceCell = (existingSentences[i][0] || "").toString().trim();
    const translationCell = (existingTranslations[i][0] || "").toString().trim();

    if (word && !sentenceCell && !translationCell) {
      try {
        const prompt = buildPrompt(word, langFrom, langFromName);

        const payload = {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `You are a helpful assistant that creates short example sentences in ${langFromName}.` },
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
        const sentence = result.choices[0].message.content.trim();

        const translation = LanguageApp.translate(sentence, langFrom, langTo);

        outputSentences.push([sentence]);
        outputTranslations.push([translation]);

        Logger.log(`Row ${i + 1}: '${word}' → ${sentence} → ${translation}`);
        Utilities.sleep(1000); // Be gentle with OpenAI's rate limit
      } catch (e) {
        Logger.log(`❌ Error at row ${i + 1}: ${e.message}`);
        outputSentences.push([""]);
        outputTranslations.push([""]);
      }
    } else {
      outputSentences.push([sentenceCell]);
      outputTranslations.push([translationCell]);
    }
  }

  sheet.getRange(1, colSentenceNum, lastRow).setValues(outputSentences);
  sheet.getRange(1, colTranslationNum, lastRow).setValues(outputTranslations);
}

// === Helpers ===

// Converts column letter (e.g. "C") to number (e.g. 3)
function columnLetterToNumber(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column = column * 26 + (letter.charCodeAt(i) - 64);
  }
  return column;
}

// Builds a language-specific prompt
function buildPrompt(word, langCode, langName) {
  let prompt = `Write a natural ${langName} sentence using the word '${word}' in context. The sentence must be at most 5 words.`;

  if (langCode === "id") {
    prompt += ` Do not use 'sangat' or 'sekali'.`;
  }

  prompt += ` Return only the sentence.`;
  return prompt;
}
