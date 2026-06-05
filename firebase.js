(function () {
  "use strict";
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
    console.warn("Firebase config が未設定です。");
    return;
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    window.RH.firebase = firebase;
    window.RH.db = firebase.firestore();
    window.RH.firebaseReady = true;
    window.RH.serverTimestamp = function () {
      return firebase.firestore.FieldValue.serverTimestamp();
    };
    window.RH.increment = function (value) {
      return firebase.firestore.FieldValue.increment(value);
    };
    window.RH.arrayUnion = function (value) {
      return firebase.firestore.FieldValue.arrayUnion(value);
    };
    window.RH.arrayRemove = function (value) {
      return firebase.firestore.FieldValue.arrayRemove(value);
    };
    window.RH.deleteField = function () {
      return firebase.firestore.FieldValue.delete();
    };
  } catch (error) {
    window.RH.firebaseReady = false;
    console.error("Firebase初期化エラー:", error);
  }
})();
