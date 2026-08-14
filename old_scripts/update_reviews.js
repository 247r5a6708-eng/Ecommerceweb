const fs = require('fs');
let code = fs.readFileSync('src/lib/firestore.ts', 'utf8');

const allReviewsCode = `
export const getAllReviews = async (): Promise<Record<string, Review[]>> => {
  try {
    const q = query(collection(db, 'reviews'));
    const querySnapshot = await getDocs(q);
    const reviews: Record<string, Review[]> = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const productId = data.productId;
      if (productId) {
        if (!reviews[productId]) reviews[productId] = [];
        reviews[productId].push({ ...data, id: doc.id } as Review);
      }
    });
    return reviews;
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return {};
  }
};
`;

if (!code.includes('getAllReviews')) {
  code = code + '\n' + allReviewsCode;
  fs.writeFileSync('src/lib/firestore.ts', code);
  console.log('Added getAllReviews to firestore.ts');
}
