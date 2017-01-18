export default function detect ()  {
  let result = { device: '',  os: '', env: '', type: '' }

  if(new Function("try {return this===global;}catch(e){return false;}")()) {
    result.device = 'pc'
    switch (process.platform) {
      case 'darwin':
        result.os = 'mac'
        break;
      case 'win32':
        result.os = 'windows'
        break;
      case 'linux':
        result.os = 'linux'
        break;
      case 'freebsd':
        result.os = 'freebsd'
        break;
      case 'sunos':
        result.os = 'sunos'
        break;
    }
    result.env = 'node'
    result.type = 'node'
  }
  else if (window.navigator.userAgent) {
    let ua = window.navigator.userAgent
    result.env = 'browser'

    if (/opera/i.test(ua)) {
      result.type = 'Opera'
    }
    else if (/opr|opios/i.test(ua)) {
      result.type = 'Opera'
    }
    else if (/SamsungBrowser/i.test(ua)) {
      result.type = 'Samsung Internet for Android'
    }
    else if (/coast/i.test(ua)) {
      result.type = 'Opera'
    }
    else if (/msie|trident/i.test(ua)) {
      result.type = 'Internet Explorer'
    }
    else if (/chrome.+? edge/i.test(ua)) {
      result.type = 'Microsoft Edge'
    }
    else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result.type = 'Firefox'
    }
    else if (/silk/i.test(ua)) {
      result.type = 'Amazon Silk'
    }
    else if (/phantom/i.test(ua)) {
      result.type = 'PhantomJS'
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result.type = 'BlackBerry'
    }
    else if (/tizen/i.test(ua)) {
      result.type = 'Tizen'
    }
    else if (/chromium/i.test(ua)) {
      result.type = 'Chromium'
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result.type = 'Chrome'
    }
    else if (/safari|applewebkit/i.test(ua)) {
      result.type = 'Safari'
    }
    else {
      result.type = 'unknown'
    }

    let windowsphone = /windows phone/i.test(ua)
      , msedge = result.type === 'Microsoft Edge'
      , silk = /silk/i.test(ua)
      , mac = !/(ipod|iphone|ipad)/i.test(ua) && !silk && /macintosh/i.test(ua)
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)

    if (!windowsphone && !msedge && (android || silk)) {
      result.os = 'android'
    }
    else if (!windowsphone && !msedge && /(ipod|iphone|ipad)/i.test(ua)) {
      result.os = 'ios'
    }
    else if (mac) {
      result.os = 'mac'
    }
    else if (!windowsphone && /windows/i.test(ua)) {
      result.os = 'windows'
    }
    else if (/linux|X11/i.test(ua)) {
      result.os = 'linux'
    }
    else {
      result.os = 'unknown'
    }

    let tablet = /tablet/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)

    if (tablet || nexusTablet || /(ipad)/i.test(ua) || result.silk) {
      result.device = 'tablet'
    }
    else if (mobile || /(ipod|iphone)/i.test(ua) || android || nexusMobile || result.type === 'BlackBerry') {
      result.device = 'mobile'
    }
    else {
      result.device = 'pc'
    }
  }
  else if (window.navigator) {
    if (window.navigator.product === 'ReactNative') {
      result.device = 'mobile'
      result.os = 'unknown'
      result.env = 'react-native'
      result.type = 'react-native'
    }
  }
  else {
    result.device = 'unknown'
    result.os = 'unknown'
    result.env = 'unknown'
    result.type = 'unknown'
  }

  result.device !== 'unknown' &&
    console.info(`Running on ${result.device} with a ${result.os} os and ${result.env} ${result.env !== result.type ? '(' + result.type + ')' : '' } environment ...`);
  return result
}
