# CFFT - Create Files From Template CLI

CFFT CLI is a simple but powerful CLI to generate a list of files from templates.

Stop copying/pasting and renaming files and folders or creating these manually, repeating the same file structures every time. CFFT CLI generates custom file structure easily and quickly.

You can use this CLI for any language or framework (JavaScript, Node, React, Angular, .NET, Java, Python, ...)

## Features

- Create a custom file structure using a terminal
- **Search and replace** - Replace file content with a custom text or file name
- Create **multiple templates**
- Set options directly as a CLI argument, or answering on CLI questions, or:
- Set **defaults** by configuring a CLI using a .**config JSON file** for each template - _cfft.config.json_

## Getting started (Tutorial)

1. **Install** the package globally:

```sh
npm install -g @beezydev/create-files-from-template-cli
```

2. The next step is to create a configuration file - _cfft.config.json_. It can be done automatically (recommanded), or you can do it manually. **Navigate your terminal to the _root_ folder** of your application.

3. **Execute the cfft command** to create a configuration file:

```sh
cfft
```

You should see the message that _cfft.config.json_ is created with a default values prefilled:

```json
{
  "defaultTemplateName": "component",
  "templates": [
    {
      "name": "component",
      "options": {
        "templatePath": "/.cfft.templates/component",
        "dirPath": "./{fileName}",
        "fileNameTextToBeReplaced": "component",
        "textToBeReplaced": "FileName",
        "replaceTextWith": "{fileName}",
        "shouldReplaceFileContent": true,
        "shouldReplaceFileName": true,
        "searchAndReplaceSeparator": ";"
      }
    }
  ]
}
```

You can edit these values however you want. See the _Options_ section where it is explained which options exist.

4. The next step is to create your templates (you can create one or more templates). Let's use a default `templatePath`. In your _root_ folder, create the following structure:

```
├── .cfft.templates
│   ├── component
│   │   ├── component.tsx
│   │   ├── component.styles.ts
│   │   ├── index.ts
```

> Note: You can also create inner folders. For example:

```
├── .cfft.templates
│   ├── component
│   │   ├── component-inner
│   │   │   ├── component-inner.styles.tsx
│   │   │   ├── component-inner.tsx
│   │   │   ├── index.ts
│   │   ├── component.tsx
│   │   ├── component.styles.ts
│   │   ├── index.ts
```

> Note: If you are using **GIT**, you can ignore cfft.config.json and your templates if you wish to.

5. Insert some content into your newly created files `component.tsx`, `component.styles.ts` and `index.ts`:

_component.styles.ts_

```js
export const style = {
  backgroundColor: "black",
  color: "white",
};
```

_component.tsx_

```js
import React, { FC } from "react";
import { style } from "./FileName.styles";

const FileName: FC = () => {
  return (
    <div style={style}>
      <p>TODO: FileName</p>
    </div>
  );
};

export default FileName;
```

_index.ts_

```js
export { default } from "./FileName";
```

Doing so, The CFFT CLI is ready for use. Let's test it.

6. Create a src folder manually:

```
├── src
```

7. Navigate your terminal to the src folder:

```sh
cd src
```

8. Execute the **cfft** command:

```sh
cfft
```

9. Enter a file name. For example `MyFile`.

10. CFFT CLI created new files. The _src_ folder has the following structure:

```
├── src
│   ├── MyFile
│   │   ├── MyFile.tsx
│   │   ├── MyFile.styles.ts
│   │   ├── index.ts
```

Additionaly, the CLI replaced the _FileName_ text with the entered file name:

_MyFile.styles.ts_ (unchanged)

```js
export const style = {
  backgroundColor: "black",
  color: "white",
};
```

_MyFile.tsx_

```js
import React, { FC } from "react";
import { style } from "./MyFile.styles";

const MyFile: FC = () => {
  return (
    <div style={style}>
      <p>TODO: MyFile</p>
    </div>
  );
};

export default MyFile;
```

_index.ts_

```js
export { default } from "./MyFile";
```

## Filling the missing configuration options

CFFT CLI is interactive. You can remove all default options from your template, and CLI will ask you for missing information every time you run it.

### Example

_If you were following the previous example, remove the MyFile folder._

1. Remove all options from your **cfft.config.json** file:

```json
{
  "templates": [
    {
      "name": "component"
    }
  ]
}
```

2. Execute the **cfft** command:

```sh
cfft
```

3. Answer questions:

```sh
? Enter template name: component
? Enter file name: MyFile
? Enter dir path: ./MyFile
? Enter template path: /.cfft.templates/component
? Should replace file name text? Yes
? Enter file name text to be replaced: component
? Should replace text? Yes
? Enter text to be replaced: FileName
? Replace text with: MyFile
```

4. The CLI will create files using the provided options.

## Filling the missing configuration options using the CLI arguments

CFFT CLI allows you to specify almost all options using the terminal arguments.

### Example

_If you were following one of the previous examples, remove the MyFile folder._

1. Update your **cfft.config.json** file:

```json
{
  "defaultTemplateName": "component",
  "templates": [
    {
      "name": "component",
      "options": {
        "templatePath": "/.cfft.templates/component",
        "dirPath": "./{fileName}",
        "fileNameTextToBeReplaced": "component",
        "shouldReplaceFileContent": true,
        "shouldReplaceFileName": true,
        "searchAndReplaceSeparator": ";"
      }
    }
  ]
}
```

2. Execute the _cfft_ command and add arguments:

```sh
cfft --fileName MyFile --textToBeReplaced FileName --replaceTextWith Test
```

