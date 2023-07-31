import { google } from 'googleapis';
const { SHEET_ID } = process.env;

const loadSheets = async () =>
{
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    return google.sheets({ version: 'v4', auth });
}

export default {
    loadSheets,
    async read (range: string) {
        const sheets = await this.loadSheets();
        return await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range
        })
    },
    async write (range: string, values: string[][]) {
        const sheets = await this.loadSheets();
        return await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        })
    }
};