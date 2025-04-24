# My Create Node Server

A CLI tool to create a Node.js server with Express. This package helps you easily generate a Node.js server project structure with optional MongoDB and Docker support.

## Features

- **Choose between JavaScript and TypeScript**: You can select either JavaScript or TypeScript as the language for your server setup.
- **MongoDB Integration**: If selected, MongoDB support will be added, including the `mongoose` dependency.
- **Docker Support**: Optionally add a `Dockerfile` to help containerize your application for easy deployment.
- **Environment Configuration (`.env`)**: If you choose, the tool can generate a `.env` file with your environment variables.
- **Project Structure**: Automatically creates a well-structured project with `routes`, `controllers`, `models`, and `config` directories.
- **ESLint & Prettier Setup**: The tool includes automatic setup for ESLint and Prettier to help with code quality and consistency.
- **Git Initialization**: The tool initializes a Git repository, adds a `.gitignore` file, and commits the initial project structure.
- **Customizable Dependencies**: You can add other npm dependencies as required during the project setup.

## Installation

To install the package globally, run:

```bash
npm install -g my-create-node-server
```

## Usage

To create a new server project, just run:

```bash
my-create-node-server
```

Follow the CLI prompts to configure your server based on your needs.

## License

ISC