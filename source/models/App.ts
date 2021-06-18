import { ObservableObject, reaction, Ref, transaction, unobservable } from 'reactronic'
import { Page } from './Page'
import { Task } from './Task'

export class App extends ObservableObject {
  @unobservable readonly version: string
  @unobservable readonly homePage: Page
  @unobservable completedTasks: number
  taskList: Task[] = []
  activePage: Page

  constructor(version: string) {
    super()
    this.completedTasks = 0
    this.version = version
    this.homePage = new Page('/home', '<img src="assets/home.svg"/>', 'Todo')
    this.activePage = this.homePage
    this.activePage.isActive = true
    const saveTasks = JSON.parse(localStorage.getItem('tasks') as string) as Task[]
    if (saveTasks != null) {
      saveTasks.forEach(element => {
        const task = new Task(element.text)
        task.notCompleted = element.notCompleted
        this.taskList.push(task)
      })
    }
  }

  convertLineBreaks(inputString: string): string {
    while (inputString.includes('\n'))
      inputString = inputString.replace('\n', '<br />')
    return inputString
  }

  @transaction
  updatePriority(task: Task, isPriorityIncrease: boolean): void {
    this.taskList = this.taskList.toMutable()
    if (isPriorityIncrease) {
      do {
        if (this.taskList.indexOf(task) == 0)
          break
        const taskPosition: number = this.taskList.indexOf(task)
        this.taskList[taskPosition] = this.taskList[taskPosition - 1]
        this.taskList[taskPosition - 1] = task
      } while (!this.taskList[this.taskList.indexOf(task) + 1].notCompleted)
    }
    else {
      do {
        if (this.taskList.indexOf(task) == this.taskList.length - 1)
          break
        const taskPosition: number = this.taskList.indexOf(task)
        this.taskList[taskPosition] = this.taskList[taskPosition + 1]
        this.taskList[taskPosition + 1] = task
      } while (!this.taskList[this.taskList.indexOf(task) - 1].notCompleted)
    }
  }

  @transaction
  addTask(text: string): void {
    this.taskList = this.taskList.toMutable()
    this.taskList.push(new Task(this.convertLineBreaks(text)))
  }

  @transaction
  deleteTask(task: Task): void {
    this.taskList = this.taskList.toMutable()
    this.taskList.splice(this.taskList.indexOf(task), 1)
  }

  @transaction
  editTask(task: Task, newText?: string): void {
    if (task.isEdit) {
      if (newText != null) {
        task.text = this.convertLineBreaks(newText)
      }
      task.isEdit = false
    }
    else {
      task.isEdit = true
    }
  }

  @reaction
  updateTasks(): void {
    this.completedTasks = this.taskList.filter(x => !x.notCompleted).length
    localStorage.setItem('tasks', JSON.stringify(this.taskList))
  }

}
