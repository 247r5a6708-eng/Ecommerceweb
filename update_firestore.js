const fs = require('fs');
let code = fs.readFileSync('src/lib/firestore.ts', 'utf8');

const cartCode = `
// CART
export const getUserCart = async (userId: string) => {
  try {
    const docRef = doc(db, \`users/\${userId}/data\`, 'cart');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

export const saveUserCart = async (userId: string, items: any[]) => {
  try {
    const docRef = doc(db, \`users/\${userId}/data\`, 'cart');
    await setDoc(docRef, { items });
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};
`;

if (!code.includes('getUserCart')) {
  code = code + '\n' + cartCode;
  fs.writeFileSync('src/lib/firestore.ts', code);
  console.log('Added cart logic to firestore.ts');
} else {
  console.log('Cart logic already exists');
}
