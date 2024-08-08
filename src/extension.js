const vscode = require(`vscode`);
const split = require(`graphemesplit`);
const {
  isUndefined,
  _isLast,
  _excludeLast,
  _trimLast,_trim,
} = require(`./parts/parts.js`);

const textLength = (str) => {
  let result = 0;
  for(const char of split(str)){
    const codePoint = char.codePointAt(0);
    const len = 0x00 <= codePoint && codePoint <= 0xFF ? 1 : 2;
    result += len;
  }
  return result;
};

const getMaxLength = (editor) => {
  let maxLength = 0;
  for (let { start, end } of editor.selections) {
    for (let i = start.line; i <= end.line; i += 1) {
      const line = editor.document.lineAt(i).text;
      if (_trim(line) === ``) { continue; }
      const length = textLength(line);
      if (maxLength < length) {
        maxLength = length;
      }
    }
  };
  return maxLength;
};

const commandQuickPick = (commandsArray, placeHolder) => {
  const commands = commandsArray.map(c => ({label:c[0], description:c[1], func:c[2]}));
  vscode.window.showQuickPick(
    commands.map(({label, description}) => ({label, description})),
    {
      canPickMany: false,
      placeHolder
    }
  ).then((item) => {
    if (!item) { return; }
    commands.find(({label}) => label === item.label).func();
  });
};

