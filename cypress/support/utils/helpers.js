/**
 * 날짜 문자열에서 앞에 '0'을 제거합니다. (예: '08' -> '8')
 * @param {string} date - 날짜 문자열 (예: '08', '12')
 * @returns {string}
 */
export function dateFixNumber(date) {
  // date가 유효한 문자열인지 확인하는 방어 코드를 추가합니다.
  if (typeof date === 'string' && date.startsWith('0')) {
    return date.substring(1);
  }
  return date;
}

/**
 * 좌석 등급 코드(P, F 등)를 다국어 번역에 맞는 정규식(RegExp)으로 변환합니다.
 * @param {string} cabin - 좌석 등급 코드 (P, F, Y 등)
 * @returns {RegExp}
 */
export function getCabinClassRegex(cabin) {
  const translations = Cypress.env('translate') || {};
  // W000470: 프레스티지석, W000471: 일등석, W000469: 일반석
  const cabinMap = {
    P: translations.W000470 || 'Prestige',
    F: translations.W000471 || 'First',
    Y: translations.W000469 || 'Economy', // 일반석에 대한 표준 코드 'Y'를 추가합니다.
  };

  const cabinKey = ['P', 'F'].includes(cabin) ? cabin : 'Y';
  return new RegExp(cabinMap[cabinKey], 'i');
}