3. The CLI will create files without asking additional questions - since it has all necessary information.

## Search and replace - replace multiple placeholders

CFFT CLI allows you to search and replace multiple placeholders. To work with this feature, enter the list of placeholders and replacement values separated by the `searchAndReplaceSeparator` character to both `textToBeReplaced` and `replaceTextWith`.

> Note: It is important that textToBeReplaced and replaceTextWith have the same number of segments.

### Example

_If you were following one of the previous examples, remove the MyFile folder._

1. Update the `textToBeReplaced` and `replaceTextWith` in the **cfft.config.json**:

```json
{
  "defaultTemplateName": "component",
  "templates": [
    {
      "name": "component",
      "options": {
        "templatePath": "/.cfft.templates/component",
        "dirPath": "./{fileName}",
        "fileNameTextToBeReplaced": "component",
        "textToBeReplaced": "FileName;FC",
        "replaceTextWith": "{fileName};FunctionComponent",
        "shouldReplaceFileContent": true,
        "shouldReplaceFileName": true,
        "searchAndReplaceSeparator": ";"
      }
    }
  ]
}
```

2. Execute the **cfft** command:

```sh
cfft --fileName MyFile
```

3. The CLI will create files and replace both, _FileName_ with _MyFile_ and _FC_ with _FunctionComponent_.

```js
import React, { FunctionComponent } from "react";
import { style } from "./MyFile.styles";

const MyFile: FunctionComponent = () => {
  return (
    <div style={style}>
      <p>TODO: MyFile</p>
    </div>
  );
};

export default MyFile;
```

## Add additional templates

While you can use only one template, it is also possible to create and use multiple templates. To achieve this, you need to create the template folder and files, to update the **cfft.config.json** and to use the `--template` CLI argument.

> Note: If the `defaultTemplateName` is not specified in the configuration, the CLI will ask for the template name.

### Example

_If you were following one of the previous examples, remove the MyFile folder._

1. Add a new template folder next to the existing one - **css**, and add a file inside it **main.scss** (in the **.cfft.templates** folder):

```
├── .cfft.templates
│   ├── component
│   │   ├── component.tsx
│   │   ├── component.styles.ts
│   │   ├── index.ts
│   ├── css
│   │   ├── main.scss
```

2. Fill the file content:

_main.scss_

```scss
#root {
  box-sizing: border-box;
}
```

3. Update the **cfft.config.json** file:

```json
{
  "defaultTemplateName": "component",
  "templates": [
    {
      "name": "component",
      "options": {
        "templatePath": "/.cfft.templates/component",
        "dirPath": "./{fileName}",
        "fileNameTextToBeReplaced": "component",
        "textToBeReplaced": "FileName;FC",
        "replaceTextWith": "{fileName};FunctionComponent",
        "shouldReplaceFileContent": true,
        "shouldReplaceFileName": true,
        "searchAndReplaceSeparator": ";"
      }
    },
    {
      "name": "css",
      "options": {
        "templatePath": "/.cfft.templates/css",
        "dirPath": "./{fileName}",
        "shouldReplaceFileContent": false,
        "shouldReplaceFileName": false
      }
    }
  ]
}
```

4. Execute the **cfft** command:

```sh
cfft --template css --fileName my-styles
```

5. The CFFT CLI will generate the following folder and file in your _src_ folder:

```
├── src
│   ├── my-styles
│   │   ├── main.scss
```

The **main.scss**, will be exactly the same, since we were not replacing the file content.

## Options

| **Description**                                                                  | **Command**               | **Alias** | **Default**                | **CLI** | **cfft.config** |
| :------------------------------------------------------------------------------- | :------------------------ | :-------: | :------------------------- | :-----: | :-------------: |
| **File name to be used**                                                         | fileName                  |    -n     |                            |    ✓    |       ❌        |
| **Path to the location where to generate files**                                 | dirPath                   |           | ./{fileName}               |    ✓    |        ✓        |
| **Name of the template to use**                                                  | template                  |    -t     |                            |    ✓    |       ❌        |
| **Path to the specific template folder**                                         | templatePath              |           | /.cfft.templates/component |    ✓    |        ✓        |
| **Default template name to be used every time when --template is not specified** | defaultTemplateName       |           | component                  |   ❌    |        ✓        |
| **Should or not CLI replace a file name**                                        | shouldReplaceFileName     |           | true                       |    ✓    |        ✓        |
| **Wich part of the file name should be replaced**                                | fileNameTextToBeReplaced  |           | component                  |    ✓    |        ✓        |
| **Should or not CLI replace a file content**                                     | shouldReplaceFileContent  |           | true                       |    ✓    |        ✓        |
| **Text to be replaced separated by a search and replace separator**              | textToBeReplaced          |           | FileName                   |    ✓    |        ✓        |
| **Text to be used for search and replace separated by a separator**              | replaceTextWith           |           | {fileName}                 |    ✓    |        ✓        |
| **Custom separator for search and replace**                                      | searchAndReplaceSeparator |           | ;                          |    ✓    |        ✓        |
| **Show additional logs**                                                         | debug                     |           |                            |    ✓    |       ❌        |
| **See the package version**                                                      | --version                 |    -v     |                            |    ✓    |       ❌        |
| **Get help**                                                                     | --help                    |           |                            |    ✓    |       ❌        |

> Note: When specifing an option in a terminal, always add _--_ as prefix. Example:

```sh
cfft --template MyTemplate
```

### Placeholders

- **{fileName}** is a special value to indicate that specific text should be replaced with a specified file name (_--fileName_)

## License

MIT
