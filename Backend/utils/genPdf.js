const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generateProjectPdf(project, assessment) {
  return new Promise((resolve, reject) => {
    try {
      const exportDir = path.join(__dirname, "../exports");
      if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

      const filePath = path.join(exportDir, `${project.name.replace(/[^a-z0-9]/gi, '_')}_assessment.pdf`);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Titre du projet
      doc.fontSize(18).text(`Project: ${project.name}`, { underline: true });
      doc.fontSize(12).text(`Description: ${project.description || "N/A"}`);
      doc.text(`Track: ${project.track || "N/A"}`);
      doc.moveDown();

      // Évaluation du projet
      if (assessment) {
        doc.fontSize(14).text("Assessment", { underline: true });
        doc.fontSize(12).text(`Overall Score: ${assessment.overallScore ?? "N/A"}`);

        // Données techniques
        if (assessment.technicalData) {
          doc.moveDown().text("Technical Data", { underline: true });
          doc.text(`- Architecture Score: ${assessment.technicalData.architecture?.score ?? "N/A"}`);
          doc.text(`- Scalability Score: ${assessment.technicalData.scalabilityApproach?.score ?? "N/A"}`);
        }

        // Données commerciales
        if (assessment.businessData) {
          doc.moveDown().text("Business Data", { underline: true });
          doc.text(`- Business Model Score: ${assessment.businessData.businessModel?.score ?? "N/A"}`);
          doc.text(`- Market Potential Score: ${assessment.businessData.marketPotential?.score ?? "N/A"}`);
        }

        doc.moveDown().text("Eligibility", { underline: true });
        doc.text(`Eligibility Status: ${assessment.eligibility?.isEligible ? "Eligible" : "Not Eligible"}`);
      } else {
        doc.text("No assessment data available.");
      }

      // Membres de l'équipe
      doc.moveDown().text("Team", { underline: true });
      (project.team || []).forEach(member => {
        doc.text(`- ${member.email} (${member.validated ? "Validated" : "Not Validated"})`);
      });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateProjectPdf };
