import { FS, type FsItem } from './filesystem'

const DEFAULT_PATH = '/Users/mac-sim-os'

export interface TermLine {
  id: number
  input?: string
  output: string[]
  isError?: boolean
}

function resolvePath(cwd: string, input: string): string {
  let path = input.trim()
  if (!path) return cwd
  if (path.startsWith('~')) path = DEFAULT_PATH + path.slice(1)
  if (!path.startsWith('/')) path = cwd + '/' + path
  const parts = path.split('/').filter(Boolean)
  const resolved: string[] = []
  for (const p of parts) {
    if (p === '.') continue
    if (p === '..') { resolved.pop(); continue }
    resolved.push(p)
  }
  return '/' + resolved.join('/') || '/'
}

async function getNodeByPath(path: string): Promise<FsItem | undefined> {
  if (path === '/') return FS.get('__root__')
  const parts = path.split('/').filter(Boolean)
  let currentId = '__root__'
  for (const part of parts) {
    const children = await FS.getChildren(currentId)
    const found = children.find(c => c.name === part)
    if (!found) return undefined
    currentId = found.id
  }
  return FS.get(currentId)
}

function ensureRootSync(): void {
  // Try to trigger init if it hasn't completed yet by calling init again
  // This is a no-op if already initialized
  FS.init().catch(() => {})
}

export class TerminalFS {
  static async ls(path?: string): Promise<string[]> {
    const target = path ? resolvePath(DEFAULT_PATH, path) : DEFAULT_PATH
    const node = await getNodeByPath(target)
    if (!node) return [`ls: ${target}: No such file or directory`]
    if (node.kind !== 'folder') return [`ls: ${target}: Not a directory`]
    const children = await FS.getChildren(node.id)
    if (children.length === 0) return []
    return children.map(c => {
      const icon = c.kind === 'folder' ? '/' : ''
      const perm = c.kind === 'folder' ? 'drwxr-xr-x' : '-rw-r--r--'
      const size = c.kind === 'folder' ? '4096' : FS.formatSize(c.size)
      return `${perm}  ${size.padStart(8)}  ${FS.formatDate(c.modifiedAt)}  ${icon}${c.name}`
    })
  }

  static async cd(path: string): Promise<string> {
    const target = resolvePath(DEFAULT_PATH, path)
    const node = await getNodeByPath(target)
    if (!node) return `cd: no such directory: ${target}`
    if (node.kind !== 'folder') return `cd: not a directory: ${target}`
    return target
  }

  static async pwd(cwd: string): Promise<string> {
    return cwd
  }

  static async cat(path: string): Promise<string[]> {
    const target = resolvePath(DEFAULT_PATH, path)
    const node = await getNodeByPath(target)
    if (!node) return [`cat: ${target}: No such file or directory`]
    if (node.kind === 'folder') return [`cat: ${target}: Is a directory`]
    const content = await FS.readFile(node.id)
    if (content === null) return [`cat: ${target}: No such file or directory`]
    return [content || '(empty file)']
  }

  static async mkdir(name: string): Promise<string[]> {
    if (!name) return ['mkdir: missing operand']
    // Extract only the final component (basename)
    const lastSlash = name.lastIndexOf('/')
    const finalName = lastSlash >= 0 ? name.slice(lastSlash + 1) : name
    const parentRelative = lastSlash >= 0 ? name.slice(0, lastSlash) : ''
    const parentNode = parentRelative
      ? await getNodeByPath(resolvePath(DEFAULT_PATH, parentRelative))
      : await getNodeByPath(DEFAULT_PATH)
    if (!parentNode) return [`mkdir: ${parentRelative || DEFAULT_PATH}: No such file or directory`]
    if (parentNode.kind !== 'folder') return [`mkdir: ${parentRelative || DEFAULT_PATH}: Not a directory`]
    const existing = await FS.getChildren(parentNode.id)
    if (existing.find(c => c.name === finalName)) return [`mkdir: ${finalName}: File exists`]
    await FS.addFolder(parentNode.id, finalName)
    return []
  }

