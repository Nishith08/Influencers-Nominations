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
const sendConfirmationEmail = async (email, password) => {
  try {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to the Sigma Influencer Program!',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="text-align: center; background-color: #2D345D; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0;">Welcome Aboard! 🚀</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">
                        Your registration for the <strong>Sigma Influencer Program</strong> was successful. We are thrilled to have you join our network!
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 5px solid #f7971e; padding: 20px; margin: 25px 0; border-radius: 4px;">
                        <h3 style="margin-top: 0; color: #333;">Your Login Credentials</h3>
                        <p style="margin: 5px 0; font-size: 15px;"><strong>User ID (Email):</strong> ${email}</p>
                        <p style="margin: 5px 0; font-size: 15px;"><strong>Password:</strong> <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold; color: #d35400;">${password}</span></p>
                    </div>

                    <p style="font-size: 14px; color: #666;">
                        Please keep this information secure.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${clientUrl}" style="background: linear-gradient(90deg, #7d2ae8 0%, #f7971e 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(125,42,232,0.2);">
                            Login to Dashboard
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #888; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                        &copy; ${new Date().getFullYear()} Sigma University. All rights reserved.
                    </p>
                </div>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Influencer registration email sent to:", email);
        return true;
    } catch (error) {
        console.error("Error sending influencer email:", error);
        throw error;
    }
};

module.exports = { sendConfirmationEmail };