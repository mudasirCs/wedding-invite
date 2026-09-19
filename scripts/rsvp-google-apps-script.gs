/**
 * Paste into Extensions → Apps Script on your RSVP Google Sheet.
 *
 * Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into .env as VITE_RSVP_SHEET_URL
 *
 * After editing this file, deploy a NEW version (Manage deployments → Edit → New version).
 *
 * Columns: Timestamp | Name | Phone | Attending | Language
 */

var SHEET_NAME = 'RSVPs'
var HEADERS = ['Timestamp', 'Name', 'Phone', 'Attending', 'Language']

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list'
    if (action === 'ping') {
      return ContentService.createTextOutput('RSVP endpoint is live').setMimeType(
        ContentService.MimeType.TEXT,
      )
    }
    return json_({ ok: true, rows: listRows_() })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    var sheet = ensureSheet_()

    var name = String(data.name || '').trim()
    var phone = String(data.phone || '').trim()
    var attending = String(data.attending || '').trim()
    var lang = String(data.lang || '').trim()

    if (!name) {
      return json_({ ok: false, error: 'Name is required' })
    }
    if (!phone) {
      return json_({ ok: false, error: 'Phone is required' })
    }
    if (attending !== 'yes' && attending !== 'no') {
      return json_({ ok: false, error: 'Please choose yes or no' })
    }

    // Force phone as plain text so "+1 ..." is not parsed as a formula (#ERROR!)
    var phoneCell = phone
    if (/^[+=@-]/.test(phoneCell)) {
      phoneCell = "'" + phoneCell
    }

    sheet.appendRow([new Date(), name, phoneCell, attending, lang])
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
    sheet.appendRow(HEADERS)
    sheet.setFrozenRows(1)
    return sheet
  }

  var width = Math.max(sheet.getLastColumn(), HEADERS.length)
  var first = sheet.getRange(1, 1, 1, width).getValues()[0]
  var h4 = String(first[4] || '').toLowerCase()
  if (!String(first[0] || '').trim() || h4.indexOf('lang') === -1) {
    // Update header row only — delete old test rows in the Sheet if column meanings changed
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
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
      phone: String(row[2] || '').trim(),
      attending: String(row[3] || '').trim().toLowerCase(),
      lang: String(row[4] || '').trim(),
    })
  }
  return rows
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
