import * as vscode from 'vscode'
import ImgSnippet from './process'

class ImgSnippetProvider implements vscode.CompletionItemProvider {
  constructor(private process: ImgSnippet) {}

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Thenable<vscode.CompletionItem[]> {
    return new Promise(async (resolve, reject) => {
      // 校验是否包含triggerCharacters
      const config = vscode.workspace.getConfiguration('ImgSnippet')
      const command = document
        .getText(new vscode.Range(position.with(undefined, 0), position))
        .trim()
      if (command !== config.tpl.slice(0, 1)) {
        resolve([])
        return
      }
      // 获取上一行到这行的文本
      const lineText = document.getText(
        new vscode.Range(
          position.with(position.line - 1, 0),
          position.with(position.line)
        )
      )
      const result = await this.process.cover(lineText)
      if (!result) {
        return resolve([])
      }
      const { label, insertText } = result
      console.log(result)
      const item = new vscode.CompletionItem(
        `${label}`,
        vscode.CompletionItemKind.Snippet
      )
      item.insertText = insertText

      return resolve([item])
    })
  }
}

export default ImgSnippetProvider
