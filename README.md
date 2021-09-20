## Obby chat

Instant messaging app for Obyte. Offering secure end-to-end encryption, cryptocurrency payments, and smart contracts for fun & profit.

Building the new era chat that is from the ground up closer to its users in a sleek and light way.

Mainnet wallet can be installed from official stores
* [Google Play Store](https://play.google.com/store/apps/details?id=chat.obby.mainnet)
* [Apple App Store](https://apps.apple.com/us/app/obby-chat/id1572838153)

### Current roadmap

The mobile-only messaging app doesn’t need to be fully featured Obyte demonstration, and it should only focus on those users who use chatting apps. The new app is being written in React Native, and initially, we would only need the following features for the MVP
(minimum viable product):

#### Completed features:
- Generating seed words for new users
- List of chats and individual chats
- List of available chatbots
- Receiving payment from anyone, wallet balance, and history
- Sign message feature (also for request address function)
- Pairing with contact via QR code, NFC tag (Android) or deep-link on website
- Sending payment to contact via QR code, NFC tag (Android) or deep-link on website
- Setup dedicated Obyte hub and in-app push notifications

#### Planned for future
- Generating new address for every new payment request
- Ability to do P2P Bitcoin exchange smart-contract
- Ability to do P2P cryptocurrency price bet smart-contract
- Ability to do P2P sports bet smart-contract
- Showing signed smart-contracts
- Full Autonomous Agent support
- Multi-asset support

For more details and participation, please join [Obyte discord channel](https://discord.gg/8hHXMxS).

### Support or Contact

Want to join or share your thoughts, [send us a letter](mailto:support@obby.chat).

### Development (MAC)

#### Android

1. Get Java jdk 8 from https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html
2. Check which java version is currently in use
   `/usr/libexec/java_home -V`
3. Set correct java version if needed
   `` export JAVA_HOME=`/usr/libexec/java_home -v 1.8` ``
4. Run `yarn android`

#### iOS

Run `yarn ios`


### Steps to run project
#### In project folder

1. Run `npm install` or `yarn install` to install all dependencies
2. Run `cd ios && pod install && cd ../` to install ios pods

#### Run android

1. Run `npm start` or `yarn start` to run metro bundle.
2. Run android emulator from Android Studio or connect device to computer
3. Run `npm run android` or `yarn android` (if installing will failed, check line 38 in MainApplication.java if it will looks like "new RandomBytesPackage(), new VectorIconsPackage());" comment it and try to run again)

#### Run ios

1. Run `npm start` or `yarn start` to run metro bundle.
2. Open "./ios/Obby Chat.xcworkspace" in xCode.
3. Follow nex steps:
    ![alt text](https://github.com/BindCreative/obbychat/raw/master/readmeImages/instruction.png)

### Build variants

### TESTNET

1. In `src/constants/common.js`:

    `Common.network = 'testnet';`

2. In `app.json`:

    `"displayName": "Obby chat testnet"`

#### IOS

- Bundle identifier: `chat.obby.testnet`

- Display Name: `Obby Chat testnet`

    ![alt text](https://github.com/BindCreative/obbychat/raw/master/readmeImages/iosTestnetBundle.png)
    
- Info.plist `CFBundleURLTypes` should contain:
```
    <key>CFBundleURLTypes</key>
    <array>
    	<dict>
    		<key>CFBundleTypeRole</key>
    		<string>Editor</string>
    		<key>CFBundleURLName</key>
    		<string>obyte-tn</string>
    		<key>CFBundleURLSchemes</key>
    		<array>
    			<string>obyte-tn</string>
    		</array>
    	</dict>
    	<dict>
    		<key>CFBundleTypeRole</key>
    		<string>Editor</string>
    		<key>CFBundleURLName</key>
    		<string>byteball-tn</string>
    		<key>CFBundleURLSchemes</key>
    		<array>
    			<string>byteball-tn</string>
    		</array>
    	</dict>
    </array> 
```
- Update `Bundle name` in `Info.plist`:
```
    <key>CFBundleName</key>
    <string>Obby chat testnet</string>
```
- Copy all from `ios/GoogleService-Info-testnet.plist` and paste to `ios/GoogleService-Info.plist`.
- Clear the project `cmd+shift+k`

#### ANDROID

- Make sure you have right folder name

    ![alt text](https://github.com/BindCreative/obbychat/raw/master/readmeImages/androidTestnetFolder.png)
    
- Update `android/app/src/main/res/values/strings.xml`

```
<resources>
    <string name="app_name">Obby chat testnet</string>
</resources>
```

- In `android/app/src/main/AndroidManifest.xml`:

    ```package="chat.obby.testnet"```
    
- In `android/app/src/main/java/chat/obby/testnet/MainActivity.java`:

    ```package chat.obby.testnet;```
    
- In `android/app/src/main/java/chat/obby/mainnet/MainApplication.java`:

    ```package chat.obby.testnet;```
    ```import chat.obby.testnet.generated.BasePackageList;```
    
- In `android/app/src/main/java/chat/obby/testnet/generated/BasePackageList.java`:

    ```package chat.obby.testnet.generated;```
    
- In `android/app/src/main/AndroidManifest.xml`:

    ```package="chat.obby.testnet"```
    
- In `android/app/build.gradle`:

    ```applicationId "chat.obby.testnet"```
    
- In `android/app/_BUCK`:

```
android_build_config(
    name = "build_config",
    package = "chat.obby.testnet",
)

android_resource(
    name = "res",
    package = "chat.obby.testnet",
    res = "src/main/res",
)
```

- Copy all from `android/app/google-services-testnet.json` and paste to `android/app/google-services.json`.

- In Gradle' cleaning in the end (in /android folder):

    ```./gradlew clean```


### MAINNET

1. In `src/constants/common.js`: `Common.network = 'mainnet';`

2. In `app.json`: `"displayName": "Obby chat"`

#### IOS

- Bundle identifier: `chat.obby.mainnet`

- Display Name: `Obby Chat`

    ![alt text](https://github.com/BindCreative/obbychat/raw/master/readmeImages/iosMainnetBundle.png)
    
- Info.plist `CFBundleURLTypes` should contain:
```
    <key>CFBundleURLTypes</key>
    <array>
    	<dict>
    		<key>CFBundleTypeRole</key>
    		<string>Editor</string>
    		<key>CFBundleURLName</key>
    		<string>obyte</string>
    		<key>CFBundleURLSchemes</key>
    		<array>
    			<string>obyte</string>
    		</array>
    	</dict>
    	<dict>
    		<key>CFBundleTypeRole</key>
    		<string>Editor</string>
    		<key>CFBundleURLName</key>
    		<string>byteball</string>
    		<key>CFBundleURLSchemes</key>
    		<array>
    			<string>byteball</string>
    		</array>
    	</dict>
    </array> 
```
- Update `Bundle name` in `Info.plist`:
```
    <key>CFBundleName</key>
    <string>Obby chat</string>
```
- Copy all from `ios/GoogleService-Info-mainnet.plist` and paste to `ios/GoogleService-Info.plist`.
- Clear the project `cmd+shift+k`

#### ANDROID

- Make sure you have right folder name

    ![alt text](https://github.com/BindCreative/obbychat/raw/master/readmeImages/androidMainnetFolder.png)
    
- Update `android/app/src/main/res/values/strings.xml`

```
<resources>
    <string name="app_name">Obby chat</string>
</resources>
```

- In `android/app/src/main/AndroidManifest.xml`:

    ```package="chat.obby.mainnet"```
    
- In `android/app/src/main/java/chat/obby/mainnet/MainActivity.java`:

    ```package chat.obby.mainnet;```
    
- In `android/app/src/main/java/chat/obby/mainnet/MainApplication.java`:

    ```package chat.obby.mainnet;```
    ```import chat.obby.mainnet.generated.BasePackageList;```
    
- In `android/app/src/main/java/chat/obby/mainnet/generated/BasePackageList.java`:

    ```package chat.obby.mainnet.generated;```
    
- In `android/app/src/main/AndroidManifest.xml`:

    ```package="chat.obby.mainnet"```
    
- In `android/app/build.gradle`:

    ```applicationId "chat.obby.mainnet"```
    
- In `android/app/_BUCK`:

```
android_build_config(
    name = "build_config",
    package = "chat.obby.mainnet",
)

android_resource(
    name = "res",
    package = "chat.obby.mainnet",
    res = "src/main/res",
)
```

- Copy all from `android/app/google-services-mainnet.json` and paste to `android/app/google-services.json`.

- In Gradle' cleaning in the end (in /android folder):

    ```./gradlew clean```
