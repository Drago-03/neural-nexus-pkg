# Contributing to Neural-Nexus-Pkg

Hey there! 🔥 Thanks for considering contributing to Neural-Nexus-Pkg. This guide will help you get started with development and show you how to make your contribution as smooth as possible.

## 💻 Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/neural-nexus-pkg.git
   cd neural-nexus-pkg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the package**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 🤔 What Can I Contribute?

- **Bug fixes**: Found a bug? Fix it and submit a PR!
- **Feature enhancements**: Have an idea to make the package better? Let's hear it!
- **Documentation**: Improve the docs to help others use the package
- **Examples**: Create example use cases to showcase what's possible
- **Tests**: Add or improve tests to ensure code quality

## 📚 Code Style

We follow a specific coding style to keep the codebase consistent:

- Use TypeScript for type safety
- Follow the ESLint rules configured in the project
- Format your code using Prettier before submitting
- Write JSDoc comments for public APIs
- Use meaningful variable and function names

Run `npm run lint` and `npm run format` before submitting your code to ensure it meets our style guidelines.

## 🚀 Pull Request Process

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and add tests if applicable

3. **Commit your changes** using clear commit messages
   ```bash
   git commit -m "Add cool new feature that does x"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a pull request** to the main repository

6. **Respond to feedback** and make necessary changes

## ✅ PR Checklist

Before submitting your PR, make sure:

- [ ] Tests pass with `npm test`
- [ ] Your code is linted with `npm run lint`
- [ ] You've added documentation for new features
- [ ] Your changes don't break existing functionality
- [ ] You've updated examples if needed
- [ ] You've incremented the version number in package.json if needed

## 📝 Commit Message Guidelines

We follow conventional commits for clear communication:

```
type(scope): short description

longer description if needed

fixes #issue-number
```

Types include:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting changes
- **refactor**: Code restructuring
- **test**: Adding or improving tests
- **chore**: Maintenance tasks

## 📜 License

By contributing to Neural-Nexus-Pkg, you agree that your contributions will be licensed under the project's MIT License.

## 🙏 Thank You!

Your contributions help make Neural-Nexus-Pkg better for everyone. We appreciate your time and effort! 