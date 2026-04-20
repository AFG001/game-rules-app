// Google Apps Script - ゲームルール管理API
// スプレッドシートのシート名
var SHEET_NAME = "rules";

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id", "title", "content", "is_active"]);
  }
  return sheet;
}

// GETリクエスト: 全ルール取得
function doGet(e) {
  try {
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var rules = [];
    for (var i = 1; i < data.length; i++) {
      rules.push({
        id: data[i][0],
        title: data[i][1],
        content: data[i][2],
        is_active: data[i][3] === true || data[i][3] === "TRUE"
      });
    }
    return ContentService
      .createTextOutput(JSON.stringify({ rules: rules }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POSTリクエスト: 追加・更新・トグル・削除
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var sheet = getSheet();

    if (action === "add") {
      var id = new Date().getTime().toString();
      sheet.appendRow([id, body.title, body.content, false]);
      return ok({ id: id });
    }

    if (action === "update") {
      var row = findRow(sheet, body.id);
      if (!row) return error("ルールが見つかりません");
      sheet.getRange(row, 2).setValue(body.title);
      sheet.getRange(row, 3).setValue(body.content);
      return ok({});
    }

    if (action === "toggle") {
      var row = findRow(sheet, body.id);
      if (!row) return error("ルールが見つかりません");
      sheet.getRange(row, 4).setValue(body.isActive);
      return ok({});
    }

    if (action === "delete") {
      var row = findRow(sheet, body.id);
      if (!row) return error("ルールが見つかりません");
      sheet.deleteRow(row);
      return ok({});
    }

    return error("不明なアクション: " + action);
  } catch (err) {
    return error(err.message);
  }
}

function findRow(sheet, id) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) return i + 1;
  }
  return null;
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(Object.assign({ success: true }, data)))
    .setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
