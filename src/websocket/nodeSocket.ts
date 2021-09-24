import { TASocket, LogSeverity } from "./socket";
import { appendFileSync } from "fs";
var taSocket = new TASocket("ta.wildwolf.dev", "justatestpasswordfornow", true, LogSeverity.Info);
taSocket.on('log', (data) => appendFileSync('./socket.log', data + "\n"));