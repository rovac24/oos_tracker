// OOS Note Logger — Standalone Script
// Create this at script.google.com (NOT from inside the sheet)
// Set "Execute as" = Me, "Who has access" = Anyone

var SPREADSHEET_ID = '11y8stNtYYHE8jgPWDRUQvsSazNGgwtHFFHdqROfEN7g'
var SHEET_NAME = 'test'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAME);
 
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Order Date',
        'Placed Order #',
        'Retailer Name',
        'OOS SKU',
        'Units Ordered',
        'Units Unvailable',
        'Unit Price',
        'Total',
        'Sub Offered',
        'Sub Accepted',
        'Subbed SKU'
      ]);
    }
 
    const items = data.items || [];
 
    // Repeat order-level info on every row
    items.forEach(function(item) {
      sheet.appendRow([
        data.orderDate,
        data.placedOrder,
        data.retailerName,
        item.oosSku,
        item.unitsOrdered,
        item.unitsUnavailable,
        item.unitPrice,
        item.total,
        item.subOffered,
        item.subAccepted,
        item.subbedSku
      ]);
    });
 
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
 
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
 
function testSetup() {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(SHEET_NAME);
  Logger.log('Connected to sheet: ' + sheet.getName());
  Logger.log('Last row: ' + sheet.getLastRow());
}