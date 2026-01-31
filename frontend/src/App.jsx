import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // 1. State to hold the list of members
  const [members, setMembers] = useState([
    { name: '', phone: '', email: '', age: '', gender: 'Male' }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);

  // 2. Handle typing in input fields
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...members];
    updatedMembers[index][name] = value;
    setMembers(updatedMembers);
  };

  // 3. Add a new empty member form
  const addMember = () => {
    setMembers([...members, { name: '', phone: '', email: '', age: '', gender: 'Male' }]);
  };

  // 4. Remove a member
  const removeMember = (index) => {
    const updatedMembers = [...members];
    updatedMembers.splice(index, 1);
    setMembers(updatedMembers);
  };

  // 5. The Payment Logic
  const handlePayment = async () => {
    // Basic Validation: Check if fields are empty
    if (!members[0].name || !members[0].phone) {
        alert("Please fill in details for the first member at least.");
        return;
    }

    setIsLoading(true);

    try {
      // Step A: Ask Backend to create an order
      const { data } = await axios.post('http://localhost:5000/api/create-order', { members });

      // Step B: Configure Razorpay Popup options
      const options = {
        key: "rzp_test_S9FRgtlnopEMKP", 
        amount: data.amount, 
        currency: "INR",
        name: "Mahi Event Booking",
        description: "Holi Event Entry",
        order_id: data.orderId, 
        handler: async function (response) {
            // Step C: Verify on backend
            try {
                const verifyRes = await axios.post('http://localhost:5000/api/verify-payment', {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    bookingId: data.bookingId
                });
                if (verifyRes.data.status === 'success') {
                    alert("Payment Successful! Booking Confirmed.");
                    setMembers([{ name: '', phone: '', email: '', age: '', gender: 'Male' }]);
                }
            } catch (err) {
                alert("Payment verified failed on server.");
            }
        },
        theme: {
            color: "#61dafb"
        }
      };

      // Step D: Open the popup
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      rzp1.open();

    } catch (error) {
      console.error("Error creating order:", error);
      alert("Could not initiate payment. Is the backend running?");
    } finally {
        setIsLoading(false);
    }
  };

  // Helper to calculate total price
  const calculateTotal = () => {
    return members.reduce((total, member) => {
      const price = (member.age && member.age > 3) ? 2 : 0;
      return total + price;
    }, 0);
  };

 // --- NEW VALIDATION LOGIC ---
  // Check if ALL members have an age entered, and ALL of them are <= 3
  const isSingleChildError = members.length > 0 && members.every(member => 
    member.age !== '' && Number(member.age) <= 3
  );
  // --- NEW VALIDATION LOGIC END ---

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <img src="/MAHI_LOGO.png" alt="Mahi Logo" width="80" height="80" />
        </div>
        <h1 className="holi-title">
          <span>H</span><span>o</span><span>l</span><span>i</span><span>&nbsp;</span><span>P</span><span>a</span><span>r</span><span>t</span><span>y</span>
        </h1>
        <p>Book Your Tickets Now</p>
      </header>

      <div className="form-wrapper">
        {members.map((member, index) => (
          <div key={index} className="member-card">
            <div className="card-header">
                <h3>Member : {index + 1}</h3>
                {members.length > 1 && (
                    <button className="remove-btn" onClick={() => removeMember(index)}>X</button>
                )}
            </div>
            
            <div className="input-group">
                <input 
                    name="name" placeholder="Full Name" 
                    value={member.name} onChange={e => handleChange(index, e)} 
                />
                <input 
                    name="phone" placeholder="Phone Number" 
                    value={member.phone} onChange={e => handleChange(index, e)} 
                />
            </div>

            <div className="input-group">
                <input 
                    name="email" placeholder="Email Address" 
                    value={member.email} onChange={e => handleChange(index, e)} 
                />
            </div>

            <div className="input-group small-group">
                <input 
                    name="age" type="number" placeholder="Age" 
                    value={member.age} onChange={e => handleChange(index, e)} 
                />
                <select name="gender" value={member.gender} onChange={e => handleChange(index, e)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
          </div>
        ))}

        <button className="add-btn" onClick={addMember}>
            + Add Another Member
        </button>
      </div>

      <div className="checkout-bar">
        
        {/* --- ERROR MESSAGE DISPLAY --- */}
        {isSingleChildError && (
            <div className="error-message">
                A child under the age of 3 cannot be booked alone.
            </div>
        )}

        <div className="bottom-row">
            <div className="total-display">
                <span>Total Members: {members.length}</span>
                <span className="price">₹{calculateTotal()}</span>
            </div>
            <button 
                className="pay-btn" 
                onClick={handlePayment} 
                /* Disable button if loading OR if the error exists */
                disabled={isLoading || isSingleChildError}
            >
                {isLoading ? "Processing..." : "Proceed to Pay"}
            </button>
        </div>
      </div>
    </div>
  );
}
export default App;