import { NavigationActions, StackActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
}

function back() {
  _navigator.dispatch(NavigationActions.back());
}

function replace(routeName, params) {
  _navigator.dispatch(
    StackActions.replace({
      routeName,
      params,
    }),
  );
}

function popToTop() {
  _navigator.dispatch(StackActions.popToTop());
}

export default {
  navigate,
  back,
  replace,
  popToTop,
  setTopLevelNavigator,
};
