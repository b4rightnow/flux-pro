# 🌊 flux

## Local development

Clone the repo:
```
git clone git@github.com:b4rightnow/flux.git
```

Set up the environment:
```
composer install
npm install
```

Bundle the JS & CSS:
```
npm run build
```

### Test it in a local Laravel project

From the root of the project, run:
```
composer config repositories.local '{"type": "path", "url": "./../flux"}' --file composer.json
```

> Note: The path to the local Flux repo is relative to the root of the project.

Now, you can run:

```
composer require b4rightnow/flux:dev-main --dev
```

> Note: You might have to change your app's "minimum-stability" to "dev" in your `composer.json` file.
