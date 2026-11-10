import type { AppError, Location } from '../domain/types';

/** 把浏览器的 callback 版 Geolocation API 包成可 await 的 Promise */
export function requestCurrentPosition(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        kind: 'geolocation',
        title: '不支持定位功能',
        message: '此浏览器不支持定位，请改用搜索框输入城市。',
        retryable: false,
      } satisfies AppError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          id: `geo-position-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
          name: '目前位置',
          admin1: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
          country: '',
          countryCode: '',
          latitude,
          longitude,
          timezone: 'auto',
        });
      },
      (error) => {
        const messages: Record<number, string> = {
          1: '定位权限被拒绝，请在浏览器设置中允许，或改用搜索框。',
          2: '目前无法取得位置信息，请稍后再试。',
          3: '定位超时，请再试一次。',
        };
        reject({
          kind: 'geolocation',
          title: '无法取得位置',
          message: messages[error.code] ?? '定位失败，请改用搜索框。',
          detail: error.message,
          retryable: error.code !== 1,
        } satisfies AppError);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  });
}
