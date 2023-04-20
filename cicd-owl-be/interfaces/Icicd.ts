import { ICore } from "./Icore";

export interface Icicd extends ICore {
  itemName: string,
  status: string,
  cicdStages: IcicdStages[],
  cicdStagesOutput: IcicdStagesOutput[]
}

export interface IcicdStages {
  stageName: string;
  remoteHost: string;
  command: string;
}
export interface IcicdStagesOutput {
  buildNumber: number;
  startTime: string;
  endTime: string;
  status: string;
  cicdStageOutput: IcicdStageOutput[];
}

export interface IcicdStageOutput {
  stageName: string;
  startTime: string;
  endTime: string;
  status: string;
  code: number;
  logs:[];
}