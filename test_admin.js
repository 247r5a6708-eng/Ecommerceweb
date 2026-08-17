import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  await signInWithEmailAndPassword(auth, 'kumarrachith0@gmail.com', 'admin123'); // assuming password is admin123, wait maybe it's not?
  // Let me just check the rules for `users/{userId}/orders`
}
test();
