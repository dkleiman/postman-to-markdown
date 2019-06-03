#!/usr/bin/env node
const fs = require('fs');
const { resolve } = require('path');

const [,, collectionPath, environmentPath] = process.argv;

const collection = require(resolve(collectionPath));

let environment = {};

if (environmentPath) {
  environment = require(resolve(environmentPath));
  environment = environment.values.reduce((variableMap, variable) => {
    variableMap[`{{${variable.key}}}`] = variable.value;
    return variableMap;
  }, {});
}

const docsPath = `${__dirname}/../docs`;

const upsertDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const template = (str) => {
  return str.replace(/({{[^\}]*}})/g, (_, key) => {
    return environment[key] || key;
  });
}

const parseSubFolder = (subfolder, parentDir) => {
  const {
    name,
    description,
    item,
  } = subfolder;
  const currentDir = `${parentDir}/${name.toLowerCase().replace(/\s/g, '-')}`;
  upsertDir(currentDir);

  const markdown = `# ${name}\n\n${description || ''}`;
  fs.writeFileSync(`${currentDir}/overview.md`, template(markdown));

  if (item && item.length) {
    walkItems(item, currentDir);
  }
};

const queryToTable = (query) => {
  const markdown = [
    `Key | Value | Description`,
    `--- | --- | ---`,
  ];

  query.forEach((q) => {
    const {
      key,
      value,
      description,
    } = q;
    markdown.push(`${key || ''} | ${value || ''} | ${description || ''}`);
  });

  return markdown.join('\n');
};

const headersToMarkdown = (headers) => {
  const markdown = [
    `Key | Value | Description | Type`,
    `--- | --- | --- | ---`,
  ];
  headers.forEach((header) => {
    const {
      key,
      value,
      description,
      type,
    } = header;
    markdown.push(`${key || ''} | ${value || ''} | ${description || ''} | ${type || ''}`);
  });

  return markdown.join('\n');
};

const parseRequest = (item, currentDir) => {
  const {
    request: {
      method,
      header,
      url: {
        raw,
        query,
      },
      body,
      description,
    },
    name,
    response,
  } = item;
  const markdown = [
    `## ${name}\n`,
    `\`\`\`${method} ${raw}\`\`\`\n`,
  ];

  if (description) {
    markdown.push(`${description}\n`);
  }

  if (query && query.length) {
    markdown.push(`### Parameters\n\nYou can include the following parameters in a search request.\n`)
    markdown.push(queryToTable(query));
  }

  if (header && header.length) {
    markdown.push(`### Headers\n`);
    markdown.push(headersToMarkdown(header));
  }

  // Only handle raw bodies
  if (body && body.mode === 'raw') {
    markdown.push(`### Body\n`);
    markdown.push(`\`\`\`\n${body.raw}\n\`\`\``)
  }

  if (response && response.length) {
    markdown.push(`### Example Responses\n`);
    response.forEach((r) => {
      markdown.push(`- ${r.name}\n`);
      markdown.push(`${r.code}: ${r.status}`);
      markdown.push(`\`\`\`${r._postman_previewlanguage}\n${r.body}\n\`\`\``)
    });
  }
  fs.writeFileSync(`${currentDir}/${name.toLowerCase().replace(/\s/g, '-')}.md`, template(markdown.join('\n')));
};

const walkItems = (item, currentDir, markdown = '') => {
  item.forEach((i) => {
    if (i._postman_isSubFolder || i.item) {
      parseSubFolder(i, currentDir);
      return;
    }

    parseRequest(i, currentDir);
  });
};

// Top level object has the info key 
const {
  name,
  description,
} = collection.info;

const { item } = collection;

const currentDir = `${docsPath}/${name}`;

// Create the docs directory
upsertDir(currentDir);

// Consider doing this at the end and adding a table of contents first
const markdown = `# ${name}\n\n${description || ''}`;
fs.writeFileSync(`${currentDir}/README.md`, template(markdown));

walkItems(item, currentDir, markdown);
