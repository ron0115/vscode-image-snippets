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
  // private regFilePath: RegExp = /^(\.{1,2}(\/?))+([^\/]+\/)*[^\/]+\.\w+$/
  private regFilePath: RegExp = /(\.{1,2}(\/?))+([^\/]+\/)*[^\/]+\.\w+/

  private async getImageInfo(filePath: string) {
    const instance = await read(filePath)
    const width = instance.getWidth()
    const height = instance.getHeight()
    return {
      width,
      height
    }
  }

  private getFilePath(str: string) {
    if (this.regFilePath.test(str)) {
      return str.match(this.regFilePath)
    }
    return false
  }

  async cover(text: string) {
    let match = this.getFilePath(text)
    if (!match) {
      return null
    }

    const filePath = path.resolve(
      normalize(
        path.dirname(window.activeTextEditor?.document.uri.fsPath as string)
      ),
      normalize(match[0])
    )
    const info = await this.getImageInfo(filePath)
    const compliled = template(this.config.tpl)
    const result = compliled(info)
    // clipboardy.write(result)

    return {
      label: result,
      insertText: result
    }
  }
}

export default ImgSnippet
