const vdf = require("simple-vdf")
const path = require("path")
const fs = require("fs-extra")

/**
 *
 * @param gamePath
 */
module.exports = gamePath => {
  if (!gamePath) throw new Error("CS:GO game path not found")

  const itemsPath = path.join(gamePath, "scripts/items/items_game.txt")
  const items = vdf.parse(fs.readFileSync(itemsPath, "utf-8"))

  return {
    items,
    languages: {
      english: readLanguage(gamePath, "english"),
      russian: readLanguage(gamePath, "russian")
    }
  }
}

/**
 *
 * @param gamePath
 * @param language
 */
function readLanguage(gamePath, language) {
  const languagePath = path.join(gamePath, `/resource/csgo_${language}.txt`)
  const tokens = vdf.parse(fs.readFileSync(languagePath, "utf16le"))["lang"]["Tokens"]

  const entries = Object.entries(tokens)
    .map(([key, value]) => [key.toLowerCase(), value])

  return Object.fromEntries(entries)
}