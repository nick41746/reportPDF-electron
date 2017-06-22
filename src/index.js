HTMLToPDF = require('html5-to-pdf')
htmlToPDF = new HTMLToPDF ({
  inputPath: 'test/testpdf.html',
  include: [{
    'type': 'css',
    'filePath': 'test/style/main.css'
  }],
  outputPath: 'output.pdf',
})

htmlToPDF.build ((error) => {
  if (error) {
    throw err
  }
})
// const fs = require('fs');
// const pdf = require('html-pdf');

// var content;
// // First I want to read the file
// fs.readFile('src/index.html', 'utf8', function read(err, data) {
//     if (err) {
//         throw err;
//     }
//     content = data;

//     // Invoke the next step here however you like
//   //  console.log(content);   // Put all of the code here (not the best solution)
//     processFile(content);          // Or put the next step in a function and invoke it
// });

// function processFile(content) {
//   const options = { format: 'Letter' };

//   pdf.create(content, null).toFile('./files/files.pdf', (err, res) => {
//   if (err) return console.log(err);
//     console.log(res); // { filename: '/app/businesscard.pdf' }
//   });
// }