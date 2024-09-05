# VSCode extension - End Of Line

[![](https://vsmarketplacebadges.dev/version-short/SatoshiYamamoto.vscode-end-of-line.png)](https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line)
[![](https://vsmarketplacebadges.dev/installs-short/SatoshiYamamoto.vscode-end-of-line.png)](https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line)
[![](https://vsmarketplacebadges.dev/rating-short/SatoshiYamamoto.vscode-end-of-line.png)](https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line)
[![](https://img.shields.io/github/license/standard-software/vscode-end-of-line.png)](https://github.com/standard-software/vscode-end-of-line/blob/main/LICENSE)

This extension has the following functions
- Fill Space end of line and Trim End.
- Inserts a character at the end of a line.
- Deletes a character at the end of a line string.
- Position the cursor at the end of a line.

## Information 

- 2024/09/05 Thu
I have developed another extension similar to the following.

- Line Space Fill Trim - Visual Studio Marketplace  
https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-line-space-fill-trim

It may replace the functionality as follows. Please refer to it.

- End Of Line : Space : Fill Space  
➔ - Line Space : Fill To End : Select All Lines

- End Of Line : Space : Trim End  
➔ - Line Space : Trim End

- End Of Line : Select Cursor : Max Length : All Lines  
➔ - Line Space : Fill To End : Select All Lines

- End Of Line : Select Cursor : Max Length : Text Lines  
➔ - Line Space : Fill To End : Select Text Lines


## Install

https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line

## Usage

Processing is performed according to the following command for each line in the selected range.
Enter the character string after selecting the command.

Following commands are available:

```
- End Of Line : Space : Fill Space
- End Of Line : Space : Trim End 

- End Of Line : Insert End Of Line : All Lines
- End Of Line : Insert End Of Line : Text Lines
- End Of Line : Insert Max Length : All Lines
- End Of Line : Insert Max Length : Text Lines
- End Of Line : Delete End of Text

- End Of Line : Select Cursor : All Lines
- End Of Line : Select Cursor : Text Lines
- End Of Line : Select Cursor : Max Length : All Lines
- End Of Line : Select Cursor : Max Length : Text Lines
```

Or Select Function

```
- End Of Line : Select Function ... >>
  - Space >>
    - Fill Space
    - Trim End
  - Input >>
    - Insert End Of Line >>
      - All Lines
      - Text Lines
    - Insert Max Length >>
      - All Lines
      - Text Lines
    - Delete End of Text
  - Select Cursor >>
    - All Lines
    - Text Lines
    - Max Length : All Lines
    - Max Length : Text Lines
```

Max Length = End of line at maximum length of selection.  

## operation

The number of spaces to be filled is done according to the maximum number of characters in the selection.  
The number of characters is obtained by graphemesplit.  

[graphemesplit - npm](https://www.npmjs.com/package/graphemesplit)  
Thanks to the author of graphemesplit.

So Japanese and Chinese kanji characters are counted as two characters of the alphabet.  
Pictograms are also counted as two characters of the alphabet, and pictograms that are combined into a single character are also counted as two characters of the alphabet.  

- A = 1 character width
- あ = 2 character width
- 😊 = 2 character width
- 👨‍👩‍👧‍👦 = 2 character width

## Setting

settings.json

```json
{
  "EndOfLine.insertString": "> ",
}
```

## Contact

Please contact me if you have any requests.

Satoshi Yamamoto  
standard.software.net@gmail.com  
Japanese / English

