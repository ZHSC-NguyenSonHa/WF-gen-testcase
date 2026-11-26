const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

function cellText(cell) {
  return cell.text || '';
}

async function inspect(inputPath, evidencePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);
  const expected = workbook.getWorksheet('入力画面');
  const actual = workbook.getWorksheet('Actual');
  if (!expected || !actual) throw new Error('Required sheets: 入力画面, Actual');
  let headerRow;
  let nameColumn;
  expected.eachRow(row => row.eachCell(cell => {
    if (cellText(cell).trim() === '項目名') {
      headerRow = row.number;
      nameColumn = cell.col;
    }
  }));
  if (!headerRow) throw new Error('Missing 項目名 header');
  const fields = [];
  expected.eachRow(row => {
    const number = row.getCell(nameColumn - 1).value;
    if (row.number <= headerRow || !Number.isInteger(number)) return;
    fields.push({
      number,
      name: cellText(row.getCell(nameColumn)),
      source: `入力画面!${row.getCell(nameColumn).address}`,
      properties: row.values.map((value, column) => value == null ? null : {
        cell: row.getCell(column).address,
        text: cellText(row.getCell(column))
      }).filter(Boolean)
    });
  });
  fs.mkdirSync(evidencePath, { recursive: true });
  const images = [];
  for (const sheet of [expected, actual]) {
    for (const image of sheet.getImages()) {
      const media = workbook.getImage(image.imageId);
      if (!media || !media.buffer) throw new Error(`Missing image ${image.imageId}`);
      const file = `${sheet === expected ? 'expected' : 'actual'}-${image.imageId}.${media.extension}`;
      fs.writeFileSync(path.join(evidencePath, file), media.buffer);
      images.push({ sheet: sheet.name, imageId: image.imageId, file,
        topLeft: image.range.tl.model, bottomRight: image.range.br?.model });
    }
  }
  const manifest = { input: path.resolve(inputPath), fields, images };
  fs.writeFileSync(path.join(evidencePath, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ fieldCount: fields.length, images, fields }, null, 2));
}

if (require.main === module) {
  const [inputPath, evidencePath] = process.argv.slice(2);
  if (!inputPath || !evidencePath) {
    console.error('Usage: node layout_compare.js <input.xlsx> <evidence-directory>');
    process.exitCode = 1;
  } else {
    inspect(inputPath, evidencePath).catch(error => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}

module.exports = { inspect };