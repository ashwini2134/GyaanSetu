const fs = require('fs');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

const lines = fs.readFileSync('checklist.txt', 'utf8').split('\n');

const children = [];

for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line === "FRAYLON ACADEMY") {
        children.push(new Paragraph({ text: line, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
    } else if (line === "Checklist") {
        children.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { before: 100 } }));
    } else if (line.startsWith("Covers ")) {
        children.push(new Paragraph({ children: [new TextRun({ text: line, italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }));
    } else if (line.match(/^\d+\./)) {
        children.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 100 } }));
    } else if (line.startsWith("Phase ") || line === "Admin Panel Testing" || line === "Dashboard" || line === "Projects" || line === "Assessments" || line === "Quiz" || line === "Profile & Settings" || line === "Lesson Pages") {
        children.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    } else if (line.startsWith("☐")) {
        children.push(new Paragraph({ text: line, indent: { left: 720 } }));
    } else if (line.startsWith("Status:")) {
        children.push(new Paragraph({ children: [new TextRun({ text: line, bold: true })], spacing: { before: 50, after: 200 } }));
    } else {
        children.push(new Paragraph({ text: line }));
    }
}

const doc = new Document({
    sections: [{ properties: {}, children: children }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Fraylon_Academy_Checklist.docx", buffer);
    console.log("Successfully generated Fraylon_Academy_Checklist.docx");
}).catch(console.error);
