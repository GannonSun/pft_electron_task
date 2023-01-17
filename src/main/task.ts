import { dialog } from 'electron'
import { exec } from 'child_process'

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

export async function handleSwitchTask(gits) {
  // 仓库切换分支的结果
  let gitsRes = []

  const gitCommands = [
    {
      commandFunc: () => 'git status -s',
      successFunc: (gitIndex:number, commandIndex:number, output:string) => {
        if (!output) {
          console.log('ceshi')
          execFunc(gitIndex, ++commandIndex)
        } else {
          const { name } = gits[gitIndex]
          gitsRes[gitIndex] = {
            code: 201,
            msg: `${name}仓库有未提交的文件，请先前往确认`
          }
          checkoutBranch(++gitIndex)
        }
      },
      failedFunc: (gitIndex, command) => {
        gitsRes[gitIndex] = {
          code: 500,
          msg: `执行命令有误：${command}`
        }
        checkoutBranch(++gitIndex)
      }
    },
    {
      commandFunc: ({ branch }) => `git checkout ${branch}`,
      successFunc: (gitIndex, commandIndex, output) => {
        checkoutBranch(++gitIndex)
      }
    }
  ]

  const execFunc = (gitIndex, commandIndex) => {
    const { path: cwd, branch } = gits[gitIndex]
    const { commandFunc, successFunc } = gitCommands[commandIndex]
    exec(
      commandFunc({ branch: branch }),
      {
        cwd
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          checkoutBranch(++gitIndex)
          return
        }
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        successFunc && successFunc(gitIndex, commandIndex, stdout)
      }
    )
  }
  const checkoutBranch = (gitIndex) => {
    console.log('gits', gitIndex, gits.length)
    if (gitIndex === gits.length) {
      console.log('aaa', gitsRes)
      return '结束'
    }
    return execFunc(gitIndex, 0)
  }

  checkoutBranch(0)
}
