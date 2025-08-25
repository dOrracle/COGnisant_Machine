const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class TemplateEngine {
  constructor({ templatesDir = path.join(process.cwd(),'src','templates') } = {}) {
    this.templatesDir = templatesDir;
    this.templates = new Map();
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  registerHelpers() {
    this.handlebars.registerHelper('uppercase', s => String(s).toUpperCase());
    this.handlebars.registerHelper('lowercase', s => String(s).toLowerCase());
    this.handlebars.registerHelper('add', (a,b) => a + b);
  }

  async initialize() {
    // load templates dir if exists
    try {
      const files = await fs.readdir(this.templatesDir);
      for(const f of files){
        if(f.endsWith('.hbs')){
          const name = f.replace(/\.hbs$/,'');
          const content = await fs.readFile(path.join(this.templatesDir,f),'utf8');
          this.templates.set(name, this.handlebars.compile(content));
        }
      }
    }catch(e){}
  }

  addTemplate(name, source) {
    this.templates.set(name, this.handlebars.compile(source));
  }

  async render(name, context = {}) {
    const tpl = this.templates.get(name);
    if(!tpl) throw new Error(`Template ${name} not found`);
    return tpl(context);
  }

  buildGroundQuery(templateName, context) {
    // simple heuristic: join important fields
    return `${templateName} ${JSON.stringify(context).slice(0,200)}`;
  }
}

module.exports = TemplateEngine;