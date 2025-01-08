const pug = require("pug");

// Compile the Pug template to a function
function pugToHtml(pugTemplate) {
  try {
    // Compile the template
    const compiledFunction = pug.compile(pugTemplate, {
      filename: "index.pug",
      basedir: "./",
    });

    // Render the HTML
    const html = compiledFunction();

    return html;
  } catch (err) {
    console.error("Error converting Pug to HTML:", err);
    return null;
  }
}

// Example usage:
// const pugTemplate = `
//   html
//     head
//       title My Site
//     body
//       h1 Welcome
//       p This is my site
// `;
// const html = pugToHtml(pugTemplate);

const fs = require("fs");

function convertIndexPugToHtml() {
  try {
    // Read the index.pug file
    const pugTemplate = fs.readFileSync("./index.pug", "utf8");

    // Convert to HTML using pugToHtml function
    const html = pugToHtml(pugTemplate);

    if (html) {
      // Write the HTML to index.html
      fs.writeFileSync("./index.html", html);
      console.log("Successfully converted index.pug to index.html");
    }
  } catch (err) {
    console.error("Error converting index.pug:", err);
  }
}

// Run the conversion
convertIndexPugToHtml();
