const { join } = require("path")

/**
 * Keep the Chrome that Puppeteer downloads inside the project folder. Hosts like Render
 * only keep the project folder between the build and the running server, so Chrome stored
 * in the default location (~/.cache/puppeteer) would be missing at runtime.
 */
module.exports = {
    cacheDirectory: join(__dirname, ".cache", "puppeteer"),
}
