/**
 * Paste this into Extensions → Apps Script on your RSVP Google Sheet.
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into .env as VITE_RSVP_SHEET_URL
 */

var SHEET_NAME = 'RSVPs'

function doGet() {
  return ContentService.createTextOutput('RSVP endpoint is live').setMimeType(
    ContentService.MimeType.TEXT,
  )
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME)
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Attending', 'Guests'])
      sheet.setFrozenRows(1)
    }

    var name = String(data.name || '').trim()
    var email = String(data.email || '').trim()
    var attending = String(data.attending || '').trim()
    var guests = Number(data.guests) || 1

    if (!name) {
      return json_({ ok: false, error: 'Name is required' })
    }

    sheet.appendRow([new Date(), name, email, attending, guests])
    return json_({ ok: true })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
