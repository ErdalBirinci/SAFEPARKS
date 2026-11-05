/* SAFE-PARKS CISO Portal — client-side access gate.
   This is a usability gate, not a security boundary: GitHub Pages serves static files. */
(function () {
  "use strict";

  var AUTH_KEY = "safeparks-auth-v1";
  var HASHES = [
    "e944748735a39726b7cc6bd0aba2c19de8b5f85f00f2088f5f9dabe87887e611",
    "ae50b6778ee23272c09287d460a20cef08f202ed400c750b674eefcb5db39d19",
    "41b0a2afd2fcedef8eb7b0cb6ccce8e211c44cbfdb005248f19aa55842218e53"
  ];

  var root = document.documentElement;
  var gate = document.getElementById("authGate");
  var form = document.getElementById("authForm");
  var card = document.querySelector(".auth-card");
  var input = document.getElementById("authPassword");
  var submit = document.getElementById("authSubmit");
  var error = document.getElementById("authError");

  if (!gate || !form || !input || !submit || !error) return;

  if (root.classList.contains("auth-ok")) {
    gate.hidden = true;
    return;
  }

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

  function unlock() {
    try { sessionStorage.setItem(AUTH_KEY, "granted"); } catch (e) { /* session-only fallback */ }
    root.classList.remove("auth-locked");
    root.classList.add("auth-ok");
    gate.hidden = true;
    gate.setAttribute("aria-hidden", "true");
    input.value = "";
    var view = document.getElementById("view");
    if (view) view.focus();
  }

  input.addEventListener("input", clearError);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearError();

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
      if (HASHES.indexOf(hash) !== -1) {
        unlock();
        return;
      }
      input.value = "";
      showError("Şifre kabul edilmedi. / Password not accepted.");
      input.focus();
    } catch (e) {
      showError("Güvenli giriş bu tarayıcıda başlatılamadı. Sayfayı HTTPS üzerinden açın. / Secure sign-in is unavailable. Open the page over HTTPS.");
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });
})();
