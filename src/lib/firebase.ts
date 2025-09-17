
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-5927518714-b3780",
  "appId": "1:429280795634:web:8c3b4e1c280d925854296b",
  "storageBucket": "studio-5927518714-b3780.firebasestorage.app",
  "apiKey": "AIzaSyBOFK2wiyhtW5gHdhcFCqJ3OFSIaOQn3v4",
  "authDomain": "studio-5927518714-b3780.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "429280795634"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
