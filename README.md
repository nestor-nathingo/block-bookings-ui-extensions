# 🧾 Block Bookings VAlidaion Assistant – HubSpot UI Extension

This project is a custom [HubSpot UI Extension](https://developers.hubspot.com/docs/platform/ui-extensions-overview) designed to simplify and automate the process of validating block booking data (e.g., ADHOC, TOUR, FIT bookings) and creating CRM deals within HubSpot.

It provides a guided form interface for sales or reservations teams to:
- ✅ Validate booking numbers or references using backend logic
- ✅ Automatically create deals in the appropriate pipeline and stage
- ✅ Ensure data consistency across departments
- ✅ Reduce manual data entry and booking errors

### 🔧 Built With
- React (via `@hubspot/ui-extensions`)
- HubSpot CRM SDK and Serverless Functions
- Node.js (`@hubspot/api-client`)
- Environment-based deployment (sandbox → production)

### 🚀 Deployment Environments
Supports environment-based config for sandbox and production, including access tokens and pipeline metadata via environment variables.

---

> 🔐 **Important:** API keys and access tokens are stored securely and excluded from version control using `.env` and `.gitignore`.

---

### 📂 Folder Structure

src/
├── components/
│ └── block-bookings.jsx
├── serverless/
│ ├── createDeal.js
│ └── bookingValidation.js
└── utils/
└── block-bookings-utils.js

---

### 🛠 Setup Instructions
1. Clone the repo
2. Run `npm install`
3. Set up your `.env` with HubSpot access token(s)
4. Use the HubSpot CLI to deploy: `hs upload src my-extension`
5. Use `hs project sandbox` and `hs project prod` for different environments

---

The HubSpot CLI enables you to run this project locally so that you may test and iterate quickly. Getting started is simple, just run this HubSpot CLI command in your project directory and follow the prompts:

`hs project dev`
