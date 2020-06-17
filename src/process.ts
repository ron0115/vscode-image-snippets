import { read } from 'jimp'
import { template } from 'lodash'
import * as path from 'path'
import { window } from 'vscode'

const normalize = require('normalize-path')
// const clipboardy = require('clipboardy')

class ImgSnippet {
  constructor(
    private config: {
      tpl: string
    } = {
      tpl: 'width: ${width}px;\nheight: ${height}px;'
    }
  ) {}

  // private regPxVw: RegExp = /([-]?[\d.]+)pxw/
  // private regPxVh: RegExp = /([-]?[\d.]+)pxh/
  // 匹配相对路径
  private regFilePath: RegExp = /(\.{1,2}(\/?))+([^\/]+\/)*[^\/]+\.\w+/
  private regUrlPath: RegExp = /((http(s)*:)*\/\/)(\w|\.|\/)+/

  private async getImageInfo(path: string, isLocal: boolean) {
    const param = isLocal
      ? path
      : ({
          url: path
        } as any)
    const instance = await read(param)
    const width = instance.getWidth()
    const height = instance.getHeight()
    return {
      width,
      height
    }
  }

  private getFilePath(str: string) {
    if (this.regUrlPath.test(str)) {
      return str.match(this.regUrlPath)
    }
    if (this.regFilePath.test(str)) {
      return str.match(this.regFilePath)
    }

    return false
  }

  async cover(text: string) {
    let info
    let match = this.getFilePath(text)
    if (!match) {
      return null
    }
    let imagePath
    // 判断是否为本地Path
    const isLocal = this.regFilePath.test(match[0]) && !match[0].includes('//')
    if (isLocal) {
      imagePath = path.resolve(
        normalize(
          path.dirname(window.activeTextEditor?.document.uri.fsPath as string)
        ),
        normalize(match[0])
      )
      info = await this.getImageInfo(imagePath, true)
    } else {
      imagePath = match[0]
      info = await this.getImageInfo(imagePath, false)
    }

    const compliled = template(this.config.tpl)
    const result = compliled(info)

    return {
      label: result,
      insertText: result
    }
  }
}

export default ImgSnippet
