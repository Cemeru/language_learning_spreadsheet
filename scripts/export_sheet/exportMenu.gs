function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🚀 Actions")
    .addItem("Export to Anki", "exportToAnkiTSV")
    .addToUi();
}
