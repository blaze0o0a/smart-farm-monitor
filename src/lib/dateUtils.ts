import moment from 'moment'

/**
 * 한국 시간대(UTC+9)를 고려한 날짜 변환 유틸리티
 */
export class DateUtils {
  /**
   * 선택된 날짜(YYYY-MM-DD)를 한국 시간대 기준으로 하루 전체 범위의 UTC 시간으로 변환
   * @param dateString - "YYYY-MM-DD" 형식의 날짜 문자열
   * @returns {startDate: string, endDate: string} - UTC ISO 문자열
   */
  static getKoreanDayRange(dateString: string): {
    startDate: string
    endDate: string
  } {
    const [year, month, day] = dateString.split('-').map(Number)

    // 한국 시간 00:00:00 = UTC 전날 15:00:00
    const startOfDay = new Date(Date.UTC(year, month - 1, day - 1, 15, 0, 0))
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 14, 59, 59))

    return {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    }
  }

  /**
   * UTC 시간을 한국 시간으로 변환하여 포맷팅
   * @param utcTimeString - UTC ISO 시간 문자열
   * @param includeDate - 날짜 포함 여부 (기본값: true)
   * @returns 포맷된 한국 시간 문자열
   */
  static formatKoreanTime(
    utcTimeString: string,
    includeDate: boolean = true
  ): string {
    const koreanTime = moment(utcTimeString).utcOffset(9)

    if (includeDate) {
      return koreanTime.format('YYYY-MM-DD HH:mm:ss')
    }
    return koreanTime.format('HH:mm:ss')
  }

  /**
   * UTC 시간을 한국 시간과 UTC 시간을 모두 표시하는 형식으로 변환 (사용하지 않음)
   * @param utcTimeString - UTC ISO 시간 문자열
   * @returns "MM-DD HH:mm:ss (MM-DD HH:mm:ss UTC)" 형식
   * @deprecated 더 이상 사용하지 않음 - formatKoreanTime 사용 권장
   */
  static formatTimeWithUTC(utcTimeString: string): string {
    const utcDate = new Date(utcTimeString)
    const koreanDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000)

    const koreanDateStr = koreanDate.toISOString().substring(5, 10) // MM-DD
    const koreanTime = koreanDate.toISOString().substring(11, 19) // HH:mm:ss
    const utcDateStr = utcDate.toISOString().substring(5, 10) // MM-DD
    const utcTime = utcDate.toISOString().substring(11, 19) // HH:mm:ss

    return `${koreanDateStr} ${koreanTime} (${utcDateStr} ${utcTime} UTC)`
  }

  /**
   * HTML5 date input의 값을 UTC로 안전하게 처리
   * @param dateString - HTML5 date input에서 받은 "YYYY-MM-DD" 문자열
   * @returns UTC Date 객체
   */
  static parseDateInput(dateString: string): Date {
    return moment.utc(dateString).toDate()
  }
}
