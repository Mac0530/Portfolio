# Portfolio

Source for https://raymarkguevarra.com/.

- `frontend_react/` – the website (Create React App).
- `backend_sanity/` – Sanity Studio for side projects and testimonials.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds
`frontend_react/` and publishes the build to the `hostinger-deploy` branch.
Hostinger (hPanel → Advanced → Git) pulls `hostinger-deploy` into `public_html`
through its auto-deployment webhook. Don't edit `hostinger-deploy` by hand.

The contact form's SMTP password lives in `smtp-config.php` one folder above
`public_html` on the server, never in this repo.

## Local development

```
cd frontend_react
npm install
npm start
```
