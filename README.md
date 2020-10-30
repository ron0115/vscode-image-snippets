# Image Snippets

<p align="center"><a href="https://marketplace.visualstudio.com/items?itemName=ron0115.image-snippets" target="_blank" rel="noopener noreferrer"><img width="100" src="./images/icon.png"></a></p>

"Image Snippets" can detect your image source path at last line, auto complete some snippets such as width / height.

## Features

### Custom your snippets template

`width:${width}px; height:${height}px;`

![feat-default](images/feat-1.gif)

`background-size: ${width}px ${height}px;`

![feat-custom](images/feat-2.gif)

### detect alias in project

`tsconfig.json` or `jsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```css
.icon {
  background: url(~@/img/icon.png);
  /* parse to path: ${rootDir}/src/img/icon.png */
  /* and return snippets below */
}
```

## Extension Settings

- `Extension.tpl`: Custom snippets template, (e.g. `width: ${width}px;`)

  > some **Available Variables** below to inject into template

  | variable | description           |
  | -------- | --------------------- |
  | width    | image original width  |
  | height   | image original height |

## TODO

- [x] Support `alias` detected in `tsconfig.json` or `jsconfig.json`
- [x] Support http(s) url detect
- [ ] Support Array for `Extention.tpl`, set multi spinnets avaliable!
- [ ] Get more variables about image information injects to template if need
