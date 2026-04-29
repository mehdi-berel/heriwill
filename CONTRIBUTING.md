# Contributing to HeriWill SaaS

Thank you for your interest in contributing to HeriWill SaaS! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or error messages if applicable
- Environment details (OS, Node.js version, browser)

### Suggesting Enhancements

Enhancement suggestions are welcome. Please include:

- A clear and descriptive title
- A detailed description of the enhancement
- Explain why this enhancement would be useful
- Provide examples or mockups if applicable

### Pull Requests

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/yourusername/heriwill-saas.git
   cd heriwill-saas
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation if needed
   - Ensure all tests pass

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # or
   git commit -m "fix: resolve issue description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for code style changes (formatting, etc.)
   - `refactor:` for code refactoring
   - `test:` for adding or updating tests
   - `chore:` for maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of your changes
   - Reference related issues
   - Ensure your PR passes all CI checks

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Project Structure

```
heriwill-saas/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility functions and configurations
├── contexts/           # React contexts
├── public/             # Static assets
├── docs/               # Documentation
├── schema.sql          # Database schema
└── package.json        # Dependencies and scripts
```

### Environment Variables

Never commit sensitive data. Use environment variables for:
- API keys
- Database credentials
- Secret tokens

Reference `.env.example` for required environment variables.

### Testing

- Write tests for new features
- Ensure all tests pass before submitting
- Test on multiple browsers if applicable

### Security

- Never commit secrets or API keys
- Follow security best practices
- Report security vulnerabilities privately

## Getting Help

If you need help:
- Check existing documentation
- Search existing issues
- Create a new issue with your question
- Join community discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
