# Contributing to The Weaver

Thank you for your interest in contributing to The Weaver. This project exists to help software teams learn from their work, and contributions that further that mission are welcome.

## Ways to Contribute

### Adding a New Perspective

The easiest and most impactful way to contribute is to add a new perspective. Perspectives are the lenses through which The Weaver examines a project -- things like "Technical Debt Detective," "Decision Archaeology," or "Momentum & Morale."

**A perspective is just a Markdown file.** No TypeScript required.

1. Create a new `.md` file in the `perspectives/` directory
2. Follow the format described in `perspectives/README.md`
3. Submit a pull request

A good perspective:
- Offers a unique angle that existing perspectives do not cover
- Includes thoughtful questions that guide genuine reflection
- Uses safety-first language (see `docs/BEST-PRACTICES.md`)
- Avoids blame, judgment, or metrics that can be gamed
- Works for solo developers and teams alike

### Reporting Issues

If something is broken, confusing, or could be better, please open an issue on GitHub. Include:
- What you expected to happen
- What actually happened
- Your environment (Node.js version, editor, operating system)
- Steps to reproduce, if applicable

### Suggesting Features

Feature suggestions are welcome as GitHub issues. Before submitting, please read `docs/PHILOSOPHY.md` to understand the project's core principles. Features that conflict with the four non-negotiable principles (Human Agency, Privacy by Default, Psychological Safety, Anti-Performance Theater) will not be accepted.

### Code Contributions

For bug fixes, enhancements, or new features in the TypeScript codebase:

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/PatrickRutledge/the-weave.git
cd the-weave

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Type-check without emitting
npm run lint

# Run the server locally for development (with auto-rebuild)
npm run dev
```

### Project Structure

```
the-weave/
  src/              # TypeScript source files
  perspectives/     # Perspective markdown files (no code needed)
  docs/             # Project documentation
  dist/             # Built output (do not edit directly)
  package.json
  tsconfig.json
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

All pull requests must pass the existing test suite. If you are adding new functionality, please add corresponding tests.

## Pull Request Guidelines

1. **Keep PRs focused.** One concern per pull request. A bug fix and a new feature should be separate PRs.

2. **Write clear commit messages.** Describe what changed and why, not just what files were touched.

3. **Follow existing code style.** The project uses TypeScript with ESM modules. Match the patterns you see in the existing codebase.

4. **Test your changes.** Run `npm test` before submitting. If you are adding new behavior, add tests for it.

5. **Update documentation if needed.** If your change affects how users interact with The Weaver, update the relevant docs.

6. **Respect the philosophy.** Every contribution should pass the test: "Does this increase genuine reflection or performance theater?" If it increases theater, it does not belong here.

## Perspective Contribution Checklist

When submitting a new perspective:

- [ ] File is in `perspectives/` directory
- [ ] Follows the format in `perspectives/README.md`
- [ ] Uses safety-first language throughout
- [ ] Questions invite reflection, not judgment
- [ ] No metrics that can be gamed
- [ ] Works for both solo developers and teams
- [ ] Includes a clear description of what the perspective examines

## Code of Conduct

This project follows a simple code of conduct:

**Be kind. Be constructive.**

More specifically:

- **Be kind** to other contributors, to users, and to the teams who will use this tool. Remember that The Weaver is about psychological safety -- that starts with us.

- **Be constructive** in code reviews, issue discussions, and feature debates. Critique ideas, not people. Offer alternatives when you disagree. Assume good intent.

- **Be inclusive.** This tool is for all software teams. Contributions should work across different team sizes, experience levels, and working styles.

- **Be honest.** If something is not working, say so. If you do not understand something, ask. The same principles that make retrospectives effective make open source collaboration effective.

If someone is not following these guidelines, please reach out to the maintainer directly.

## Questions?

If you are unsure about whether a contribution fits the project, open an issue to discuss it before investing time in implementation. We are happy to help guide contributions in a direction that works for everyone.
