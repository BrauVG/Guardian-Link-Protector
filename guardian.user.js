// ==UserScript==
// @name         Guardian: Hybrid Link Protector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A powerful universal wrapper for link shorteners (Cuty, Ouo, Exe, etc.). Includes: 1) Hybrid detection and resolution of invisible CAPTCHAs. 2) "Boomerang" anti-popup system that manages ads in the background. 3) Visual Monitor (HUD) in the top-left corner. 4) Auto-click and auto-submit once validated. Designed to be stable and efficient.
// @author       Braulio Vargas
// @match        *://*.cuty.io/*
// @match        *://*.cuttlinks.com/*
// @match        *://*.linkvertise.com/*
// @match        *://*.ouo.io/*
// @match        *://*.ouo.press/*
// @match        *://*.shorte.st/*
// @match        *://*.bc.vc/*
// @match        *://*.fc.lc/*
// @match        *://*.smoner.com/*
// @match        *://*.fly-ad.io/*
// @match        *://*.wordcounter.icu/*
// @match        *://*.tl.gd/*
// @match        *://*.exe.io/*
// @match        *://*.exey.io/*
// @match        *://*.exio.io/*
// @match        *://*.exe-links.com/*
// @match        *://*.shrinke.me/*
// @match        *://*.shrinkme.io/*
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        debug: true,
        autoClickDelay: 2000,
        adClosureDelay: 2500
    };

    // --- HUD (Visual Monitor - Top Left) ---
    const hud = document.createElement('div');
    hud.id = 'guardian-hud';
    hud.style.cssText = `
        position: fixed; top: 10px; left: 10px;
        background: #000; color: #00ffcc; border: 1px solid #00ffcc;
        padding: 5px 10px; font-family: 'Courier New', monospace; font-size: 11px;
        z-index: 2147483647; pointer-events: none; border-radius: 4px;
        box-shadow: 0 0 8px rgba(0, 255, 204, 0.2);
        opacity: 0.9;
    `;
    hud.innerHTML = `🛡️ GUARDIAN: <span style="color:white">Monitoring ${location.hostname}...</span>`;

    const initUI = setInterval(() => {
        if (document.body) {
            document.body.appendChild(hud);
            clearInterval(initUI);
        }
    }, 100);

    function log(msg, color = '#00ffcc') {
        const timestamp = new Date().toLocaleTimeString('en-US', {hour12: false});
        hud.innerHTML = `🛡️ [${timestamp}] ${msg}`;
        hud.style.color = color;
        hud.style.borderColor = color;
        if (CONFIG.debug) console.log(`[GUARDIAN] ${msg}`);
    }

    // --- 1. WINDOW MANAGER (Boomerang Logic) ---
    const originalOpen = window.open;
    window.open = function(url, name, features) {
        const whitelist = ['google.com', 'mega.nz', 'mediafire.com', 'drive.google', 'dropbox', 'microsoft'];
        const isSafe = url && whitelist.some(d => url.includes(d));

        if (isSafe) {
            return originalOpen.apply(this, arguments);
        }

        log('Ad popup intercepted. Backgrounding...', '#ff9900');

        const win = originalOpen.apply(this, arguments);
        if (win) {
            window.focus();
            setTimeout(() => {
                try {
                    if (!win.closed) {
                        win.close();
                        log('Ad popup closed successfully.', '#00ffcc');
                    }
                } catch(e){}
            }, CONFIG.adClosureDelay);
        }
        return win;
    };

    // --- 2. CAPTCHA REVEALER ---
    setInterval(() => {
        const iframes = document.querySelectorAll('iframe[src*="recaptcha"], iframe[src*="turnstile"], iframe[src*="hcaptcha"]');

        iframes.forEach(iframe => {
            const style = window.getComputedStyle(iframe);
            const container = iframe.parentElement;

            if (style.opacity === '0' || style.visibility === 'hidden' || container.style.display === 'none') {
                iframe.style.opacity = '1';
                iframe.style.visibility = 'visible';
                container.style.display = 'block';
                container.style.opacity = '1';
                log('Hidden Captcha detected & REVEALED 👁️', '#ffff00');
            }
        });

        const cutyCaptcha = document.getElementById('captchaShortlink');
        if (cutyCaptcha && cutyCaptcha.style.display === 'none') {
            cutyCaptcha.style.display = 'block';
        }
    }, 1500);

    // --- 3. CLICK INTERCEPTOR ---
    document.addEventListener('click', function(e) {
        const target = e.target;

        if (target.tagName === 'IFRAME' || target.closest('iframe')) {
            log('Secure Interaction allowed ✅', '#00ffcc');
            return;
        }

        const btn = target.closest('button, .btn, input[type="submit"], a.btn');
        // Exe.io usa clases como "btn-primary" o "get-link", esto debería capturarlo

        if (btn) {
            const textArea = document.querySelector('textarea[name="g-recaptcha-response"]');
            const token = textArea ? textArea.value : "";
            const visibleCaptcha = document.querySelector('iframe[src*="recaptcha"][style*="visibility: visible"]');

            // A: Token Exists
            if (token.length > 10) {
                log('Token Valid. Click Allowed. 🚀', '#00ff00');
                return;
            }

            // B: Visible Captcha -> Block
            if (visibleCaptcha && token === "") {
                e.preventDefault();
                e.stopPropagation();
                log('⛔ Solve the Visible Captcha first.', '#ff3333');
                return;
            }

            // C: Invisible/No Captcha -> Pass
            log('Navigation detected / Invisible Trigger.', '#ffff00');
        }
    }, true);

    // --- 4. AUTO-SUBMIT MONITOR ---
    setInterval(() => {
        const textArea = document.querySelector('textarea[name="g-recaptcha-response"]');
        const submitBtn = document.querySelector('button.btn-primary, #submit-button, #btn-main, .get-link');

        if (textArea && textArea.value.length > 20 && submitBtn && !submitBtn.disabled) {
            if (submitBtn.innerText !== "GUARDIAN: VERIFIED") {
                submitBtn.style.backgroundColor = '#00ffcc';
                submitBtn.style.color = '#000';
                submitBtn.innerText = "GUARDIAN: VERIFIED";

                log('Captcha solved. Auto-submitting in 2s...', '#00ffcc');

                setTimeout(() => {
                    const form = document.querySelector('form');
                    // Exe.io funciona mejor con click directo que con form submit a veces
                    if (form && location.hostname.includes('cuty')) {
                        HTMLFormElement.prototype.submit.call(form);
                    } else {
                        submitBtn.click();
                    }
                }, CONFIG.autoClickDelay);
            }
        }
    }, 1000);

})();
