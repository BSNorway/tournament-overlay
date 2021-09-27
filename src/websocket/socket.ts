import EventEmitter from "events";
import WebSocket from "isomorphic-ws";

import { EventType, ForwardingPacket, Packet, PacketTypes, EventPacket, CordinatorPacket, MatchPacket, SongFinishedPacket, ConnectPacket, ConnectTypes, Player, PointEvent } from "./packet";

export enum LogSeverity {
    Debug,
    Info,
    Warn,
    Error
}

export class TASocket extends EventEmitter {
    socket: WebSocket;
    coordinators: Map<string, string>;
    players: Map<string, Player>;
    mainCoordinator?: string;/*= "e833f2cd-c124-499a-8140-b9d359e78980"; //*/
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
        this.socketOpened = this.socketOpened.bind(this);
        this.socketClosed = this.socketClosed.bind(this);
        this.socketMessageEvent = this.socketMessageEvent.bind(this);
        this.socketMessageData = this.socketMessageData.bind(this);
        this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
        this.log = this.log.bind(this);
        this.severity = severity ?? LogSeverity.Info;
        this.shouldLog = log ?? false;
        this.mainPassword = password ?? "thisisthepasswordthatisusedwithoutconfiguringapasswordformaincoordinator";
        this.coordinators = new Map();
        this.players = new Map();
        this.socket = new WebSocket(`ws://ta.wildwolf.dev:8080?host=${host ?? "beatsaber.networkauditor.org"}&port=10157`);
        if (typeof window === "undefined") {
            this.socket.on('open', this.socketOpened);
            this.socket.on('close', this.socketClosed);
            this.socket.on('message', this.socketMessageData);
        }
        else {
            this.socket.addEventListener("message", this.socketMessageEvent);
            this.socket.onclose = this.socketClosed;
            this.socket.onopen = this.socketOpened;
        }
        this.on("coordinatorChanged", this.log);
        this.on('scoreUpdate', this.handleScoreUpdate);
        this.on('log', console.log);
    }

    sendHeartbeats() {
        if (this.socket.readyState !== WebSocket.CLOSED) {
            var packet: Packet = { Id: "00000000-0000-0000-0000-000000000000", From: "00000000-0000-0000-0000-000000000000", Size: 0, SpecificPacketSize: 0, Type: PacketTypes.Command, SpecificPacket: { CommandType: 0 } };
            this.socket.send(JSON.stringify(packet));
            setTimeout(() => {
                this.sendHeartbeats();
            }, 20000);
        }
    }

    handleScoreUpdate(forwardTo: string[], eventPacket: Player) {
        if (forwardTo.includes(this.mainCoordinator ?? "")) {
            if (!!this.mainMatch) {
                var match = this.mainMatch;
                match.Players = match.Players.map(t => t !== undefined ? t.Id === eventPacket.Id ? eventPacket : t : undefined) as Player[];
                this.mainMatch = match;
                this.emit("matchChanged", this.mainMatch);
            }
        }
    }

    log(data: any, severity?: LogSeverity) {
        if (typeof severity === "undefined") severity = LogSeverity.Info;
        if (this.shouldLog && severity >= this.severity)
            this.emit("log", `[${LogSeverity[severity]}](${new Date(Date.now()).toJSON()}): ${JSON.stringify(data)}`);
    }

    setMainCoordinator(key: string | undefined) {
        this.mainCoordinator = key;
        this.emit("coordinatorChanged", this.mainCoordinator);
    }

    getCoordinatorKeyFromName(name: string) {
        return Array.from(this.coordinators.entries()).find(t => t[1] === name)?.[0];
    }

    socketOpened(event: WebSocket.OpenEvent) {
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
        this.log(`WebSocket connection Opened.`, LogSeverity.Info);
        this.log(`pasword: ${this.mainPassword}`, LogSeverity.Info);
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
    }

    socketClosed(event: WebSocket.CloseEvent) {
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
        this.log(`WebSocket connection closed.\nReason: ${event.reason}\nCode: ${event.code}`, LogSeverity.Info);
        this.log(`---------------------------------------------------------`, LogSeverity.Info);
    }

    socketMessageEvent(data: WebSocket.MessageEvent) {
        this.socketMessageData(data.data);
    }

    socketMessageData(data: WebSocket.Data) {
        let packet = JSON.parse(data as string) as Packet;
        if (packet.Type !== PacketTypes.Command) {
            this.log(`---------------------------------------------------------`, LogSeverity.Debug);
            this.log("Packet type: " + packet.Type, LogSeverity.Debug);
        }
        this.packetProcess(packet);
        if (packet.Type !== PacketTypes.Command) {
            this.log(packet.SpecificPacket, LogSeverity.Debug);
            this.log(`---------------------------------------------------------`, LogSeverity.Debug);
        }
    }

    packetProcess(packet: Packet) {
        switch (packet.Type) {
            case PacketTypes.Event:
                let eventPacket = packet.SpecificPacket as EventPacket;
                var player: Player | null = null;
                var coordinator: CordinatorPacket | null = null;
                var match: MatchPacket | null = null;
                switch (eventPacket.Type) {
                    case EventType.PlayerAdded:
                    case EventType.PlayerUpdated:
                        player = eventPacket.ChangedObject as Player;
                        this.players.set(player.Id, player);
                        break;
                    case EventType.PlayerLeft:
                        player = eventPacket.ChangedObject as Player;
                        this.players.delete(player.Id);
                        break;
                    case EventType.CoordinatorAdded:
                        coordinator = eventPacket.ChangedObject as CordinatorPacket;
                        this.coordinators.set(coordinator.Id, coordinator.Name)
                        break;
                    case EventType.CoordinatorLeft:
                        coordinator = eventPacket.ChangedObject as CordinatorPacket;
                        this.coordinators.delete(coordinator.Id);
                        if (coordinator.Id === this.mainCoordinator)
                            this.setMainCoordinator(undefined);
                        break;
                    case EventType.MatchCreated:
                        match = eventPacket.ChangedObject as MatchPacket;
                        if (match.Leader.Id === this.mainCoordinator)
                            this.mainMatch = match;
                        this.emit("matchChanged", this.mainMatch);
                        break;
                    case EventType.MatchUpdated:
                        match = eventPacket.ChangedObject as MatchPacket;
                        if (match.Leader.Id === this.mainCoordinator)
                            this.mainMatch = match;
                        this.emit("matchChanged", this.mainMatch);
                        break;
                    case EventType.MatchDeleted:
                        match = eventPacket.ChangedObject as MatchPacket;
                        if (match.Leader.Id === this.mainCoordinator)
                            this.mainMatch = null;
                        this.emit("matchChanged", this.mainMatch);
                        break;
                    case EventType.PointChanged:
                        var points = eventPacket.ChangedObject as PointEvent;
                        this.emit("pointsChanged", points);
                        break;
                    default:
                        break;
                }
                break;
            case PacketTypes.ForwardingPacket:
                let forwardPacket = packet.SpecificPacket as ForwardingPacket;
                switch (forwardPacket.Type) {
                    case PacketTypes.Event:
                        let eventPacket = forwardPacket.SpecificPacket as EventPacket;
                        if (eventPacket.Type === EventType.PlayerUpdated)
                            this.emit("scoreUpdate", forwardPacket.ForwardTo, eventPacket.ChangedObject as Player);
                        break;

                    default:
                        break;
                }
                break;
            case PacketTypes.SongFinished:
                let songPacket = packet.SpecificPacket as SongFinishedPacket;
                this.players.set(songPacket.User.Id, songPacket.User);
                break;
            case PacketTypes.Connect:
                let connectPacket = packet.SpecificPacket as ConnectPacket;
                switch (connectPacket.ClientType) {
                    case ConnectTypes.Coordinator:
                        if (connectPacket.Password === this.mainPassword && !this.mainCoordinator) {
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
    }
}

export interface TASocket {
    on(event: "scoreUpdate", callback: (forwardTo: string[], eventPacket: Player) => void): this;
    on(event: "coordinatorChanged", callback: (data: string | undefined) => void): this;
    on(event: "matchChanged", callback: (data: MatchPacket | null) => void): this;
    on(event: "pointsChanged", callback: (data: PointEvent) => void): this;
    on(event: "log", callback: (data: string) => void): this;
    on(event: string, callback: (data: any) => void): this;
    emit(event: "scoreUpdate", forwardTo: string[], eventPacket: Player): boolean;
    emit(event: "coordinatorChanged", data: string | undefined): boolean;
    emit(event: "matchChanged", data: MatchPacket | null): boolean;
    emit(event: "pointsChanged", data: PointEvent): boolean;
    emit(event: "log", data: string): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
}