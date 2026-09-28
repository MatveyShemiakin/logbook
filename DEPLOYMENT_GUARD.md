# Deployment guard

This repository contains only the static PWA shell for the International Ophthalmic Surgical Logbook.

- No patient-identifying data is stored in GitHub.
- No Yandex Lockbox secret or sync token is committed.
- Clinical records remain in YDB and in the encrypted local vault.
- The service worker must stay scoped to `/logbook/` and must never register from `/sw.js` at the site root.
- The main website repository `MatveyShemiakin/MatveyShemiakin.github.io` is intentionally not modified by this deployment.
