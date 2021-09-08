export interface Packet {
    Size: number;
    SpecificPacketSize: number;
    Id: string;
    From: string;
    Type: PacketTypes;
    SpecificPacket: object;
}

export enum PacketTypes {
    Acknowledgement = 0,
    Command = 1,
    Connect = 2,
    ConnectResponse = 3,
    Event = 4, // score updates sent in here with type 1
    File = 5,
    ForwardingPacket = 6, // score updates sent in here with packet type 4
    LoadedSong = 7,
    LoadSong = 8,
    PlaySong = 9,
    Response = 10,
    ScoreRequest = 11,
    ScoreRequestResponse = 12,
    SongFinished = 13, // final score
    SongList = 14,
    SubmitScore = 15
}

export enum EventType {
    PlayerAdded,
    PlayerUpdated,
    PlayerLeft,
    CoordinatorAdded,
    CoordinatorLeft,
    MatchCreated,
    MatchUpdated,
    MatchDeleted,
    QualifierEventCreated,
    QualifierEventUpdated,
    QualifierEventDeleted,
    HostAdded,
    HostRemoved
}

export interface Team {
    Id: string;
    Name: string;
}

export interface StreamScreenCoordinates {
    x: number;
    y: number;
}

export interface User {
    UserId: string;
    Team: Team;
    PlayState: number;
    DownloadState: number;
    Score: number;
    Combo: number;
    Accuracy: number;
    SongPosition: number;
    SongList?: any;
    ModList: string[];
    StreamScreenCoordinates: StreamScreenCoordinates;
    StreamDelayMs: number;
    StreamSyncStartMs: number;
    Id: string;
    Name: string;
}

export interface Characteristic {
    SerializedName: string;
    Difficulties: number[];
}

export interface Beatmap {
    Name?: any;
    LevelId: string;
    Characteristic: Characteristic;
    Difficulty: number;
}

export interface SongFinishedPacket {
    User: User;
    Beatmap: Beatmap;
    Type: number;
    Score: number;
}

export interface ScoreUpdateEventPacket {
    Type: EventType.PlayerUpdated;
    ChangedObject: User;
}

export interface ForwardingPacket {
    ForwardTo: string[];
    Type: number;
    SpecificPacket: object;
}