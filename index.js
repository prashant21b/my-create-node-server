#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const inquirer = require("inquirer");

(async () => {
  const answers = await inquirer.prompt([
    { name: "projectName", message: "Project name:" },
    {
      type: "list",
      name: "language",
      message: "Choose language:",
      choices: ["JavaScript", "TypeScript"],
    },
    { type: "confirm", name: "useMongo", message: "Use MongoDB?" },
    { type: "confirm", name: "useDocker", message: "Add Docker support?" },
    {
      name: "dependencies",
      message: "Other dependencies (comma-separated, e.g., cors,dotenv):",
      default: "",
    },
    { type: "confirm", name: "addEnv", message: "Do you want to create a .env file?" },
    {
      type: "input",
      name: "envVars",
      message: "Enter .env variable names (comma separated):",
      when: (answers) => answers.addEnv === true,
    },
    { type: "confirm", name: "useESLint", message: "Add ESLint and Prettier setup?" },
    { type: "confirm", name: "initGit", message: "Initialize git repository?" },
  ]);

  const {
    projectName,
    language,
    useMongo,
    useDocker,
    dependencies,
    addEnv,
    envVars,
    useESLint,
    initGit,
  } = answers;

  const projectPath = path.join(process.cwd(), projectName);
  const isTS = language === "TypeScript";

  fs.mkdirSync(projectPath);
  const folders = ["routes", "controllers", "models", "config"];
  folders.forEach(folder => fs.mkdirSync(path.join(projectPath, folder)));

  const deps = ["express", ...(useMongo ? ["mongoose"] : []), ...dependencies.split(",").map(d => d.trim()).filter(Boolean)];
  const devDeps = isTS
    ? ["typescript", "@types/node", "@types/express", "ts-node-dev"]
    : [];

  if (isTS) fs.mkdirSync(path.join(projectPath, "src"));
  const serverPath = isTS ? "src/index.ts" : "server.js";

  const serverContent = isTS
    ? `import express from 'express';\nconst app = express();\napp.listen(3000, () => console.log('Server running'));\n`
    : `const express = require('express');\nconst app = express();\napp.listen(3000, () => console.log('Server running'));\n`;

  fs.writeFileSync(path.join(projectPath, serverPath), serverContent);

  if (addEnv) {
    const vars = envVars.split(",").map(v => v.trim()).filter(Boolean);
    const envContent = vars.map(v => `${v}=`).join("\n");
    fs.writeFileSync(path.join(projectPath, ".env"), envContent);
    console.log(`.env file created with: ${vars.join(", ")}`);
  }

  if (useDocker) {
    const dockerfile = `
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 3000
    `.trim();
    fs.writeFileSync(path.join(projectPath, "Dockerfile"), dockerfile);
  }

  // Create .gitignore
  const gitignore = `
node_modules
.env
dist
.DS_Store
npm-debug.log
  `.trim();
  fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

  // Run npm init and install deps
  execSync("npm init -y", { cwd: projectPath, stdio: "inherit" });
  if (deps.length) execSync(`npm install ${deps.join(" ")}`, { cwd: projectPath, stdio: "inherit" });
  if (devDeps.length) execSync(`npm install -D ${devDeps.join(" ")}`, { cwd: projectPath, stdio: "inherit" });

  // Add tsconfig if TS
  if (isTS) {
    const tsconfig = {
      compilerOptions: {
        target: "ES6",
        module: "commonjs",
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true
      }
    };
    fs.writeFileSync(path.join(projectPath, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
  }

  // ESLint + Prettier setup
  if (useESLint) {
    const lintDeps = ["eslint", "prettier"];
    if (isTS) {
      lintDeps.push("@typescript-eslint/parser", "@typescript-eslint/eslint-plugin");
    }
    execSync(`npm install -D ${lintDeps.join(" ")}`, { cwd: projectPath, stdio: "inherit" });

    const eslintConfig = isTS
      ? {
          parser: "@typescript-eslint/parser",
          extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: "module"
          },
          rules: {}
        }
      : {
          env: { node: true, es2021: true },
          extends: ["eslint:recommended"],
          parserOptions: { ecmaVersion: "latest", sourceType: "module" },
          rules: {}
        };

    fs.writeFileSync(path.join(projectPath, ".eslintrc.json"), JSON.stringify(eslintConfig, null, 2));
    fs.writeFileSync(path.join(projectPath, ".prettierrc"), "{}");
  }

  // Initialize Git
  if (initGit) {
    execSync("git init", { cwd: projectPath, stdio: "inherit" });
    execSync("git add .", { cwd: projectPath });
    execSync('git commit -m "Initial commit"', { cwd: projectPath });
    console.log("Git repo initialized with first commit.");
  }

  console.log(`\n Project "${projectName}" created successfully!`);

  // Add npm start script in package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  const startScript = isTS
    ? "ts-node-dev src/index.ts"
    : "node server.js";

  packageJson.scripts = {
    ...packageJson.scripts,
    start: startScript,
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`🚀 To run the app:\n   npm start`);

  if (isTS) {
    console.log(`\n To compile the app:\n   tsc`);
    console.log(` To run the app:\n   node dist/index.js`);
    console.log(` Or use ts-node:\n   npx ts-node src/index.ts`);
  } else {
    console.log(` To run the app:\n   node server.js`);
  }
})();
