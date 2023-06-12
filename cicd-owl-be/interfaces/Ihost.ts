import { ICore } from "./Icore";

export interface Ihost extends ICore {
  hostName: string;
  hostAdd: string;
  hostPort: number;
  hostUser: string;
  hostPass: string;
  hostPath: string;
  executors: number;
  buildItems: IcicdStages[];
  currentBuilds: IcurrentBuild[];
}

export interface IcicdStages {
  cicdId: string;
  stageName: string;
  remoteHost: string;
  command: string;
}

export interface IcurrentBuild {
  cicdId: string;
  stageName: string;
  remoteHost: string;
  command: string;
  cicdName: string;
}