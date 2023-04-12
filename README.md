## Developing

First install yarn: `npm install yarn -g`
Then install all local packages for the repo with the command `yarn` (same as `yarn install`).

Add packages with `yarn add <package-name>` and start a development server:

```bash
yarn dev
# or start the server and open the app in a new browser tab
yarn dev --open
```

A dev-server automatically reloads on code changes.

## Building

To create a production version of your app:

```bash
yarn build
```

You can preview the production build with `yarn preview`.

