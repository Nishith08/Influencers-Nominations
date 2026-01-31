const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');

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
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    
    // B. Design the PDF Content
    const logoPath = path.join(__dirname, '../assets/MAHI_LOGO.png');
    
    // Header Section
    doc.image(logoPath, 50, 50, { width: 80 });
    doc.moveDown(1);
    
    doc.fontSize(24).fillColor('#FF6B35').text('Mahi Event Booking', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor('#000').text('Payment Confirmation Receipt', { align: 'center' });
    doc.moveDown(2);
    
    // Booking Details Section
    doc.fillColor('#333').fontSize(14).text('Booking Details', { underline: true });
    doc.moveDown(0.5);
    doc.fillColor('#000').fontSize(12);
    doc.text(`Booking ID: ${bookingData._id}`);
    doc.moveDown(0.3);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown(0.3);
    doc.text(`Total Amount Paid: Rs.${bookingData.totalAmount}`);
    doc.moveDown(1.5);
    
    // Member Details Section
    doc.fillColor('#333').fontSize(14).text('Member Details', { underline: true });
    doc.moveDown(0.5);
    doc.fillColor('#000').fontSize(12);
    
    // Simple list format for members
    bookingData.members.forEach((member, index) => {
      doc.text(`${index + 1}. ${member.name} (${member.gender}, Age: ${member.age})`);
      doc.moveDown(0.2);
      doc.text(`   Email: ${member.email}`);
      doc.moveDown(0.2);
      doc.text(`   Phone: ${member.phone}`);
      doc.moveDown(0.8);
    });
    
    doc.moveDown(1);
    
    // Footer
    doc.fillColor('#FF6B35').fontSize(16).text('Thank you for booking with Mahi Event!', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#666').fontSize(10).text('For any queries, contact us at info@mahiwatergateresort.com', { align: 'center' });
    
    doc.end(); // Finish PDF generation

    // C. Wait for PDF to finish, then send email
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: bookingData.members[0].email, // Send to the first member's email
        subject: 'Booking Confirmation - Holi Event',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="text-align: center; background-color: #FF6B35; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1>Holi Event Booking</h1>
              <h2>Payment Confirmation</h2>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p>Hello <strong>${bookingData.members[0].name}</strong>,</p>
              <p>Your booking has been confirmed successfully! We're excited to have you join us for the event.</p>
              <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin-top: 0; color: #FF6B35;">Booking Details</h3>
                <p><strong>Booking ID:</strong> ${bookingData._id}</p>
                <p><strong>Total Amount Paid:</strong> ₹${bookingData.totalAmount}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <p>Please find your detailed receipt attached as a PDF.</p>
              <p>If you have any questions, feel free to contact us at <a href="mailto:info@mahiwatergateresort.com">info@mahiwatergateresort.com</a>.</p>
              <p style="text-align: center; font-weight: bold; color: #FF6B35;">Thank you for choosing Mahi Resort!</p>
            </div>
          </div>
        `,
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