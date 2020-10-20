import { actionTypes } from './../constants';

export const rotateDeviceTempKey = () => ({
  type: actionTypes.DEVICE_TEMP_KEY_ROTATE,
});

export const reSubscribeToHub = () => ({
  type: actionTypes.RESUBSCRIBE_TO_HUB
});

export const initDeviceInfo = () => ({
  type: actionTypes.INIT_DEVICE_INFO
});
