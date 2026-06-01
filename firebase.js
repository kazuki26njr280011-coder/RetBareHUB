(function () {
  "use strict";

  /*
    Firebase Consoleで取得した firebaseConfig をここに貼ります。
    下の PASTE_... を全部、本物の値に置き換えてください。
  */
  const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY",
    authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
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
  } catch (error) {
    window.RH.firebaseReady = false;
    console.error("Firebase初期化エラー:", error);
  }
})();
