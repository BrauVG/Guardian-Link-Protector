# Guardian-Link-Protector
<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Status-Stable-success?style=for-the-badge" alt="Status">
</p>
Designed to block annoying and insecure popups and navigate faster through link shorteners like Cuty.io and Exe.io using hybrid captcha detection.

## 📥 Installation

1. Install **Tampermonkey** extension for your browser.
2. Click the button below to install the script:

<div align="center">
  <a href="https://github.com/BrauVG/Guardian-Link-Protector/raw/main/guardian.user.js">
    <img src="https://img.shields.io/badge/INSTALL_SCRIPT-Tampermonkey-green?style=for-the-badge&logo=tampermonkey" alt="Install Script" height="50">
  </a>
</div>

---

## ⚙️ Mandatory Configuration (uBlock Origin)

For **Guardian** to work at 100% efficiency and prevent browser freezing, you **MUST** install **uBlock Origin** and add these custom filters. This blocks the heavy ad networks before they even load.

1. Open **uBlock Origin** settings (Dashboard).
2. Go to the **"My filters"** (Mis filtros) tab.
3. Copy and paste the following block exactly as is:

```text
! --- GUARDIAN PROTECTION FILTERS ---
! Blocks aggressive ad networks on shorteners
||rubiconproject.com^$domain=cuty.io|cuttlinks.com
||criteo.com^$domain=cuty.io|cuttlinks.com
||semasio.net^$domain=cuty.io|cuttlinks.com
||exponential.com^$domain=cuty.io|cuttlinks.com
||contextweb.com^$domain=cuty.io|cuttlinks.com
||barmanonymity.shop^
||hurlybegaud.top^

! Allow Google Recaptcha (Critical for validation)
@@||[google.com/recaptcha/$script,domain=cuty.io](https://google.com/recaptcha/$script,domain=cuty.io)|cuttlinks.com
@@||[gstatic.com/recaptcha/$domain=cuty.io](https://gstatic.com/recaptcha/$domain=cuty.io)|cuttlinks.com
