/* firebase.js
   ここだけ、自分のFirebaseの「ウェブアプリ設定」に差し替えてね。
   パスワードはconsole.logしない作りにしてあります。
*/
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBOyiUwwFROuDAXlJrNorbKs2GvE4SbVx8",
    authDomain: "retbarehub.firebaseapp.com",
    projectId: "retbarehub",
    storageBucket: "retbarehub.firebasestorage.app",
    messagingSenderId: "794205547266",
    appId: "1:794205547266:web:12b716c131e6eb02d4701b"
  };
  const looksEmpty =
    !firebaseConfig.apiKey ||
    String(firebaseConfig.apiKey).includes("PASTE_") ||
    String(firebaseConfig.projectId).includes("PASTE_");
  if (looksEmpty) {
    window.RH_FIREBASE_ERROR = "firebaseConfigがまだ入っていません";
    return;
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.firestore();
    window.storage = firebase.storage();
    window.RH_FIREBASE_READY = true;
  } catch (error) {
    window.RH_FIREBASE_ERROR = error.message || "Firebase初期化エラー";
  }
})();
