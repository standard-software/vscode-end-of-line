# VSCode extension - End Of Line

[![Version][version-badge]][marketplace]
[![Ratings][ratings-badge]][marketplace-ratings]
[![Installs][installs-badge]][marketplace]
[![License][license-badge]][license]

This extension has the following functions
- Inserts a character at the end of a line.
- Deletes a character at the end of a line string.
- Position the cursor at the end of a line.

## Install

https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line

## Usage

Processing is performed according to the following command for each line in the selected range.
Enter the character string after selecting the command.

Following commands are available:

- `End Of Line | Input`
  - `Insert | All Lines`
  - `Insert | Only Text Lines`
  - `Insert | All Lines | Max Line Length`
  - `Insert | Only Text Lines | Max Line Length`
  - `Delete | End of Text`

- `End Of Line | Select Edit`
  - `Select Edit | All Lines`
  - `Select Edit | Only Text Lines`
  - `Select Edit | All Lines | Max Line Length`
  - `Select Edit | Only Text Lines | Max Line Length`

Max Line Length = End of line at maximum length of selection.  

## License

Released under the [MIT License][license].

[version-badge]: https://vsmarketplacebadge.apphb.com/version/SatoshiYamamoto.vscode-end-of-line.svg
[ratings-badge]: https://vsmarketplacebadge.apphb.com/rating/SatoshiYamamoto.vscode-end-of-line.svg
[installs-badge]: https://vsmarketplacebadge.apphb.com/installs/SatoshiYamamoto.vscode-end-of-line.svg
[license-badge]: https://img.shields.io/github/license/standard-software/vscode-end-of-line.svg

[marketplace]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line
[marketplace-ratings]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line#review-details
[license]: https://github.com/standard-software/vscode-end-of-line/blob/master/LICENSE

## Version

### 1.0.0
2021/11/21(Sun)
- Readme

### 0.1.0
2021/11/15(Mon)
- Created by migrating from vscode-insert-string-each-line

