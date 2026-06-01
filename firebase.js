(function () {
  "use strict";

  /*
    Firebase Console から取得した firebaseConfig
    以下の値は実際の設定値です。そのまま使えます。
  */
  const firebaseConfig = {
    apiKey: "AIzaSyBOyiUwwFROuDAXlJrNorbKs2GvE4SbVx8",
    authDomain: "retbarehub.firebaseapp.com",
    projectId: "retbarehub",
    storageBucket: "retbarehub.firebasestorage.app",
    messagingSenderId: "794205547266",
    appId: "1:794205547266:web:12b716c131e6eb02d4701b"
  };

  window.RH = window.RH || {};

  function hasRealConfig(config) {
    return config &&
      config.apiKey &&
      !String(config.apiKey).startsWith("PASTE_") &&
      config.projectId &&
      !String(config.projectId).startsWith("PASTE_");
  }

  if (!window.firebase || !hasRealConfig(firebaseConfig)) {
    window.RH.firebaseReady = false;
    window.RH.firebaseConfig = firebaseConfig;
    console.warn("firebase.js: firebaseConfig が未設定です。Firebase Consoleの設定を貼ってください。");
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    window.RH.firebaseReady = true;
    window.RH.firebase = firebase;
    window.RH.db = firebase.firestore();
    window.RH.storage = firebase.storage();

    window.RH.serverTimestamp = function () {
      return firebase.firestore.FieldValue.serverTimestamp();
    };

    window.RH.increment = function (value) {
      return firebase.firestore.FieldValue.increment(value);
    };

    window.RH.arrayUnion = function (value) {
      return firebase.firestore.FieldValue.arrayUnion(value);
    };

    console.log("✓ Firebase initialized successfully");
    console.log("✓ Firestore ready");
    console.log("✓ Storage ready");
  } catch (error) {
    window.RH.firebaseReady = false;
    console.error("Firebase初期化エラー:", error);
  }
})();
