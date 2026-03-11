# test

Using the project's CONTRIBUTING.md and TESTING.md guidelines and the project's codebase, test the project's codebase.
The user might provide a specific test case/file/directory/pattern to test.

use npx jest to reproduce the issues, tackle them one at a time.

Further context: @savia-mobile/src/test/setup.ts @savia-mobile/src/test/silence-console.ts 

progressively instrument minimal logs over the render tree to identify where it's breaking.

use console.debug as opposed to streaming into debug file
