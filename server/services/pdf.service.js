// File: server/services/pdf.service.js

const PDFDocument = require('pdfkit');

class PDFService {
  async generateForm956PDF(form956Data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20)
           .text('Form 956 - Appointment of a Registered Migration Agent', { 
             align: 'center' 
           });
        
        doc.moveDown();
        doc.fontSize(10)
           .text(`Form Reference: ${form956Data.formReference}`, { align: 'right' });

        doc.moveDown(2);

        // Part A - Applicant Details
        doc.fontSize(14).text('Part A - Applicant Details', { underline: true });
        doc.moveDown();
        
        const applicant = form956Data.formData.applicant;
        doc.fontSize(10);
        doc.text(`Family Name: ${applicant.familyName}`);
        doc.text(`Given Names: ${applicant.givenNames}`);
        doc.text(`Date of Birth: ${new Date(applicant.dateOfBirth).toLocaleDateString()}`);
        doc.text(`Passport Number: ${applicant.passportNumber}`);
        doc.text(`Email: ${applicant.email}`);
        doc.text(`Phone: ${applicant.phone}`);

        doc.moveDown(2);

        // Part B - Authorized Representative Details
        doc.fontSize(14).text('Part B - Authorized Representative Details', { underline: true });
        doc.moveDown();

        const rep = form956Data.formData.authorizedRep;
        doc.fontSize(10);
        doc.text(`MARN Number: ${rep.marnNumber}`);
        doc.text(`Name: ${rep.firstName} ${rep.lastName}`);
        doc.text(`Organization: ${rep.organizationName}`);
        doc.text(`Address: ${rep.businessAddress}`);
        doc.text(`Email: ${rep.email}`);
        doc.text(`Phone: ${rep.phone}`);

        doc.moveDown(2);

        // Part C - Scope of Authority
        doc.fontSize(14).text('Part C - Scope of Authority', { underline: true });
        doc.moveDown();

        const scope = form956Data.formData.scopeOfAuthority;
        doc.fontSize(10);
        doc.text(`Visa Types: ${scope.visaTypes.join(', ')}`);
        doc.text(`Can Receive Correspondence: ${scope.canReceiveCorrespondence ? 'Yes' : 'No'}`);
        doc.text(`Can Act on Behalf: ${scope.canActOnBehalf ? 'Yes' : 'No'}`);
        doc.text(`Can Withdraw Application: ${scope.canWithdrawApplication ? 'Yes' : 'No'}`);

        doc.moveDown(2);

        // Part D - Consumer Protection
        doc.fontSize(14).text('Part D - Consumer Protection', { underline: true });
        doc.moveDown();

        doc.fontSize(10);
        doc.text(`Consumer Guide Provided: ${form956Data.formData.consumerGuideProvided ? 'Yes' : 'No'}`);
        doc.text(`Date Provided: ${new Date(form956Data.formData.consumerGuideProvidedDate).toLocaleDateString()}`);

        doc.moveDown(2);

        // Part E - Signatures
        doc.fontSize(14).text('Part E - Signatures', { underline: true });
        doc.moveDown();

        doc.fontSize(10);
        doc.text('Student Signature:');
        if (form956Data.signatures.student.isSigned) {
          doc.text(`Signed on: ${new Date(form956Data.signatures.student.signedAt).toLocaleString()}`);
          doc.text(`IP Address: ${form956Data.signatures.student.ipAddress}`);
        }

        doc.moveDown();

        doc.text('Agent Signature:');
        if (form956Data.signatures.agent.isSigned) {
          doc.text(`Signed on: ${new Date(form956Data.signatures.agent.signedAt).toLocaleString()}`);
          doc.text(`IP Address: ${form956Data.signatures.agent.ipAddress}`);
        }

        doc.moveDown(3);

        // Footer
        doc.fontSize(8)
           .text('This form was generated and signed electronically via Nexus Platform', {
             align: 'center',
             color: 'gray'
           });

        doc.text(`Generated: ${new Date().toLocaleString()}`, {
          align: 'center',
          color: 'gray'
        });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  async generateInvoice(invoiceData) {
    // Similar implementation for invoices
  }

  async generateReport(reportData) {
    // Similar implementation for reports
  }
}

module.exports = new PDFService();
