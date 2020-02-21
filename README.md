# sort-dependency

## Install

```sh
yarn global add sort-dependency
```

## Usage Example

```
git clone https://github.com/babel/babel.git --depth 1
cd babel
```

### Search top or deep or standalone libraries

```bash
sort-dependency --root . --cache-dir .cache
```

<details>
<summary>Result</summary>
Info: independents libraries (Suggest: '--start')

1. @babel/plugin-codemod-object-assign-to-object-spread
2. @babel/plugin-codemod-optional-catch-binding
3. @babel/eslint-config-internal
4. @babel/eslint-plugin-development
5. @babel/eslint-plugin
6. @babel/eslint-shared-fixtures
7. @babel/eslint-tests
8. babel
9. @babel/cli
10. @babel/helper-explode-class
11. @babel/helper-plugin-test-runner
12. @babel/node
13. @babel/plugin-external-helpers
14. @babel/plugin-proposal-export-default-from
15. @babel/plugin-proposal-export-namespace-from
16. @babel/plugin-proposal-function-bind
17. @babel/plugin-proposal-function-sent
18. @babel/plugin-proposal-logical-assignment-operators
19. @babel/plugin-proposal-numeric-separator
20. @babel/plugin-proposal-partial-application
21. @babel/plugin-proposal-throw-expressions
22. @babel/plugin-syntax-class-properties
23. @babel/plugin-transform-flow-comments
24. @babel/plugin-transform-instanceof
25. @babel/plugin-transform-jscript
26. @babel/plugin-transform-object-assign
27. @babel/plugin-transform-object-set-prototype-of-to-assign
28. @babel/plugin-transform-property-mutators
29. @babel/plugin-transform-proto-to-assign
30. @babel/plugin-transform-react-constant-elements
31. @babel/plugin-transform-react-inline-elements
32. @babel/plugin-transform-react-jsx-compat
33. @babel/plugin-transform-runtime
34. @babel/plugin-transform-strict-mode
35. @babel/preset-typescript
36. @babel/runtime-corejs2
37. @babel/runtime-corejs3
38. @babel/runtime
39. @babel/standalone

Info: last independents libraries (Suggest: '--stop')

1. @babel/helper-plugin-utils
2. @babel/parser

Info: Standalone library

1. @babel/eslint-plugin-development
2. @babel/eslint-tests
3. babel
4. @babel/standalone
   </details>

### Find dependency order

Using topological sort: (<https://en.wikipedia.org/wiki/Topological_sorting>)

```bash
sort-dependency \
    --root . \
    --cache-dir .cache \
    --start "@babel/plugin-codemod-object-assign-to-object-spread" \
    --stop "@babel/parser"
```

<details>
<summary>Result</summary>
Topological sorting result: @babel/plugin-codemod-object-assign-to-object-spread -> @babel/parser

1. @babel/plugin-codemod-object-assign-to-object-spread
2. @babel/core
3. @babel/helpers
4. @babel/traverse
5. @babel/helper-function-name
6. @babel/template
7. @babel/parser
   </details>

### Output dependency graph example

```bash
sort-dependency \
    --root .\
    --cache-dir .cache\
    --output library-map.png
```

[Image (very large)](./docs/library-map.png)

```bash
sort-dependency \
    --root . \
    --cache-dir .cache \
    --start "@babel/plugin-codemod-object-assign-to-object-spread" \
    --stop "@babel/parser" \
    --output sorted-graph.png
```

![Sorted graph](./docs/sorted-graph.png)

## License

sort-dependency is [MIT licensed](https://github.com/Himenon/sort-dependency/blob/master/LICENSE).
