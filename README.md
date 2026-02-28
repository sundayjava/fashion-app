# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.




help me continue this page. First, impl the todo, which is adding the units as a dropdown wiht a standard height when a user selects any unit, it will be updated in the state, do the save template, more horiz and so. fix everything. then for the body, add two floating action buttons one for addingmeasurement. one is when a user clicks it opens a bottomsheet, then the user will select the name like chest, burst, etc, after selecting, a small box will appear longside the name where the user will enter the value, and a small dropdown will appear for the user to select a custom units, and then a - minus botton for the user to remove the field, it can add more using that same pattern. the for the second floating action button, when a user clicks it, a label field, text field, dropdown for unit, and a - minus botton to delete the field. there will be a sticky footy button to save the measurement. i want to use offline expo sqflite database, then later sync to online database. fo now, we will go with offline because wehave note setup our backend. for the more vert, it will be a option menu that will show.

Add these also

Step Indicator (Future):

Show progress: “Fields added: 3 / 10”

Field Reorder:

Allow drag & drop to reorder fields for templates