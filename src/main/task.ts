import { BrowserWindow, dialog, IpcMainInvokeEvent, shell } from 'electron'
import { exec } from 'child_process'

interface IswitchActionRes {
  code: number
  msg: string
}
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

export async function handleOpenLink(_e: IpcMainInvokeEvent, url: string) {
  shell.openExternal(url)
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

export async function handleSwitchTask(_e: IpcMainInvokeEvent, taskGits) {
  const currentWindow = BrowserWindow.getFocusedWindow()
  // 仓库切换分支的结果
  let switchActionRes: Array<IswitchActionRes> = []

  const sendSuccessLog = (log) => {
    currentWindow?.webContents.send('update-switch-log', {
      code: 200,
      msg: log
    })
  }
  const sendFailLog = (log) => {
    currentWindow?.webContents.send('update-switch-log', {
      code: 500,
      msg: log
    })
  }
  const sendProcessLog = (current, total) => {
    currentWindow?.webContents.send('update-switch-log', {
      code: 0,
      current,
      total
    })
  }
  const gitCommands: Array<Icommand> = [
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
          checkoutBranch(++gitIndex)
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
        checkoutBranch(++gitIndex)
      }
    }
  ]

  const execFunc = (gitIndex, commandIndex) => {
    const { local_path: cwd, branch_name: branch, git_name: name } = taskGits[gitIndex]
    if (!cwd) {
      sendFailLog(`请先前往个人设置设置${name}的本地路径`)
      checkoutBranch(++gitIndex)
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
            checkoutBranch(++gitIndex)
          }
          return
        }
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        successFunc && successFunc(gitIndex, commandIndex, stdout)
      }
    )
  }
  const checkoutBranch = (gitIndex) => {
    console.log('taskGits', gitIndex, taskGits.length)
    sendProcessLog(gitIndex, taskGits.length)
    if (gitIndex === taskGits.length) {
      console.log('aaa', switchActionRes)
      return '结束'
    }
    const { git_name: name } = taskGits[gitIndex]
    gitIndex > 0 && sendSuccessLog('\n')
    sendSuccessLog(`仓库名: ${name}`)
    return execFunc(gitIndex, 0)
  }

  checkoutBranch(0)
}
