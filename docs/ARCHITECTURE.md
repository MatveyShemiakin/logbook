# Deployment architecture

- Frontend source: this separate repository. Its five generated assets are copied only into `/logbook/` of the website repository, which serves `matveyshemyakin.ru/logbook/`.
- Backend: Yandex Cloud Function API.
- Clinical data: YDB.
- Local offline copy: encrypted browser vault.
- Media: encrypted external SSD.

The website's existing root content remains untouched; the scoped assets are the sole integration point.
