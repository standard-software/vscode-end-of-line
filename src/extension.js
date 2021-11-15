const vscode = require('vscode');
const split = require('graphemesplit');
const {
  isUndefined,
  _isLast,
  _deleteLast,
  _trimLast,
} = require('./parts/parts.js')

function activate(context) {

  const extensionMain = (commandName) => {

    const editor = vscode.window.activeTextEditor;
    if ( !editor ) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

    vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: ``,
      prompt: `Input Insert/Delete String`,
      value: vscode.workspace.getConfiguration(`EndOfLine`).get(`insertString`),
    }).then(inputString => {
      if (isUndefined(inputString)) {
        return;
      }
      if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage( `No editor is active` );
        return;
      }
      editor.edit(ed => {

        const editorSelectionsLoop = (func) => {
          editor.selections.forEach(select => {
            const range = new vscode.Range(
              select.start.line, 0,
              select.end.line,
              select.end.character,
            );
            const text = editor.document.getText(range);
            func(range, text);
          });
        }

        const editorSelectionsLoopUnsupportTab = (func) => {
          let includeTabFlag = false;
          editor.selections.forEach(select => {
            const range = new vscode.Range(
              select.start.line, 0, select.end.line, select.end.character
            );
            const text = editor.document.getText(range);
            if (text.includes(`\t`)) {
              includeTabFlag = true
            }
            func(range, text);
          });
          if (includeTabFlag) {
            vscode.window.showInformationMessage( 'This feature of Insert String Each Line Extension does not support tabs.');
          }
        }

        const textLength = (str) => {
          let result = 0;
          for(const char of split(str)){
            const codePoint = char.codePointAt(0);
            const len = 0x00 <= codePoint && codePoint <= 0xFF ? 1 : 2;
            result += len;
          }
          return result;
        }

        const getMaxLength = (lines) => {
          let maxLength = 0;
          for (let i = 0; i < lines.length; i += 1) {
            if (lines[i].trim() === '') { continue; }
            const length = textLength(_trimLast(lines[i], ['\r']))
            if (maxLength < length) {
              maxLength = length
            }
          }
          return maxLength;
        }

        const textLoopAllLines = (text, func, linesFunc = () => {}) => {
          const lines = text.split(`\n`);
          const linesFuncResult = linesFunc(lines);
          for (let i = 0; i < lines.length; i += 1) {
            func(lines, i, linesFuncResult);
          };
          return lines.join('\n');
        }

        const textLoopOnlyTextLines = (text, func, linesFunc = () => {}) => {
          const lines = text.split(`\n`);
          const linesFuncResult = linesFunc(lines);
          for (let i = 0; i < lines.length; i += 1) {
            if (lines[i].trim() === '') { continue; }
            func(lines, i, linesFuncResult);
          };
          return lines.join('\n');
        }

        switch (commandName) {

          case `InsertEndLineAllLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopAllLines(text, (lines, i) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + inputString + lastLineBreak;
              })
              ed.replace(range, text);
            })
            break;

          case `InsertEndLineOnlyTextLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + inputString + lastLineBreak;
              })
              ed.replace(range, text);
            })
            break;

          case `InsertMaxLengthAllLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopAllLines(text, (lines, i, maxLength) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + ' '.repeat(maxLength - textLength(trimLine))
                  + inputString + lastLineBreak;
              }, getMaxLength)
              ed.replace(range, text);
            })
            break;

          case `InsertMaxLengthOnlyTextLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i, maxLength) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + ' '.repeat(maxLength - textLength(trimLine))
                  + inputString + lastLineBreak;
              }, getMaxLength)
              ed.replace(range, text);
            })
            break;

          case `DeleteEndText`:
            editorSelectionsLoop((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], [' ', '\t', '\r']);
                const trimLastInput = _trimLast(inputString, [' ']);
                if (_isLast(trimLine, trimLastInput)) {
                  lines[i] = _trimLast(_deleteLast(trimLine, trimLastInput.length), [' ', '\t']) + lastLineBreak;
                }
              })
              ed.replace(range, text);
            })
            break;

          default:
            new Error(`EndOfLine extensionMain`);
        }
      } );
    } );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `EndOfLine.InsertEndLineAllLines`, () => {
      extensionMain(`InsertEndLineAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `EndOfLine.InsertEndLineOnlyTextLines`, () => {
      extensionMain(`InsertEndLineOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `EndOfLine.InsertMaxLengthAllLines`, () => {
      extensionMain(`InsertMaxLengthAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `EndOfLine.InsertMaxLengthOnlyTextLines`, () => {
      extensionMain(`InsertMaxLengthOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `EndOfLine.DeleteEndText`, () => {
      extensionMain(`DeleteEndText`);
    })
  );

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
