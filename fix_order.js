const fs = require('fs');
let code = fs.readFileSync('src/lib/firestore.ts', 'utf8');

code = code.replace(
`export const saveOrder = async (userId: string, order: Order) => {
  try {
    const docRef = doc(db, \`users/\${userId}/orders\`, order.id);
    await setDoc(docRef, order);
  } catch (error) {
    console.error("Error saving order:", error);
  }
};`,
`export const saveOrder = async (userId: string, order: Order) => {
  try {
    const docRef = doc(db, \`users/\${userId}/orders\`, order.id);
    const orderData = {
      ...order,
      totalAmount: order.total || order.totalAmount || 0,
      customerEmail: order.address?.email || '',
      customerName: order.address?.fullName || '',
      customerPhone: order.address?.phone || '',
      createdAt: order.date || new Date().toISOString()
    };
    await setDoc(docRef, orderData);
  } catch (error) {
    console.error("Error saving order:", error);
  }
};`
);

fs.writeFileSync('src/lib/firestore.ts', code);
