import { BrowserWindow, dialog, IpcMainInvokeEvent, shell } from 'electron'
import { exec } from 'child_process'

interface IcommandFuncParams {
  branch: string
}
interface IcommandFunc {
  (gitInfo: IcommandFuncParams): string
}
interface IsuccessFunc {
  (gitIndex: number, commandIndex: number, output: string): void
}
interface IfailedFunc {
  (gitIndex: number, commandIndex: number, command: string): void
}
interface Icommand {
  commandFunc: IcommandFunc
  successFunc: IsuccessFunc
  failedFunc?: IfailedFunc
}
interface ItaskGits {
  git_name: string
  branch_name: string
  local_path: string
}

type ActionNames = 'created' | 'switch'

export async function handleOpenLink(_e: IpcMainInvokeEvent, url: string) {
  shell.openExternal(url)
}

export async function handleOpenFileDir(_e: IpcMainInvokeEvent, path: string) {
  shell.openPath(path)
}

export async function handleOpenCMD(_e: IpcMainInvokeEvent, path: string) {
  exec('start cmd.exe', {
    cwd: path
  })
}

export async function handleDirectoryOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

export async function handleOperateGit(
  _e: IpcMainInvokeEvent,
  taskGits: ItaskGits[],
  action: ActionNames
) {
  const currentWindow = BrowserWindow.getFocusedWindow()

  const sendSuccessLog = (log: string) => {
    console.log(111, log)
    currentWindow?.webContents.send('update-switch-log', {
      code: 200,
      msg: log
    })
  }
  const sendFailLog = (log: string) => {
    currentWindow?.webContents.send('update-switch-log', {
      code: 500,
      msg: log
    })
  }
  const sendProcessLog = (current: number, total: number) => {
    currentWindow?.webContents.send('update-switch-log', {
      code: 0,
      current,
      total
    })
  }

  // 创建任务自动创建切换分支操作
  const createdCommands: Array<Icommand> = [
    {
      commandFunc: () => 'git status -s', // 检测仓库是否有未提交的文件或者有新增的未跟踪的新文件
      successFunc: (gitIndex, commandIndex, output) => {
        if (!output) {
          // 无未提交的文件，则执行同仓库的下一个命令 git checkout xxx
          sendSuccessLog('当前所在分支无需暂存的文件')
          execFunc(gitIndex, ++commandIndex)
        } else {
          // 有未提交的文件，则中断同仓库的后续命令，进行下一个仓库的切换分支操作
          const { git_name: name } = taskGits[gitIndex]
          sendFailLog(`${name}当前分支有未提交的文件，请先前往确认`)
          execGitAction(++gitIndex)
        }
      }
    },
    {
      commandFunc: () => 'git checkout master',
      successFunc: (gitIndex, commandIndex) => {
        // 先切换到master在创建新分支
        sendSuccessLog('成功切换到master，准备拉取最新代码...')
        execFunc(gitIndex, ++commandIndex)
      }
    },
    {
      commandFunc: () => 'git pull',
      successFunc: (gitIndex, commandIndex) => {
        sendSuccessLog('更新master成功，稍后将为您创建新分支...')
        execFunc(gitIndex, ++commandIndex)
      }
    },
    {
      commandFunc: ({ branch }) => `git checkout -b ${branch}`,
      successFunc: (gitIndex) => {
        // 创建成功
        sendSuccessLog('自动创建分支成功，并已切换到该分支')
        execGitAction(++gitIndex)
      }
    }
  ]
  const switchCommands: Array<Icommand> = [
    {
      commandFunc: () => 'git status -s', // 检测仓库是否有未提交的文件或者有新增的未跟踪的新文件
      successFunc: (gitIndex, commandIndex, output) => {
        if (!output) {
          // 无未提交的文件，则执行同仓库的下一个命令 git checkout xxx
          sendSuccessLog('当前所在分支无需暂存的文件')
          execFunc(gitIndex, ++commandIndex)
        } else {
          // 有未提交的文件，则中断同仓库的后续命令，进行下一个仓库的切换分支操作
          const { git_name: name } = taskGits[gitIndex]
          sendFailLog(`${name}当前分支有未提交的文件，请先前往确认`)
          execGitAction(++gitIndex)
        }
      }
    },
    {
      commandFunc: ({ branch }) => `git checkout ${branch}`,
      successFunc: (gitIndex, commandIndex) => {
        // 切换成功说明本地存在分支，直接执行pull
        execFunc(gitIndex, commandIndex + 2)
      },
      failedFunc: (gitIndex, commandIndex) => {
        // 切换失败说明没有本地分支或者远程分支名填写错误，执行git checkout -b xxx手动创建
        sendFailLog('本地分支不存在，稍后将为您创建...')
        execFunc(gitIndex, ++commandIndex)
      }
    },
    {
      commandFunc: ({ branch }) => `git checkout -b ${branch} origin/${branch}`,
      successFunc: (gitIndex, commandIndex) => {
        sendSuccessLog('成功创建本地分支')
        execFunc(gitIndex, ++commandIndex)
      }
    },
    {
      commandFunc: () => 'git pull',
      successFunc: (gitIndex) => {
        sendSuccessLog('更新成功')
        execGitAction(++gitIndex)
      }
    }
  ]
  // 字典
  const gitCommandsMap = {
    created: createdCommands,
    switch: switchCommands
  }
  // 根据action类型选择对应的shell操作
  const gitCommands: Array<Icommand> = gitCommandsMap[action] || []

  const execFunc = (gitIndex: number, commandIndex: number) => {
    const { local_path: cwd, branch_name: branch, git_name: name } = taskGits[gitIndex]
    if (!cwd) {
      sendFailLog(`请先前往个人设置页面设置${name}的本地路径`)
      execGitAction(++gitIndex)
      return
    }
    const { commandFunc, successFunc, failedFunc } = gitCommands[commandIndex]
    const command = commandFunc({ branch })
    sendSuccessLog(`执行命令: ${command}`)
    exec(
      command,
      {
        cwd
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          if (failedFunc) {
            failedFunc(gitIndex, commandIndex, command)
          } else {
            sendFailLog(`${error}`)
            execGitAction(++gitIndex)
          }
          return
        }
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        successFunc && successFunc(gitIndex, commandIndex, stdout)
      }
    )
  }
  const execGitAction = (gitIndex: number) => {
    console.log('taskGits', gitIndex, taskGits.length)
    sendProcessLog(gitIndex, taskGits.length)
    if (gitIndex === taskGits.length) {
      return '结束'
    }
    const { git_name: name } = taskGits[gitIndex]
    gitIndex > 0 && sendSuccessLog('\n')
    sendSuccessLog(`仓库名: ${name}`)
    return execFunc(gitIndex, 0)
  }

  execGitAction(0)
}