  static async touch(name: string): Promise<string[]> {
    if (!name) return ['touch: missing operand']
    const lastSlash = name.lastIndexOf('/')
    const finalName = lastSlash >= 0 ? name.slice(lastSlash + 1) : name
    const parentRelative = lastSlash >= 0 ? name.slice(0, lastSlash) : ''
    const parentNode = parentRelative
      ? await getNodeByPath(resolvePath(DEFAULT_PATH, parentRelative))
      : await getNodeByPath(DEFAULT_PATH)
    if (!parentNode) return [`touch: ${parentRelative || DEFAULT_PATH}: No such file or directory`]
    if (parentNode.kind !== 'folder') return [`touch: ${parentRelative || DEFAULT_PATH}: Not a directory`]
    const existing = await FS.getChildren(parentNode.id)
    const found = existing.find(c => c.name === finalName)
    if (found && found.kind === 'folder') return [`touch: ${finalName}: Is a directory`]
    if (!found) await FS.addFileToFolder(parentNode.id, finalName, '')
    else await FS.update(found.id, { modifiedAt: Date.now() })
    return []
  }

  static async rm(name: string, recursive = false): Promise<string[]> {
    if (!name) return ['rm: missing operand']
    const target = resolvePath(DEFAULT_PATH, name)
    const node = await getNodeByPath(target)
    if (!node) return [`rm: ${target}: No such file or directory`]
    if (node.kind === 'folder' && !recursive) return [`rm: ${target}: Is a directory (use -r)`]
    await FS.remove(node.id)
    return []
  }

  static async cp(src: string, dst?: string): Promise<string[]> {
    if (!src || !dst) return ['cp: missing operand']
    const srcNode = await getNodeByPath(resolvePath(DEFAULT_PATH, src))
    if (!srcNode) return [`cp: ${src}: No such file or directory`]
    const dstParts = dst.split('/')
    const dstName = dstParts[dstParts.length - 1]
    const dstParentPath = dstParts.slice(0, -1).join('/') || '/'
    const dstParent = await getNodeByPath(dstParentPath)
    if (!dstParent) return [`cp: ${dstParentPath}: No such file or directory`]
    if (dstParent.kind !== 'folder') return [`cp: ${dstParentPath}: Not a directory`]
    const finalName = dstName || srcNode.name
    if (srcNode.kind === 'folder') {
      const newFolder = await FS.addFolder(dstParent.id, finalName)
      const srcChildren = await FS.getChildren(srcNode.id)
      for (const child of srcChildren) await this._copyItem(child.id, newFolder.id)
      return []
    }
    const content = await FS.readFile(srcNode.id)
    await FS.create({ name: finalName, kind: 'file', parentId: dstParent.id, size: content?.length || 0, modifiedAt: Date.now(), content: content ? new TextEncoder().encode(content) : undefined })
    return []
  }

  static async _copyItem(id: string, newParentId: string): Promise<void> {
    const item = await FS.get(id)
    if (!item) return
    if (item.kind === 'folder') {
      const folder = await FS.addFolder(newParentId, item.name)
      const children = await FS.getChildren(item.id)
      for (const child of children) await this._copyItem(child.id, folder.id)
    } else {
      await FS.create({ name: item.name, kind: 'file', parentId: newParentId, size: item.size, modifiedAt: Date.now(), content: item.content })
    }
  }

  static async mv(src: string, dst: string): Promise<string[]> {
    if (!src || !dst) return ['mv: missing operand']
    const srcNode = await getNodeByPath(resolvePath(DEFAULT_PATH, src))
    if (!srcNode) return [`mv: ${src}: No such file or directory`]
    const dstParts = dst.split('/')
    const dstName = dstParts[dstParts.length - 1]
    const dstParentPath = dstParts.slice(0, -1).join('/') || '/'
    const dstParent = await getNodeByPath(dstParentPath)
    if (!dstParent) return [`mv: ${dstParentPath}: No such file or directory`]
    if (dstParent.kind !== 'folder') return [`mv: ${dstParentPath}: Not a directory`]
    const finalName = dstName || srcNode.name
    await FS.update(srcNode.id, { parentId: dstParent.id, name: finalName, modifiedAt: Date.now() })
    return []
  }

  static async echo(text: string, redirect?: string): Promise<string[]> {
    if (redirect) {
      const target = resolvePath(DEFAULT_PATH, redirect)
      const targetNode = await getNodeByPath(target)
      if (targetNode && targetNode.kind === 'folder') return [`echo: ${target}: Is a directory`]
      const parts = target.split('/')
      const fileName = parts[parts.length - 1]
      const parentPath = parts.slice(0, -1).join('/') || '/'
      const parentNode = await getNodeByPath(parentPath)
      if (!parentNode) return [`echo: ${parentPath}: No such file or directory`]
      if (parentNode.kind !== 'folder') return [`echo: ${parentPath}: Not a directory`]
      const existing = await FS.getChildren(parentNode.id)
      const found = existing.find(c => c.name === fileName)
      if (found) await FS.writeFile(found.id, text + '\n')
      else await FS.addFileToFolder(parentNode.id, fileName, text + '\n')
      return []
    }
    return [text]
  }

