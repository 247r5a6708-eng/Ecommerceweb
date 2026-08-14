const fs = require('fs');
let code = fs.readFileSync('src/lib/firestore.ts', 'utf8');
const returnsCode = `
// RETURNS
export const getUserReturns = async (userId: string) => {
  try {
    const q = query(collection(db, \`users/\${userId}/returns\`));
    const querySnapshot = await getDocs(q);
    const returns: any[] = [];
    querySnapshot.forEach((doc) => {
      returns.push({ ...doc.data(), id: doc.id });
    });
    return returns;
  } catch (error) {
    console.error("Error fetching returns:", error);
    return [];
  }
};

export const createReturnRequest = async (userId: string, returnData: any) => {
  try {
    const docRef = doc(db, \`users/\${userId}/returns\`, returnData.id);
    await setDoc(docRef, returnData);
  } catch (error) {
    console.error("Error saving return:", error);
  }
};
`;
if (!code.includes('getUserReturns')) {
  code += returnsCode;
  fs.writeFileSync('src/lib/firestore.ts', code);
}
