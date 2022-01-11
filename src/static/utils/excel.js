import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export const mainColor = '003249'

export const firstRow = 7

export function addWorksheet(workbook, sheetName) {

    const worksheet = workbook.addWorksheet(sheetName, { views: [{ showGridLines: false }] } )

    return worksheet

}


export function newWorkbook( { name } ) {

    const workbook = new ExcelJS.Workbook()
    const worksheet = addWorksheet(workbook, name)

    return {
        workbook,
        worksheet,
    }

}

export function newEmptyWorkbook() {

    return new ExcelJS.Workbook()

}

export function setExcelHeader(workbook, worksheet) {

    const logo = workbook.addImage( {
        base64    : process.env.NUXT_ENV_LOGO_BASE64,
        extension : 'png',
    } )

    worksheet.addImage(logo, 'B2:C6')

    worksheet.addTable( {
        name      : 'Header',
        ref       : 'D2',
        headerRow : false,
        totalsRow : false,

        columns: [
            {
                name         : 'Data',
                filterButton : false,
                style        : {
                    font: {
                        bold  : true,
                        color : { argb: mainColor },
                    },
                },
            },
        ],

        rows: [
            [ process.env.NUXT_ENV_RAZON_SOCIAL ],
            [ process.env.NUXT_ENV_GIRO ],
            [ process.env.NUXT_ENV_DIRECCION ],
            [ `RUT: ${process.env.NUXT_ENV_RUT}` ],
            [ `Fono: ${process.env.NUXT_ENV_FONO} - E-mail: ${process.env.NUXT_ENV_CONTACTO_EMAIL}` ],
        ],

        style: {
            theme          : null,
            showRowStripes : false,
        },
    } )

}

export function addExcelRow(workbook, worksheet, rowData, { isHeader = false, bordered = true } = {} ) {

    const lastRow = worksheet.lastRow
    let lastRowNumber = lastRow.number > firstRow ? lastRow.number : firstRow

    let row

    if (isHeader) {

        lastRowNumber = lastRowNumber + 2
        row = worksheet.insertRow(lastRowNumber, getParsedRow(rowData) )

    }
    else {

        lastRowNumber = lastRowNumber + 1
        row = worksheet.addRow(getParsedRow(rowData) )

    }

    // Styling

    row.eachCell( (cell, colNumber) => {

        const borderStyle = isHeader ? 'medium' : 'thin'

        cell.border = {
            top    : bordered ? { style: borderStyle, color: { argb: mainColor } } : undefined,
            left   : bordered && colNumber === 2 ? { style: borderStyle, color: { argb: mainColor } } : undefined,
            bottom : bordered ? { style: borderStyle, color: { argb: mainColor } } : undefined,
            right  : bordered && colNumber === row.cellCount ? { style: borderStyle, color: { argb: mainColor } } : undefined,
        }

        cell.font = {
            bold  : isHeader,
            color : { argb: mainColor },
        }

        cell.alignment = { vertical: 'top' }

    } )

    worksheet.mergeCells(lastRowNumber, 2, lastRowNumber, 4)

    if (isHeader)
        worksheet.getRow(lastRowNumber - 1).height = 6

    return {
        row,
        lastRowNumber,
    }

}

export function saveExcelFile(workbook, fileName) {

    workbook.xlsx.writeBuffer().then(function(data) {

        const blob = new Blob( [ data ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
        saveAs(blob, `${fileName}_${new Date().toISOString()}.xlsx`)

    } )

}

function getParsedRow(rowData) {

    const rowValues = []

    let rowIndex = 2
    for (const value of rowData) {

        rowValues[rowIndex] = value
        rowIndex++

    }

    rowValues.splice(3, 0, '')
    rowValues.splice(3, 0, '')

    return rowValues

}