function activate(context) {

  const registerCommand = (commandName, func) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        commandName, func
      )
    );
  };

  const mark = `>>`;

  registerCommand(`EndOfLine.SelectFunction`, () => { commandQuickPick([
    [`Space`,                     `${mark}`,  () => { commandQuickPick([
      [`Fill Space`,              ``,         () => { mainSpace(`FillSpace`); }],
      [`Trim End`,                ``,         () => { mainSpace(`TrimEnd`); }],
    ], `End Of Line | Space`); }],
    [`Input`,                     `${mark}`,  () => { commandQuickPick([
      [`Insert End Of Line`,      `${mark}`,  () => { commandQuickPick([
        [`All Lines`,             ``,         () => { mainInput(`InsertEndLineAll`); }],
        [`Text Lines`,            ``,         () => { mainInput(`InsertEndLineText`); }],
      ], `End Of Line | Input | Insert End Of Line`); }],
      [`Insert Max Length`,       `${mark}`,  () => { commandQuickPick([
        [`All Lines`,             ``,         () => { mainInput(`InsertMaxLengthAll`); }],
        [`Text Lines`,            ``,         () => { mainInput(`InsertMaxLengthText`); }],
      ], `End Of Line | Input | Insert Max Length`); }],
      [`Delete End Of Text`,      ``,         () => { mainInput(`DeleteEndText`); }],
    ], `End Of Line | Input`); }],
    [`Select Cursor`,             `${mark}`,  () => { commandQuickPick([
      [`All Lines`,               ``,         () => { mainSelect(`SelectEndLineAll`); }],
      [`Text Lines`,              ``,         () => { mainSelect(`SelectEndLineText`); }],
      [`Max Length | All Lines`,  ``,         () => { mainSelect(`SelectMaxLengthAll`); }],
      [`Max Length | Text Lines`, ``,         () => { mainSelect(`SelectMaxLengthText`); }],
    ], `End Of Line | Select Cursor`); }],
  ], `End Of Line | Select Function`); });

  const mainSpace = (commandName) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }
    editor.edit(editBuilder => {
      switch (commandName) {

      case `FillSpace`: {
        const maxLength = getMaxLength(editor);
        for (let { start, end } of editor.selections) {
          for (let i = start.line; i <= end.line; i += 1) {
            const line = editor.document.lineAt(i).text;
            editBuilder.insert(
              new vscode.Position(i, line.length),
              ` `.repeat(maxLength - textLength(line))
            );
          }
        };
      } break;

      case `TrimEnd`: {
        for (let { start, end } of editor.selections) {
          for (let i = start.line; i <= end.line; i += 1) {
            const line = editor.document.lineAt(i).text;
            const trimLine = _trimLast(line, [` `, `\t`]);
              // const range = new vscode.Range(
              //   i, 0, i, line.length,
              // );
              // editBuilder.replace(range, trimLine);
            editBuilder.delete(
              new vscode.Range(
                i, trimLine.length,
                i, line.length
              )
            );
          }
        };
      } break;

      }
    });
  };

  const mainInput = (commandName) => {
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
      if (isUndefined(inputString)) { return; }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage( `No editor is active` );
        return;
      }
      editor.edit(editBuilder => {

        switch (commandName) {

        case `InsertEndLineAll`: {
          for (let { start, end } of editor.selections) {
            for (let i = start.line; i <= end.line; i += 1) {
              const line = editor.document.lineAt(i).text;
              editBuilder.insert(
                new vscode.Position(i, line.length),
                inputString
              );
            }
          };
        } break;

        case `InsertEndLineText`: {
          for (let { start, end } of editor.selections) {
            for (let i = start.line; i <= end.line; i += 1) {
              const line = editor.document.lineAt(i).text;
              if (_trim(line) === ``) { continue; }
              editBuilder.insert(
                new vscode.Position(i, line.length),
                inputString
              );
            }
          };
        } break;

        case `InsertMaxLengthAll`: {
          const maxLength = getMaxLength(editor);
          let includeTabFlag = false;
          for (let { start, end } of editor.selections) {
            for (let i = start.line; i <= end.line; i += 1) {
              const line = editor.document.lineAt(i).text;
              if (line.includes(`\t`)) { includeTabFlag = true; }
              editBuilder.insert(
                new vscode.Position(i, line.length),
                ` `.repeat(maxLength - textLength(line)) + inputString
              );
            }
          };
          if (includeTabFlag) {
            vscode.window.showInformationMessage( `This feature of End Of Line Extension does not support tabs.`);
          }
        } break;

        case `InsertMaxLengthText`: {
          const maxLength = getMaxLength(editor);
          let includeTabFlag = false;
          for (let { start, end } of editor.selections) {
            for (let i = start.line; i <= end.line; i += 1) {
              const line = editor.document.lineAt(i).text;
              if (line.includes(`\t`)) { includeTabFlag = true; }
              if (_trim(line) === ``) { continue; }
              editBuilder.insert(
                new vscode.Position(i, line.length),
                ` `.repeat(maxLength - textLength(line)) + inputString
              );
            }
          };
          if (includeTabFlag) {
            vscode.window.showInformationMessage( `This feature of End Of Line Extension does not support tabs.`);
          }
        } break;

        case `DeleteEndText`: {
          for (let { start, end } of editor.selections) {
            for (let i = start.line; i <= end.line; i += 1) {
              const line = editor.document.lineAt(i).text;
              const trimLine = _trimLast(line, [` `, `\t`]);
              const trimLastInput = _trimLast(inputString, [` `]);
              if (trimLastInput === ``) {
                editBuilder.delete(
                  new vscode.Range(
                    i, trimLine.length,
                    i, line.length
                  )
                );
              } else if (_isLast(trimLine, trimLastInput)) {
                const trimLineExcludeLast = _trimLast(
                  _excludeLast(trimLine, trimLastInput),
                  [` `, `\t`]
                );
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

  };

  const mainSelect = (commandName) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }
    editor.edit(editBuilder => {
      switch (commandName) {

      case `SelectEndLineAll`: {
        const runAfterSelections = [];
        for (let { start, end } of editor.selections) {
          for (let i = start.line; i <= end.line; i += 1) {
            const line = editor.document.lineAt(i).text;
            runAfterSelections.push(
              new vscode.Selection(i, line.length, i, line.length)
            );
          }
        };
        editor.selections = runAfterSelections;
      } break;

      case `SelectEndLineText`: {
        const runAfterSelections = [];
        for (let { start, end } of editor.selections) {
          for (let i = start.line; i <= end.line; i += 1) {
            const line = editor.document.lineAt(i).text;
            if (_trim(line) === ``) { continue; }
            runAfterSelections.push(
              new vscode.Selection(i, line.length, i, line.length)
            );
          }
        };
        editor.selections = runAfterSelections;
      } break;

      case `SelectMaxLengthAll`: {
        const runAfterSelections = [];
        const maxLength = getMaxLength(editor);
        for (let { start, end } of editor.selections) {
          for (let i = start.line; i <= end.line; i += 1) {
            const line = editor.document.lineAt(i).text;
            editBuilder.insert(
              new vscode.Position(i, line.length),
              ` `.repeat(maxLength - textLength(line))
            );
            runAfterSelections.push(
              new vscode.Selection(i, maxLength, i, maxLength)
            );
          }
        };
        editor.selections = runAfterSelections;
      } break;

      case `SelectMaxLengthText`: {
        const runAfterSelections = [];
        const maxLength = getMaxLength(editor);
        for (let { start, end } of editor.selections) {
          for (let i = start.line; i <= end.line; i += 1) {
            const line = editor.document.lineAt(i).text;
            if (_trim(line) === ``) { continue; }
            editBuilder.insert(
              new vscode.Position(i, line.length),
              ` `.repeat(maxLength - textLength(line))
            );
            runAfterSelections.push(
              new vscode.Selection(i, maxLength, i, maxLength)
            );
          }
        };
        editor.selections = runAfterSelections;
      } break;

      default: {
        throw new Error(`EndOfLine Select Edit`);
      }
      }
    });
  };

  registerCommand(`EndOfLine.FillSpace`, () => {
    mainSpace(`FillSpace`);
  });

  registerCommand(`EndOfLine.TrimEnd`, () => {
    mainSpace(`TrimEnd`);
  });

  registerCommand(`EndOfLine.InsertEndLineAll`, () => {
    mainInput(`InsertEndLineAll`);
  });

  registerCommand(`EndOfLine.InsertEndLineText`, () => {
    mainInput(`InsertEndLineText`);
  });

  registerCommand(`EndOfLine.InsertMaxLengthAll`, () => {
    mainInput(`InsertMaxLengthAll`);
  });

  registerCommand(`EndOfLine.InsertMaxLengthText`, () => {
    mainInput(`InsertMaxLengthText`);
  });

  registerCommand(`EndOfLine.DeleteEndText`, () => {
    mainInput(`DeleteEndText`);
  });

  registerCommand(`EndOfLine.SelectEndLineAll`, () => {
    mainSelect(`SelectEndLineAll`);
  });

  registerCommand(`EndOfLine.SelectEndLineText`, () => {
    mainSelect(`SelectEndLineText`);
  });

  registerCommand(`EndOfLine.SelectMaxLengthAll`, () => {
    mainSelect(`SelectMaxLengthAll`);
  });

  registerCommand(`EndOfLine.SelectMaxLengthText`, () => {
    mainSelect(`SelectMaxLengthText`);
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
