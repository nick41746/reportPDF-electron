PDFDocument = require('pdfkit')
fs = require('fs')

doc = new PDFDocument

doc.pipe(fs.createWriteStream('output.pdf'))

doc.image('src/ittp.png')

doc.end()