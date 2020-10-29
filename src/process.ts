import { read } from 'jimp'
import { template } from 'lodash'
import * as path from 'path'
import { window, workspace } from 'vscode'
import * as os from 'os'
import normalize from 'normalize-path'
import fs from 'fs-extra'
import { parse } from 'comment-json'
// const clipboardy = require('clipboardy')

class ImgSnippet {
  constructor(
    private config: {
      tpl: string
    } = {
      tpl: 'width: ${width}px;\nheight: ${height}px;'
    }
  ) {
    this.initAliasPaths()
  }

  aliasPaths: { [key: string]: string } = {}

  get currentFileURI() {
    return window.activeTextEditor?.document.uri
  }

  get workspacePath() {
    return workspace.getWorkspaceFolder(this.currentFileURI!)?.uri.fsPath
  }
  // private regPxVw: RegExp = /([-]?[\d.]+)pxw/
  // private regPxVh: RegExp = /([-]?[\d.]+)pxh/
  // 匹配相对路径
  // private regFilePath: RegExp = /(\.{1,2}(\/?))+([^\/]+\/)*[^\/]+\.\w+/
  regUrlPath: RegExp = /((http(s)*:)*\/\/)(\w|\.|\/)+/
  regFilePath: RegExp = /(\.{1,2}(\/?))+([^\/]+\/)*[^\/]+\.\w+/

  private getRegFilePath(key: string) {
    // https://cloud.tencent.com/developer/ask/58617
    return new RegExp(String.raw`${key}\/([^\/]+\/)*[^\/]+\.\w+`)
  }

  initAliasPaths() {
    const pathFlag = os.platform() === 'win32' ? '\\' : '/'

    const tsconfigPath = `${this.workspacePath}${pathFlag}tsconfig.json`
    const jsconfigPath = `${this.workspacePath}${pathFlag}jsconfig.json`
    const paths: { [key: string]: string } = {
      ...parse(fs.readFileSync(tsconfigPath).toString()).compilerOptions.paths,
      ...parse(fs.readFileSync(jsconfigPath).toString()).compilerOptions.paths
    }
    this.aliasPaths = Object.fromEntries(
      Object.entries(paths).map(item => [
        item[0].replace('/*', ''),
        item[1][0].replace('/*', '')
      ])
    )
  }

  getAbsPath(currentFilePath: string, targetPath: string) {
    if (this.regUrlPath.test(targetPath)) {
      return targetPath
    }
    const paths = this.aliasPaths
    const keys = Object.keys(paths)
    const aliasKey = keys.find(item => targetPath.startsWith(item))
    // 替换别名
    if (aliasKey) {
      targetPath = targetPath.replace(aliasKey, paths[aliasKey])
      const fullpath = path.join(
        normalize(this.workspacePath!),
        normalize(targetPath)
      )
      return fullpath
    } else {
      const fullpath = path.resolve(
        normalize(path.dirname(currentFilePath)),
        normalize(targetPath)
      )
      return fullpath
    }
  }
  // 获取片段提示
  async cover(text: string) {
    let info
    let match = this.getFilePath(text)
    if (!match) {
      return null
    }
    const targetPath = match[0]
    const currentFilePath = this.currentFileURI?.fsPath || ''
    // 判断是否为本地Path
    const isUrl = this.regUrlPath.test(match[0])
    if (isUrl) {
      info = await this.getImageInfo(targetPath, false)
    } else {
      const path = this.getAbsPath(currentFilePath, targetPath)
      info = await this.getImageInfo(path, true)
    }

    const complied = template(this.config.tpl)
    const result = complied(info)

    return {
      label: result,
      insertText: result
    }
  }

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
    let match
    if (this.regUrlPath.test(str)) {
      return str.match(this.regUrlPath)
    }
    // TODO: 用alias paths forEach 有一个正则就return一个match出来
    if (this.regFilePath.test(str)) {
      return str.match(this.regFilePath)
    }

    Object.keys(this.aliasPaths).forEach(item => {
      const originReg = this.getRegFilePath(item)
      if (originReg.test(str)) {
        match = str.match(originReg)
        // if (match) {
        //   // 替换成alias
        //   match[0] = match[0].replace(item, this.aliasPaths[item])
        // }
      }
    })
    return match || false
  }
}

export default ImgSnippet