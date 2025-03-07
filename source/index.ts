import { Transaction } from 'reactronic'
import { configureDebugging } from './debugging'
import { Globals } from './models/Globals'
import { App } from './models/App'
import { AppWindow } from './views/AppWindow.view'
import { renderChildrenNow } from 'reactronic-front'

const version: string = '$BUILD_TIMESTAMP'

configureDebugging()

document.body.onresize = () => Globals.Resizing.pulse(-1)

const app = Transaction.run(() => new App(version))

const appWindow = AppWindow(app)
renderChildrenNow()
app.sensors.listen(appWindow.native)
