# My Next.js App

## Overview
This project is a web application built with Next.js and TailwindCSS, designed for uploading and searching PDF documents. It integrates with a Flask backend for handling file uploads and queries, and utilizes AWS services for storage and processing.

## Features
- **PDF Upload**: Users can upload PDF documents to the application.
- **Search Functionality**: Users can input queries to search for relevant documents.
- **Responsive Design**: The application is styled using TailwindCSS for a modern and responsive user interface.

## Project Structure
```
my-nextjs-app
├── public
│   ├── favicon.ico          # Favicon for the application
│   └── images               # Directory for image assets
├── src
│   ├── components           # Reusable UI components
│   │   └── ui
│   ├── pages                # Application pages
│   │   ├── _app.tsx         # Custom App component
│   │   ├── index.tsx        # Main landing page
│   │   ├── upload.tsx       # PDF upload page
│   │   └── search.tsx       # Search interface
│   ├── styles               # Global styles
│   │   └── globals.css
│   ├── utils                # Utility functions
│   │   └── api.ts
│   └── types                # TypeScript types and interfaces
│       └── index.ts
├── tailwind.config.js       # TailwindCSS configuration
├── postcss.config.js        # PostCSS configuration
├── next.config.js           # Next.js configuration
├── package.json             # npm configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-nextjs-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to view the application.

## Usage
- Navigate to the **Upload** page to upload PDF documents.
- Use the **Search** page to input queries and retrieve relevant documents.

## Future Enhancements
- Implement user authentication using Firebase Auth or AWS Cognito.
- Integrate payment processing with Stripe for subscription plans.
- Enhance the search functionality with advanced filtering options.

## License
This project is licensed under the MIT License.