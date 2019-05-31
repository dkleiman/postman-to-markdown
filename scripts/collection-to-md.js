#!/usr/bin/env node
const fs = require('fs');
const { resolve } = require('path');

const [,, collectionPath] = process.argv;

const collection = require(resolve(collectionPath));

const docsPath = `${__dirname}/../docs`;

const upsertDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const parseSubFolder = (subfolder, parentDir) => {
  const {
    name,
    description,
    item,
  } = subfolder;
  const currentDir = `${parentDir}/${name}`;
  upsertDir(currentDir);

  const markdown = `# ${name}\n\n${description ? description : ''}`;

  if (item && item.length) {
    walkItems(item, currentDir, markdown);
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
    markdown.push(`${key} | ${value} | ${description}`);
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
    markdown.push(`${key} | ${value} | ${description} | ${type}`);
  });

  return markdown.join('\n');
};

const parseRequest = (item) => {
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
    `## ${name}`,
    `${description}\n`,
    `\`\`\`${method} ${raw}\`\`\`\n`,
  ];

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
      markdown.push(`${r.name}\n`);
      markdown.push(`${r.code}: ${r.status}`);
      markdown.push(`\`\`\`${r._postman_previewlanguage}\n${r.body}\n\`\`\``)
    });
  }
  return markdown.join('\n');
};

const walkItems = (item, currentDir, markdown = '') => {
  item.forEach((i) => {
    if (i._postman_isSubFolder || i.item) {
      parseSubFolder(i, currentDir);
      return;
    }

    markdown += `\n\n${parseRequest(i)}`;
  });

  fs.writeFileSync(`${currentDir}/DESCRIPTION.md`, markdown);
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
const markdown = `# ${name}\n\n${description ? description : ''}`;
walkItems(item, currentDir, markdown);
