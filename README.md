## Obby chat

Instant messaging app for Obyte. Offering secure end-to-end encryption, cryptocurrency payments, and smart contracts for fun & profit.

Building the new era chat that is from the ground up closer to its users in a sleek and light way.

### Current roadmap

The mobile-only messaging app doesn’t need to be fully featured Obyte demonstration, and it should only focus on those users who use chatting apps. The new app is being written in React Native, and initially, we would only need the following features for the MVP
(minimum viable product):

#### Completed features:
- Generating seed words for new users.
- List of chats and individual chats
- Pairing with QR code and deep-link on website
- Sending payment to contact via QR code or deep-link on website
- Receiving payment from anyone, wallet balance, and history
- Sign message feature (also for request address function)

#### In-development:
- Pairing with NFC tag (Android)
- Generating new address for every new payment request
- Sending payment to contact via NFC tag (Android)
- Ability to do P2P Bitcoin exchange smart-contract
- Ability to do P2P cryptocurrency price bet smart-contract
- Ability to do P2P sports bet smart-contract
- Showing signed smart-contracts
- Setup dedicated Obyte hub and in-app push notifications

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
    ![alt text](https://github.com/BindCreative/obbychat/blob/development/instruction.png)

