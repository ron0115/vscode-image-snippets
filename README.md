# image-snippets

"image-snippets" can detect your image source path at last line, auto complete some snippets such as with / height.

## Features

![feat-default](images/feat-1.gif)

customize your template

> e.g. `background-size: ${width}px ${height}px;`

![feat-custom](images/feat-2.gif)

## Extension Settings

- `Extension.tpl`: Custom snippets template, (e.g. `width: ${width}px;`), support injecting `${width}` `${height}`

  > some **Available Variables** below

  | variable | description           |
  | -------- | --------------------- |
  | width    | image original width  |
  | height   | image original height |

## TODO

- Get more variables about image information injects to template if need
