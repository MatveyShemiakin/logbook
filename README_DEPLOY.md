# International Ophthalmic Surgical Logbook

Private offline-first surgical logbook PWA for Matvey Shemyakin.

Production path: `https://matveyshemyakin.ru/logbook/`

## Security model

This public repository contains **application code only**. It must not contain patient identifiers, clinical records, sync tokens, Lockbox payloads, or other secrets. Clinical data is stored in the encrypted local vault and synchronized with the private YDB backend.

The service worker is scoped to the project path (`/logbook/`) so it does not control the main website.
