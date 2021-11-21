const vscode = require('vscode');
const split = require('graphemesplit');
const {
  isUndefined,
  _isLast,
  _excludeLast,
  _trimLast,_trim,
} = require('./parts/parts.js')

const textLength = (str) => {
  let result = 0;
  for(const char of split(str)){
    const codePoint = char.codePointAt(0);
    const len = 0x00 <= codePoint && codePoint <= 0xFF ? 1 : 2;
    result += len;
  }
  return result;
}

const getMaxLength = (editor) => {
  let maxLength = 0;
  for (let { start, end } of editor.selections) {
    for (let i = start.line; i <= end.line; i += 1) {
      const line = editor.document.lineAt(i).text;
      if (_trim(line) === '') { continue; }
      const length = textLength(line);
      if (maxLength < length) {
        maxLength = length
      }
    }
  };
  return maxLength;
}

function activate(context) {

  context.subscriptions.push(
    vscode.commands.registerCommand(`EndOfLine.Input`, () => {

      const inputCommands = {
        InsertEndLineAllLines:        { label: `Insert | All Lines`, description: `` },
        InsertEndLineOnlyTextLines:   { label: `Insert | Only Text Lines`, description: `` },
        InsertMaxLengthAllLines:      { label: `Insert | All Lines | Max Line Length`, description: `` },
        InsertMaxLengthOnlyTextLines: { label: `Insert | Only Text Lines | Max Line Length`, description: `` },
        DeleteEndText:                { label: `Delete | End Of Text`, description: `` },
      }

      vscode.window.showQuickPick(Object.values(inputCommands), {
        canPickMany: false,
        placeHolder: "Select Command | End Of Line | Input",
      }).then((item) => {
        if (!item) { return; }

        let _commandName = '';
        for (let [key, value] of Object.entries(inputCommands)) {
          if (item === value) {
            _commandName = key;
            break;
          }
        }
        if (_commandName === '') { return; }
        const commandName = _commandName;

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage(`No editor is active`);
          return;
        }

        vscode.window.showInputBox({
          ignoreFocusOut: true,
          placeHolder: ``,
          prompt: `Input String`,
          value: vscode.workspace.getConfiguration(`EndOfLine`).get(`insertString`),
        }).then(inputString => {
          if (isUndefined(inputString)) {
            return;
          }
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            vscode.window.showInformationMessage( `No editor is active` );
            return;
          }
          editor.edit(editBuilder => {

            switch (commandName) {

            case `InsertEndLineAllLines`: {
              for (let { start, end } of editor.selections) {
                for (let i = start.line; i <= end.line; i += 1) {
                  const line = editor.document.lineAt(i).text;
                  editBuilder.insert(new vscode.Position(i, line.length), inputString);
                }
              };
            } break;

            case `InsertEndLineOnlyTextLines`: {
              for (let { start, end } of editor.selections) {
                for (let i = start.line; i <= end.line; i += 1) {
                  const line = editor.document.lineAt(i).text;
                  if (_trim(line) === '') { continue; }
                  editBuilder.insert(new vscode.Position(i, line.length), inputString);
                }
              };
            } break;

            case `InsertMaxLengthAllLines`: {
              const maxLength = getMaxLength(editor);
              for (let { start, end } of editor.selections) {
                for (let i = start.line; i <= end.line; i += 1) {
                  const line = editor.document.lineAt(i).text;
                  editBuilder.insert(
                    new vscode.Position(i, line.length),
                    ' '.repeat(maxLength - textLength(line)) + inputString
                  );
                }
              };
            } break;

            case `InsertMaxLengthOnlyTextLines`: {
              const maxLength = getMaxLength(editor);
              for (let { start, end } of editor.selections) {
                for (let i = start.line; i <= end.line; i += 1) {
                  const line = editor.document.lineAt(i).text;
                  if (_trim(line) === '') { continue; }
                  editBuilder.insert(
                    new vscode.Position(i, line.length),
                    ' '.repeat(maxLength - textLength(line)) + inputString
                  );
                }
              };
            } break;

            case `DeleteEndText`: {
              for (let { start, end } of editor.selections) {
                for (let i = start.line; i <= end.line; i += 1) {
                  const line = editor.document.lineAt(i).text;
                  const trimLine = _trimLast(line, [' ', '\t']);
                  const trimLastInput = _trimLast(inputString, [' ']);
                  // console.log({trimLine,trimFirstInput}, _isLast(trimLine, trimFirstInput))
                  if (trimLastInput === '') {
                    editBuilder.delete(
                      new vscode.Range(
                        i, trimLine.length,
                        i, line.length
                      )
                    );
                  } else if (_isLast(trimLine, trimLastInput)) {
                    const trimLineExcludeLast = _trimLast(
                      _excludeLast(trimLine, trimLastInput),
                      [' ', '\t']
                    )
                    editBuilder.delete(
                      new vscode.Range(
                        i, trimLineExcludeLast.length,
                        i, line.length
                      )
                    );
                  }
                }
              };
            } break;

            default: {
              throw new Error(`EndOfLine Input`);
            }
            }
          });
        });

      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`EndOfLine.SelectEdit`, () => {

      const selectEditCommands = {
        EndLineAllLines:        { label: `Select Edit | All Lines`, description: `` },
        EndLineOnlyTextLines:   { label: `Select Edit | Only Text Lines`, description: `` },
        MaxLengthAllLines:      { label: `Select Edit | All Lines | Max Line Length`, description: `` },
        MaxLengthOnlyTextLines: { label: `Select Edit | Only Text Lines | Max Line Length`, description: `` },
      }

      vscode.window.showQuickPick(Object.values(selectEditCommands), {
        canPickMany: false,
        placeHolder: "Select Command | End Of Line | Select Edit",
      }).then((item) => {
        if (!item) { return; }

        let _commandName = '';
        for (let [key, value] of Object.entries(selectEditCommands)) {
          if (item === value) {
            _commandName = key;
            break;
          }
        }
        if (_commandName === '') { return; }
        const commandName = _commandName;

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage(`No editor is active`);
          return;
        }
        editor.edit(editBuilder => {
          switch (commandName) {

          case `EndLineAllLines`: {
            const runAfterSelections = [];
            for (let { start, end } of editor.selections) {
              for (let i = start.line; i <= end.line; i += 1) {
                const line = editor.document.lineAt(i).text;
                runAfterSelections.push(
                  new vscode.Selection(i, line.length, i, line.length)
                )
              }
            };
            editor.selections = runAfterSelections;
          } break;

          case `EndLineOnlyTextLines`: {
            const runAfterSelections = [];
            for (let { start, end } of editor.selections) {
              for (let i = start.line; i <= end.line; i += 1) {
                const line = editor.document.lineAt(i).text;
                if (_trim(line) === '') { continue; }
                runAfterSelections.push(
                  new vscode.Selection(i, line.length, i, line.length)
                )
              }
            };
            editor.selections = runAfterSelections;
          } break;

          case `MaxLengthAllLines`: {
            const runAfterSelections = [];
            const maxLength = getMaxLength(editor);
            for (let { start, end } of editor.selections) {
              for (let i = start.line; i <= end.line; i += 1) {
                const line = editor.document.lineAt(i).text;
                editBuilder.insert(
                  new vscode.Position(i, line.length),
                  ' '.repeat(maxLength - textLength(line))
                );
                runAfterSelections.push(
                  new vscode.Selection(i, maxLength, i, maxLength)
                )
              }
            };
            editor.selections = runAfterSelections;
          } break;

          case `MaxLengthOnlyTextLines`: {
            const runAfterSelections = [];
            const maxLength = getMaxLength(editor);
            for (let { start, end } of editor.selections) {
              for (let i = start.line; i <= end.line; i += 1) {
                const line = editor.document.lineAt(i).text;
                if (_trim(line) === '') { continue; }
                editBuilder.insert(
                  new vscode.Position(i, line.length),
                  ' '.repeat(maxLength - textLength(line))
                );
                runAfterSelections.push(
                  new vscode.Selection(i, maxLength, i, maxLength)
                )
              }
            };
            editor.selections = runAfterSelections;
          } break;

          default: {
            throw new Error(`BeginOfLine Select Edit`);
          }
          }
        });
      });
    })
  );

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
