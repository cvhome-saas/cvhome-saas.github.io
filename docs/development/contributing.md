# Contributing to cvhome

First off, thank you for considering contributing to `cvhome`! We welcome contributions from the community to help make
this platform better. Whether it's reporting a bug, proposing a new feature, improving documentation, or writing code,
your help is appreciated.

This guide outlines the general process for contributing.

## Ways to Contribute

* **Reporting Bugs:** If you find a bug, please search the existing GitHub Issues first to see if it has already been
  reported. If not, feel free to open a new issue.
* **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one? Open an issue to
  discuss it or propose it in the GitHub Discussions.
* **Improving Documentation:** Found a typo, an unclear explanation, or missing information in the docs? You can open an
  issue or submit a Pull Request directly to the documentation repository (this one!).
* **Writing Code:** Help fix bugs or implement new features by submitting Pull Requests to the relevant code
  repositories.

## Finding Something to Work On

Check the GitHub Issues across the `cvhome` repositories:

* `cvhome` (Application Code)
* `cvhome-bootstrap` (Infrastructure Prerequisites)
* `cvhome-ecs-fargate-infra` (Main Infrastructure)

Look for issues tagged with `good first issue` or `help wanted` if you're looking for a place to start. Feel free to ask
questions on an issue if you need clarification before starting work.

## Development Workflow (Code Contributions)

1. **Fork the Repository:** Fork the specific repository you want to contribute to (e.g., `cvhome`, `cvhome-bootstrap`,
   `cvhome-ecs-fargate-infra`) to your own GitHub account.
2. **Clone Your Fork:** Clone your forked repository to your local machine.
3. **Create a Branch:** Create a new branch for your changes. Choose a descriptive name (e.g., `fix/login-bug`,
   `feat/add-product-sorting`).
4. **Make Changes:** Implement your bug fix or feature.
5. **Commit Changes:** Commit your changes with a clear and descriptive commit message.
6. **Running The Test Cases:** Before pushing your changes and submitting a Pull Request, run the following command:
   ### On Linux/macOS
    ```bash
   ./gradlew test
   ```
   ### On Windows
    ```bash
   gradlew.bat test
   ``` 
7. **Submit a Pull Request:** Go to the original repository on GitHub and open a Pull Request from your branch to the
   appropriate target branch **main**. Provide a clear description of your changes in the PR.
    