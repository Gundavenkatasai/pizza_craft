
const testPriceTampering = async () => {
  try {
    console.log('Testing price tampering on /api/payment/placeOrderCOD...');

    // A realistic mock payload, but with a tampered totalAmount (10 instead of whatever it should be)
    const payload = {
      items: [
        {
          pizza_id: '6a5af8b1d664146b82137531', // we might not have a real ID, so it might fallback to unit_price
          name: 'Margherita',
          size: 'medium',
          quantity: 2,
          unit_price: 150, // frontend price
          total_price: 300 // frontend total
        }
      ],
      deliveryAddress: { street: '123 Fake St', city: 'Testville', zipCode: '12345', phone: '1234567890' },
      totalAmount: 10, // Tampered total
      specialInstructions: 'Test order'
    };

    const res = await fetch('http://localhost:3001/api/payment/placeOrderCOD', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Response:', data);
    
    // We can then verify the order in the DB to see if it saved 10 or the actual recalculated amount
    // If it falls back (since no DB pizza found), it uses 300 + tax + delivery (300 + 24 + 40 = 364)
    console.log('Test completed.');
  } catch (error) {
    console.error('Error during test:', error);
  }
};

testPriceTampering();
