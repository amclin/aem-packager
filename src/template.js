const Console = console
const { create } = require('xmlbuilder2')
const path = require('path')
const fs = require('fs')

const templateList = [
  'pom', 'jcrvault', 'jackrabbit', 'legacyCRXSupport'
]

const loadTemplate = (template) => {
  const file = path.resolve(__dirname, 'templates', `${template}.xml`)
  const xmlStr = fs.readFileSync(file, 'utf8')
  const xmlDoc = create(xmlStr)
  return xmlDoc
}

const assemblePom = ({ packager: mode = 'jackrabbit', legacyCRXSupport = false }) => {
  try {
    Console.debug(`Asembling a pom.xml that will use ${mode}`)

    // load the templates
    const templates = Object.fromEntries(
      templateList.map((el) => [el, loadTemplate(el)])
    )

    const doc = templates.pom.root()
    // Insertion goes after the last plugin in project.build.plugins
    const plugins = doc.find(el => el.node.nodeName === 'build')
      .find(el => el.node.nodeName === 'plugins')

    // Toggle package
    plugins.import(templates[mode])

    // Toggle compatibility mode
    if (mode === 'jackrabbit' && legacyCRXSupport) {
      plugins.import(templates.legacyCRXSupport)
    }

    return doc
  } catch (err) {
    Console.error('Failed to asemble pom.xml from templates.', err)
    throw err
  }
}

const writePom = (xmlDoc) => {
  const xml = xmlDoc.end({ prettyPrint: true })
  const pomPath = path.resolve(__dirname, 'pom.xml')
  fs.writeFileSync(pomPath, xml, 'utf8')
}

module.exports = {
  assemblePom,
  writePom
}
