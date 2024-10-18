## 📋 **Table of Contents**

1. [**Overview**](#overview)
2. [**Prerequisites**](#prerequisites)
3. [**Setting Up GitHub Actions Workflow**](#setting-up-github-actions-workflow)
    - [**Workflow Triggers**](#workflow-triggers)
    - [**Jobs and Steps**](#jobs-and-steps)
4. [**Deployment Strategies**](#deployment-strategies)
    - [**1. Publishing `@touch2fa/core` to npm**](#1-publishing-touch2fa-core-to-npm)
    - [**2. Deploying `ui` to a Hosting Service**](#2-deploying-ui-to-a-hosting-service)
    - [**3. Publishing `browser-extension` to Browser Stores**](#3-publishing-browser-extension-to-browser-stores)
5. [**Managing Secrets**](#managing-secrets)
6. [**Sample GitHub Actions Workflow File**](#sample-github-actions-workflow-file)
7. [**Best Practices and Tips**](#best-practices-and-tips)
8. [**Conclusion**](#conclusion)

---

## 🧐 **Overview**

Your **Touch2FA** project comprises three main packages:

1. **@touch2fa/core**: Core library for TOTP generation and biometric authentication.
2. **ui**: React-based UI components.
3. **browser-extension**: Browser extension integrating core functionalities and UI components.

The goal is to automate the following processes:

- **Code Quality Checks**: Linting and testing.
- **Building**: Compiling TypeScript and bundling assets.
- **Deployment**: Publishing to npm, deploying UI to hosting services, and publishing the browser extension to respective stores.

---

## 🔧 **Prerequisites**

Before setting up the CI/CD pipeline, ensure the following:

1. **GitHub Repository**: Your project is hosted on GitHub.
2. **Node.js and npm**: Ensure consistent Node.js and npm versions across development and CI environments.
3. **Lerna Configuration**: Properly configured `lerna.json` and `package.json` for managing the monorepo.
4. **Deployment Credentials**:
    - **npm Token**: For publishing packages.
    - **Hosting Service Credentials**: e.g., Netlify, Vercel, or GitHub Pages for the `ui` package.
    - **Browser Store API Keys**: For Chrome Web Store and Firefox Add-ons.

---

## 🚀 **Setting Up GitHub Actions Workflow**

### 🔄 **Workflow Triggers**

Determine when the CI/CD pipeline should run. Common triggers include:

- **Pushes** to specific branches (e.g., `main`, `develop`).
- **Pull Requests** targeting specific branches.
- **Tags** for releases.

### 🛠️ **Jobs and Steps**

Define separate jobs for different stages to optimize performance and maintain clarity.

1. **Linting and Testing**:
    - **Purpose**: Ensure code quality and functionality.
2. **Building**:
    - **Purpose**: Compile TypeScript, bundle assets.
3. **Deployment**:
    - **Purpose**: Publish to npm, deploy UI, publish browser extension.

#### **Example Workflow Structure**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  # Linting and Testing
  lint_and_test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16' # Specify your Node.js version
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Run Lint
        run: npx lerna run lint --stream --sort

      - name: Run Tests
        run: npx lerna run test --stream --sort

  # Building
  build:
    needs: lint_and_test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Packages
        run: npx lerna run build --stream --sort

  # Deployment
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Packages
        run: npx lerna run build --stream --sort

      # Publish to npm
      - name: Publish to npm
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: npx lerna publish from-package --yes
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      # Deploy UI to Hosting Service (e.g., Netlify)
      - name: Deploy UI to Netlify
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=packages/ui/dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

      # Publish Browser Extension to Chrome Web Store
      - name: Deploy to Chrome Web Store
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: chrome-webstore-upload/actions@v1
        with:
          extension_id: ${{ secrets.CHROME_EXTENSION_ID }}
          client_id: ${{ secrets.CHROME_CLIENT_ID }}
          client_secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh_token: ${{ secrets.CHROME_REFRESH_TOKEN }}
          zip_file: 'packages/browser-extension/dist.zip'

      # Publish Browser Extension to Firefox Add-ons
      - name: Deploy to Firefox Add-ons
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: mintlify/action-firefox-addons@v1
        with:
          api_key: ${{ secrets.FIREFOX_API_KEY }}
          extension_file: 'packages/browser-extension/dist.xpi'
```

---

### 📝 **Detailed Explanation of Each Step**

#### **1. Linting and Testing Job**

- **Checkout Repository**:
  - Uses `actions/checkout@v3` to clone your repository.

- **Setup Node.js**:
  - Sets up the specified Node.js version.
  - Caches `npm` dependencies to speed up future runs.

- **Install Dependencies**:
  - Runs `npm install` to install all dependencies across packages using npm workspaces.

- **Run Lint**:
  - Executes linting across all packages using Lerna.

- **Run Tests**:
  - Executes tests across all packages using Lerna.

#### **2. Building Job**

- **Dependencies**:
  - Depends on the successful completion of the `lint_and_test` job.

- **Checkout, Setup Node.js, Install Dependencies**:
  - Similar to the previous job to ensure a clean environment.

- **Build Packages**:
  - Runs the build scripts for all packages using Lerna.

#### **3. Deployment Job**

- **Dependencies**:
  - Depends on the successful completion of the `build` job.

- **Checkout, Setup Node.js, Install Dependencies, Build Packages**:
  - Repeats these steps to ensure deployment is based on the latest build.

- **Publish to npm**:
  - Uses `lerna publish from-package --yes` to publish updated packages to npm.
  - Only triggers on pushes to the `main` branch.
  - Uses `NPM_TOKEN` stored in GitHub Secrets for authentication.

- **Deploy UI to Hosting Service (Netlify Example)**:
  - Uses Netlify's GitHub Action to deploy the built UI.
  - Requires `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in GitHub Secrets.

- **Publish Browser Extension to Chrome Web Store**:
  - Uses a Chrome Web Store upload action.
  - Requires `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, and `CHROME_REFRESH_TOKEN` in GitHub Secrets.
  - Uploads a zipped version of the extension.

- **Publish Browser Extension to Firefox Add-ons**:
  - Uses a Firefox Add-ons upload action.
  - Requires `FIREFOX_API_KEY` in GitHub Secrets.
  - Uploads the `.xpi` file of the extension.

---

## 📦 **Deployment Strategies**

Given your project structure, deployment involves multiple components. Below are tailored strategies for each package.

### 1️⃣ **Publishing `@touch2fa/core` to npm**

**Purpose**: Make the core library available for installation via npm.

**Steps**:

1. **Configure `package.json` for Publishing**:
    - Ensure `@touch2fa/core/package.json` has appropriate fields like `name`, `version`, `main`, `types`, etc.
    - Set `"private": false` if you intend to publish it.

2. **Set Up npm Authentication**:
    - **Generate npm Token**:
        - Log in to your npm account.
        - Navigate to **Access Tokens**.
        - Create a new **Automation** token.
    - **Add npm Token to GitHub Secrets**:
        - Go to your GitHub repository.
        - Navigate to **Settings > Secrets and variables > Actions**.
        - Add a new secret named `NPM_TOKEN` with the value of your npm token.

3. **Automate Publishing with GitHub Actions**:
    - As shown in the sample workflow, use `lerna publish from-package` to publish updated packages to npm.

**Notes**:

- Ensure that the version in `package.json` is updated appropriately before publishing.
- Consider using **Semantic Versioning** to manage versions.

### 2️⃣ **Deploying `ui` to a Hosting Service**

**Purpose**: Host the UI components or a standalone application (if applicable).

**Popular Hosting Options**:

- **Netlify**:
    - Supports continuous deployment from GitHub.
    - Free tier available.
- **Vercel**:
    - Ideal for React applications.
    - Free tier available.
- **GitHub Pages**:
    - Suitable for static sites.
    - Free with GitHub repository.

**Example: Deploying to Netlify**

1. **Create a Netlify Account**: Sign up at [Netlify](https://www.netlify.com/).

2. **Create a New Site**:
    - Connect your GitHub repository.
    - Specify the build command (`npm run build`) and the publish directory (`packages/ui/dist`).

3. **Obtain Netlify Credentials**:
    - Go to **User Settings > Applications > Personal access tokens**.
    - Generate a new token.

4. **Add Netlify Credentials to GitHub Secrets**:
    - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token.
    - `NETLIFY_SITE_ID`: Your Netlify site ID.

5. **Automate Deployment with GitHub Actions**:
    - As shown in the sample workflow, use `netlify/actions/cli@master` to deploy the built UI.

### 3️⃣ **Publishing `browser-extension` to Browser Stores**

**Purpose**: Distribute your browser extension to users via official browser extension stores.

**Chrome Web Store**:

1. **Create a Developer Account**: Sign up at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).

2. **Obtain API Credentials**:
    - Create an OAuth Client ID and Client Secret via [Google Cloud Console](https://console.cloud.google.com/).
    - Generate a **Refresh Token** for automated uploads.

3. **Add Credentials to GitHub Secrets**:
    - `CHROME_EXTENSION_ID`: Your extension's unique ID.
    - `CHROME_CLIENT_ID`: OAuth Client ID.
    - `CHROME_CLIENT_SECRET`: OAuth Client Secret.
    - `CHROME_REFRESH_TOKEN`: OAuth Refresh Token.

4. **Automate Deployment with GitHub Actions**:
    - Use an action like [`chrome-webstore-upload/actions`](https://github.com/marketplace/actions/chrome-webstore-upload) to handle the upload process.
    - Ensure the extension is zipped (`dist.zip`) before uploading.

**Firefox Add-ons (AMO)**:

1. **Create a Developer Account**: Sign up at [Mozilla Developer Hub](https://addons.mozilla.org/developers/).

2. **Obtain API Key**:
    - Generate an API key from the Developer Hub for automated uploads.

3. **Add API Key to GitHub Secrets**:
    - `FIREFOX_API_KEY`: Your Firefox Add-ons API key.

4. **Automate Deployment with GitHub Actions**:
    - Use an action like [`mintlify/action-firefox-addons`](https://github.com/marketplace/actions/mintlify-action-firefox-addons) to upload the `.xpi` file.

**Notes**:

- **Versioning**: Ensure that each deployment has an updated version number to comply with store requirements.
- **Manifest Configuration**: Verify that your browser extension's `manifest.json` is correctly configured for both Chrome and Firefox.
- **Testing**: Before deploying to stores, test the extension thoroughly in each browser.

---

## 🔒 **Managing Secrets**

Security is paramount, especially when dealing with deployment credentials. GitHub Secrets ensure that sensitive information remains protected.

### **Adding Secrets to GitHub**

1. **Navigate to Repository Settings**:
    - Go to your GitHub repository.
    - Click on **Settings**.

2. **Access Secrets**:
    - Click on **Secrets and variables** in the sidebar.
    - Select **Actions**.

3. **Add New Secret**:
    - Click on **New repository secret**.
    - Provide a **Name** and **Value** for each secret (e.g., `NPM_TOKEN`, `NETLIFY_AUTH_TOKEN`).

4. **Use Secrets in Workflow**:
    - Access secrets in your workflow file using `${{ secrets.SECRET_NAME }}`.

### **List of Recommended Secrets**

- `NPM_TOKEN`: npm authentication token for publishing packages.
- `NETLIFY_AUTH_TOKEN`: Netlify personal access token for deploying the UI.
- `NETLIFY_SITE_ID`: Netlify site identifier.
- `CHROME_EXTENSION_ID`: Unique ID of your Chrome extension.
- `CHROME_CLIENT_ID`: OAuth Client ID for Chrome Web Store.
- `CHROME_CLIENT_SECRET`: OAuth Client Secret for Chrome Web Store.
- `CHROME_REFRESH_TOKEN`: OAuth Refresh Token for Chrome Web Store.
- `FIREFOX_API_KEY`: API key for Firefox Add-ons.

---

## 🛠️ **Sample GitHub Actions Workflow File**

Below is a **comprehensive GitHub Actions workflow** tailored for your **Touch2FA** project. This workflow handles linting, testing, building, and deploying all three packages (`@touch2fa/core`, `ui`, `browser-extension`).

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop
  release:
    types: [published]

jobs:
  # Linting and Testing
  lint_and_test:
    name: Lint and Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16' # Specify your Node.js version
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Run Lint
        run: npx lerna run lint --stream --sort

      - name: Run Tests
        run: npx lerna run test --stream --sort

  # Building
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint_and_test

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Packages
        run: npx lerna run build --stream --sort

  # Deployment
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Packages
        run: npx lerna run build --stream --sort

      # Publish to npm
      - name: Publish to npm
        run: npx lerna publish from-package --yes
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      # Deploy UI to Netlify
      - name: Deploy UI to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=packages/ui/dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

      # Zip Browser Extension
      - name: Zip Browser Extension
        run: |
          cd packages/browser-extension/dist
          zip -r ../../../../browser-extension.zip ./*

      # Deploy to Chrome Web Store
      - name: Deploy to Chrome Web Store
        uses: chrome-webstore-upload/actions@v1
        with:
          extension_id: ${{ secrets.CHROME_EXTENSION_ID }}
          client_id: ${{ secrets.CHROME_CLIENT_ID }}
          client_secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh_token: ${{ secrets.CHROME_REFRESH_TOKEN }}
          zip_file: 'browser-extension.zip'

      # Deploy to Firefox Add-ons
      - name: Deploy to Firefox Add-ons
        uses: mintlify/action-firefox-addons@v1
        with:
          api_key: ${{ secrets.FIREFOX_API_KEY }}
          extension_file: 'packages/browser-extension/dist.xpi'

      # Notify Success (Optional)
      - name: Notify Deployment Success
        uses: peter-evans/slack@v3
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          message: '🚀 Touch2FA has been successfully deployed!'

```

---

### 📝 **Explanation of Workflow Steps**

1. **Workflow Triggers (`on`)**:
    - **push**: Runs on pushes to `main` and `develop` branches.
    - **pull_request**: Runs on PRs targeting `main` and `develop`.
    - **release**: Triggers on release publications.

2. **Jobs**:
    - **lint_and_test**:
        - **Checkout**: Clones the repository.
        - **Setup Node.js**: Installs Node.js and caches `npm` dependencies.
        - **Install Dependencies**: Runs `npm install` to install all dependencies.
        - **Run Lint**: Executes linting across all packages.
        - **Run Tests**: Executes test suites across all packages.
    - **build**:
        - **Depends on `lint_and_test`**: Ensures that linting and testing pass before building.
        - **Checkout, Setup Node.js, Install Dependencies**: Same as above.
        - **Build Packages**: Runs the build scripts for all packages.
    - **deploy**:
        - **Depends on `build`**: Ensures that build is successful before deploying.
        - **Conditional Execution**: Only runs on pushes to `main` branch.
        - **Checkout, Setup Node.js, Install Dependencies, Build Packages**: Repeats to ensure a clean environment.
        - **Publish to npm**: Uses Lerna to publish updated packages to npm.
        - **Deploy UI to Netlify**: Deploys the built UI to Netlify.
        - **Zip Browser Extension**: Compresses the browser extension files.
        - **Deploy to Chrome Web Store**: Uploads the zipped extension to Chrome Web Store.
        - **Deploy to Firefox Add-ons**: Uploads the `.xpi` file to Firefox Add-ons.
        - **Notify Deployment Success**: Optional step to send a Slack notification upon successful deployment.

---

## 🚀 **Deployment Strategies**

### 1️⃣ **Publishing `@touch2fa/core` to npm**

**Purpose**: Distribute the core library via npm for easy installation and integration.

**Steps**:

1. **Configure `package.json` for Publishing**:
    - Ensure the `@touch2fa/core/package.json` includes necessary fields:
        ```json
        {
          "name": "@touch2fa/core",
          "version": "1.0.0",
          "description": "Core functionalities for Touch2FA",
          "main": "dist/index.js",
          "types": "dist/index.d.ts",
          "scripts": {
            "build": "tsc",
            "test": "jest",
            "lint": "eslint 'src/**/*.{ts,tsx}'"
          },
          "dependencies": {
            "@otplib/preset-default": "^12.0.1"
          },
          "devDependencies": {
            "typescript": "^4.5.2",
            "jest": "^27.0.6",
            "@types/jest": "^27.0.2",
            "eslint": "^8.12.0",
            "@typescript-eslint/parser": "^5.0.0",
            "@typescript-eslint/eslint-plugin": "^5.0.0"
          },
          "repository": {
            "type": "git",
            "url": "git+https://github.com/yourusername/touch2fa.git"
          },
          "keywords": [
            "2FA",
            "TOTP",
            "Biometric",
            "Authentication",
            "Security"
          ],
          "author": "Your Name",
          "license": "MIT"
        }
        ```
    - **Important Fields**:
        - `name`: Scoped package name.
        - `version`: Follows semantic versioning.
        - `main` and `types`: Entry points for the package.
        - `scripts`: Define build, test, and lint commands.
        - `repository`: Link to the GitHub repository.
        - `keywords`: Enhance discoverability on npm.

2. **Set Up npm Authentication**:
    - **Generate npm Token**:
        - Log in to your npm account.
        - Navigate to **Access Tokens** and create a new **Automation** token.
    - **Add npm Token to GitHub Secrets**:
        - Go to **Settings > Secrets and variables > Actions** in your GitHub repository.
        - Add a new secret named `NPM_TOKEN` with the value of your npm token.

3. **Automate Publishing with GitHub Actions**:
    - The `deploy` job in the sample workflow handles publishing to npm using Lerna:
        ```yaml
        - name: Publish to npm
          run: npx lerna publish from-package --yes
          env:
            NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        ```
    - **Explanation**:
        - `lerna publish from-package`: Publishes packages based on the version specified in `package.json`.
        - `--yes`: Skips prompts, automating the process.
        - `NODE_AUTH_TOKEN`: Authenticates with npm using the secret token.

**Notes**:

- **Version Management**:
    - Use Lerna's versioning to manage package versions.
    - Consider automating version bumps based on commit messages using tools like **semantic-release**.

- **Private vs. Public Packages**:
    - Ensure `"private": false` in `@touch2fa/core/package.json` if publishing publicly.
    - Use scoped packages (e.g., `@touch2fa/core`) for better organization and namespace management.

---

### 2️⃣ **Deploying `ui` to a Hosting Service**

**Purpose**: Host the UI components or a standalone application for users to interact with Touch2FA.

**Steps**:

1. **Choose a Hosting Service**:
    - **Netlify**: Great for static sites and offers continuous deployment.
    - **Vercel**: Ideal for React applications with serverless functions.
    - **GitHub Pages**: Suitable for simple static sites.

2. **Configure Deployment Settings**:
    - **Build Command**: `npm run build` or as defined in your `ui` package.
    - **Publish Directory**: Typically `packages/ui/dist` or the output directory from your build process.

3. **Set Up Deployment Credentials**:
    - **Netlify Example**:
        - **Generate Netlify Token**:
            - Log in to Netlify.
            - Navigate to **User Settings > Applications > Personal access tokens**.
            - Create a new token.
        - **Add to GitHub Secrets**:
            - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token.
            - `NETLIFY_SITE_ID`: Your Netlify site ID (found in site settings).

4. **Automate Deployment with GitHub Actions**:
    - The `deploy` job includes steps to deploy to Netlify:
        ```yaml
        - name: Deploy UI to Netlify
          uses: netlify/actions/cli@master
          with:
            args: deploy --dir=packages/ui/dist --prod
          env:
            NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
            NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        ```

**Notes**:

- **Environment Variables**: If your UI requires environment variables, configure them in the hosting service's settings and reference them in your build process.
- **Custom Domains**: Set up custom domains if needed for branding purposes.

---

### 3️⃣ **Publishing `browser-extension` to Browser Stores**

**Purpose**: Distribute the Touch2FA extension to users via official browser extension stores.

#### **Chrome Web Store**

1. **Create a Developer Account**:
    - Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
    - Pay a one-time registration fee if required.

2. **Obtain API Credentials**:
    - **OAuth Client ID and Secret**:
        - Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
        - Create a new project or select an existing one.
        - Enable the **Chrome Web Store API**.
        - Create OAuth 2.0 Client ID and Secret.
    - **Refresh Token**:
        - Use OAuth 2.0 to generate a refresh token for automated uploads.
        - Follow [Google's OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2) to obtain a refresh token.

3. **Add Credentials to GitHub Secrets**:
    - `CHROME_EXTENSION_ID`: Your extension's unique ID (found in the Chrome Web Store dashboard).
    - `CHROME_CLIENT_ID`: OAuth Client ID.
    - `CHROME_CLIENT_SECRET`: OAuth Client Secret.
    - `CHROME_REFRESH_TOKEN`: OAuth Refresh Token.

4. **Automate Deployment with GitHub Actions**:
    - Use an action like [`chrome-webstore-upload/actions`](https://github.com/marketplace/actions/chrome-webstore-upload) to handle the upload.
    - **Ensure Extension is Zipped**:
        - Add a step to zip the extension files before uploading.

        ```yaml
        - name: Zip Browser Extension
          run: |
            cd packages/browser-extension/dist
            zip -r ../../../../browser-extension.zip ./*
        ```

    - **Upload to Chrome Web Store**:

        ```yaml
        - name: Deploy to Chrome Web Store
          uses: chrome-webstore-upload/actions@v1
          with:
            extension_id: ${{ secrets.CHROME_EXTENSION_ID }}
            client_id: ${{ secrets.CHROME_CLIENT_ID }}
            client_secret: ${{ secrets.CHROME_CLIENT_SECRET }}
            refresh_token: ${{ secrets.CHROME_REFRESH_TOKEN }}
            zip_file: 'browser-extension.zip'
        ```

#### **Firefox Add-ons (AMO)**

1. **Create a Developer Account**:
    - Sign up at the [Mozilla Developer Hub](https://addons.mozilla.org/developers/).

2. **Obtain API Key**:
    - Navigate to **Manage API Keys**.
    - Create a new API key for automated submissions.

3. **Add API Key to GitHub Secrets**:
    - `FIREFOX_API_KEY`: Your Firefox Add-ons API key.

4. **Automate Deployment with GitHub Actions**:
    - Use an action like [`mintlify/action-firefox-addons`](https://github.com/marketplace/actions/mintlify-action-firefox-addons) to handle the upload.

    - **Ensure Extension is Packaged as `.xpi`**:
        - Add a step to package the extension appropriately.

        ```yaml
        - name: Package Firefox Extension
          run: |
            cd packages/browser-extension/dist
            zip -r ../../../../browser-extension.xpi ./*
        ```

    - **Upload to Firefox Add-ons**:

        ```yaml
        - name: Deploy to Firefox Add-ons
          uses: mintlify/action-firefox-addons@v1
          with:
            api_key: ${{ secrets.FIREFOX_API_KEY }}
            extension_file: 'browser-extension.xpi'
        ```

**Notes**:

- **Versioning**: Update the extension version in `manifest.json` before each deployment to comply with store requirements.
- **Testing**: Test the extension thoroughly in each browser before deploying to production.

---

## 🔐 **Managing Secrets**

Securely managing your deployment credentials is crucial. Here's how to handle them:

1. **Navigate to GitHub Secrets**:
    - Go to your repository on GitHub.
    - Click on **Settings** > **Secrets and variables** > **Actions**.

2. **Add Required Secrets**:
    - Click **New repository secret**.
    - Add each secret with a clear name, e.g., `NPM_TOKEN`, `NETLIFY_AUTH_TOKEN`, etc.

3. **Reference Secrets in Workflow**:
    - Use the syntax `${{ secrets.SECRET_NAME }}` within your workflow files to access the secrets.

**Security Best Practices**:

- **Least Privilege**: Only grant necessary permissions to each token.
- **Rotate Tokens**: Regularly update and rotate your tokens to minimize risks.
- **Do Not Expose Secrets**: Avoid echoing or printing secrets in logs.

---

## 📄 **Sample GitHub Actions Workflow File**

Below is a **comprehensive GitHub Actions workflow** tailored for the **Touch2FA** project. This workflow includes linting, testing, building, and deploying to npm, Netlify, Chrome Web Store, and Firefox Add-ons.

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop
  release:
    types: [published]

jobs:
  # Linting and Testing
  lint_and_test:
    name: Lint and Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16' # Specify your Node.js version
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Run Lint
        run: npx lerna run lint --stream --sort

      - name: Run Tests
        run: npx lerna run test --stream --sort

  # Building
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint_and_test

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Packages
        run: npx lerna run build --stream --sort

  # Deployment
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build Packages
        run: npx lerna run build --stream --sort

      # Publish to npm
      - name: Publish to npm
        run: npx lerna publish from-package --yes
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      # Deploy UI to Netlify
      - name: Deploy UI to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=packages/ui/dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

      # Zip Browser Extension for Chrome
      - name: Zip Browser Extension
        run: |
          cd packages/browser-extension/dist
          zip -r ../../../../browser-extension.zip ./*

      # Deploy to Chrome Web Store
      - name: Deploy to Chrome Web Store
        uses: chrome-webstore-upload/actions@v1
        with:
          extension_id: ${{ secrets.CHROME_EXTENSION_ID }}
          client_id: ${{ secrets.CHROME_CLIENT_ID }}
          client_secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh_token: ${{ secrets.CHROME_REFRESH_TOKEN }}
          zip_file: 'browser-extension.zip'

      # Package Firefox Extension
      - name: Package Firefox Extension
        run: |
          cd packages/browser-extension/dist
          zip -r ../../../../browser-extension.xpi ./*

      # Deploy to Firefox Add-ons
      - name: Deploy to Firefox Add-ons
        uses: mintlify/action-firefox-addons@v1
        with:
          api_key: ${{ secrets.FIREFOX_API_KEY }}
          extension_file: 'browser-extension.xpi'

      # Notify Success (Optional)
      - name: Notify Deployment Success
        uses: peter-evans/slack@v3
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          message: '🚀 Touch2FA has been successfully deployed!'

```

**Key Components Explained**:

1. **Triggers (`on`)**:
    - **push**: Activates on pushes to `main` and `develop` branches.
    - **pull_request**: Activates on PRs targeting `main` and `develop`.
    - **release**: Activates when a release is published.

2. **Jobs**:
    - **lint_and_test**:
        - Runs linting and testing to ensure code quality.
    - **build**:
        - Builds all packages after successful linting and testing.
    - **deploy**:
        - Deploys packages when changes are pushed to `main`.
        - Publishes `@touch2fa/core` to npm.
        - Deploys the `ui` package to Netlify.
        - Packages and uploads the browser extension to Chrome Web Store and Firefox Add-ons.
        - Optionally sends a Slack notification upon successful deployment.

3. **Environment Variables (`env`)**:
    - **Secrets**: Utilizes GitHub Secrets for sensitive information like tokens and API keys.

4. **Conditional Execution**:
    - The `deploy` job only runs on pushes to the `main` branch, ensuring that deployments occur from stable code.

---

## 🛠️ **Best Practices and Tips**

1. **Separate Deployment Environments**:
    - Use different workflows or conditional steps for different environments (e.g., staging vs. production).

2. **Caching Dependencies**:
    - Utilize caching strategies to speed up workflows. GitHub Actions can cache `node_modules` using the `cache` option in `actions/setup-node`.

3. **Parallelization**:
    - Split jobs that can run in parallel to optimize pipeline speed.

4. **Automated Versioning**:
    - Integrate tools like **semantic-release** to automate version bumps and changelog generation based on commit messages.

5. **Security**:
    - Regularly rotate your secrets and ensure they have the least privileges necessary.
    - Avoid exposing sensitive information in logs.

6. **Testing**:
    - Implement comprehensive testing (unit, integration, end-to-end) to ensure reliability.
    - Use coverage reports to monitor test effectiveness.

7. **Documentation**:
    - Maintain up-to-date documentation for both the project and the CI/CD setup.
    - Include instructions for contributing, setting up the development environment, and deploying.

8. **Notifications**:
    - Set up notifications (e.g., Slack, email) to stay informed about pipeline successes or failures.

9. **Error Handling**:
    - Implement robust error handling in workflows to gracefully handle failures and provide actionable feedback.

---