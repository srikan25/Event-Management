# Event Management System

Event Management System is a mobile-first React application designed to manage financial records for community and festival events.

The application was created to simplify the management of contributions, special contributions, expenses, and previous balances. It provides organizers with a centralized system for maintaining event records instead of relying on manual calculations and scattered records.

## Features

### Event Management

Users can create and manage multiple events.

The application allows users to:

* Create new events
* View available events
* Switch between events
* Edit event information
* Delete events

Financial records are maintained separately for each event.

### Dashboard

The dashboard provides a quick overview of the currently selected event.

It displays the available balance along with separate sections for:

* Contributions
* Special Contributions
* Expenses
* Previous Balance

Users can open each section to view its complete records.

### Contributions

Users can maintain monetary contributions received for an event.

Contribution records include information such as:

* Contributor Name
* Amount
* Date

Users can add, view, edit, and delete contribution records.

### Special Contributions

The application also supports non-monetary or in-kind contributions.

Special contribution records can contain:

* Contributor Name
* Item Name
* Date

This allows event organizers to maintain both financial and non-financial contributions separately.

### Expense Management

Event expenses can be recorded and managed from the application.

Expense records include:

* Expense Reason
* Amount
* Date

Users can add, view, edit, and delete expense records.

### Previous Balance Management

Previous balance records can be maintained separately for amounts carried over or associated with previous event finances.

The system can track:

* Person Name
* Amount
* Return Status

When an amount is marked as returned, it can be reflected in the available event balance while maintaining the original previous balance record.

### Available Balance

The application calculates and displays the available event balance based on the event's financial records.

This gives organizers a quick overview of the current financial position of the selected event.

### Download / Export

Users can download event-related records for easier sharing and record keeping.

Download functionality is available for relevant sections as well as overall event information.

### Authentication

Authentication is implemented using Supabase.

The application supports:

* User Sign Up
* User Login
* User Logout
* Protected application access

### User Data Security

Each authenticated user's event data is kept separate.

Events, contributions, special contributions, expenses, and previous balance records are associated with their respective user.

Supabase Row Level Security (RLS) is used to ensure users can access only their own records.

### Theme Support

The application provides theme preferences for a better viewing experience.

Users can switch between supported themes from the application menu.

### Mobile-First Design

The application is designed primarily for mobile-phone usage.

The interface focuses on:

* Easy navigation
* Touch-friendly controls
* Clear financial information
* Simple record management
* Responsive layouts

This makes the application practical for organizers managing event records directly from their phones.

## Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Vite

### Backend & Services

* Supabase Authentication
* Supabase Database
* Supabase Row Level Security (RLS)

### Tools

* Git
* GitHub
* VS Code

## Screenshots

Screenshots of the application interface can be added here.

Suggested views:

* Event Dashboard
* Contributions
* Expenses
* Event Management

## Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd YOUR_PROJECT_FOLDER
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and configure the required Supabase environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit your `.env` file or expose private credentials in the repository.

### 5. Start the Development Server

```bash
npm run dev
```

## Future Improvements

* Additional event reports and analytics
* More export and reporting options
* Improved event history
* Enhanced search and filtering
* Additional notification features

## Author

**Kotla Srikanth**

Frontend Developer | React.js

GitHub: github.com/srikan25
