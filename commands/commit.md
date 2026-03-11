inspect the code status in git, inspect the code changes and group them into logical units.

each commit will trigger the pre-commit checks, we should not bypass them

if tests break, we should fix them before committing

test suite is hundreds of tests, so we should constrain the tests to the changes we are making by directly using `npx jest`.

check the git status in between commits to ensure it went through and dont overlap commits.

find and familiarize with the contribution and testing guidelines, then proceed.

use powershell syntax in the terminal

avoid prepending any note or signature about coauthors or other details. Keep it clean and concise. E.g. `git commit -m "feat: add new feature"` instead of `git commit --trailer "Co-authored-by: John Doe <john.doe@example.com>" -m "feat: add new feature"`
