*# 🧾 Block Bookings Validation Assistant – HubSpot UI Extension

A custom [HubSpot UI Extension](https://developers.hubspot.com/docs/platform/ui-extensions-overview) for automating and validating block booking data (ADHOC, TOUR, FIT bookings) and streamlining CRM deal creation.

## Features

- **Booking Validation:** Validate booking numbers or references using backend logic.
- **Automated Deal Creation:** Create deals in the correct pipeline and stage automatically.
- **Data Consistency:** Ensure consistent data across departments.
- **Error Reduction:** Minimize manual entry and booking errors.

## Tech Stack

- **React** (`@hubspot/ui-extensions`)
- **HubSpot CRM SDK & Serverless Functions**
- **Node.js** (`@hubspot/api-client`)
- **Environment-based Deployment:** Sandbox and production support.

## Folder Structure

```
src/
├── components/
│   └── block-bookings.jsx
├── serverless/
│   ├── createDeal.js
│   └── bookingValidation.js
└── utils/
    └── block-bookings-utils.js
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- HubSpot CLI (`npm install -g @hubspot/cli`)
- HubSpot developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/block-bookings-ui-extensions.git
   cd block-bookings-ui-extensions
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Create a `.env` file in the root directory.
   - Add your HubSpot access token(s) and pipeline metadata.
   - Example:
     ```env
     HUBSPOT_ACCESS_TOKEN=your-access-token
     PIPELINE_ID=your-pipeline-id
     BOOKING_URL=your-booking-url
     ```
4. **Deploy to HubSpot**
   - Sandbox (UAT):
     - Push to the `block-bookings-ui-extensions/UAT` branch on GitHub.
     - This will automatically update the HubSpot sandbox environment.
   - Production (Live):
     - Push to the `block-bookings-ui-extensions/main` branch on GitHub.
     - This will automatically update the HubSpot live environment.

### Local Development

Run the following command to start the local development server and follow the prompts:
```bash
hs project dev
```

## Security

- API keys and access tokens are stored securely in `.env` files.
- Sensitive files are excluded from version control via `.gitignore`.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Author
Nestor Nathingo

## Support
For questions, please open an issue or contact the repository maintainer.*