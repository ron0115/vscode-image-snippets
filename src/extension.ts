'use strict'
import * as vscode from 'vscode'
import ImgSnippet from './process'
import ImgSnippetProvider from './provider'

export function activate(context: vscode.ExtensionContext) {
  const initial = () => {
    const config = vscode.workspace.getConfiguration('ImgSnippet')

    const process = new ImgSnippet(config as any)
    const provider = new ImgSnippetProvider(process)

    const TYPES = ['html', 'vue', 'css', 'less', 'scss', 'sass', 'stylus']

    TYPES.forEach(item => {
      let providerDisposable = vscode.languages.registerCompletionItemProvider(
        {
          scheme: 'file',
          language: item
        },
        provider,
        config.tpl.slice(0, 1)
      )
      context.subscriptions.push(providerDisposable)
    })
  }
  initial()
  vscode.workspace.onDidChangeConfiguration(event => {
    context.subscriptions.forEach(item => {
      item.dispose()
    })
    initial()
  })
}

// this method is called when your extension is deactivated
export function deactivate() {}
