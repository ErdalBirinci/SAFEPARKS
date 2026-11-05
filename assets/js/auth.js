/* SAFE-PARKS CISO Portal — client-side access gate.
   This is a usability gate, not a security boundary: GitHub Pages serves static files.
   The three passphrases are stored only as SHA-256 digests. A successful sign-in creates a
   tab-scoped session with a user label and role. Change the labels/roles below if the
   authorised users should be identified differently. */
(function () {
  "use strict";

  var AUTH_KEY = "safeparks-auth-v1";
  var ATTEMPT_KEY = "safeparks-auth-attempts-v1";
  var MAX_ATTEMPTS = 5;
  var LOCK_MS = 60000;
  var SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

  /* SHA-256 digests only. Do not add plaintext passphrases to this file. */
  var ACCOUNTS = [
    { id: "u1", label: "Yetkili 1", role: "editor", hash: "e944748735a39726b7cc6bd0aba2c19de8b5f85f00f2088f5f9dabe87887e611" },
    { id: "u2", label: "Yetkili 2", role: "editor", hash: "ae50b6778ee23272c09287d460a20cef08f202ed400c750b674eefcb5db39d19" },
    { id: "u3", label: "Yetkili 3", role: "editor", hash: "41b0a2afd2fcedef8eb7b0cb6ccce8e211c44cbfdb005248f19aa55842218e53" }
  ];

  var root = document.documentElement;
  var gate = document.getElementById("authGate");
  var form = document.getElementById("authForm");
  var card = document.querySelector(".auth-card");
  var input = document.getElementById("authPassword");
  var submit = document.getElementById("authSubmit");
  var error = document.getElementById("authError");

  function readSession() {
    try {
      var raw = sessionStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      if (raw === "granted") {
        return { granted: true, user: { id: "legacy", label: "Yetkili", role: "editor" }, at: Date.now() };
      }
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.granted || !parsed.user) return null;
      if (parsed.at && Date.now() - parsed.at > SESSION_MAX_AGE_MS) {
        sessionStorage.removeItem(AUTH_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function publishSession(session) {
    if (!session || !session.user) return;
    window.SP_AUTH = session.user;
  }

  function applyUnlocked(rootEl) {
    rootEl.classList.remove("auth-locked");
    rootEl.classList.add("auth-ok");
    if (gate) {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
    }
  }

  var session = readSession();
  if (session) {
    publishSession(session);
    applyUnlocked(root);
    if (!gate || !form || !input || !submit || !error) return;
    return;
  }

  if (!gate || !form || !input || !submit || !error) return;

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    if (card) {
      card.classList.remove("auth-shake");
      void card.offsetWidth;
      card.classList.add("auth-shake");
    }
  }

  function clearError() {
    error.hidden = true;
    error.textContent = "";
  }

  function bytesToHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = "";
    for (var i = 0; i < bytes.length; i += 1) {
      out += ("0" + bytes[i].toString(16)).slice(-2);
    }
    return out;
  }

  async function sha256(value) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      throw new Error("webcrypto-unavailable");
    }
    var data = new TextEncoder().encode(value);
    return bytesToHex(await window.crypto.subtle.digest("SHA-256", data));
  }

  function attemptsState() {
    try {
      var raw = localStorage.getItem(ATTEMPT_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") return { count: 0, until: 0 };
      return { count: Number(parsed.count) || 0, until: Number(parsed.until) || 0 };
    } catch (e) {
      return { count: 0, until: 0 };
    }
  }

  function saveAttempts(state) {
    try { localStorage.setItem(ATTEMPT_KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  }

  function lockRemaining(state) {
    var ms = state.until - Date.now();
    return ms > 0 ? Math.ceil(ms / 1000) : 0;
  }

  function unlock(account) {
    var session = { granted: true, v: 1, user: account, at: Date.now() };
    try { sessionStorage.setItem(AUTH_KEY, JSON.stringify(session)); } catch (e) { /* session-only fallback */ }
    try { localStorage.removeItem(ATTEMPT_KEY); } catch (e) { /* storage blocked */ }
    publishSession(session);
    applyUnlocked(root);
    input.value = "";
    var view = document.getElementById("view");
    if (view) view.focus();
  }

  window.SP_AUTH_SIGNOUT = function () {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (e) { /* storage blocked */ }
    window.location.reload();
  };

  input.addEventListener("input", clearError);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearError();

    var lock = attemptsState();
    var remaining = lockRemaining(lock);
    if (remaining > 0) {
      showError("Çok fazla deneme. " + remaining + " saniye sonra tekrar deneyin. / Too many attempts. Try again in " + remaining + " seconds.");
      return;
    }

    var password = input.value;
    if (!password) {
      showError("Şifre gerekli. / Password required.");
      input.focus();
      return;
    }

    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");

    try {
      var hash = await sha256(password);
      var account = ACCOUNTS.filter(function (candidate) { return candidate.hash === hash; })[0];
      if (account) {
        unlock(account);
        return;
      }

      lock.count += 1;
      if (lock.count >= MAX_ATTEMPTS) {
        lock.until = Date.now() + LOCK_MS;
        lock.count = 0;
        saveAttempts(lock);
        showError("Çok fazla deneme. 60 saniye sonra tekrar deneyin. / Too many attempts. Try again in 60 seconds.");
      } else {
        saveAttempts(lock);
        showError("Şifre kabul edilmedi. / Password not accepted. (" + (MAX_ATTEMPTS - lock.count) + " deneme kaldı)");
      }
      input.value = "";
      input.focus();
    } catch (e) {
      showError("Güvenli giriş bu tarayıcıda başlatılamadı. Sayfayı HTTPS üzerinden açın. / Secure sign-in is unavailable. Open the page over HTTPS.");
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });
})();
