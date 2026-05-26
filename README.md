# Nodejs Classifieds

A small classifieds-style Node.js application built with Express, MongoDB, Handlebars, Passport, and server-rendered pages.

This repository started as a training project and has been updated to run on a modern Node.js stack. It includes member registration and login, optional social authentication, a simple admin back office, CSRF protection, and basic multilingual support.

## Highlights

- Server-rendered Express application
- MongoDB + Mongoose data layer
- Local member registration and login
- Optional Facebook and Google OAuth login
- Admin login flow with password + PIN code
- Handlebars templates
- English and Vietnamese localization
- Session-based authentication
- CSRF protection on form routes

## Tech Stack

- Node.js `>= 22.15.0`
- Express `5`
- Mongoose `9`
- Passport `0.7`
- Express Handlebars `8`
- Express Validator `7`
- MongoDB

## Requirements

Before running the project, make sure you have:

- Node.js `22.15.0` or newer
- npm
- A running MongoDB server

## Installation

```bash
git clone https://github.com/2pay/nodejs-classifields.git
cd nodejs-classifields
npm install
```

## Configuration

The application currently uses simple config files instead of environment variables.

### 1. Database

Edit [config/database.js](config/database.js) and set your MongoDB connection string.

Example with MongoDB authentication:

```js
module.exports = {
  dbStr: 'mongodb://username:password@localhost:27017/classifields'
};
```

Example without MongoDB authentication:

```js
module.exports = {
  dbStr: 'mongodb://localhost:27017/classifields'
};
```

### 2. Application Settings

Edit [config/settings.js](config/settings.js):

- `siteName`: display name used in templates
- `defaultTemplate`: active template folder
- `secured_key`: session secret
- `passwordLength`: minimum password length for registration
- `confirmRegister`: if set to `1`, new accounts are created as `INACTIVE`

### 3. Social Login

Edit [config/auth.js](config/auth.js) and replace the sample credentials with your own provider settings.

Configured callback paths:

- Facebook: `/member/facebook/callback`
- Google: `/member/google/callback`

If you do not need social login, you can leave these credentials unused and simply avoid those routes in the UI.

## Running the App

```bash
npm start
```

By default, the server runs on port `3000`.

Open:

- `http://localhost:3000/`

## Main Routes

### Public

- `/` - home page
- `/en` - switch language to English
- `/vi` - switch language to Vietnamese

### Member Area

- `/member/register` - register
- `/member/login` - login
- `/member/dashboard` - member dashboard
- `/member/logout` - logout
- `/member/facebook` - Facebook login
- `/member/google` - Google login

### Back Office

- `/backoffice/login` - admin login
- `/backoffice` - admin dashboard
- `/backoffice/logout` - admin logout

## Admin Account Notes

The back-office login is stricter than member login.

An admin user must:

- exist in MongoDB
- have `roles: 'ADMIN'`
- have a valid local password
- have a hashed `local.adminPin`
- have `status: 'ACTIVE'`

There is no seeder included in this repository, so admin users must be created manually or through your own setup script.

## Project Structure

```text
.
|-- app.js
|-- server.js
|-- config/
|-- controllers/
|-- helpers/
|-- languages/
|-- models/
|-- public/
|-- routes/
`-- templates/
```

## Available Script

```bash
npm start
```

## Security Notes

Before using this project outside local development:

- replace the session secret in `config/settings.js`
- replace all sample OAuth credentials in `config/auth.js`
- use a production-ready MongoDB connection string
- review session storage strategy
- consider moving secrets to environment variables
- review `i18n` auto-write behavior before production deployment

## Development Notes

- The app uses server-side rendering with Handlebars.
- Authentication is handled with Passport sessions.
- Form routes under member and back-office areas use CSRF protection.
- Locale files are stored in `languages/`.

## Known Limitations

- Configuration is file-based, not environment-based
- No automated test suite is included
- No database seeding or migration tooling is included
- The UI is intentionally simple and training-project oriented

## Legacy Source

This codebase originated from a Node.js training series by Dung Vu and has since been updated for newer runtime and package compatibility.
