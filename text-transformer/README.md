# Text Transformer

The `text-transformer` module provides a small command-line text processing utility. It reads text from an input file, applies one or more transformation actions, and writes the final result to an output file.

This component is useful when a simple text pipeline is needed, such as converting content to uppercase, converting it to lowercase, replacing text, or checking whether a given value exists in the input.

## Overview

The transformer works as a pipeline. Each action receives the current text, processes it, and passes the result to the next action.

The general flow is:

1. Read text from an input file.
2. Execute the requested actions in order.
3. Write the final text to an output file.

Some actions may also print additional information to the console without changing the final output file.

## Usage

```bash
bun index.ts --input=input.txt --output=output.txt <actions>
````

You can also use the short option names:

```bash
bun index.ts -i input.txt -o output.txt <actions>
```

## Available Actions

### `lowercase`

Converts the entire input text to lowercase.

```bash
bun index.ts -i input.txt -o output.txt lowercase
```

Example:

```txt
HELLO WORLD
```

Result:

```txt
hello world
```

---

### `uppercase`

Converts the entire input text to uppercase.

```bash
bun index.ts -i input.txt -o output.txt uppercase
```

Example:

```txt
hello world
```

Result:

```txt
HELLO WORLD
```

---

### `replaceAll`

Replaces all occurrences of a given text with another value.

```bash
bun index.ts -i input.txt -o output.txt replaceAll hello hi
```

Example:

```txt
hello world, hello again
```

Result:

```txt
hi world, hi again
```

The `replaceAll` action expects two arguments:

```bash
replaceAll <from> <to>
```

The `<from>` argument must not be empty.

---

### `includes`

Checks whether the current text includes a given search value.

```bash
bun index.ts -i input.txt -o output.txt includes hello
```

This action prints `true` or `false` to the console.

The original text is preserved in the output file, so this action behaves as an inspection step rather than a transformation step.

Example input:

```txt
hello world
```

Command:

```bash
bun index.ts -i input.txt -o output.txt includes hello
```

Console output:

```txt
true
```

Output file:

```txt
hello world
```

## Combining Actions

Actions can be combined in the same command. They are executed from left to right.

```bash
bun index.ts -i input.txt -o output.txt uppercase replaceAll HELLO HI
```

Example input:

```txt
hello world
```

Result:

```txt
HI WORLD
```

In this example:

1. `uppercase` converts the text to `HELLO WORLD`.
2. `replaceAll HELLO HI` replaces `HELLO` with `HI`.

## Error Handling

The transformer returns an error when:

* the input file does not exist;
* the input file cannot be read;
* the output file cannot be written;
* an unknown action is provided;
* an action does not receive the required arguments.

Example of an invalid command:

```bash
bun index.ts -i input.txt -o output.txt replaceAll hello
```

The `replaceAll` action requires both a search value and a replacement value.
