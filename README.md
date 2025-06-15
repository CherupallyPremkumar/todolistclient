# Todo List Frontend

The frontend of the Todo List application built with React and Material-UI. This application provides a modern and responsive user interface for managing tasks.

## Features

- Modern and responsive UI with Material-UI components
- Task creation, editing, and deletion
- Mark tasks as complete/incomplete
- Real-time updates
- Error handling and loading states
- Form validation
- Integration tests

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the client directory with the following content:

```
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

Start the development server:

```bash
npm start
```

The application will open in your default browser at http://localhost:3000

## Running Tests

Run the test suite:

```bash
npm test
```

## Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── TodoList.js  # Main todo list component
│   │   └── ...
│   ├── App.js          # Root component
│   └── index.js        # Entry point
├── package.json
└── README.md
```

## Technologies Used

- React
- Material-UI
- Axios for API calls
- React Testing Library
- Jest for testing

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
