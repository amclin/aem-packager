[![Build Status](https://travis-ci.org/amclin/aem-packager.svg?branch=master)](https://travis-ci.org/amclin/aem-packager)
# aem-packager
A node plugin that creates AEM packages installable through the Adobe Experience Manager package manager.

## Options
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
The primary required values for generating a Maven package will be automatically be extracted from your project's `package.json`, but they can also be overridden by adding an `aem-packager.defines` section to your `package.json`.

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