  static async head(path: string, n = 10): Promise<string[]> {
    const target = resolvePath(DEFAULT_PATH, path)
    const node = await getNodeByPath(target)
    if (!node) return [`head: ${target}: No such file or directory`]
    if (node.kind === 'folder') return [`head: ${target}: Is a directory`]
    const content = await FS.readFile(node.id)
    if (content === null) return []
    return content.split('\n').slice(0, n)
  }

  static async tail(path: string, n = 10): Promise<string[]> {
    const target = resolvePath(DEFAULT_PATH, path)
    const node = await getNodeByPath(target)
    if (!node) return [`tail: ${target}: No such file or directory`]
    if (node.kind === 'folder') return [`tail: ${target}: Is a directory`]
    const content = await FS.readFile(node.id)
    if (content === null) return []
    const lines = content.split('\n')
    return lines.slice(Math.max(0, lines.length - n))
  }

  static async find(path: string, nameFilter?: string): Promise<string[]> {
    const target = resolvePath(DEFAULT_PATH, path)
    const results: string[] = []
    await this._findRecursive(target, nameFilter, results)
    return results
  }

  static async _findRecursive(cwd: string, filter: string | undefined, results: string[]): Promise<void> {
    const node = await getNodeByPath(cwd)
    if (!node || node.kind !== 'folder') return
    const children = await FS.getChildren(node.id)
    for (const child of children) {
      const childPath = cwd === '/' ? '/' + child.name : cwd + '/' + child.name
      if (!filter || child.name.toLowerCase().includes(filter.toLowerCase())) {
        results.push(childPath)
      }
      if (child.kind === 'folder') {
        await this._findRecursive(childPath, filter, results)
      }
    }
  }

  static async grep(pattern: string, path: string): Promise<string[]> {
    const target = resolvePath(DEFAULT_PATH, path)
    const node = await getNodeByPath(target)
    if (!node) return [`grep: ${target}: No such file or directory`]
    if (node.kind === 'folder') return [`grep: ${target}: Is a directory`]
    const content = await FS.readFile(node.id)
    if (content === null) return []
    const regex = new RegExp(pattern, 'i')
    return content.split('\n').filter(line => regex.test(line))
  }

  static async tree(path?: string): Promise<string[]> {
    const target = path ? resolvePath(DEFAULT_PATH, path) : DEFAULT_PATH
    const node = await getNodeByPath(target)
    if (!node) return [`tree: ${target}: No such file or directory`]
    if (node.kind !== 'folder') return [node.name]
    const lines: string[] = []
    await this._treeBuild(node.id, '', lines, 0)
    return lines
  }

  static async _treeBuild(folderId: string, prefix: string, lines: string[], _depth: number): Promise<void> {
    const children = await FS.getChildren(folderId)
    const sorted = children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    for (let i = 0; i < sorted.length; i++) {
      const child = sorted[i]
      const isLast = i === sorted.length - 1
      const connector = isLast ? '└── ' : '├── '
      lines.push(prefix + connector + (child.kind === 'folder' ? '📁 ' : '📄 ') + child.name)
      if (child.kind === 'folder') {
        const newPrefix = prefix + (isLast ? '    ' : '│   ')
        await this._treeBuild(child.id, newPrefix, lines, _depth + 1)
      }
    }
  }

  static async uname(): Promise<string[]> {
    return ['mac-sim-os 1.0.0 WebContainer x86_64 JavaScript/TypeScript']
  }

  static async which(cmd: string): Promise<string[]> {
    const known = ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo', 'clear', 'date', 'whoami', 'help', 'head', 'tail', 'find', 'grep', 'tree', 'uname', 'which', 'exit', 'neofetch']
    return known.includes(cmd) ? [`/usr/bin/${cmd}`] : [`which: no ${cmd} in ($PATH)`]
  }

  static async neofetch(): Promise<string[]> {
    return [
      '        ████████        mac-sim-os',
      '      ██          ██      OS: mac-sim-os 1.0.0 (browser)',
      '    ██    ████    ██      Host: WebContainer',
      '   ██   ██░░░░██   ██      Kernel: React 18 / TypeScript 5',
      '  ██   ██░░░░░░██   ██     Uptime: just now',
      '  ██   ██░░░░░░██   ██     Shell: bash 5.1',
      '   ██   ██░░░░██   ██      Resolution: ' + window.innerWidth + 'x' + window.innerHeight,
      '    ██    ████    ██      Theme: macOS Dark',
      '      ██          ██      Terminal: mac-sim-os Terminal',
      '        ████████        CPU: Browser V8 Engine',
      '                         Memory: ∞ GB',
      '',
    ]
  }

