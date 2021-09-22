import EventEmitter from "events";
import WebSocket from "isomorphic-ws";

import { EventType, ForwardingPacket, Packet, PacketTypes, EventPacket, CordinatorPacket, MatchPacket, SongFinishedPacket, ConnectPacket, ConnectTypes } from "./packet";

export class TASocket extends EventEmitter {
    socket: WebSocket;
    coordinators: Map<string, string>;
    mainCoordinator?: string;
    mainMatch: MatchPacket | null = null;
    mainPassword: string;
    shouldLog: boolean;

    constructor();
    constructor(host: string);
    constructor(host: string, password: string)
    constructor(host: string, password: string, log: boolean)
    constructor(host?: string, password?: string, log?: boolean) {
        super();
        this.shouldLog = log ?? false;
        this.mainPassword = password ?? "thisisthepasswordthatisusedwithoutconfiguringapasswordformaincoordinator";
        this.coordinators = new Map();
        this.socket = new WebSocket(`ws://${host ?? "beatsaber.networkauditor.org"}:10157`);
        this.socket.on('open', this.socketOpened.bind(this));
        this.socket.on('close', this.socketClosed.bind(this));
        this.socket.on('message', this.socketMessage.bind(this));
        this.on('matchChanged', console.log);
        this.on('scoreUpdate', console.log);
    }

    setMainCoordinator(key: string | undefined) {
        this.mainCoordinator = key;
        this.emit("coordinatorChanged", this.mainCoordinator);
    }

    getCoordinatorKeyFromName(name: string) {
        return Array.from(this.coordinators.entries()).find(t => t[1] == name)?.[0];
    }

    socketOpened(event: WebSocket.OpenEvent) {
        console.log(`---------------------------------------------------------`);
        console.log(`WebSocket connection Opened.`);
        console.log(`---------------------------------------------------------`);
    }

    socketClosed(event: WebSocket.CloseEvent) {
        console.log(`---------------------------------------------------------`);
        console.log(`WebSocket connection closed.\nReason: ${event.reason}\nCode: ${event.code}`);
        console.log(`---------------------------------------------------------`);
    }

    socketMessage(data: WebSocket.Data) {
        let packet = JSON.parse(data as string) as Packet;
        if (packet.Type !== PacketTypes.Command) {
            console.log(`---------------------------------------------------------`);
            console.log("Packet type: " + packet.Type);
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
                console.warn("Not handled");
                break;
        }
        if (packet.Type !== PacketTypes.Command)
            console.log(packet.SpecificPacket);
        console.log(`---------------------------------------------------------`);
    }
}

export interface TASocket {
    on(event: "scoreUpdate", callback: (data: EventPacket) => void): this;
    on(event: "coordinatorChanged", callback: (data: string | undefined) => void): this;
    on(event: "matchChanged", callback: (data: MatchPacket | null) => void): this;
    on(event: string, callback: (data: any) => void): this;
}

new TASocket("ta.wildwolf.dev", "justatestpasswordfornow", true);