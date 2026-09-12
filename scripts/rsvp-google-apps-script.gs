/**
 * Paste into Extensions → Apps Script on your RSVP Google Sheet.
 *
 * Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into .env as VITE_RSVP_SHEET_URL
 *
 * After editing this file, deploy a NEW version (Manage deployments → Edit → New version).
 */

var SHEET_NAME = 'RSVPs'

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'ping'
    if (action === 'list') {
      return json_({ ok: true, rows: listRows_() })
    }
    return ContentService.createTextOutput('RSVP endpoint is live').setMimeType(
      ContentService.MimeType.TEXT,
    )
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    var sheet = ensureSheet_()

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

function ensureSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Attending', 'Guests'])
    sheet.setFrozenRows(1)
  }
  return sheet
}

function listRows_() {
  var sheet = ensureSheet_()
  var values = sheet.getDataRange().getValues()
  if (values.length < 2) return []

  var rows = []
  for (var i = 1; i < values.length; i++) {
    var row = values[i]
    var name = String(row[1] || '').trim()
    if (!name) continue
    var ts = row[0]
    rows.push({
      id: i,
      timestamp: ts instanceof Date ? ts.toISOString() : String(ts || ''),
      name: name,
      email: String(row[2] || '').trim(),
      attending: String(row[3] || '').trim().toLowerCase(),
      guests: Number(row[4]) || 1,
    })
  }
  return rows
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