  static async exit(): Promise<string[]> {
    return []
  }
}

export function parseCommand(input: string): { cmd: string; args: string[]; redirect?: string } {
  const trimmed = input.trim()
  if (!trimmed) return { cmd: '', args: [], redirect: undefined }
  const redirectMatch = trimmed.match(/(.+?)\s*>\s*(\S+)/)
  if (redirectMatch) {
    const cmdPart = redirectMatch[1].trim()
    const parts = cmdPart.split(/\s+/)
    return { cmd: parts[0], args: parts.slice(1), redirect: redirectMatch[2] }
  }
  const parts = trimmed.split(/\s+/)
  return { cmd: parts[0], args: parts.slice(1), redirect: undefined }
}

export async function executeCommand(input: string, cwd: string): Promise<{ output: string[]; newCwd?: string; special?: 'clear' | 'exit' }> {
  const { cmd, args, redirect } = parseCommand(input)
  if (!cmd) return { output: [] }

  switch (cmd) {
    case 'clear':
      return { output: [], special: 'clear' }
    case 'exit':
      return { output: [], special: 'exit' }
    case 'cd': {
      const target = await TerminalFS.cd(args[0] || '~')
      if (target.startsWith('cd:')) return { output: [target] }
      return { output: [], newCwd: target }
    }
    case 'pwd':
      return { output: [cwd] }
    case 'ls':
      return { output: await TerminalFS.ls(args[0]) }
    case 'cat':
      return { output: await TerminalFS.cat(args[0]) }
    case 'mkdir':
      return { output: await TerminalFS.mkdir(args[0] ?? '') }
    case 'touch':
      return { output: await TerminalFS.touch(args[0] ?? '') }
    case 'rm':
      return { output: await TerminalFS.rm(args.join(' '), args.includes('-r') || args.includes('-rf')) }
    case 'cp':
      return { output: await TerminalFS.cp(args[0], args[1]) }
    case 'mv':
      return { output: await TerminalFS.mv(args[0], args[1]) }
    case 'echo': {
      const text = args.join(' ')
      return { output: await TerminalFS.echo(text, redirect) }
    }
    case 'head': {
      const n = parseInt(args[0]) || 10
      return { output: await TerminalFS.head(args[args.length > 1 ? 1 : 0] || '', n) }
    }
    case 'tail': {
      const n = parseInt(args[0]) || 10
      return { output: await TerminalFS.tail(args[args.length > 1 ? 1 : 0] || '', n) }
    }
    case 'find': {
      const path = args[0] || '.'
      const name = args.find(a => a.startsWith('-name')) ? args[args.indexOf('-name') + 1] : undefined
      return { output: await TerminalFS.find(path, name) }
    }
    case 'grep':
      return { output: await TerminalFS.grep(args[0], args[1]) }
    case 'tree':
      return { output: await TerminalFS.tree(args[0]) }
    case 'uname':
      return { output: await TerminalFS.uname() }
    case 'which':
      return { output: await TerminalFS.which(args[0]) }
    case 'neofetch':
      return { output: await TerminalFS.neofetch() }
    case 'date':
      return { output: [new Date().toString()] }
    case 'whoami':
      return { output: ['mac-sim-os'] }
    case 'help':
      return { output: [
        'mac-sim-os 终端 v1.0',
        '',
        '文件系统命令：',
        '  ls [路径]       列出目录内容',
        '  cd <路径>       切换目录',
        '  pwd             显示当前目录',
        '  cat <文件>      显示文件内容',
        '  mkdir <名称>    创建目录',
        '  touch <名称>    创建空文件',
        '  rm [-r] <名称>  删除文件/目录',
        '  cp <源> <目标>  复制文件/目录',
        '  mv <源> <目标>  移动/重命名文件',
        '  echo <文本>     打印文本（用 > 重定向）',
        '  head <文件> [n] 显示前 n 行',
        '  tail <文件> [n] 显示后 n 行',
        '  find <路径> [-name X]  查找文件',
        '  grep <模式> <文件>     搜索文件内容',
        '  tree [路径]           目录树视图',
        '',
        '其他命令：',
        '  clear           清屏',
        '  date            显示日期时间',
        '  whoami          显示当前用户',
        '  help            显示帮助',
        '  neofetch        系统信息',
        '  uname           系统信息',
        '  which <命令>    显示命令路径',
        '  exit            关闭终端',
      ]}
    default:
      return { output: [`bash: ${cmd}: 命令未找到`] }
  }
}
