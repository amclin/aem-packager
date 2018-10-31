[![Build Status](https://travis-ci.org/amclin/aem-packager.svg?branch=master)](https://travis-ci.org/amclin/aem-packager)
[![npm version](https://badge.fury.io/js/aem-packager.svg)](https://badge.fury.io/js/aem-packager)
[![Dependencies Status](https://david-dm.org/amclin/aem-packager/status.svg)](https://david-dm.org/amclin/aem-packager)
[![devDependencies Status](https://david-dm.org/amclin/aem-packager/dev-status.svg)](https://david-dm.org/amclin/aem-packager?type=dev)
# aem-packager
A node plugin that creates AEM packages installable through the Adobe Experience Manager package manager.

## Options
The primary required values will be automatically be extracted from your project's `package.json`, but they can also be overridden by adding an `aemConfig` section to your `package.json`.

```
"name": "my-npm-project",
"scripts": {...},
"dependencies": {...},
"aemConfig": {
    "artifactId": "my-project",
    "description": "My AEM package for cool features.",
    "groupId": "org.example.myprojectgroup",
    "version": "1.2.3"
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
Force the version number that will be used for the AEM content package. When not defined, this will default to the version string provided by your project's `package.json`. Must be a ![SEMVER](https://semver.org/) value.

#### Example:
```
"version": "1.0.0"
```

[![NPM](https://nodei.co/npm/aem-packager.png)](https://nodei.co/npm/aem-packager/)