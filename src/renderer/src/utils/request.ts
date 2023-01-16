import axios from 'axios'

type Fn = (data: FcResponse<any>) => unknown

interface IAnyObj {
  [index: string]: unknown
}

interface FcResponse<T> {
  code: string
  msg: string
  data: T
}

const handleChangeRequestHeader = (config) => {
  // config['xxx'] = ""
  return config
}

const handleConfigureAuth = (config) => {
  // config.headers['token'] = localStorage.getItem('token') || ''
  return config
}

const handleGeneralError = (code: string | number, msg: string): boolean => {
  if (code != 200) {
    // message.error(errmsg)
    alert(msg)
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

axios.interceptors.request.use((config) => {
  config = handleChangeRequestHeader(config)
  config = handleConfigureAuth(config)
  return config
})

axios.interceptors.response.use(
  (response) => {
    if (response.status !== 200) return Promise.reject(response.data)
    handleGeneralError(response.data.code, response.data.msg)
    return response
  },
  (err) => {
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
    axios
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
    axios
      .post(url, data, { params })
      .then((result) => {
        resolve([null, result.data as FcResponse<T>])
      })
      .catch((err) => {
        resolve([err, undefined])
      })
  })
}
