Introduction
-------------

Iris is an on-call escalation management system built by Linkedin and used in production today. This repo provides a mobile frontend for Iris, allowing engineers to access incident data off-premises. Iris is:

- **Simple:** This app gives its users a clean, focused UI for examining on-call alerts and their associated data.
- **Customizable:** The content of each incident is user-defined, as is the way that data is displayed. Iris exposes a templating system that allows each application to define layouts for its incidents, empowering users to decide what data is important and how they wish to see it.
- **Scalable:** Iris is used in production by Linkedin to handle all of its operational incidents (thousands per day).

This repo provides a mobile interface for Iris. The primary codebase is available at [this repo](https://github.com/linkedin/iris)


Getting Started
---------------

The Iris mobile app is built on the Ionic 3 platform (https://ionicframework.com/). As such, it's largely written in Typescript and HTML, then compiled to run in a WebView on Android and iOS. The app communicates with [Iris API](https://github.com/linkedin/iris) through [Iris relay](https://github.com/linkedin/iris-relay). Both of these components are necessary for the app to function. To check out how the app works:

- **Set up Iris API and Iris relay:** For an easy initial setup, see the Iris docker-compose repo [here](https://github.com/jrgp/iris-docker-compose). Docs for more complicated setup can be found at https://iris.claims/docs.
- **Install the Ionic CLI:** Follow instructions [here](https://ionicframework.com/docs/cli) to download and install the Ionic CLI. This app is built on Ionic 3, so you may need to install a previous version.
- **Run the app in-browser:** Running "ionic serve" should build the app, connect it to the docker-compose containers, and allow you to see what the app looks like. Note that this is a debug-mode setup; production deployment will require some configuration changes.


Building native apps
--------------------
To build the app for mobile devices, we leverage cordova through the Ionic platform. To do this:

- **Set up Iris API and Iris relay:** For an easy initial setup, see the Iris docker-compose repo [here](https://github.com/jrgp/iris-docker-compose). Docs for more complicated setup can be found at https://iris.claims/docs.
- **Configure .env.dev and .env.prod:** In .env.dev and .env.prod (located in the repo root), set `IRIS_BASE_URL` and `LOGIN_URL` according to where Iris relay is hosted. For example, this may look like `IRIS_BASE_URL=https://iris-relay.example.com` and `LOGIN_URL=https://iris-relay.example.com/saml/login/saml_idp`
- **Configure Firebase push notifications:** After configuring the app with your Firebase project, you should be given the option to download a google-services.json or GoogleService-Info.plist file.
- **Build using Ionic CLI:** For development builds, run `ionic cordova build $PLATFORM`. Production builds use `ionic cordova build --prod --release $PLATFORM`
- **Configure code signing for iOS/Android:** For production builds, code signing is required to verify developer identity. The process for this differs depending on platform. See instructions for [iOS](https://developer.apple.com/support/code-signing/) and [Android](https://developer.android.com/studio/publish/app-signing)

