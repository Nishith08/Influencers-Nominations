const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// 1. Setup Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Function to Generate PDF & Send Email
const sendConfirmationEmail = async (bookingData) => {
  return new Promise((resolve, reject) => {
    
    // A. Create PDF Document in Memory
    const doc = new PDFDocument();
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    
    // B. Design the PDF Content
    doc.fontSize(20).text('Mahi Event Booking - Receipt', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Booking ID: ${bookingData._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Total Amount Paid: ₹${bookingData.totalAmount}`);
    doc.moveDown();
    
    doc.text('---------------------------------------------------');
    doc.text('Member Details:');
    doc.moveDown();

    // Loop through members
    bookingData.members.forEach((member, index) => {
      doc.text(`${index + 1}. ${member.name} (${member.gender}, Age: ${member.age})`);
      doc.text(`   Email: ${member.email} | Phone: ${member.phone}`);
      doc.moveDown(0.5);
    });

    doc.text('---------------------------------------------------');
    doc.moveDown();
    doc.text('Thank you for booking with us!', { align: 'center' });
    doc.end(); // Finish PDF generation

    // C. Wait for PDF to finish, then send email
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: bookingData.members[0].email, // Send to the first member's email
        subject: 'Booking Confirmation - Mahi Event',
        text: `Hello ${bookingData.members[0].name},\n\nYour booking is confirmed! Please find the receipt attached.\n\nTotal Paid: ₹${bookingData.totalAmount}`,
        attachments: [
          {
            filename: 'Booking_Receipt.pdf',
            content: pdfData,
            contentType: 'application/pdf',
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        resolve(true);
      } catch (error) {
        console.error("Error sending email:", error);
        reject(error);
      }
    });
  });
};

module.exports = { sendConfirmationEmail };