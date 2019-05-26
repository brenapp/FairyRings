/**
 * Verifies CUID with room
 **/

import { google } from "googleapis";
import { sheets_v4 } from "googleapis/build/src/apis/sheets/v4";

const key = require("../../../authorization.json").google;
const config = require("../../../config.json");

const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

const sheets: sheets_v4.Sheets = google.sheets({ version: "v4", auth });

export default async function checkRoom(room: string, cuid: string) {
  const rooms = await sheets.spreadsheets.values
    .get({
      spreadsheetId: config.cuid,
      range: "Records!A2:Z"
    })
    .then(resp => resp.data.values as string[][]);

  return rooms.some(([r, ...cuids]) => r === room && cuids.includes(cuid));
}

export async function roomExists(room: string) {
  const rooms = await sheets.spreadsheets.values
    .get({
      spreadsheetId: config.cuid,
      range: "Records!A2:Z"
    })
    .then(resp => resp.data.values as string[][]);

  return rooms.some(v => v[0] === room);
}
