import EventEmitter from "events";
import { appendFileSync } from "fs";
import WebSocket from "isomorphic-ws";

import { EventType, ForwardingPacket, Packet, PacketTypes, EventPacket, CordinatorPacket, MatchPacket, SongFinishedPacket, ConnectPacket, ConnectTypes } from "./packet";

enum LogSeverity {
    Debug,
    Info,
    Warn,
    Error
}

export class TASocket extends EventEmitter {
    socket: WebSocket;
    coordinators: Map<string, string>;
    mainCoordinator?: string;
    mainMatch: MatchPacket | null = null;
    mainPassword: string;
    shouldLog: boolean;
    severity: LogSeverity;

    constructor();
    constructor(host: string);
    constructor(host: string, password: string)
    constructor(host: string, password: string, log: boolean)
    constructor(host: string, password: string, log: boolean, severity: LogSeverity)
    constructor(host?: string, password?: string, log?: boolean, severity?: LogSeverity) {
        super();
        this.severity = severity ?? LogSeverity.Info;
        this.shouldLog = log ?? false;
        this.mainPassword = password ?? "thisisthepasswordthatisusedwithoutconfiguringapasswordformaincoordinator";
        this.coordinators = new Map();
        this.socket = new WebSocket(`ws://${host ?? "beatsaber.networkauditor.org"}:10157`);
        this.socket.on('open', this.socketOpened.bind(this));
        this.socket.on('close', this.socketClosed.bind(this));
        this.socket.on('message', this.socketMessage.bind(this));
        this.on('matchChanged', console.log);
        this.on('scoreUpdate', console.log);
        this.on('log', console.log);
    }

    log(data: any, severity: LogSeverity) {
        if (this.shouldLog && severity >= this.severity)
            this.emit("log", `[${LogSeverity[severity]}](${new Date(Date.now()).toJSON()}): ${JSON.stringify(data)}`);
    }

    setMainCoordinator(key: string | undefined) {
        this.mainCoordinator = key;
        this.emit("coordinatorChanged", this.mainCoordinator);
    }

    getCoordinatorKeyFromName(name: string) {
        return Array.from(this.coordinators.entries()).find(t => t[1] == name)?.[0];
    }

    socketOpened(event: WebSocket.OpenEvent) {
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
        this.log(`WebSocket connection Opened.`, LogSeverity.Info);
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
    }

    socketClosed(event: WebSocket.CloseEvent) {
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
        this.log(`WebSocket connection closed.\nReason: ${event.reason}\nCode: ${event.code}`, LogSeverity.Info);
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
    }

    socketMessage(data: WebSocket.Data) {
        let packet = JSON.parse(data as string) as Packet;
        if (packet.Type !== PacketTypes.Command) {
            this.log(`---------------------------------------------------------`, LogSeverity.Debug);
            this.log("Packet type: " + packet.Type, LogSeverity.Debug);
        }
        switch (packet.Type) {
            case PacketTypes.Event:
                let eventPacket = packet.SpecificPacket as EventPacket;
                switch (eventPacket.Type) {
                    case EventType.CoordinatorAdded:
                        var coordinator = eventPacket.ChangedObject as CordinatorPacket;
                        this.coordinators.set(coordinator.Id, coordinator.Name)
                        break;
                    case EventType.CoordinatorLeft:
                        var coordinator = eventPacket.ChangedObject as CordinatorPacket;
                        this.coordinators.delete(coordinator.Id);
                        if (coordinator.Id == this.mainCoordinator)
                            this.setMainCoordinator(undefined);
                        break;
                    case EventType.MatchCreated:
                        var match = eventPacket.ChangedObject as MatchPacket;
                        if (match.Leader.Id == this.mainCoordinator)
                            this.mainMatch = match;
                        this.emit("matchChanged", this.mainMatch);
                        break;
                    case EventType.MatchUpdated:
                        var match = eventPacket.ChangedObject as MatchPacket;
                        if (match.Leader.Id == this.mainCoordinator)
                            this.mainMatch = match;
                        this.emit("matchChanged", this.mainMatch);
                        break;
                    case EventType.MatchDeleted:
                        var match = eventPacket.ChangedObject as MatchPacket;
                        if (match.Leader.Id == this.mainCoordinator)
                            this.mainMatch = null;
                        this.emit("matchChanged", this.mainMatch);
                        break;
                    default:
                        break;
                }
                break;
            case PacketTypes.ForwardingPacket:
                let forwardPacket = packet.SpecificPacket as ForwardingPacket;
                switch (forwardPacket.Type) {
                    case EventType.PlayerUpdated:
                        let scoreUpdateUserPacket = forwardPacket.SpecificPacket as EventPacket;
                        this.emit("scoreUpdate", scoreUpdateUserPacket);
                        break;

                    default:
                        break;
                }
                break;
            case PacketTypes.SongFinished:
                let songPacket = packet.SpecificPacket as SongFinishedPacket;
                break;
            case PacketTypes.Connect:
                let connectPacket = packet.SpecificPacket as ConnectPacket;
                switch (connectPacket.ClientType) {
                    case ConnectTypes.Coordinator:
                        if (connectPacket.Password == this.mainPassword && !this.mainCoordinator) {
                            let coordinator = this.getCoordinatorKeyFromName(connectPacket.Name);
                            while (!coordinator) {
                                coordinator = this.getCoordinatorKeyFromName(connectPacket.Name);
                            }
                            this.setMainCoordinator(coordinator);
                        }
                        break;
                    default:
                        break;
                }
                break;
            case PacketTypes.Command:
                //ignore command packets as they dont do anything for an overlay
                break;
            default:
                this.log("Not handled", LogSeverity.Warn);
                break;
        }
        if (packet.Type !== PacketTypes.Command) {
            this.log(packet.SpecificPacket, LogSeverity.Debug);
            this.log(`---------------------------------------------------------`, LogSeverity.Debug);
        }
    }
}

export interface TASocket {
    on(event: "scoreUpdate", callback: (data: EventPacket) => void): this;
    on(event: "coordinatorChanged", callback: (data: string | undefined) => void): this;
    on(event: "matchChanged", callback: (data: MatchPacket | null) => void): this;
    on(event: "log", callback: (data: any) => void): this;
    on(event: string, callback: (data: any) => void): this;
}

var taSocket = new TASocket("ta.wildwolf.dev", "justatestpasswordfornow", true, LogSeverity.Debug);
taSocket.on('log', (data) => appendFileSync('./socket.log', data + "\n"));