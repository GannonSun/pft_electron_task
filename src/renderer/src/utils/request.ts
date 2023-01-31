import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

type Fn = (data: FcResponse<any>) => unknown

interface IAnyObj {
  [index: string]: unknown
}

interface FcResponse<T> {
  code: string | number
  msg: string
  data: T
}

let loadingInstance: any = null
let needLoadingRequestCount: number = 0

const getCookie = (cname) => {
  let name = cname + '='
  let cookieArr = document.cookie.split(';')
  for (let i = 0; i < cookieArr.length; i++) {
    let cookieStr = cookieArr[i]
    if (cookieStr.indexOf(name) != -1) return cookieStr.substring(name.length + 1, cookieStr.length)
  }
  return ''
}

const handleChangeRequestHeader = (config) => {
  // config['xxx'] = ""
  return config
}

const handleConfigureAuth = (config) => {
  // config.headers['x-csrf-token'] = getCookie('csrfToken') || ''
  return config
}

const handleGeneralError = (code: string | number, msg: string): boolean => {
  if (code != 200) {
    ElMessage({
      type: 'error',
      message: msg
    })
    return false
  }

  return true
}

const handleNetworkError = (errStatus?: number): void => {
  const networkErrMap: any = {
    '400': '错误的请求', // token 失效
    '401': '未授权，请重新登录',
    '403': '拒绝访问',
    '404': '请求错误，未找到该资源',
    '405': '请求方法未允许',
    '408': '请求超时',
    '500': '服务器端出错',
    '501': '网络未实现',
    '502': '网络错误',
    '503': '服务不可用',
    '504': '网络超时',
    '505': 'http版本不支持该请求'
  }
  if (errStatus) {
    // message.error(networkErrMap[errStatus] ?? `其他连接错误 --${errStatus}`)
    return
  }
  //   message.error('无法连接到服务器！')
}

const axiosIns = axios.create({
  baseURL: 'http://118.25.4.192:7003'
})

axiosIns.interceptors.request.use((config) => {
  if (needLoadingRequestCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  needLoadingRequestCount++
  config = handleChangeRequestHeader(config)
  config = handleConfigureAuth(config)
  return config
})

axiosIns.interceptors.response.use(
  (response) => {
    needLoadingRequestCount--
    if (needLoadingRequestCount === 0) {
      loadingInstance && loadingInstance.close()
    }
    if (response.status !== 200) return Promise.reject(response.data)
    handleGeneralError(response.data.code, response.data.msg)
    return response
  },
  (err) => {
    needLoadingRequestCount--
    if (needLoadingRequestCount === 0) {
      loadingInstance && loadingInstance.close()
    }
    handleNetworkError(err.response.status)
    Promise.reject(err.response)
  }
)

export const Get = <T>(
  url: string,
  params: IAnyObj = {},
  clearFn?: Fn
): Promise<[any, FcResponse<T> | undefined]> =>
  new Promise((resolve) => {
    axiosIns
      .get(url, { params })
      .then((result) => {
        let res: FcResponse<T>
        if (clearFn !== undefined) {
          res = clearFn(result.data) as unknown as FcResponse<T>
        } else {
          res = result.data as FcResponse<T>
        }
        resolve([null, res as FcResponse<T>])
      })
      .catch((err) => {
        resolve([err, undefined])
      })
  })

export const Post = <T>(
  url: string,
  data: IAnyObj,
  params: IAnyObj = {}
): Promise<[any, FcResponse<T> | undefined]> => {
  return new Promise((resolve) => {
    axiosIns
      .post(url, data, { params })
      .then((result) => {
        resolve([null, result.data as FcResponse<T>])
      })
      .catch((err) => {
        resolve([err, undefined])
      })
  })
}
