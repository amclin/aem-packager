[![Codacy Badge](https://api.codacy.com/project/badge/Grade/537d95b7e8fa4e40a2534574a7b4bc26)](https://app.codacy.com/app/mailfrom/aem-packager?utm_source=github.com&utm_medium=referral&utm_content=amclin/aem-packager&utm_campaign=Badge_Grade_Dashboard)
[![Build Status](https://travis-ci.org/amclin/aem-packager.svg?branch=master)](https://travis-ci.org/amclin/aem-packager)
[![npm version](https://badge.fury.io/js/aem-packager.svg)](https://badge.fury.io/js/aem-packager)
[![Dependencies Status](https://david-dm.org/amclin/aem-packager/status.svg)](https://david-dm.org/amclin/aem-packager)
[![devDependencies Status](https://david-dm.org/amclin/aem-packager/dev-status.svg)](https://david-dm.org/amclin/aem-packager?type=dev)
# aem-packager
Creates AEM packages for NodeJS projects that can then be installed through the Adobe Experience Manager package manager. Combined with the [aem-clientlib-generator](https://www.npmjs.com/package/aem-clientlib-generator) this provides a rich end-to-end workflow for developing JS and CSS for injection into AEM as components, libraries, applications, or contents.

1. [Using](#using)
    * [Example Project](https://github.com/amclin/aem-packager-example)
2. [Dependencies](#dependencies)
3. [Packager Options](#options)
4. [Package Defines](#defines)

## Using
Install **aem-packager** as a dependency for your NodeJS project:

`npm install --save aem-packager`

Add the Maven working directory to your `.gitignore` so you don't have unecessary files in your source control:

`./target`

Make sure that your `package.json` has the `name`, `description`, and `version` all filled in:

```
{
  "name": "my-npm-project",
  "description": "My project does something interesting.",
  "version": "1.0.0",
  "dependencies": ...
}
```

If your project doesn't currently put its build ouptut in the `/dist` folder, then set the [source directory](#buildDir-string).

Add a package script to your `package.json`:

```
...
  "scripts": {
    ....
    "package": "aem-packager",
  }

```

Run your build process as normal. After your build completes, then run the packager:

`npm run package`

The resulting `.zip` file will be outpt to the `target` folder by default. You should be able to take that file and upload it and install it through [AEM's package manager](https://helpx.adobe.com/experience-manager/6-3/sites/administering/using/package-manager.html).

![Package installed in AEM Package Manager](docs/installed-package.png)

### Package Name
AEM requires SEMVER versioning in order for packages to be recognized as version updates. AEM also cannot safely install an older version of a package over a new version, which is why the filename contains a timestamp to guarantee sequential uniqueness.

The output package name uses the pattern:

`{groupId}-{artifactId}-{version}-{timestamp}.zip`

#### Example:

`npm-package-test-1.1.0-2018-10-31T18-22-42Z.zip`

## Dependencies
**aem-packager** is a wrapper around [Adobe's Maven plugin](https://helpx.adobe.com/experience-manager/6-3/sites/developing/using/vlt-mavenplugin.html) for building content packages. Therefore, you will need [Maven installed on your system](https://maven.apache.org/install.html).

## Packager Options
The settings for running the packager are populated through the `options` object. This can be added to your project's `package.json` as a `aem-packager.options` section.

```
"name": "my-npm-project",
"scripts": {...},
"dependencies": {...},
"aem-packager": {
    "options": {
        "srcDir": "dist",
        "buildDir": "target"
        "jcrPath": "/apps/mygroup/myapp/clientlibs"
    },
    "defines": {...}
}
```

### srcDir (string)
The directory where your compiled files are located waiting to be packaged. Defaults to `dist` when not provided. All files within the folder will be included in the AEM package, so make sure that the output has been sanitized to only the files you wish to deploy.

### buildDir (string)
The working directory that Maven will use for compiling the build package. Defaults to `target` when not provided.

### jcrPath (string)
The path in the JCR (AEM's storage system) where the module will be installed. Since most npm projects will likely be generating JS, CSS, and HTML assets, the default here when left blank, this will use the [`groupId`](#groupId-string) and [`artifactId`](#artifactId-string) to complete generate the full pattern `/apps/<groupId>/<artifactId>/clientlibs`

## Defines
In addition to [configuring how the packager runs](#Options), you can also set Maven **defines** which provide specific values in the resulting installable AEM package. The primary required values for generating an AEM package will be automatically be extracted from your project's `package.json`, but they can be overridden by adding a `defines` object to your project's `package.json` as a `aem-packager.defines` section.

```
"name": "my-npm-project",
"scripts": {...},
"dependencies": {...},
"aem-packager": {
    "options": {...},
    "defines": {
        "artifactId": "my-project",
        "description": "My AEM package for cool features.",
        "groupId": "org.example.myprojectgroup",
        "version": "1.2.3"
    }
}
```

### artifactId (string)
artifactId is used within AEM's package management to identify the package. Default value if unset will be the npm project name from your project's `package.json`. Must be a machine-safe string.

#### Example
```
// For a company called "Example.org":
"artifactId": "my-project"
```

### description (string)
Force the description that will be used for the AEM content package. When not defined, this will default to the description string provided by your project's `package.json`.

#### Example:
```
"description": "My AEM package for cool features."
```

### groupId (string)
groupId is used within AEM's package management to group related packages together. The naming convention typically follows Java package naming so it is easy to find packages in the AEM package manager. Default value if unset will be `npm`. Must be a machine-safe string.

#### Example
```
// For a company called "Example.org":
"groupId": "org.example.myprojectgroup"
```

### version (string)
Force the version number that will be used for the AEM content package. When not defined, this will default to the version string provided by your project's `package.json`. Must be a [SEMVER](https://semver.org/) value.

#### Example:
```
"version": "1.0.0"
```
## More Info
* For an example end-to-end project, see https://github.com/amclin/aem-packager-example
* [aem-clientlib-generator](https://www.npmjs.com/package/aem-clientlib-generator)

[![NPM](https://nodei.co/npm/aem-packager.png)](https://nodei.co/npm/aem-packager/)