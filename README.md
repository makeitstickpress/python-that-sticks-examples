# Python That Sticks — live examples

Public, editable examples for *Python That Sticks* by Make It Stick Press.

The site runs Python in a browser Web Worker with Pyodide. Each printed **Try it now** link opens the matching example directly; the chapter QR opens the complete chapter list.

## Local preview

From the repository root:

```sh
python3 -m http.server 4173 --directory site
```

Then open `http://localhost:4173/#/chapter/1`.

## Book links

- Chapter 1: `https://python.makeitstickpress.com/#/chapter/1`
- Direct example: append the example ID, such as `#/chapter/1/first-flashcard`

The browser runner uses the current stable Pyodide runtime. The book's source repository separately validates every example against its pinned Python 3.15 interpreter.
